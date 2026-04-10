import type { Category } from './types';
import { mostPopulousCountriesHints } from './hints';

export const mostPopulousCountries: Category = {
  id: 'most-populous-countries',
  name: 'Most Populous Countries',
  description: 'Countries by population (2024)',
  tags: ['geography', 'world'],
  hints: mostPopulousCountriesHints,
  items: [
    "India", "China", "United States", "Indonesia", "Pakistan",
    "Nigeria", "Brazil", "Bangladesh", "Russia", "Ethiopia",
    "Mexico", "Japan", "Philippines", "Egypt", "DR Congo",
    "Vietnam", "Iran", "Turkey", "Germany", "Thailand",
    "United Kingdom", "France", "Tanzania", "South Africa", "Italy",
    "Kenya", "Myanmar", "Colombia", "South Korea", "Sudan",
    "Uganda", "Spain", "Argentina", "Algeria", "Iraq",
    "Afghanistan", "Poland", "Canada", "Morocco", "Saudi Arabia",
    "Ukraine", "Uzbekistan", "Angola", "Peru", "Malaysia",
    "Mozambique", "Ghana", "Yemen", "Nepal", "Venezuela",
    "Madagascar", "Ivory Coast", "Cameroon", "Australia", "Niger",
    "North Korea", "Taiwan", "Mali", "Sri Lanka", "Burkina Faso",
    "Malawi", "Syria", "Chile", "Kazakhstan", "Zambia",
    "Romania", "Guatemala", "Ecuador", "Senegal", "Netherlands",
    "Chad", "Somalia", "Zimbabwe", "Cambodia", "Guinea",
    "Rwanda", "Benin", "Burundi", "Tunisia", "Bolivia",
    "Belgium", "Cuba", "South Sudan", "Haiti", "Dominican Republic",
    "Czech Republic", "Jordan", "Sweden", "Portugal", "Azerbaijan",
    "Greece", "Hungary", "Honduras", "Tajikistan", "United Arab Emirates",
    "Belarus", "Papua New Guinea", "Israel", "Austria", "Switzerland"
  ]
};
