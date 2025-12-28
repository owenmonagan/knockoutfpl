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

/**
 * Get current gameweek from bootstrap data
 */
export function getCurrentGameweek(bootstrapData: any): number {
  const currentEvent = bootstrapData.events?.find((e: any) => e.is_current);
  if (!currentEvent) {
    throw new HttpsError('failed-precondition', 'Could not determine current gameweek');
  }
  return currentEvent.id;
}

/**
 * Cloud Function to create a knockout tournament
 */
export const createTournament = onCall(async (request: CallableRequest<CreateTournamentRequest>) => {
  // 1. Validate auth
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in to create a tournament');
  }
  const uid = request.auth.uid;

  // 2. Validate request
  validateTournamentRequest(request.data);
  const { fplLeagueId } = request.data;

  // 3. Fetch FPL data
  const [standings, bootstrapData] = await Promise.all([
    fetchFPLLeagueStandings(fplLeagueId),
    fetchFPLBootstrapData(),
  ]);

  // 4. Validate league
  validateLeagueStandings(standings);

  // 5. Calculate bracket structure
  const participantCount = standings.standings.results.length;
  const bracketSize = calculateBracketSize(participantCount);
  const totalRounds = calculateTotalRounds(bracketSize);
  const currentGW = getCurrentGameweek(bootstrapData);
  const startEvent = currentGW + 1;

  // 6. Generate bracket
  const matches = generateBracketStructure(bracketSize);
  const matchAssignments = assignParticipantsToMatches(bracketSize, participantCount);

  // 7. TODO: Write to database via Data Connect
  // For now, return calculated values
  const tournamentId = crypto.randomUUID();

  console.log('Tournament created:', {
    tournamentId,
    fplLeagueId,
    creatorUid: uid,
    participantCount,
    bracketSize,
    totalRounds,
    startEvent,
    matchCount: matches.length,
    matchAssignments: matchAssignments.length,
  });

  return {
    tournamentId,
    participantCount,
    totalRounds,
    startEvent,
  };
});
