// functions/src/migrations/migrateToLeagueEntries.ts
// One-time migration to populate new LeagueEntry and TournamentEntry tables
// from existing Tournament and Participant data.
//
// This migration:
// 1. For each existing Tournament:
//    a. Calls refreshLeague() to populate LeagueEntry from FPL API
//    b. Creates TournamentEntry records from existing Participant records
// 2. Verifies data integrity after migration

import { dataConnectAdmin } from '../dataconnect-admin';
import { refreshLeague } from '../leagueRefresh';
import { createTournamentEntriesBatch, type AuthClaims } from '../dataconnect-mutations';

// =============================================================================
// Types
// =============================================================================

interface ExistingTournament {
  id: string;
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUid: string;
  status: string;
  participantCount: number;
}

interface ExistingParticipant {
  tournamentId: string;
  entryId: number;
  seed: number;
  status: string;
  eliminationRound: number | null;
  uid: string | null;
}

interface MigrationResult {
  tournamentId: string;
  fplLeagueId: number;
  fplLeagueName: string;
  participantCount: number;
  leagueEntriesCreated: number;
  tournamentEntriesCreated: number;
  success: boolean;
  error?: string;
}

interface FullMigrationResult {
  totalTournaments: number;
  successfulMigrations: number;
  failedMigrations: number;
  results: MigrationResult[];
}

// =============================================================================
// GraphQL Queries
// =============================================================================

const GET_ALL_TOURNAMENTS = `
  query GetAllTournaments {
    tournaments(orderBy: { createdAt: ASC }) {
      id
      fplLeagueId
      fplLeagueName
      creatorUid
      status
      participantCount
    }
  }
`;

const GET_TOURNAMENT_PARTICIPANTS = `
  query GetTournamentParticipants($tournamentId: UUID!) {
    participants(
      where: { tournamentId: { eq: $tournamentId } }
      orderBy: { seed: ASC }
    ) {
      tournamentId
      entryId
      seed
      status
      eliminationRound
      uid
    }
  }
`;

const GET_TOURNAMENT_ENTRIES = `
  query GetTournamentEntries($tournamentId: UUID!) {
    tournamentEntries(
      where: { tournamentId: { eq: $tournamentId } }
      orderBy: { seed: ASC }
    ) {
      entryId
      seed
      status
      eliminationRound
      uid
    }
  }
`;

const GET_LEAGUE_ENTRIES_COUNT = `
  query GetLeagueEntriesCount($leagueId: Int!, $season: String!) {
    leagueEntries(
      where: { leagueId: { eq: $leagueId }, season: { eq: $season } }
    ) {
      entryId
    }
  }
`;

// =============================================================================
// Helpers
// =============================================================================

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

// =============================================================================
// Migration Functions
// =============================================================================

/**
 * Get all existing tournaments from the database.
 */
export async function getAllTournaments(): Promise<ExistingTournament[]> {
  const result = await dataConnectAdmin.executeGraphql<{
    tournaments: ExistingTournament[];
  }, Record<string, never>>(GET_ALL_TOURNAMENTS, { variables: {} });

  return result.data.tournaments;
}

/**
 * Get all participants for a tournament.
 */
async function getTournamentParticipants(
  tournamentId: string
): Promise<ExistingParticipant[]> {
  const result = await dataConnectAdmin.executeGraphql<{
    participants: ExistingParticipant[];
  }, { tournamentId: string }>(GET_TOURNAMENT_PARTICIPANTS, {
    variables: { tournamentId }
  });

  return result.data.participants;
}

/**
 * Migrate a single tournament.
 *
 * Steps:
 * 1. Call refreshLeague() to populate LeagueEntry table from FPL API
 * 2. Get refreshId from the league
 * 3. Get existing Participant records
 * 4. Create TournamentEntry records from Participant data
 */
