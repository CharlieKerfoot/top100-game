import { lists, type GameList } from './lists/index';
import { dailySchedule } from './lists/daily-schedule';

// ── Deterministic daily list selection ──
//
// The daily is driven by a frozen schedule (src/lib/lists/daily-schedule.ts).
// Day N's list is the one whose id is at index N-1 in dailySchedule.
// See daily-schedule.ts for rules on adding new lists.

const LAUNCH_DATE = '2026-04-13';
const MS_PER_DAY = 86400000;

const listById = new Map(lists.map((l) => [l.id, l]));

export function getDayNumber(): number {
  const now = new Date();
  const localNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [y, m, d] = LAUNCH_DATE.split('-').map(Number);
  const localLaunch = new Date(y, m - 1, d);
  const dayDiff = Math.floor((localNow.getTime() - localLaunch.getTime()) / MS_PER_DAY);
  return Math.max(0, dayDiff) + 1;
}

export function getDailyList(): GameList {
  const id = dailySchedule[(getDayNumber() - 1) % dailySchedule.length];
  const list = listById.get(id);
  if (!list) {
    throw new Error(`Daily schedule references unknown list id "${id}". Check src/lib/lists/daily-schedule.ts.`);
  }
  return list;
}

export function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// ── localStorage persistence ──

export interface DayResult {
  score: number;
  listId: string;
  guessCount: number;
  guessedRanks: number[];
}

export interface DailyStats {
  streak: number;
  maxStreak: number;
  gamesPlayed: number;
  bestScore: number;
  history: Record<string, DayResult>;
}

const STORAGE_KEY = 'daily_stats';

function defaultStats(): DailyStats {
  return {
    streak: 0,
    maxStreak: 0,
    gamesPlayed: 0,
    bestScore: 0,
    history: {},
  };
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadDailyStats(): DailyStats {
  if (!isBrowser()) return defaultStats();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats();
    return JSON.parse(raw) as DailyStats;
  } catch {
    // Corrupted data, reset
    window.localStorage.removeItem(STORAGE_KEY);
    return defaultStats();
  }
}

export function saveDailyStats(stats: DailyStats): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordGame(score: number, listId: string, guessCount: number, guessedRanks: number[]): DailyStats {
  const stats = loadDailyStats();
  const todayKey = getTodayKey();

  // Already recorded today
  if (stats.history[todayKey]) return stats;

  stats.history[todayKey] = { score, listId, guessCount, guessedRanks };
  stats.gamesPlayed++;
  if (score > stats.bestScore) stats.bestScore = score;

  // Streak calculation: check yesterday
  const y = new Date(Date.now() - MS_PER_DAY);
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  if (stats.history[yesterday]) {
    stats.streak++;
  } else {
    stats.streak = 1;
  }
  if (stats.streak > stats.maxStreak) stats.maxStreak = stats.streak;

  saveDailyStats(stats);
  return stats;
}

// ── Share URL for OG image ──

export function generateShareUrl(opts: {
  listId: string;
  score: number;
  dayNumber: number;
  percentile?: number;
}): string {
  const qs = new URLSearchParams({
    list: opts.listId,
    score: String(opts.score),
    day: String(opts.dayNumber),
  });
  if (opts.percentile !== undefined) qs.set('percentile', String(opts.percentile));
  return `https://commoncents.fun/api/og?${qs}`;
}

// ── Share text + grid ──

export function generateShareGrid(guessedRanks: number[], listSize: number = 100): string {
  const rankSet = new Set(guessedRanks);
  const cols = 10;
  const totalRows = Math.ceil(listSize / cols);
  const rows: string[] = [];
  for (let row = 0; row < totalRows; row++) {
    let line = '';
    for (let col = 0; col < cols; col++) {
      const rank = row * cols + col + 1;
      if (rank > listSize) break;
      line += rankSet.has(rank) ? '🟩' : '⬜';
    }
    rows.push(line);
  }
  return rows.join('\n');
}

export function generateShareText(opts: {
  dayNumber: number;
  listName: string;
  score: number;
  streak: number;
  guessedRanks: number[];
  percentile?: number;
  listSize?: number;
}): string {
  const size = opts.listSize ?? 100;
  const maxScore = (size * (size + 1)) / 2;
  const lines: string[] = [
    `Common Cents #${opts.dayNumber} ☀️`,
    opts.listName,
    `Score: ${opts.score.toLocaleString()}/${maxScore.toLocaleString()}`,
    '',
    generateShareGrid(opts.guessedRanks, size),
  ];

  if (opts.streak > 0) {
    lines.push('');
    lines.push(`🔥 ${opts.streak}-day streak`);
  }

  if (opts.percentile !== undefined) {
    lines.push(`Better than ${opts.percentile}% of players`);
  }

  lines.push('');
  lines.push('commoncents.fun/daily');

  return lines.join('\n');
}
