import { categories, type Category } from './categories/index';

// ── Deterministic daily category selection ──

const FIXED_SEED = 42;
const LAUNCH_DATE = '2026-04-15';
const MS_PER_DAY = 86400000;

function seededShuffle(arr: Category[]): Category[] {
  let seed = FIXED_SEED;
  const next = () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const dailyOrder = seededShuffle(categories);

export function getDayNumber(): number {
  const d = Math.floor((Date.now() - Date.parse(LAUNCH_DATE)) / MS_PER_DAY);
  return Math.max(0, d);
}

export function getDailyCategory(): Category {
  return dailyOrder[getDayNumber() % dailyOrder.length];
}

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── localStorage persistence ──

export interface DayResult {
  score: number;
  categoryId: string;
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

export function recordGame(score: number, categoryId: string, guessCount: number, guessedRanks: number[]): DailyStats {
  const stats = loadDailyStats();
  const todayKey = getTodayKey();

  // Already recorded today
  if (stats.history[todayKey]) return stats;

  stats.history[todayKey] = { score, categoryId, guessCount, guessedRanks };
  stats.gamesPlayed++;
  if (score > stats.bestScore) stats.bestScore = score;

  // Streak calculation: check yesterday
  const yesterday = new Date(Date.now() - MS_PER_DAY).toISOString().slice(0, 10);
  if (stats.history[yesterday]) {
    stats.streak++;
  } else {
    stats.streak = 1;
  }
  if (stats.streak > stats.maxStreak) stats.maxStreak = stats.streak;

  saveDailyStats(stats);
  return stats;
}

// ── Share text + grid ──

export function generateShareGrid(guessedRanks: number[]): string {
  const rankSet = new Set(guessedRanks);
  const rows: string[] = [];
  for (let row = 0; row < 10; row++) {
    let line = '';
    for (let col = 0; col < 10; col++) {
      const rank = row * 10 + col + 1; // 1-100
      line += rankSet.has(rank) ? '🟩' : '⬜';
    }
    rows.push(line);
  }
  return rows.join('\n');
}

export function generateShareText(opts: {
  dayNumber: number;
  categoryName: string;
  score: number;
  streak: number;
  guessedRanks: number[];
  percentile?: number;
}): string {
  const lines: string[] = [
    `Common Cents #${opts.dayNumber} ☀️`,
    opts.categoryName,
    `Score: ${opts.score.toLocaleString()}/5,050`,
    '',
    generateShareGrid(opts.guessedRanks),
  ];

  if (opts.streak > 0) {
    lines.push('');
    lines.push(`🔥 ${opts.streak}-day streak`);
  }

  if (opts.percentile !== undefined) {
    lines.push(`Better than ${opts.percentile}% of players`);
  }

  return lines.join('\n');
}
