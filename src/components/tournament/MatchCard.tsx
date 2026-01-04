// src/components/tournament/MatchCard.tsx
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import type { Match, Participant, TournamentEntry } from '../../types/tournament';
import { getEntryId, isTournamentEntry, getTeamName } from '../../types/tournament';
import { getStakesCallout } from '../../lib/stakes';

interface MatchCardProps {
  match: Match;
  participants: Participant[] | TournamentEntry[];
  gameweek: number;
  isUserMatch?: boolean;
  userTeamId?: number;
  isGameweekActive?: boolean;
}

function StalenessIndicator({
  updatedAt,
  isGameweekActive,
}: {
  updatedAt?: Date;
  isGameweekActive?: boolean;
}) {
  if (!updatedAt) return null;

  const minutesAgo = Math.floor(
    (Date.now() - updatedAt.getTime()) / (1000 * 60)
  );
  const isStale = isGameweekActive && minutesAgo > 30;

  return (
    <span
      className={cn(
        'text-xs text-muted-foreground',
        isStale && 'text-amber-500'
      )}
      title={`Last updated ${formatDistanceToNow(updatedAt)} ago`}
    >
      {isStale && '\u26a0\ufe0f '}
      Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}
    </span>
  );
}

export function MatchCard({ match, participants, gameweek, isUserMatch, userTeamId, isGameweekActive }: MatchCardProps) {
  const getParticipantById = (fplTeamId: number | null): Participant | TournamentEntry | null => {
    if (!fplTeamId) return null;
    return participants.find((p) => getEntryId(p) === fplTeamId) || null;
  };

  const player1 = match.player1 ? getParticipantById(match.player1.fplTeamId) : null;
  const player2 = match.player2 ? getParticipantById(match.player2.fplTeamId) : null;

  const stakesCallout = isUserMatch && match.player1 && match.player2 && match.player1.score !== null && match.player2.score !== null
    ? getStakesCallout(
        userTeamId === match.player1.fplTeamId ? match.player1.score : match.player2.score,
        userTeamId === match.player1.fplTeamId ? match.player2.score : match.player1.score,
        true
      )
    : '';

  const renderPlayerRow = (
    player: typeof match.player1,
    participant: Participant | TournamentEntry | null,
    isWinner: boolean,
    isLoser: boolean
  ) => {
    if (!player || !participant) {
      return (
        <div className="flex justify-between items-center py-2 text-muted-foreground">
          <span>BYE</span>
        </div>
      );
    }

    const teamName = isTournamentEntry(participant)
      ? getTeamName(participant)
      : participant.fplTeamName;

    return (
      <div className={`flex justify-between items-center py-2 ${isWinner ? 'font-semibold' : ''} ${isLoser ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-2">
          <span>{teamName}</span>
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

  return (
    <Card className={isUserMatch ? 'border-2 border-amber-500' : ''}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline">GW {gameweek}</Badge>
        </div>
        <div className="space-y-1">
          {renderPlayerRow(
            match.player1,
            player1,
            match.winnerId === match.player1?.fplTeamId,
            match.winnerId !== null && match.winnerId !== match.player1?.fplTeamId
          )}
          <div className="border-t" />
          {renderPlayerRow(
            match.player2,
            player2,
            match.winnerId === match.player2?.fplTeamId,
            match.winnerId !== null && match.winnerId !== match.player2?.fplTeamId
          )}
        </div>
        {stakesCallout && (
          <p className="text-sm font-medium text-amber-600 mt-2">{stakesCallout}</p>
        )}
        {match.updatedAt && (
          <StalenessIndicator
            updatedAt={new Date(match.updatedAt)}
            isGameweekActive={isGameweekActive}
          />
        )}
      </CardContent>
    </Card>
  );
}
