// ============================================================
// LIST REGISTRY
// ============================================================
// To add a new list:
//   1. Create a new file in this folder (e.g. my-list.ts)
//   2. Export a GameList object (see types.ts for the interface)
//   3. Import it below and add it to the `lists` array
//
// Each list needs:
//   - id:          unique kebab-case identifier
//   - name:        display name
//   - description: short one-liner shown in the picker
//   - topics:      array of lowercase topics for filtering
//   - items:       ranked strings, #1 to #N (100 by default, or set size: 50)
// ============================================================

export type { GameList } from './types';

import { mostPopulousCountries } from './most-populous-countries';
import { highestGrossingMovies } from './highest-grossing-movies';
import { mostStreamedSongs } from './most-streamed-songs';
import { largestCities } from './largest-cities';
import { mostFollowedInstagram } from './most-followed-instagram';
import { bestSellingVideoGames } from './best-selling-video-games';
import { mostSubscribedYoutube } from './most-subscribed-youtube';
import { mostFollowedTwitter } from './most-followed-twitter';
import { mostStreamedSpotifyArtists } from './most-streamed-spotify-artists';
import { bestSellingBooks } from './best-selling-books';
import { forbesBillionaires } from './forbes-billionaires';
import { mostVisitedCountries } from './most-visited-countries';
import { sportsTeamsByRevenue } from './sports-teams-by-revenue';
import { nbaCareerPoints } from './nba-career-points';
import { nbaCareerMinutes } from './nba-career-minutes';
import { mlbCareerWar } from './mlb-career-war';
import { mlbBattersWar } from './mlb-batters-war';
import { mlbPitchersWar } from './mlb-pitchers-war';
import { mlbCareerHomeRuns } from './mlb-career-home-runs';
import { mlbPitchersStrikeouts } from './mlb-pitchers-strikeouts';
import { nflCareerPpr } from './nfl-career-ppr';
import { nflCareerPassingYards } from './nfl-career-passing-yards';
import { nflCareerRushingYards } from './nfl-career-rushing-yards';
import { nflCareerReceivingYards } from './nfl-career-receiving-yards';
import { nflCareerTouchdowns } from './nfl-career-touchdowns';
import { highestGrossingTvShows } from './highest-grossing-tv-shows';
import { companyValuation } from './company-valuation';
import { usnewsCollegeRankings } from './usnews-college-rankings';
import { largestCollegePopulations } from './largest-college-populations';
import { popularMaleNames } from './popular-male-names';
import { popularFemaleNames } from './popular-female-names';
import { mostPopulousCitiesUsa } from './most-populous-cities-usa';
import { mostUsedEnglishWords } from './most-used-english-words';
import { countriesOlympicMedals } from './countries-olympic-medals';
import { countriesByGdp } from './countries-by-gdp';
import { countriesByLiteracyRate } from './countries-by-literacy-rate';
import { countriesByPovertyRate } from './countries-by-poverty-rate';
import { countriesColdest } from './countries-coldest';
import { countriesHottest } from './countries-hottest';
import { mostVisitedWebsites } from './most-visited-websites';
import { oscarNominations } from './oscar-nominations';
import { highestBudgetMovies } from './highest-budget-movies';
import { actorsBoxOffice } from './actors-box-office';
import { directorsBoxOffice } from './directors-box-office';
import { grammyAwards } from './grammy-awards';
import { usCitiesCostOfLiving } from './us-cities-cost-of-living';
import { mostWatchedAnime } from './most-watched-anime';
import { largestGreekOrganizations } from './largest-greek-organizations';
import { elementsEarthsCrust } from './elements-earths-crust';
import { countriesByArea } from './countries-by-area';
import { usSurnames } from './us-surnames';
import { mostTranslatedBooks } from './most-translated-books';
import { tallestMountains } from './tallest-mountains';
import { globalCitiesCostOfLiving } from './global-cities-cost-of-living';
import { safestCitiesUsa } from './safest-cities-usa';
import { highestGrossingAnimatedMovies } from './highest-grossing-animated-movies';
import { largestFastFoodChains } from './largest-fast-food-chains';
import { longestRunningTvSeries } from './longest-running-tv-series';
import { mostVisitedNationalParks } from './most-visited-national-parks';
import { longestRivers } from './longest-rivers';
import { mostCommonPasswords } from './most-common-passwords';
import { sportingEventsAttendance } from './sporting-events-attendance';
import { mostDownloadedMobileApps } from './most-downloaded-mobile-apps';
import { qsWorldUniversityRankings } from './qs-world-university-rankings';
import { longestChartingHot100 } from './longest-charting-hot100';
import { sportsBySale } from './sports-cards-by-sale';
import { mostViewedYoutubeMusicVideos } from './most-viewed-youtube-music-videos';
import { countriesByLifeExpectancy } from './countries-by-life-expectancy';
import { countriesByHappiness } from './countries-by-happiness';
import { bestSellingAlbums } from './best-selling-albums';
import { imdbTopMovies } from './imdb-top-movies';
import { imdbTopTvShows } from './imdb-top-tv-shows';
import { highestGrossingFranchises } from './highest-grossing-franchises';
import { mostConsumedBeverages } from './most-consumed-beverages';
import { mostVisitedWikipedia } from './most-visited-wikipedia';
import { highestPaidAthletes } from './highest-paid-athletes';
import { mostCitedScientificPapers } from './most-cited-scientific-papers';
import { akcPopularDogBreeds } from './akc-popular-dog-breeds';
import { bestSellingToys } from './best-selling-toys';
import { longestRunningBroadwayShows } from './longest-running-broadway-shows';
import { mostVisitedMuseums } from './most-visited-museums';
import { mostSpokenLanguages } from './most-spoken-languages';
import { mostExpensivePaintings } from './most-expensive-paintings';
import { bestSellingCandy } from './best-selling-candy';
import { bestSellingCarsUsa } from './best-selling-cars-usa';
import { mostPopularPodcasts } from './most-popular-podcasts';
import { tallestBuildings } from './tallest-buildings';
import { fastestAnimals } from './fastest-animals';
import { bestDishesWorld } from './best-dishes-world';
import { bestCuisinesWorld } from './best-cuisines-world';
import { mostPopularMedications } from './most-popular-medications';
import { mostCommonJobs } from './most-common-jobs';
import { mostPopularSubreddits } from './most-popular-subreddits';
import { mostCommonPhobias } from './most-common-phobias';
import { mostDangerousJobs } from './most-dangerous-jobs';
import { highestPayingMajors } from './highest-paying-majors';
import { ufcCareerWins } from './ufc-career-wins';
import { ufcCareerLosses } from './ufc-career-losses';
import { ufcCareerSigStrikes } from './ufc-career-sig-strikes';
import { ufcCareerTakedowns } from './ufc-career-takedowns';
import { ufcCareerFights } from './ufc-career-fights';
import { ufcCareerFinishes } from './ufc-career-finishes';
import { nhlCareerPoints } from './nhl-career-points';
import { nhlCareerGoals } from './nhl-career-goals';
import { stadiumCapacity } from './stadium-capacity';
import { f1CareerPodiums } from './f1-career-podiums';
import { pgaTourWins } from './pga-tour-wins';
import { tennisCareerTitles } from './tennis-career-titles';
import { marchMadnessWins } from './march-madness-wins';
import { cfbCareerWins } from './cfb-career-wins';
import { cfbNflDrafts } from './cfb-nfl-drafts';

