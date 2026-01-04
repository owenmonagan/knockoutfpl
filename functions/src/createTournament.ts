import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { getFunctions } from 'firebase-admin/functions';
import { fetchFPLBootstrapData, fetchFPLLeagueStandings } from './fplApi';
import { getLeagueParticipantCount, getTournamentSizeTier } from './fplLeagueCount';
import {
  calculateBracketSize,
  calculateTotalRounds,
  generateBracketStructure,
  assignParticipantsToMatches,
  BracketMatch,
  MatchAssignment,
} from './bracketGenerator';
import {
  calculateNWayBracket,
  generateNWayBracketStructure,
  assignParticipantsToNWayMatches,
  NWayBracketMatch,
  NWayMatchAssignment,
} from './nWayBracket';
import {
  createTournamentAdmin,
  upsertPicksBatch,
  createRoundsBatch,
  createTournamentEntriesBatch,
  createMatchesBatch,
  updateMatchesBatch,
  createMatchPicksBatch,
  AuthClaims,
  UpdateMatchInput,
} from './dataconnect-mutations';
import { refreshLeague } from './leagueRefresh';

// Database entity types (matching Data Connect schema)
interface TournamentRecord {
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUid: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
  seedingMethod: string;
  matchSize: number;
}

interface RoundRecord {
  tournamentId: string;
  roundNumber: number;
  event: number;
  status: string;
}

