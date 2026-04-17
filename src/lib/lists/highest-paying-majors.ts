// Source: PayScale 2024 College Salary Report & BestColleges research
// Ranked by early-career median salary (0–5 years experience)
import type { GameList } from './types';
import { highestPayingMajorsHints } from './hints/highest-paying-majors';

export const highestPayingMajors: GameList = {
  id: 'highest-paying-majors',
  name: 'Highest Paying College Majors',
  description: 'The 50 highest-paying bachelor\'s degrees by early-career salary (PayScale 2024)',
  topics: ['education', 'business'],
  difficulty: 2,
  hints: highestPayingMajorsHints,
  valueLabel: 'Early-Career Salary',
  size: 50,
  newUntil: '2026-06-16',
  items: [
    "Computer Science",             // 1 - $80,000
    "Computer Engineering",         // 2 - $80,000
    "Chemical Engineering",         // 3 - $80,000
    "Electrical Engineering",       // 4 - $78,000
    "Aerospace Engineering",        // 5 - $76,000
    "Industrial Engineering",       // 6 - $76,000
    "Mechanical Engineering",       // 7 - $75,000
    "Civil Engineering",            // 8 - $71,000
    "Physics",                      // 9 - $70,000
    "Finance",                      // 10 - $70,000
    "Economics",                    // 11 - $70,000
    "Business Analytics",           // 12 - $70,000
    "Construction Management",      // 13 - $70,000
    "General Engineering",          // 14 - $70,000
    "Mathematics",                  // 15 - $65,000
    "Nursing",                      // 16 - $65,000
    "Information Systems",          // 17 - $65,000
    "Accounting",                   // 18 - $60,000
    "International Relations",      // 19 - $60,000
    "Statistics",                   // 20 - $60,000
    "General Business",             // 21 - $60,000
    "Marketing",                    // 22 - $57,000
    "Business Management",          // 23 - $55,000
    "Chemistry",                    // 24 - $55,000
    "Pharmacy",                     // 25 - $55,000
    "Medical Technology",           // 26 - $55,000
    "Nutrition Sciences",           // 27 - $54,000
    "Political Science",            // 28 - $54,000
    "Environmental Engineering",    // 29 - $53,000
    "Biomedical Engineering",       // 30 - $53,000
    "Materials Science",            // 31 - $53,000
    "Software Engineering",         // 32 - $52,000
    "Journalism",                   // 33 - $50,000
    "Supply Chain Management",      // 34 - $50,000
    "Biochemistry",                 // 35 - $50,000
    "Architecture",                 // 36 - $50,000
    "Health Administration",        // 37 - $49,000
    "Biology",                      // 38 - $47,000
    "Actuarial Science",            // 39 - $47,000
    "Criminal Justice",             // 40 - $46,000
    "Communications",               // 41 - $46,000
    "Public Health",                // 42 - $45,000
    "Graphic Design",               // 43 - $45,000
    "Psychology",                   // 44 - $43,000
    "English",                      // 45 - $42,000
    "Sociology",                    // 46 - $42,000
    "History",                      // 47 - $42,000
    "Education",                    // 48 - $41,000
    "Social Work",                  // 49 - $40,000
    "Fine Arts",                    // 50 - $40,000
  ],
  values: [
    "$80,000", "$80,000", "$80,000", "$78,000", "$76,000",
    "$76,000", "$75,000", "$71,000", "$70,000", "$70,000",
    "$70,000", "$70,000", "$70,000", "$70,000", "$65,000",
    "$65,000", "$65,000", "$60,000", "$60,000", "$60,000",
    "$60,000", "$57,000", "$55,000", "$55,000", "$55,000",
    "$55,000", "$54,000", "$54,000", "$53,000", "$53,000",
    "$53,000", "$52,000", "$50,000", "$50,000", "$50,000",
    "$50,000", "$49,000", "$47,000", "$47,000", "$46,000",
    "$46,000", "$45,000", "$45,000", "$43,000", "$42,000",
    "$42,000", "$42,000", "$41,000", "$40,000", "$40,000",
  ],
  aliases: {
    "CS": "Computer Science",
    "Comp Sci": "Computer Science",
    "EE": "Electrical Engineering",
    "Electrical": "Electrical Engineering",
    "ME": "Mechanical Engineering",
    "MechE": "Mechanical Engineering",
    "ChemE": "Chemical Engineering",
    "CE": "Civil Engineering",
    "CivE": "Civil Engineering",
    "AE": "Aerospace Engineering",
    "IE": "Industrial Engineering",
    "BME": "Biomedical Engineering",
    "Biomed": "Biomedical Engineering",
    "Econ": "Economics",
    "Poly Sci": "Political Science",
    "Poli Sci": "Political Science",
    "PoliSci": "Political Science",
    "Psych": "Psychology",
    "Bio": "Biology",
    "Biochem": "Biochemistry",
    "Math": "Mathematics",
    "Stats": "Statistics",
    "Stat": "Statistics",
    "Comm": "Communications",
    "Comms": "Communications",
    "MIS": "Information Systems",
    "Management Information Systems": "Information Systems",
    "Info Systems": "Information Systems",
    "IT": "Information Systems",
    "Business Admin": "Business Management",
    "Business Administration": "Business Management",
    "BBA": "Business Management",
    "MBA": "Business Management",
    "Med Tech": "Medical Technology",
    "Chem": "Chemistry",
    "Supply Chain": "Supply Chain Management",
    "SCM": "Supply Chain Management",
    "Logistics": "Supply Chain Management",
    "IR": "International Relations",
    "International Affairs": "International Relations",
    "Health Admin": "Health Administration",
    "Healthcare Administration": "Health Administration",
    "CJ": "Criminal Justice",
    "Criminology": "Criminal Justice",
    "Art": "Fine Arts",
    "Studio Art": "Fine Arts",
    "Visual Arts": "Fine Arts",
    "Graphic Arts": "Graphic Design",
    "RN": "Nursing",
    "BSN": "Nursing",
    "Pre-Med": "Biology",
    "Actuarial": "Actuarial Science",
    "SWE": "Software Engineering",
    "MatSci": "Materials Science",
    "Materials Engineering": "Materials Science",
    "EnvE": "Environmental Engineering",
    "Environmental": "Environmental Engineering",
    "Construction": "Construction Management",
    "Data Analytics": "Business Analytics",
    "Analytics": "Business Analytics",
  },
};
