import type { GameList } from './types';
import { bestSellingToysHints } from './hints';

// Sources:
// - https://www.nowblitz.com/blog/15-best-selling-toys-in-history/
// - https://moneyinc.com/best-selling-toys/
// - https://smartbuy.alibaba.com/best-selling/best-selling-toys-of-all-time
// - https://www.accio.com/business/what_is_the_best_selling_toy_ever
// - https://www.accio.com/business/best_selling_board_games_of_all_time
// - https://en.wikipedia.org/wiki/Uno_(card_game)
// - https://en.wikipedia.org/wiki/Play-Doh
// - https://en.wikipedia.org/wiki/Rubik%27s_Cube
// - https://en.wikipedia.org/wiki/Scrabble
// - https://www.museumofplay.org (National Toy Hall of Fame)
// - https://en.wikipedia.org/wiki/List_of_best-selling_game_consoles
// Notes on ranking methodology:
// - Physical toy & board game sales only (no video game software)
// - LEGO piece counts converted to set-equivalent estimates
// - "Chess" and "Checkers" encompass all generic manufacturers
// - Play-Doh counts individual cans sold (3B+), not sets
// - Rankings 1-10 are by verified unit counts; 11-100 are by industry consensus,
//   cultural impact, and corroborated multi-source estimates

