import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { fetchFPLBootstrapData, fetchFPLLeagueStandings } from './fplApi';
import {
  calculateBracketSize,
  calculateTotalRounds,
  generateBracketStructure,
  assignParticipantsToMatches,
} from './bracketGenerator';

export interface CreateTournamentRequest {
  fplLeagueId: number;
}

export interface CreateTournamentResponse {
  tournamentId: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
}

/**
 * Validate the incoming request data
 */
export function validateTournamentRequest(data: any): asserts data is CreateTournamentRequest {
  if (!data.fplLeagueId) {
    throw new HttpsError('invalid-argument', 'fplLeagueId is required');
  }
  if (typeof data.fplLeagueId !== 'number') {
    throw new HttpsError('invalid-argument', 'fplLeagueId must be a number');
  }
}

/**
 * Validate league standings data
 */
export function validateLeagueStandings(standings: any): void {
  if (!standings || !standings.standings?.results) {
    throw new HttpsError('not-found', 'League not found');
  }

  const count = standings.standings.results.length;

  if (count < 4) {
    throw new HttpsError('failed-precondition', 'League must have at least 4 participants');
  }

  if (count > 50) {
    throw new HttpsError('failed-precondition', 'League exceeds maximum 50 participants');
  }
}
