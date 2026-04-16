// ~400+ additional popular mobile apps for hints
// Sources: Wikipedia Google Play list, AppMagic, udonis.co, Sensor Tower data
export const mostDownloadedMobileAppsHints: string[] = [
  // Top 100 answers (the actual ranked items)
  "WhatsApp", "TikTok", "Facebook", "Instagram", "Messenger",
  "Snapchat", "CapCut", "Telegram", "Spotify", "YouTube",
  "SHAREit", "Netflix", "UC Browser", "Zoom", "Amazon Shopping",
  "Pinterest", "X (Twitter)", "WhatsApp Business", "Picsart", "Uber",
  "Truecaller", "Temu", "SHEIN", "imo", "Google Maps",
  "Google Meet", "Google Translate", "Shopee", "Kwai", "Google Play Games",
  "Google Chrome", "MX Player", "Hotstar", "YouTube Music", "AliExpress",
  "Flipkart", "Amazon Prime Video", "WeChat", "Likee", "Google Photos",
  "Duolingo", "InShot", "Gmail", "Google", "ChatGPT",
  "Google Wallet", "B612", "YouTube Kids", "PhonePe", "Discord",
  "Wish", "LINE", "Microsoft Teams", "Canva", "Bigo Live",
  "iQIYI", "Outlook", "Adobe Acrobat Reader", "Tinder", "Meesho",
  "Microsoft Word", "Waze", "Skype", "Clean Master", "Shazam",
  "Opera Mini", "Viber", "MyJio", "CamScanner", "LinkedIn",
  "Booking.com", "PayPal", "Dropbox", "Google Drive", "Google Docs",
  "Google Sheets", "Skype Lite", "QR & Barcode Scanner", "Slither.io", "Pokémon GO",
  "Subway Surfers", "Free Fire", "Roblox", "Candy Crush Saga", "8 Ball Pool",
  "Ludo King", "PUBG Mobile", "My Talking Tom", "Temple Run 2", "Hill Climb Racing",
  "Sniper 3D", "Among Us", "Clash of Clans", "Mobile Legends", "Gardenscapes",
  "Clash Royale", "EA Sports FC Mobile", "Call of Duty: Mobile", "Stumble Guys", "Angry Birds 2",

  // Social media & messaging (101–140)
  "Threads", "BeReal", "Kik", "Tumblr", "MeWe",
  "Signal", "Zalo", "KakaoTalk", "WeTV", "Hike",
  "Helo", "MX TakaTak", "Josh", "Moj", "Chingari",
  "Clubhouse", "Mastodon", "Bluesky", "Path", "Friendster",
  "Tagged", "Badoo", "Bumble", "Hinge", "OkCupid",
  "Grindr", "Plenty of Fish", "Match", "Zoosk", "Coffee Meets Bagel",
  "Tandem", "Whisper", "Ask.fm", "Amino", "Wattpad",
  "Vero", "Yubo", "TikTok Lite", "Reels", "VSCO",

  // Video & streaming (141–175)
  "Disney+", "Hulu", "HBO Max", "Peacock", "Paramount+",
  "Apple TV+", "Twitch", "Crunchyroll", "Funimation", "DAZN",
  "Pluto TV", "Tubi", "Vudu", "Plex", "Philo",
  "ESPN", "BBC iPlayer", "IPTV Smarters", "Dailymotion", "Vimeo",
  "SnackVideo", "Moj Video", "Josh Video", "Zili", "Bigo Shorts",
  "Likee Lite", "Resso", "Triller", "Byte", "Clash",
  "Veoh", "Metacafe", "Rumble", "Odysee", "Bitchute",
  "Kuaishou", "Bilibili", "YouKu", "LeEco",

  // Music & audio (176–200)
  "Apple Music", "Amazon Music", "SoundCloud", "Deezer", "Tidal",
  "Pandora", "iHeartRadio", "TuneIn Radio", "Napster", "Audiomack",
  "Boomplay", "Gaana", "Wynk Music", "JioSaavn", "Hungama Music",
  "Pocket Casts", "Overcast", "Castbox", "Google Podcasts", "Anchor",
  "Spotify Kids", "Endel", "Brain.fm", "Calm", "Headspace",

  // Gaming (201–270)
  "My Talking Angela 2", "Talking Tom Gold Run", "Temple Run", "Pou",
  "Fruit Ninja", "Minion Rush", "Angry Birds", "Angry Birds Star Wars",
  "Cut the Rope", "Doodle Jump", "Jetpack Joyride", "Plants vs. Zombies",
  "Plants vs. Zombies 2", "Candy Crush Soda Saga", "Homescapes", "Township",
  "Fishdom", "Coin Master", "Hay Day", "Boom Beach",
  "Clash Mini", "Brawl Stars", "Royal Match", "Block Blast", "Tiles Hop", "Geometry Dash Lite", "Helix Jump",
  "Paper.io 2", "Hole.io", "Aquapark.io", "Snake.io",
  "Brain Out", "Brain Test", "Fun Race 3D", "Bridge Race",
  "Hunter Assassin", "Going Balls", "Stack Ball", "Color Road",
  "Granny", "Huggy Wuggy", "Five Nights at Freddy's", "Toca Boca World",
  "Toca Life World", "Minecraft Earth", "Roblox Studio", "Fortnite",
  "PUBG: New State", "Free Fire Max", "Warzone Mobile", "Diablo Immortal",
  "Genshin Impact", "Honkai: Star Rail", "Honkai Impact 3rd", "Arknights",
  "AFK Arena", "Rise of Kingdoms", "Game of Thrones: Conquest", "Lords Mobile",
  "Mafia City", "Evony", "Whiteout Survival", "Last War: Survival",
  "Shadow Fight 3", "Shadow Fight 2", "Real Boxing", "UFC Mobile",
  "NBA 2K Mobile", "MLB 9 Innings", "FIFA Mobile", "Dream11",
  "Fantasy Premier League", "Golf Clash", "Mini Golf King", "Miniclip Pool",
  "Asphalt 9", "Real Racing 3", "CSR Racing 2", "Need for Speed: No Limits",
  "Sonic Dash", "Sonic Forces", "Angry Birds Epic", "Angry Birds Go",
  "Hungry Shark World", "Hungry Shark Evolution", "Sonic CD", "Zuma's Revenge",

  // Productivity & utilities (271–310)
  "Microsoft Excel", "Microsoft PowerPoint", "Microsoft OneNote", "Microsoft OneDrive",
  "Google Keep", "Google Slides", "Google Calendar", "Google Tasks",
  "Notion", "Evernote", "Bear", "Day One", "Standard Notes",
  "Todoist", "Trello", "Asana", "Monday.com", "Jira",
  "Slack", "Zoom Meetings", "Webex", "GoToMeeting", "BlueJeans",
  "LastPass", "1Password", "Dashlane", "Bitwarden", "Keeper",
  "Google Authenticator", "Authy", "Microsoft Authenticator", "Adobe Scan", "Genius Scan",
  "Scanner Pro", "Tiny Scanner", "TurboScan", "PDF Expert", "Documents by Readdle",
  "Files by Google", "Solid Explorer", "FX File Explorer", "Cx File Explorer", "Total Commander",

  // Finance & banking (311–340)
  "Cash App", "Venmo", "Zelle", "Google Pay", "Apple Pay",
  "Robinhood", "Coinbase", "Binance", "Kraken", "Crypto.com",
  "Revolut", "Wise", "Remitly", "Western Union", "MoneyGram",
  "Chime", "Current", "Dave", "Varo", "Albert",
  "Credit Karma", "Mint", "YNAB", "Personal Capital", "Acorns",
  "Stash", "Betterment", "Wealthfront", "M1 Finance", "Webull",
  "TD Ameritrade", "E*TRADE", "Fidelity", "Schwab", "Vanguard",

  // Shopping & e-commerce (341–365)
  "Amazon", "eBay", "Etsy", "Walmart", "Target",
  "Costco", "Best Buy", "Home Depot", "IKEA", "Zara",
  "H&M", "Forever 21", "ASOS", "Boohoo", "PrettyLittleThing",
  "Depop", "Poshmark", "ThredUp", "Vinted", "Mercari",
  "Letgo", "OfferUp", "Facebook Marketplace", "Craigslist", "OLX",
  "Lazada", "Tokopedia", "Bukalapak", "Grab", "Gojek",

  // Travel & navigation (366–390)
  "Airbnb", "Expedia", "Hotels.com", "Trivago", "Kayak",
  "TripAdvisor", "Google Flights", "Hopper", "Skyscanner", "Priceline",
  "Lyft", "Ola", "Didi", "Bolt", "inDrive",
  "Google Maps Go", "HERE WeGo", "Sygic GPS", "TomTom GO", "Navmii",
  "Maps.me", "Organic Maps", "Citymapper", "Moovit", "Transit",
  "Rome2rio", "12Go", "Trainline", "FlixBus", "BlaBlaCar",

  // Health & fitness (391–415)
  "MyFitnessPal", "Lose It!", "Noom", "Weight Watchers", "Lifesum",
  "Strava", "Nike Run Club", "Runkeeper", "MapMyRun", "Peloton",
  "7 Minute Workout", "30 Day Fitness", "Daily Yoga", "Down Dog", "Alo Moves",
  "Fitbit", "Samsung Health", "Apple Health", "Google Fit", "Garmin Connect",
  "Flo", "Clue", "Glow", "Natural Cycles", "BetterMe",
  "Noom Coach", "Noom Walk", "Meditopia", "Insight Timer", "Ten Percent Happier",

  // Education & learning (416–440)
  "Khan Academy", "Coursera", "Udemy", "edX", "Skillshare",
  "LinkedIn Learning", "Brilliant", "Photomath", "Wolfram Alpha", "Socratic",
  "Quizlet", "Anki", "Brainly", "Chegg", "Grammarly",
  "Rosetta Stone", "Babbel", "Busuu", "Pimsleur", "Drops",
  "Google Classroom", "Remind", "ClassDojo", "Seesaw", "Canvas",
  "Nearpod", "Kahoot", "Quizizz", "Mentimeter", "Poll Everywhere",

  // Food & delivery (441–460)
  "DoorDash", "Uber Eats", "Grubhub", "Postmates", "Deliveroo",
  "Just Eat", "Zomato", "Swiggy", "Foodpanda", "Meituan",
  "McDonald's", "Starbucks", "Chipotle", "Domino's", "Pizza Hut",
  "Subway App", "Dunkin'", "Chick-fil-A", "Taco Bell", "KFC",

  // Photo & creative (461–480)
  "Lightroom Mobile", "Snapseed", "Facetune", "AirBrush",
  "Meitu", "Snow", "FaceApp", "Remini", "Lensa", "PhotoGrid", "Layout from Instagram", "Unfold", "Adobe Photoshop Express", "Adobe Illustrator", "Pixlr", "Fotor", "Afterlight",
];
