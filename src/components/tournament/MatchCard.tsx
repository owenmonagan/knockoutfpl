// src/components/tournament/MatchCard.tsx
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import type { Match, Participant } from '../../types/tournament';

interface MatchCardProps {
  match: Match;
  participants: Participant[];
  gameweek: number;
}

export function MatchCard({ match, participants, gameweek }: MatchCardProps) {
  const getParticipantById = (fplTeamId: number | null): Participant | null => {
    if (!fplTeamId) return null;
    return participants.find((p) => p.fplTeamId === fplTeamId) || null;
  };

  const player1 = match.player1 ? getParticipantById(match.player1.fplTeamId) : null;
  const player2 = match.player2 ? getParticipantById(match.player2.fplTeamId) : null;

  const renderPlayerRow = (
    player: typeof match.player1,
    participant: Participant | null,
    isWinner: boolean
  ) => {
    if (!player || !participant) {
      return (
        <div className="flex justify-between items-center py-2 text-muted-foreground">
          <span>BYE</span>
        </div>
      );
    }

    return (
      <div className={`flex justify-between items-center py-2 ${isWinner ? 'font-semibold' : ''}`}>
        <div className="flex items-center gap-2">
          <span>{participant.fplTeamName}</span>
          <span className="text-muted-foreground text-sm">({participant.seed})</span>
        </div>
        {player.score !== null && <span className="text-lg">{player.score}</span>}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline">GW {gameweek}</Badge>
        </div>
        <div className="space-y-1">
          {renderPlayerRow(match.player1, player1, match.winnerId === match.player1?.fplTeamId)}
          <div className="border-t" />
          {renderPlayerRow(match.player2, player2, match.winnerId === match.player2?.fplTeamId)}
        </div>
      </CardContent>
    </Card>
  );
}
