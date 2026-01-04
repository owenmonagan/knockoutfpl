// src/components/tournament/CompactMatchCard.tsx
import { Card } from '../ui/card';
import type { Match, Participant, TournamentEntry } from '../../types/tournament';
import { isTournamentEntry, getTeamName, getManagerName } from '../../types/tournament';
import { cn } from '../../lib/utils';
import { getFplTeamUrl } from '../../lib/fpl-urls';
import { ClaimTeamButton } from './ClaimTeamButton';

/**
 * Normalized participant data for display
 */
interface NormalizedParticipant {
  fplTeamId: number;
  fplTeamName: string;
  managerName: string;
  seed: number;
}

/**
 * Normalize a participant to a common format for lookup
 */
function normalizeParticipant(item: Participant | TournamentEntry): NormalizedParticipant {
  if (isTournamentEntry(item)) {
    return {
      fplTeamId: item.entryId,
      fplTeamName: getTeamName(item),
      managerName: getManagerName(item),
      seed: item.seed,
    };
  }
  return {
    fplTeamId: item.fplTeamId,
    fplTeamName: item.fplTeamName,
    managerName: item.managerName,
    seed: item.seed,
  };
}

interface CompactMatchCardProps {
  match: Match;
  /** Accepts both legacy Participant[] and new TournamentEntry[] formats */
  participants: Participant[] | TournamentEntry[];
  roundStarted: boolean;
  gameweek: number;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
  className?: string;
}

export function CompactMatchCard({
  match,
  participants,
  roundStarted,
  gameweek,
  isAuthenticated = false,
  onClaimTeam,
  className,
}: CompactMatchCardProps) {
  const getParticipant = (fplTeamId: number | null): NormalizedParticipant | null => {
    if (!fplTeamId) return null;
    const found = participants.find((p) => {
      const id = isTournamentEntry(p) ? p.entryId : p.fplTeamId;
      return id === fplTeamId;
    });
    return found ? normalizeParticipant(found) : null;
  };

  const player1 = match.player1 ? getParticipant(match.player1.fplTeamId) : null;
  const player2 = match.player2 ? getParticipant(match.player2.fplTeamId) : null;

  const renderPlayerSlot = (
    player: typeof match.player1,
    participant: NormalizedParticipant | null,
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

    const hasScore = player?.score !== null && player?.score !== undefined;
    // Only show score if the round has started AND we have a score
    const showScore = roundStarted && hasScore;

    const rowContent = (
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
          {/* Show seed when round hasn't started or no score available */}
          {participant && !showScore && (
            <span className="text-muted-foreground text-xs">({participant.seed})</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Claim button - only show for non-authenticated users with real players */}
          {!isAuthenticated && onClaimTeam && player?.fplTeamId && (
            <ClaimTeamButton fplTeamId={player.fplTeamId} onClaim={onClaimTeam} />
          )}
          {/* Show score only when round has started and score is available */}
          {showScore && (
            <span className={cn("tabular-nums font-medium", isWinner && "text-green-600 dark:text-green-400")}>
              {player.score}
            </span>
          )}
        </div>
      </div>
    );

    // Wrap in anchor tag for real players (not TBD/BYE)
    if (player && player.fplTeamId) {
      return (
        <a
          href={getFplTeamUrl(player.fplTeamId, gameweek, roundStarted)}
          target="_blank"
          rel="noopener noreferrer"
          className="block cursor-pointer hover:bg-muted/50 transition-colors"
        >
          {rowContent}
        </a>
      );
    }

    return rowContent;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      {renderPlayerSlot(match.player1, player1)}
      <div className="border-t" />
      {match.isBye && !match.player2
        ? renderPlayerSlot(null, null, true)
        : renderPlayerSlot(match.player2, player2)
      }
    </Card>
  );
}
