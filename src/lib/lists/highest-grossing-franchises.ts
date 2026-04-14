import type { GameList } from './types';
import { highestGrossingFranchisesHints } from './hints/highest-grossing-franchises';

export const highestGrossingFranchises: GameList = {
  id: 'highest-grossing-franchises',
  name: 'Highest-Grossing Film Franchises',
  description: 'Film franchises ranked by combined worldwide box office (Box Office Mojo / Wikipedia)',
  topics: ['film & tv', 'money'],
  size: 50,
  hints: highestGrossingFranchisesHints,
  valueLabel: 'Box Office',
  items: [
    "Marvel Cinematic Universe", "Spider-Man", "Star Wars", "Wizarding World", "James Bond",
    "Avengers", "X-Men", "Fast & Furious", "DC Extended Universe", "Batman",
    "Jurassic Park", "Avatar", "Middle-earth", "Despicable Me", "Transformers",
    "Mission: Impossible", "Pirates of the Caribbean", "Shrek", "The Twilight Saga", "The Lion King",
    "The Hunger Games", "Toy Story", "Ice Age", "Superman", "Zootopia",
    "Star Trek", "Kung Fu Panda", "Thor", "Inside Out", "Guardians of the Galaxy",
    "Godzilla", "Madagascar", "Indiana Jones", "Captain America", "How to Train Your Dragon",
    "Iron Man", "Black Panther", "Terminator", "The Conjuring Universe", "Planet of the Apes",
    "Jumanji", "MonsterVerse", "Men in Black", "Rocky", "Finding Nemo",
    "The Matrix", "Cars", "Bourne", "The Incredibles", "Aladdin",
  ],
  values: [
    "$32.5B", "$11.2B", "$10.4B", "$9.7B", "$7.8B",
    "$7.8B", "$7.4B", "$7.3B", "$7.2B", "$7.1B",
    "$6.9B", "$6.7B", "$6.0B", "$5.6B", "$5.4B",
    "$4.7B", "$4.5B", "$4.0B", "$3.4B", "$3.4B",
    "$3.3B", "$3.3B", "$3.2B", "$3.1B", "$2.8B",
    "$2.3B", "$2.3B", "$2.7B", "$2.5B", "$2.5B",
    "$2.5B", "$2.3B", "$2.2B", "$2.2B", "$2.2B",
    "$2.4B", "$2.2B", "$2.1B", "$2.1B", "$2.1B",
    "$2.1B", "$2.0B", "$1.9B", "$1.9B", "$2.0B",
    "$1.8B", "$1.8B", "$1.7B", "$1.9B", "$1.6B",
  ],
  newUntil: '2026-05-14',
};
