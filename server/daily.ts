import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'fs';
import { join } from 'path';
import type { IncomingMessage, ServerResponse } from 'http';
import { lists, getMaxScore } from '../src/lib/lists/index.ts';

interface ListStats {
  totalScore: number;
  playCount: number;
  scores: number[];
}

interface PersistedV2 {
  version: 2;
  byListId: Record<string, ListStats>;
}

const DATA_DIR = process.env.DATA_DIR || './data';
const STATS_FILE = join(DATA_DIR, 'daily-stats.json');
const MAX_SCORES = 10000;

const listById = new Map(lists.map((l) => [l.id, l]));
const statsByListId = new Map<string, ListStats>();
let loaded = false;

function backupCorruptFile(reason: string): void {
  try {
    if (!existsSync(STATS_FILE)) return;
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const target = join(DATA_DIR, `daily-stats.corrupt-${ts}.json`);
    renameSync(STATS_FILE, target);
    // eslint-disable-next-line no-console
    console.warn(`[daily] Backed up unreadable stats file to ${target} (reason: ${reason})`);
  } catch {
    // Best effort; don't crash the server
  }
}

function loadStats(): void {
  if (loaded) return;
  loaded = true;
  if (!existsSync(STATS_FILE)) return;

  let raw: string;
  try {
    raw = readFileSync(STATS_FILE, 'utf-8');
  } catch {
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    backupCorruptFile('invalid JSON');
    return;
  }

  if (
    parsed &&
    typeof parsed === 'object' &&
    (parsed as PersistedV2).version === 2 &&
    (parsed as PersistedV2).byListId &&
    typeof (parsed as PersistedV2).byListId === 'object'
  ) {
    for (const [listId, stats] of Object.entries((parsed as PersistedV2).byListId)) {
      if (
        stats &&
        typeof stats.totalScore === 'number' &&
        typeof stats.playCount === 'number' &&
        Array.isArray(stats.scores)
      ) {
        statsByListId.set(listId, {
          totalScore: stats.totalScore,
          playCount: stats.playCount,
          scores: stats.scores.filter((s) => typeof s === 'number'),
        });
      }
    }
    return;
  }

  // Unknown schema — preserve it, don't overwrite.
  backupCorruptFile('unknown schema');
}

function saveStats(): void {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const persisted: PersistedV2 = {
      version: 2,
      byListId: Object.fromEntries(statsByListId),
    };
    writeFileSync(STATS_FILE, JSON.stringify(persisted));
  } catch {
    // Non-fatal — stats will still work in-memory for this session
  }
}

function getOrCreateStats(listId: string): ListStats {
  loadStats();
  let stats = statsByListId.get(listId);
  if (!stats) {
    stats = { totalScore: 0, playCount: 0, scores: [] };
    statsByListId.set(listId, stats);
  }
  return stats;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function histogramEdgesFor(maxScore: number): number[] {
  return maxScore <= 1500
    ? [
        0, 10, 20, 30, 40,
        50, 60, 70, 80, 90,
        100, 120, 140, 160, 180,
        200, 240, 280, 320, 360,
        400, 480, 560, 640, 720,
        800, 900, 1000, 1100, 1200,
      ]
    : [
        0, 20, 40, 60, 80,
        100, 120, 140, 160, 180,
        200, 250, 300, 350, 400,
        500, 600, 700, 800, 900,
        1000, 1200, 1400, 1600, 1800,
        2000, 2500, 3000, 4000, 5000,
      ];
}

function computeCounts(scores: number[], edges: number[]): number[] {
  const counts = new Array(edges.length).fill(0);
  for (const s of scores) {
    let idx = 0;
    for (let i = edges.length - 1; i >= 0; i--) {
      if (s >= edges[i]) { idx = i; break; }
    }
    counts[idx]++;
  }
  return counts;
}

export async function handleDailyRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url ?? '';

  if (url === '/api/daily/score' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const body = JSON.parse(raw);
      const { listId, score } = body;

      if (typeof listId !== 'string') {
        json(res, 400, { error: 'Missing listId' });
        return true;
      }
      const list = listById.get(listId);
      if (!list) {
        json(res, 400, { error: `Unknown listId: ${listId}` });
        return true;
      }

      const maxScore = getMaxScore(list);
      if (typeof score !== 'number' || !Number.isFinite(score)) {
        json(res, 400, { error: 'Score must be a number' });
        return true;
      }
      const clamped = Math.max(0, Math.min(maxScore, Math.floor(score)));

      const stats = getOrCreateStats(listId);
      stats.totalScore += clamped;
      stats.playCount++;

      // Reservoir sampling beyond MAX_SCORES
      if (stats.scores.length < MAX_SCORES) {
        stats.scores.push(clamped);
      } else {
        const idx = Math.floor(Math.random() * stats.playCount);
        if (idx < MAX_SCORES) {
          stats.scores[idx] = clamped;
        }
      }

      const percentile = stats.scores.length > 0
        ? Math.round(stats.scores.filter((s) => s < clamped).length / stats.scores.length * 100)
        : 0;
      const avgScore = Math.round(stats.totalScore / stats.playCount);

      saveStats();

      json(res, 200, { percentile, avgScore, playCount: stats.playCount });
    } catch {
      json(res, 400, { error: 'Invalid request body' });
    }
    return true;
  }

  if (url.startsWith('/api/daily/stats') && req.method === 'GET') {
    const query = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
    const params = new URLSearchParams(query);
    const listId = params.get('listId');

    if (!listId) {
      json(res, 400, { error: 'Missing listId query param' });
      return true;
    }
    const list = listById.get(listId);
    if (!list) {
      json(res, 400, { error: `Unknown listId: ${listId}` });
      return true;
    }

    loadStats();
    const stats = statsByListId.get(listId) ?? { totalScore: 0, playCount: 0, scores: [] };
    const maxScore = getMaxScore(list);
    const edges = histogramEdgesFor(maxScore);
    const counts = computeCounts(stats.scores, edges);

    json(res, 200, {
      listId,
      avgScore: stats.playCount > 0 ? Math.round(stats.totalScore / stats.playCount) : 0,
      playCount: stats.playCount,
      edges,
      counts,
    });
    return true;
  }

  return false;
}
