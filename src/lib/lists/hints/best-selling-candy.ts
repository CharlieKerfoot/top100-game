// ~500 candy/chocolate brand names for autocomplete hints
export const bestSellingCandyHints: string[] = [
  // Top 100 (the actual answers)
  "Reese's Peanut Butter Cups", "M&M's", "Snickers", "Kit Kat", "M&M's Peanut",
  "Hershey's Kisses", "Twix", "Hershey's Milk Chocolate Bar", "Milky Way", "Skittles",
  "Starburst", "Sour Patch Kids", "Jolly Rancher", "Nerds", "Twizzlers",
  "Butterfinger", "York Peppermint Pattie", "3 Musketeers", "Almond Joy", "Mounds",
  "Baby Ruth", "Crunch Bar", "Haribo Goldbears", "Swedish Fish", "Tootsie Roll",
  "Tootsie Pop", "Whoppers", "PayDay", "Milk Duds", "Rolo",
  "SweeTarts", "Airheads", "100 Grand", "Junior Mints", "Dots",
  "Mike and Ike", "Hot Tamales", "Peeps", "Reese's Pieces", "Reese's Take 5",
  "Mr. Goodbar", "Dove Chocolate", "Smarties", "Laffy Taffy", "Nerds Gummy Clusters",
  "Lemonhead", "Good & Plenty", "Heath Bar", "5th Avenue", "Whatchamacallit",
  "Turtles", "Raisinets", "Goobers", "Sno-Caps", "Jujyfruits",
  "Chunky", "Boston Baked Beans", "PEZ", "Life Savers", "Runts",
  "Pixy Stix", "Fun Dip", "Pop Rocks", "Ring Pop", "Push Pop",
  "Baby Bottle Pop", "Dum Dums", "Charms Blow Pops", "Charleston Chew", "Andes Mints",
  "Sugar Daddy", "Ferrero Rocher", "Kinder Bueno", "Nutella", "Tic Tac",
  "Mentos", "Russell Stover", "Cadbury Dairy Milk", "Cadbury Creme Egg", "Toblerone",
  "Godiva", "Lindt Lindor Truffles", "Ghirardelli Chocolate", "Werther's Original", "Riesen",
  "Goo Goo Cluster", "Pocky", "Hi-Chew", "Warheads", "Toxic Waste",
  "Trolli", "Black Forest Gummies", "Brach's Candy Corn", "Now and Later",
  "Goldenberg's Peanut Chews", "Skor", "Zero Bar", "Mallo Cup", "Chuckles",
  "Terry's Chocolate Orange",

  // ==================== US CLASSIC / NOSTALGIC ====================
  "Abba-Zaba", "Bit-O-Honey", "Black Cow", "Bonomo Turkish Taffy",
  "Botan Rice Candy", "Bottle Caps", "Almond Roca", "Bubblicious",
  "Candy Buttons", "Candy Necklace", "Caramel Apple Pops",
  "Chick-O-Stick", "Clark Bar", "Cow Tales", "Crows",
  "Cry Baby", "Fruit Stripe Gum", "Gobstopper",
  "Gold Mine Gum", "Idaho Spud", "Jawbreakers",
  "Jelly Belly", "Jolly Rancher Gummies",
  "Mary Janes", "Mambas", "Necco Wafers",
  "Peanut Butter Kisses", "Razzles", "Red Hots",
  "Red Vines", "Root Beer Barrels", "Satellite Wafers",
  "Sixlets", "Sugar Babies", "Sweethearts",
  "Vanilla Tootsie Roll", "Wax Lips", "Nik-L-Nip",
  "Zagnut", "Zours",

  // ==================== CHOCOLATE BARS ====================
  "Bounty", "Caramello", "Hershey's Special Dark",
  "Hershey's Cookies 'n' Creme", "Hershey's Nuggets", "Krackel",
  "M&M's Caramel", "M&M's Crispy", "M&M's Pretzel",
  "M&M's Peanut Butter", "M&M's Fudge Brownie",
  "Milky Way Midnight", "Milky Way Simply Caramel",
  "Nutrageous", "Reese's Big Cup", "Reese's Sticks",
  "Snickers Almond", "Snickers Crisper", "Symphony",

  // ==================== GUM ====================
  "5 Gum", "Bazooka Bubble Gum", "Big League Chew",
  "Chiclets", "Dentyne", "Dentyne Ice", "Dubble Bubble",
  "Eclipse Gum", "Extra", "Hubba Bubba", "Juicy Fruit",
  "Orbit", "Stride", "Trident", "Wrigley's Big Red",
  "Wrigley's Doublemint", "Wrigley's Spearmint",

  // ==================== HARD CANDY / LOLLIPOPS ====================
  "Chupa Chups", "Lifesavers Gummies", "Lifesavers Mints",
  "Rock Candy", "See's Lollypops", "Whistle Pops",
  "Peppermint Starlight Mints", "Orange Slices",

  // ==================== SOUR / EXTREME ====================
  "Sour Punch Straws", "Sour Patch Kids Watermelon",
  "Sour Power Belts", "Warheads Extreme Sour",
  "Altoids Sours", "Lucas Mexican Candy", "Tajín Candy",

  // ==================== LICORICE ====================
  "Panda Licorice", "Red Vines Licorice Twists",
  "Twizzlers Strawberry", "Twizzlers Cherry",
  "Twizzlers Pull-n-Peel", "Bassett's Allsorts",

  // ==================== PREMIUM / ARTISAN ====================
  "Bissinger's", "Compartes", "Dandelion Chocolate",
  "Dick Taylor", "Ethel M Chocolates", "Fran's Chocolates",
  "Lake Champlain Chocolates", "Li-Lac Chocolates",
  "Mast Brothers", "Moonstruck Chocolate", "Neuhaus",
  "Norman Love Confections", "Patchi", "Recchiuti",
  "Rocky Mountain Chocolate Factory", "Sanders",
  "Scharffen Berger", "See's Candies", "Theo Chocolate",
  "Tcho Chocolate", "Vosges",

  // ==================== EUROPEAN ====================
  "After Eight", "Aero", "Daim Bar", "Duplo",
  "Fazer Blue", "Galaxy", "Haribo Starmix",
  "Haribo Tangfastics", "Kinder Egg", "Kinder Chocolate",
  "Kinder Joy", "Knoppers", "Lion Bar", "Maltesers",
  "Milka", "Mon Chéri", "Quality Street",
  "Raffaello", "Ritter Sport", "Smarties",
  "Thorntons", "Toffifee", "Tony's Chocolonely",
  "Violet Crumble",

  // ==================== UK / BRITISH ====================
  "Bassett's Liquorice Allsorts", "Cadbury Buttons",
  "Cadbury Crunchie", "Cadbury Curly Wurly", "Cadbury Flake",
  "Cadbury Freddo", "Cadbury Heroes", "Cadbury Roses",
  "Cadbury Twirl", "Cadbury Wispa", "Cadbury Picnic",
  "Chewits", "Double Decker", "Drumstick",
  "Fruit Salad", "Jelly Babies", "Kit Kat Chunky",
  "Love Hearts", "Parma Violets", "Percy Pigs",
  "Sherbet Fountain", "Wine Gums", "Wham Bar",
  "Refreshers", "Flying Saucers",

  // ==================== JAPANESE ====================
  "Alfort", "Apollo Strawberry Chocolate", "Black Thunder",
  "Caramel Corn", "Choco Ball", "Crunky",
  "Dars", "Glico Caramel", "Hello Panda",
  "Kinoko no Yama", "Konpeito", "Koala's March",
  "Lotte Choco Pie", "Milky", "Morinaga Milk Caramel",
  "Pejoy", "Pocky Matcha", "Pocky Strawberry",
  "Pretz", "Ramune Candy", "Royce' Chocolate",
  "Shiroi Koibito", "Takenoko no Sato", "Toppo",
  "Umaibo", "Yan Yan",

  // ==================== KOREAN ====================
  "Choco Pie", "Lotte Ghana Chocolate", "Pepero",
  "Pepero Almond", "Homerun Ball",

  // ==================== CHINESE / ASIAN ====================
  "White Rabbit Creamy Candy", "Kopiko Coffee Candy",
  "Want Want", "Hsu Fu Chi",

  // ==================== MEXICAN / LATIN AMERICAN ====================
  "De La Rosa Mazapan", "Duvalin", "Glorias",
  "Lucas Muecas", "Paleta Payaso", "Pelon Pelo Rico",
  "Pulparindo", "Rockaleta", "Bubulubu",
  "Carlos V", "Vero Mango", "Obleas con cajeta",

  // ==================== INDIAN ====================
  "5 Star", "Cadbury Gems", "Cadbury Dairy Milk Silk",
  "Melody", "Munch", "Parle-G",

  // ==================== AUSTRALIAN / NZ ====================
  "Allen's Snakes Alive", "Cherry Ripe", "Fantales",
  "Freddo Frog", "FruChocs", "Minties",
  "Pineapple Lumps", "TimTam", "Violet Crumble", "Wizz Fizz",

  // ==================== DISCONTINUED / CULT ====================
  "Bar None", "Bonkers", "Crispy Crunch",
  "Frango Mints", "Life Savers Holes", "Marathon Bar",
  "Oh Henry!", "PB Max", "Seven Up Bar",
  "Space Food Sticks", "Texan Bar", "Wacky Wafers",
];
