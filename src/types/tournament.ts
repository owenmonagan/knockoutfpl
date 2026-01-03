// src/types/tournament.ts

export type TournamentStatus = 'active' | 'completed';

export interface Participant {
  fplTeamId: number;
  fplTeamName: string;
  managerName: string;
  seed: number; // 1 = top seed (best league rank)
}

export interface MatchPlayer {
  fplTeamId: number;
  seed: number;
  score: number | null; // Stored after GW finishes
  teamName?: string; // Included directly to avoid separate participant lookup
  managerName?: string;
}

export interface Match {
  id: string;
  // New: array of players for N-way matches (optional for backward compatibility)
  players?: MatchPlayer[];
  // Legacy: kept for backward compatibility with 1v1 matches
  player1?: MatchPlayer | null;
  player2?: MatchPlayer | null;
  winnerId: number | null; // FPL team ID
  isBye: boolean;
  updatedAt?: string; // ISO timestamp of last score update
}

export interface Round {
  roundNumber: number;
  name: string; // "Round 1", "Quarter-Finals", "Semi-Finals", "Final"
  gameweek: number;
  matches: Match[];
  isComplete: boolean;
}

export interface Tournament {
  id: string; // Firestore document ID
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUserId: string;
  startGameweek: number; // First round GW (auto-set to next GW)
  currentRound: number; // 1-indexed
  currentGameweek: number; // Actual current FPL gameweek (from Events table)
  totalRounds: number; // Calculated from participant count
  matchSize?: number; // NEW: 2 = 1v1, 3 = 3-way, etc. (optional, defaults to 2)
  status: TournamentStatus;
  participants: Participant[];
  rounds: Round[];
  winnerId: number | null; // FPL team ID of winner
  createdAt: string;
  updatedAt: string;
}

/**
 * Get players from a match (handles both legacy and new format)
 */
export function getMatchPlayers(match: Match): MatchPlayer[] {
  if (match.players && match.players.length > 0) {
    return match.players;
  }
  // Fallback to legacy format
  const players: MatchPlayer[] = [];
  if (match.player1) players.push(match.player1);
  if (match.player2) players.push(match.player2);
  return players;
}
