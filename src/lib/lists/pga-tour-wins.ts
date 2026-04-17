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
    "Tom Watson", "Gene Sarazen", "Lloyd Mangrum", "Horton Smith", "Vijay Singh",
    "Harry Cooper", "Jimmy Demaret", "Leo Diegel", "Gene Littler", "Paul Runyan",
    "Lee Trevino", "Henry Picard", "Tommy Armour", "Macdonald Smith", "Johnny Miller",
    "Dutch Harrison", "Doug Ford", "Gary Player", "Hale Irwin", "Nick Price",
    "Raymond Floyd", "Lanny Wadkins", "Scottie Scheffler", "Rory McIlroy", "Davis Love III",
    "Greg Norman", "Fred Couples", "David Duval", "Curtis Strange", "Ben Crenshaw",
    "Hubert Green", "Tom Kite", "Jim Furyk", "Justin Thomas", "Dustin Johnson",
    "Jordan Spieth", "Brooks Koepka", "Adam Scott", "Jon Rahm", "Bruce Crampton",
  ],
  values: [
    "82", "82", "73", "64", "62",
    "52", "51", "45", "45", "40",
    "39", "39", "36", "32", "34",
    "31", "31", "30", "29", "29",
    "29", "26", "25", "24", "25",
    "24", "24", "24", "20", "18",
    "22", "21", "16", "32", "21",
    "20", "15", "13", "17", "19",
    "19", "19", "17", "16", "14",
    "13", "11", "14", "13", "14",
  ],
};
