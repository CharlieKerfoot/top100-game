import type { Category } from './types';
import { nbaCareerPointsHints } from './hints';

export const nbaCareerPoints: Category = {
  id: 'nba-career-points',
  name: 'NBA All-Time Points Leaders',
  description: 'NBA players ranked by all-time career regular season points',
  tags: ['sports', 'basketball'],
  hints: nbaCareerPointsHints,
  items: [
    "LeBron James", "Kareem Abdul-Jabbar", "Karl Malone", "Kobe Bryant", "Kevin Durant",
    "Michael Jordan", "Dirk Nowitzki", "Wilt Chamberlain", "Julius Erving", "Moses Malone",
    "James Harden", "Shaquille O'Neal", "Carmelo Anthony", "Dan Issel", "Elvin Hayes",
    "Russell Westbrook", "Hakeem Olajuwon", "DeMar DeRozan", "Oscar Robertson", "Dominique Wilkins",
    "George Gervin", "Tim Duncan", "Stephen Curry", "Paul Pierce", "John Havlicek",
    "Kevin Garnett", "Vince Carter", "Alex English", "Rick Barry", "Reggie Miller",
    "Jerry West", "Artis Gilmore", "Patrick Ewing", "Ray Allen", "Allen Iverson",
    "Charles Barkley", "Robert Parish", "Adrian Dantley", "Dwyane Wade", "Elgin Baylor",
    "Chris Paul", "Damian Lillard", "Clyde Drexler", "Gary Payton", "Larry Bird",
    "Hal Greer", "Giannis Antetokounmpo", "Walt Bellamy", "Pau Gasol", "Bob Pettit",
    "David Robinson", "LaMarcus Aldridge", "Mitch Richmond", "Joe Johnson", "Tom Chambers",
    "Antawn Jamison", "John Stockton", "Bernard King", "Clifford Robinson", "Walter Davis",
    "Dwight Howard", "Tony Parker", "Terry Cummings", "Jamal Crawford", "Anthony Davis",
    "Paul George", "Bob Lanier", "Eddie Johnson", "Gail Goodrich", "Reggie Theus",
    "Dale Ellis", "Scottie Pippen", "Jason Terry", "Chet Walker", "Isiah Thomas",
    "Bob McAdoo", "Zach Randolph", "Mark Aguirre", "Dolph Schayes", "Kyrie Irving",
    "Tracy McGrady", "Glen Rice", "Dave Bing", "Brook Lopez", "Devin Booker",
    "Nikola Jokic", "World B. Free", "Calvin Murphy", "Lou Hudson", "Chris Mullin",
    "Lenny Wilkens", "Bailey Howell", "Magic Johnson", "Shawn Marion", "Nikola Vucevic",
    "Rudy Gay", "Rolando Blackman", "Otis Thorpe", "Jason Kidd", "Earl Monroe",
  ]
};
