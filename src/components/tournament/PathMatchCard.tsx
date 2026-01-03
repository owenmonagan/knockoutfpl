// src/components/tournament/PathMatchCard.tsx
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';
import { getFplTeamUrl } from '../../lib/fpl-urls';
import type { UserMatchInfo } from '../../services/tournament';

interface PathMatchCardProps {
  match: UserMatchInfo;
  isFocalTeam: boolean;
  currentGameweek: number;
}

/**
 * Displays a match on the user's path to the final.
 * Highlighted styling for the focal team's matches.
 */
export function PathMatchCard({
  match,
  isFocalTeam,
  currentGameweek,
}: PathMatchCardProps) {
  const roundStarted = match.gameweek <= currentGameweek;
  const showScores = roundStarted && match.yourScore !== null;

  const renderPlayerRow = (
    teamName: string,
    seed: number | null,
    score: number | null,
    fplTeamId: number | null,
    isWinner: boolean,
    isLoser: boolean,
    isBye: boolean = false
  ) => {
    if (isBye) {
      return (
        <div className="flex justify-between items-center px-3 py-2 text-muted-foreground text-sm">
          <span>BYE</span>
        </div>
      );
    }

    if (!teamName) {
      return (
        <div className="flex justify-between items-center px-3 py-2 text-muted-foreground text-sm">
          <span>TBD</span>
        </div>
      );
    }

    const content = (
      <div
        className={cn(
          "flex justify-between items-center px-3 py-2 text-sm",
          isWinner && "font-semibold bg-green-50 dark:bg-green-950",
          isLoser && "opacity-50"
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="truncate">{teamName}</span>
          {seed !== null && !showScores && (
            <span className="text-muted-foreground text-xs">({seed})</span>
          )}
        </div>
        {showScores && score !== null && (
          <span className={cn(
            "tabular-nums font-medium",
            isWinner && "text-green-600 dark:text-green-400"
          )}>
            {score}
          </span>
        )}
      </div>
    );

    if (fplTeamId) {
      return (
        <a
          href={getFplTeamUrl(fplTeamId, match.gameweek, roundStarted)}
          target="_blank"
          rel="noopener noreferrer"
          className="block cursor-pointer hover:bg-muted/50 transition-colors"
        >
          {content}
        </a>
      );
    }

    return content;
  };

  const yourWon = match.result === 'won';
  const yourLost = match.result === 'lost';
  const opponentWon = match.result === 'lost';
  const opponentLost = match.result === 'won';

  return (
    <Card className={cn(
      "w-48 overflow-hidden",
      isFocalTeam && "ring-2 ring-primary"
    )}>
      {/* Round header */}
      <div className="px-3 py-1.5 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
        {match.roundName}
      </div>

      {/* Your team */}
      {renderPlayerRow(
        match.yourTeamName,
        match.yourSeed,
        match.yourScore,
        match.yourFplTeamId,
        yourWon,
        yourLost
      )}

      <div className="border-t" />

      {/* Opponent */}
      {match.isBye ? (
        renderPlayerRow('', null, null, null, false, false, true)
      ) : (
        renderPlayerRow(
          match.opponentTeamName ?? 'TBD',
          match.opponentSeed,
          match.opponentScore,
          match.opponentFplTeamId,
          opponentWon,
          opponentLost
        )
      )}
    </Card>
  );
}