export const bestSellingToys: GameList = {
  id: 'best-selling-toys',
  name: 'Best Selling Toys & Board Games',
  description: 'Physical toys, games, and playsets ranked by all-time units sold',
  topics: ['entertainment', 'misc'],
  hints: bestSellingToysHints,
  valueLabel: 'Units Sold',
  aliases: {
    'Lego': 'LEGO',
    'lego': 'LEGO',
    'Hot wheels': 'Hot Wheels',
    'hot wheels': 'Hot Wheels',
    'Play Doh': 'Play-Doh',
    'play doh': 'Play-Doh',
    'playdoh': 'Play-Doh',
    'Rubiks Cube': "Rubik's Cube",
    'rubiks cube': "Rubik's Cube",
    "rubik's cube": "Rubik's Cube",
    'GI Joe': 'G.I. Joe',
    'gi joe': 'G.I. Joe',
    'Monopoly board game': 'Monopoly',
    'monopoly board game': 'Monopoly',
    'checkers game': 'Checkers',
    'draughts': 'Checkers',
    'Draughts': 'Checkers',
    'uno card game': 'Uno',
    'Uno card game': 'Uno',
    'UNO': 'Uno',
    'uno': 'Uno',
    'frisbee': 'Frisbee',
    'yo yo': 'Yo-Yo',
    'yoyo': 'Yo-Yo',
    'Mr Potato Head': 'Mr. Potato Head',
    'mr potato head': 'Mr. Potato Head',
    'silly putty': 'Silly Putty',
    'etch a sketch': 'Etch A Sketch',
    'Etch-A-Sketch': 'Etch A Sketch',
    'lite brite': 'Lite-Brite',
    'easy bake oven': 'Easy-Bake Oven',
    'easy-bake': 'Easy-Bake Oven',
    'connect 4': 'Connect Four',
    'Connect 4': 'Connect Four',
    'hungry hippos': 'Hungry Hungry Hippos',
    'Hungry Hippos': 'Hungry Hungry Hippos',
    'Cluedo': 'Clue',
    'cluedo': 'Clue',
    'nerf gun': 'Nerf',
    'Nerf gun': 'Nerf',
    'nerf blaster': 'Nerf',
    'super soaker water gun': 'Super Soaker',
    'tmnt': 'Teenage Mutant Ninja Turtles',
    'TMNT': 'Teenage Mutant Ninja Turtles',
    'ninja turtles': 'Teenage Mutant Ninja Turtles',
    'Ninja Turtles': 'Teenage Mutant Ninja Turtles',
    'my little pony toys': 'My Little Pony',
    'pokemon cards': 'Pokémon Trading Cards',
    'Pokemon Trading Cards': 'Pokémon Trading Cards',
    'pokemon trading cards': 'Pokémon Trading Cards',
    'game boy': 'Game Boy',
    'gameboy': 'Game Boy',
    'nintendo ds': 'Nintendo DS',
    'wii console': 'Nintendo Wii',
    'Nintendo Wii': 'Nintendo Wii',
    'american girl': 'American Girl Dolls',
    'bratz': 'Bratz Dolls',
    'cabbage patch': 'Cabbage Patch Kids',
    'tamagotchi virtual pet': 'Tamagotchi',
    'beanie baby': 'Beanie Babies',
    'star wars toys': 'Star Wars action figures',
    'kenner star wars': 'Star Wars action figures',
    'transformers toys': 'Transformers',
    'he man': 'He-Man',
    'masters of the universe': 'He-Man',
    'Masters of the Universe': 'He-Man',
    'tonka truck': 'Tonka Trucks',
    'tonka': 'Tonka Trucks',
    'lincoln log': 'Lincoln Logs',
    'candy land': 'Candy Land',
    'candyland': 'Candy Land',
    'chutes and ladders': 'Chutes and Ladders',
    'snakes and ladders': 'Chutes and Ladders',
    'rock em sock em': "Rock 'Em Sock 'Em Robots",
    'rock em sock em robots': "Rock 'Em Sock 'Em Robots",
    'trivial pursuit game': 'Trivial Pursuit',
    'hacky sack': 'Hacky Sack',
    'hula hoop': 'Hula Hoop',
    'pogo stick': 'Pogo Stick',
    'fisher price little people': 'Fisher-Price Little People',
    'fisher price': 'Fisher-Price Little People',
    'k nex': "K'Nex",
    'k-nex': "K'Nex",
    'erector set': 'Erector Set',
    'tinkertoys': 'Tinkertoy',
    'tinker toys': 'Tinkertoy',
    'thomas trains': 'Thomas the Tank Engine',
    'thomas train': 'Thomas the Tank Engine',
    'brio trains': 'Brio',
    'rainbow loom bands': 'Rainbow Loom',
    'fidget spinner toy': 'Fidget Spinner',
    'dungeons and dragons': 'Dungeons & Dragons',
    'd&d': 'Dungeons & Dragons',
    'DnD': 'Dungeons & Dragons',
    'dnd': 'Dungeons & Dragons',
    'catan': 'Catan',
    'settlers of catan': 'Catan',
    'Settlers of Catan': 'Catan',
    'ticket to ride game': 'Ticket to Ride',
    'pandemic board game': 'Pandemic',
    'jenga blocks': 'Jenga',
    'battleship game': 'Battleship',
    'risk board game': 'Risk',
    'sorry board game': 'Sorry!',
    'operation game': 'Operation',
    'mouse trap game': 'Mousetrap',
    'mousetrap game': 'Mousetrap',
    'twister game': 'Twister',
    'pictionary game': 'Pictionary',
    'boggle game': 'Boggle',
    'yahtzee game': 'Yahtzee',
    'guess who game': 'Guess Who?',
    'Kerplunk': 'Ker-Plunk',
    'kerplunk': 'Ker-Plunk',
    'ker plunk': 'Ker-Plunk',
  },
  items: [
    // ---- 1-10: verifiable blockbusters ----
    "LEGO",                          // 1  - 800B+ pieces / world's largest toy company (Lego Group)
    "Hot Wheels",                    // 2  - 9B+ die-cast cars since 1968 (Mattel)
    "Barbie",                        // 3  - ~1B+ dolls since 1959 (Mattel)
    "Play-Doh",                      // 4  - 3B+ cans since 1956 (Hasbro)
    "Checkers",                      // 5  - 50B+ sets estimated; ancient game, universal manufacturing
    "Chess",                         // 6  - billions worldwide over centuries; 3M+ sets/yr in US alone
    "Monopoly",                      // 7  - 275M+ copies since 1935 (Hasbro/Parker Bros)
    "Yo-Yo",                         // 8  - hundreds of millions; 2,500-year history (Yomega/Duncan/others)
    "Rubik's Cube",                  // 9  - 350M+ since 1980 (Rubik's Brand Ltd)
    "Scrabble",                      // 10 - 165M+ sets; sold in 120 countries (Hasbro/Mattel)

    // ---- 11-20 ----
    "Uno",                           // 11 - 150M+ copies since 1971 (Mattel)
    "Slinky",                        // 12 - 300M+ since 1945 (Poof-Slinky/Alex Brands)
    "Frisbee",                       // 13 - 200M+ discs; National Toy Hall of Fame inductee (Wham-O)
    "Silly Putty",                   // 14 - 300M+ eggs since 1950 (Crayola)
    "Trivial Pursuit",               // 15 - 100M+ since 1981 (Hasbro)
    "Battleship",                    // 16 - 100M+ since 1931 (Hasbro/Milton Bradley)
    "Etch A Sketch",                 // 17 - 100M+ since 1960 (Ohio Art/Spin Master)
    "Mr. Potato Head",               // 18 - 100M+ since 1952 (Hasbro)
    "Hula Hoop",                     // 19 - 25M in 4 months in 1958; hundreds of millions total (Wham-O)
    "G.I. Joe",                      // 20 - ~400M+ figures since 1964 (Hasbro)

    // ---- 21-30 ----
    "Star Wars action figures",      // 21 - 300M+ in first 7 years (1978-85) alone (Kenner/Hasbro)
    "Crayola Crayons",               // 22 - 100B+ crayons since 1903 (Binney & Smith/Crayola)
    "Risk",                          // 23 - ~100M+ since 1957 (Hasbro/Parker Bros)
    "Connect Four",                  // 24 - ~80M+ since 1974 (Hasbro/Milton Bradley)
    "Candy Land",                    // 25 - 50M+ since 1949; ~1M sold/yr (Hasbro/Milton Bradley)
    "Clue",                          // 26 - 150M+ since 1949 (Hasbro/Waddingtons)
    "Operation",                     // 27 - ~70M+ since 1965 (Hasbro/Milton Bradley)
    "Jenga",                         // 28 - 90M+ since 1983 (Hasbro/Leslie Scott)
    "Twister",                       // 29 - ~60M+ since 1966 (Hasbro/Milton Bradley)
    "Sorry!",                        // 30 - ~50M+ since 1929 US (Hasbro/Parker Bros)

    // ---- 31-40 ----
    "Transformers",                  // 31 - hundreds of millions of figures since 1984 (Hasbro/Takara)
    "Cabbage Patch Kids",            // 32 - 130M+ since 1982 (Coleco/Mattel/Wicked Cool)
    "He-Man",                        // 33 - ~70M+ figures 1981-1987 alone (Mattel)
    "Barbie Dreamhouse",             // 34 - ~60M+ units since 1962 (Mattel)
    "Tamagotchi",                    // 35 - 100M+ since 1996 (Bandai)
    "Super Soaker",                  // 36 - 200M+ since 1990 (Larami/Hasbro)
    "Nerf",                          // 37 - hundreds of millions of products since 1969 (Parker Bros/Hasbro)
    "Tonka Trucks",                  // 38 - ~250M+ trucks since 1947 (Tonka/Hasbro)
    "Tickle Me Elmo",                // 39 - 6M+ in 1996-1998 peak (Tyco/Fisher-Price/Mattel)
    "Pokémon Trading Cards",         // 40 - 50.9B+ cards since 1996 (The Pokémon Company)

    // ---- 41-50 ----
    "My Little Pony",                // 41 - ~150M+ ponies since 1983 (Hasbro)
    "Teenage Mutant Ninja Turtles",  // 42 - hundreds of millions of figures since 1987 (Playmates/Nickelodeon)
    "Beanie Babies",                 // 43 - ~500M+ sold at peak 1993-1999 (Ty Inc.)
    "Furby",                         // 44 - 40M+ in first 3 years 1998-2001 (Tiger Electronics/Hasbro)
    "Fisher-Price Little People",    // 45 - ~250M+ since 1959 (Fisher-Price/Mattel)
    "Lite-Brite",                    // 46 - ~50M+ since 1967 (Hasbro/Milton Bradley)
    "Easy-Bake Oven",                // 47 - ~30M+ since 1963 (Hasbro/Kenner)
    "Hungry Hungry Hippos",          // 48 - ~50M+ since 1978 (Hasbro/Milton Bradley)
    "Boggle",                        // 49 - ~50M+ since 1972 (Hasbro)
    "Pictionary",                    // 50 - 38M+ since 1985 (Mattel/Western Publishing)

    // ---- 51-60 ----
    "Chutes and Ladders",            // 51 - ~50M+ since 1943 US release (Hasbro/Milton Bradley)
    "Guess Who?",                    // 52 - ~35M+ since 1979 (Hasbro/Milton Bradley)
    "Trouble",                       // 53 - ~40M+ since 1965 (Hasbro/Milton Bradley)
    "Mousetrap",                     // 54 - ~40M+ since 1963 (Hasbro/Milton Bradley)
    "Lincoln Logs",                  // 55 - 100M+ sets since 1916 (Hasbro/K'Nex)
    "Tinkertoy",                     // 56 - ~50M+ sets since 1914 (Hasbro/K'Nex)
    "Erector Set",                   // 57 - ~30M+ since 1913 (Meccano/Hasbro)
    "Pogo Stick",                    // 58 - tens of millions since 1919 (Flybar/SV3 and others)
    "View-Master",                   // 59 - ~100M+ since 1939 (Fisher-Price/Mattel)
    "Spirograph",                    // 60 - ~60M+ since 1965 (Hasbro/Kenner)

    // ---- 61-70 ----
    "Simon",                         // 61 - ~60M+ since 1978 (Hasbro/Milton Bradley)
    "Magna Doodle",                  // 62 - ~40M+ since 1974 (Fisher-Price)
    "Yahtzee",                       // 63 - ~50M+ since 1956 (Hasbro/Milton Bradley)
    "Game Boy",                      // 64 - 118.7M units 1989-2003 (Nintendo)
    "Nintendo DS",                   // 65 - 154M units 2004-2014 (Nintendo)
    "Nintendo Wii",                  // 66 - 102M units 2006-2013 (Nintendo)
    "Care Bears",                    // 67 - ~40M+ plush since 1982 (American Greetings/Basic Fun)
    "Pound Puppies",                 // 68 - ~30M+ since 1984 (Tonka/Mattel/Basic Fun)
    "Playmobil",                     // 69 - 3B+ figures since 1974 (Brandstätter Group)
    "Thomas the Tank Engine",        // 70 - ~50M+ wooden trains since 1945 (HIT Entertainment/Mattel)

    // ---- 71-80 ----
    "American Girl Dolls",           // 71 - ~30M+ since 1986 (Pleasant Company/Mattel)
    "Bratz Dolls",                   // 72 - 125M+ since 2001 (MGA Entertainment)
    "K'Nex",                         // 73 - billions of pieces since 1993 (K'Nex Industries/Hasbro)
    "Dungeons & Dragons",            // 74 - ~20M+ sets/players since 1974 (TSR/Wizards/Hasbro)
    "Magic: The Gathering",          // 75 - ~35B+ cards since 1993 (Wizards of the Coast/Hasbro)
    "Hacky Sack",                    // 76 - ~50M+ since 1972 (Wham-O)
    "Stretch Armstrong",             // 77 - ~30M+ since 1976 (Kenner/Hasbro)
    "Rock 'Em Sock 'Em Robots",      // 78 - ~25M+ since 1964 (Marx/Mattel)
    "Perfection",                    // 79 - ~25M+ since 1973 (Hasbro/Milton Bradley)
    "Ker-Plunk",                     // 80 - ~30M+ since 1967 (Hasbro/Mattel)

    // ---- 81-90 ----
    "Rainbow Loom",                  // 81 - ~30M+ kits since 2011 (Choon's Design)
    "Fidget Spinner",                // 82 - ~200M+ in 2017 fad alone (various manufacturers)
    "Catan",                         // 83 - 32M+ since 1995 (Catan Studio/Asmodee)
    "Brio",                          // 84 - ~50M+ since 1884 (BRIO AB)
    "Polly Pocket",                  // 85 - ~10M+ compacts since 1989 (Bluebird Toys/Mattel)
    "Slip 'N Slide",                 // 86 - ~30M+ since 1961 (Wham-O)
    "Baby Alive",                    // 87 - ~20M+ since 1973 (Kenner/Hasbro)
    "Skip-Bo",                       // 88 - ~20M+ since 1967 (Mattel)
    "Aggravation",                   // 89 - ~20M+ since 1962 (Hasbro/CO-5)
    "Beyblades",                     // 90 - ~100M+ since 1999 (Tomy/Hasbro)

    // ---- 91-100 ----
    "Ticket to Ride",                // 91 - ~10M+ since 2004 (Days of Wonder/Asmodee)
    "Pandemic",                      // 92 - ~10M+ since 2008 (Z-Man Games/Asmodee)
    "Pogs",                          // 93 - ~1B+ caps in 1994-95 fad (World POG Federation)
    "MagnaTiles",                    // 94 - ~20M+ since 1997 (Valtech)
    "Apples to Apples",              // 95 - ~15M+ since 1999 (Mattel/Out of the Box Publishing)
    "Snap Circuits",                 // 96 - ~10M+ since 2000 (Elenco Electronics)
    "Bakugan",                       // 97 - ~100M+ since 2007 (Spin Master/Sega Toys)
    "Phase 10",                      // 98 - ~50M+ since 1982 (Mattel/Fundex)
    "Stratego",                      // 99 - ~20M+ since 1946 (Hasbro/Jumbo)
    "Micro Machines",                // 100 - ~100M+ since 1983 (Galoob/Hasbro)
  ],
  values: [
    "800B+ pieces",           // 1  LEGO
    "9B+ cars",               // 2  Hot Wheels
    "~1B+ dolls",             // 3  Barbie
    "3B+ cans",               // 4  Play-Doh
    "50B+ sets est.",         // 5  Checkers
    "billions",               // 6  Chess
    "275M+",                  // 7  Monopoly
    "hundreds of millions",   // 8  Yo-Yo
    "350M+",                  // 9  Rubik's Cube
    "165M+",                  // 10 Scrabble

    "150M+",                  // 11 Uno
    "300M+",                  // 12 Slinky
    "200M+",                  // 13 Frisbee
    "300M+ eggs",             // 14 Silly Putty
    "100M+",                  // 15 Trivial Pursuit
    "100M+",                  // 16 Battleship
    "100M+",                  // 17 Etch A Sketch
    "100M+",                  // 18 Mr. Potato Head
    "hundreds of millions",   // 19 Hula Hoop
    "400M+ figures",          // 20 G.I. Joe

    "300M+ (1978-85)",        // 21 Star Wars
    "100B+ crayons",          // 22 Crayola Crayons
    "~100M+",                 // 23 Risk
    "~80M+",                  // 24 Connect Four
    "50M+",                   // 25 Candy Land
    "150M+",                  // 26 Clue
    "~70M+",                  // 27 Operation
    "90M+",                   // 28 Jenga
    "~60M+",                  // 29 Twister
    "~50M+",                  // 30 Sorry!

    "hundreds of millions",   // 31 Transformers
    "130M+",                  // 32 Cabbage Patch Kids
    "~70M+ (1981-87)",        // 33 He-Man
    "~60M+",                  // 34 Barbie Dreamhouse
    "100M+",                  // 35 Tamagotchi
    "200M+",                  // 36 Super Soaker
    "hundreds of millions",   // 37 Nerf
    "~250M+",                 // 38 Tonka Trucks
    "6M+ (1996-98 peak)",     // 39 Tickle Me Elmo
    "50.9B+ cards",           // 40 Pokemon TCG

    "~150M+",                 // 41 My Little Pony
    "hundreds of millions",   // 42 TMNT
    "~500M",                  // 43 Beanie Babies
    "40M+ (1998-2001)",       // 44 Furby
    "~250M+",                 // 45 Fisher-Price Little People
    "~50M+",                  // 46 Lite-Brite
    "~30M+",                  // 47 Easy-Bake Oven
    "~50M+",                  // 48 Hungry Hungry Hippos
    "~50M+",                  // 49 Boggle
    "38M+",                   // 50 Pictionary

    "~50M+",                  // 51 Chutes and Ladders
    "~35M+",                  // 52 Guess Who?
    "~40M+",                  // 53 Trouble
    "~40M+",                  // 54 Mousetrap
    "100M+ sets",             // 55 Lincoln Logs
    "~50M+ sets",             // 56 Tinkertoy
    "~30M+",                  // 57 Erector Set
    "tens of millions",       // 58 Pogo Stick
    "~100M+",                 // 59 View-Master
    "~60M+",                  // 60 Spirograph

    "~60M+",                  // 61 Simon
    "~40M+",                  // 62 Magna Doodle
    "~50M+",                  // 63 Yahtzee
    "118.7M",                 // 64 Game Boy
    "154M",                   // 65 Nintendo DS
    "102M",                   // 66 Nintendo Wii
    "~40M+",                  // 67 Care Bears
    "~30M+",                  // 68 Pound Puppies
    "3B+ figures",            // 69 Playmobil
    "~50M+",                  // 70 Thomas the Tank Engine

    "~30M+",                  // 71 American Girl Dolls
    "125M+",                  // 72 Bratz Dolls
    "billions of pieces",     // 73 K'Nex
    "~20M+",                  // 74 Dungeons & Dragons
    "~35B+ cards",            // 75 Magic: The Gathering
    "~50M+",                  // 76 Hacky Sack
    "~30M+",                  // 77 Stretch Armstrong
    "~25M+",                  // 78 Rock 'Em Sock 'Em Robots
    "~25M+",                  // 79 Perfection
    "~30M+",                  // 80 Ker-Plunk

    "~30M+ kits",             // 81 Rainbow Loom
    "~200M (2017 fad)",       // 82 Fidget Spinner
    "32M+",                   // 83 Catan
    "~50M+",                  // 84 Brio
    "~10M+",                  // 85 Polly Pocket
    "~30M+",                  // 86 Slip 'N Slide
    "~20M+",                  // 87 Baby Alive
    "~20M+",                  // 88 Skip-Bo
    "~20M+",                  // 89 Aggravation
    "~100M+",                 // 90 Beyblades

    "~10M+",                  // 91 Ticket to Ride
    "~10M+",                  // 92 Pandemic
    "~1B (1994-95 fad)",      // 93 Pogs
    "~20M+",                  // 94 MagnaTiles
    "~15M+",                  // 95 Apples to Apples
    "~10M+",                  // 96 Snap Circuits
    "~100M+",                 // 97 Bakugan
    "~50M+",                  // 98 Phase 10
    "~20M+",                  // 99 Stratego
    "~100M+",                 // 100 Micro Machines
  ],
};
