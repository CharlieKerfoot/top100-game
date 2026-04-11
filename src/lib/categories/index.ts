// ============================================================
// CATEGORY REGISTRY
// ============================================================
// To add a new category:
//   1. Create a new file in this folder (e.g. my-category.ts)
//   2. Export a Category object (see types.ts for the interface)
//   3. Import it below and add it to the `categories` array
//
// Each category needs:
//   - id:          unique kebab-case identifier
//   - name:        display name
//   - description: short one-liner shown in the picker
//   - tags:        array of lowercase tags for filtering
//   - items:       exactly 100 strings, ranked #1 to #100
// ============================================================

export type { Category } from './types';

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

import type { Category } from './types';

export const categories: Category[] = [
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
];

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  for (const cat of categories) {
    for (const tag of cat.tags) {
      tagSet.add(tag);
    }
  }
  return [...tagSet].sort();
}

// Hand-picked featured categories spanning diverse genres
const featuredIds = [
  'most-populous-countries',    // geography
  'highest-grossing-movies',    // entertainment
  'most-streamed-songs',        // music
  'forbes-billionaires',        // business
  'best-selling-video-games',   // gaming
];

export function getFeaturedCategories(): Category[] {
  return featuredIds
    .map(id => categories.find(c => c.id === id))
    .filter((c): c is Category => c !== undefined);
}

export function searchCategories(query: string, activeTag: string | null): Category[] {
  let filtered = categories;

  if (activeTag) {
    filtered = filtered.filter(c => c.tags.includes(activeTag));
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some(t => t.includes(q))
    );
  }

  return filtered;
}
