// src/components/tournament/HistoryMatchCard.tsx
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';
import type { OpponentMatchInfo } from '../../services/tournament';

interface HistoryMatchCardProps {
  match: OpponentMatchInfo;
}

/**
 * Displays a match from an opponent's history.
 * Smaller, muted styling compared to PathMatchCard.
 */
export function HistoryMatchCard({ match }: HistoryMatchCardProps) {
  const renderPlayerRow = (
    teamName: string,
    seed: number | null,
    isWinner: boolean,
    isLoser: boolean,
    isBye: boolean = false
  ) => {
    if (isBye) {
      return (
        <div className="flex justify-between items-center px-2 py-1 text-muted-foreground text-xs">
          <span>BYE</span>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex justify-between items-center px-2 py-1 text-xs",
          isWinner && "font-medium",
          isLoser && "opacity-50"
        )}
      >
        <span className="truncate">{teamName || 'TBD'}</span>
        {seed !== null && (
          <span className="text-muted-foreground text-[10px]">({seed})</span>
        )}
      </div>
    );
  };

  const focalWon = match.won === true;
  const focalLost = match.won === false;

  return (
    <Card className="w-36 overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
      {/* Round indicator */}
      <div className="px-2 py-0.5 bg-muted/30 text-[10px] font-medium text-muted-foreground border-b">
        R{match.roundNumber}
      </div>

      {/* Focal player (the opponent whose history we're showing) */}
      {renderPlayerRow(
        match.teamName,
        match.seed,
        focalWon,
        focalLost
      )}

      <div className="border-t" />

      {/* Their opponent in this historical match */}
      {match.isBye ? (
        renderPlayerRow('', null, false, false, true)
      ) : (
        renderPlayerRow(
          match.opponentTeamName ?? 'TBD',
          match.opponentSeed,
          focalLost, // opponent won if focal lost
          focalWon   // opponent lost if focal won
        )
      )}
    </Card>
  );
}
