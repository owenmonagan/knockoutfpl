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
