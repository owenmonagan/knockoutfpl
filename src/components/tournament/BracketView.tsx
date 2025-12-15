// src/components/tournament/BracketView.tsx
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RoundSection } from './RoundSection';
import type { Tournament } from '../../types/tournament';

interface BracketViewProps {
  tournament: Tournament;
}

export function BracketView({ tournament }: BracketViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{tournament.fplLeagueName}</CardTitle>
          <Badge variant={tournament.status === 'completed' ? 'secondary' : 'default'}>
            {tournament.status === 'completed' ? 'Completed' : 'Active'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Starting Gameweek {tournament.startGameweek} • {tournament.totalRounds} rounds
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {tournament.rounds.map((round) => (
          <RoundSection
            key={round.roundNumber}
            round={round}
            participants={tournament.participants}
          />
        ))}
      </CardContent>
    </Card>
  );
}
