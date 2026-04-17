import type { GameList } from './types';
import { ufcFighters } from './ufc-fighter-stats';
import { ufcFightersHints } from './hints/ufc-fighters';

const sorted = [...ufcFighters]
  .sort((a, b) => b.losses - a.losses || b.fights - a.fights || a.name.localeCompare(b.name))
  .slice(0, 100);

export const ufcCareerLosses: GameList = {
  id: 'ufc-career-losses',
  name: 'UFC Fighters by All-Time Career UFC Losses',
  description: 'UFC fighters ranked by total career UFC losses (UFCStats.com)',
  topics: ['sports'],
  difficulty: 3,
  hints: ufcFightersHints,
  valueLabel: 'UFC Losses',
  items: sorted.map(f => f.name),
  values: sorted.map(f => String(f.losses)),
};
