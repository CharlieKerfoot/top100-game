import type { GameList } from './types';
import { mostConsumedBeveragesHints } from './hints/most-consumed-beverages';

export const mostConsumedBeverages: GameList = {
  id: 'most-consumed-beverages',
  name: 'Most Consumed Beverages',
  description: 'Top 50 beverages by global consumption volume (Statista / Kirin / IWSR 2024)',
  topics: ['food'],
  difficulty: 1,
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
  values: [
    "Non-Alcoholic", "Non-Alcoholic", "Non-Alcoholic", "Non-Alcoholic", "Alcohol",
    "Non-Alcoholic", "Non-Alcoholic", "Alcohol", "Alcohol", "Non-Alcoholic",
    "Tea", "Tea", "Tea", "Tea", "Tea",
    "Tea", "Coffee", "Coffee", "Coffee", "Coffee",
    "Soft Drink", "Soft Drink", "Soft Drink", "Soft Drink", "Soft Drink",
    "Soft Drink", "Soft Drink", "Soft Drink", "Beer", "Beer",
    "Beer", "Beer", "Beer", "Beer", "Beer",
    "Wine", "Wine", "Wine", "Spirit", "Spirit",
    "Spirit", "Spirit", "Spirit", "Spirit", "Spirit",
    "Juice", "Energy Drink", "Sports Drink", "Juice", "Dairy",
  ],
  newUntil: '2026-05-14',
};
