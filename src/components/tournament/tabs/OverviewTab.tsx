import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { YourMatchupCard } from '../YourMatchupCard';
import { YourMatchesSection } from '@/components/dashboard/YourMatchesSection';
import type { MatchSummaryCardProps } from '@/components/dashboard/MatchSummaryCard';
import type { Tournament, Participant } from '@/types/tournament';
import { getMatchPlayers } from '@/types/tournament';

interface OverviewTabProps {
  tournament: Tournament;
  userFplTeamId?: number | null;
  userParticipant?: Participant | null;
  userMatches?: MatchSummaryCardProps[];
}

export function OverviewTab({
  tournament,
  userFplTeamId,
  userParticipant,
  userMatches = [],
}: OverviewTabProps) {
  // Find user's current/next match
  const currentMatch = useMemo(() => {
    if (!userFplTeamId) return null;

    // Find match in current round or next upcoming round
    for (const round of tournament.rounds) {
      for (const match of round.matches) {
        const players = getMatchPlayers(match);
        if (players.some((p) => p.fplTeamId === userFplTeamId)) {
          return { match, round };
        }
      }
    }
    return null;
  }, [tournament.rounds, userFplTeamId]);

  // Prepare matchup card props
  const matchupProps = useMemo(() => {
    if (!currentMatch || !userParticipant) return null;

    const { match, round } = currentMatch;
    const players = getMatchPlayers(match);
    const yourPlayer = players.find((p) => p.fplTeamId === userFplTeamId);
    const opponent = players.find((p) => p.fplTeamId !== userFplTeamId);

    if (!yourPlayer) return null;

    const roundStarted = round.gameweek <= tournament.currentGameweek;
    const isComplete = round.isComplete;

    let matchType: 'live' | 'upcoming' | 'finished';
    let result: 'won' | 'lost' | undefined;

    if (isComplete && match.winnerId) {
      matchType = 'finished';
      result = match.winnerId === userFplTeamId ? 'won' : 'lost';
    } else if (roundStarted) {
      matchType = 'live';
    } else {
      matchType = 'upcoming';
    }

    const opponentParticipant = opponent
      ? tournament.participants.find((p) => p.fplTeamId === opponent.fplTeamId)
      : null;

    return {
      roundName: round.name,
      gameweek: round.gameweek,
      yourTeamName: userParticipant.fplTeamName,
      yourManagerName: userParticipant.managerName,
      yourSeed: userParticipant.seed,
      yourScore: yourPlayer.score,
      opponentTeamName: opponentParticipant?.fplTeamName,
      opponentManagerName: opponentParticipant?.managerName,
      opponentSeed: opponentParticipant?.seed,
      opponentScore: opponent?.score ?? null,
      matchType,
      result,
    };
  }, [currentMatch, userParticipant, userFplTeamId, tournament]);

  const isParticipant = !!userParticipant;

  return (
    <div className="space-y-6">
      {/* Grid layout: 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Your Matchup Card - 2/3 width */}
        <div className="lg:col-span-2">
          {isParticipant && matchupProps ? (
            <YourMatchupCard {...matchupProps} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Match</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {isParticipant
                    ? 'No current match found.'
                    : 'Connect your FPL team to see your match.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tournament Stats placeholder - 1/3 width */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tournament Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming in Phase 3...</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Second row: Friends + Possible Opponents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Friends Activity placeholder - 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Friends Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming in Phase 4...</p>
            </CardContent>
          </Card>
        </div>

        {/* Possible Opponents placeholder - 1/3 width */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Possible Next Opponents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming in Phase 3...</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Match History - full width */}
      {userMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Match History</CardTitle>
          </CardHeader>
          <CardContent>
            <YourMatchesSection
              matches={userMatches}
              currentGameweek={tournament.currentGameweek}
              isLive={userMatches.some((m) => m.type === 'live')}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
