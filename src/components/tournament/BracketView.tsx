// src/components/tournament/BracketView.tsx
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Spinner } from '../ui/spinner';
import { BracketLayout } from './BracketLayout';
import { ParticipantsTable } from './ParticipantsTable';
import type { Tournament } from '../../types/tournament';

interface BracketViewProps {
  tournament: Tournament;
  isRefreshing?: boolean;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
}

export function BracketView({
  tournament,
  isRefreshing = false,
  isAuthenticated,
  onClaimTeam,
}: BracketViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{tournament.fplLeagueName}</CardTitle>
            <div className="flex items-center gap-2">
              {isRefreshing && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Spinner className="size-3" />
                  <span>Updating...</span>
                </div>
              )}
              <Badge variant={tournament.status === 'completed' ? 'secondary' : 'default'}>
                {tournament.status === 'completed' ? 'Completed' : 'Active'}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Starting Gameweek {tournament.startGameweek} • {tournament.totalRounds} rounds
          </p>
        </CardHeader>
        <CardContent>
          {tournament.rounds.length > 0 ? (
            <BracketLayout
              rounds={tournament.rounds}
              participants={tournament.participants}
              currentGameweek={tournament.currentGameweek}
              isAuthenticated={isAuthenticated}
              onClaimTeam={onClaimTeam}
            />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Bracket will appear when the tournament starts.
            </p>
          )}
        </CardContent>
      </Card>

      {tournament.rounds.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <ParticipantsTable
              participants={tournament.participants}
              seedingGameweek={tournament.startGameweek - 1}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
