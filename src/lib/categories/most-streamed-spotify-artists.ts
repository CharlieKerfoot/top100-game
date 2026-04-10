import type { Category } from './types';
import { mostStreamedSpotifyArtistsHints } from './hints';

export const mostStreamedSpotifyArtists: Category = {
  id: 'most-streamed-spotify-artists',
  name: 'Most Streamed Artists on Spotify',
  description: 'All-time most streamed artists on Spotify',
  tags: ['music', 'entertainment'],
  hints: mostStreamedSpotifyArtistsHints,
  items: [
    "Taylor Swift", "Drake", "Bad Bunny", "The Weeknd", "Ariana Grande",
    "Ed Sheeran", "Billie Eilish", "Eminem", "Kanye West", "Post Malone",
    "BTS", "Justin Bieber", "Bruno Mars", "Rihanna", "Coldplay",
    "Travis Scott", "Kendrick Lamar", "Dua Lipa", "J Balvin", "Imagine Dragons",
    "Juice WRLD", "Lana Del Rey", "Lady Gaga", "David Guetta", "XXXTENTACION",
    "Future", "Ozuna", "Chris Brown", "Nicki Minaj", "Rauw Alejandro",
    "Lil Wayne", "Anuel AA", "21 Savage", "SZA", "KAROL G",
    "Khalid", "Lil Baby", "Arijit Singh", "Maroon 5", "Beyoncé",
    "Maluma", "Feid", "Calvin Harris", "Myke Towers", "Lil Uzi Vert",
    "Linkin Park", "J. Cole", "Peso Pluma", "Sia", "Young Thug",
    "Doja Cat", "Shakira", "Morgan Wallen", "Farruko", "Shawn Mendes",
    "Sam Smith", "Queen", "One Direction", "Harry Styles", "Metro Boomin",
    "Adele", "Gunna", "Arctic Monkeys", "Pritam", "Katy Perry",
    "Tyler, The Creator", "Selena Gomez", "Olivia Rodrigo", "Ty Dolla $ign", "Junior H",
    "The Beatles", "Nicky Jam", "Halsey", "Playboi Carti", "Wiz Khalifa",
    "Fuerza Regida", "Pitbull", "Frank Ocean", "Die drei ???", "JAY-Z",
    "A$AP Rocky", "The Chainsmokers", "Miley Cyrus", "Marshmello", "Sabrina Carpenter",
    "Cardi B", "Twenty One Pilots", "Disney", "Michael Jackson", "Camila Cabello",
    "Arcángel", "Red Hot Chili Peppers", "$uicideboy$", "OneRepublic", "Avicii",
    "Snoop Dogg", "DaBaby", "50 Cent", "Romeo Santos", "Natanael Cano",
  ],
};
