// functions/src/friends.ts
// Friends service for finding shared mini-league memberships in tournaments

import { dataConnectAdmin } from './dataconnect-admin';

// =============================================================================
// Types
// =============================================================================

export interface FriendMatch {
  entryId: number;
  teamName: string;
  managerName: string;
  sharedLeagueCount: number;
  sharedLeagueNames: string[];
}

// System leagues have leagueId < 336 - these are excluded at query time
const SYSTEM_LEAGUE_THRESHOLD = 336;

// =============================================================================
// GraphQL Queries
// =============================================================================

/**
 * Get data needed to compute friends in a tournament.
 * This query fetches:
 * 1. User's league memberships (filtered by season, excluding system leagues)
 * 2. All tournament participants with entry details
 */
const GET_FRIENDS_IN_TOURNAMENT_QUERY = `
  query GetFriendsInTournament(
    $tournamentId: UUID!
    $userEntryId: Int!
    $season: String!
  ) {
    # Get user's league memberships (system leagues have id < 336, so filter ge: 336)
    userLeagues: leagueEntries(
      where: {
        entryId: { eq: $userEntryId }
        season: { eq: $season }
        leagueId: { ge: ${SYSTEM_LEAGUE_THRESHOLD} }
      }
    ) {
      leagueId
    }

    # Get all tournament participants with entry details
    tournamentParticipants: tournamentEntries(
      where: { tournamentId: { eq: $tournamentId } }
      orderBy: { seed: ASC }
    ) {
      entryId
      seed
      status
      entry {
        name
        playerFirstName
        playerLastName
      }
    }
  }
`;

/**
 * Get league entries for a specific entry to find their league memberships.
 * Used to find shared leagues between user and participants.
 */
const GET_ENTRY_LEAGUES_QUERY = `
  query GetEntryLeagues(
    $entryId: Int!
    $season: String!
  ) {
    leagueEntries(
      where: {
        entryId: { eq: $entryId }
        season: { eq: $season }
        leagueId: { ge: ${SYSTEM_LEAGUE_THRESHOLD} }
      }
    ) {
      leagueId
    }
  }
`;

/**
 * Get league names for specific league IDs.
 */
const GET_LEAGUES_BY_IDS_QUERY = `
  query GetLeaguesByIds(
    $leagueIds: [Int!]!
    $season: String!
  ) {
    leagues(
      where: {
        leagueId: { in: $leagueIds }
        season: { eq: $season }
      }
    ) {
      leagueId
      name
    }
  }
`;

// =============================================================================
// Response Types
// =============================================================================

interface UserLeague {
  leagueId: number;
}

interface TournamentParticipant {
  entryId: number;
  seed: number;
  status: string;
  entry: {
    name: string;
    playerFirstName: string | null;
    playerLastName: string | null;
  };
}

interface LeagueInfo {
  leagueId: number;
  name: string;
}

interface GetFriendsInTournamentResponse {
  userLeagues: UserLeague[];
  tournamentParticipants: TournamentParticipant[];
}

interface GetEntryLeaguesResponse {
  leagueEntries: UserLeague[];
}

interface GetLeaguesByIdsResponse {
  leagues: LeagueInfo[];
}

// =============================================================================
// Main Function
// =============================================================================

/**
 * Find friends in tournament.
 * Friends are participants who share mini-leagues with the user.
 *
 * Logic:
 * 1. Get user's leagues from LeagueEntry (where leagueId >= 336)
 * 2. Get tournament participants from TournamentEntry
 * 3. For each participant, check LeagueEntry for shared leagues
 * 4. Exclude tournament league from shared count
 * 5. Return sorted by sharedLeagueCount desc
 *
 * @param tournamentId - UUID of the tournament
 * @param tournamentLeagueId - FPL league ID of the tournament (to exclude from shared count)
 * @param userEntryId - FPL entry ID of the user
 * @param season - Season string (e.g., "2024-25")
 * @returns List of friends sorted by shared league count (descending)
 */