export async function migrateTournament(
  tournament: ExistingTournament
): Promise<MigrationResult> {
  const season = getCurrentSeason();
  const { id: tournamentId, fplLeagueId, fplLeagueName, participantCount } = tournament;

  console.log(`[Migration] Starting migration for tournament ${tournamentId} (${fplLeagueName})`);

  try {
    // Step 1: Refresh league to populate LeagueEntry
    console.log(`[Migration] Refreshing league ${fplLeagueId} (${fplLeagueName})`);
    const refreshResult = await refreshLeague(fplLeagueId, season);
    console.log(`[Migration] League refreshed: ${refreshResult.entriesCount} entries, refreshId=${refreshResult.refreshId}`);

    // Step 2: Get existing participants
    const participants = await getTournamentParticipants(tournamentId);
    console.log(`[Migration] Found ${participants.length} participants in tournament`);

    if (participants.length === 0) {
      console.log(`[Migration] No participants found, skipping TournamentEntry creation`);
      return {
        tournamentId,
        fplLeagueId,
        fplLeagueName,
        participantCount,
        leagueEntriesCreated: refreshResult.entriesCount,
        tournamentEntriesCreated: 0,
        success: true,
      };
    }

    // Step 3: Create TournamentEntry records from Participant data
    const authClaims: AuthClaims = {
      sub: tournament.creatorUid,
      email: `${tournament.creatorUid}@system.internal`,
      email_verified: true,
    };

    const tournamentEntries = participants.map(p => ({
      tournamentId,
      entryId: p.entryId,
      seed: p.seed,
      refreshId: refreshResult.refreshId,
      status: p.status,
      eliminationRound: p.eliminationRound ?? undefined,
      uid: p.uid ?? undefined,
    }));

    await createTournamentEntriesBatch(tournamentEntries, authClaims);
    console.log(`[Migration] Created ${tournamentEntries.length} TournamentEntry records`);

    return {
      tournamentId,
      fplLeagueId,
      fplLeagueName,
      participantCount,
      leagueEntriesCreated: refreshResult.entriesCount,
      tournamentEntriesCreated: tournamentEntries.length,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Migration] Failed to migrate tournament ${tournamentId}:`, error);

    return {
      tournamentId,
      fplLeagueId,
      fplLeagueName,
      participantCount,
      leagueEntriesCreated: 0,
      tournamentEntriesCreated: 0,
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Run the full migration for all existing tournaments.
 *
 * Steps:
 * 1. Get all existing tournaments
 * 2. For each tournament, call migrateTournament()
 * 3. Collect and return results
 */
export async function migrateToLeagueEntries(): Promise<FullMigrationResult> {
  console.log('[Migration] Starting full migration to LeagueEntry/TournamentEntry model');

  // Step 1: Get all tournaments
  const tournaments = await getAllTournaments();
  console.log(`[Migration] Found ${tournaments.length} tournaments to migrate`);

  if (tournaments.length === 0) {
    console.log('[Migration] No tournaments to migrate');
    return {
      totalTournaments: 0,
      successfulMigrations: 0,
      failedMigrations: 0,
      results: [],
    };
  }

  // Step 2: Migrate each tournament
  const results: MigrationResult[] = [];
  let successfulMigrations = 0;
  let failedMigrations = 0;

  for (const tournament of tournaments) {
    const result = await migrateTournament(tournament);
    results.push(result);

    if (result.success) {
      successfulMigrations++;
    } else {
      failedMigrations++;
    }

    // Brief pause between tournaments to avoid overwhelming the FPL API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Step 3: Log summary
  console.log('[Migration] ='.repeat(50));
  console.log('[Migration] MIGRATION COMPLETE');
  console.log(`[Migration] Total tournaments: ${tournaments.length}`);
  console.log(`[Migration] Successful: ${successfulMigrations}`);
  console.log(`[Migration] Failed: ${failedMigrations}`);
  console.log('[Migration] ='.repeat(50));

  if (failedMigrations > 0) {
    console.log('[Migration] Failed migrations:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`[Migration]   - ${r.tournamentId} (${r.fplLeagueName}): ${r.error}`);
      });
  }

  return {
    totalTournaments: tournaments.length,
    successfulMigrations,
    failedMigrations,
    results,
  };
}

// =============================================================================
// Verification Functions
// =============================================================================

/**
 * Verify migration was successful for a single tournament.
 * Checks:
 * 1. LeagueEntry exists for the league
 * 2. TournamentEntry count matches Participant count
 * 3. All entry IDs match
 */
export async function verifyTournamentMigration(
  tournamentId: string
): Promise<{ success: boolean; issues: string[] }> {
  const issues: string[] = [];
  const season = getCurrentSeason();

  // Get tournament info (we need to query it since we only have the ID)
  const tournamentResult = await dataConnectAdmin.executeGraphql<{
    tournament: ExistingTournament | null;
  }, { id: string }>(`
    query GetTournament($id: UUID!) {
      tournament(id: $id) {
        id
        fplLeagueId
        fplLeagueName
        participantCount
      }
    }
  `, { variables: { id: tournamentId } });

  const tournament = tournamentResult.data.tournament;
  if (!tournament) {
    return { success: false, issues: [`Tournament ${tournamentId} not found`] };
  }

  // Check 1: LeagueEntry exists
  const leagueEntriesResult = await dataConnectAdmin.executeGraphql<{
    leagueEntries: Array<{ entryId: number }>;
  }, { leagueId: number; season: string }>(GET_LEAGUE_ENTRIES_COUNT, {
    variables: { leagueId: tournament.fplLeagueId, season }
  });

  if (leagueEntriesResult.data.leagueEntries.length === 0) {
    issues.push(`No LeagueEntry records found for league ${tournament.fplLeagueId}`);
  }

  // Check 2: TournamentEntry count
  const tournamentEntriesResult = await dataConnectAdmin.executeGraphql<{
    tournamentEntries: Array<{ entryId: number; seed: number }>;
  }, { tournamentId: string }>(GET_TOURNAMENT_ENTRIES, {
    variables: { tournamentId }
  });

  const participants = await getTournamentParticipants(tournamentId);

  if (tournamentEntriesResult.data.tournamentEntries.length !== participants.length) {
    issues.push(
      `TournamentEntry count (${tournamentEntriesResult.data.tournamentEntries.length}) ` +
      `does not match Participant count (${participants.length})`
    );
  }

  // Check 3: All entry IDs match
  const participantEntryIds = new Set(participants.map(p => p.entryId));
  const tournamentEntryIds = new Set(
    tournamentEntriesResult.data.tournamentEntries.map(te => te.entryId)
  );

  const missingInTournamentEntry = [...participantEntryIds].filter(
    id => !tournamentEntryIds.has(id)
  );
  const extraInTournamentEntry = [...tournamentEntryIds].filter(
    id => !participantEntryIds.has(id)
  );

  if (missingInTournamentEntry.length > 0) {
    issues.push(
      `Missing entry IDs in TournamentEntry: ${missingInTournamentEntry.slice(0, 5).join(', ')}` +
      (missingInTournamentEntry.length > 5 ? ` and ${missingInTournamentEntry.length - 5} more` : '')
    );
  }

  if (extraInTournamentEntry.length > 0) {
    issues.push(
      `Extra entry IDs in TournamentEntry: ${extraInTournamentEntry.slice(0, 5).join(', ')}` +
      (extraInTournamentEntry.length > 5 ? ` and ${extraInTournamentEntry.length - 5} more` : '')
    );
  }

  return {
    success: issues.length === 0,
    issues,
  };
}

/**
 * Verify migration for all tournaments.
 */
export async function verifyFullMigration(): Promise<{
  totalTournaments: number;
  successful: number;
  failed: number;
  issues: Array<{ tournamentId: string; issues: string[] }>;
}> {
  console.log('[Verification] Starting verification of migration');

  const tournaments = await getAllTournaments();
  console.log(`[Verification] Found ${tournaments.length} tournaments to verify`);

  let successful = 0;
  let failed = 0;
  const allIssues: Array<{ tournamentId: string; issues: string[] }> = [];

  for (const tournament of tournaments) {
    const result = await verifyTournamentMigration(tournament.id);

    if (result.success) {
      successful++;
    } else {
      failed++;
      allIssues.push({ tournamentId: tournament.id, issues: result.issues });
    }
  }

  console.log('[Verification] ='.repeat(50));
  console.log('[Verification] VERIFICATION COMPLETE');
  console.log(`[Verification] Total: ${tournaments.length}`);
  console.log(`[Verification] Successful: ${successful}`);
  console.log(`[Verification] Failed: ${failed}`);
  console.log('[Verification] ='.repeat(50));

  if (allIssues.length > 0) {
    console.log('[Verification] Issues found:');
    allIssues.forEach(({ tournamentId, issues }) => {
      console.log(`[Verification]   Tournament ${tournamentId}:`);
      issues.forEach(issue => {
        console.log(`[Verification]     - ${issue}`);
      });
    });
  }

  return {
    totalTournaments: tournaments.length,
    successful,
    failed,
    issues: allIssues,
  };
}

/**
 * Dry run: Check what would be migrated without making changes.
 */
export async function dryRunMigration(): Promise<{
  tournamentsToMigrate: number;
  tournamentDetails: Array<{
    id: string;
    fplLeagueId: number;
    fplLeagueName: string;
    participantCount: number;
    hasExistingTournamentEntries: boolean;
    existingTournamentEntryCount: number;
  }>;
}> {
  console.log('[DryRun] Analyzing tournaments for migration');

  const tournaments = await getAllTournaments();
  console.log(`[DryRun] Found ${tournaments.length} tournaments`);

  const details = [];

  for (const tournament of tournaments) {
    // Check if TournamentEntry already exists
    const tournamentEntriesResult = await dataConnectAdmin.executeGraphql<{
      tournamentEntries: Array<{ entryId: number }>;
    }, { tournamentId: string }>(GET_TOURNAMENT_ENTRIES, {
      variables: { tournamentId: tournament.id }
    });

    const existingCount = tournamentEntriesResult.data.tournamentEntries.length;

    details.push({
      id: tournament.id,
      fplLeagueId: tournament.fplLeagueId,
      fplLeagueName: tournament.fplLeagueName,
      participantCount: tournament.participantCount,
      hasExistingTournamentEntries: existingCount > 0,
      existingTournamentEntryCount: existingCount,
    });
  }

  const needsMigration = details.filter(d => !d.hasExistingTournamentEntries);

  console.log('[DryRun] ='.repeat(50));
  console.log('[DryRun] DRY RUN COMPLETE');
  console.log(`[DryRun] Total tournaments: ${tournaments.length}`);
  console.log(`[DryRun] Already migrated: ${details.filter(d => d.hasExistingTournamentEntries).length}`);
  console.log(`[DryRun] Need migration: ${needsMigration.length}`);
  console.log('[DryRun] ='.repeat(50));

  if (needsMigration.length > 0) {
    console.log('[DryRun] Tournaments needing migration:');
    needsMigration.forEach(t => {
      console.log(`[DryRun]   - ${t.id}: ${t.fplLeagueName} (${t.participantCount} participants)`);
    });
  }

  return {
    tournamentsToMigrate: needsMigration.length,
    tournamentDetails: details,
  };
}
