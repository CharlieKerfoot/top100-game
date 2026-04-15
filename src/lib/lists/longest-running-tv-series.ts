import type { GameList } from './types';
import { longestRunningTvSeriesHints } from './hints/longest-running-tv-series';

// Source: Wikipedia, "List of television programs by episode count"
// https://en.wikipedia.org/wiki/List_of_television_programs_by_episode_count
// Retrieved April 2026. Includes scripted dramas, soap operas, game shows, talk shows,
// and variety programs across all countries. Many international soap operas dominate
// the top of this list. Episode counts are approximate for ongoing series.

export const longestRunningTvSeries: GameList = {
  id: 'longest-running-tv-series',
  name: 'Longest-Running TV Series by Episodes',
  description: 'TV shows ranked by total number of episodes — soap operas, game shows & more (Wikipedia)',
  topics: ['film & tv'],
  difficulty: 2,
  size: 50,
  hints: longestRunningTvSeriesHints,
  valueLabel: 'Episodes',
  newUntil: '2026-05-14',
  items: [
    'Unser Sandmännchen',           // 1 — East Germany children's show, 22,200+ episodes
    'Minuto de Dios',               // 2 — Colombian religious program
    'Krishi Darshan',               // 3 — Indian agricultural show
    'General Hospital',             // 4 — US soap opera
    'Guiding Light',                // 5 — US soap opera
    'Days of Our Lives',            // 6 — US soap opera
    'A Chat with Glendora',         // 7 — US talk show
    'As the World Turns',           // 8 — US soap opera
    'Eat Bulaga!',                  // 9 — Philippine variety show
    'The Young and the Restless',   // 10 — US soap opera
    'Des chiffres et des lettres',  // 11 — French game show
    'Aktuelle Kamera',              // 12 — East German news program
    'Access Hollywood',             // 13 — US entertainment news
    'Coronation Street',            // 14 — UK soap opera
    'One Life to Live',             // 15 — US soap opera
    'All My Children',              // 16 — US soap opera
    'Barátok közt',                 // 17 — Hungarian soap opera
    'Emmerdale',                    // 18 — UK soap opera
    '100 Huntley Street',           // 19 — Canadian religious show
    'AM Plaza',                     // 20 — South Korean morning show
    'Sandmännchen',                 // 21 — West German children's show (~10,000 eps)
    'TV Slagalica',                 // 22 — Serbian game show
    'The Price Is Right',           // 23 — US game show (1972 version)
    'The Bold and the Beautiful',   // 24 — US soap opera
    'Search for Tomorrow',          // 25 — US soap opera
    'Neighbours',                   // 26 — Australian soap opera
    'Jeopardy!',                    // 27 — US game show (1984 version)
    'Another World',                // 28 — US soap opera
    'Gute Zeiten, schlechte Zeiten', // 29 — German soap opera
    'Arul Neeram',                  // 30 — Indian Tamil-language soap opera
    'Hometown Report',              // 31 — South Korean TV program
    'Home and Away',                // 32 — Australian soap opera
    'Munshi',                       // 33 — Indian TV show
    'Countdown',                    // 34 — UK game show
    "Waratte Iitomo!",              // 35 — Japanese variety show
    'Pobol y Cwm',                  // 36 — Welsh-language soap opera (UK)
    'Wheel of Fortune',             // 37 — US game show (1983 syndicated version)
    'Striscia la notizia',          // 38 — Italian satirical news show
    'Shortland Street',             // 39 — New Zealand soap opera
    'Les Guignols',                 // 40 — French satirical puppet show
    'Bom Dia & Companhia',          // 41 — Brazilian children's show
    'Unter uns',                    // 42 — German soap opera
    'The Edge of Night',            // 43 — US soap opera
    'Love of Life',                 // 44 — US soap opera
    'Saber y ganar',                // 45 — Spanish game show
    'Familie',                      // 46 — Belgian soap opera
    'Tritiyo Matra',                // 47 — Bangladeshi talk show
    'Goede tijden, slechte tijden', // 48 — Dutch soap opera
    'EastEnders',                   // 49 — UK soap opera
    'Play School',                  // 50 — UK children's show
  ],
  values: [
    '22,200+ episodes', // Unser Sandmännchen
    '17,000+ episodes', // Minuto de Dios
    '16,780 episodes',  // Krishi Darshan
    '15,766 episodes',  // General Hospital
    '15,762 episodes',  // Guiding Light
    '15,000+ episodes', // Days of Our Lives
    '14,543 episodes',  // A Chat with Glendora
    '13,858 episodes',  // As the World Turns
    '13,600+ episodes', // Eat Bulaga!
    '13,003 episodes',  // The Young and the Restless
    '13,000 episodes',  // Des chiffres et des lettres
    '12,000+ episodes', // Aktuelle Kamera
    '11,844 episodes',  // Access Hollywood
    '11,612 episodes',  // Coronation Street
    '11,136 episodes',  // One Life to Live
    '10,755 episodes',  // All My Children
    '10,456 episodes',  // Barátok közt
    '10,334 episodes',  // Emmerdale
    '10,300 episodes',  // 100 Huntley Street
    '10,012 episodes',  // AM Plaza
    '~10,000 episodes', // Sandmännchen
    '9,900+ episodes',  // TV Slagalica
    '9,600 episodes',   // The Price Is Right
    '9,356 episodes',   // The Bold and the Beautiful
    '9,235 episodes',   // Neighbours
    '9,130 episodes',   // Search for Tomorrow
    '9,000 episodes',   // Jeopardy!
    '8,891 episodes',   // Another World
    '8,530 episodes',   // Gute Zeiten, schlechte Zeiten
    '8,522 episodes',   // Arul Neeram
    '8,401 episodes',   // Hometown Report
    '8,369 episodes',   // Home and Away
    '8,360 episodes',   // Munshi
    '8,294 episodes',   // Countdown
    '8,054 episodes',   // Waratte Iitomo!
    '8,000 episodes',   // Pobol y Cwm
    '8,000 episodes',   // Wheel of Fortune
    '7,965 episodes',   // Striscia la notizia
    '7,849 episodes',   // Shortland Street
    '7,500 episodes',   // Les Guignols
    '7,480 episodes',   // Bom Dia & Companhia
    '7,470 episodes',   // Unter uns
    '7,420 episodes',   // The Edge of Night
    '7,315 episodes',   // Love of Life
    '7,194 episodes',   // Saber y ganar
    '7,100 episodes',   // Familie
    '7,031 episodes',   // Tritiyo Matra
    '7,027 episodes',   // Goede tijden, slechte tijden
    '6,973 episodes',   // EastEnders
    '6,866 episodes',   // Play School
  ],
  aliases: {
    "Neighbours (AU)": "Neighbours",
    "Home and Away (AU)": "Home and Away",
    "Shortland Street (NZ)": "Shortland Street",
    "Pobol y Cwm (UK/Wales)": "Pobol y Cwm",
    "Gute Zeiten, schlechte Zeiten (DE)": "Gute Zeiten, schlechte Zeiten",
    "Unter uns (DE)": "Unter uns",
    "Familie (BE)": "Familie",
    "Goede tijden, slechte tijden (NL)": "Goede tijden, slechte tijden",
    "Les Guignols (FR)": "Les Guignols",
    "Des chiffres et des lettres (FR)": "Des chiffres et des lettres",
    "Striscia la notizia (IT)": "Striscia la notizia",
    "Saber y ganar (ES)": "Saber y ganar",
    "TV Slagalica (RS)": "TV Slagalica",
    "Barátok közt (HU)": "Barátok közt",
    "Bom Dia & Companhia (BR)": "Bom Dia & Companhia",
  },
};
