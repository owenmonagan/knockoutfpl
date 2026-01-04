// src/components/tournament/BracketRound.tsx
import { Badge } from '../ui/badge';
import { CompactMatchCard } from './CompactMatchCard';
import type { Round, Participant, TournamentEntry } from '../../types/tournament';

interface BracketRoundProps {
  round: Round;
  participants: Participant[] | TournamentEntry[];
  currentGameweek: number;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
}

export function BracketRound({
  round,
  participants,
  currentGameweek,
  isAuthenticated,
  onClaimTeam,
}: BracketRoundProps) {
  // Round has started if its gameweek is at or before the current FPL gameweek
  const roundStarted = round.gameweek <= currentGameweek;

  return (
    <div className="flex flex-col overflow-visible" data-testid={`bracket-round-${round.roundNumber}`}>
      <div className="flex items-center justify-between mb-3 px-2">
        <div>
          <h3 className="text-sm font-semibold">{round.name}</h3>
          <span className="text-xs text-muted-foreground">GW {round.gameweek}</span>
        </div>
        {round.isComplete && (
          <Badge variant="secondary" className="text-xs">Complete</Badge>
        )}
      </div>

      <div className="flex flex-col justify-around flex-1 gap-2">
        {round.matches.map((match) => (
          <CompactMatchCard
            key={match.id}
            match={match}
            participants={participants}
            roundStarted={roundStarted}
            gameweek={round.gameweek}
            isAuthenticated={isAuthenticated}
            onClaimTeam={onClaimTeam}
            className="w-44"
          />
        ))}
      </div>
    </div>
  );
}
