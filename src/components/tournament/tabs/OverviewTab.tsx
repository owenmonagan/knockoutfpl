import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { YourMatchupCard } from '../YourMatchupCard';
import { YourMatchesSection } from '@/components/dashboard/YourMatchesSection';
import { TournamentStats } from '../TournamentStats';
import { PossibleOpponents } from '../PossibleOpponents';
import { FriendsActivity } from '../FriendsActivity';
import type { MatchSummaryCardProps } from '@/components/dashboard/MatchSummaryCard';
import type { Tournament, Participant } from '@/types/tournament';
import type { FriendInTournament } from '@/services/friends';
import { getMatchPlayers, getEntryId } from '@/types/tournament';
import {
  findSiblingMatch,
  calculateRemainingParticipants,
  getUserStatus,
  findEliminatedRound,
} from '@/lib/tournament-utils';

interface OverviewTabProps {
  tournament: Tournament;
  userFplTeamId?: number | null;
  userParticipant?: Participant | null;
  userMatches?: MatchSummaryCardProps[];
  friends?: FriendInTournament[] | null;
  friendsLoading?: boolean;
}

export function OverviewTab({
  tournament,
  userFplTeamId,
  userParticipant,
  userMatches = [],
  friends = null,
  friendsLoading = false,
}: OverviewTabProps) {
  // Find user's latest match (iterate in reverse to get most recent)
  const currentMatch = useMemo(() => {
    if (!userFplTeamId) return null;

    for (let i = tournament.rounds.length - 1; i >= 0; i--) {
      const round = tournament.rounds[i];
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
    const isComplete = round.isComplete || tournament.status === 'completed';

    let matchType: 'live' | 'upcoming' | 'finished';
    let result: 'won' | 'lost' | undefined;

    if (isComplete && match.winnerId) {
      matchType = 'finished';
      result = match.winnerId === userFplTeamId ? 'won' : 'lost';
    } else if (tournament.status === 'completed') {
      // Tournament is done but winnerId missing - infer from scores
      matchType = 'finished';
      const yourScore = yourPlayer.score ?? 0;
      const oppScore = opponent?.score ?? 0;
      if (yourScore !== oppScore) {
        result = yourScore > oppScore ? 'won' : 'lost';
      }
    } else if (roundStarted) {
      matchType = 'live';
    } else {
      matchType = 'upcoming';
    }

    const opponentParticipant = opponent
      ? tournament.participants.find((p) => getEntryId(p) === opponent.fplTeamId)
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

  // Calculate tournament stats
  const statsProps = useMemo(() => {
    const remainingParticipants = calculateRemainingParticipants(tournament.rounds);
    const currentRound = tournament.rounds.find(
      (r) => r.roundNumber === tournament.currentRound
    );

    const eliminatedRound = userFplTeamId
      ? findEliminatedRound(tournament.rounds, userFplTeamId)
      : undefined;

    const userStatus = userParticipant
      ? getUserStatus(eliminatedRound, tournament.status === 'completed')
      : null;

    return {
      totalParticipants: tournament.participants.length,
      remainingParticipants,
      currentRound: tournament.currentRound,
      totalRounds: tournament.totalRounds,
      currentRoundName: currentRound?.name ?? `Round ${tournament.currentRound}`,
      currentGameweek: tournament.currentGameweek,
      userSeed: userParticipant?.seed,
      userStatus,
      eliminatedRound,
    };
  }, [tournament, userParticipant, userFplTeamId]);

  // Find possible next opponents (sibling match)
  const possibleOpponentsProps = useMemo(() => {
    if (!currentMatch || !userFplTeamId) return null;

    const siblingData = findSiblingMatch(
      tournament.rounds,
      currentMatch.match,
      currentMatch.round.roundNumber
    );

    if (!siblingData) return null;

    const { match: siblingMatch, round: siblingRound } = siblingData;
    const players = getMatchPlayers(siblingMatch);

    // Handle bye match - single player advances automatically
    if (siblingMatch.isBye || players.length === 1) {
      const byeRecipient = tournament.participants.find(
        (p) => getEntryId(p) === players[0]?.fplTeamId
      );
      if (!byeRecipient) return null;

      return {
        team1Name: byeRecipient.fplTeamName,
        team1Score: null,
        team1Id: byeRecipient.fplTeamId,
        team2Name: 'Bye',
        team2Score: null,
        team2Id: undefined,
        matchType: 'finished' as const,
        nextGameweek: siblingRound.gameweek + 1,
        winnerId: byeRecipient.fplTeamId,
        isBye: true,
      };
    }

    if (players.length < 2) return null;

    const team1 = tournament.participants.find((p) => getEntryId(p) === players[0]?.fplTeamId);
    const team2 = tournament.participants.find((p) => getEntryId(p) === players[1]?.fplTeamId);

    if (!team1 || !team2) return null;

    const roundStarted = siblingRound.gameweek <= tournament.currentGameweek;
    const isComplete = siblingRound.isComplete || tournament.status === 'completed';

    let matchType: 'live' | 'upcoming' | 'finished';
    if (isComplete && siblingMatch.winnerId) {
      matchType = 'finished';
    } else if (tournament.status === 'completed') {
      matchType = 'finished';
    } else if (roundStarted) {
      matchType = 'live';
    } else {
      matchType = 'upcoming';
    }

    return {
      team1Name: team1.fplTeamName,
      team1Score: players[0]?.score ?? null,
      team1Id: team1.fplTeamId,
      team2Name: team2.fplTeamName,
      team2Score: players[1]?.score ?? null,
      team2Id: team2.fplTeamId,
      matchType,
      nextGameweek: siblingRound.gameweek + 1,
      winnerId: siblingMatch.winnerId ?? undefined,
    };
  }, [currentMatch, tournament, userFplTeamId]);

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

        {/* Tournament Stats - 1/3 width */}
        <div>
          <TournamentStats {...statsProps} />
        </div>
      </div>

      {/* Second row: Friends + Possible Opponents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Friends Activity - 2/3 width */}
        <div className="lg:col-span-2">
          <FriendsActivity friends={friends} isLoading={friendsLoading} />
        </div>

        {/* Possible Opponents - 1/3 width */}
        <div className="order-1 lg:order-2">
          {possibleOpponentsProps ? (
            <PossibleOpponents {...possibleOpponentsProps} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Possible Next Opponents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {!isParticipant
                    ? 'Connect your FPL team to see potential opponents.'
                    : "You're in the final - no next opponent!"}
                </p>
              </CardContent>
            </Card>
          )}
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
