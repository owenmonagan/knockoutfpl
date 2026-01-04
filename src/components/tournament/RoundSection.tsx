// src/components/tournament/RoundSection.tsx
import { Badge } from '../ui/badge';
import { MatchCard } from './MatchCard';
import type { Round, Participant, TournamentEntry } from '../../types/tournament';

interface RoundSectionProps {
  round: Round;
  participants: Participant[] | TournamentEntry[];
}

export function RoundSection({ round, participants }: RoundSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{round.name}</h3>
          <p className="text-sm text-muted-foreground">Gameweek {round.gameweek}</p>
        </div>
        {round.isComplete && (
          <Badge variant="secondary">Complete</Badge>
        )}
      </div>

      <div className="space-y-2">
        {round.matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            participants={participants}
            gameweek={round.gameweek}
          />
        ))}
      </div>
    </section>
  );
}
