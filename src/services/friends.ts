// src/services/friends.ts
import { getUserMiniLeagues } from './fpl';
import { getParticipantLeaguesForTournament } from './tournament';
import type { Participant } from '@/types/tournament';

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
 * Find all participants who share mini-leagues with the user (beyond the tournament league).
 *
 * @param tournamentId - Tournament ID
 * @param tournamentLeagueId - FPL league ID for this tournament (excluded from friend calculation)
 * @param userFplTeamId - User's FPL team ID
 * @param participants - Tournament participants
 * @returns Friends sorted by sharedLeagueCount desc, then alphabetically
 */
export async function getTournamentFriends(
  tournamentId: string,
  tournamentLeagueId: number,
  userFplTeamId: number,
  participants: Participant[]
): Promise<FriendInTournament[]> {
  // 1. Get user's leagues from FPL API
  const userLeagues = await getUserMiniLeagues(userFplTeamId);
  const userLeagueIds = new Set(userLeagues.map((l) => l.id));

  // 2. Query ParticipantLeague table (cached from tournament creation)
  const participantLeagues = await getParticipantLeaguesForTournament(tournamentId);

  // 3. For each participant, find shared leagues (excluding tournament league)
  const friends: FriendInTournament[] = [];

  for (const participant of participants) {
    // Skip self
    if (participant.fplTeamId === userFplTeamId) continue;

    // Get their leagues, excluding the tournament league
    const theirLeagues = participantLeagues
      .filter((pl) => pl.entryId === participant.fplTeamId)
      .filter((pl) => pl.leagueId !== tournamentLeagueId);

    // Find shared leagues
    const sharedLeagues = theirLeagues.filter((pl) => userLeagueIds.has(pl.leagueId));

    // If they share at least 1 league (excluding tournament), they're a friend
    if (sharedLeagues.length >= 1) {
      friends.push({
        fplTeamId: participant.fplTeamId,
        teamName: participant.fplTeamName,
        managerName: participant.managerName,
        sharedLeagueCount: sharedLeagues.length,
        sharedLeagueNames: sharedLeagues.map((l) => l.leagueName),
        seed: participant.seed,
        status: 'in', // TODO: Calculate from tournament data
        eliminatedRound: undefined,
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
