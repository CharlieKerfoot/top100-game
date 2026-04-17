// Source: Bureau of Labor Statistics — Census of Fatal Occupational Injuries (CFOI) 2022–2024
// Ranked by fatal injury rate per 100,000 full-time equivalent (FTE) workers
import type { GameList } from './types';
import { mostDangerousJobsHints } from './hints/most-dangerous-jobs';

export const mostDangerousJobs: GameList = {
  id: 'most-dangerous-jobs',
  name: 'Most Dangerous Jobs in the US',
  description: 'The 50 deadliest occupations by fatality rate per 100K workers (BLS CFOI)',
  topics: ['misc'],
  difficulty: 2,
  hints: mostDangerousJobsHints,
  valueLabel: 'Deaths per 100K',
  size: 50,
  newUntil: '2026-06-16',
  items: [
    "Logging Workers",                                  // 1
    "Aircraft Pilots and Flight Engineers",              // 2
    "Roofers",                                          // 3
    "Fishing and Hunting Workers",                      // 4
    "Structural Iron and Steel Workers",                // 5
    "Refuse and Recyclable Material Collectors",        // 6
    "Helpers, Construction Trades",                     // 7
    "Farmers, Ranchers, and Agricultural Managers",     // 8
    "Heavy and Tractor-Trailer Truck Drivers",          // 9
    "Power Line Installers and Repairers",              // 10
    "Mining Machine Operators",                         // 11
    "Grounds Maintenance Workers",                      // 12
    "Construction Laborers",                            // 13
    "Operating Engineers and Construction Equipment Operators", // 14
    "First-Line Supervisors of Construction Workers",   // 15
    "Electricians",                                     // 16
    "Industrial Machinery Mechanics",                   // 17
    "Maintenance and Repair Workers",                   // 18
    "Delivery Truck Drivers",                           // 19
    "Painters, Construction and Maintenance",           // 20
    "Police Officers",                                  // 21
    "Firefighters",                                     // 22
    "Carpenters",                                       // 23
    "Plumbers, Pipefitters, and Steamfitters",          // 24
    "First-Line Supervisors of Mechanics",              // 25
    "Industrial Truck and Tractor Operators",           // 26
    "Automotive Service Technicians",                   // 27
    "Welders, Cutters, and Brazers",                    // 28
    "Highway Maintenance Workers",                      // 29
    "Taxi Drivers and Chauffeurs",                      // 30
    "Bus Drivers",                                      // 31
    "Logging Equipment Operators",                      // 32
    "Crane and Tower Operators",                        // 33
    "Derrick, Rotary Drill, and Service Unit Operators", // 34
    "Hoist and Winch Operators",                        // 35
    "Explosives Workers and Blasters",                  // 36
    "Underground Mining Machine Operators",             // 37
    "Oil and Gas Extraction Workers",                   // 38
    "First-Line Supervisors of Farming Workers",        // 39
    "Forestry Workers",                                 // 40
    "Animal Slaughterers and Meat Packers",             // 41
    "Cement Masons and Concrete Finishers",             // 42
    "Drywall Installers and Tapers",                    // 43
    "Sheet Metal Workers",                              // 44
    "Glaziers",                                         // 45
    "Septic Tank Servicers and Sewer Pipe Cleaners",    // 46
    "Earth Drillers",                                   // 47
    "Hazardous Materials Removal Workers",              // 48
    "Ambulance Drivers and Attendants",                 // 49
    "Correctional Officers",                            // 50
  ],
  values: [
    "82.2",   // Logging Workers
    "61.8",   // Aircraft Pilots and Flight Engineers
    "47.4",   // Roofers
    "44.1",   // Fishing and Hunting Workers
    "36.1",   // Structural Iron and Steel Workers
    "33.6",   // Refuse and Recyclable Material Collectors
    "31.4",   // Helpers, Construction Trades
    "26.1",   // Farmers, Ranchers, and Agricultural Managers
    "25.8",   // Heavy and Tractor-Trailer Truck Drivers
    "23.7",   // Power Line Installers and Repairers
    "22.5",   // Mining Machine Operators
    "21.9",   // Grounds Maintenance Workers
    "19.6",   // Construction Laborers
    "18.1",   // Operating Engineers
    "17.3",   // First-Line Supervisors of Construction
    "16.8",   // Electricians
    "16.0",   // Industrial Machinery Mechanics
    "15.1",   // Maintenance and Repair Workers
    "14.5",   // Delivery Truck Drivers
    "14.0",   // Painters, Construction and Maintenance
    "13.5",   // Police Officers
    "12.8",   // Firefighters
    "12.4",   // Carpenters
    "11.8",   // Plumbers, Pipefitters, and Steamfitters
    "11.5",   // First-Line Supervisors of Mechanics
    "11.2",   // Industrial Truck and Tractor Operators
    "10.8",   // Automotive Service Technicians
    "10.5",   // Welders, Cutters, and Brazers
    "10.1",   // Highway Maintenance Workers
    "9.8",    // Taxi Drivers and Chauffeurs
    "9.5",    // Bus Drivers
    "9.2",    // Logging Equipment Operators
    "9.0",    // Crane and Tower Operators
    "8.7",    // Derrick/Rotary Drill Operators
    "8.4",    // Hoist and Winch Operators
    "8.1",    // Explosives Workers and Blasters
    "7.9",    // Underground Mining Machine Operators
    "7.6",    // Oil and Gas Extraction Workers
    "7.3",    // First-Line Supervisors of Farming
    "7.0",    // Forestry Workers
    "6.8",    // Animal Slaughterers and Meat Packers
    "6.5",    // Cement Masons and Concrete Finishers
    "6.3",    // Drywall Installers and Tapers
    "6.1",    // Sheet Metal Workers
    "5.9",    // Glaziers
    "5.7",    // Septic Tank Servicers
    "5.5",    // Earth Drillers
    "5.3",    // Hazardous Materials Removal Workers
    "5.1",    // Ambulance Drivers and Attendants
    "5.0",    // Correctional Officers
  ],
  aliases: {
    "Logger": "Logging Workers",
    "Lumberjack": "Logging Workers",
    "Pilot": "Aircraft Pilots and Flight Engineers",
    "Roofer": "Roofers",
    "Fisherman": "Fishing and Hunting Workers",
    "Fisher": "Fishing and Hunting Workers",
    "Commercial Fisherman": "Fishing and Hunting Workers",
    "Crab Fisherman": "Fishing and Hunting Workers",
    "Hunter": "Fishing and Hunting Workers",
    "Ironworker": "Structural Iron and Steel Workers",
    "Steel Worker": "Structural Iron and Steel Workers",
    "Garbage Collector": "Refuse and Recyclable Material Collectors",
    "Garbage Man": "Refuse and Recyclable Material Collectors",
    "Trash Collector": "Refuse and Recyclable Material Collectors",
    "Sanitation Worker": "Refuse and Recyclable Material Collectors",
    "Farmer": "Farmers, Ranchers, and Agricultural Managers",
    "Rancher": "Farmers, Ranchers, and Agricultural Managers",
    "Truck Driver": "Heavy and Tractor-Trailer Truck Drivers",
    "Trucker": "Heavy and Tractor-Trailer Truck Drivers",
    "Semi Driver": "Heavy and Tractor-Trailer Truck Drivers",
    "Lineman": "Power Line Installers and Repairers",
    "Power Lineman": "Power Line Installers and Repairers",
    "Lineworker": "Power Line Installers and Repairers",
    "Miner": "Mining Machine Operators",
    "Coal Miner": "Mining Machine Operators",
    "Landscaper": "Grounds Maintenance Workers",
    "Groundskeeper": "Grounds Maintenance Workers",
    "Construction Worker": "Construction Laborers",
    "Electrician": "Electricians",
    "Mechanic": "Automotive Service Technicians",
    "Auto Mechanic": "Automotive Service Technicians",
    "Delivery Driver": "Delivery Truck Drivers",
    "Painter": "Painters, Construction and Maintenance",
    "House Painter": "Painters, Construction and Maintenance",
    "Cop": "Police Officers",
    "Police Officer": "Police Officers",
    "Firefighter": "Firefighters",
    "Fireman": "Firefighters",
    "Carpenter": "Carpenters",
    "Plumber": "Plumbers, Pipefitters, and Steamfitters",
    "Pipefitter": "Plumbers, Pipefitters, and Steamfitters",
    "Steamfitter": "Plumbers, Pipefitters, and Steamfitters",
    "Forklift Operator": "Industrial Truck and Tractor Operators",
    "Forklift Driver": "Industrial Truck and Tractor Operators",
    "Welder": "Welders, Cutters, and Brazers",
    "Cab Driver": "Taxi Drivers and Chauffeurs",
    "Taxi Driver": "Taxi Drivers and Chauffeurs",
    "Uber Driver": "Taxi Drivers and Chauffeurs",
    "Bus Driver": "Bus Drivers",
    "Crane Operator": "Crane and Tower Operators",
    "Oil Worker": "Oil and Gas Extraction Workers",
    "Oil Rig Worker": "Oil and Gas Extraction Workers",
    "Roughneck": "Oil and Gas Extraction Workers",
    "Driller": "Derrick, Rotary Drill, and Service Unit Operators",
    "Drill Operator": "Derrick, Rotary Drill, and Service Unit Operators",
    "EMT": "Ambulance Drivers and Attendants",
    "Ambulance Driver": "Ambulance Drivers and Attendants",
    "Prison Guard": "Correctional Officers",
    "Corrections Officer": "Correctional Officers",
    "HazMat Worker": "Hazardous Materials Removal Workers",
    "HazMat": "Hazardous Materials Removal Workers",
    "Butcher": "Animal Slaughterers and Meat Packers",
    "Meat Packer": "Animal Slaughterers and Meat Packers",
    "Slaughterhouse Worker": "Animal Slaughterers and Meat Packers",
    "Cement Mason": "Cement Masons and Concrete Finishers",
    "Concrete Worker": "Cement Masons and Concrete Finishers",
    "Drywall Installer": "Drywall Installers and Tapers",
    "Glazier": "Glaziers",
    "Blaster": "Explosives Workers and Blasters",
    "Demolition Expert": "Explosives Workers and Blasters",
  },
};
