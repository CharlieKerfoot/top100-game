import type { GameList } from './types';
import { pgaGolfersHints } from './hints/pga-golfers';

export const pgaTourWins: GameList = {
  id: 'pga-tour-wins',
  name: 'Golfers by All-Time PGA Tour Wins',
  description: 'Golfers ranked by career PGA Tour victories (official PGA Tour records)',
  topics: ['sports'],
  size: 50,
  difficulty: 3,
  hints: pgaGolfersHints,
  valueLabel: 'PGA Tour Wins',
  items: [
    "Sam Snead", "Tiger Woods", "Jack Nicklaus", "Ben Hogan", "Arnold Palmer",
    "Byron Nelson", "Billy Casper", "Walter Hagen", "Phil Mickelson", "Cary Middlecoff",
    "Tom Watson", "Gene Sarazen", "Lloyd Mangrum", "Vijay Singh", "Horton Smith",
    "Rory McIlroy", "Harry Cooper", "Jimmy Demaret", "Leo Diegel", "Gene Littler",
    "Paul Runyan", "Lee Trevino", "Henry Picard", "Tommy Armour", "Johnny Miller",
    "Macdonald Smith", "Dutch Harrison", "Doug Ford", "Gary Player", "Raymond Floyd",
    "Lanny Wadkins", "Davis Love III", "Hale Irwin", "Greg Norman", "Ben Crenshaw",
    "Hubert Green", "Tom Kite", "Nick Price", "Curtis Strange", "Jim Furyk",
    "Scottie Scheffler", "Justin Thomas", "Fred Couples", "Dustin Johnson", "Adam Scott",
    "Bruce Crampton", "David Duval", "Jordan Spieth", "Jon Rahm", "Brooks Koepka",
  ],
  values: [
    "82", "82", "73", "64", "62",
    "52", "51", "45", "45", "40",
    "39", "39", "36", "34", "32",
    "32", "31", "31", "30", "29",
    "29", "29", "26", "25", "25",
    "24", "24", "24", "24", "22",
    "21", "21", "20", "20", "19",
    "19", "19", "18", "17", "17",
    "16", "16", "15", "14", "14",
    "14", "13", "13", "13", "11",
  ],
};
