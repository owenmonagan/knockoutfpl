// functions/src/processTournamentImport.ts
// Cloud Task handler for background import of large FPL leagues
// Uses chunked processing with checkpointing for resilience
//
// Phases:
// 1. importing     - Fetch participants from FPL API in batches
// 2. creating_rounds - Create round records (quick, single batch)
// 3. creating_matches - Create match records in batches
// 4. creating_picks  - Create match_picks and handle byes in batches
// 5. complete       - Done

import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { getFunctions } from 'firebase-admin/functions';
import { dataConnectAdmin } from './dataconnect-admin';
import {
  upsertEntriesBatch,
  createRoundsBatch,
  createParticipantsBatch,
  createMatchesBatch,
  updateMatchesBatch,
  createMatchPicksBatch,
  AuthClaims,
} from './dataconnect-mutations';
import {
  calculateBracketSize,
  generateBracketStructure,
  assignParticipantsToMatches,
} from './bracketGenerator';

// Configuration
const PAGES_PER_BATCH = 40;  // ~40 pages × ~100ms = ~4s fetching, leaves room for DB writes
const MATCHES_PER_BATCH = 5000;  // Matches to create per batch
const PICKS_PER_BATCH = 5000;  // Match picks to create per batch
const RESCHEDULE_DELAY_SECONDS = 2;  // Delay between batches
const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

// Import phases
type ImportPhase = 'importing' | 'creating_rounds' | 'creating_matches' | 'creating_picks' | 'complete';

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

const GET_ALL_PARTICIPANTS = `
  query GetAllParticipants($tournamentId: UUID!, $limit: Int!) {
    participants(where: { tournamentId: { eq: $tournamentId } }, orderBy: [{ seed: ASC }], limit: $limit) {
      entryId
      seed
    }
  }
`;

interface TournamentImportData {
  id: string;
  startEvent: number;
  matchSize: number;
  creatorUid: string;
  totalRounds: number;
  importCursor: number | null;
  importStatus: string;
  totalCount: number;
}

interface StandingsResult {
  entry: number;
  entry_name: string;
  player_name: string;
  rank: number;
  total: number;
}

