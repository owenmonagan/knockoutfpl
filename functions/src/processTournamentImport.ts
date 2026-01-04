// functions/src/processTournamentImport.ts
// Cloud Task handler for background import of large FPL leagues
// Uses chunked processing with checkpointing for resilience
//
// Phases:
// 1. importing                 - Populates LeagueEntry (shared) using refreshLeague
// 2. creating_tournament_entries - Creates TournamentEntry from LeagueEntry
// 3. creating_rounds           - Create round records (quick, single batch)
// 4. creating_matches          - Create match records in batches
// 5. creating_picks            - Create match_picks and handle byes in batches
// 6. complete                  - Done

import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { getFunctions } from 'firebase-admin/functions';
import { dataConnectAdmin } from './dataconnect-admin';
import {
  createRoundsBatch,
  createTournamentEntriesBatch,
  createMatchesBatch,
  updateMatchesBatch,
  createMatchPicksBatch,
  upsertPicksBatch,
  type AuthClaims,
} from './dataconnect-mutations';
import {
  calculateBracketSize,
  generateBracketStructure,
  assignParticipantsToMatches,
} from './bracketGenerator';
import { refreshLeague } from './leagueRefresh';

// Configuration
const MATCHES_PER_BATCH = 5000;  // Matches to create per batch
const PICKS_PER_BATCH = 5000;  // Match picks to create per batch
const TOURNAMENT_ENTRIES_PER_BATCH = 1000;  // Tournament entries to create per batch
const RESCHEDULE_DELAY_SECONDS = 2;  // Delay between batches

// Import phases
type ImportPhase = 'importing' | 'creating_tournament_entries' | 'creating_rounds' | 'creating_matches' | 'creating_picks' | 'complete';

// GraphQL mutations
const UPDATE_IMPORT_CHECKPOINT = `
  mutation UpdateImportCheckpoint(
    $id: UUID!,
    $importStatus: String!,
    $importProgress: Int!,
    $importedCount: Int!,
    $importCursor: Int!,
    $importError: String
  ) {
    tournament_update(
      id: $id,
      data: {
        importStatus: $importStatus,
        importProgress: $importProgress,
        importedCount: $importedCount,
        importCursor: $importCursor,
        importError: $importError
      }
    )
  }
`;

const FINALIZE_TOURNAMENT_IMPORT = `
  mutation FinalizeTournamentImport(
    $id: UUID!,
    $participantCount: Int!
  ) {
    tournament_update(
      id: $id,
      data: {
        importStatus: "complete",
        importProgress: 100,
        participantCount: $participantCount,
        status: "active",
        importedCount: $participantCount,
        importCursor: null,
        updatedAt_expr: "request.time"
      }
    )
  }
`;

const GET_TOURNAMENT_FOR_IMPORT = `
  query GetTournamentForImport($id: UUID!) {
    tournament(id: $id) {
      id
      fplLeagueId
      startEvent
      matchSize
      creatorUid
      totalRounds
      importCursor
      importStatus
      totalCount
    }
  }
`;

const GET_ALL_TOURNAMENT_ENTRIES = `
  query GetAllTournamentEntries($tournamentId: UUID!, $limit: Int!) {
    tournamentEntries(where: { tournamentId: { eq: $tournamentId } }, orderBy: [{ seed: ASC }], limit: $limit) {
      entryId
      seed
    }
  }
`;

const GET_LEAGUE_ENTRIES = `
  query GetLeagueEntries($leagueId: Int!, $season: String!, $limit: Int!, $offset: Int!) {
    leagueEntries(
      where: { leagueId: { eq: $leagueId }, season: { eq: $season } }
      orderBy: [{ rank: ASC }]
      limit: $limit
      offset: $offset
    ) {
      entryId
      rank
      entry {
        name
        playerFirstName
        playerLastName
      }
    }
  }
`;

const GET_LEAGUE_REFRESH_ID = `
  query GetLeagueRefreshId($leagueId: Int!, $season: String!) {
    leagues(
      where: { leagueId: { eq: $leagueId }, season: { eq: $season } }
      limit: 1
    ) {
      lastRefreshId
    }
  }
`;