export async function getFriendsInTournament(
  tournamentId: string,
  tournamentLeagueId: number,
  userEntryId: number,
  season: string
): Promise<FriendMatch[]> {
  console.log(`[getFriendsInTournament] Finding friends for entry ${userEntryId} in tournament ${tournamentId}`);

  // 1. Get user's leagues and tournament participants in one query
  const initialResult = await dataConnectAdmin.executeGraphql<
    GetFriendsInTournamentResponse,
    { tournamentId: string; userEntryId: number; season: string }
  >(GET_FRIENDS_IN_TOURNAMENT_QUERY, {
    variables: { tournamentId, userEntryId, season },
  });

  const userLeagueIds = new Set(
    initialResult.data.userLeagues.map(l => l.leagueId)
  );
  const participants = initialResult.data.tournamentParticipants;

  console.log(`[getFriendsInTournament] User has ${userLeagueIds.size} leagues, tournament has ${participants.length} participants`);

  // If user has no leagues (excluding system leagues), no friends can be found
  if (userLeagueIds.size === 0) {
    console.log(`[getFriendsInTournament] User has no eligible leagues, returning empty`);
    return [];
  }

  // 2. For each participant (excluding user), find shared leagues
  const friendMatches: Array<{
    participant: TournamentParticipant;
    sharedLeagueIds: number[];
  }> = [];

  // Collect all league IDs we'll need to fetch names for
  const allSharedLeagueIds = new Set<number>();

  // Process participants in batches to avoid too many concurrent requests
  const BATCH_SIZE = 20;
  const participantsExcludingUser = participants.filter(p => p.entryId !== userEntryId);

  for (let i = 0; i < participantsExcludingUser.length; i += BATCH_SIZE) {
    const batch = participantsExcludingUser.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(async (participant) => {
        const leagueResult = await dataConnectAdmin.executeGraphql<
          GetEntryLeaguesResponse,
          { entryId: number; season: string }
        >(GET_ENTRY_LEAGUES_QUERY, {
          variables: { entryId: participant.entryId, season },
        });

        const participantLeagueIds = leagueResult.data.leagueEntries.map(l => l.leagueId);

        // Find shared leagues (excluding tournament league)
        const sharedLeagueIds = participantLeagueIds.filter(
          leagueId => leagueId !== tournamentLeagueId && userLeagueIds.has(leagueId)
        );

        return { participant, sharedLeagueIds };
      })
    );

    // Collect results
    for (const result of batchResults) {
      if (result.sharedLeagueIds.length > 0) {
        friendMatches.push(result);
        result.sharedLeagueIds.forEach(id => allSharedLeagueIds.add(id));
      }
    }
  }

  console.log(`[getFriendsInTournament] Found ${friendMatches.length} participants with shared leagues`);

  // If no shared leagues found, return empty
  if (friendMatches.length === 0) {
    return [];
  }

  // 3. Fetch league names for all shared leagues
  const leagueNamesResult = await dataConnectAdmin.executeGraphql<
    GetLeaguesByIdsResponse,
    { leagueIds: number[]; season: string }
  >(GET_LEAGUES_BY_IDS_QUERY, {
    variables: { leagueIds: Array.from(allSharedLeagueIds), season },
  });

  const leagueNameMap = new Map<number, string>(
    leagueNamesResult.data.leagues.map(l => [l.leagueId, l.name])
  );

  // 4. Build friend matches with league names
  const friends: FriendMatch[] = friendMatches.map(({ participant, sharedLeagueIds }) => {
    const entry = participant.entry;
    const managerName = [entry.playerFirstName, entry.playerLastName]
      .filter(Boolean)
      .join(' ') || 'Unknown';

    return {
      entryId: participant.entryId,
      teamName: entry.name,
      managerName,
      sharedLeagueCount: sharedLeagueIds.length,
      sharedLeagueNames: sharedLeagueIds
        .map(id => leagueNameMap.get(id) || `League ${id}`)
        .sort(),
    };
  });

  // 5. Sort by sharedLeagueCount (descending), then by teamName (ascending)
  friends.sort((a, b) => {
    if (b.sharedLeagueCount !== a.sharedLeagueCount) {
      return b.sharedLeagueCount - a.sharedLeagueCount;
    }
    return a.teamName.localeCompare(b.teamName);
  });

  console.log(`[getFriendsInTournament] Returning ${friends.length} friends`);

  return friends;
}
