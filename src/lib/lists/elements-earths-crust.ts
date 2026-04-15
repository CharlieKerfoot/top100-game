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
    "Sodium", "Potassium", "Magnesium", "Titanium", "Hydrogen",
    "Phosphorus", "Manganese", "Fluorine", "Barium", "Strontium",
    "Sulfur", "Carbon", "Zirconium", "Vanadium", "Chlorine",
    "Chromium", "Rubidium", "Nickel", "Zinc", "Cerium",
    "Copper", "Yttrium", "Lanthanum", "Neodymium", "Cobalt",
    "Scandium", "Lithium", "Niobium", "Nitrogen", "Gallium",
    "Lead", "Boron", "Thorium", "Samarium", "Gadolinium",
    "Praseodymium", "Dysprosium", "Ytterbium", "Hafnium", "Erbium",
    "Cesium", "Beryllium", "Tin", "Uranium", "Germanium",
  ],
  values: [
    "461,000", "282,000", "82,300", "56,300", "41,500",
    "23,600", "20,900", "23,300", "5,650", "1,400",
    "1,050", "775", "611", "584", "333",
    "697", "2,000", "193", "97", "370",
    "92", "84", "47", "67", "63",
    "28", "21", "31", "27", "17.3",
    "14", "22", "12", "83", "17.5",
    "17", "10", "10.5", "4.7", "4.0",
    "6.3", "4.3", "2.2", "3.7", "2.3",
    "4.9", "2.1", "2.1", "2.7", "1.4",
  ],
};
