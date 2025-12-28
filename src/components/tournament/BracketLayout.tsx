// src/components/tournament/BracketLayout.tsx
import type { Round, Participant } from '../../types/tournament';
import { BracketRound } from './BracketRound';

interface BracketLayoutProps {
  rounds: Round[];
  participants: Participant[];
}

export function BracketLayout({ rounds, participants }: BracketLayoutProps) {
  return (
    <div
      data-testid="bracket-layout"
      className="flex flex-col gap-6 md:flex-row md:gap-4 md:overflow-x-auto"
    >
      {rounds.map((round) => (
        <BracketRound
          key={round.roundNumber}
          round={round}
          participants={participants}
          totalRounds={rounds.length}
        />
      ))}
    </div>
  );
}
