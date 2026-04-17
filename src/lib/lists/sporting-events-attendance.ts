import type { GameList } from './types';
import { sportingEventsAttendanceHints } from './hints/sporting-events-attendance';

// Sources:
//   - Wikipedia: List of men's association football attendance records
//   - topendsports.com: List of the World's Highest Sports Stadium Attendance
//   - Guinness World Records: sport-specific attendance record pages
//   - Various sport-specific Wikipedia articles (boxing, cricket, AFL, NRL, IndyCar, golf)
//
// Notes on attendance figures:
//   - 1950 World Cup Final (Brazil vs Uruguay): official paid = 173,850; total counted = 199,854
//     (Wikipedia uses 173,850 as official; 199,854 is the most commonly cited figure)
//   - Indianapolis 500: exact figures not disclosed; widely cited as ~350,000 for 2016 (100th running)
//   - Figures marked "est." are reported estimates from contemporary sources

export const sportingEventsAttendance: GameList = {
  id: 'sporting-events-attendance',
  name: 'Most Attended Sporting Events',
  description: 'Single sporting events ranked by all-time attendance (Wikipedia / Guinness World Records)',
  topics: ['sports'],
  difficulty: 2,
  size: 50,
  hints: sportingEventsAttendanceHints,
  valueLabel: 'Attendance',
  items: [
    "Indianapolis 500 – IndyCar (2016)", "Waste Management Phoenix Open – Golf (2018)", "Brazil vs Uruguay – World Cup (1950)", "Flamengo vs Fluminense – Campeonato Carioca Final (1963)", "Collision in Korea – Pro Wrestling (1995)",
    "Brazil vs Paraguay – World Cup Qualifier (1954)", "Brazil vs Paraguay – World Cup Qualifier (1969)", "FBR Open Golf Tournament – Scottsdale (2008)", "Kentucky Derby – Horse Racing (2015)", "Battle at Bristol – Virginia Tech vs Tennessee (2016)",
    "Brazil vs Spain – World Cup (1950)", "Persib Bandung vs PSMS Medan – Perserikatan Final (1985)", "Scotland vs England – Home International (1937)", "Brazil vs Uruguay – Copa América (1989)", "Celtic vs Aberdeen – Scottish Cup Final (1937)",
    "Rangers vs Hibernian – Scottish Cup (1948)", "Scotland vs England – Home International (1948)", "Celtic vs Hibernian – Scottish Cup (1937)", "Brazil vs Yugoslavia – World Cup (1950)", "Brazil vs Chile – World Cup Qualifier (1989)",
    "Brazil vs Sweden – World Cup (1950)", "Celtic vs Leeds United – European Cup Semi-Final (1970)", "Benfica vs Porto – Primeira Liga (1987)", "Rangers vs Greenock Morton – Scottish Cup (1948)", "Celtic vs Rangers – Scottish Cup (1969)",
    "Julio César Chávez vs Greg Haugen – Boxing (1993)", "East Bengal vs Mohun Bagan – Federation Cup (1997)", "Brazil vs Argentina – Copa América (1979)", "Bolivia vs Argentina – Copa América (1926)", "Brazil vs Uruguay – Campeonato Sul-Americano (1949)",
    "Scotland vs England – Home International (1933)", "Real Madrid vs AC Milan – European Cup Semi-Final (1956)", "Iran vs Australia – World Cup Qualifier (1997)", "Real Madrid vs Eintracht Frankfurt – European Cup Final (1960)", "Bolton Wanderers vs West Ham – FA Cup Final (1923)",
    "Real Madrid vs ACF Fiorentina – European Cup Final (1957)", "Melbourne Cup – Horse Racing (2003)", "Carlton vs Collingwood – VFL Grand Final (1970)", "African Cup of Nations Final – Egypt vs Cameroon (1986)", "Celtic vs Motherwell – Scottish Cup Final (1931)",
    "Notre Dame vs USC – College Football (1927)", "Celtic vs Rangers – Old Firm League (1938)", "Rangers vs Celtic – Old Firm Derby (1939)", "Los Angeles Dodgers vs Boston Red Sox – MLB Exhibition (2008)", "Argentina vs West Germany – World Cup Final (1986)",
    "India vs Sri Lanka – Cricket World Cup Semi-Final (1996)", "Mexico vs Brazil – CONCACAF Gold Cup (1999)", "2010 NBA All-Star Game – Dallas (2010)", "1999 NRL Grand Final – Melbourne vs St George Illawarra", "Super Bowl XIV – Pittsburgh Steelers vs Los Angeles Rams (1980)",
  ],
  values: [
    "350,000", "216,818", "199,854", "194,603", "190,000",
    "183,513", "183,341", "170,802", "170,513", "156,990",
    "152,772", "150,000", "149,547", "148,068", "147,365",
    "143,570", "143,000", "143,000", "142,429", "141,072",
    "138,886", "136,505", "135,000", "133,750", "132,870",
    "132,247", "131,781", "130,000", "130,000", "130,000",
    "130,000", "129,690", "128,000", "127,621", "126,047",
    "124,000", "122,736", "121,696", "120,480", "120,000",
    "120,000", "118,730", "118,567", "115,300", "114,800",
    "110,564", "110,000", "108,713", "107,558", "103,985",
  ],
};
