import type { GameList } from './types';
import { elementsEarthsCrustHints } from './hints/elements-earths-crust';

// Abundance values (ppm by mass) for the upper continental crust.
// Source: Rudnick & Gao (2003), "Composition of the Continental Crust",
// Treatise on Geochemistry, Vol. 3, pp. 1–64. Widely regarded as the
// standard reference for crustal geochemistry.
// A few elements (H, N, C, Cl, F, S) are from Taylor & McLennan (1985)
// and Wedepohl (1995) where Rudnick & Gao values are less constrained.

export const elementsEarthsCrust: GameList = {
  id: 'elements-earths-crust',
  name: "Most Abundant Elements in Earth's Crust",
  description: "Top 50 chemical elements by abundance in Earth's crust (ppm by mass)",
  topics: ['misc'],
  difficulty: 3,
  size: 50,
  hints: elementsEarthsCrustHints,
  valueLabel: 'Abundance (ppm)',
  newUntil: '2025-07-01',
  items: [
    "Oxygen", "Silicon", "Aluminum", "Iron", "Calcium",
    "Sodium", "Magnesium", "Potassium", "Titanium", "Carbon",
    "Hydrogen", "Phosphorus", "Manganese", "Sulfur", "Fluorine",
    "Barium", "Chlorine", "Strontium", "Zirconium", "Vanadium",
    "Chromium", "Rubidium", "Nitrogen", "Zinc", "Cerium",
    "Nickel", "Lanthanum", "Copper", "Neodymium", "Lithium",
    "Yttrium", "Gallium", "Cobalt", "Lead", "Scandium",
    "Niobium", "Thorium", "Boron", "Praseodymium", "Cesium",
    "Samarium", "Dysprosium", "Gadolinium", "Hafnium", "Uranium",
    "Erbium", "Ytterbium", "Beryllium", "Tin", "Germanium",
  ],
  values: [
    "461,000", "282,000", "82,300", "56,300", "41,500",
    "23,600", "23,300", "20,900", "5,650", "2,000",
    "1,400", "1,050", "775", "697", "611",
    "584", "370", "333", "193", "97",
    "92", "84", "83", "67", "63",
    "47", "31", "28", "27", "22",
    "21", "17.5", "17.3", "17", "14",
    "12", "10.5", "10", "6.3", "4.9",
    "4.7", "4.3", "4.0", "3.7", "2.7",
    "2.3", "2.2", "2.1", "2.1", "1.4",
  ],
};
