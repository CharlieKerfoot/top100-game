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
import { mlbCareerWar } from './mlb-career-war';
import { nflCareerPpr } from './nfl-career-ppr';
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
  mlbCareerWar,
  nflCareerPpr,
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
];

/** Returns the effective topics for a list, including "new" if within the newUntil date. */
export function getEffectiveTopics(list: GameList): string[] {
  const now = new Date();
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (list.newUntil && localDate <= list.newUntil) {
    return ['new', ...list.topics];
  }
  return list.topics;
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

/** Topics for the filter bar. Excludes meta-topics like "new". */
export function getAllTopics(): string[] {
  const topicSet = new Set<string>();
  for (const list of lists) {
    for (const topic of list.topics) {
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
    filtered = filtered.filter(c => c.topics.includes(activeTopic));
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.topics.some(t => t.includes(q))
    );
  }

  return filtered;
}