interface TournamentEntryRecord {
  tournamentId: string;
  entryId: number;
  seed: number;
  refreshId: string;
  status: string;
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

/**
 * Get the current FPL season string (e.g., "2024-25")
 */
export function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // FPL season runs Aug-May
  // If we're in Jan-Jul, we're in the previous year's season
  if (month < 7) { // Jan-Jul
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
  // Aug-Dec, we're in this year's season
  return `${year}-${(year + 1).toString().slice(-2)}`;
}

export interface CreateTournamentResponse {
  tournamentId: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
  importStatus?: 'pending' | 'complete';  // For large tournaments
  size?: 'standard' | 'large' | 'mega';   // Tournament size tier
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
 * Validate league standings data (first page only)
 * Note: Large leagues will have more participants fetched via background import
 */
export function validateLeagueStandings(standings: any): void {
  if (!standings || !standings.standings?.results) {
    throw new HttpsError('not-found', 'League not found');
  }

  const count = standings.standings.results.length;

  if (count < 2) {
    throw new HttpsError('failed-precondition', 'League must have at least 2 participants');
  }
  // No upper limit - large leagues are handled via background import
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
  matchAssignments: MatchAssignment[],
  matchSize: number = 2,
  refreshId: string = ''
): {
  tournament: TournamentRecord;
  rounds: RoundRecord[];
  tournamentEntries: TournamentEntryRecord[];
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
    matchSize,
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

  // TournamentEntries (seed = index + 1, based on league standings order)
  const tournamentEntries: TournamentEntryRecord[] = standingsResults.map((p: any, index: number) => ({
    tournamentId,
    entryId: p.entry,
    seed: index + 1,
    refreshId,
    status: 'active',
  }));

  // Create entry lookup by seed
  const seedToEntry = new Map<number, number>();
  tournamentEntries.forEach(te => seedToEntry.set(te.seed, te.entryId));

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

  return { tournament, rounds, tournamentEntries, matchRecords, matchPicks };
}

/**
 * Build all database records for an N-way tournament (matchSize > 2)
 */
export function buildNWayTournamentRecords(
  tournamentId: string,
  uid: string,
  standings: any,
  totalSlots: number,
  totalRounds: number,
  startEvent: number,
  matches: NWayBracketMatch[],
  matchAssignments: NWayMatchAssignment[],
  matchSize: number,
  refreshId: string = ''
): {
  tournament: TournamentRecord;
  rounds: RoundRecord[];
  tournamentEntries: TournamentEntryRecord[];
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
    matchSize,
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

  // TournamentEntries (seed = index + 1, based on league standings order)
  const tournamentEntries: TournamentEntryRecord[] = standingsResults.map((p: any, index: number) => ({
    tournamentId,
    entryId: p.entry,
    seed: index + 1,
    refreshId,
    status: 'active',
  }));

  // Create entry lookup by seed
  const seedToEntry = new Map<number, number>();
  tournamentEntries.forEach(te => seedToEntry.set(te.seed, te.entryId));

  // Matches (from N-way structure)
  const matchRecords: MatchRecord[] = matches.map(m => ({
    tournamentId,
    matchId: m.matchId,
    roundNumber: m.roundNumber,
    positionInRound: m.positionInRound,
    qualifiesToMatchId: m.qualifiesToMatchId,
    isBye: false, // Updated below
    status: m.roundNumber === 1 ? 'active' : 'pending',
  }));

  // Match picks (round 1 only) - N-way version
  const matchPicks: MatchPickRecord[] = [];

  for (const assignment of matchAssignments) {
    // Find the match for this assignment (position-based)
    const match = matchRecords.find(m => m.roundNumber === 1 && m.positionInRound === assignment.position);
    if (!match) continue;

    // Add all real players to slots
    let slotNum = 1;
    let realPlayerCount = 0;
    let firstRealEntry: number | undefined;

    for (const seed of assignment.seeds) {
      if (seed !== null) {
        const entryId = seedToEntry.get(seed);
        if (entryId) {
          matchPicks.push({
            tournamentId,
            matchId: match.matchId,
            entryId,
            slot: slotNum,
          });
          realPlayerCount++;
          if (!firstRealEntry) firstRealEntry = entryId;
        }
      }
      slotNum++;
    }

    // If only 1 real player, this is an auto-advance (bye)
    if (realPlayerCount === 1 && firstRealEntry) {
      match.isBye = true;
      match.status = 'complete';
      match.winnerEntryId = firstRealEntry;

      // Advance winner to next round
      if (match.qualifiesToMatchId) {
        // Determine slot in next round based on position
        // Groups 1-matchSize → next match slots 1-matchSize
        const slotInNextRound = ((assignment.position - 1) % matchSize) + 1;
        matchPicks.push({
          tournamentId,
          matchId: match.qualifiesToMatchId,
          entryId: firstRealEntry,
          slot: slotInNextRound,
        });
      }
    }
  }

  return { tournament, rounds, tournamentEntries, matchRecords, matchPicks };
}

/**
 * Write tournament records to database using Data Connect Admin SDK with impersonation
 * Note: Entry and Pick records are created by refreshLeague before this function is called
 */
async function writeTournamentToDatabase(
  tournamentId: string,
  records: ReturnType<typeof buildTournamentRecords>,
  authClaims: AuthClaims
): Promise<void> {
  console.log('[createTournament] Writing to database (batched):', {
    tournamentId,
    roundCount: records.rounds.length,
    tournamentEntryCount: records.tournamentEntries.length,
    matchCount: records.matchRecords.length,
    matchPickCount: records.matchPicks.length,
  });

  // 1. Create placeholder picks for tournament gameweeks
  // Note: Entry records are already created by refreshLeague
  const pickCount = records.tournamentEntries.length * records.rounds.length;
  console.log(`[createTournament] Batch upserting ${pickCount} placeholder picks...`);
  const allPicks = records.tournamentEntries.flatMap(te =>
    records.rounds.map(round => ({
      entryId: te.entryId,
      event: round.event,
      points: 0,
      rawJson: '{}',
      isFinal: false,
    }))
  );
  await upsertPicksBatch(allPicks, authClaims);

  // 2. Create tournament (must exist before rounds/tournamentEntries reference it)
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
      matchSize: records.tournament.matchSize,
    },
    authClaims
  );

  // 3. Create rounds (batch)
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

  // 4. Create tournament entries (batch)
  console.log(`[createTournament] Batch creating ${records.tournamentEntries.length} tournament entries...`);
  await createTournamentEntriesBatch(
    records.tournamentEntries.map(te => ({
      tournamentId,
      entryId: te.entryId,
      seed: te.seed,
      refreshId: te.refreshId,
      status: te.status,
    })),
    authClaims
  );

