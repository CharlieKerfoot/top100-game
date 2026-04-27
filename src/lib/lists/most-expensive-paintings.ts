// Source: Wikipedia "List of most expensive paintings"
// https://en.wikipedia.org/wiki/List_of_most_expensive_paintings
// Ranked by inflation-adjusted value (2025 USD), nominal prices shown
import type { GameList } from './types';
import { mostExpensivePaintingsHints } from './hints/most-expensive-paintings';

export const mostExpensivePaintings: GameList = {
  id: 'most-expensive-paintings',
  name: 'Most Expensive Paintings Ever Sold',
  description: 'Paintings ranked by sale price — auction & private (Wikipedia)',
  topics: ['misc', 'business'],
  difficulty: 3,
  hints: mostExpensivePaintingsHints,
  valueLabel: 'Sale Price',
  size: 50,
  newUntil: '2026-04-14',
  items: [
    "Salvator Mundi", "Interchange", "The Card Players", "Portrait of Elisabeth Lederer", "Nafea Faa Ipoipo",
    "Number 17A", "The Standard Bearer", "Shot Sage Blue Marilyn", "No. 6 (Violet, Green and Red)", "Wasserschlangen II",
    "Pendant portraits of Maerten Soolmans and Oopjen Coppit", "Les Femmes d'Alger", "Nu couché", "Masterpiece", "Nu couché (sur le côté gauche)",
    "Le Rêve", "Portrait of Adele Bloch-Bauer II", "Les Poseuses, Ensemble", "Three Studies of Lucian Freud", "Twelve Landscape Screens",
    "No. 5, 1948", "Femme à la montre", "La Montagne Sainte-Victoire", "Woman III", "Portrait of Adele Bloch-Bauer I",
    "Otahi", "The Scream", "Reclining Nude with Blue Cushion", "Verger avec cyprès", "Young Girl with a Flower Basket",
    "Meules", "Untitled (Basquiat)", "Flag", "Seated Man with a Glass", "Nude, Green Leaves and Bust",
    "Anna's Light", "Silver Car Crash (Double Disaster)", "Garçon à la pipe", "Eight Elvises", "La Montagne Sainte-Victoire vue du bosquet du Château Noir",
    "Nurse", "Dora Maar au Chat", "Triptych, 1976", "Portrait of Dr. Gachet", "Bal du moulin de la Galette",
    "Massacre of the Innocents", "Portrait de l'artiste sans barbe", "Portrait of Joseph Roulin", "Irises", "Les Noces de Pierrette",
  ],
  values: [
    "$450.3M", "$300M", "$250M+", "$236.3M", "$210M",
    "$200M", "$198M", "$195M", "$186M", "$183.8M",
    "$180M", "$179.4M", "$170.4M", "$165M", "$157.2M",
    "$155M", "$150M", "$149.2M", "$142.4M", "$140.8M",
    "$140M", "$139.3M", "$137.7M", "$137.5M", "$135M",
    "$120M", "$119.9M", "$118M", "$117.1M", "$115M",
    "$110.7M", "$110.5M", "$110M", "$107.5M", "$106.5M",
    "$105.7M", "$105.4M", "$104.2M", "$100M", "$100M",
    "$95.4M", "$95.2M", "$86.3M", "$82.5M", "$78.1M",
    "$76.7M", "$71.5M", "$58M+", "$53.9M", "$49.3M",
  ],
  aliases: {
    "Haystacks": "Meules",
    "Mont Sainte-Victoire": "La Montagne Sainte-Victoire",
  },
};
