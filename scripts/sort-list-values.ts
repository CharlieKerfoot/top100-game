#!/usr/bin/env bun
/**
 * Sorts items+values in a list file by value, matching the auto-detected
 * direction (descending unless the list is ascending like ranks).
 *
 * Usage: bun scripts/sort-list-values.ts <path-to-list.ts> [...more paths]
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const parseNum = (v: string): number => {
  const m = v.match(/(-?\d+(?:[,\d]*)?(?:\.\d+)?)\s*([KMBT])?/i);
  if (!m) return NaN;
  const n = parseFloat(m[1].replace(/,/g, ''));
  const unit = (m[2] ?? '').toUpperCase();
  const mult = unit === 'K' ? 1e3 : unit === 'M' ? 1e6 : unit === 'B' ? 1e9 : unit === 'T' ? 1e12 : 1;
  return n * mult;
};

// Extract an array literal by key name, returning the raw string elements
// (with quotes stripped) and the [start,end] offsets of the array contents.
function extractArray(source: string, key: string): { elements: string[]; fullMatch: string; start: number } | null {
  const re = new RegExp(`(${key}:\\s*\\[)([\\s\\S]*?)(\\],?)`, 'm');
  const m = source.match(re);
  if (!m || m.index === undefined) return null;
  const body = m[2];
  const elements: string[] = [];
  const strRe = /"((?:[^"\\]|\\.)*)"/g;
  let sm;
  while ((sm = strRe.exec(body)) !== null) {
    elements.push(sm[1]);
  }
  return { elements, fullMatch: m[0], start: m.index };
}

function formatArray(key: string, elements: string[], indent = '  '): string {
  const lines: string[] = [`${indent}${key}: [`];
  for (let i = 0; i < elements.length; i += 5) {
    const row = elements.slice(i, i + 5).map(e => `"${e}"`).join(', ');
    lines.push(`${indent}  ${row},`);
  }
  lines.push(`${indent}],`);
  return lines.join('\n');
}

function sortListFile(path: string): boolean {
  const full = resolve(path);
  let src = readFileSync(full, 'utf8');

  const itemsArr = extractArray(src, 'items');
  const valuesArr = extractArray(src, 'values');
  if (!itemsArr || !valuesArr) {
    console.log(`  skip (no items/values): ${path}`);
    return false;
  }
  if (itemsArr.elements.length !== valuesArr.elements.length) {
    console.log(`  skip (length mismatch): ${path}`);
    return false;
  }

  const nums = valuesArr.elements.map(parseNum);
  const first = nums.find(Number.isFinite);
  const last = [...nums].reverse().find(Number.isFinite);
  if (first === undefined || last === undefined) {
    console.log(`  skip (non-numeric): ${path}`);
    return false;
  }
  const ascending = first < last;

  const indices = itemsArr.elements.map((_, i) => i);
  indices.sort((a, b) => {
    const na = nums[a];
    const nb = nums[b];
    if (!Number.isFinite(na) && !Number.isFinite(nb)) return a - b;
    if (!Number.isFinite(na)) return 1;
    if (!Number.isFinite(nb)) return -1;
    if (na === nb) return a - b;
    return ascending ? na - nb : nb - na;
  });

  const sortedItems = indices.map(i => itemsArr.elements[i]);
  const sortedValues = indices.map(i => valuesArr.elements[i]);

  const changed = sortedItems.some((v, i) => v !== itemsArr.elements[i]);
  if (!changed) {
    console.log(`  already sorted: ${path}`);
    return false;
  }

  // Replace both arrays in source. Do values first since its offset comes after items,
  // so replacing items first wouldn't shift the values match — but we re-match each time to be safe.
  const newItems = formatArray('items', sortedItems);
  const newValues = formatArray('values', sortedValues);

  src = src.replace(itemsArr.fullMatch, newItems);
  // Re-find values match in updated source.
  const valuesArr2 = extractArray(src, 'values');
  if (!valuesArr2) {
    console.log(`  failed re-match values: ${path}`);
    return false;
  }
  src = src.replace(valuesArr2.fullMatch, newValues);

  writeFileSync(full, src);
  console.log(`  sorted (${ascending ? 'asc' : 'desc'}): ${path}`);
  return true;
}

const paths = process.argv.slice(2);
if (paths.length === 0) {
  console.error('Usage: bun scripts/sort-list-values.ts <path> [...]');
  process.exit(1);
}
for (const p of paths) {
  sortListFile(p);
}