interface TournamentImportData {
  id: string;
  fplLeagueId: number;
  startEvent: number;
  matchSize: number;
  creatorUid: string;
  totalRounds: number;
  importCursor: number | null;
  importStatus: string;
  totalCount: number;
}

interface LeagueEntryData {
  entryId: number;
  rank: number | null;
  entry: {
    name: string;
    playerFirstName: string | null;
    playerLastName: string | null;
  };
}

interface MatchRecord {
  tournamentId: string;
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId: number | null;
  isBye: boolean;
  status: string;
}

interface MatchPickRecord {
  tournamentId: string;
  matchId: number;
  entryId: number;
  slot: number;
}

interface ByeUpdate {
  tournamentId: string;
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId: number | null;
  isBye: boolean;
  status: string;
  winnerEntryId: number;
}

/**
 * Get the current FPL season string (e.g., "2024-25")
 */
function getCurrentSeason(): string {
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

/**
 * Updates checkpoint in database.
 */
async function updateCheckpoint(
  tournamentId: string,
  cursor: number,
  importedCount: number,
  totalCount: number,
  status: ImportPhase,
  error?: string
): Promise<void> {
  // Progress calculation based on phase:
  // importing: 0-30%
  // creating_tournament_entries: 30-50%
  // creating_rounds: 50-55%
  // creating_matches: 55-80%
  // creating_picks: 80-100%
  let progress = 0;
  switch (status) {
    case 'importing':
      progress = Math.min(30, Math.round((importedCount / totalCount) * 30));
      break;
    case 'creating_tournament_entries':
      progress = 30 + Math.round((cursor / 100) * 20); // Approximate
      break;
    case 'creating_rounds':
      progress = 52;
      break;
    case 'creating_matches':
      progress = 55 + Math.round((cursor / 100) * 25); // Approximate
      break;
    case 'creating_picks':
      progress = 80 + Math.round((cursor / 100) * 19); // Approximate
      break;
    case 'complete':
      progress = 100;
      break;
  }

  await dataConnectAdmin.executeGraphql(UPDATE_IMPORT_CHECKPOINT, {
    variables: {
      id: tournamentId,
      importStatus: status,
      importProgress: progress,
      importedCount,
      importCursor: cursor,
      importError: error || null
    }
  });
}

/**
 * Self-reschedules the import task.
 * In emulator: uses HTTP call directly
 * In production: uses Cloud Tasks queue
 */
async function rescheduleTask(
  tournamentId: string,
  leagueId: number,
  totalCount: number,
  phase: ImportPhase,
  cursor: number
): Promise<void> {
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
  const payload = { tournamentId, leagueId, totalCount, phase, cursor };

  if (isEmulator) {
    console.log(`[Import] Emulator mode: scheduling ${phase} batch ${cursor} via HTTP`);

    // Don't await - fire and forget after delay
    setTimeout(async () => {
      try {
        await fetch('http://127.0.0.1:5001/knockoutfpl-dev/europe-west1/processTournamentImport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: payload }),
        });
      } catch (error) {
        console.error('[Import] Failed to trigger next batch:', error);
      }
    }, RESCHEDULE_DELAY_SECONDS * 1000);
  } else {
    const queue = getFunctions().taskQueue('processTournamentImport');
    await queue.enqueue(payload, { scheduleDelaySeconds: RESCHEDULE_DELAY_SECONDS });
  }

  console.log(`[Import] Rescheduled: phase=${phase}, cursor=${cursor}`);
}

/**
 * Phase: importing - Populates LeagueEntry (shared) using refreshLeague
 * This is now a single-step operation since refreshLeague handles all the pagination
 */
