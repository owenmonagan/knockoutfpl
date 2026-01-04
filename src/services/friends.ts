// src/services/friends.ts
import { getUserMiniLeagues } from './fpl';
import { getParticipantLeaguesForTournament } from './tournament';
import type { Participant, TournamentEntry } from '@/types/tournament';
import { getManagerName, getTeamName } from '@/types/tournament';

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
 * Supports both legacy Participant array and new TournamentEntry array.
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

  // 1. Get user's leagues from FPL API
  const userLeagues = await getUserMiniLeagues(userFplTeamId);
  const userLeagueIds = new Set(userLeagues.map((l) => l.id));

  // 2. Query ParticipantLeague table (cached from tournament creation)
  const participantLeagues = await getParticipantLeaguesForTournament(tournamentId);

  // 3. For each participant, find shared leagues (excluding tournament league)
  const friends: FriendInTournament[] = [];

  for (const participant of normalizedParticipants) {
    // Skip self
    if (participant.entryId === userFplTeamId) continue;

    // Get their leagues, excluding the tournament league
    const theirLeagues = participantLeagues
      .filter((pl) => pl.entryId === participant.entryId)
      .filter((pl) => pl.leagueId !== tournamentLeagueId);

    // Find shared leagues
    const sharedLeagues = theirLeagues.filter((pl) => userLeagueIds.has(pl.leagueId));

    // If they share at least 1 league (excluding tournament), they're a friend
    if (sharedLeagues.length >= 1) {
      friends.push({
        fplTeamId: participant.entryId,
        teamName: participant.teamName,
        managerName: participant.managerName,
        sharedLeagueCount: sharedLeagues.length,
        sharedLeagueNames: sharedLeagues.map((l) => l.leagueName),
        seed: participant.seed,
        status: participant.status === 'eliminated' ? 'eliminated' : 'in',
        eliminatedRound: participant.eliminationRound,
      });
    }
  }

  // 4. Sort by shared count desc, then alphabetically by team name
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
