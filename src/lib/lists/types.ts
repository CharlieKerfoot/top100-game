export interface GameList {
  id: string;
  name: string;
  description: string;
  topics: string[];
  items: string[];
  hints?: string[];
  values?: string[];
  valueLabel?: string;
  /** Number of items in this list (defaults to 100). Use 50 for "top 50" lists. */
  size?: number;
  /** ISO date (YYYY-MM-DD). If today <= this date, a "new" topic is shown on the list. */
  newUntil?: string;
  /** Maps alternate accepted names to canonical item names. e.g. { "APhi": "Alpha Phi" } */
  aliases?: Record<string, string>;
  /** Difficulty rating: 1 = easy (well-known topics), 2 = medium, 3 = hard (niche/obscure). */
  difficulty?: 1 | 2 | 3;
}
