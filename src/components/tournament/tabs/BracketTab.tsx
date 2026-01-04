import { useSearchParams } from 'react-router-dom';
import { BracketLayout } from '../BracketLayout';
import { Button } from '@/components/ui/button';
import type { Tournament, Round } from '@/types/tournament';

export const MAX_BRACKET_ROUNDS = 5;

export function getVisibleRounds(rounds: Round[]): {
  visibleRounds: Round[];
  hiddenCount: number;
} {
  if (rounds.length <= MAX_BRACKET_ROUNDS) {
    return { visibleRounds: rounds, hiddenCount: 0 };
  }

  const startIndex = rounds.length - MAX_BRACKET_ROUNDS;
  return {
    visibleRounds: rounds.slice(startIndex),
    hiddenCount: startIndex,
  };
}

interface EarlierRoundsPromptProps {
  hiddenCount: number;
  onViewMatches: () => void;
}

export function EarlierRoundsPrompt({
  hiddenCount,
  onViewMatches,
}: EarlierRoundsPromptProps) {
  const roundWord = hiddenCount === 1 ? 'round' : 'rounds';

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/50 px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Showing final 5 rounds. {hiddenCount} earlier {roundWord} available in
        the Matches tab.
      </p>
      <Button variant="outline" size="sm" onClick={onViewMatches}>
        View Matches →
      </Button>
    </div>
  );
}

interface BracketTabProps {
  tournament: Tournament;
  userFplTeamId?: number | null;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
}

export function BracketTab({
  tournament,
  userFplTeamId,
  isAuthenticated,
  onClaimTeam,
}: BracketTabProps) {
  const [, setSearchParams] = useSearchParams();

  if (tournament.rounds.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Bracket will appear when the tournament starts.
      </p>
    );
  }

  const { visibleRounds, hiddenCount } = getVisibleRounds(tournament.rounds);

  const handleViewMatches = () => {
    setSearchParams({ tab: 'matches' }, { replace: true });
  };

  return (
    <div className="space-y-4">
      {hiddenCount > 0 && (
        <EarlierRoundsPrompt
          hiddenCount={hiddenCount}
          onViewMatches={handleViewMatches}
        />
      )}

      <BracketLayout
        rounds={visibleRounds}
        participants={tournament.participants}
        currentGameweek={tournament.currentGameweek}
        isAuthenticated={isAuthenticated}
        onClaimTeam={onClaimTeam}
      />
    </div>
  );
}