async function processImportingPhase(
  tournamentId: string,
  leagueId: number,
  totalCount: number,
  _cursor: number,
  _authClaims: AuthClaims
): Promise<void> {
  const season = getCurrentSeason();

  console.log(`[Import] Starting league refresh for league ${leagueId}, season ${season}`);

  // Use refreshLeague which handles all FPL API fetching and LeagueEntry creation
  const refreshResult = await refreshLeague(leagueId, season);

  console.log(`[Import] League refreshed: ${refreshResult.entriesCount} entries, refreshId=${refreshResult.refreshId}`);

  // Update checkpoint with actual count
  await updateCheckpoint(tournamentId, 0, refreshResult.entriesCount, refreshResult.entriesCount, 'importing');

  // Move to next phase: creating_tournament_entries
  console.log(`[Import] League data imported, moving to creating_tournament_entries phase`);
  await rescheduleTask(tournamentId, leagueId, refreshResult.entriesCount, 'creating_tournament_entries', 0);
}

/**
 * Phase: creating_tournament_entries - Creates TournamentEntry from LeagueEntry
 * Processes in batches and creates Pick placeholders
 */
async function processCreatingTournamentEntriesPhase(
  tournamentId: string,
  leagueId: number,
  totalCount: number,
  cursor: number,
  tournament: TournamentImportData,
  authClaims: AuthClaims
): Promise<void> {
  const season = getCurrentSeason();
  const offset = cursor * TOURNAMENT_ENTRIES_PER_BATCH;

  console.log(`[Import] Creating tournament entries batch ${cursor}, offset=${offset}`);

  // Fetch a batch of league entries
  const leagueEntriesResult = await dataConnectAdmin.executeGraphql(GET_LEAGUE_ENTRIES, {
    variables: {
      leagueId,
      season,
      limit: TOURNAMENT_ENTRIES_PER_BATCH,
      offset,
    }
  }) as { data: { leagueEntries: LeagueEntryData[] } };

  const leagueEntries = leagueEntriesResult.data.leagueEntries;

  if (leagueEntries.length === 0) {
    // All entries created, move to next phase
    console.log(`[Import] All tournament entries created, moving to creating_rounds phase`);
    await updateCheckpoint(tournamentId, 100, totalCount, totalCount, 'creating_tournament_entries');
    await rescheduleTask(tournamentId, leagueId, totalCount, 'creating_rounds', 0);
    return;
  }

  // Get the league's refreshId
  const leagueResult = await dataConnectAdmin.executeGraphql(GET_LEAGUE_REFRESH_ID, {
    variables: { leagueId, season }
  }) as { data: { leagues: Array<{ lastRefreshId: string }> } };

  const refreshId = leagueResult.data.leagues[0]?.lastRefreshId;
  if (!refreshId) {
    throw new Error(`League ${leagueId} not found or has no refreshId`);
  }

  // Create tournament entry records (seed = offset + index + 1)
  const tournamentEntryRecords = leagueEntries.map((le, index) => ({
    tournamentId,
    entryId: le.entryId,
    seed: offset + index + 1,
    refreshId,
    status: 'active',
  }));

  await createTournamentEntriesBatch(tournamentEntryRecords, authClaims);

  // Create placeholder picks for tournament gameweeks for this batch
  const { startEvent, totalRounds } = tournament;
  const pickRecords = leagueEntries.flatMap(le => {
    const picks = [];
    for (let r = 0; r < totalRounds; r++) {
      picks.push({
        entryId: le.entryId,
        event: startEvent + r,
        points: 0,
        rawJson: '{}',
        isFinal: false,
      });
    }
    return picks;
  });

  if (pickRecords.length > 0) {
    await upsertPicksBatch(pickRecords, authClaims);
  }

  console.log(`[Import] Created ${tournamentEntryRecords.length} tournament entries, ${pickRecords.length} placeholder picks`);

  // Calculate progress and update checkpoint
  const totalProcessed = offset + leagueEntries.length;
  const progressPercent = Math.round((totalProcessed / totalCount) * 100);
  await updateCheckpoint(tournamentId, progressPercent, totalProcessed, totalCount, 'creating_tournament_entries');

  // Check if we need more batches
  if (leagueEntries.length === TOURNAMENT_ENTRIES_PER_BATCH) {
    // More entries to process
    await rescheduleTask(tournamentId, leagueId, totalCount, 'creating_tournament_entries', cursor + 1);
  } else {
    // All entries created, move to next phase
    console.log(`[Import] All tournament entries created, moving to creating_rounds phase`);
    await rescheduleTask(tournamentId, leagueId, totalCount, 'creating_rounds', 0);
  }
}

