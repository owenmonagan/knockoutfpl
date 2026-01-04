// src/components/tournament/NWayMatchCard.tsx
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import type { Match, Participant, TournamentEntry, MatchPlayer } from '../../types/tournament';
import { getMatchPlayers, getEntryId, isTournamentEntry, getTeamName } from '../../types/tournament';

interface NWayMatchCardProps {
  match: Match;
  participants: Participant[] | TournamentEntry[];
  gameweek: number;
  isUserMatch?: boolean;
  userTeamId?: number;
}

function getRankLabel(rank: number): string {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
}

export function NWayMatchCard({
  match,
  participants,
  gameweek,
  isUserMatch,
}: NWayMatchCardProps) {
  const players = getMatchPlayers(match);

  const getParticipantById = (fplTeamId: number): Participant | TournamentEntry | undefined => {
    return participants.find((p) => getEntryId(p) === fplTeamId);
  };

  // Sort players: by score (desc) if scores exist, otherwise by seed (asc)
  const hasScores = players.some((p) => p.score !== null);
  const sortedPlayers = [...players].sort((a, b) => {
    if (hasScores) {
      return (b.score ?? 0) - (a.score ?? 0);
    }
    return a.seed - b.seed;
  });

  const renderPlayerRow = (player: MatchPlayer, index: number) => {
    const participant = getParticipantById(player.fplTeamId);
    const isWinner = match.winnerId === player.fplTeamId;
    const isLoser = match.winnerId !== null && !isWinner;
    const rank = hasScores ? index + 1 : null;

    if (!participant) {
      return (
        <div
          key={`bye-${index}`}
          className="flex justify-between items-center py-2 text-muted-foreground"
        >
          <span>BYE</span>
        </div>
      );
    }

    const teamName = isTournamentEntry(participant)
      ? getTeamName(participant)
      : participant.fplTeamName;

    return (
      <div
        key={player.fplTeamId}
        data-testid={`player-row-${player.fplTeamId}`}
        className={`flex justify-between items-center py-2 ${
          isWinner ? 'font-semibold' : ''
        } ${isLoser ? 'opacity-50' : ''}`}
      >
        <div className="flex items-center gap-2">
          {rank !== null && (
            <span className="text-xs text-muted-foreground w-8">
              {getRankLabel(rank)}
            </span>
          )}
          <span data-testid="team-name">{teamName}</span>
          <span className="text-muted-foreground text-sm">({participant.seed})</span>
        </div>
        {player.score !== null && (
          <div className="flex items-center gap-2">
            <span className="text-lg">{player.score}</span>
            {isWinner && <span className="text-green-500">✓</span>}
          </div>
        )}
      </div>
    );
  };

  // Show BYE indicator for matches with only 1 real player
  const showByeIndicator = match.isBye || players.length === 1;

  return (
    <Card
      data-testid="nway-match-card"
      className={isUserMatch ? 'border-2 border-amber-500' : ''}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline">GW {gameweek}</Badge>
        </div>
        <div className="space-y-1 divide-y">
          {sortedPlayers.map((player, index) => renderPlayerRow(player, index))}
          {showByeIndicator && players.length === 1 && (
            <div className="flex justify-between items-center py-2 text-muted-foreground">
              <span>BYE</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
