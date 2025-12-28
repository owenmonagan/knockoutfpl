// src/components/tournament/BracketRound.tsx
import { Badge } from '../ui/badge';
import { BracketMatchCard } from './BracketMatchCard';
import type { Round, Participant } from '../../types/tournament';

interface BracketRoundProps {
  round: Round;
  participants: Participant[];
  totalRounds: number;
}

export function BracketRound({ round, participants, totalRounds }: BracketRoundProps) {
  return (
    <div className="flex flex-col" data-testid={`bracket-round-${round.roundNumber}`}>
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
        {round.matches.map((match, index) => (
          <BracketMatchCard
            key={match.id}
            match={match}
            participants={participants}
            showConnector={round.roundNumber < totalRounds}
            isTopHalf={index % 2 === 0}
          />
        ))}
      </div>
    </div>
  );
}
