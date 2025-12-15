// src/types/tournament.ts
import { Timestamp } from 'firebase/firestore';

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
}

export interface Match {
  id: string;
  player1: MatchPlayer | null;
  player2: MatchPlayer | null; // null = BYE
  winnerId: number | null; // FPL team ID
  isBye: boolean;
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
  totalRounds: number; // Calculated from participant count
  status: TournamentStatus;
  participants: Participant[];
  rounds: Round[];
  winnerId: number | null; // FPL team ID of winner
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
