import type { GameList } from './types';
import { collegeTeamsHints } from './hints/college-teams';

export const marchMadnessWins: GameList = {
  id: 'march-madness-wins',
  name: 'College Basketball Teams by March Madness Wins',
  description: 'D1 college basketball programs ranked by all-time NCAA Tournament wins',
  topics: ['sports'],
  size: 50,
  difficulty: 3,
  hints: collegeTeamsHints,
  valueLabel: 'Tournament Wins',
  items: [
    "North Carolina", "Kentucky", "Duke", "Kansas", "UCLA",
    "Louisville", "Syracuse", "Michigan State", "Indiana", "Arkansas",
    "Villanova", "UConn", "Michigan", "Gonzaga", "Houston",
    "Ohio State", "Oklahoma", "Georgetown", "Cincinnati", "Illinois",
    "Arizona", "Notre Dame", "Wisconsin", "Florida", "Texas",
    "Memphis", "Iowa", "Purdue", "Oklahoma State", "Marquette",
    "LSU", "Maryland", "Providence", "West Virginia", "Oregon",
    "NC State", "Temple", "Virginia", "Utah", "Tennessee",
    "Saint Joseph's", "St. John's", "Wake Forest", "Xavier", "Butler",
    "Auburn", "Missouri", "VCU", "Dayton", "Alabama",
  ],
  values: [
    "134", "131", "119", "119", "106",
    "82", "79", "72", "69", "66",
    "65", "60", "58", "53", "55",
    "51", "54", "51", "51", "48",
    "54", "45", "44", "44", "42",
    "41", "40", "38", "38", "37",
    "36", "34", "33", "32", "32",
    "31", "30", "29", "28", "27",
    "26", "25", "25", "25", "24",
    "23", "23", "22", "22", "22",
  ],
};
