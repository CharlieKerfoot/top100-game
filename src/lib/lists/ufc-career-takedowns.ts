import type { GameList } from './types';
import { ufcFighters } from './ufc-fighter-stats';
import { ufcFightersHints } from './hints/ufc-fighters';

const sorted = [...ufcFighters]
  .sort((a, b) => b.takedowns - a.takedowns || b.fights - a.fights || a.name.localeCompare(b.name))
  .slice(0, 100);

export const ufcCareerTakedowns: GameList = {
  id: 'ufc-career-takedowns',
  name: 'UFC Fighters by All-Time Career Takedowns Landed',
  description: 'UFC fighters ranked by total career takedowns landed (UFCStats.com)',
  topics: ['sports'],
  difficulty: 3,
  hints: ufcFightersHints,
  valueLabel: 'Takedowns Landed',
  items: sorted.map(f => f.name),
  values: sorted.map(f => String(f.takedowns)),
};
