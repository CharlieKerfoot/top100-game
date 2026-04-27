// Source: Wikipedia "Fastest animals" + "List of birds by flight speed"
// Speeds are top recorded speeds (including diving for birds)
import type { GameList } from './types';
import { fastestAnimalsHints } from './hints/fastest-animals';

export const fastestAnimals: GameList = {
  id: 'fastest-animals',
  name: 'Fastest Animals in the World',
  description: 'Animals ranked by top recorded speed, mixing land, air, and sea (Wikipedia)',
  topics: ['misc'],
  difficulty: 1,
  hints: fastestAnimalsHints,
  valueLabel: 'Top Speed',
  size: 50,
  newUntil: '2026-04-14',
  items: [
    "Peregrine Falcon",        // 1 - 242 mph (diving)
    "Golden Eagle",            // 2 - 200 mph (diving)
    "Saker Falcon",            // 3 - 200 mph (diving)
    "Gyrfalcon",               // 4 - 130 mph (diving)
    "White-throated Needletail", // 5 - 105 mph (level flight)
    "Common Swift",            // 6 - 103 mph (level flight)
    "Eurasian Hobby",          // 7 - 100 mph
    "Mexican Free-tailed Bat", // 8 - 100 mph
    "Frigatebird",             // 9 - 95 mph
    "Rock Dove",               // 10 - 93 mph
    "Horsefly",                // 11 - 90 mph (fastest insect)
    "Spur-winged Goose",       // 12 - 88 mph
    "Red-breasted Merganser",  // 13 - 81 mph
    "Black Marlin",            // 14 - 80 mph (fastest fish)
    "Canvasback",              // 15 - 80 mph
    "Grey-headed Albatross",   // 16 - 79 mph
    "Cheetah",                 // 17 - 75 mph (fastest land animal)
    "Sailfish",                // 18 - 68 mph
    "Anna's Hummingbird",      // 19 - 61 mph
    "Swordfish",               // 20 - 60 mph
    "Pronghorn",               // 21 - 55 mph
    "Springbok",               // 22 - 55 mph
    "Quarter Horse",           // 23 - 55 mph
    "Blue Wildebeest",         // 24 - 50 mph
    "Thomson's Gazelle",       // 25 - 50 mph
    "Lion",                    // 26 - 50 mph
    "Blackbuck",               // 27 - 50 mph
    "Brown Hare",              // 28 - 48 mph
    "Yellowfin Tuna",          // 29 - 47 mph
    "Ostrich",                 // 30 - 45 mph (fastest bird on land)
    "Shortfin Mako Shark",     // 31 - 45 mph
    "Jackrabbit",              // 32 - 45 mph
    "African Wild Dog",        // 33 - 44 mph
    "Kangaroo",                // 34 - 44 mph
    "Greyhound",               // 35 - 43 mph
    "Coyote",                  // 36 - 43 mph
    "Onager",                  // 37 - 43 mph
    "Zebra",                   // 38 - 43 mph
    "Eland",                   // 39 - 43 mph
    "Tiger",                   // 40 - 40 mph
    "Common Dolphin",          // 41 - 40 mph
    "Hyena",                   // 42 - 37 mph
    "Giraffe",                 // 43 - 37 mph
    "Orca",                    // 44 - 35 mph
    "Emu",                     // 45 - 31 mph
    "Perentie",                // 46 - 25 mph (fastest lizard)
    "Green Iguana",            // 47 - 22 mph
    "Leatherback Sea Turtle",  // 48 - 22 mph
    "Black Mamba",             // 49 - 14 mph (fastest snake)
    "Komodo Dragon",           // 50 - 13 mph
  ],
  values: [
    "242 mph",  // Peregrine Falcon
    "200 mph",  // Golden Eagle
    "200 mph",  // Saker Falcon
    "130 mph",  // Gyrfalcon
    "105 mph",  // White-throated Needletail
    "103 mph",  // Common Swift
    "100 mph",  // Eurasian Hobby
    "100 mph",  // Mexican Free-tailed Bat
    "95 mph",   // Frigatebird
    "93 mph",   // Rock Dove
    "90 mph",   // Horsefly
    "88 mph",   // Spur-winged Goose
    "81 mph",   // Red-breasted Merganser
    "80 mph",   // Black Marlin
    "80 mph",   // Canvasback
    "79 mph",   // Grey-headed Albatross
    "75 mph",   // Cheetah
    "68 mph",   // Sailfish
    "61 mph",   // Anna's Hummingbird
    "60 mph",   // Swordfish
    "55 mph",   // Pronghorn
    "55 mph",   // Springbok
    "55 mph",   // Quarter Horse
    "50 mph",   // Blue Wildebeest
    "50 mph",   // Thomson's Gazelle
    "50 mph",   // Lion
    "50 mph",   // Blackbuck
    "48 mph",   // Brown Hare
    "47 mph",   // Yellowfin Tuna
    "45 mph",   // Ostrich
    "45 mph",   // Shortfin Mako Shark
    "45 mph",   // Jackrabbit
    "44 mph",   // African Wild Dog
    "44 mph",   // Kangaroo
    "43 mph",   // Greyhound
    "43 mph",   // Coyote
    "43 mph",   // Onager
    "43 mph",   // Zebra
    "43 mph",   // Eland
    "40 mph",   // Tiger
    "40 mph",   // Common Dolphin
    "37 mph",   // Hyena
    "37 mph",   // Giraffe
    "35 mph",   // Orca
    "31 mph",   // Emu
    "25 mph",   // Perentie
    "22 mph",   // Green Iguana
    "22 mph",   // Leatherback Sea Turtle
    "14 mph",   // Black Mamba
    "13 mph",   // Komodo Dragon
  ],
  aliases: {
    "Pigeon": "Rock Dove",
    "Homing Pigeon": "Rock Dove",
    "Racing Pigeon": "Rock Dove",
    "Dove": "Rock Dove",
    "Wildebeest": "Blue Wildebeest",
    "Gnu": "Blue Wildebeest",
    "Killer Whale": "Orca",
    "Mako Shark": "Shortfin Mako Shark",
    "Mako": "Shortfin Mako Shark",
    "Hare": "Brown Hare",
    "European Hare": "Brown Hare",
    "Marlin": "Black Marlin",
    "Horse": "Quarter Horse",
    "Domestic Horse": "Quarter Horse",
    "Racehorse": "Quarter Horse",
    "Thoroughbred": "Quarter Horse",
    "Wild Ass": "Onager",
    "Asiatic Wild Ass": "Onager",
    "Needletail": "White-throated Needletail",
    "Needletail Swift": "White-throated Needletail",
    "Spine-tailed Swift": "White-throated Needletail",
    "Free-tailed Bat": "Mexican Free-tailed Bat",
    "Brazilian Free-tailed Bat": "Mexican Free-tailed Bat",
    "Albatross": "Grey-headed Albatross",
    "Gazelle": "Thomson's Gazelle",
    "Tommy": "Thomson's Gazelle",
    "Spotted Hyena": "Hyena",
    "Laughing Hyena": "Hyena",
    "Painted Dog": "African Wild Dog",
    "Cape Hunting Dog": "African Wild Dog",
    "Wild Dog": "African Wild Dog",
    "Hunting Dog": "African Wild Dog",
    "Perentie Monitor": "Perentie",
    "Perentie Lizard": "Perentie",
    "Iguana": "Green Iguana",
    "Sea Turtle": "Leatherback Sea Turtle",
    "Leatherback": "Leatherback Sea Turtle",
    "Tuna": "Yellowfin Tuna",
    "Dolphin": "Common Dolphin",
    "Fly": "Horsefly",
    "Horse Fly": "Horsefly",
    "Swift": "Common Swift",
    "Falcon": "Peregrine Falcon",
    "Eagle": "Golden Eagle",
    "Shark": "Shortfin Mako Shark",
  },
};
