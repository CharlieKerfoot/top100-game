import type { GameList } from './types';
import { highestGrossingAnimatedMoviesHints } from './hints';

// Source: Wikipedia "List of highest-grossing animated films" (data from Box Office Mojo / IMDb Pro)
// As of April 2025
export const highestGrossingAnimatedMovies: GameList = {
  id: 'highest-grossing-animated-movies',
  name: 'Highest Grossing Animated Movies',
  description: 'Animated films ranked by all-time worldwide box office gross (Box Office Mojo)',
  topics: ['film & tv'],
  hints: highestGrossingAnimatedMoviesHints,
  valueLabel: 'Box Office',
  size: 50,
  items: [
    "Ne Zha 2", "Zootopia 2", "Inside Out 2", "The Lion King", "Frozen II",
    "The Super Mario Bros. Movie", "Frozen", "Incredibles 2", "Minions", "Toy Story 4",
    "Toy Story 3", "Moana 2", "Despicable Me 3", "Finding Dory", "Zootopia",
    "Despicable Me 4", "Despicable Me 2", "The Lion King (1994)", "Finding Nemo", "Minions: The Rise of Gru",
    "Shrek 2", "Ice Age: Dawn of the Dinosaurs", "Ice Age: Continental Drift", "The Secret Life of Pets", "Inside Out",
    "Coco", "Shrek the Third", "Demon Slayer: Infinity Castle", "Shrek Forever After", "Madagascar 3: Europe's Most Wanted",
    "Monsters University", "Ne Zha", "Up", "Mufasa: The Lion King", "Spider-Man: Across the Spider-Verse",
    "Ice Age: The Meltdown", "Kung Fu Panda 2", "Big Hero 6", "Moana", "Sing",
    "Kung Fu Panda", "The Incredibles", "The Super Mario Galaxy Movie", "Ratatouille", "How to Train Your Dragon 2",
    "Madagascar: Escape 2 Africa", "Tangled", "The Croods", "Monsters, Inc.", "Cars 2",
  ],
  values: [
    "$2.27B", "$1.87B", "$1.70B", "$1.66B", "$1.45B",
    "$1.36B", "$1.29B", "$1.24B", "$1.16B", "$1.07B",
    "$1.07B", "$1.06B", "$1.03B", "$1.03B", "$1.03B",
    "$972M", "$971M", "$971M", "$942M", "$940M",
    "$933M", "$887M", "$877M", "$876M", "$859M",
    "$815M", "$813M", "$800M", "$753M", "$747M",
    "$744M", "$743M", "$735M", "$722M", "$691M",
    "$667M", "$666M", "$658M", "$643M", "$634M",
    "$632M", "$632M", "$629M", "$624M", "$622M",
    "$604M", "$592M", "$587M", "$580M", "$560M",
  ],
};
