// functions/src/processTournamentImport.ts
// Cloud Task handler for background import of large FPL leagues

import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { dataConnectAdmin } from './dataconnect-admin';
import { fetchFPLLeagueStandingsPage } from './fplApiFetcher';
import { fetchParticipantLeaguesBatch } from './fetchParticipantLeagues';
import { createParticipantLeaguesBatch, CreateParticipantLeagueInput } from './dataconnect-mutations';

// GraphQL mutations for import progress tracking
const UPDATE_TOURNAMENT_IMPORT_PROGRESS = `
  mutation UpdateTournamentImportProgress(
    $id: UUID!,
    $importStatus: String!,
    $importProgress: Int!,
    $importedCount: Int!,
    $importError: String
  ) {
    tournament_update(
      id: $id,
      data: {
        importStatus: $importStatus,
        importProgress: $importProgress,
        importedCount: $importedCount,
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
        updatedAt_expr: "request.time"
      }
    )
  }
`;

interface ImportProgress {
  importedCount: number;
  progress: number;
}

interface StandingsResult {
  entry: number;
  entry_name: string;
  player_name: string;
  rank: number;
  total: number;
}

/**
 * Updates tournament import progress in database.
 */
async function updateImportProgress(
  tournamentId: string,
  importedCount: number,
  totalCount: number,
  status: string,
  error?: string
): Promise<void> {
  const progress = Math.round((importedCount / totalCount) * 100);
  await dataConnectAdmin.executeGraphql(UPDATE_TOURNAMENT_IMPORT_PROGRESS, {
    variables: {
      id: tournamentId,
      importStatus: status,
      importProgress: progress,
      importedCount,
      importError: error || null
    }
  });
}

/**
 * Imports participants in batches, updating progress as we go.
 */
export async function importParticipantsBatched(
  tournamentId: string,
  leagueId: number,
  totalCount: number,
  onProgress: (progress: ImportProgress) => void
): Promise<{ importedCount: number; participants: StandingsResult[] }> {
  const allParticipants: StandingsResult[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const pageData = await fetchFPLLeagueStandingsPage(leagueId, page);
    allParticipants.push(...pageData.standings.results);
    hasNext = pageData.standings.has_next;
    page++;

    // Report progress (0-50% for fetching)
    const progress = Math.round((allParticipants.length / totalCount) * 50);
    onProgress({ importedCount: allParticipants.length, progress });

    // Small delay to avoid rate limiting
    if (hasNext) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return { importedCount: allParticipants.length, participants: allParticipants };
}

/**
 * Import mini-leagues for all participants.
 * Progress: 75-90% for mini-league fetching
 */
async function importParticipantMiniLeagues(
  tournamentId: string,
  entryIds: number[],
  onProgress: (progress: number) => void
): Promise<void> {
  // Fetch mini-leagues for all participants (batched with rate limiting)
  const leaguesMap = await fetchParticipantLeaguesBatch(
    entryIds,
    (count, total) => {
      // Progress: 75-90% for mini-league fetching
      const progress = 75 + (count / total) * 15;
      onProgress(progress);
    }
  );

  // Flatten into batch insert format
  const leagueRecords: CreateParticipantLeagueInput[] = [];

  Array.from(leaguesMap.entries()).forEach(([entryId, leagues]) => {
    for (const league of leagues) {
      leagueRecords.push({
        tournamentId,
        entryId,
        leagueId: league.leagueId,
        leagueName: league.leagueName,
        entryRank: league.entryRank
      });
    }
  });

  // Batch insert all league memberships
  await createParticipantLeaguesBatch(leagueRecords);

  onProgress(90);
}

/**
 * Cloud Task: Process tournament import in background.
 */
export const processTournamentImport = onTaskDispatched({
  region: 'europe-west1',
  retryConfig: {
    maxAttempts: 3,
    minBackoffSeconds: 60
  },
  rateLimits: {
    maxConcurrentDispatches: 1
  }
}, async (request) => {
  const { tournamentId, leagueId, totalCount } = request.data as {
    tournamentId: string;
    leagueId: number;
    totalCount: number;
  };

  try {
    // Update status to 'importing'
    await updateImportProgress(tournamentId, 0, totalCount, 'importing');

    // Import participants (0-50% progress)
    const { participants } = await importParticipantsBatched(
      tournamentId,
      leagueId,
      totalCount,
      async ({ importedCount, progress }) => {
        // Update progress every 10%
        if (progress % 10 === 0) {
          await updateImportProgress(tournamentId, importedCount, totalCount, 'importing');
        }
      }
    );

    // TODO: Create Entry and Participant records in database using existing batch functions
    // TODO: Generate bracket and create matches

    // Import mini-leagues (75-90% progress)
    const entryIds = participants.map(p => p.entry);
    await importParticipantMiniLeagues(
      tournamentId,
      entryIds,
      async (progress) => {
        await updateImportProgress(
          tournamentId,
          participants.length,
          totalCount,
          'importing'
        );
      }
    );

    // Finalize tournament (100%)
    await dataConnectAdmin.executeGraphql(FINALIZE_TOURNAMENT_IMPORT, {
      variables: {
        id: tournamentId,
        participantCount: participants.length
      }
    });
  } catch (error) {
    console.error('Import failed:', error);
    await updateImportProgress(
      tournamentId,
      0,
      totalCount,
      'failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error; // Re-throw for Cloud Tasks retry
  }
});
