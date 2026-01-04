// functions/src/processLeagueImport.ts
// Cloud Task handler for background import of large FPL leagues
// Uses chunked processing with checkpointing for resilience
//
// Phases:
// 1. fetching_standings     - Fetch league pages from FPL API (batched)
// 2. upserting_entries      - Create/update Entry records
// 3. upserting_league_entries - Create/update LeagueEntry records
// 4. cleaning_stale         - Delete old refreshId entries
// 5. complete               - Done

import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { getFunctions } from 'firebase-admin/functions';
import { dataConnectAdmin } from './dataconnect-admin';
import type { LeagueStandingsResponse, LeagueStandingEntry } from './types/fplApiResponses';

// Configuration
const FPL_PAGES_PER_BATCH = 10;      // Fetch 10 pages per task invocation
const MUTATION_BATCH_SIZE = 20;      // Max mutations per GraphQL request
const RESCHEDULE_DELAY_SECONDS = 2;

const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

// Import phases
type LeagueImportPhase =
  | 'fetching_standings'
  | 'upserting_entries'
  | 'upserting_league_entries'
  | 'cleaning_stale'
  | 'complete';

// Payload for task scheduling
interface LeagueImportPayload {
  leagueId: number;
  season: string;
  lockId: string;
  phase: LeagueImportPhase;
  cursor: number;           // Current page (fetching) or offset (upserting)
  totalCount: number;       // Total entries (known after fetching)
  refreshId: string;        // New refreshId for this import
  leagueName?: string;      // Captured from first page
}

// Note: For large leagues, we fetch and upsert in phases rather than storing all data in memory

// GraphQL mutations
const ACQUIRE_LEAGUE_IMPORT_LOCK = `
  mutation AcquireLeagueImportLock(
    $leagueId: Int!,
    $season: String!,
    $lockId: UUID!,
    $name: String!
  ) {
    league_upsert(data: {
      leagueId: $leagueId,
      season: $season,
      name: $name,
      rawJson: "{}",
      importStatus: "importing",
      importProgress: 0,
      importLockId: $lockId,
      importStartedAt_expr: "request.time"
    })
  }
`;

const UPDATE_LEAGUE_IMPORT_PROGRESS = `
  mutation UpdateLeagueImportProgress(
    $leagueId: Int!,
    $season: String!,
    $importProgress: Int!
  ) {
    league_upsert(data: {
      leagueId: $leagueId,
      season: $season,
      name: "",
      rawJson: "{}",
      importProgress: $importProgress
    })
  }
`;

const COMPLETE_LEAGUE_IMPORT = `
  mutation CompleteLeagueImport(
    $leagueId: Int!,
    $season: String!,
    $name: String!,
    $entriesCount: Int!,
    $refreshId: UUID!,
    $rawJson: String!
  ) {
    league_upsert(data: {
      leagueId: $leagueId,
      season: $season,
      name: $name,
      rawJson: $rawJson,
      importStatus: "complete",
      importProgress: 100,
      entriesCount: $entriesCount,
      lastRefreshId: $refreshId,
      lastRefreshAt_expr: "request.time"
    })
  }
`;

const FAIL_LEAGUE_IMPORT = `
  mutation FailLeagueImport(
    $leagueId: Int!,
    $season: String!,
    $importError: String!
  ) {
    league_upsert(data: {
      leagueId: $leagueId,
      season: $season,
      name: "",
      rawJson: "{}",
      importStatus: "failed",
      importError: $importError
    })
  }
`;

const GET_LEAGUE_IMPORT_LOCK = `
  query GetLeagueImportLock($leagueId: Int!, $season: String!) {
    leagues(
      where: { leagueId: { eq: $leagueId }, season: { eq: $season } }
      limit: 1
    ) {
      importLockId
      importStatus
      importStartedAt
    }
  }
`;

