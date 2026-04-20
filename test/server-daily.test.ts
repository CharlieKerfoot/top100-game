import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { EventEmitter } from 'events';
import { handleDailyRequest, __resetForTesting } from '../server/daily.ts';

function mockReq(method: string, url: string, body?: unknown) {
  const req = new EventEmitter() as EventEmitter & { method: string; url: string };
  req.method = method;
  req.url = url;
  queueMicrotask(() => {
    if (body !== undefined) {
      req.emit('data', Buffer.from(JSON.stringify(body)));
    }
    req.emit('end');
  });
  return req as unknown as import('http').IncomingMessage;
}

function mockRes() {
  let status = 0;
  let payload: string | undefined;
  const res = {
    writeHead(code: number) { status = code; return res; },
    end(data?: string) { payload = data; },
  } as unknown as import('http').ServerResponse;
  return {
    res,
    get status() { return status; },
    get body() { return payload ? JSON.parse(payload) : undefined; },
  };
}

let dataDir: string;
beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), 'top100-stats-'));
  process.env.DATA_DIR = dataDir;
  __resetForTesting();
});

describe('server/daily POST /api/daily/score', () => {
  it('rejects unknown listId', async () => {
    const out = mockRes();
    const handled = await handleDailyRequest(
      mockReq('POST', '/api/daily/score', { listId: 'nope-nonexistent', score: 10 }),
      out.res,
    );
    expect(handled).toBe(true);
    expect(out.status).toBe(400);
    expect(out.body.error).toMatch(/Unknown listId/);
  });

  it('clamps out-of-range scores into [0, maxScore]', async () => {
    const out = mockRes();
    await handleDailyRequest(
      mockReq('POST', '/api/daily/score', { listId: 'company-valuation', score: 999_999 }),
      out.res,
    );
    expect(out.status).toBe(200);
    expect(out.body.playCount).toBe(1);
  });

  it('persists v2 byListId schema', async () => {
    const out = mockRes();
    await handleDailyRequest(
      mockReq('POST', '/api/daily/score', { listId: 'company-valuation', score: 42 }),
      out.res,
    );
    const raw = readFileSync(join(dataDir, 'daily-stats.json'), 'utf-8');
    const parsed = JSON.parse(raw);
    expect(parsed.version).toBe(2);
    expect(parsed.byListId['company-valuation'].playCount).toBe(1);
    expect(parsed.byListId['company-valuation'].scores).toContain(42);
  });
});

describe('server/daily GET /api/daily/stats', () => {
  it('requires listId query param', async () => {
    const out = mockRes();
    await handleDailyRequest(mockReq('GET', '/api/daily/stats'), out.res);
    expect(out.status).toBe(400);
  });

  it('returns zero-play histogram without crashing (d77f399 regression)', async () => {
    const out = mockRes();
    await handleDailyRequest(
      mockReq('GET', '/api/daily/stats?listId=company-valuation'),
      out.res,
    );
    expect(out.status).toBe(200);
    expect(out.body.playCount).toBe(0);
    expect(out.body.avgScore).toBe(0);
    expect(Array.isArray(out.body.edges)).toBe(true);
    expect(out.body.counts.every((c: number) => c === 0)).toBe(true);
    expect(out.body.edges.length).toBe(out.body.counts.length);
  });

  it('loads existing v2 schema and preserves scores across save', async () => {
    writeFileSync(
      join(dataDir, 'daily-stats.json'),
      JSON.stringify({
        version: 2,
        byListId: { 'company-valuation': { totalScore: 100, playCount: 5, scores: [10, 20, 20, 25, 25] } },
      }),
    );

    const out = mockRes();
    await handleDailyRequest(
      mockReq('GET', '/api/daily/stats?listId=company-valuation'),
      out.res,
    );
    expect(out.status).toBe(200);
    expect(out.body.playCount).toBe(5);
    expect(out.body.avgScore).toBe(20);

    const postOut = mockRes();
    await handleDailyRequest(
      mockReq('POST', '/api/daily/score', { listId: 'company-valuation', score: 50 }),
      postOut.res,
    );
    const raw = JSON.parse(readFileSync(join(dataDir, 'daily-stats.json'), 'utf-8'));
    expect(raw.byListId['company-valuation'].playCount).toBe(6);
    expect(raw.byListId['company-valuation'].scores).toEqual(expect.arrayContaining([10, 20, 25, 50]));
  });

  it('backs up corrupt files instead of overwriting', async () => {
    writeFileSync(join(dataDir, 'daily-stats.json'), '{not valid json');
    const out = mockRes();
    await handleDailyRequest(
      mockReq('GET', '/api/daily/stats?listId=company-valuation'),
      out.res,
    );
    const files = readdirSync(dataDir);
    expect(files.some((f) => f.startsWith('daily-stats.corrupt-'))).toBe(true);
  });
});
