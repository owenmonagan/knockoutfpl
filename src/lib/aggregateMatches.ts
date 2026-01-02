import type { MatchSummaryCardProps } from '../components/dashboard/MatchSummaryCard';

export interface MatchInput {
  isLive: boolean;
  opponentTeamName: string;
  opponentFplTeamId: number;
  roundName: string;
  yourScore: number | null;
  theirScore: number | null;
  gameweek: number;
  result: 'won' | 'lost' | 'pending';
}

export interface LeagueMatchData {
  leagueId: number;
  leagueName: string;
  currentMatch: MatchInput | null;
}

export interface AggregateMatchesOptions {
  yourTeamName: string;
  yourFplTeamId: number;
  onNavigate: (leagueId: number) => void;
}

/**
 * Aggregates matches from multiple leagues, prioritizing live matches.
 *
 * Priority:
 * 1. All live matches (isLive === true)
 * 2. If no live matches: single nearest upcoming match (lowest gameweek)
 * 3. Recent results are excluded entirely
 */
export function aggregateMatches(
  leagues: LeagueMatchData[],
  options: AggregateMatchesOptions
): MatchSummaryCardProps[] {
  const { yourTeamName, yourFplTeamId, onNavigate } = options;

  const liveMatches: MatchSummaryCardProps[] = [];
  const upcomingMatches: MatchSummaryCardProps[] = [];

  for (const league of leagues) {
    if (!league.currentMatch) continue;

    const match = league.currentMatch;
    const cardProps: MatchSummaryCardProps = {
      type: match.isLive ? 'live' : 'upcoming',
      yourTeamName,
      yourFplTeamId,
      opponentTeamName: match.opponentTeamName,
      opponentFplTeamId: match.opponentFplTeamId,
      leagueName: league.leagueName,
      roundName: match.roundName,
      yourScore: match.yourScore,
      theirScore: match.theirScore,
      gameweek: match.gameweek,
      onClick: () => onNavigate(league.leagueId),
    };

    if (match.isLive) {
      liveMatches.push(cardProps);
    } else {
      upcomingMatches.push(cardProps);
    }
  }

  // Priority 1: Return all live matches
  if (liveMatches.length > 0) {
    return liveMatches;
  }

  // Priority 2: Return single nearest upcoming match
  if (upcomingMatches.length > 0) {
    upcomingMatches.sort((a, b) => (a.gameweek ?? 0) - (b.gameweek ?? 0));
    return [upcomingMatches[0]];
  }

  // No matches to show
  return [];
}