const DELETE_STALE_LEAGUE_ENTRIES = `
  mutation DeleteStaleLeagueEntries(
    $leagueId: Int!,
    $season: String!,
    $currentRefreshId: UUID!
  ) {
    leagueEntry_deleteMany(
      where: {
        leagueId: { eq: $leagueId },
        season: { eq: $season },
        refreshId: { ne: $currentRefreshId }
      }
    )
  }
`;

// =============================================================================
// FPL API Helpers
// =============================================================================

async function fetchStandingsPage(
  leagueId: number,
  page: number
): Promise<LeagueStandingsResponse | null> {
  const url = `${FPL_API_BASE}/leagues-classic/${leagueId}/standings/?page_standings=${page}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`FPL API error: ${response.status}`);
  }

  return response.json();
}

// =============================================================================
// Task Scheduling
// =============================================================================

async function rescheduleTask(payload: LeagueImportPayload): Promise<void> {
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

  if (isEmulator) {
    console.log(`[LeagueImport] Emulator mode: scheduling ${payload.phase} via HTTP`);

    setTimeout(async () => {
      try {
        await fetch('http://127.0.0.1:5001/knockoutfpl-dev/europe-west1/processLeagueImport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: payload }),
        });
      } catch (error) {
        console.error('[LeagueImport] Failed to trigger next batch:', error);
      }
    }, RESCHEDULE_DELAY_SECONDS * 1000);
  } else {
    const queue = getFunctions().taskQueue('processLeagueImport');
    await queue.enqueue(payload, { scheduleDelaySeconds: RESCHEDULE_DELAY_SECONDS });
  }

  console.log(`[LeagueImport] Rescheduled: phase=${payload.phase}, cursor=${payload.cursor}`);
}

// =============================================================================
// Lock Verification
// =============================================================================

async function verifyLock(leagueId: number, season: string, lockId: string): Promise<boolean> {
  const result = await dataConnectAdmin.executeGraphql<
    { leagues: Array<{ importLockId: string | null; importStatus: string | null }> },
    { leagueId: number; season: string }
  >(GET_LEAGUE_IMPORT_LOCK, {
    variables: { leagueId, season }
  });

  const league = result.data.leagues[0];
  if (!league) return false;

  return league.importLockId === lockId && league.importStatus === 'importing';
}

// =============================================================================
// Phase Handlers
// =============================================================================

/**
 * Phase: fetching_standings - Fetch pages from FPL API in batches
 */
async function processFetchingStandingsPhase(
  payload: LeagueImportPayload
): Promise<void> {
  const { leagueId, season, lockId, cursor, refreshId } = payload;
  const startPage = cursor;

  console.log(`[LeagueImport] Fetching standings pages ${startPage} to ${startPage + FPL_PAGES_PER_BATCH - 1}`);

  // Verify lock is still ours
  if (!await verifyLock(leagueId, season, lockId)) {
    console.log(`[LeagueImport] Lock lost for league ${leagueId}, aborting`);
    return;
  }

  const entries: LeagueStandingEntry[] = [];
  let leagueName = payload.leagueName || '';
  let hasMore = true;
  let page = startPage;

  // Fetch pages in this batch
  for (let i = 0; i < FPL_PAGES_PER_BATCH && hasMore; i++) {
    const data = await fetchStandingsPage(leagueId, page);

    if (!data) {
      if (page === 1) {
        throw new Error(`League ${leagueId} not found`);
      }
      hasMore = false;
      break;
    }

    if (page === 1) {
      leagueName = data.league.name;
    }

    entries.push(...data.standings.results);
    hasMore = data.standings.has_next;
    page++;
  }

  console.log(`[LeagueImport] Fetched ${entries.length} entries from pages ${startPage}-${page - 1}`);

  // If we have entries, upsert them immediately to avoid memory issues
  if (entries.length > 0) {
    await upsertEntriesBatch(entries, season);
    await upsertLeagueEntriesBatch(entries, leagueId, season, refreshId);
  }

  // Calculate progress (fetching is 0-80%)
  const totalEstimate = payload.totalCount || (hasMore ? page * 50 : entries.length + (startPage - 1) * 50);
  const fetchedSoFar = (page - 1) * 50;
  const progressPercent = Math.min(80, Math.round((fetchedSoFar / totalEstimate) * 80));

  await dataConnectAdmin.executeGraphql(UPDATE_LEAGUE_IMPORT_PROGRESS, {
    variables: { leagueId, season, importProgress: progressPercent }
  });

  if (hasMore) {
    // More pages to fetch
    await rescheduleTask({
      ...payload,
      phase: 'fetching_standings',
      cursor: page,
      totalCount: totalEstimate,
      leagueName,
    });
  } else {
    // Done fetching, move to cleaning phase
    const totalCount = (page - 1 - startPage + 1) * 50 + entries.length; // Approximate
    console.log(`[LeagueImport] Fetching complete, moving to cleaning_stale phase`);

    await rescheduleTask({
      ...payload,
      phase: 'cleaning_stale',
      cursor: 0,
      totalCount,
      leagueName,
    });
  }
}

/**
 * Batch upsert Entry records from standings data
 */
async function upsertEntriesBatch(
  entries: LeagueStandingEntry[],
  season: string
): Promise<void> {
  for (let i = 0; i < entries.length; i += MUTATION_BATCH_SIZE) {
    const batch = entries.slice(i, i + MUTATION_BATCH_SIZE);

    const mutations = batch.map((entry, idx) => {
      const nameParts = entry.player_name.split(' ');
      const playerFirstName = nameParts[0] || '';
      const playerLastName = nameParts.slice(1).join(' ') || '';

      return `
        e${idx}: entry_upsert(data: {
          entryId: ${entry.entry}
          season: ${JSON.stringify(season)}
          name: ${JSON.stringify(entry.entry_name)}
          playerFirstName: ${JSON.stringify(playerFirstName)}
          playerLastName: ${JSON.stringify(playerLastName)}
          rawJson: ${JSON.stringify(JSON.stringify(entry))}
        })
      `;
    }).join('\n');

    const batchMutation = `mutation BatchUpsertEntries { ${mutations} }`;
    await dataConnectAdmin.executeGraphql(batchMutation, {});
  }
}

/**
 * Batch upsert LeagueEntry records
 */
async function upsertLeagueEntriesBatch(
  entries: LeagueStandingEntry[],
  leagueId: number,
  season: string,
  refreshId: string
): Promise<void> {
  for (let i = 0; i < entries.length; i += MUTATION_BATCH_SIZE) {
    const batch = entries.slice(i, i + MUTATION_BATCH_SIZE);

    const mutations = batch.map((entry, idx) => `
      le${idx}: leagueEntry_upsert(data: {
        leagueId: ${leagueId}
        entryId: ${entry.entry}
        season: ${JSON.stringify(season)}
        refreshId: "${refreshId}"
        rank: ${entry.rank}
        entryEntryId: ${entry.entry}
      })
    `).join('\n');

    const batchMutation = `mutation BatchUpsertLeagueEntries { ${mutations} }`;
    await dataConnectAdmin.executeGraphql(batchMutation, {});
  }
}

/**
 * Phase: cleaning_stale - Delete entries with old refreshId
 */
async function processCleaningStalePhase(
  payload: LeagueImportPayload
): Promise<void> {
  const { leagueId, season, lockId, refreshId, totalCount, leagueName } = payload;

  console.log(`[LeagueImport] Cleaning stale entries for league ${leagueId}`);

  // Verify lock
  if (!await verifyLock(leagueId, season, lockId)) {
    console.log(`[LeagueImport] Lock lost for league ${leagueId}, aborting`);
    return;
  }

  // Delete stale entries
  await dataConnectAdmin.executeGraphql(DELETE_STALE_LEAGUE_ENTRIES, {
    variables: { leagueId, season, currentRefreshId: refreshId }
  });

  console.log(`[LeagueImport] Stale entries deleted, completing import`);

  // Complete the import
  await dataConnectAdmin.executeGraphql(COMPLETE_LEAGUE_IMPORT, {
    variables: {
      leagueId,
      season,
      name: leagueName || `League ${leagueId}`,
      entriesCount: totalCount,
      refreshId,
      rawJson: JSON.stringify({ league: { id: leagueId, name: leagueName } })
    }
  });

  console.log(`[LeagueImport] League ${leagueId} import complete: ${totalCount} entries`);
}

// =============================================================================
// Main Task Handler
// =============================================================================

/**
 * Cloud Task: Process league import in chunked batches.
 *
 * Phases:
 * 1. fetching_standings     - Fetch pages from FPL API
 * 2. cleaning_stale         - Delete old refreshId entries
 * 3. complete               - Done
 */
export const processLeagueImport = onTaskDispatched({
  region: 'europe-west1',
  timeoutSeconds: 60,
  retryConfig: {
    maxAttempts: 5,
    minBackoffSeconds: 30,
  },
  rateLimits: {
    maxConcurrentDispatches: 1,  // Sequential - protects FPL API
    maxDispatchesPerSecond: 1,
  }
}, async (request) => {
  const payload = request.data as LeagueImportPayload;
  const { leagueId, season, phase } = payload;

  console.log(`[LeagueImport] Phase: ${phase}, league: ${leagueId}, season: ${season}`);

  try {
    switch (phase) {
      case 'fetching_standings':
        await processFetchingStandingsPhase(payload);
        break;

      case 'cleaning_stale':
        await processCleaningStalePhase(payload);
        break;

      case 'complete':
        console.log(`[LeagueImport] League ${leagueId} is complete`);
        break;

      // Legacy phases for incremental migration
      case 'upserting_entries':
      case 'upserting_league_entries':
        // These are now done inline during fetching
        await rescheduleTask({ ...payload, phase: 'cleaning_stale' });
        break;

      default:
        throw new Error(`Unknown phase: ${phase}`);
    }
  } catch (error) {
    console.error('[LeagueImport] Task failed:', error);

    // Update error status
    await dataConnectAdmin.executeGraphql(FAIL_LEAGUE_IMPORT, {
      variables: {
        leagueId,
        season,
        importError: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    throw error; // Re-throw for Cloud Tasks retry
  }
});

// =============================================================================
// Helper: Spawn League Import
// =============================================================================

/**
 * Spawns a league import task.
 * Called by processTournamentImport or importUserLeagues.
 */
export async function spawnLeagueImport(
  leagueId: number,
  season: string
): Promise<string> {
  const lockId = crypto.randomUUID();
  const refreshId = crypto.randomUUID();

  console.log(`[LeagueImport] Spawning import for league ${leagueId}, lockId=${lockId}`);

  // Acquire lock
  await dataConnectAdmin.executeGraphql(ACQUIRE_LEAGUE_IMPORT_LOCK, {
    variables: {
      leagueId,
      season,
      lockId,
      name: `League ${leagueId}` // Placeholder, will be updated when we fetch
    }
  });

  const payload: LeagueImportPayload = {
    leagueId,
    season,
    lockId,
    phase: 'fetching_standings',
    cursor: 1,
    totalCount: 0,
    refreshId,
  };

  await rescheduleTask(payload);

  return lockId;
}

/**
 * Check if a league is currently being imported
 */
export async function isLeagueImporting(
  leagueId: number,
  season: string
): Promise<boolean> {
  const result = await dataConnectAdmin.executeGraphql<
    { leagues: Array<{ importStatus: string | null; importStartedAt: string | null }> },
    { leagueId: number; season: string }
  >(GET_LEAGUE_IMPORT_LOCK, {
    variables: { leagueId, season }
  });

  const league = result.data.leagues[0];
  if (!league) return false;

  if (league.importStatus !== 'importing') return false;

  // Check if stale (> 10 minutes)
  if (league.importStartedAt) {
    const startedAt = new Date(league.importStartedAt).getTime();
    const staleThreshold = 10 * 60 * 1000; // 10 minutes
    if (Date.now() - startedAt > staleThreshold) {
      return false; // Stale lock, can be overwritten
    }
  }

  return true;
}
