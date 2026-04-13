export interface GameList {
  id: string;
  name: string;
  description: string;
  topics: string[];
  items: string[];
  hints?: string[];
  values?: string[];
  valueLabel?: string;
}