/**
 * Phase: creating_rounds - Create round records
 */
async function processCreatingRoundsPhase(
  tournamentId: string,
  leagueId: number,
  totalCount: number,
  tournament: TournamentImportData,
  authClaims: AuthClaims
): Promise<void> {
  const { startEvent, totalRounds } = tournament;

  console.log(`[Import] Creating ${totalRounds} rounds`);

  const rounds = [];
  for (let r = 1; r <= totalRounds; r++) {
    rounds.push({
      tournamentId,
      roundNumber: r,
      event: startEvent + r - 1,
      status: r === 1 ? 'active' : 'pending',
    });
  }
  await createRoundsBatch(rounds, authClaims);

  await updateCheckpoint(tournamentId, 0, totalCount, totalCount, 'creating_rounds');

  // Move to next phase
  console.log(`[Import] Rounds created, moving to creating_matches phase`);
  await rescheduleTask(tournamentId, leagueId, totalCount, 'creating_matches', 0);
}

/**
 * Phase: creating_matches - Create match records in batches
 */
async function processCreatingMatchesPhase(
  tournamentId: string,
  leagueId: number,
  totalCount: number,
  cursor: number,
  tournament: TournamentImportData,
  authClaims: AuthClaims
): Promise<void> {
  // Fetch tournament entries to calculate bracket size
  const entriesResult = await dataConnectAdmin.executeGraphql(GET_ALL_TOURNAMENT_ENTRIES, {
    variables: { tournamentId, limit: totalCount + 1000 }
  }) as { data: { tournamentEntries: Array<{ entryId: number; seed: number }> } };

  const participantCount = entriesResult.data.tournamentEntries.length;

  if (tournament.matchSize !== 2) {
    console.warn(`[Import] N-way brackets (matchSize=${tournament.matchSize}) not yet supported`);
  }

  const bracketSize = calculateBracketSize(participantCount);
  const allMatches = generateBracketStructure(bracketSize);

  console.log(`[Import] Bracket size: ${bracketSize}, total matches: ${allMatches.length}`);

  // Get batch of matches to create
  const startIdx = cursor * MATCHES_PER_BATCH;
  const endIdx = Math.min(startIdx + MATCHES_PER_BATCH, allMatches.length);
  const batchMatches = allMatches.slice(startIdx, endIdx);

  if (batchMatches.length === 0) {
    // All matches created, move to next phase
    console.log(`[Import] All ${allMatches.length} matches created, moving to creating_picks phase`);
    await updateCheckpoint(tournamentId, 0, totalCount, totalCount, 'creating_picks');
    await rescheduleTask(tournamentId, leagueId, totalCount, 'creating_picks', 0);
    return;
  }

  console.log(`[Import] Creating matches ${startIdx + 1}-${endIdx} of ${allMatches.length}`);

  const matchRecords: MatchRecord[] = batchMatches.map(m => ({
    tournamentId,
    matchId: m.matchId,
    roundNumber: m.roundNumber,
    positionInRound: m.positionInRound,
    qualifiesToMatchId: m.qualifiesToMatchId,
    isBye: false,
    status: m.roundNumber === 1 ? 'active' : 'pending',
  }));

  await createMatchesBatch(matchRecords, authClaims);

  const progressCursor = Math.round((endIdx / allMatches.length) * 100);
  await updateCheckpoint(tournamentId, progressCursor, totalCount, totalCount, 'creating_matches');

  if (endIdx < allMatches.length) {
    await rescheduleTask(tournamentId, leagueId, totalCount, 'creating_matches', cursor + 1);
  } else {
    console.log(`[Import] All matches created, moving to creating_picks phase`);
    await rescheduleTask(tournamentId, leagueId, totalCount, 'creating_picks', 0);
  }
}

/**
 * Phase: creating_picks - Create match_picks and handle byes in batches
 */
