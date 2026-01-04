// src/services/friends.ts
import { getFriendsInTournament, getLeagueEntriesForEntries, getLeagues } from '@knockoutfpl/dataconnect';
import { dataConnect } from '@/lib/firebase';
import type { Participant, TournamentEntry } from '@/types/tournament';
import { getManagerName, getTeamName } from '@/types/tournament';
import type { UUIDString } from '@knockoutfpl/dataconnect';

// Current FPL season - should match the season used in tournament creation
const CURRENT_SEASON = '2024-25';

/**
 * A friend is a manager who shares at least 1 mini-league with the user,
 * EXCLUDING the tournament's league.
 */
export interface FriendInTournament {
  fplTeamId: number;
  teamName: string;
  managerName: string;
  sharedLeagueCount: number; // Excludes tournament league
  sharedLeagueNames: string[]; // For display: "Work League, Draft League"
  status: 'in' | 'eliminated';
  eliminatedRound?: number;
  seed: number;
}

/**
 * Normalized participant data for internal processing.
 * Works with both legacy Participant and new TournamentEntry types.
 */
interface NormalizedParticipant {
  entryId: number;
  teamName: string;
  managerName: string;
  seed: number;
  status: 'active' | 'eliminated';
  eliminationRound?: number;
}

/**
 * Convert a TournamentEntry to normalized format
 */
function normalizeEntry(entry: TournamentEntry): NormalizedParticipant {
  return {
    entryId: entry.entryId,
    teamName: getTeamName(entry),
    managerName: getManagerName(entry),
    seed: entry.seed,
    status: entry.status,
    eliminationRound: entry.eliminationRound,
  };
}

/**
 * Convert a legacy Participant to normalized format
 */
function normalizeParticipant(participant: Participant): NormalizedParticipant {
  return {
    entryId: participant.fplTeamId,
    teamName: participant.fplTeamName,
    managerName: participant.managerName,
    seed: participant.seed,
    status: 'active', // Legacy format doesn't have elimination data
    eliminationRound: undefined,
  };
}

/**
 * Find all participants who share mini-leagues with the user (beyond the tournament league).
 *
 * Uses LeagueEntry table to find shared leagues between users.
 *
 * @param tournamentId - Tournament ID
 * @param tournamentLeagueId - FPL league ID for this tournament (excluded from friend calculation)
 * @param userFplTeamId - User's FPL team ID
 * @param participants - Tournament participants (legacy Participant[] or new TournamentEntry[])
 * @returns Friends sorted by sharedLeagueCount desc, then alphabetically
 */
export async function getTournamentFriends(
  tournamentId: string,
  tournamentLeagueId: number,
  userFplTeamId: number,
  participants: Participant[] | TournamentEntry[]
): Promise<FriendInTournament[]> {
  // Normalize participants to a common format
  const normalizedParticipants: NormalizedParticipant[] = participants.map((p) => {
    // Check if it's a TournamentEntry (has 'entryId' and 'entry' properties)
    if ('entryId' in p && 'entry' in p) {
      return normalizeEntry(p as TournamentEntry);
    }
    // Otherwise it's a legacy Participant
    return normalizeParticipant(p as Participant);
  });

  // 1. Get user's leagues from LeagueEntry table
  const friendsData = await getFriendsInTournament(dataConnect, {
    tournamentId: tournamentId as UUIDString,
    userEntryId: userFplTeamId,
    season: CURRENT_SEASON,
  });

  const userLeagueIds = new Set(friendsData.data.userLeagues.map((l) => l.leagueId));

  // If user has no leagues, they can't have friends
  if (userLeagueIds.size === 0) {
    return [];
  }

  // 2. Get all participant entry IDs (excluding self)
  const otherParticipantIds = normalizedParticipants
    .filter((p) => p.entryId !== userFplTeamId)
    .map((p) => p.entryId);

  if (otherParticipantIds.length === 0) {
    return [];
  }

  // 3. Query LeagueEntry for all participants' league memberships
  const participantLeaguesResult = await getLeagueEntriesForEntries(dataConnect, {
    entryIds: otherParticipantIds,
    season: CURRENT_SEASON,
  });

  // Build a map of entryId -> leagueIds
  const participantLeagueMap = new Map<number, number[]>();
  for (const le of participantLeaguesResult.data.leagueEntries) {
    const existing = participantLeagueMap.get(le.entryId) || [];
    existing.push(le.leagueId);
    participantLeagueMap.set(le.entryId, existing);
  }

  // 4. Collect all shared league IDs for league name lookup
  const sharedLeagueIdsSet = new Set<number>();
  const participantSharedLeagues = new Map<number, number[]>();

  for (const participant of normalizedParticipants) {
    if (participant.entryId === userFplTeamId) continue;

    const theirLeagues = participantLeagueMap.get(participant.entryId) || [];

    // Find shared leagues (excluding tournament league)
    const sharedLeagues = theirLeagues.filter(
      (leagueId) => leagueId !== tournamentLeagueId && userLeagueIds.has(leagueId)
    );

    if (sharedLeagues.length > 0) {
      participantSharedLeagues.set(participant.entryId, sharedLeagues);
      sharedLeagues.forEach((id) => sharedLeagueIdsSet.add(id));
    }
  }

  // If no shared leagues found, return empty
  if (sharedLeagueIdsSet.size === 0) {
    return [];
  }

  // 5. Fetch league names for all shared leagues
  const leagueNameMap = new Map<number, string>();
  const sharedLeagueIds = Array.from(sharedLeagueIdsSet);

  // Query leagues in batches to get names
  const leaguesResult = await getLeagues(dataConnect, {
    leagueIds: sharedLeagueIds,
    season: CURRENT_SEASON,
  });

  for (const league of leaguesResult.data.leagues) {
    leagueNameMap.set(league.leagueId, league.name);
  }

  // 6. Build friend objects
  const friends: FriendInTournament[] = [];

  for (const participant of normalizedParticipants) {
    const sharedLeagues = participantSharedLeagues.get(participant.entryId);
    if (!sharedLeagues || sharedLeagues.length === 0) continue;

    friends.push({
      fplTeamId: participant.entryId,
      teamName: participant.teamName,
      managerName: participant.managerName,
      sharedLeagueCount: sharedLeagues.length,
      sharedLeagueNames: sharedLeagues
        .map((id) => leagueNameMap.get(id) || `League ${id}`)
        .sort(),
      seed: participant.seed,
      status: participant.status === 'eliminated' ? 'eliminated' : 'in',
      eliminatedRound: participant.eliminationRound,
    });
  }

  // 7. Sort by shared count desc, then alphabetically by team name
  return friends.sort((a, b) => {
    if (b.sharedLeagueCount !== a.sharedLeagueCount) {
      return b.sharedLeagueCount - a.sharedLeagueCount;
    }
    return a.teamName.localeCompare(b.teamName);
  });
}

/**
 * Find tournament friends using TournamentEntry data directly.
 * This is the new preferred method when TournamentEntry data is available.
 *
 * @param tournamentId - Tournament ID
 * @param tournamentLeagueId - FPL league ID for this tournament (excluded from friend calculation)
 * @param userFplTeamId - User's FPL team ID
 * @param entries - Tournament entries (new TournamentEntry format)
 * @returns Friends sorted by sharedLeagueCount desc, then alphabetically
 */
export async function getTournamentFriendsFromEntries(
  tournamentId: string,
  tournamentLeagueId: number,
  userFplTeamId: number,
  entries: TournamentEntry[]
): Promise<FriendInTournament[]> {
  return getTournamentFriends(tournamentId, tournamentLeagueId, userFplTeamId, entries);
}