import type { GameList } from './types';

export const lists: GameList[] = [
  mostPopulousCountries,
  highestGrossingMovies,
  mostStreamedSongs,
  largestCities,
  mostFollowedInstagram,
  bestSellingVideoGames,
  mostSubscribedYoutube,
  mostFollowedTwitter,
  mostStreamedSpotifyArtists,
  bestSellingBooks,
  forbesBillionaires,
  mostVisitedCountries,
  sportsTeamsByRevenue,
  nbaCareerPoints,
  nbaCareerMinutes,
  mlbCareerWar,
  mlbBattersWar,
  mlbPitchersWar,
  mlbCareerHomeRuns,
  mlbPitchersStrikeouts,
  nflCareerPpr,
  nflCareerPassingYards,
  nflCareerRushingYards,
  nflCareerReceivingYards,
  nflCareerTouchdowns,
  highestGrossingTvShows,
  companyValuation,
  usnewsCollegeRankings,
  largestCollegePopulations,
  popularMaleNames,
  popularFemaleNames,
  mostPopulousCitiesUsa,
  mostUsedEnglishWords,
  countriesOlympicMedals,
  countriesByGdp,
  countriesByLiteracyRate,
  countriesByPovertyRate,
  countriesColdest,
  countriesHottest,
  mostVisitedWebsites,
  oscarNominations,
  highestBudgetMovies,
  actorsBoxOffice,
  directorsBoxOffice,
  grammyAwards,
  usCitiesCostOfLiving,
  mostWatchedAnime,
  largestGreekOrganizations,
  elementsEarthsCrust,
  countriesByArea,
  usSurnames,
  mostTranslatedBooks,
  tallestMountains,
  globalCitiesCostOfLiving,
  safestCitiesUsa,
  highestGrossingAnimatedMovies,
  largestFastFoodChains,
  longestRunningTvSeries,
  mostVisitedNationalParks,
  longestRivers,
  mostCommonPasswords,
  sportingEventsAttendance,
  mostDownloadedMobileApps,
  qsWorldUniversityRankings,
  longestChartingHot100,
  sportsBySale,
  mostViewedYoutubeMusicVideos,
  countriesByLifeExpectancy,
  countriesByHappiness,
  bestSellingAlbums,
  imdbTopMovies,
  imdbTopTvShows,
  highestGrossingFranchises,
  mostConsumedBeverages,
  mostVisitedWikipedia,
  highestPaidAthletes,
  mostCitedScientificPapers,
  akcPopularDogBreeds,
  bestSellingToys,
  longestRunningBroadwayShows,
  mostVisitedMuseums,
  mostSpokenLanguages,
  mostExpensivePaintings,
  bestSellingCandy,
  bestSellingCarsUsa,
  mostPopularPodcasts,
  tallestBuildings,
  fastestAnimals,
  bestDishesWorld,
  bestCuisinesWorld,
  mostPopularMedications,
  mostCommonJobs,
  mostPopularSubreddits,
  mostCommonPhobias,
  mostDangerousJobs,
  highestPayingMajors,
  ufcCareerWins,
  ufcCareerLosses,
  ufcCareerSigStrikes,
  ufcCareerTakedowns,
  ufcCareerFights,
  ufcCareerFinishes,
  nhlCareerPoints,
  nhlCareerGoals,
  stadiumCapacity,
  f1CareerPodiums,
  pgaTourWins,
  tennisCareerTitles,
  marchMadnessWins,
  cfbCareerWins,
  cfbNflDrafts,
];

