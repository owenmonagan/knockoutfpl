// functions/src/leagueRefresh.ts
// League refresh service for managing shared league entry data

import { dataConnectAdmin } from './dataconnect-admin';
import type { LeagueStandingsResponse, LeagueStandingEntry } from './types/fplApiResponses';

const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

// =============================================================================
// Types
// =============================================================================

export interface RefreshResult {
  refreshId: string;
  entriesCount: number;
  entriesUpdated: number;
}

interface LeagueRefreshStatus {
  leagueId: number;
  name: string | null;
  entriesCount: number | null;
  lastRefreshId: string | null;
  lastRefreshAt: string | null;
}

// =============================================================================
// GraphQL Queries & Mutations
// =============================================================================

const GET_LEAGUE_REFRESH_STATUS_QUERY = `
  query GetLeagueRefreshStatus($leagueId: Int!, $season: String!) {
    leagues(
      where: { leagueId: { eq: $leagueId }, season: { eq: $season } }
      limit: 1
    ) {
      leagueId
      name
      entriesCount
      lastRefreshId
      lastRefreshAt
    }
  }
`;

const UPSERT_LEAGUE_MUTATION = `
  mutation UpsertLeague(
    $leagueId: Int!
    $season: String!
    $name: String!
    $entriesCount: Int
    $refreshId: UUID
    $rawJson: String!
  ) {
    league_upsert(
      data: {
        leagueId: $leagueId
        season: $season
        name: $name
        entriesCount: $entriesCount
        lastRefreshId: $refreshId
        lastRefreshAt_expr: "request.time"
        rawJson: $rawJson
      }
    )
  }
`;

const DELETE_STALE_LEAGUE_ENTRIES_MUTATION = `
  mutation DeleteStaleLeagueEntries(
    $leagueId: Int!
    $season: String!
    $currentRefreshId: UUID!
  ) {
    leagueEntry_deleteMany(
      where: {
        leagueId: { eq: $leagueId }
        season: { eq: $season }
        refreshId: { ne: $currentRefreshId }
      }
    )
  }
`;

// =============================================================================
// FPL API Helpers
// =============================================================================

/**
 * Fetches a single page of league standings.
 * Returns null if league doesn't exist (404).
 */
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

/**
 * Fetches all pages of league standings.
 * Returns the league info and all entries across all pages.
 */
async function fetchAllLeagueStandings(leagueId: number): Promise<{
  league: { id: number; name: string };
  entries: LeagueStandingEntry[];
}> {
  const entries: LeagueStandingEntry[] = [];
  let page = 1;
  let hasNext = true;
  let leagueInfo: { id: number; name: string } | null = null;

  while (hasNext) {
    const data = await fetchStandingsPage(leagueId, page);
    if (!data) {
      if (page === 1) {
        throw new Error(`League ${leagueId} not found`);
      }
      break;
    }

    if (!leagueInfo) {
      leagueInfo = data.league;
    }

    entries.push(...data.standings.results);
    hasNext = data.standings.has_next;
    page++;

    // Safety limit: 10000 pages = ~500k entries
    if (page > 10000) {
      console.warn(`[refreshLeague] Safety limit reached for league ${leagueId} at page ${page}`);
      break;
    }
  }

  if (!leagueInfo) {
    throw new Error(`League ${leagueId} not found`);
  }

  return { league: leagueInfo, entries };
}

/**
 * Gets the quick count from FPL API (just first page to check has_next).
 * Used to compare against stored entriesCount for change detection.
 */
async function fetchLeagueEntryCount(leagueId: number): Promise<number> {
  const page1 = await fetchStandingsPage(leagueId, 1);
  if (!page1) {
    throw new Error(`League ${leagueId} not found`);
  }

  // For small leagues (no has_next), return the actual count
  if (!page1.standings.has_next) {
    return page1.standings.results.length;
  }

  // For large leagues, we need to find the last entry's rank
  // Use binary search similar to fplLeagueCount.ts
  const lastRank = await findLastRankBinarySearch(leagueId, page1);
  return lastRank;
}

/**
 * Binary search to find the total count for large leagues.
 * Similar to fplLeagueCount.ts but simpler since we already have page 1.
 */
