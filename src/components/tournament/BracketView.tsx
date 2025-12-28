// src/components/tournament/BracketView.tsx
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BracketLayout } from './BracketLayout';
import { ParticipantsTable } from './ParticipantsTable';
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
      <CardContent>
        {tournament.rounds.length > 0 ? (
          <>
            <BracketLayout
              rounds={tournament.rounds}
              participants={tournament.participants}
            />
            <ParticipantsTable participants={tournament.participants} />
          </>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Bracket will appear when the tournament starts.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
