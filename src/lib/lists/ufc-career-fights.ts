import type { GameList } from './types';
import { ufcFighters } from './ufc-fighter-stats';
import { ufcFightersHints } from './hints/ufc-fighters';

const sorted = [...ufcFighters]
  .sort((a, b) => b.fights - a.fights || b.wins - a.wins || a.name.localeCompare(b.name))
  .slice(0, 100);

export const ufcCareerFights: GameList = {
  id: 'ufc-career-fights',
  name: 'UFC Fighters by All-Time Career UFC Fights',
  description: 'UFC fighters ranked by total career UFC fights (UFCStats.com)',
  topics: ['sports'],
  difficulty: 3,
  hints: ufcFightersHints,
  valueLabel: 'UFC Fights',
  items: sorted.map(f => f.name),
  values: sorted.map(f => String(f.fights)),
};
