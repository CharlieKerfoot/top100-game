import type { GameList } from './types';
import { ufcFighters } from './ufc-fighter-stats';
import { ufcFightersHints } from './hints/ufc-fighters';

const sorted = [...ufcFighters]
  .sort((a, b) => b.wins - a.wins || b.fights - a.fights || a.name.localeCompare(b.name))
  .slice(0, 100);

export const ufcCareerWins: GameList = {
  id: 'ufc-career-wins',
  name: 'UFC Fighters by All-Time Career UFC Wins',
  description: 'UFC fighters ranked by total career UFC wins (UFCStats.com)',
  topics: ['sports'],
  difficulty: 3,
  hints: ufcFightersHints,
  valueLabel: 'UFC Wins',
  items: sorted.map(f => f.name),
  values: sorted.map(f => String(f.wins)),
};
