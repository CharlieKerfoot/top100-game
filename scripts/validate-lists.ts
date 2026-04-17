#!/usr/bin/env bun
/**
 * List quality validator — enforces every rule from CLAUDE.md.
 *
 * Usage:
 *   bun run validate            (via package.json script)
 *   bun scripts/validate-lists.ts
 *
 * Exit code 0 = all lists pass, 1 = at least one error.
 *
 * Errors (exit 1): duplicate items, missing items from hints, invalid aliases,
 *   values/items length mismatch, no hints at all.
 * Warnings (exit 0): hint count below recommended minimum.
 */

import { lists } from '../src/lib/lists/index.ts';
import { dailySchedule } from '../src/lib/lists/daily-schedule.ts';
import type { GameList } from '../src/lib/lists/types.ts';

// ── Normalize (mirrors src/lib/normalize.ts) ──

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// ── Thresholds ──

const HINT_MIN_100 = 500;
const HINT_MIN_50 = 250;

// ── Types ──

type Severity = 'error' | 'warn';

interface Issue {
  list: string;
  rule: string;
  detail: string;
  severity: Severity;
}

// ── Validator ──

function validateList(list: GameList): Issue[] {
  const issues: Issue[] = [];
  const id = list.id;
  const listSize = list.size ?? 100;
  const items = list.items;
  const hints = list.hints ?? [];
  const values = list.values;
  const aliases = list.aliases ?? {};

  // ── 1. Item count matches declared size ──
  if (items.length !== listSize) {
    issues.push({
      list: id,
      rule: 'item-count',
      detail: `Expected ${listSize} items, found ${items.length}`,
      severity: 'error',
    });
  }

  // ── 2. No duplicate items (after normalization) ──
  const normalizedItems = new Map<string, string>();
  for (const item of items) {
    const n = normalize(item);
    if (normalizedItems.has(n)) {
      issues.push({
        list: id,
        rule: 'duplicate-item',
        detail: `"${item}" normalizes the same as "${normalizedItems.get(n)}" → "${n}"`,
        severity: 'error',
      });
    } else {
      normalizedItems.set(n, item);
    }
  }

  // ── 3. Every item must appear in hints ──
  if (hints.length > 0) {
    const normalizedHints = new Set(hints.map(h => normalize(h)));
    for (const item of items) {
      if (!normalizedHints.has(normalize(item))) {
        issues.push({
          list: id,
          rule: 'item-missing-from-hints',
          detail: `"${item}" is not in the hints array`,
          severity: 'error',
        });
      }
    }
  }

  // ── 4. Hint count minimums ──
  if (hints.length > 0) {
    const min = listSize === 50 ? HINT_MIN_50 : HINT_MIN_100;
    if (hints.length < min) {
      issues.push({
        list: id,
        rule: 'hint-count',
        detail: `${hints.length} hints (minimum ${min} for top-${listSize} list)`,
        severity: 'warn',
      });
    }
  } else {
    issues.push({
      list: id,
      rule: 'no-hints',
      detail: 'List has no hints array — players cannot use autocomplete',
      severity: 'error',
    });
  }

  // ── 5. No duplicate hints (after normalization) ──
  if (hints.length > 0) {
    const seen = new Map<string, string>();
    for (const hint of hints) {
      const n = normalize(hint);
      if (seen.has(n)) {
        issues.push({
          list: id,
          rule: 'duplicate-hint',
          detail: `"${hint}" normalizes the same as "${seen.get(n)}" → "${n}"`,
          severity: 'error',
        });
      } else {
        seen.set(n, hint);
      }
    }
  }

  // ── 6. Values array length matches items ──
  if (list.valueLabel && !values) {
    issues.push({
      list: id,
      rule: 'missing-values',
      detail: `Has valueLabel "${list.valueLabel}" but no values array`,
      severity: 'error',
    });
  }
  if (values && values.length !== items.length) {
    issues.push({
      list: id,
      rule: 'values-length',
      detail: `${values.length} values but ${items.length} items`,
      severity: 'error',
    });
  }

  // ── 7b. Values must be monotonic (direction auto-detected from endpoints) ──
  if (values && values.length === items.length && values.length >= 2) {
    const parse = (v: string): number => {
      const m = v.replace(/,/g, '').match(/(-?\d+(?:\.\d+)?)\s*([KMBT])?/);
      if (!m) return NaN;
      const n = parseFloat(m[1]);
      const unit = m[2] ?? '';
      const mult = unit === 'K' ? 1e3 : unit === 'M' ? 1e6 : unit === 'B' ? 1e9 : unit === 'T' ? 1e12 : 1;
      return n * mult;
    };
    const nums = values.map(parse);
    const first = nums.find(Number.isFinite);
    const last = [...nums].reverse().find(Number.isFinite);
    if (first !== undefined && last !== undefined && first !== last) {
      const ascending = first < last;
      for (let i = 1; i < nums.length; i++) {
        const prev = nums[i - 1];
        const curr = nums[i];
        if (!Number.isFinite(prev) || !Number.isFinite(curr)) continue;
        const violates = ascending ? curr < prev : curr > prev;
        if (violates) {
          const op = ascending ? '>' : '<';
          issues.push({
            list: id,
            rule: 'values-not-monotonic',
            detail: `#${i} ${items[i - 1]} (${values[i - 1]}) ${op} #${i + 1} ${items[i]} (${values[i]})`,
            severity: 'error',
          });
        }
      }
    }
  }

  // ── 8. Aliases point to real items ──
  for (const [alias, canonical] of Object.entries(aliases)) {
    const canonicalNorm = normalize(canonical);
    if (!normalizedItems.has(canonicalNorm)) {
      issues.push({
        list: id,
        rule: 'invalid-alias',
        detail: `Alias "${alias}" → "${canonical}" does not normalize-match any item`,
        severity: 'error',
      });
    }
  }

  return issues;
}

