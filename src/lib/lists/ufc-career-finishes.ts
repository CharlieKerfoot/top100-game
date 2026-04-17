import type { GameList } from './types';
import { ufcFighters } from './ufc-fighter-stats';
import { ufcFightersHints } from './hints/ufc-fighters';

const sorted = [...ufcFighters]
  .sort((a, b) => b.finishes - a.finishes || b.fights - a.fights || a.name.localeCompare(b.name))
  .slice(0, 100);

export const ufcCareerFinishes: GameList = {
  id: 'ufc-career-finishes',
  name: 'UFC Fighters by All-Time Career UFC Finishes',
  description: 'UFC fighters ranked by career UFC finishes (KO/TKO + submission wins)',
  topics: ['sports'],
  difficulty: 3,
  hints: ufcFightersHints,
  valueLabel: 'UFC Finishes',
  items: sorted.map(f => f.name),
  values: sorted.map(f => String(f.finishes)),
};
