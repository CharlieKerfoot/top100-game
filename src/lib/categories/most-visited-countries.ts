import type { Category } from './types';
import { mostVisitedCountriesHints } from './hints';

export const mostVisitedCountries: Category = {
  id: 'most-visited-countries',
  name: 'Most Visited Countries by Tourists',
  description: 'Countries ranked by international tourist arrivals (2024)',
  tags: ['geography', 'world', 'travel'],
  hints: mostVisitedCountriesHints,
  items: [
    "France", "Spain", "United States", "Italy", "Turkey",
    "Mexico", "United Kingdom", "Germany", "Japan", "Austria",
    "Saudi Arabia", "Portugal", "Malaysia", "Thailand", "China",
    "Hong Kong", "Netherlands", "Canada", "Poland", "Vietnam",
    "Morocco", "South Korea", "Macau", "Egypt", "Indonesia",
    "Romania", "Bulgaria", "Hungary", "Singapore", "Albania",
    "Czechia", "Kazakhstan", "Tunisia", "India", "Belgium",
    "Ireland", "South Africa", "Dominican Republic", "Uzbekistan", "Taiwan",
    "Sweden", "Brazil", "Cambodia", "Bahrain", "Argentina",
    "Norway", "Philippines", "Puerto Rico", "Australia", "Chile",
    "Colombia", "Jordan", "Qatar", "Georgia", "Denmark",
    "Switzerland", "Finland", "New Zealand", "Cuba", "Jamaica",
    "Iceland", "Cyprus", "Greece", "Croatia", "Israel",
    "Oman", "Azerbaijan", "Peru", "Kenya", "Sri Lanka",
    "Maldives", "Nepal", "Armenia", "Tanzania", "Ecuador",
    "Uruguay", "Costa Rica", "Bolivia", "Guatemala", "Panama",
    "El Salvador", "Honduras", "Nicaragua", "Paraguay", "Pakistan",
    "Bangladesh", "Uganda", "Zimbabwe", "Zambia", "Mauritius",
    "Ethiopia", "Myanmar", "Bhutan", "Seychelles", "Fiji",
    "Papua New Guinea", "Belize", "Namibia", "Laos", "Montenegro",
  ],
};
