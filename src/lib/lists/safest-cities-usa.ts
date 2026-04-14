import type { GameList } from './types';
import { safestCitiesUsaHints } from './hints';

// Source: NeighborhoodScout's Safest Cities in America (2023 edition)
// Data: FBI UCR Uniform Crime Reporting, calendar year 2021 (released October 2022)
// Metric: Total crimes (violent + property) per 1,000 residents
// Eligibility: Cities with 25,000+ population; townships with own police dept also eligible
// Violent crimes counted: murder, rape, armed robbery, aggravated assault
// Property crimes counted: burglary, larceny-theft, motor vehicle theft

export const safestCitiesUsa: GameList = {
  id: 'safest-cities-usa',
  name: 'Safest Cities in the US',
  description: 'US cities ranked by lowest total crime rate per 1,000 residents (NeighborhoodScout 2023 / FBI UCR 2021)',
  topics: ['geography', 'misc'],
  hints: safestCitiesUsaHints,
  valueLabel: 'Crimes per 1K',
  items: [
    "Ridgefield, CT", "Franklin, MA", "Lake in the Hills, IL", "Marshfield, MA", "Arlington, MA",
    "Zionsville, IN", "Fulshear, TX", "Muskego, WI", "Lexington, MA", "Rexburg, ID",
    "Independence, KY", "Milton, MA", "Oswego, IL", "Needham, MA", "White Lake, MI",
    "Avon Lake, OH", "Windsor, CO", "Madison, MS", "Wakefield, MA", "South Kingstown, RI",
    "Colleyville, TX", "West Bloomfield, MI", "Johns Creek, GA", "Billerica, MA", "North Andover, MA",
    "Mason, OH", "Reading, MA", "Wellesley, MA", "Brandon, MS", "Mundelein, IL",
    "Cumberland, RI", "Andover, MA", "Edwardsville, IL", "Little Elm, TX", "Merrimack, NH",
    "Waltham, MA", "Commerce Township, MI", "Milton, GA", "Wylie, TX", "Melrose, MA",
    "Ballwin, MO", "Rochester Hills, MI", "Beverly, MA", "North Kingstown, RI", "Keller, TX",
    "Shrewsbury, MA", "Dracut, MA", "Prosper, TX", "Newton, MA", "McHenry, IL",
    "Friendswood, TX", "Fort Mill, SC", "Wallingford, CT", "Belmont, MA", "De Pere, WI",
    "Caledonia, WI", "Flower Mound, TX", "Highland Park, IL", "Easton, MA", "Hendersonville, TN",
    "Algonquin, IL", "Sachse, TX", "Carmel, IN", "Fishers, IN", "San Luis, AZ",
    "Lake Stevens, WA", "Perrysburg, OH", "Cheshire, CT", "Milford, MA", "Bella Vista, AR",
    "Princeton, NJ", "Saratoga Springs, UT", "Bluffton, SC", "Novi, MI", "Chelmsford, MA",
    "Amherst, MA", "Gloucester, MA", "Rosemount, MN", "Syracuse, UT", "Rahway, NJ",
    "Waukee, IA", "Mequon, WI", "Upper Arlington, OH", "Westfield, IN", "Montclair, NJ",
    "Spring Hill, TN", "Greenwich, CT", "Hutto, TX", "Wilmette, IL", "New Milford, CT",
    "Brownsburg, IN", "Vestavia Hills, AL", "Royal Oak, MI", "Hilliard, OH", "Derry, NH",
    "Dublin, OH", "Watertown, MA", "West Warwick, RI", "Kaysville, UT", "Walpole, MA",
  ],
  values: [
    "1.9", "2.9", "3.1", "3.3", "3.4",
    "3.6", "3.6", "3.7", "3.7", "3.9",
    "3.9", "4.2", "4.2", "4.2", "4.3",
    "4.3", "4.5", "4.5", "4.5", "4.7",
    "4.8", "4.9", "4.9", "5.1", "5.2",
    "5.2", "5.2", "5.2", "5.3", "5.3",
    "5.4", "5.4", "5.6", "5.6", "5.8",
    "5.9", "5.9", "5.9", "5.9", "6.1",
    "6.2", "6.2", "6.2", "6.2", "6.3",
    "6.4", "6.4", "6.4", "6.5", "6.5",
    "6.5", "6.6", "6.8", "6.9", "6.9",
    "6.9", "7.0", "7.1", "7.1", "7.2",
    "7.2", "7.2", "7.2", "7.3", "7.3",
    "7.4", "7.4", "7.4", "7.5", "7.5",
    "7.5", "7.5", "7.6", "7.6", "7.6",
    "7.7", "7.7", "7.7", "7.8", "7.9",
    "7.9", "7.9", "7.9", "7.9", "7.9",
    "7.9", "8.0", "8.0", "8.1", "8.1",
    "8.1", "8.1", "8.2", "8.2", "8.3",
    "8.3", "8.5", "8.5", "8.6", "8.6",
  ],
};