  // 5. Create matches (batch)
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

  // 5b. Update bye matches with winners (batch)
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

  // 6. Create match picks (batch)
  console.log(`[createTournament] Batch creating ${records.matchPicks.length} match picks...`);

  // Verify all matchPick references are valid
  const matchIdSet = new Set(records.matchRecords.map(m => m.matchId));
  const entryIdSet = new Set(records.tournamentEntries.map(te => te.entryId));

  const invalidMatchRefs = records.matchPicks.filter(p => !matchIdSet.has(p.matchId));
  const invalidEntryRefs = records.matchPicks.filter(p => !entryIdSet.has(p.entryId));

  if (invalidMatchRefs.length > 0) {
    console.error(`[createTournament] INVALID MATCH REFS: ${JSON.stringify(invalidMatchRefs)}`);
    console.error(`[createTournament] Valid matchIds: ${[...matchIdSet].join(', ')}`);
  }
  if (invalidEntryRefs.length > 0) {
    console.error(`[createTournament] INVALID ENTRY REFS: ${JSON.stringify(invalidEntryRefs)}`);
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
 * Creates a tournament shell for large leagues and enqueues background import.
 * Used for leagues with >48 participants.
 */
async function createLargeTournamentShell(
  fplLeagueId: number,
  fplLeagueName: string,
  participantCount: number,
  startEvent: number,
  matchSize: number,
  sizeTier: 'large' | 'mega',
  authClaims: AuthClaims
): Promise<CreateTournamentResponse> {
  const tournamentId = crypto.randomUUID();

  // Calculate total rounds based on participant count and match size
  let totalRounds: number;
  if (matchSize === 2) {
    const bracketSize = calculateBracketSize(participantCount);
    totalRounds = calculateTotalRounds(bracketSize);
  } else {
    const nWayResult = calculateNWayBracket(participantCount, matchSize);
    totalRounds = nWayResult.rounds;
  }

  console.log(`[createTournament] Creating large tournament shell: ${participantCount} participants, ${totalRounds} rounds, tier=${sizeTier}`);

  // Create tournament record with pending import status
  await createTournamentAdmin(
    {
      id: tournamentId,
      fplLeagueId,
      fplLeagueName,
      creatorUid: authClaims.sub as string,
      participantCount: 0, // Will be updated after import
      totalRounds,
      startEvent,
      seedingMethod: 'league_rank',
      matchSize,
      // Import tracking fields
      size: sizeTier,
      importStatus: 'pending',
      importProgress: 0,
      importedCount: 0,
      totalCount: participantCount,
    },
    authClaims
  );

  // Enqueue Cloud Task for background import
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
  if (isEmulator) {
    console.log(`[createTournament] Running in emulator - triggering import via HTTP`);
    // Fire-and-forget: trigger import in background via HTTP
    const payload = {
      tournamentId,
      leagueId: fplLeagueId,
      totalCount: participantCount,
      phase: 'importing',
      cursor: 1,
    };
    setTimeout(async () => {
      try {
        await fetch('http://127.0.0.1:5001/knockoutfpl-dev/europe-west1/processTournamentImport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: payload }),
        });
        console.log(`[createTournament] Import task triggered successfully`);
      } catch (error) {
        console.error('[createTournament] Failed to trigger import task:', error);
      }
    }, 500); // Small delay to ensure tournament is created first
  } else {
    try {
      const queue = getFunctions().taskQueue('processTournamentImport');
      await queue.enqueue({
        tournamentId,
        leagueId: fplLeagueId,
        totalCount: participantCount,
      });
      console.log(`[createTournament] Enqueued import task for tournament ${tournamentId}`);
    } catch (error) {
      console.error('[createTournament] Failed to enqueue import task:', error);
      // Mark tournament as failed if we can't enqueue
      throw new HttpsError('internal', 'Failed to start background import');
    }
  }

  return {
    tournamentId,
    participantCount,
    totalRounds,
    startEvent,
    importStatus: 'pending',
    size: sizeTier,
  };
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

  // 5. Check if league is large (has more pages)
  const hasMorePages = standings.standings.has_next;
  let actualParticipantCount = standings.standings.results.length;

  if (hasMorePages) {
    console.log(`[createTournament] Large league detected (has_next=true), counting participants via binary search...`);
    actualParticipantCount = await getLeagueParticipantCount(fplLeagueId);
    console.log(`[createTournament] League has ${actualParticipantCount} participants`);
  }

  const sizeTier = getTournamentSizeTier(actualParticipantCount);
  console.log(`[createTournament] Size tier: ${sizeTier}`);

  // 6. For large/mega tournaments, use background import
  if (sizeTier !== 'standard') {
    const currentGW = getCurrentGameweek(bootstrapData);
    const startEvent = requestedStartEvent ?? currentGW + 1;

    return await createLargeTournamentShell(
      fplLeagueId,
      standings.league.name,
      actualParticipantCount,
      startEvent,
      request.data.matchSize ?? 2,
      sizeTier,
      authClaims
    );
  }

  // 7. Standard tournaments (≤48 participants) - sync flow
  const participantCount = standings.standings.results.length;
  const matchSize = request.data.matchSize ?? 2;

  // Use N-way bracket calculator for matchSize > 2
  let bracketSize: number;
  let totalRounds: number;

  if (matchSize === 2) {
    // Traditional 1v1 bracket
    bracketSize = calculateBracketSize(participantCount);
    totalRounds = calculateTotalRounds(bracketSize);
  } else {
    // N-way bracket
    const nWayResult = calculateNWayBracket(participantCount, matchSize);
    bracketSize = nWayResult.totalSlots;
    totalRounds = nWayResult.rounds;
  }

  const currentGW = getCurrentGameweek(bootstrapData);
  // Use provided startEvent or default to next gameweek
  const startEvent = requestedStartEvent ?? currentGW + 1;

  console.log(`[createTournament] Bracket: ${participantCount} participants, matchSize=${matchSize}, ${totalRounds} rounds`);

  // 7a. Refresh league data (creates/updates Entry and LeagueEntry records)
  const season = getCurrentSeason();
  console.log(`[createTournament] Refreshing league ${fplLeagueId} for season ${season}...`);
  const refreshResult = await refreshLeague(fplLeagueId, season);
  console.log(`[createTournament] League refreshed: refreshId=${refreshResult.refreshId}, entries=${refreshResult.entriesUpdated}`);

  // 8. Generate bracket and build records
  const tournamentId = crypto.randomUUID();
  let records: ReturnType<typeof buildTournamentRecords>;

  if (matchSize === 2) {
    // Traditional 1v1 bracket
    const matches = generateBracketStructure(bracketSize);
    const matchAssignments = assignParticipantsToMatches(bracketSize, participantCount);
    records = buildTournamentRecords(
      tournamentId,
      uid,
      standings,
      bracketSize,
      totalRounds,
      startEvent,
      matches,
      matchAssignments,
      matchSize,
      refreshResult.refreshId
    );
  } else {
    // N-way bracket (3-way, 4-way, etc.)
    const matches = generateNWayBracketStructure(matchSize, totalRounds);
    const matchAssignments = assignParticipantsToNWayMatches(matchSize, bracketSize, participantCount);
    records = buildNWayTournamentRecords(
      tournamentId,
      uid,
      standings,
      bracketSize,
      totalRounds,
      startEvent,
      matches,
      matchAssignments,
      matchSize,
      refreshResult.refreshId
    );
  }

  // 9. Write to database with impersonation
  await writeTournamentToDatabase(tournamentId, records, authClaims);

  return {
    tournamentId,
    participantCount: records.tournament.participantCount,
    totalRounds: records.tournament.totalRounds,
    startEvent,
  };
});
