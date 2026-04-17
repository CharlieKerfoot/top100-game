// Source: Wikipedia "List of the largest fast food restaurant chains"
// Data: 2024–2025 figures (mix of years per chain; see Wikipedia for per-chain year)
import type { GameList } from './types';
import { largestFastFoodChainsHints } from './hints/largest-fast-food-chains';

export const largestFastFoodChains: GameList = {
  id: 'largest-fast-food-chains',
  name: 'Largest Fast Food Chains',
  description: 'Top 50 restaurant chains by total worldwide locations',
  topics: ['business', 'food'],
  difficulty: 1,
  hints: largestFastFoodChainsHints,
  valueLabel: 'Locations',
  size: 50,
  items: [
    "Mixue Ice Cream & Tea", "McDonald's", "Starbucks", "Subway", "KFC",
    "Luckin Coffee", "Domino's", "Wallace", "Burger King", "Pizza Hut",
    "Dunkin' Donuts", "Krispy Kreme", "Hunt Brothers Pizza", "Cotti Coffee", "Good me",
    "Tastien", "Auntea Jenny", "Taco Bell", "ChaPanda", "Baskin-Robbins",
    "Dairy Queen", "Wendy's", "Chagee", "Tianlala", "Tim Hortons",
    "Papa John's", "Little Caesars", "Costa Coffee", "Hey Tea", "Panera Bread",
    "Carl's Jr.", "Popeyes", "bbq Chicken", "Sonic Drive-In", "Arby's",
    "Chipotle", "Champion Pizza", "Chick-fil-A", "Jimmy John's", "Dicos",
    "Jersey Mike's", "Jack in the Box", "Greggs", "Panda Express", "Pelicana Chicken",
    "Sukiya", "Naixue", "Pala Hamburger", "Auntie Anne's", "Chester's",
  ],
  values: [
    "45,000+ locations", "41,822 locations", "40,199 locations", "37,000+ locations", "30,000+ locations",
    "22,340 locations", "20,591 locations", "20,065 locations", "19,384 locations", "19,000+ locations",
    "12,700 locations", "10,427 locations", "10,000+ locations", "10,000 locations", "9,675 locations",
    "9,600 locations", "9,367 locations", "8,218 locations", "8,016 locations", "7,800+ locations",
    "7,500+ locations", "7,166 locations", "6,000+ locations", "5,994 locations", "5,701 locations",
    "5,650 locations", "5,463 locations", "4,000 locations", "4,000 locations", "4,000 locations",
    "3,800+ locations", "3,705 locations", "3,500+ locations", "3,493 locations", "3,405+ locations",
    "2,962 locations", "2,945 locations", "2,700 locations", "2,600+ locations", "2,500 locations",
    "2,500 locations", "2,267 locations", "2,200 locations", "2,180+ locations", "2,000+ locations",
    "1,946 locations", "1,926 locations", "1,850 locations", "1,800+ locations", "1,800+ locations",
  ],
  aliases: {
    "Sonic": "Sonic Drive-In",
  },
};
