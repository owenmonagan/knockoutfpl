import type { Round, Match } from '@/types/tournament';
import { getMatchPlayers } from '@/types/tournament';

export type RoundStatus = 'upcoming' | 'live' | 'complete';

/**
 * Determines the status of a round based on gameweek and completion.
 */
export function getRoundStatus(
  roundGameweek: number,
  currentGameweek: number,
  isComplete: boolean
): RoundStatus {
  if (isComplete) {
    return 'complete';
  }
  if (roundGameweek < currentGameweek) {
    // Past gameweek but not marked complete - treat as complete
    return 'complete';
  }
  if (roundGameweek === currentGameweek) {
    return 'live';
  }
  return 'upcoming';
}

/**
 * Returns display text for round status.
 */
export function getRoundStatusDisplay(status: RoundStatus): string {
  switch (status) {
    case 'live':
      return 'Live';
    case 'complete':
      return 'Complete';
    case 'upcoming':
      return 'Upcoming';
  }
}

/**
 * Find the sibling match that feeds into the same next-round match.
 * Uses bracket position math: matches at positions 2n and 2n+1 feed into position n.
 */
export function findSiblingMatch(
  rounds: Round[],
  userMatch: Match,
  userRoundNumber: number
): { match: Match; round: Round } | null {
  const userRound = rounds.find((r) => r.roundNumber === userRoundNumber);
  if (!userRound) return null;

  // Find position of user's match in current round
  const userMatchIndex = userRound.matches.findIndex((m) => m.id === userMatch.id);
  if (userMatchIndex === -1) return null;

  // In a standard bracket:
  // - Matches at positions 0,1 feed into next round position 0
  // - Matches at positions 2,3 feed into next round position 1
  // - etc.
  // So sibling is at: even index -> index+1, odd index -> index-1
  const siblingIndex = userMatchIndex % 2 === 0 ? userMatchIndex + 1 : userMatchIndex - 1;

  // Check if sibling exists
  if (siblingIndex < 0 || siblingIndex >= userRound.matches.length) {
    return null; // No sibling (e.g., in final)
  }

  const siblingMatch = userRound.matches[siblingIndex];
  return { match: siblingMatch, round: userRound };
}

/**
 * Calculate how many participants are still in the tournament.
 * A participant is "out" if they lost a match (winnerId exists and isn't them).
 */
export function calculateRemainingParticipants(rounds: Round[]): number {
  const eliminatedTeams = new Set<number>();

  for (const round of rounds) {
    for (const match of round.matches) {
      if (!match.winnerId || match.isBye) continue;

      const players = getMatchPlayers(match);
      for (const player of players) {
        if (player.fplTeamId !== match.winnerId) {
          eliminatedTeams.add(player.fplTeamId);
        }
      }
    }
  }

  // Count unique participants
  const allParticipants = new Set<number>();
  for (const round of rounds) {
    for (const match of round.matches) {
      const players = getMatchPlayers(match);
      for (const player of players) {
        allParticipants.add(player.fplTeamId);
      }
    }
  }

  return allParticipants.size - eliminatedTeams.size;
}

/**
 * Get user's tournament status.
 */
export function getUserStatus(
  eliminatedRound: number | undefined,
  tournamentComplete: boolean
): 'in' | 'eliminated' | 'winner' {
  if (eliminatedRound !== undefined) {
    return 'eliminated';
  }
  if (tournamentComplete) {
    return 'winner';
  }
  return 'in';
}

/**
 * Find what round a user was eliminated in (if any).
 */
export function findEliminatedRound(
  rounds: Round[],
  userFplTeamId: number
): number | undefined {
  for (const round of rounds) {
    for (const match of round.matches) {
      if (!match.winnerId || match.isBye) continue;

      const players = getMatchPlayers(match);
      const userPlayer = players.find((p) => p.fplTeamId === userFplTeamId);

      if (userPlayer && match.winnerId !== userFplTeamId) {
        return round.roundNumber;
      }
    }
  }
  return undefined;
}
