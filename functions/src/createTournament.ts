import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { fetchFPLBootstrapData, fetchFPLLeagueStandings } from './fplApi';
import {
  calculateBracketSize,
  calculateTotalRounds,
  generateBracketStructure,
  assignParticipantsToMatches,
  BracketMatch,
  MatchAssignment,
} from './bracketGenerator';
import {
  createTournamentAdmin,
  createRoundAdmin,
  createParticipantAdmin,
  createMatchAdmin,
  updateMatchAdmin,
  createMatchPickAdmin,
  AuthClaims,
} from './dataconnect-mutations';

// Database entity types (matching Data Connect schema)
interface TournamentRecord {
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUid: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
  seedingMethod: string;
}

interface RoundRecord {
  tournamentId: string;
  roundNumber: number;
  event: number;
  status: string;
}

interface ParticipantRecord {
  tournamentId: string;
  entryId: number;
  teamName: string;
  managerName: string;
  seed: number;
  leagueRank: number;
  leaguePoints: number;
  rawJson: string;
}

interface MatchRecord {
  tournamentId: string;
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId: number | null;
  isBye: boolean;
  status: string;
  winnerEntryId?: number;
}

interface MatchPickRecord {
  tournamentId: string;
  matchId: number;
  entryId: number;
  slot: number;
}

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
 * Build all database records for a tournament
 */
export function buildTournamentRecords(
  tournamentId: string,
  uid: string,
  standings: any,
  bracketSize: number,
  totalRounds: number,
  startEvent: number,
  matches: BracketMatch[],
  matchAssignments: MatchAssignment[]
): {
  tournament: TournamentRecord;
  rounds: RoundRecord[];
  participants: ParticipantRecord[];
  matchRecords: MatchRecord[];
  matchPicks: MatchPickRecord[];
} {
  const leagueData = standings.league;
  const standingsResults = standings.standings.results;

  // Tournament
  const tournament: TournamentRecord = {
    fplLeagueId: leagueData.id,
    fplLeagueName: leagueData.name,
    creatorUid: uid,
    participantCount: standingsResults.length,
    totalRounds,
    startEvent,
    seedingMethod: 'league_rank',
  };

  // Rounds
  const rounds: RoundRecord[] = [];
  for (let r = 1; r <= totalRounds; r++) {
    rounds.push({
      tournamentId,
      roundNumber: r,
      event: startEvent + r - 1,
      status: r === 1 ? 'active' : 'pending',
    });
  }

  // Participants (seed = rank in league)
  const participants: ParticipantRecord[] = standingsResults.map((p: any, index: number) => ({
    tournamentId,
    entryId: p.entry,
    teamName: p.entry_name,
    managerName: p.player_name,
    seed: index + 1,
    leagueRank: p.rank,
    leaguePoints: p.total,
    rawJson: JSON.stringify(p),
  }));

  // Create entry lookup by seed
  const seedToEntry = new Map<number, number>();
  participants.forEach(p => seedToEntry.set(p.seed, p.entryId));

  // Matches
  const matchRecords: MatchRecord[] = matches.map(m => ({
    tournamentId,
    matchId: m.matchId,
    roundNumber: m.roundNumber,
    positionInRound: m.positionInRound,
    qualifiesToMatchId: m.qualifiesToMatchId,
    isBye: false, // Updated below
    status: m.roundNumber === 1 ? 'active' : 'pending',
  }));

  // Match picks (round 1 only)
  const matchPicks: MatchPickRecord[] = [];
  for (const assignment of matchAssignments) {
    const match = matchRecords.find(m => m.roundNumber === 1 && m.positionInRound === assignment.position);
    if (!match) continue;

    // Add slot 1 (higher seed)
    const entry1 = seedToEntry.get(assignment.seed1);
    if (entry1) {
      matchPicks.push({
        tournamentId,
        matchId: match.matchId,
        entryId: entry1,
        slot: 1,
      });
    }

    // Add slot 2 (lower seed) if not a bye
    if (assignment.seed2 !== null) {
      const entry2 = seedToEntry.get(assignment.seed2);
      if (entry2) {
        matchPicks.push({
          tournamentId,
          matchId: match.matchId,
          entryId: entry2,
          slot: 2,
        });
      }
    } else {
      // Mark as bye and set winner
      match.isBye = true;
      match.status = 'complete';
      match.winnerEntryId = entry1;
    }
  }

  return { tournament, rounds, participants, matchRecords, matchPicks };
}

/**
 * Write tournament records to database using Data Connect Admin SDK with impersonation
 */
async function writeTournamentToDatabase(
  tournamentId: string,
  records: ReturnType<typeof buildTournamentRecords>,
  authClaims: AuthClaims
): Promise<void> {
  // 1. Create tournament
  await createTournamentAdmin(
    {
      id: tournamentId,
      fplLeagueId: records.tournament.fplLeagueId,
      fplLeagueName: records.tournament.fplLeagueName,
      creatorUid: records.tournament.creatorUid,
      participantCount: records.tournament.participantCount,
      totalRounds: records.tournament.totalRounds,
      startEvent: records.tournament.startEvent,
      seedingMethod: records.tournament.seedingMethod,
    },
    authClaims
  );

  // 2. Create rounds
  for (const round of records.rounds) {
    await createRoundAdmin(
      {
        tournamentId,
        roundNumber: round.roundNumber,
        event: round.event,
        status: round.status,
      },
      authClaims
    );
  }

  // 3. Create participants
  for (const participant of records.participants) {
    await createParticipantAdmin(
      {
        tournamentId,
        entryId: participant.entryId,
        teamName: participant.teamName,
        managerName: participant.managerName,
        seed: participant.seed,
        leagueRank: participant.leagueRank,
        leaguePoints: participant.leaguePoints,
        rawJson: participant.rawJson,
      },
      authClaims
    );
  }

  // 4. Create matches
  for (const match of records.matchRecords) {
    await createMatchAdmin(
      {
        tournamentId,
        matchId: match.matchId,
        roundNumber: match.roundNumber,
        positionInRound: match.positionInRound,
        qualifiesToMatchId: match.qualifiesToMatchId,
        isBye: match.isBye,
      },
      authClaims
    );

    // Update bye matches with status and winner
    if (match.isBye && match.winnerEntryId) {
      await updateMatchAdmin(
        {
          tournamentId,
          matchId: match.matchId,
          roundNumber: match.roundNumber,
          positionInRound: match.positionInRound,
          qualifiesToMatchId: match.qualifiesToMatchId,
          isBye: true,
          status: 'complete',
          winnerEntryId: match.winnerEntryId,
        },
        authClaims
      );
    }
  }

  // 5. Create match picks
  for (const pick of records.matchPicks) {
    await createMatchPickAdmin(
      {
        tournamentId,
        matchId: pick.matchId,
        entryId: pick.entryId,
        slot: pick.slot,
      },
      authClaims
    );
  }
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

  // Extract auth claims for impersonation
  const authClaims: AuthClaims = {
    sub: uid,
    email: request.auth.token.email,
    email_verified: request.auth.token.email_verified,
  };

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

  // 7. Build all records
  const tournamentId = crypto.randomUUID();
  const records = buildTournamentRecords(
    tournamentId,
    uid,
    standings,
    bracketSize,
    totalRounds,
    startEvent,
    matches,
    matchAssignments
  );

  // 8. Write to database with impersonation
  await writeTournamentToDatabase(tournamentId, records, authClaims);

  return {
    tournamentId,
    participantCount: records.tournament.participantCount,
    totalRounds: records.tournament.totalRounds,
    startEvent,
  };
});
