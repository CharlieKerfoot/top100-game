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
    "Andre Agassi", "Ilie Nastase", "Boris Becker", "Andy Murray", "Thomas Muster",
    "Stefan Edberg", "Arthur Ashe", "John Newcombe", "Ken Rosewall", "Michael Chang",
    "Mats Wilander", "Andy Roddick", "Lleyton Hewitt", "David Ferrer", "Stan Smith",
    "Yevgeny Kafelnikov", "Marat Safin", "Brian Gottfried", "Vitas Gerulaitis", "Jannik Sinner",
    "Alexander Zverev", "Jim Courier", "Goran Ivanisevic", "Carlos Alcaraz", "Juan Martin del Potro",
    "Nikolay Davydenko", "Marin Cilic", "Carlos Moya", "Gustavo Kuerten", "Daniil Medvedev",
    "Jo-Wilfried Tsonga", "Juan Carlos Ferrero", "Richard Gasquet", "Tim Henman", "Tommy Haas",
    "Tomas Berdych", "Pat Rafter", "Stefanos Tsitsipas", "Fernando Gonzalez", "Sebastien Grosjean",
  ],
  values: [
    "109", "103", "100", "94", "92",
    "77", "72", "64", "64", "62",
    "60", "57", "49", "46", "44",
    "42", "41", "37", "37", "34",
    "33", "32", "30", "27", "26",
    "26", "26", "25", "25", "24",
    "24", "23", "22", "22", "22",
    "21", "21", "20", "20", "20",
    "18", "16", "16", "15", "15",
    "13", "11", "11", "11", "10",
  ],
};