async function processCreatingPicksPhase(
  tournamentId: string,
  leagueId: number,
  totalCount: number,
  cursor: number,
  tournament: TournamentImportData,
  authClaims: AuthClaims
): Promise<void> {
  // Fetch tournament entries
  const entriesResult = await dataConnectAdmin.executeGraphql(GET_ALL_TOURNAMENT_ENTRIES, {
    variables: { tournamentId, limit: totalCount + 1000 }
  }) as { data: { tournamentEntries: Array<{ entryId: number; seed: number }> } };

  const tournamentEntries = entriesResult.data.tournamentEntries;
  const participantCount = tournamentEntries.length;

  const bracketSize = calculateBracketSize(participantCount);
  const allMatches = generateBracketStructure(bracketSize);
  const matchAssignments = assignParticipantsToMatches(bracketSize, participantCount);

  // Build lookup maps
  const seedToEntry = new Map<number, number>();
  tournamentEntries.forEach(te => seedToEntry.set(te.seed, te.entryId));

  const matchLookup = new Map<number, { matchId: number; qualifiesToMatchId: number | null; roundNumber: number; positionInRound: number }>();
  allMatches.forEach(m => {
    if (m.roundNumber === 1) {
      matchLookup.set(m.positionInRound, {
        matchId: m.matchId,
        qualifiesToMatchId: m.qualifiesToMatchId,
        roundNumber: m.roundNumber,
        positionInRound: m.positionInRound,
      });
    }
  });

  // Process assignments in batches
  // Each assignment creates 1-3 records (pick1, pick2 or bye, maybe round2 advance)
  const startIdx = cursor * PICKS_PER_BATCH;
  const endIdx = Math.min(startIdx + PICKS_PER_BATCH, matchAssignments.length);
  const batchAssignments = matchAssignments.slice(startIdx, endIdx);

  if (batchAssignments.length === 0) {
    // All picks created, finalize tournament
    console.log(`[Import] All match picks created, finalizing tournament`);
    await dataConnectAdmin.executeGraphql(FINALIZE_TOURNAMENT_IMPORT, {
      variables: { id: tournamentId, participantCount }
    });
    console.log(`[Import] Tournament ${tournamentId} import complete!`);
    return;
  }

  console.log(`[Import] Creating picks for assignments ${startIdx + 1}-${endIdx} of ${matchAssignments.length}`);

  const matchPicks: MatchPickRecord[] = [];
  const byeUpdates: ByeUpdate[] = [];

  for (const assignment of batchAssignments) {
    const matchInfo = matchLookup.get(assignment.position);
    if (!matchInfo) continue;

    const entry1 = seedToEntry.get(assignment.seed1);
    if (entry1) {
      matchPicks.push({
        tournamentId,
        matchId: matchInfo.matchId,
        entryId: entry1,
        slot: 1,
      });
    }

    if (assignment.seed2 !== null) {
      const entry2 = seedToEntry.get(assignment.seed2);
      if (entry2) {
        matchPicks.push({
          tournamentId,
          matchId: matchInfo.matchId,
          entryId: entry2,
          slot: 2,
        });
      }
    } else if (entry1) {
      // It's a bye
      byeUpdates.push({
        tournamentId,
        matchId: matchInfo.matchId,
        roundNumber: matchInfo.roundNumber,
        positionInRound: matchInfo.positionInRound,
        qualifiesToMatchId: matchInfo.qualifiesToMatchId,
        isBye: true,
        status: 'complete',
        winnerEntryId: entry1,
      });

      // Advance to round 2
      if (matchInfo.qualifiesToMatchId) {
        const slot = assignment.position % 2 === 1 ? 1 : 2;
        matchPicks.push({
          tournamentId,
          matchId: matchInfo.qualifiesToMatchId,
          entryId: entry1,
          slot,
        });
      }
    }
  }

  if (matchPicks.length > 0) {
    await createMatchPicksBatch(matchPicks, authClaims);
  }

  if (byeUpdates.length > 0) {
    await updateMatchesBatch(byeUpdates, authClaims);
  }

  console.log(`[Import] Created ${matchPicks.length} match picks, ${byeUpdates.length} byes`);

  const progressCursor = Math.round((endIdx / matchAssignments.length) * 100);
  await updateCheckpoint(tournamentId, progressCursor, totalCount, totalCount, 'creating_picks');

  if (endIdx < matchAssignments.length) {
    await rescheduleTask(tournamentId, leagueId, totalCount, 'creating_picks', cursor + 1);
  } else {
    // Finalize
    console.log(`[Import] All picks created, finalizing tournament`);
    await dataConnectAdmin.executeGraphql(FINALIZE_TOURNAMENT_IMPORT, {
      variables: { id: tournamentId, participantCount }
    });
    console.log(`[Import] Tournament ${tournamentId} import complete!`);
  }
}

