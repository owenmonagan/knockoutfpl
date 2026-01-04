// src/services/sharedLeagues.ts
import type { Participant } from '../types/tournament';

/**
 * Represents a single participant-league relationship.
 * Used to track which leagues each tournament participant belongs to.
 */
export interface ParticipantLeagueEntry {
  entryId: number;  // FPL team ID
  leagueId: number; // FPL mini-league ID
}

/**
 * Computes how many leagues each participant shares with the user.
 *
 * @param userLeagueIds - Array of league IDs the current user belongs to
 * @param participantLeagues - Array of participant-league entries for all participants
 * @returns Map<entryId, sharedCount> - Map from participant FPL team ID to shared league count
 *
 * @example
 * ```typescript
 * const userLeagues = [100, 200, 300];
 * const participantLeagues = [
 *   { entryId: 1, leagueId: 100 },  // Participant 1 shares league 100
 *   { entryId: 1, leagueId: 400 },  // Participant 1 in non-shared league
 *   { entryId: 2, leagueId: 100 },  // Participant 2 shares league 100
 *   { entryId: 2, leagueId: 200 },  // Participant 2 also shares league 200
 * ];
 *
 * const counts = computeSharedLeagueCounts(userLeagues, participantLeagues);
 * // counts.get(1) === 1
 * // counts.get(2) === 2
 * ```
 */
export function computeSharedLeagueCounts(
  userLeagueIds: number[],
  participantLeagues: ParticipantLeagueEntry[]
): Map<number, number> {
  const userLeagueSet = new Set(userLeagueIds);
  const counts = new Map<number, number>();

  for (const pl of participantLeagues) {
    const current = counts.get(pl.entryId) || 0;
    if (userLeagueSet.has(pl.leagueId)) {
      counts.set(pl.entryId, current + 1);
    } else if (!counts.has(pl.entryId)) {
      // Initialize to 0 if not seen before
      counts.set(pl.entryId, 0);
    }
  }

  return counts;
}

/**
 * Minimal interface for sortable items
 */
interface Sortable {
  entryId: number;
  teamName: string;
}

/**
 * Sorts items by shared league count (descending).
 * Items with more shared leagues ("friends") appear first.
 * Falls back to alphabetical order by team name for ties.
 *
 * @param items - Array of items to sort (must have entryId and teamName)
 * @param sharedCounts - Map from entry ID to shared league count
 * @returns New sorted array (does not mutate original)
 *
 * @example
 * ```typescript
 * const items = [
 *   { entryId: 1, teamName: 'Team A', ... },
 *   { entryId: 2, teamName: 'Team B', ... },
 * ];
 * const sharedCounts = new Map([[1, 1], [2, 3]]);
 *
 * const sorted = sortByFriendship(items, sharedCounts);
 * // sorted[0].entryId === 2 (has 3 shared leagues)
 * // sorted[1].entryId === 1 (has 1 shared league)
 * ```
 */
export function sortByFriendship<T extends Sortable>(
  items: T[],
  sharedCounts: Map<number, number>
): T[] {
  return [...items].sort((a, b) => {
    const aCount = sharedCounts.get(a.entryId) || 0;
    const bCount = sharedCounts.get(b.entryId) || 0;

    // Higher shared count first
    if (bCount !== aCount) {
      return bCount - aCount;
    }

    // Alphabetical fallback
    return a.teamName.localeCompare(b.teamName);
  });
}

/**
 * Sorts participants by shared league count (descending).
 * Participants with more shared leagues ("friends") appear first.
 * Falls back to alphabetical order by team name for ties.
 *
 * @deprecated Use sortByFriendship instead. Will be removed in Phase 6.
 * @param participants - Array of participants to sort
 * @param sharedCounts - Map from FPL team ID to shared league count
 * @returns New sorted array (does not mutate original)
 */
export function sortParticipantsByFriendship<T extends Participant>(
  participants: T[],
  sharedCounts: Map<number, number>
): T[] {
  return [...participants].sort((a, b) => {
    const aCount = sharedCounts.get(a.fplTeamId) || 0;
    const bCount = sharedCounts.get(b.fplTeamId) || 0;

    // Higher shared count first
    if (bCount !== aCount) {
      return bCount - aCount;
    }

    // Alphabetical fallback
    return a.fplTeamName.localeCompare(b.fplTeamName);
  });
}

/**
 * Fetches user's mini-leagues and participant leagues,
 * then computes and returns sorted participants.
 *
 * This is a higher-level function that orchestrates:
 * 1. Fetching user's mini-leagues from FPL API (via cached data)
 * 2. Fetching all participant leagues for this tournament
 * 3. Computing shared counts
 * 4. Sorting and returning participants
 *
 * @param tournamentId - The tournament ID
 * @param userFplTeamId - The current user's FPL team ID
 * @param participants - Array of tournament participants
 * @returns Promise<T[]> - Sorted participants array
 *
 * @remarks
 * TODO: Implement DataConnect queries to fetch league data.
 * Currently returns unsorted participants (graceful degradation).
 */
export async function getParticipantsSortedByFriendship<T extends Participant>(
  _tournamentId: string,
  _userFplTeamId: number,
  participants: T[]
): Promise<T[]> {
  // TODO: Implement DataConnect queries
  // 1. Fetch user's mini-leagues from FPL API (or cached in UserLeague table)
  // 2. Fetch all participant leagues for this tournament (from ParticipantLeague table)
  // 3. Compute shared counts using computeSharedLeagueCounts
  // 4. Sort and return using sortParticipantsByFriendship

  // For now, return unsorted (feature flag / graceful degradation)
  // This allows the feature to be deployed without breaking existing functionality
  return participants;
}
