import { describe, it, expect } from 'vitest';
import { ogImageUrl, SITE_URL, GAME_NAME } from '$lib/seo';

describe('seo constants', () => {
  it('exports SITE_URL', () => {
    expect(SITE_URL).toBe('https://commoncents.fun');
  });

  it('exports GAME_NAME', () => {
    expect(GAME_NAME).toBe('Common Cents');
  });
});

describe('ogImageUrl', () => {
  it('returns base URL with no params', () => {
    expect(ogImageUrl()).toBe('https://commoncents.fun/api/og');
  });

  it('returns base URL with empty params', () => {
    expect(ogImageUrl({})).toBe('https://commoncents.fun/api/og');
  });

  it('adds list param', () => {
    expect(ogImageUrl({ list: 'highest-grossing-movies' })).toBe(
      'https://commoncents.fun/api/og?list=highest-grossing-movies'
    );
  });

  it('adds list and score params', () => {
    const url = ogImageUrl({ list: 'countries-by-gdp', score: 3847 });
    expect(url).toBe('https://commoncents.fun/api/og?list=countries-by-gdp&score=3847');
  });

  it('ignores score without list', () => {
    expect(ogImageUrl({ score: 100 })).toBe('https://commoncents.fun/api/og');
  });
});
