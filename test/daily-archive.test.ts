import { describe, it, expect } from 'vitest';
import { computePercentile } from '../src/lib/daily';

describe('computePercentile', () => {
  it('returns 0 for an empty score set', () => {
    expect(computePercentile(100, [])).toBe(0);
  });

  it('returns the rounded share of scores strictly below the given score', () => {
    // 3 of 4 are strictly below 20 → 75%
    expect(computePercentile(20, [10, 15, 19, 20])).toBe(75);
  });

  it('ties do not count as "below"', () => {
    // A player who tied the whole field beats 0% of them.
    expect(computePercentile(10, [10, 10, 10, 10])).toBe(0);
  });

  it('handles the full-beat case', () => {
    expect(computePercentile(100, [1, 2, 3])).toBe(100);
  });
});