/** Returns the effective topics for a list, including "new" if within the newUntil date and "top 50" if size is 50. */
export function getEffectiveTopics(list: GameList): string[] {
  const topics = [...list.topics];
  const now = new Date();
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (list.newUntil && localDate <= list.newUntil) {
    topics.unshift('new');
  }
  if (list.size === 50) {
    topics.push('top 50');
  }
  return topics;
}

/** Number of ranked items in a list (50 or 100). */
export function getListSize(list: GameList): number {
  return list.size ?? 100;
}

/** Maximum possible score for a list: sum of 1..N. */
export function getMaxScore(list: GameList): number {
  const n = getListSize(list);
  return (n * (n + 1)) / 2;
}

/** Topics for the filter bar. Excludes meta-topics like "new" but includes "top 50". */
export function getAllTopics(): string[] {
  const topicSet = new Set<string>();
  for (const list of lists) {
    for (const topic of getEffectiveTopics(list)) {
      topicSet.add(topic);
    }
  }
  topicSet.delete('new');
  return [...topicSet].sort();
}

// Hand-picked featured lists spanning diverse topics
const featuredIds = [
  'most-populous-countries',    // geography
  'highest-grossing-movies',    // entertainment
  'most-streamed-songs',        // music
  'forbes-billionaires',        // business
  'best-selling-video-games',   // gaming
  'most-followed-instagram',    // social media
  'best-selling-books',         // literature
  'most-visited-countries',     // travel
  'most-subscribed-youtube',    // tech/social
];

export function getFeaturedLists(): GameList[] {
  return featuredIds
    .map(id => lists.find(c => c.id === id))
    .filter((c): c is GameList => c !== undefined);
}

export function searchLists(query: string, activeTopic: string | null): GameList[] {
  let filtered = lists;

  if (activeTopic) {
    filtered = filtered.filter(c => getEffectiveTopics(c).includes(activeTopic));
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      getEffectiveTopics(c).some(t => t.includes(q))
    );
  }

  return filtered.sort((a, b) => a.name.localeCompare(b.name));
}
