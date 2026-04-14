// ~500 athletes for hints
export const highestPaidAthletesHints: string[] = [
  // Top 100 (the actual answers)
  "Cristiano Ronaldo", "Lionel Messi", "LeBron James", "Giannis Antetokounmpo", "Kylian Mbappe",
  "Lamar Jackson", "Luka Doncic", "Stephen Curry", "Canelo Alvarez", "Neymar",
  "Jude Bellingham", "Jaylen Brown", "Joe Burrow", "Dak Prescott", "Patrick Mahomes",
  "Erling Haaland", "Karim Benzema", "Nikola Jokic", "Tyreek Hill", "Joel Embiid",
  "Kevin Durant", "Jalen Hurts", "Jon Rahm", "Mohamed Salah", "Lewis Hamilton",
  "Scottie Scheffler", "Vinicius Junior", "Russell Wilson", "Chris Jones", "Max Verstappen",
  "Jimmy Butler", "Kawhi Leonard", "Anthony Edwards", "Aaron Judge", "Shohei Ohtani",
  "Justin Herbert", "Trae Young", "Anthony Davis", "Kyrie Irving", "Paul George",
  "Kirk Cousins", "Davante Adams", "Deshaun Watson", "Karl-Anthony Towns", "Damian Lillard",
  "Bradley Beal", "Devin Booker", "Rudy Gobert", "Mike Trout", "Naomi Osaka",
  "Josh Allen", "Travis Kelce", "Jamal Adams", "Alexander Ovechkin", "Connor McDavid",
  "Tiger Woods", "Roger Federer", "Novak Djokovic", "Rafael Nadal", "Tyson Fury",
  "Conor McGregor", "Robert Lewandowski", "Kevin De Bruyne", "Harry Kane", "Bukayo Saka",
  "Sadio Mane", "Marcus Rashford", "Phil Foden", "Rodri", "Florian Wirtz",
  "Jadon Sancho", "Trent Alexander-Arnold", "Declan Rice", "Martin Odegaard", "Bruno Fernandes",
  "Casemiro", "Darwin Nunez", "Federico Valverde", "Bernardo Silva", "Lautaro Martinez",
  "Dani Olmo", "Pedri", "Aurelien Tchouameni", "Eduardo Camavinga", "Achraf Hakimi",
  "Ousmane Dembele", "Randal Kolo Muani", "Bradley Barcola", "Jamal Musiala", "Leroy Sane",
  "Joshua Kimmich", "Serge Gnabry", "Thomas Muller", "Manuel Neuer", "Matthijs de Ligt",
  "Frenkie de Jong", "Raphinha", "Jules Kounde", "Ronald Araujo", "Ferran Torres",
  // Additional athletes — Basketball
  "Michael Jordan", "Kobe Bryant", "Kareem Abdul-Jabbar", "Wilt Chamberlain", "Magic Johnson",
  "Larry Bird", "Shaquille O'Neal", "Tim Duncan", "Allen Iverson", "Dwyane Wade",
  "Chris Paul", "James Harden", "Russell Westbrook", "Zion Williamson", "Ja Morant",
  "Jayson Tatum", "Donovan Mitchell", "Shai Gilgeous-Alexander", "Victor Wembanyama", "Chet Holmgren",
  "Paolo Banchero", "Tyrese Haliburton", "De'Aaron Fox", "Jalen Brunson", "Julius Randle",
  "Bam Adebayo", "Tyler Herro", "Fred VanVleet", "Pascal Siakam", "OG Anunoby",
  // Additional athletes — Football (NFL)
  "Tom Brady", "Aaron Rodgers", "Peyton Manning", "Drew Brees", "Dan Marino",
  "Joe Montana", "Brett Favre", "John Elway", "Terry Bradshaw", "Troy Aikman",
  "Tua Tagovailoa", "Jordan Love", "C.J. Stroud", "Bryce Young", "Anthony Richardson",
  "Brock Purdy", "Jared Goff", "Matthew Stafford", "Baker Mayfield", "Kyler Murray",
  "Nick Bosa", "Micah Parsons", "T.J. Watt", "Myles Garrett", "Aaron Donald",
  "Derrick Henry", "Saquon Barkley", "Christian McCaffrey", "Jonathan Taylor", "Austin Ekeler",
  "Tyreek Hill", "Justin Jefferson", "Ja'Marr Chase", "CeeDee Lamb", "Stefon Diggs",
  "A.J. Brown", "DeVonta Smith", "Amon-Ra St. Brown", "Deebo Samuel", "DK Metcalf",
  // Additional athletes — Soccer
  "Pele", "Diego Maradona", "Zinedine Zidane", "Ronaldinho", "Ronaldo Nazario",
  "Thierry Henry", "Andrea Pirlo", "Xavi", "Andres Iniesta", "Sergio Ramos",
  "Gerard Pique", "David Beckham", "Wayne Rooney", "Frank Lampard", "Steven Gerrard",
  "Virgil van Dijk", "Alisson", "Ederson", "Thibaut Courtois", "Jan Oblak",
  "Joao Felix", "Dusan Vlahovic", "Victor Osimhen", "Khvicha Kvaratskhelia", "Rafael Leao",
  "Son Heung-min", "Richarlison", "James Maddison", "Heung-Min Son", "Kai Havertz",
  // Additional athletes — Tennis
  "Serena Williams", "Venus Williams", "Pete Sampras", "Andre Agassi", "John McEnroe",
  "Bjorn Borg", "Jimmy Connors", "Boris Becker", "Stefan Edberg", "Ivan Lendl",
  "Carlos Alcaraz", "Jannik Sinner", "Daniil Medvedev", "Alexander Zverev", "Stefanos Tsitsipas",
  "Aryna Sabalenka", "Iga Swiatek", "Coco Gauff", "Jessica Pegula", "Elena Rybakina",
  // Additional athletes — Baseball
  "Babe Ruth", "Hank Aaron", "Willie Mays", "Ted Williams", "Derek Jeter",
  "Alex Rodriguez", "Barry Bonds", "Ken Griffey Jr.", "Mike Piazza", "Cal Ripken Jr.",
  "Mookie Betts", "Juan Soto", "Ronald Acuna Jr.", "Trea Turner", "Corey Seager",
  "Freddie Freeman", "Bryce Harper", "Manny Machado", "Fernando Tatis Jr.", "Yoshinobu Yamamoto",
  // Additional athletes — Golf
  "Jack Nicklaus", "Arnold Palmer", "Phil Mickelson", "Rory McIlroy", "Dustin Johnson",
  "Brooks Koepka", "Bryson DeChambeau", "Xander Schauffele", "Viktor Hovland", "Collin Morikawa",
  "Jordan Spieth", "Justin Thomas", "Patrick Cantlay", "Cameron Smith", "Hideki Matsuyama",
  // Additional athletes — Boxing / MMA
  "Muhammad Ali", "Mike Tyson", "Floyd Mayweather", "Manny Pacquiao", "Oleksandr Usyk",
  "Anthony Joshua", "Deontay Wilder", "Terence Crawford", "Errol Spence Jr.", "Ryan Garcia",
  "Israel Adesanya", "Jon Jones", "Khabib Nurmagomedov", "Dustin Poirier", "Charles Oliveira",
  "Islam Makhachev", "Alex Pereira", "Sean O'Malley", "Leon Edwards", "Ilia Topuria",
  // Additional athletes — F1 / Racing
  "Michael Schumacher", "Ayrton Senna", "Alain Prost", "Sebastian Vettel", "Fernando Alonso",
  "Charles Leclerc", "Lando Norris", "George Russell", "Oscar Piastri", "Carlos Sainz",
  // Additional athletes — Hockey
  "Wayne Gretzky", "Mario Lemieux", "Sidney Crosby", "Alex Ovechkin", "Auston Matthews",
  "Nathan MacKinnon", "Leon Draisaitl", "Cale Makar", "David Pastrnak", "Nikita Kucherov",
  // Additional athletes — Track & Field / Olympics
  "Usain Bolt", "Carl Lewis", "Jesse Owens", "Florence Griffith Joyner", "Michael Johnson",
  "Simone Biles", "Katie Ledecky", "Michael Phelps", "Nadia Comaneci", "Noah Lyles",
  "Sha'Carri Richardson", "Sydney McLaughlin-Levrone", "Mondo Duplantis", "Armand Duplantis", "Jakob Ingebrigtsen",
  // Additional athletes — Cricket
  "Sachin Tendulkar", "Virat Kohli", "MS Dhoni", "Rohit Sharma", "Babar Azam",
  "Joe Root", "Ben Stokes", "Steve Smith", "Pat Cummins", "Jasprit Bumrah",
  // Additional athletes — Rugby
  "Dan Carter", "Jonah Lomu", "Richie McCaw", "Antoine Dupont", "Maro Itoje",
];
