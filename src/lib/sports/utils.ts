// ============================================================
// SPORTS DATABASE UTILITIES
// ============================================================
// top100By   — sort a player array by a numeric field and
//              return the top 100 names as a string array
// allNames   — return every player name from a database as
//              the hints array for autocomplete
// formatStat — format a raw number for display as a value label
// ============================================================

/**
 * Sort players by the given numeric key and return the top 100 names.
 */
export function top100By<T extends Record<string, unknown>>(
  players: T[],
  key: keyof T
): string[] {
  return [...players]
    .filter(p => typeof p[key] === 'number' && (p[key] as number) > 0)
    .sort((a, b) => (b[key] as number) - (a[key] as number))
    .slice(0, 100)
    .map(p => p.name as string);
}

/**
 * Return all player names for use as autocomplete hints.
 */
export function allNames<T extends { name: string }>(players: T[]): string[] {
  return players.map(p => p.name);
}

/**
 * Sort players by the given key and return the top 100 formatted stat values.
 * Used to populate the `values` array on a GameList.
 */
export function top100Values<T extends Record<string, unknown>>(
  players: T[],
  key: keyof T,
  formatter: (n: number) => string = String
): string[] {
  return [...players]
    .filter(p => typeof p[key] === 'number' && (p[key] as number) > 0)
    .sort((a, b) => (b[key] as number) - (a[key] as number))
    .slice(0, 100)
    .map(p => formatter(p[key] as number));
}
