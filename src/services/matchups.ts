// src/services/matchups.ts
import { getTournamentFriends, FriendInTournament } from './friends';
import type { Tournament, Match, Round, Participant } from '@/types/tournament';
import { getMatchPlayers } from '@/types/tournament';

export interface MatchupOptions {
  round?: number; // undefined = latest match per participant
  friendsOnly?: boolean; // filter to just friends
  userFplTeamId?: number; // required if friendsOnly or for isFriend flag
  tournamentLeagueId?: number; // required if friendsOnly
}

export interface MatchupResult {
  participant: Participant;
  match: Match | null;
  round: Round | null;
  opponent: Participant | null;
  matchStatus: 'live' | 'upcoming' | 'finished' | 'eliminated';
  result?: 'winning' | 'losing' | 'tied' | 'won' | 'lost';
  isFriend?: boolean; // Always included if userFplTeamId provided
  sharedLeagueCount?: number;
}

/**
 * Get matchups for a tournament with optional filtering.
 *
 * Usage examples:
 * - Overview: friends' latest matches
 *   getTournamentMatchups(tournament, { friendsOnly: true, userFplTeamId, tournamentLeagueId })
 *
 * - Matches tab: all matches in round 3
 *   getTournamentMatchups(tournament, { round: 3 })
 *
 * - Matches tab: all matches with friend highlighting
 *   getTournamentMatchups(tournament, { round: 3, userFplTeamId, tournamentLeagueId })
 */
export async function getTournamentMatchups(
  tournament: Tournament,
  options: MatchupOptions = {}
): Promise<MatchupResult[]> {
  const { round, friendsOnly, userFplTeamId, tournamentLeagueId } = options;

  // 1. Get friends if needed for enrichment or filtering
  let friendIds: Set<number> | null = null;
  let friendsMap: Map<number, FriendInTournament> | null = null;

  if (userFplTeamId && tournamentLeagueId) {
    const friends = await getTournamentFriends(
      tournament.id,
      tournament.fplLeagueId,
      userFplTeamId,
      tournament.participants
    );
    friendIds = new Set(friends.map((f) => f.fplTeamId));
    friendsMap = new Map(friends.map((f) => [f.fplTeamId, f]));
  }

  // 2. Build matchups
  let matchups: MatchupResult[];

  if (round !== undefined) {
    matchups = buildMatchupsForRound(tournament, round);
  } else {
    matchups = buildLatestMatchups(tournament);
  }

  // 3. Enrich with friend data
  if (friendsMap) {
    matchups = matchups.map((m) => ({
      ...m,
      isFriend: friendIds!.has(m.participant.fplTeamId),
      sharedLeagueCount: friendsMap!.get(m.participant.fplTeamId)?.sharedLeagueCount,
    }));
  }

  // 4. Filter if friendsOnly
  if (friendsOnly && friendIds) {
    matchups = matchups.filter((m) => friendIds!.has(m.participant.fplTeamId));
  }

  return matchups;
}

function buildMatchupsForRound(tournament: Tournament, roundNum: number): MatchupResult[] {
  const round = tournament.rounds.find((r) => r.roundNumber === roundNum);
  if (!round) return [];

  const results: MatchupResult[] = [];
  const participantMap = new Map(tournament.participants.map((p) => [p.fplTeamId, p]));

  for (const match of round.matches) {
    const players = getMatchPlayers(match);

    for (const player of players) {
      const participant = participantMap.get(player.fplTeamId);
      if (!participant) continue;

      const opponents = players.filter((p) => p.fplTeamId !== player.fplTeamId);
      const opponent = opponents[0] ? participantMap.get(opponents[0].fplTeamId) : null;

      const matchStatus = getMatchStatus(round, tournament.currentGameweek);
      const result = getMatchResult(match, player.fplTeamId, round.isComplete);

      results.push({
        participant,
        match,
        round,
        opponent: opponent ?? null,
        matchStatus,
        result,
      });
    }
  }

  return results;
}

function buildLatestMatchups(tournament: Tournament): MatchupResult[] {
  const results: MatchupResult[] = [];
  const seen = new Set<number>();

  // Iterate rounds in reverse to find each participant's latest match
  for (let i = tournament.rounds.length - 1; i >= 0; i--) {
    const round = tournament.rounds[i];
    const roundMatchups = buildMatchupsForRound(tournament, round.roundNumber);

    for (const matchup of roundMatchups) {
      if (!seen.has(matchup.participant.fplTeamId)) {
        seen.add(matchup.participant.fplTeamId);
        results.push(matchup);
      }
    }
  }

  return results;
}

function getMatchStatus(
  round: Round,
  currentGameweek: number
): 'live' | 'upcoming' | 'finished' | 'eliminated' {
  if (round.isComplete) return 'finished';
  if (round.gameweek <= currentGameweek) return 'live';
  return 'upcoming';
}

function getMatchResult(
  match: Match,
  fplTeamId: number,
  isComplete: boolean
): 'winning' | 'losing' | 'tied' | 'won' | 'lost' | undefined {
  const players = getMatchPlayers(match);
  const player = players.find((p) => p.fplTeamId === fplTeamId);
  const opponent = players.find((p) => p.fplTeamId !== fplTeamId);

  if (!player || player.score === null) return undefined;
  if (!opponent || opponent.score === null) return undefined;

  const diff = player.score - opponent.score;

  if (isComplete) {
    return match.winnerId === fplTeamId ? 'won' : 'lost';
  }

  if (diff > 0) return 'winning';
  if (diff < 0) return 'losing';
  return 'tied';
}