// ── Main ──

const allIssues: Issue[] = [];

for (const list of lists) {
  allIssues.push(...validateList(list));
}

// ── Daily schedule integrity ──

const scheduleSet = new Set(dailySchedule);
const listIds = new Set(lists.map(l => l.id));

if (scheduleSet.size !== dailySchedule.length) {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const id of dailySchedule) {
    if (seen.has(id)) dupes.push(id);
    seen.add(id);
  }
  allIssues.push({
    list: '(schedule)',
    rule: 'duplicate-schedule-id',
    detail: `daily-schedule.ts has duplicates: ${[...new Set(dupes)].join(', ')}`,
    severity: 'error',
  });
}

for (const id of dailySchedule) {
  if (!listIds.has(id)) {
    allIssues.push({
      list: '(schedule)',
      rule: 'schedule-unknown-list',
      detail: `daily-schedule.ts references unknown list id "${id}"`,
      severity: 'error',
    });
  }
}

for (const id of listIds) {
  if (!scheduleSet.has(id)) {
    allIssues.push({
      list: '(schedule)',
      rule: 'list-missing-from-schedule',
      detail: `"${id}" is in lists/ but not in daily-schedule.ts — run: bun run scripts/gen-schedule.ts --append`,
      severity: 'error',
    });
  }
}

const errors = allIssues.filter(i => i.severity === 'error');
const warnings = allIssues.filter(i => i.severity === 'warn');

// ── Output ──

if (allIssues.length === 0) {
  console.log(`✓ All ${lists.length} lists pass validation.`);
  process.exit(0);
}

// Group by list
const byList = new Map<string, Issue[]>();
for (const issue of allIssues) {
  const arr = byList.get(issue.list) ?? [];
  arr.push(issue);
  byList.set(issue.list, arr);
}

// Print errors first, then warnings
for (const severity of ['error', 'warn'] as const) {
  const filtered = [...byList.entries()].filter(([, issues]) =>
    issues.some(i => i.severity === severity)
  );
  if (filtered.length === 0) continue;

  if (severity === 'error') console.log('\n── Errors ──');
  else console.log('\n── Warnings ──');

  for (const [listId, issues] of filtered) {
    const relevant = issues.filter(i => i.severity === severity);
    if (relevant.length === 0) continue;
    const icon = severity === 'error' ? '✗' : '⚠';
    console.log(`\n${icon} ${listId}:`);
    for (const issue of relevant) {
      console.log(`  [${issue.rule}] ${issue.detail}`);
    }
  }
}

console.log(`\n${errors.length} error${errors.length !== 1 ? 's' : ''}, ${warnings.length} warning${warnings.length !== 1 ? 's' : ''} across ${byList.size} list${byList.size !== 1 ? 's' : ''} (${lists.length} total).`);
process.exit(errors.length > 0 ? 1 : 0);