/**
 * Cloud Task: Process tournament import in chunked batches.
 *
 * Phases:
 * 1. importing                 - Populates LeagueEntry (shared) using refreshLeague
 * 2. creating_tournament_entries - Creates TournamentEntry from LeagueEntry
 * 3. creating_rounds           - Create round records
 * 4. creating_matches          - Create match records in batches
 * 5. creating_picks            - Create match_picks and handle byes in batches
 * 6. complete                  - Done
 */
export const processTournamentImport = onTaskDispatched({
  region: 'europe-west1',
  timeoutSeconds: 60,  // Each batch completes within 60s
  retryConfig: {
    maxAttempts: 5,
    minBackoffSeconds: 30,
  },
  rateLimits: {
    maxConcurrentDispatches: 1,  // Sequential - protects FPL API and DB
    maxDispatchesPerSecond: 1,
  }
}, async (request) => {
  const {
    tournamentId,
    leagueId: _leagueId, // Kept for backward compatibility, now use tournament.fplLeagueId
    totalCount,
    phase = 'importing',
    cursor = 1
  } = request.data as {
    tournamentId: string;
    leagueId: number;
    totalCount: number;
    phase?: ImportPhase;
    cursor?: number;
  };

  console.log(`[Import] Phase: ${phase}, cursor: ${cursor}, tournament: ${tournamentId}`);

  try {
    // Fetch tournament data
    const tournamentResult = await dataConnectAdmin.executeGraphql(GET_TOURNAMENT_FOR_IMPORT, {
      variables: { id: tournamentId }
    }) as { data: { tournament: TournamentImportData } };

    const tournament = tournamentResult.data.tournament;

    // Skip if already complete
    if (tournament.importStatus === 'complete') {
      console.log(`[Import] Tournament ${tournamentId} already complete, skipping`);
      return;
    }

    const authClaims: AuthClaims = {
      sub: tournament.creatorUid,
      email: `${tournament.creatorUid}@system.internal`,
      email_verified: true,
    };

    // Route to appropriate phase handler
    switch (phase) {
      case 'importing':
        await processImportingPhase(tournamentId, tournament.fplLeagueId, totalCount, cursor, authClaims);
        break;

      case 'creating_tournament_entries':
        await processCreatingTournamentEntriesPhase(tournamentId, tournament.fplLeagueId, totalCount, cursor, tournament, authClaims);
        break;

      case 'creating_rounds':
        await processCreatingRoundsPhase(tournamentId, tournament.fplLeagueId, totalCount, tournament, authClaims);
        break;

      case 'creating_matches':
        await processCreatingMatchesPhase(tournamentId, tournament.fplLeagueId, totalCount, cursor, tournament, authClaims);
        break;

      case 'creating_picks':
        await processCreatingPicksPhase(tournamentId, tournament.fplLeagueId, totalCount, cursor, tournament, authClaims);
        break;

      case 'complete':
        console.log(`[Import] Tournament ${tournamentId} is complete`);
        break;

      default:
        throw new Error(`Unknown phase: ${phase}`);
    }

  } catch (error) {
    console.error('[Import] Batch failed:', error);

    // Update error status
    await dataConnectAdmin.executeGraphql(UPDATE_IMPORT_CHECKPOINT, {
      variables: {
        id: tournamentId,
        importStatus: 'failed',
        importProgress: 0,
        importedCount: 0,
        importCursor: cursor,
        importError: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    throw error; // Re-throw for Cloud Tasks retry
  }
});
