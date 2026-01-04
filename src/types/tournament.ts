// src/types/tournament.ts

export type TournamentStatus = 'active' | 'completed';

export type TournamentEntryStatus = 'active' | 'eliminated';

/**
 * @deprecated Use TournamentEntry instead. Will be removed in Phase 6.
 */
export interface Participant {
  fplTeamId: number;
  fplTeamName: string;
  managerName: string;
  seed: number; // 1 = top seed (best league rank)
}

/**
 * Represents a participant's entry in a tournament.
 * Maps to the TournamentEntry table in the database schema.
 */
export interface TournamentEntry {
  entryId: number;
  seed: number;
  status: TournamentEntryStatus;
  eliminationRound?: number;
  // Entry details fetched via relation from the Entry table
  entry: {
    name: string;
    playerFirstName: string;
    playerLastName: string;
  };
}

/**
 * Get the full manager name from a TournamentEntry
 */
export function getManagerName(entry: TournamentEntry): string {
  return `${entry.entry.playerFirstName} ${entry.entry.playerLastName}`.trim();
}

/**
 * Get the team name from a TournamentEntry
 */
export function getTeamName(entry: TournamentEntry): string {
  return entry.entry.name;
}

/**
 * Convert a TournamentEntry to the legacy Participant format for backward compatibility
 */
export function tournamentEntryToParticipant(entry: TournamentEntry): Participant {
  return {
    fplTeamId: entry.entryId,
    fplTeamName: entry.entry.name,
    managerName: getManagerName(entry),
    seed: entry.seed,
  };
}

/**
 * Type guard to check if an item is a TournamentEntry
 */
export function isTournamentEntry(
  item: Participant | TournamentEntry
): item is TournamentEntry {
  return 'entryId' in item && 'entry' in item;
}

/**
 * Get the entry ID from either a Participant or TournamentEntry
 */
export function getEntryId(item: Participant | TournamentEntry): number {
  return isTournamentEntry(item) ? item.entryId : item.fplTeamId;
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
  qualifiesTo?: string; // ID of the match this winner advances to (null in final)
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
  /** Accepts both legacy Participant[] and new TournamentEntry[] formats */
  participants: Participant[] | TournamentEntry[];
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
