import type { GameList } from './types';
import { longestChartingHot100Hints } from './hints';

export const longestChartingHot100: GameList = {
  id: 'longest-charting-hot100',
  name: 'Longest-Charting Songs on Billboard Hot 100',
  description: 'Songs ranked by total weeks on the Billboard Hot 100, all time (Wikipedia/Billboard)',
  topics: ['music'],
  hints: longestChartingHot100Hints,
  valueLabel: 'Weeks on Chart',
  items: [
    "Lose Control - Teddy Swims",                              // 1
    "Heat Waves - Glass Animals",                              // 2
    "Blinding Lights - The Weeknd",                           // 3
    "Beautiful Things - Benson Boone",                        // 4
    "Radioactive - Imagine Dragons",                          // 5
    "Sail - AWOLNATION",                                      // 6
    "All I Want for Christmas Is You - Mariah Carey",         // 7
    "Levitating - Dua Lipa",                                  // 8
    "A Bar Song (Tipsy) - Shaboozey",                         // 9
    "I'm Yours - Jason Mraz",                                 // 10
    "Wildflower - Billie Eilish",                             // 11
    "Rockin' Around the Christmas Tree - Brenda Lee",         // 12
    "Jingle Bell Rock - Bobby Helms",                         // 13
    "Stay - The Kid Laroi & Justin Bieber",                   // 14
    "Believer - Imagine Dragons",                             // 15
    "Old Town Road - Lil Nas X ft. Billy Ray Cyrus",         // 16
    "Shape of You - Ed Sheeran",                              // 17
    "Last Night - Morgan Wallen",                             // 18
    "Someone You Loved - Lewis Capaldi",                      // 19
    "The Christmas Song - Nat King Cole",                     // 20
    "Sunflower - Post Malone & Swae Lee",                     // 21
    "Circles - Post Malone",                                  // 22
    "Rockstar - Post Malone ft. 21 Savage",                  // 23
    "Last Christmas - Wham!",                                 // 24
    "It's the Most Wonderful Time of the Year - Andy Williams", // 25
    "Dance Monkey - Tones and I",                             // 26
    "God's Plan - Drake",                                     // 27
    "A Holly Jolly Christmas - Burl Ives",                    // 28
    "Shallow - Lady Gaga & Bradley Cooper",                   // 29
    "Drivers License - Olivia Rodrigo",                       // 30
    "Bad Guy - Billie Eilish",                                // 31
    "Closer - The Chainsmokers ft. Halsey",                  // 32
    "Uptown Funk - Mark Ronson ft. Bruno Mars",               // 33
    "Anti-Hero - Taylor Swift",                               // 34
    "Cruel Summer - Taylor Swift",                            // 35
    "Rolling in the Deep - Adele",                            // 36
    "White Christmas - Bing Crosby",                          // 37
    "Feliz Navidad - José Feliciano",                         // 38
    "Happy - Pharrell Williams",                              // 39
    "Let It Snow! Let It Snow! Let It Snow! - Dean Martin",   // 40
    "Counting Stars - OneRepublic",                           // 41
    "Despacito - Luis Fonsi ft. Daddy Yankee",               // 42
    "Stay With Me - Sam Smith",                               // 43
    "Good 4 U - Olivia Rodrigo",                              // 44
    "Shake It Off - Taylor Swift",                            // 45
    "Roar - Katy Perry",                                      // 46
    "Save Your Tears - The Weeknd",                           // 47
    "Starboy - The Weeknd ft. Daft Punk",                    // 48
    "Girls Like You - Maroon 5 ft. Cardi B",                 // 49
    "Easy on Me - Adele",                                     // 50
    "Watermelon Sugar - Harry Styles",                        // 51
    "Can't Feel My Face - The Weeknd",                        // 52
    "Sicko Mode - Travis Scott",                              // 53
    "Mood - 24kGoldn ft. iann dior",                         // 54
    "Flowers - Miley Cyrus",                                  // 55
    "7 Rings - Ariana Grande",                                // 56
    "Señorita - Shawn Mendes & Camila Cabello",              // 57
    "One Dance - Drake",                                      // 58
    "Perfect - Ed Sheeran",                                   // 59
    "Hotline Bling - Drake",                                  // 60
    "Thinking Out Loud - Ed Sheeran",                        // 61
    "Thunder - Imagine Dragons",                              // 62
    "As It Was - Harry Styles",                               // 63
    "Peaches - Justin Bieber ft. Daniel Caesar & Giveon",    // 64
    "Don't Start Now - Dua Lipa",                             // 65
    "Lean On - Major Lazer & DJ Snake ft. MO",               // 66
    "All of Me - John Legend",                                // 67
    "Cheap Thrills - Sia",                                    // 68
    "Blank Space - Taylor Swift",                             // 69
    "That's What I Like - Bruno Mars",                        // 70
    "Havana - Camila Cabello ft. Young Thug",                // 71
    "In My Feelings - Drake",                                 // 72
    "Die For You - The Weeknd",                               // 73
    "Thank U, Next - Ariana Grande",                          // 74
    "New Rules - Dua Lipa",                                   // 75
    "WAP - Cardi B ft. Megan Thee Stallion",                 // 76
    "Bodak Yellow - Cardi B",                                 // 77
    "Vampire - Olivia Rodrigo",                               // 78
    "Espresso - Sabrina Carpenter",                           // 79
    "Die with a Smile - Lady Gaga & Bruno Mars",              // 80
    "Butter - BTS",                                           // 81
    "24K Magic - Bruno Mars",                                 // 82
    "HUMBLE. - Kendrick Lamar",                               // 83
    "Sorry - Justin Bieber",                                  // 84
    "Treat You Better - Shawn Mendes",                        // 85
    "What Do You Mean? - Justin Bieber",                      // 86
    "Locked Out of Heaven - Bruno Mars",                      // 87
    "Photograph - Ed Sheeran",                                // 88
    "Say You Won't Let Go - James Arthur",                    // 89
    "Running Up That Hill - Kate Bush",                       // 90
    "Dynamite - BTS",                                         // 91
    "Stay - Rihanna ft. Mikky Ekko",                          // 92
    "Diamonds - Rihanna",                                     // 93
    "Work - Rihanna ft. Drake",                               // 94
    "We Found Love - Rihanna ft. Calvin Harris",              // 95
    "Don't Let Me Down - The Chainsmokers ft. Daya",         // 96
    "Love Yourself - Justin Bieber",                          // 97
    "Not Like Us - Kendrick Lamar",                           // 98
    "Please Please Please - Sabrina Carpenter",               // 99
    "Umbrella - Rihanna",                                     // 100
  ],
  values: [
    "112 weeks", "91 weeks",  "90 weeks",  "89 weeks",  "87 weeks",
    "79 weeks",  "79 weeks",  "77 weeks",  "77 weeks",  "76 weeks",
    "72 weeks",  "71 weeks",  "68 weeks",  "63 weeks",  "62 weeks",
    "61 weeks",  "59 weeks",  "58 weeks",  "57 weeks",  "56 weeks",
    "55 weeks",  "54 weeks",  "54 weeks",  "53 weeks",  "52 weeks",
    "52 weeks",  "51 weeks",  "51 weeks",  "50 weeks",  "50 weeks",
    "49 weeks",  "48 weeks",  "47 weeks",  "47 weeks",  "46 weeks",
    "46 weeks",  "44 weeks",  "43 weeks",  "43 weeks",  "42 weeks",
    "41 weeks",  "41 weeks",  "40 weeks",  "40 weeks",  "39 weeks",
    "39 weeks",  "38 weeks",  "38 weeks",  "38 weeks",  "37 weeks",
    "37 weeks",  "37 weeks",  "37 weeks",  "37 weeks",  "36 weeks",
    "36 weeks",  "36 weeks",  "36 weeks",  "35 weeks",  "35 weeks",
    "35 weeks",  "35 weeks",  "34 weeks",  "34 weeks",  "34 weeks",
    "34 weeks",  "33 weeks",  "33 weeks",  "33 weeks",  "33 weeks",
    "32 weeks",  "32 weeks",  "32 weeks",  "32 weeks",  "31 weeks",
    "31 weeks",  "31 weeks",  "31 weeks",  "31 weeks",  "30 weeks",
    "30 weeks",  "30 weeks",  "30 weeks",  "30 weeks",  "30 weeks",
    "30 weeks",  "29 weeks",  "29 weeks",  "29 weeks",  "29 weeks",
    "29 weeks",  "29 weeks",  "28 weeks",  "28 weeks",  "28 weeks",
    "28 weeks",  "27 weeks",  "27 weeks",  "27 weeks",  "27 weeks",
  ],
};