async function findLastRankBinarySearch(
  leagueId: number,
  page1: LeagueStandingsResponse
): Promise<number> {
  // Exponential probing to find upper bound
  let lowerBound = 1;
  let upperBound = 100;

  while (true) {
    const probe = await fetchStandingsPage(leagueId, upperBound);
    if (probe === null || probe.standings.results.length === 0) {
      break;
    }
    if (!probe.standings.has_next) {
      return getLastEntryRank(probe);
    }
    lowerBound = upperBound;
    upperBound *= 10;

    if (upperBound > 10000) {
      upperBound = 10000;
      break;
    }
  }

  // Binary search for last page
  while (lowerBound < upperBound - 1) {
    const mid = Math.floor((lowerBound + upperBound) / 2);
    const probe = await fetchStandingsPage(leagueId, mid);

    if (probe === null || probe.standings.results.length === 0) {
      upperBound = mid;
    } else if (!probe.standings.has_next) {
      return getLastEntryRank(probe);
    } else {
      lowerBound = mid;
    }
  }

  const lastPage = await fetchStandingsPage(leagueId, lowerBound);
  if (!lastPage || lastPage.standings.results.length === 0) {
    return getLastEntryRank(page1);
  }

  if (lastPage.standings.has_next) {
    const nextPage = await fetchStandingsPage(leagueId, lowerBound + 1);
    if (nextPage && nextPage.standings.results.length > 0 && !nextPage.standings.has_next) {
      return getLastEntryRank(nextPage);
    }
  }

  return getLastEntryRank(lastPage);
}

function getLastEntryRank(page: LeagueStandingsResponse): number {
  const results = page.standings.results;
  if (results.length === 0) return 0;
  return results[results.length - 1].rank;
}

// =============================================================================
// Entry Upsert Helpers
// =============================================================================

const BATCH_SIZE = 20; // Match batch size from dataconnect-mutations.ts

interface LeagueEntryData {
  leagueId: number;
  entryId: number;
  season: string;
  refreshId: string;
  rank: number | null;
}

interface EntryData {
  entryId: number;
  season: string;
  name: string;
  playerFirstName: string | null;
  playerLastName: string | null;
  rawJson: string;
}

/**
 * Batch upsert Entry records from league standings.
 */
async function upsertEntriesBatch(entries: EntryData[]): Promise<void> {
  if (entries.length === 0) return;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);

    // Parse player_name into first/last name
    const mutations = batch.map((entry, idx) => `
      e${idx}: entry_upsert(data: {
        entryId: ${entry.entryId}
        season: ${JSON.stringify(entry.season)}
        name: ${JSON.stringify(entry.name)}
        playerFirstName: ${entry.playerFirstName ? JSON.stringify(entry.playerFirstName) : 'null'}
        playerLastName: ${entry.playerLastName ? JSON.stringify(entry.playerLastName) : 'null'}
        rawJson: ${JSON.stringify(entry.rawJson)}
      })
    `).join('\n');

    const batchMutation = `mutation BatchUpsertEntries { ${mutations} }`;
    await dataConnectAdmin.executeGraphql(batchMutation, {});
  }
}

/**
 * Batch upsert LeagueEntry records.
 */
async function upsertLeagueEntriesBatch(entries: LeagueEntryData[]): Promise<void> {
  if (entries.length === 0) return;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);

    const mutations = batch.map((entry, idx) => `
      le${idx}: leagueEntry_upsert(data: {
        leagueId: ${entry.leagueId}
        entryId: ${entry.entryId}
        season: ${JSON.stringify(entry.season)}
        refreshId: "${entry.refreshId}"
        rank: ${entry.rank ?? 'null'}
        entryEntryId: ${entry.entryId}
      })
    `).join('\n');

    const batchMutation = `mutation BatchUpsertLeagueEntries { ${mutations} }`;
    await dataConnectAdmin.executeGraphql(batchMutation, {});
  }
}

// =============================================================================
// Main Functions
// =============================================================================

/**
 * Refresh a league's entries.
 *
 * Logic:
 * 1. Fetch league standings from FPL API (all pages)
 * 2. Generate new refreshId
 * 3. Upsert all Entry records (cache the entry data)
 * 4. Upsert all LeagueEntry records with new refreshId
 * 5. Delete entries with old refreshId (left the league)
 * 6. Update league metadata
 */
