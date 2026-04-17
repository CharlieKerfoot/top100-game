import type { GameList } from './types';
import { ufcFighters } from './ufc-fighter-stats';
import { ufcFightersHints } from './hints/ufc-fighters';

const sorted = [...ufcFighters]
  .sort((a, b) => b.sigStrikes - a.sigStrikes || b.fights - a.fights || a.name.localeCompare(b.name))
  .slice(0, 100);

export const ufcCareerSigStrikes: GameList = {
  id: 'ufc-career-sig-strikes',
  name: 'UFC Fighters by All-Time Career Significant Strikes Landed',
  description: 'UFC fighters ranked by total career significant strikes landed (UFCStats.com)',
  topics: ['sports'],
  difficulty: 3,
  hints: ufcFightersHints,
  valueLabel: 'Sig. Strikes Landed',
  items: sorted.map(f => f.name),
  values: sorted.map(f => String(f.sigStrikes)),
};
