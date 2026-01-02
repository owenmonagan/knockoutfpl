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
  upsertEntriesBatch,
  upsertPicksBatch,
  createRoundsBatch,
  createParticipantsBatch,
  createMatchesBatch,
  updateMatchesBatch,
  createMatchPicksBatch,
  AuthClaims,
  UpdateMatchInput,
} from './dataconnect-mutations';

// Database entity types (matching Data Connect schema)
interface EntryRecord {
  entryId: number;
  season: string;
  name: string;
  playerFirstName?: string;
  playerLastName?: string;
  summaryOverallPoints?: number;
  rawJson: string;
}

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
  startEvent?: number;  // Optional, defaults to currentGW + 1
  matchSize?: number;   // Optional, defaults to 2 (1v1)
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
  // Validate optional startEvent if provided
  if (data.startEvent !== undefined) {
    if (typeof data.startEvent !== 'number') {
      throw new HttpsError('invalid-argument', 'startEvent must be a number');
    }
    if (data.startEvent < 1 || data.startEvent > 38) {
      throw new HttpsError('invalid-argument', 'startEvent must be between 1 and 38');
    }
  }
  // Validate optional matchSize if provided
  if (data.matchSize !== undefined) {
    if (typeof data.matchSize !== 'number') {
      throw new HttpsError('invalid-argument', 'matchSize must be a number');
    }
    if (data.matchSize < 2 || data.matchSize > 8) {
      throw new HttpsError('invalid-argument', 'matchSize must be between 2 and 8');
    }
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

  if (count > 48) {
    throw new HttpsError('failed-precondition', 'League exceeds maximum 48 participants');
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
  entries: EntryRecord[];
  tournament: TournamentRecord;
  rounds: RoundRecord[];
  participants: ParticipantRecord[];
  matchRecords: MatchRecord[];
  matchPicks: MatchPickRecord[];
} {
  const leagueData = standings.league;
  const standingsResults = standings.standings.results;

  // Get current season (e.g., "2024-25")
  const currentYear = new Date().getFullYear();
  const season = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;

  // Entries (FPL team data from league standings)
  const entries: EntryRecord[] = standingsResults.map((p: any) => {
    // Parse player name into first/last
    const nameParts = (p.player_name || '').split(' ');
    const playerFirstName = nameParts[0] || '';
    const playerLastName = nameParts.slice(1).join(' ') || '';

    return {
      entryId: p.entry,
      season,
      name: p.entry_name,
      playerFirstName,
      playerLastName,
      summaryOverallPoints: p.total,
      rawJson: JSON.stringify(p),
    };
  });

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

      // Advance BYE winner to next round
      if (match.qualifiesToMatchId && entry1) {
        const slot = assignment.position % 2 === 1 ? 1 : 2; // Odd positions → slot 1, even → slot 2
        matchPicks.push({
          tournamentId,
          matchId: match.qualifiesToMatchId,
          entryId: entry1,
          slot,
        });
      }
    }
  }

  return { entries, tournament, rounds, participants, matchRecords, matchPicks };
}

/**
 * Write tournament records to database using Data Connect Admin SDK with impersonation
 */
