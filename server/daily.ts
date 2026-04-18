import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { IncomingMessage, ServerResponse } from 'http';
import { getDailyList, getTodayKey } from '../src/lib/daily.ts';
import { getMaxScore } from '../src/lib/lists/index.ts';

interface DayStats {
  totalScore: number;
  playCount: number;
  scores: number[];
}

interface PersistedStats {
  key: string;
  stats: DayStats;
}

const DATA_DIR = process.env.DATA_DIR || './data';
const STATS_FILE = join(DATA_DIR, 'daily-stats.json');
const MAX_SCORES = 10000;

const dailyStats = new Map<string, DayStats>();
let loaded = false;

function loadStats(): void {
  if (loaded) return;
  loaded = true;
  try {
    if (existsSync(STATS_FILE)) {
      const raw = readFileSync(STATS_FILE, 'utf-8');
      const persisted: PersistedStats = JSON.parse(raw);
      if (persisted.key && persisted.stats) {
        dailyStats.set(persisted.key, persisted.stats);
      }
    }
  } catch {
    // Corrupted or unreadable file — start fresh
  }
}

function saveStats(key: string, stats: DayStats): void {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const persisted: PersistedStats = { key, stats };
    writeFileSync(STATS_FILE, JSON.stringify(persisted));
  } catch {
    // Non-fatal — stats will still work in-memory for this session
  }
}

function getOrCreateToday(): DayStats {
  loadStats();
  const key = getTodayKey();
  let stats = dailyStats.get(key);
  if (!stats) {
    stats = { totalScore: 0, playCount: 0, scores: [] };
    dailyStats.set(key, stats);
    // Evict old entries — keep only today
    for (const k of dailyStats.keys()) {
      if (k !== key) dailyStats.delete(k);
    }
    saveStats(key, stats);
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

export async function handleDailyRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url ?? '';

  if (url === '/api/daily/score' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const body = JSON.parse(raw);
      const { date, listId, score } = body;

      // Validate date matches today
      const todayKey = getTodayKey();
      if (date !== todayKey) {
        json(res, 400, { error: 'Date does not match today' });
        return true;
      }

      // Validate list matches today's daily
      const dailyList = getDailyList();
      if (listId !== dailyList.id) {
        json(res, 400, { error: 'List does not match today\'s daily' });
        return true;
      }

      // Validate score range
      const maxScore = getMaxScore(dailyList);
      if (typeof score !== 'number' || score < 0 || score > maxScore) {
        json(res, 400, { error: `Score out of range (0-${maxScore})` });
        return true;
      }

      const stats = getOrCreateToday();

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

      saveStats(todayKey, stats);

      json(res, 200, { percentile, avgScore, playCount: stats.playCount });
    } catch {
      json(res, 400, { error: 'Invalid request body' });
    }
    return true;
  }

  if (url === '/api/daily/stats' && req.method === 'GET') {
    const todayKey = getTodayKey();
    const stats = getOrCreateToday();

    if (stats.playCount === 0) {
      json(res, 200, { date: todayKey, avgScore: 0, playCount: 0, edges: [], counts: [] });
      return true;
    }

    // Variable-width buckets: dense at the low end where most players land,
    // coarse at the high end where only completionists reach. The final bucket
    // is an overflow bucket catching anything at or above its lower edge.
    // `edges` is the lower bound of each bucket; edges.length === counts.length.
    const dailyList = getDailyList();
    const maxScore = getMaxScore(dailyList);
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
      date: todayKey,
      avgScore: Math.round(stats.totalScore / stats.playCount),
      playCount: stats.playCount,
      edges,
      counts,
    });
    return true;
  }

  return false;
}