interface StandingsPage {
  standings: {
    has_next: boolean;
    results: StandingsResult[];
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
 * Fetches a single page with retry and exponential backoff for 429s.
 */
async function fetchPageWithRetry(
  leagueId: number,
  page: number,
  maxRetries = 3
): Promise<StandingsPage | null> {
  const url = `${FPL_API_BASE}/leagues-classic/${leagueId}/standings/?page_standings=${page}`;
  let delay = 2000; // Start with 2s backoff

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await fetch(url);

    if (response.status === 429) {
      console.warn(`[Import] Rate limited on page ${page}, attempt ${attempt}/${maxRetries}, waiting ${delay}ms`);
      await sleep(delay);
      delay *= 2; // Exponential backoff: 2s, 4s, 8s
      continue;
    }

    if (response.status === 404) {
      return null; // Page doesn't exist
    }

    if (!response.ok) {
      throw new Error(`FPL API error: ${response.status} on page ${page}`);
    }

    const data = await response.json() as StandingsPage;

    // Empty results means we've gone past the last page
    if (data.standings.results.length === 0) {
      return null;
    }

    return data;
  }

  throw new Error(`Rate limit retries exhausted for page ${page}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  // importing: 0-50%
  // creating_rounds: 50-55%
  // creating_matches: 55-80%
  // creating_picks: 80-100%
  let progress = 0;
  switch (status) {
    case 'importing':
      progress = Math.min(50, Math.round((importedCount / totalCount) * 50));
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
 * Writes a batch of entries and participants to the database.
 */
async function writeParticipantBatch(
  tournamentId: string,
  participants: StandingsResult[],
  startingSeed: number,
  authClaims: AuthClaims
): Promise<void> {
  const currentYear = new Date().getFullYear();
  const season = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;

  // Create Entry records
  const entries = participants.map(p => {
    const nameParts = (p.player_name || '').split(' ');
    return {
      entryId: p.entry,
      season,
      name: p.entry_name,
      playerFirstName: nameParts[0] || '',
      playerLastName: nameParts.slice(1).join(' ') || '',
      summaryOverallPoints: p.total,
      rawJson: JSON.stringify(p),
    };
  });
  await upsertEntriesBatch(entries, authClaims);

  // Create Participant records
  const participantRecords = participants.map((p, index) => ({
    tournamentId,
    entryId: p.entry,
    teamName: p.entry_name,
    managerName: p.player_name,
    seed: startingSeed + index,
    leagueRank: p.rank,
    leaguePoints: p.total,
    rawJson: JSON.stringify(p),
  }));
  await createParticipantsBatch(participantRecords, authClaims);
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
 * Phase: importing - Fetch participants from FPL API
 */
async function processImportingPhase(
  tournamentId: string,
  leagueId: number,
  totalCount: number,
  cursor: number,
  authClaims: AuthClaims
): Promise<void> {
  let currentPage = cursor;
  let pagesThisBatch = 0;
  let importedThisBatch = 0;
  let hasMore = true;
  const batchParticipants: StandingsResult[] = [];

  while (pagesThisBatch < PAGES_PER_BATCH && hasMore) {
    const pageData = await fetchPageWithRetry(leagueId, currentPage);

    if (!pageData) {
      hasMore = false;
      break;
    }

    batchParticipants.push(...pageData.standings.results);
    importedThisBatch += pageData.standings.results.length;
    hasMore = pageData.standings.has_next;
    currentPage++;
    pagesThisBatch++;

    if (hasMore && pagesThisBatch < PAGES_PER_BATCH) {
      await sleep(50);
    }
  }

  const previouslyImported = (cursor - 1) * 50;
  const totalImported = previouslyImported + importedThisBatch;
  const startingSeed = previouslyImported + 1;

  console.log(`[Import] Fetched ${pagesThisBatch} pages, ${importedThisBatch} participants, ${totalImported} total`);

  if (batchParticipants.length > 0) {
    await writeParticipantBatch(tournamentId, batchParticipants, startingSeed, authClaims);
  }

  await updateCheckpoint(tournamentId, currentPage, totalImported, totalCount, 'importing');

  if (hasMore) {
    await rescheduleTask(tournamentId, leagueId, totalCount, 'importing', currentPage);
  } else {
    // Move to next phase
    console.log(`[Import] All pages fetched, moving to creating_rounds phase`);
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
  // Fetch participants to calculate bracket size
  const participantsResult = await dataConnectAdmin.executeGraphql(GET_ALL_PARTICIPANTS, {
    variables: { tournamentId, limit: totalCount + 1000 }
  }) as { data: { participants: Array<{ entryId: number; seed: number }> } };

  const participantCount = participantsResult.data.participants.length;

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
  // Fetch participants
  const participantsResult = await dataConnectAdmin.executeGraphql(GET_ALL_PARTICIPANTS, {
    variables: { tournamentId, limit: totalCount + 1000 }
  }) as { data: { participants: Array<{ entryId: number; seed: number }> } };

  const participants = participantsResult.data.participants;
  const participantCount = participants.length;

  const bracketSize = calculateBracketSize(participantCount);
  const allMatches = generateBracketStructure(bracketSize);
  const matchAssignments = assignParticipantsToMatches(bracketSize, participantCount);

  // Build lookup maps
  const seedToEntry = new Map<number, number>();
  participants.forEach(p => seedToEntry.set(p.seed, p.entryId));

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
 * 1. importing      - Fetch participants from FPL API in batches
 * 2. creating_rounds - Create round records
 * 3. creating_matches - Create match records in batches
 * 4. creating_picks  - Create match_picks and handle byes in batches
 * 5. complete       - Done
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
    leagueId,
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
        await processImportingPhase(tournamentId, leagueId, totalCount, cursor, authClaims);
        break;

      case 'creating_rounds':
        await processCreatingRoundsPhase(tournamentId, leagueId, totalCount, tournament, authClaims);
        break;

      case 'creating_matches':
        await processCreatingMatchesPhase(tournamentId, leagueId, totalCount, cursor, tournament, authClaims);
        break;

      case 'creating_picks':
        await processCreatingPicksPhase(tournamentId, leagueId, totalCount, cursor, tournament, authClaims);
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
