import type { GameList } from './types';
import { tennisPlayersHints } from './hints/tennis-players';

export const tennisCareerTitles: GameList = {
  id: 'tennis-career-titles',
  name: "Men's Tennis Players by Career ATP Titles",
  description: "Men's tennis players ranked by career ATP Tour singles titles (Open Era)",
  topics: ['sports'],
  size: 50,
  difficulty: 3,
  hints: tennisPlayersHints,
  valueLabel: 'ATP Titles',
  items: [
    "Jimmy Connors", "Roger Federer", "Novak Djokovic", "Ivan Lendl", "Rafael Nadal",
    "John McEnroe", "Rod Laver", "Pete Sampras", "Bjorn Borg", "Guillermo Vilas",
    "Andre Agassi", "Ilie Nastase", "Boris Becker", "Thomas Muster", "Stefan Edberg",
    "Arthur Ashe", "John Newcombe", "Ken Rosewall", "Mats Wilander", "Stan Smith",
    "Andy Murray", "Lleyton Hewitt", "Michael Chang", "Andy Roddick", "Yevgeny Kafelnikov",
    "David Ferrer", "Goran Ivanisevic", "Marat Safin", "Carlos Moya", "Juan Carlos Ferrero",
    "Gustavo Kuerten", "Tomas Berdych", "Jim Courier", "Pat Rafter", "Jo-Wilfried Tsonga",
    "Tim Henman", "Richard Gasquet", "Nikolay Davydenko", "Carlos Alcaraz", "Daniil Medvedev",
    "Jannik Sinner", "Alexander Zverev", "Sebastien Grosjean", "Stefanos Tsitsipas", "Tommy Haas",
    "Juan Martin del Potro", "Brian Gottfried", "Vitas Gerulaitis", "Fernando Gonzalez", "Marin Cilic",
  ],
  values: [
    "109", "103", "100", "94", "92",
    "77", "72", "64", "64", "62",
    "60", "57", "49", "44", "42",
    "41", "37", "37", "33", "26",
    "46", "30", "34", "32", "26",
    "27", "22", "26", "20", "16",
    "20", "13", "23", "11", "18",
    "15", "16", "21", "22", "20",
    "24", "24", "10", "11", "15",
    "22", "25", "25", "11", "21",
  ],
};
