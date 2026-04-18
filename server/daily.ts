import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { IncomingMessage, ServerResponse } from 'http';
import { getDailyList } from '../src/lib/daily.ts';
import { dailySchedule } from '../src/lib/lists/daily-schedule.ts';
import { lists, getMaxScore } from '../src/lib/lists/index.ts';

const listById = new Map(lists.map((l) => [l.id, l]));

interface DayStats {
  totalScore: number;
  playCount: number;
  scores: number[];
}

interface PersistedStatsV2 {
  version: 2;
  byListId: Record<string, DayStats>;
}

const DATA_DIR = process.env.DATA_DIR || './data';
const STATS_FILE = join(DATA_DIR, 'daily-stats.json');
const MAX_SCORES = 10000;
// Keep stats for the most recent N distinct lists. Across all timezones a
// given real-world "day" covers at most 2 scheduled lists, so 60 buffers
// ~30 days of history while bounding disk size.
const MAX_RETAINED_LISTS = 60;

const validListIds = new Set(dailySchedule);

// listId -> DayStats. Insertion order is preserved and used for eviction.
const dailyStats = new Map<string, DayStats>();
let loaded = false;

function loadStats(): void {
  if (loaded) return;
  loaded = true;
  try {
    if (!existsSync(STATS_FILE)) return;
    const raw = readFileSync(STATS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 2 && parsed.byListId) {
      for (const [listId, stats] of Object.entries(parsed.byListId)) {
        if (validListIds.has(listId)) {
          dailyStats.set(listId, stats as DayStats);
        }
      }
    }
    // Legacy v1 shape ({ key, stats } keyed by date) is intentionally
    // discarded — the date key no longer maps to a listId cleanly across
    // timezones, and the old file predates multi-day retention.
  } catch {
    // Corrupted or unreadable — start fresh
  }
}

function persistAll(): void {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const byListId: Record<string, DayStats> = {};
    for (const [listId, stats] of dailyStats) {
      byListId[listId] = stats;
    }
    const persisted: PersistedStatsV2 = { version: 2, byListId };
    writeFileSync(STATS_FILE, JSON.stringify(persisted));
  } catch {
    // Non-fatal — stats will still work in-memory for this session
  }
}

function getOrCreate(listId: string): DayStats {
  loadStats();
  let stats = dailyStats.get(listId);
  if (!stats) {
    stats = { totalScore: 0, playCount: 0, scores: [] };
    dailyStats.set(listId, stats);
    // Evict oldest entries beyond retention window (Map preserves insertion order)
    while (dailyStats.size > MAX_RETAINED_LISTS) {
      const oldest = dailyStats.keys().next().value;
      if (oldest === undefined) break;
      dailyStats.delete(oldest);
    }
  }
  return stats;
}

function emptyStats(): DayStats {
  loadStats();
  return { totalScore: 0, playCount: 0, scores: [] };
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

function parseListIdFromQuery(url: string): string | null {
  const qIndex = url.indexOf('?');
  if (qIndex === -1) return null;
  const params = new URLSearchParams(url.slice(qIndex + 1));
  return params.get('list');
}

export async function handleDailyRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url ?? '';
  const path = url.split('?')[0];

  if (path === '/api/daily/score' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const body = JSON.parse(raw);
      const { listId, score } = body;

      // Validate listId is a real scheduled daily. This is the only gate — we
      // no longer require the client's date to match the server's date,
      // because clients legitimately cross midnight at their own timezone.
      if (typeof listId !== 'string' || !validListIds.has(listId)) {
        json(res, 400, { error: 'Unknown list id' });
        return true;
      }

      const list = listById.get(listId);
      if (!list) {
        json(res, 400, { error: 'Unknown list id' });
        return true;
      }

      const maxScore = getMaxScore(list);
      if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > maxScore) {
        json(res, 400, { error: `Score out of range (0-${maxScore})` });
        return true;
      }

      const stats = getOrCreate(listId);

      stats.totalScore += score;
      stats.playCount++;

      // Reservoir sampling beyond MAX_SCORES
      if (stats.scores.length < MAX_SCORES) {
        stats.scores.push(score);
      } else {
        const idx = Math.floor(Math.random() * stats.playCount);
        if (idx < MAX_SCORES) {
          stats.scores[idx] = score;
        }
      }

      const percentile = Math.round(
        stats.scores.filter(s => s < score).length / stats.scores.length * 100
      );
      const avgScore = Math.round(stats.totalScore / stats.playCount);

      persistAll();

      json(res, 200, { percentile, avgScore, playCount: stats.playCount });
    } catch {
      json(res, 400, { error: 'Invalid request body' });
    }
    return true;
  }

  if (path === '/api/daily/stats' && req.method === 'GET') {
    // Client sends ?list=<id> to request stats for the list it's currently
    // playing. Fall back to the server's own daily for back-compat (older
    // clients that haven't shipped the query param yet).
    let listId = parseListIdFromQuery(url);
    if (!listId || !validListIds.has(listId)) {
      listId = getDailyList().id;
    }

    loadStats();
    const stats = dailyStats.get(listId) ?? emptyStats();
    const list = listById.get(listId);

    if (!list) {
      json(res, 200, { listId, avgScore: 0, playCount: 0, edges: [], counts: [] });
      return true;
    }

    // Variable-width buckets: dense at the low end where most players land,
    // coarse at the high end where only completionists reach. The final bucket
    // is an overflow bucket catching anything at or above its lower edge.
    // `edges` is the lower bound of each bucket; edges.length === counts.length.
    const maxScore = getMaxScore(list);
    const edges = maxScore <= 1500
      // Top-50 lists (max 1275, avg ~100-200). 30 buckets.
      // Widths scale: 10 → 20 → 40 → 80 → 100. Last bucket = 1200+ (covers
      // 1200-1275, i.e. near-perfect runs). Label-aligned for step=5:
      //   0, 50, 100, 200, 400, 800, 1200+
      ? [
          0, 10, 20, 30, 40,
          50, 60, 70, 80, 90,
          100, 120, 140, 160, 180,
          200, 240, 280, 320, 360,
          400, 480, 560, 640, 720,
          800, 900, 1000, 1100, 1200,
        ]
      // Top-100 lists (max 5050, avg ~400). 30 buckets.
      // Widths scale: 20 → 50 → 100 → 200 → 500 → 1000. Last bucket = 5000+
      // (covers 5000-5050). Label-aligned for step=5:
      //   0, 100, 200, 500, 1000, 2000, 5000+
      : [
          0, 20, 40, 60, 80,
          100, 120, 140, 160, 180,
          200, 250, 300, 350, 400,
          500, 600, 700, 800, 900,
          1000, 1200, 1400, 1600, 1800,
          2000, 2500, 3000, 4000, 5000,
        ];
    const counts = new Array(edges.length).fill(0);
    for (const s of stats.scores) {
      let idx = 0;
      for (let i = edges.length - 1; i >= 0; i--) {
        if (s >= edges[i]) { idx = i; break; }
      }
      counts[idx]++;
    }

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
