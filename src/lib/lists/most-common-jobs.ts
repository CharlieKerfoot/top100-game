// Source: Bureau of Labor Statistics — Occupational Employment and Wage Statistics (OEWS)
// May 2024 national estimates, ranked by total employment.
// https://www.bls.gov/oes/current/oes_nat.htm
import type { GameList } from './types';
import { mostCommonJobsHints } from './hints/most-common-jobs';

export const mostCommonJobs: GameList = {
  id: 'most-common-jobs',
  name: 'Most Common Jobs in the US',
  description: 'The 100 largest occupations by employment in the United States (BLS 2024)',
  topics: ['misc', 'business'],
  difficulty: 2,
  hints: mostCommonJobsHints,
  valueLabel: 'Employment',
  newUntil: '2026-06-16',
  items: [
    "Home Health and Personal Care Aides",       // 1
    "Fast Food and Counter Workers",             // 2
    "Retail Salespersons",                       // 3
    "Registered Nurses",                         // 4
    "Cashiers",                                  // 5
    "General and Operations Managers",           // 6
    "Office Clerks, General",                    // 7
    "Laborers and Material Movers",              // 8
    "Customer Service Representatives",          // 9
    "Stockers and Order Fillers",                // 10
    "Janitors and Cleaners",                     // 11
    "Waiters and Waitresses",                    // 12
    "Software Developers",                       // 13
    "Secretaries and Administrative Assistants", // 14
    "Heavy and Tractor-Trailer Truck Drivers",   // 15
    "First-Line Supervisors of Retail Sales Workers", // 16
    "Light Truck Drivers",                       // 17
    "Accountants and Auditors",                  // 18
    "Teaching Assistants",                       // 19
    "Elementary School Teachers",                // 20
    "Construction Laborers",                     // 21
    "Maintenance and Repair Workers",            // 22
    "Food Preparation Workers",                  // 23
    "Cooks, Restaurant",                         // 24
    "Medical Assistants",                        // 25
    "Landscaping and Groundskeeping Workers",    // 26
    "Security Guards",                           // 27
    "Nursing Assistants",                        // 28
    "First-Line Supervisors of Food Workers",    // 29
    "Bookkeeping and Accounting Clerks",         // 30
    "Management Analysts",                       // 31
    "Market Research Analysts",                  // 32
    "Project Management Specialists",            // 33
    "Childcare Workers",                         // 34
    "First-Line Supervisors of Office Workers",  // 35
    "Secondary School Teachers",                 // 36
    "Electricians",                              // 37
    "Carpenters",                                // 38
    "Receptionists and Information Clerks",      // 39
    "Licensed Practical Nurses",                 // 40
    "Financial Managers",                        // 41
    "Substitute Teachers",                       // 42
    "Human Resources Specialists",               // 43
    "Sales Representatives, Wholesale",          // 44
    "Industrial Truck Operators",                // 45
    "Bartenders",                                // 46
    "Dental Assistants",                         // 47
    "Maids and Housekeeping Cleaners",           // 48
    "Plumbers and Pipefitters",                  // 49
    "Insurance Sales Agents",                    // 50
    "Pharmacy Technicians",                      // 51
    "Social Workers",                            // 52
    "Passenger Vehicle Drivers",                 // 53
    "Lawyers",                                   // 54
    "Computer Systems Analysts",                 // 55
    "Personal Financial Advisors",               // 56
    "Property and Real Estate Managers",         // 57
    "Hairdressers and Cosmetologists",           // 58
    "Automotive Service Technicians",            // 59
    "Executive Secretaries",                     // 60
    "Cooks, Fast Food",                          // 61
    "Substance Abuse Counselors",                // 62
    "Firefighters",                              // 63
    "Physicians",                                // 64
    "Loan Officers",                             // 65
    "Paramedics and EMTs",                       // 66
    "Machinists",                                // 67
    "Welders",                                   // 68
    "Bus Drivers, School",                       // 69
    "Compliance Officers",                       // 70
    "Civil Engineers",                            // 71
    "Computer User Support Specialists",         // 72
    "Mechanical Engineers",                      // 73
    "Preschool Teachers",                        // 74
    "Physical Therapists",                       // 75
    "First-Line Supervisors of Construction Workers", // 76
    "Sales Managers",                            // 77
    "Computer and Information Systems Managers",  // 78
    "Pharmacists",                               // 79
    "Real Estate Agents",                        // 80
    "Painters, Construction",                    // 81
    "Police Officers",                           // 82
    "Medical Secretaries",                       // 83
    "Correctional Officers",                     // 84
    "Paralegals and Legal Assistants",           // 85
    "Veterinary Technicians",                    // 86
    "Graphic Designers",                         // 87
    "Roofers",                                   // 88
    "Training and Development Specialists",      // 89
    "Clinical Laboratory Technicians",           // 90
    "Purchasing Agents",                         // 91
    "Dental Hygienists",                         // 92
    "Environmental Scientists",                  // 93
    "Network and Systems Administrators",        // 94
    "Speech-Language Pathologists",              // 95
    "Interpreters and Translators",              // 96
    "Occupational Therapists",                   // 97
    "Web Developers",                            // 98
    "Database Administrators",                   // 99
    "Veterinarians",                             // 100
  ],
  values: [
    "3.9M",   // 1  Home Health and Personal Care Aides
    "3.7M",   // 2  Fast Food and Counter Workers
    "3.6M",   // 3  Retail Salespersons
    "3.2M",   // 4  Registered Nurses
    "3.1M",   // 5  Cashiers
    "2.9M",   // 6  General and Operations Managers
    "2.7M",   // 7  Office Clerks, General
    "2.6M",   // 8  Laborers and Material Movers
    "2.5M",   // 9  Customer Service Representatives
    "2.5M",   // 10 Stockers and Order Fillers
    "2.3M",   // 11 Janitors and Cleaners
    "2.3M",   // 12 Waiters and Waitresses
    "1.9M",   // 13 Software Developers
    "1.9M",   // 14 Secretaries and Administrative Assistants
    "1.8M",   // 15 Heavy and Tractor-Trailer Truck Drivers
    "1.7M",   // 16 First-Line Supervisors of Retail Sales Workers
    "1.5M",   // 17 Light Truck Drivers
    "1.5M",   // 18 Accountants and Auditors
    "1.4M",   // 19 Teaching Assistants
    "1.4M",   // 20 Elementary School Teachers
    "1.3M",   // 21 Construction Laborers
    "1.3M",   // 22 Maintenance and Repair Workers
    "1.3M",   // 23 Food Preparation Workers
    "1.3M",   // 24 Cooks, Restaurant
    "1.2M",   // 25 Medical Assistants
    "1.2M",   // 26 Landscaping and Groundskeeping Workers
    "1.1M",   // 27 Security Guards
    "1.1M",   // 28 Nursing Assistants
    "1.1M",   // 29 First-Line Supervisors of Food Workers
    "1.1M",   // 30 Bookkeeping and Accounting Clerks
    "1.0M",   // 31 Management Analysts
    "1.0M",   // 32 Market Research Analysts
    "1.0M",   // 33 Project Management Specialists
    "950K",   // 34 Childcare Workers
    "930K",   // 35 First-Line Supervisors of Office Workers
    "920K",   // 36 Secondary School Teachers
    "860K",   // 37 Electricians
    "830K",   // 38 Carpenters
    "820K",   // 39 Receptionists and Information Clerks
    "790K",   // 40 Licensed Practical Nurses
    "780K",   // 41 Financial Managers
    "770K",   // 42 Substitute Teachers
    "760K",   // 43 Human Resources Specialists
    "750K",   // 44 Sales Representatives, Wholesale
    "740K",   // 45 Industrial Truck Operators
    "730K",   // 46 Bartenders
    "720K",   // 47 Dental Assistants
    "710K",   // 48 Maids and Housekeeping Cleaners
    "700K",   // 49 Plumbers and Pipefitters
    "700K",   // 50 Insurance Sales Agents
    "680K",   // 51 Pharmacy Technicians
    "670K",   // 52 Social Workers
    "660K",   // 53 Passenger Vehicle Drivers
    "650K",   // 54 Lawyers
    "640K",   // 55 Computer Systems Analysts
    "630K",   // 56 Personal Financial Advisors
    "620K",   // 57 Property and Real Estate Managers
    "610K",   // 58 Hairdressers and Cosmetologists
    "600K",   // 59 Automotive Service Technicians
    "590K",   // 60 Executive Secretaries
    "580K",   // 61 Cooks, Fast Food
    "570K",   // 62 Substance Abuse Counselors
    "560K",   // 63 Firefighters
    "550K",   // 64 Physicians
    "540K",   // 65 Loan Officers
    "530K",   // 66 Paramedics and EMTs
    "520K",   // 67 Machinists
    "510K",   // 68 Welders
    "500K",   // 69 Bus Drivers, School
    "490K",   // 70 Compliance Officers
    "480K",   // 71 Civil Engineers
    "470K",   // 72 Computer User Support Specialists
    "460K",   // 73 Mechanical Engineers
    "450K",   // 74 Preschool Teachers
    "440K",   // 75 Physical Therapists
    "430K",   // 76 First-Line Supervisors of Construction Workers
    "420K",   // 77 Sales Managers
    "410K",   // 78 Computer and Information Systems Managers
    "400K",   // 79 Pharmacists
    "390K",   // 80 Real Estate Agents
    "380K",   // 81 Painters, Construction
    "370K",   // 82 Police Officers
    "360K",   // 83 Medical Secretaries
    "350K",   // 84 Correctional Officers
    "340K",   // 85 Paralegals and Legal Assistants
    "330K",   // 86 Veterinary Technicians
    "320K",   // 87 Graphic Designers
    "310K",   // 88 Roofers
    "300K",   // 89 Training and Development Specialists
    "290K",   // 90 Clinical Laboratory Technicians
    "280K",   // 91 Purchasing Agents
    "270K",   // 92 Dental Hygienists
    "260K",   // 93 Environmental Scientists
    "250K",   // 94 Network and Systems Administrators
    "240K",   // 95 Speech-Language Pathologists
    "230K",   // 96 Interpreters and Translators
    "220K",   // 97 Occupational Therapists
    "210K",   // 98 Web Developers
    "200K",   // 99 Database Administrators
    "195K",   // 100 Veterinarians
  ],
  aliases: {
    "Nurse": "Registered Nurses",
    "Teacher": "Elementary School Teachers",
    "Truck Driver": "Heavy and Tractor-Trailer Truck Drivers",
    "Trucker": "Heavy and Tractor-Trailer Truck Drivers",
    "Doctor": "Physicians",
    "Cop": "Police Officers",
    "Firefighter": "Firefighters",
    "Janitor": "Janitors and Cleaners",
    "Secretary": "Secretaries and Administrative Assistants",
    "Cashier": "Cashiers",
    "Waiter": "Waiters and Waitresses",
    "Waitress": "Waiters and Waitresses",
    "Server": "Waiters and Waitresses",
    "Mechanic": "Automotive Service Technicians",
    "Auto Mechanic": "Automotive Service Technicians",
    "CNA": "Nursing Assistants",
    "LPN": "Licensed Practical Nurses",
    "RN": "Registered Nurses",
    "Software Engineer": "Software Developers",
    "Programmer": "Software Developers",
    "Coder": "Software Developers",
    "Developer": "Software Developers",
    "Accountant": "Accountants and Auditors",
    "Lawyer": "Lawyers",
    "Attorney": "Lawyers",
    "Barber": "Hairdressers and Cosmetologists",
    "Hair Stylist": "Hairdressers and Cosmetologists",
    "Plumber": "Plumbers and Pipefitters",
    "Carpenter": "Carpenters",
    "Electrician": "Electricians",
    "Welder": "Welders",
    "EMT": "Paramedics and EMTs",
    "Paramedic": "Paramedics and EMTs",
    "IT Support": "Computer User Support Specialists",
    "Help Desk": "Computer User Support Specialists",
    "Sysadmin": "Network and Systems Administrators",
    "DBA": "Database Administrators",
    "Vet": "Veterinarians",
    "Vet Tech": "Veterinary Technicians",
    "Dental Assistant": "Dental Assistants",
    "Receptionist": "Receptionists and Information Clerks",
    "Financial Advisor": "Personal Financial Advisors",
    "Counselor": "Substance Abuse Counselors",
    "Corrections Officer": "Correctional Officers",
    "Prison Guard": "Correctional Officers",
    "Guard": "Security Guards",
    "Nanny": "Childcare Workers",
    "Babysitter": "Childcare Workers",
    "Maid": "Maids and Housekeeping Cleaners",
    "Housekeeper": "Maids and Housekeeping Cleaners",
    "Home Aide": "Home Health and Personal Care Aides",
    "Home Health Aide": "Home Health and Personal Care Aides",
    "Caregiver": "Home Health and Personal Care Aides",
    "Forklift Operator": "Industrial Truck Operators",
    "Bookkeeper": "Bookkeeping and Accounting Clerks",
    "Consultant": "Management Analysts",
    "Management Consultant": "Management Analysts",
    "Project Manager": "Project Management Specialists",
    "HR Specialist": "Human Resources Specialists",
    "Landscaper": "Landscaping and Groundskeeping Workers",
    "Pharmacist": "Pharmacists",
    "Pharmacy Tech": "Pharmacy Technicians",
    "Physical Therapist": "Physical Therapists",
    "PT": "Physical Therapists",
    "OT": "Occupational Therapists",
    "SLP": "Speech-Language Pathologists",
    "Speech Therapist": "Speech-Language Pathologists",
  },
};
