// src/components/tournament/BracketMatchCard.tsx
import { Card } from '../ui/card';
import type { Match, Participant } from '../../types/tournament';
import { cn } from '../../lib/utils'; // Used for player slot styling

interface BracketMatchCardProps {
  match: Match;
  participants: Participant[];
}

export function BracketMatchCard({
  match,
  participants,
}: BracketMatchCardProps) {
  const getParticipant = (fplTeamId: number | null): Participant | null => {
    if (!fplTeamId) return null;
    return participants.find((p) => p.fplTeamId === fplTeamId) || null;
  };

  const player1 = match.player1 ? getParticipant(match.player1.fplTeamId) : null;
  const player2 = match.player2 ? getParticipant(match.player2.fplTeamId) : null;

  const renderPlayerSlot = (
    player: typeof match.player1,
    participant: Participant | null,
    isBye: boolean = false
  ) => {
    const isWinner = match.winnerId !== null && player?.fplTeamId === match.winnerId;
    const isLoser = match.winnerId !== null && player?.fplTeamId !== match.winnerId;

    if (!player && !isBye) {
      return (
        <div className="flex justify-between items-center px-2 py-1.5 text-muted-foreground text-sm">
          <span>TBD</span>
        </div>
      );
    }

    if (isBye && !player) {
      return (
        <div className="flex justify-between items-center px-2 py-1.5 text-muted-foreground text-sm">
          <span>BYE</span>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex justify-between items-center px-2 py-1.5 text-sm",
          isWinner && "font-semibold bg-green-50 dark:bg-green-950",
          isLoser && "opacity-50"
        )}
        data-winner={isWinner}
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="truncate">{participant?.fplTeamName || 'TBD'}</span>
          {participant && (
            <span className="text-muted-foreground text-xs">({participant.seed})</span>
          )}
        </div>
        {player?.score !== null && player?.score !== undefined && (
          <span className={cn("tabular-nums", isWinner && "text-green-600 dark:text-green-400")}>
            {player.score}
          </span>
        )}
      </div>
    );
  };

  return (
    <Card className="w-44 overflow-hidden">
      {renderPlayerSlot(match.player1, player1)}
      <div className="border-t" />
      {match.isBye && !match.player2
        ? renderPlayerSlot(null, null, true)
        : renderPlayerSlot(match.player2, player2)
      }
    </Card>
  );
}
