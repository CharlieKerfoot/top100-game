export const SITE_URL = 'https://commoncents.fun';
export const GAME_NAME = 'Common Cents';
export const GAME_TAGLINE = 'The Top 100 Ranking Game';
export const DEFAULT_DESCRIPTION =
  'Name things from a Top 100 list. Harder answers score more. Play the daily challenge or compete with friends.';
export const KEYWORDS =
  'Common Cents game, top 100 game, top 100 quiz, ranking game, daily trivia game, Common Cents';

export function ogImageUrl(params?: { list?: string; score?: number; day?: number; percentile?: number }): string {
  const base = `${SITE_URL}/api/og`;
  if (!params?.list) return base;
  const qs = new URLSearchParams({ list: params.list });
  if (params.score !== undefined) qs.set('score', String(params.score));
  if (params.day !== undefined) qs.set('day', String(params.day));
  if (params.percentile !== undefined) qs.set('percentile', String(params.percentile));
  return `${base}?${qs}`;
}
