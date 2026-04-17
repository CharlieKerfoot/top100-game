#!/usr/bin/env bun
/**
 * Append newly-added lists to src/lib/lists/daily-schedule.ts.
 *
 * The schedule is FROZEN — existing entries must never be reordered.
 * When you add a new list to src/lib/lists/index.ts, run:
 *
 *   bun run scripts/gen-schedule.ts --append
 *
 * It finds any list ids not already in the schedule, shuffles them
 * deterministically (seeded by the current schedule length so the
 * result is stable across re-runs), and appends them to the array
 * inside daily-schedule.ts. Existing entries are untouched.
 *
 * Without --append, it prints what would change.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { lists } from '../src/lib/lists/index.ts';
import { dailySchedule } from '../src/lib/lists/daily-schedule.ts';

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const next = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
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

const scheduled = new Set(dailySchedule);
const missing = lists.map((l) => l.id).filter((id) => !scheduled.has(id));

if (missing.length === 0) {
  console.log(`✓ Schedule is up to date (${dailySchedule.length} lists).`);
  process.exit(0);
}

// Seed by current schedule length so re-running before commit is stable.
const ordered = seededShuffle(missing, 42 + dailySchedule.length);

const append = process.argv.includes('--append');
if (!append) {
  console.log(`${missing.length} list(s) missing from schedule:`);
  for (const id of ordered) console.log(`  + ${id}`);
  console.log(`\nRun with --append to write them to daily-schedule.ts.`);
  process.exit(0);
}

const schedulePath = join(import.meta.dir, '..', 'src', 'lib', 'lists', 'daily-schedule.ts');
const src = readFileSync(schedulePath, 'utf-8');
const closingMarker = '\n];';
const idx = src.lastIndexOf(closingMarker);
if (idx === -1) {
  console.error('Could not locate closing "];" in daily-schedule.ts');
  process.exit(1);
}
const insertion = ordered.map((id) => `  '${id}',`).join('\n') + '\n';
const nextSrc = src.slice(0, idx) + '\n' + insertion + src.slice(idx + 1);
writeFileSync(schedulePath, nextSrc);
console.log(`✓ Appended ${ordered.length} list(s) to daily-schedule.ts.`);
for (const id of ordered) console.log(`  + ${id}`);
