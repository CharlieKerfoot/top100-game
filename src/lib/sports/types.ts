// ============================================================
// SPORTS DATABASE TYPES
// ============================================================
// Each sport has a player/fighter record with all relevant stats.
// Lists are derived from these records by sorting — no
// duplicate data, and hints automatically include every entry.
//
// DATA CUTOFF: Stats reflect career totals through end of
// 2024-25 seasons (NBA, NHL, MLB, NFL through 2024 season,
// UFC through April 2026, Soccer through April 2026).
// Update the player files and re-run `top100By` to refresh.
// ============================================================

export interface NHLPlayer {
  name: string;
  points: number;
  goals: number;
}

export interface NBAPlayer {
  name: string;
  points: number;
  minutes: number;
}

export interface MLBBatter {
  name: string;
  battingWAR: number;
  homeRuns: number;
}

export interface MLBPitcher {
  name: string;
  pitchingWAR: number;
  strikeoutsThrown: number;
}

export interface MLBTwoWayPlayer {
  name: string;
  battingWAR: number;
  pitchingWAR: number;
  homeRuns: number;
  strikeoutsThrown: number;
}

export interface NFLQuarterback {
  name: string;
  passingYards: number;
  touchdowns: number;
}

export interface NFLRunningBack {
  name: string;
  rushingYards: number;
  touchdowns: number;
}

export interface NFLReceiver {
  name: string;
  receivingYards: number;
  receptions: number;
  touchdowns: number;
}

export interface UFCFighter {
  name: string;
  wins: number;
  losses: number;
  fights: number;
  finishes: number;
  sigStrikes: number;
  takedowns: number;
}

export interface SoccerPlayer {
  name: string;
  goals: number;
  assists: number;
}
