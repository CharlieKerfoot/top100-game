import type { GameList } from './types';
import { mostConsumedBeveragesHints } from './hints/most-consumed-beverages';

export const mostConsumedBeverages: GameList = {
  id: 'most-consumed-beverages',
  name: 'Most Consumed Beverages',
  description: 'Top 50 beverages by global consumption volume (Statista / Kirin / IWSR 2024)',
  topics: ['food'],
  size: 50,
  hints: mostConsumedBeveragesHints,
  valueLabel: 'Category',
  items: [
    "Water", "Tea", "Coffee", "Milk", "Beer",
    "Carbonated Soft Drinks", "Fruit Juice", "Wine", "Spirits", "Sports & Energy Drinks",
    "Black Tea", "Green Tea", "Herbal Tea", "Oolong Tea", "Masala Chai",
    "Matcha", "Espresso", "Drip Coffee", "Instant Coffee", "Iced Coffee",
    "Coca-Cola", "Pepsi", "Sprite", "Fanta", "7UP",
    "Dr Pepper", "Mountain Dew", "Ginger Ale", "Snow Beer", "Budweiser",
    "Heineken", "Corona", "Tsingtao", "Stella Artois", "Guinness",
    "Red Wine", "White Wine", "Sparkling Wine", "Baijiu", "Vodka",
    "Whiskey", "Rum", "Gin", "Tequila", "Brandy",
    "Orange Juice", "Red Bull", "Gatorade", "Apple Juice", "Chocolate Milk",
  ],
  newUntil: '2026-05-14',
};