async function writeTournamentToDatabase(
  tournamentId: string,
  records: ReturnType<typeof buildTournamentRecords>,
  authClaims: AuthClaims
): Promise<void> {
  console.log('[createTournament] Writing to database (batched):', {
    tournamentId,
    entryCount: records.entries.length,
    roundCount: records.rounds.length,
    participantCount: records.participants.length,
    matchCount: records.matchRecords.length,
    matchPickCount: records.matchPicks.length,
  });

  // 1. Create entries first (participants have FK to entries)
  console.log(`[createTournament] Batch upserting ${records.entries.length} entries...`);
  await upsertEntriesBatch(
    records.entries.map(entry => ({
      entryId: entry.entryId,
      season: entry.season,
      name: entry.name,
      playerFirstName: entry.playerFirstName,
      playerLastName: entry.playerLastName,
      summaryOverallPoints: entry.summaryOverallPoints,
      rawJson: entry.rawJson,
    })),
    authClaims
  );

  // 2. Create placeholder picks for tournament gameweeks
  const pickCount = records.entries.length * records.rounds.length;
  console.log(`[createTournament] Batch upserting ${pickCount} placeholder picks...`);
  const allPicks = records.entries.flatMap(entry =>
    records.rounds.map(round => ({
      entryId: entry.entryId,
      event: round.event,
      points: 0,
      rawJson: '{}',
      isFinal: false,
    }))
  );
  await upsertPicksBatch(allPicks, authClaims);

  // 3. Create tournament (must exist before rounds/participants reference it)
  console.log('[createTournament] Creating tournament record...');
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

  // 4. Create rounds (batch)
  console.log(`[createTournament] Batch creating ${records.rounds.length} rounds...`);
  await createRoundsBatch(
    records.rounds.map(round => ({
      tournamentId,
      roundNumber: round.roundNumber,
      event: round.event,
      status: round.status,
    })),
    authClaims
  );

  // 5. Create participants (batch)
  console.log(`[createTournament] Batch creating ${records.participants.length} participants...`);
  await createParticipantsBatch(
    records.participants.map(participant => ({
      tournamentId,
      entryId: participant.entryId,
      teamName: participant.teamName,
      managerName: participant.managerName,
      seed: participant.seed,
      leagueRank: participant.leagueRank,
      leaguePoints: participant.leaguePoints,
      rawJson: participant.rawJson,
    })),
    authClaims
  );

  // 6. Create matches (batch)
  console.log(`[createTournament] Batch creating ${records.matchRecords.length} matches...`);
  await createMatchesBatch(
    records.matchRecords.map(match => ({
      tournamentId,
      matchId: match.matchId,
      roundNumber: match.roundNumber,
      positionInRound: match.positionInRound,
      qualifiesToMatchId: match.qualifiesToMatchId,
      isBye: match.isBye,
      status: match.isBye ? 'complete' : 'active',
    })),
    authClaims
  );
  console.log(`[createTournament] Matches created successfully`);

  // 6b. Update bye matches with winners (batch)
  const byeMatchUpdates: UpdateMatchInput[] = records.matchRecords
    .filter(match => match.isBye && match.winnerEntryId)
    .map(match => ({
      tournamentId,
      matchId: match.matchId,
      roundNumber: match.roundNumber,
      positionInRound: match.positionInRound,
      qualifiesToMatchId: match.qualifiesToMatchId,
      isBye: true,
      status: 'complete',
      winnerEntryId: match.winnerEntryId,
    }));

  if (byeMatchUpdates.length > 0) {
    console.log(`[createTournament] Batch updating ${byeMatchUpdates.length} bye matches with winners...`);
    await updateMatchesBatch(byeMatchUpdates, authClaims);
    console.log(`[createTournament] Bye matches updated successfully`);
  }

  // 7. Create match picks (batch)
  console.log(`[createTournament] Batch creating ${records.matchPicks.length} match picks...`);

  // Verify all matchPick references are valid
  const matchIdSet = new Set(records.matchRecords.map(m => m.matchId));
  const entryIdSet = new Set(records.entries.map(e => e.entryId));
  const participantKeySet = new Set(records.participants.map(p => `${p.entryId}`));

  const invalidMatchRefs = records.matchPicks.filter(p => !matchIdSet.has(p.matchId));
  const invalidEntryRefs = records.matchPicks.filter(p => !entryIdSet.has(p.entryId));
  const invalidParticipantRefs = records.matchPicks.filter(p => !participantKeySet.has(`${p.entryId}`));

  if (invalidMatchRefs.length > 0) {
    console.error(`[createTournament] INVALID MATCH REFS: ${JSON.stringify(invalidMatchRefs)}`);
    console.error(`[createTournament] Valid matchIds: ${[...matchIdSet].join(', ')}`);
  }
  if (invalidEntryRefs.length > 0) {
    console.error(`[createTournament] INVALID ENTRY REFS: ${JSON.stringify(invalidEntryRefs)}`);
  }
  if (invalidParticipantRefs.length > 0) {
    console.error(`[createTournament] INVALID PARTICIPANT REFS: ${JSON.stringify(invalidParticipantRefs)}`);
  }

  // Log detailed matchPicks info for debugging
  const round1MatchCount = records.matchRecords.filter(m => m.roundNumber === 1).length;
  const round2MatchPicks = records.matchPicks.filter(p => p.matchId > round1MatchCount);
  console.log(`[createTournament] Round 1 match picks: ${records.matchPicks.length - round2MatchPicks.length}`);
  console.log(`[createTournament] Round 2+ match picks (bye advancements): ${round2MatchPicks.length}`);
  if (round2MatchPicks.length > 0) {
    console.log(`[createTournament] Round 2+ matchIds: ${[...new Set(round2MatchPicks.map(p => p.matchId))].join(', ')}`);
  }

  await createMatchPicksBatch(
    records.matchPicks.map(pick => ({
      tournamentId,
      matchId: pick.matchId,
      entryId: pick.entryId,
      slot: pick.slot,
    })),
    authClaims
  );

  console.log('[createTournament] Database writes complete');
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
  const { fplLeagueId, startEvent: requestedStartEvent } = request.data;

  console.log(`[createTournament] Request received: fplLeagueId=${fplLeagueId}, startEvent=${requestedStartEvent ?? 'auto'}, uid=${uid}`);

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
  // Use provided startEvent or default to next gameweek
  const startEvent = requestedStartEvent ?? currentGW + 1;

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
