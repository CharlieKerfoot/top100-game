import type { IncomingMessage, ServerResponse } from 'http';
import { getDailyList, getTodayKey } from '../src/lib/daily.ts';
import { getMaxScore } from '../src/lib/lists/index.ts';

interface DayStats {
  totalScore: number;
  playCount: number;
  scores: number[];
}

const dailyStats = new Map<string, DayStats>();
const MAX_SCORES = 10000;

function getOrCreateToday(): DayStats {
  const key = getTodayKey();
  let stats = dailyStats.get(key);
  if (!stats) {
    stats = { totalScore: 0, playCount: 0, scores: [] };
    dailyStats.set(key, stats);
    // Evict old entries — keep only today
    for (const k of dailyStats.keys()) {
      if (k !== key) dailyStats.delete(k);
    }
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

      json(res, 200, { percentile, avgScore, playCount: stats.playCount });
    } catch {
      json(res, 400, { error: 'Invalid request body' });
    }
    return true;
  }

  if (url === '/api/daily/stats' && req.method === 'GET') {
    const todayKey = getTodayKey();
    const stats = dailyStats.get(todayKey);

    if (!stats || stats.playCount === 0) {
      json(res, 200, { date: todayKey, avgScore: 0, playCount: 0, scores: [] });
      return true;
    }

    // Bucket scores into equal-width ranges based on the list's max score
    // Use round bucket sizes (100 or 250) for clean labels
    const dailyList = getDailyList();
    const maxScore = getMaxScore(dailyList);
    const bucketSize = maxScore <= 2000 ? 100 : 250;
    const bucketCount = Math.ceil(maxScore / bucketSize);
    const buckets = new Array(bucketCount).fill(0);
    for (const s of stats.scores) {
      const idx = Math.min(Math.floor(s / bucketSize), bucketCount - 1);
      buckets[idx]++;
    }

    json(res, 200, {
      date: todayKey,
      avgScore: Math.round(stats.totalScore / stats.playCount),
      playCount: stats.playCount,
      scores: buckets,
      bucketSize,
    });
    return true;
  }

  return false;
}
