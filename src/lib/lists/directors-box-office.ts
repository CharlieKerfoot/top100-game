import type { GameList } from './types';
import { directorsBoxOfficeHints } from './hints';

export const directorsBoxOffice: GameList = {
  id: 'directors-box-office',
  name: 'Directors by Total Box Office Gross',
  description: 'Directors ranked by cumulative worldwide box office, all films (The Numbers)',
  topics: ['film & tv', 'business'],
  difficulty: 3,
  size: 50,
  hints: directorsBoxOfficeHints,
  valueLabel: 'Total Gross',
  items: [
    "Steven Spielberg", "Anthony Russo & Joe Russo", "Peter Jackson", "Michael Bay", "James Cameron",
    "David Yates", "Christopher Nolan", "Jon Favreau", "James Wan", "Joss Whedon",
    "Ridley Scott", "Tim Burton", "Ron Howard", "Robert Zemeckis", "Gore Verbinski",
    "Bryan Singer", "Zack Snyder", "Sam Raimi", "Taika Waititi", "Ryan Coogler",
    "Denis Villeneuve", "Jon Watts", "Chris Columbus", "Francis Lawrence", "Gary Ross",
    "Chloe Zhao", "Patty Jenkins", "Chad Stahelski", "Martin Scorsese", "Clint Eastwood",
    "George Lucas", "Roland Emmerich", "Brett Ratner", "Todd Phillips", "Matt Reeves",
    "Pete Docter", "Andrew Stanton", "Lee Unkrich", "Brad Bird", "Jennifer Lee",
    "Byron Howard", "Rich Moore", "Pierre Coffin", "Chris Renaud", "Kyle Balda",
    "Dean DeBlois", "Chris Sanders", "Carlos Saldanha", "Eric Darnell", "Tom McGrath",
  ],
  values: [
    "$10.6B", "$6.8B", "$6.5B", "$6.5B", "$6.4B",
    "$6.0B", "$5.8B", "$5.5B", "$5.4B", "$3.8B",
    "$5.0B", "$4.9B", "$4.6B", "$4.4B", "$4.2B",
    "$4.0B", "$3.9B", "$3.8B", "$3.7B", "$3.6B",
    "$3.5B", "$3.4B", "$3.3B", "$3.2B", "$3.1B",
    "$3.0B", "$2.9B", "$2.8B", "$2.8B", "$2.7B",
    "$2.7B", "$2.6B", "$2.6B", "$2.5B", "$2.5B",
    "$2.4B", "$2.3B", "$2.3B", "$2.2B", "$2.2B",
    "$2.1B", "$2.1B", "$2.0B", "$2.0B", "$1.9B",
    "$1.9B", "$1.8B", "$1.8B", "$1.7B", "$1.7B",
  ],
};