export async function refreshLeague(
  leagueId: number,
  season: string
): Promise<RefreshResult> {
  console.log(`[refreshLeague] Starting refresh for league ${leagueId}, season ${season}`);

  // 1. Generate new refreshId
  const refreshId = crypto.randomUUID();

  // 2. Fetch all league standings from FPL API
  const { league, entries } = await fetchAllLeagueStandings(leagueId);
  console.log(`[refreshLeague] Fetched ${entries.length} entries from FPL API`);

  // 3. Prepare Entry records (cache team/player data)
  const entryRecords: EntryData[] = entries.map(entry => {
    // Parse player_name - FPL returns "First Last" format
    const nameParts = entry.player_name.split(' ');
    const playerFirstName = nameParts[0] || null;
    const playerLastName = nameParts.slice(1).join(' ') || null;

    return {
      entryId: entry.entry,
      season,
      name: entry.entry_name,
      playerFirstName,
      playerLastName,
      rawJson: JSON.stringify(entry),
    };
  });

  // 4. Prepare LeagueEntry records
  const leagueEntryRecords: LeagueEntryData[] = entries.map(entry => ({
    leagueId,
    entryId: entry.entry,
    season,
    refreshId,
    rank: entry.rank,
  }));

  // 5. Batch upsert Entry records
  console.log(`[refreshLeague] Upserting ${entryRecords.length} Entry records`);
  await upsertEntriesBatch(entryRecords);

  // 6. Batch upsert LeagueEntry records
  console.log(`[refreshLeague] Upserting ${leagueEntryRecords.length} LeagueEntry records`);
  await upsertLeagueEntriesBatch(leagueEntryRecords);

  // 7. Delete stale LeagueEntry records (entries that left the league)
  console.log(`[refreshLeague] Deleting stale LeagueEntry records with old refreshId`);
  await dataConnectAdmin.executeGraphql(DELETE_STALE_LEAGUE_ENTRIES_MUTATION, {
    variables: {
      leagueId,
      season,
      currentRefreshId: refreshId,
    },
  });

  // 8. Update League record with new metadata
  console.log(`[refreshLeague] Updating League record`);
  await dataConnectAdmin.executeGraphql(UPSERT_LEAGUE_MUTATION, {
    variables: {
      leagueId,
      season,
      name: league.name,
      entriesCount: entries.length,
      refreshId,
      rawJson: JSON.stringify({ league }),
    },
  });

  console.log(`[refreshLeague] Completed refresh for league ${leagueId}: ${entries.length} entries`);

  return {
    refreshId,
    entriesCount: entries.length,
    entriesUpdated: entries.length,
  };
}

/**
 * Check if league needs refresh.
 *
 * Rules:
 * - Not stored locally -> needs refresh
 * - entriesCount changed -> needs refresh
 * - Small league (<=50) checked on every app refresh
 * - Large league (>50) only checked on tournament creation
 */
export async function shouldRefreshLeague(
  leagueId: number,
  season: string,
  context: 'app_refresh' | 'tournament_creation'
): Promise<boolean> {
  // 1. Get stored league status from database
  const result = await dataConnectAdmin.executeGraphql<{
    leagues: LeagueRefreshStatus[];
  }, { leagueId: number; season: string }>(GET_LEAGUE_REFRESH_STATUS_QUERY, {
    variables: { leagueId, season },
  });

  const storedLeague = result.data.leagues[0] || null;

  // 2. Not stored locally -> needs refresh
  if (!storedLeague || storedLeague.lastRefreshId === null) {
    console.log(`[shouldRefreshLeague] League ${leagueId} not stored or never refreshed, needs refresh`);
    return true;
  }

  const storedCount = storedLeague.entriesCount;

  // 3. Large leagues only checked on tournament creation
  if (context === 'app_refresh' && storedCount && storedCount > 50) {
    console.log(`[shouldRefreshLeague] Large league ${leagueId} (${storedCount} entries), skipping app_refresh check`);
    return false;
  }

  // 4. Fetch current count from FPL API to compare
  try {
    const currentCount = await fetchLeagueEntryCount(leagueId);

    // 5. Count changed -> needs refresh
    if (currentCount !== storedCount) {
      console.log(
        `[shouldRefreshLeague] League ${leagueId} entry count changed: ${storedCount} -> ${currentCount}`
      );
      return true;
    }

    console.log(`[shouldRefreshLeague] League ${leagueId} unchanged (${currentCount} entries)`);
    return false;
  } catch (error) {
    // If we can't fetch from FPL API, don't refresh (use cached data)
    console.error(`[shouldRefreshLeague] Failed to fetch league count from FPL API:`, error);
    return false;
  }
}

/**
 * Get league refresh status from database.
 * Useful for UI to show last refresh time.
 */
export async function getLeagueRefreshStatus(
  leagueId: number,
  season: string
): Promise<LeagueRefreshStatus | null> {
  const result = await dataConnectAdmin.executeGraphql<{
    leagues: LeagueRefreshStatus[];
  }, { leagueId: number; season: string }>(GET_LEAGUE_REFRESH_STATUS_QUERY, {
    variables: { leagueId, season },
  });

  return result.data.leagues[0] || null;
}
