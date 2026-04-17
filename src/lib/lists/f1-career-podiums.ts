import type { GameList } from './types';
import { f1DriversHints } from './hints/f1-drivers';

export const f1CareerPodiums: GameList = {
  id: 'f1-career-podiums',
  name: 'F1 Drivers by Career Podiums',
  description: 'Formula 1 drivers ranked by all-time career podium finishes (through 2025 season)',
  topics: ['sports'],
  size: 50,
  difficulty: 3,
  hints: f1DriversHints,
  valueLabel: 'Podiums',
  items: [
    "Lewis Hamilton", "Michael Schumacher", "Sebastian Vettel", "Max Verstappen", "Alain Prost",
    "Fernando Alonso", "Kimi Raikkonen", "Ayrton Senna", "Rubens Barrichello", "Valtteri Bottas",
    "David Coulthard", "Nelson Piquet", "Nigel Mansell", "Nico Rosberg", "Niki Lauda",
    "Mika Hakkinen", "Jenson Button", "Gerhard Berger", "Charles Leclerc", "Damon Hill",
    "Carlos Reutemann", "Mark Webber", "Jackie Stewart", "Sergio Perez", "Felipe Massa",
    "Riccardo Patrese", "Graham Hill", "Juan Manuel Fangio", "Emerson Fittipaldi", "Lando Norris",
    "Jim Clark", "Jean Alesi", "Daniel Ricciardo", "Jack Brabham", "Jody Scheckter",
    "Denny Hulme", "Juan Pablo Montoya", "Clay Regazzoni", "Carlos Sainz", "Ralf Schumacher",
    "Ronnie Peterson", "Stirling Moss", "John Surtees", "Alan Jones", "Jacques Villeneuve",
    "Rene Arnoux", "Eddie Irvine", "Alberto Ascari", "Keke Rosberg", "George Russell",
  ],
  values: [
    "202", "155", "122", "112", "106",
    "106", "103", "80", "68", "67",
    "62", "60", "59", "57", "54",
    "51", "50", "48", "45", "42",
    "45", "42", "43", "39", "41",
    "37", "36", "35", "35", "35",
    "32", "32", "32", "31", "33",
    "33", "30", "28", "27", "27",
    "26", "24", "24", "24", "23",
    "22", "22", "17", "17", "16",
  ],
};
