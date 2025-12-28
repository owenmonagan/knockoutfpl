// src/services/tournament.ts
import { httpsCallable } from 'firebase/functions';
import { functions, dataConnect } from '../lib/firebase';
import { getLeagueTournaments } from '@knockoutfpl/dataconnect';
import type { Tournament } from '../types/tournament';

// Cloud Function types
interface CreateTournamentRequest {
  fplLeagueId: number;
}

interface CreateTournamentResponse {
  tournamentId: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
}

/**
 * Get tournament by FPL league ID using Data Connect
 */
export async function getTournamentByLeague(leagueId: number): Promise<Tournament | null> {
  const result = await getLeagueTournaments(dataConnect, { fplLeagueId: leagueId });

  if (!result.data.tournaments || result.data.tournaments.length === 0) {
    return null;
  }

  // Return the first (most recent) tournament for this league
  const tournament = result.data.tournaments[0];
  return {
    id: tournament.id,
    fplLeagueId: leagueId,
    fplLeagueName: tournament.fplLeagueName,
    creatorUserId: tournament.creatorUid,
    startGameweek: tournament.currentRound, // Using currentRound as startGameweek approximation
    currentRound: tournament.currentRound,
    totalRounds: tournament.totalRounds,
    status: tournament.status as 'active' | 'completed',
    participants: [], // Will be loaded separately if needed
    rounds: [], // Will be loaded separately if needed
    winnerId: null, // Will be loaded separately if needed
  };
}

/**
 * Call the createTournament Cloud Function
 * This replaces the client-side bracket generation with server-side logic
 */
export async function callCreateTournament(
  fplLeagueId: number
): Promise<CreateTournamentResponse> {
  const createTournamentFn = httpsCallable<
    CreateTournamentRequest,
    CreateTournamentResponse
  >(functions, 'createTournament');

  const result = await createTournamentFn({ fplLeagueId });
  return result.data;
}
