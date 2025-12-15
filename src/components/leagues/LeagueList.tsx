// src/components/leagues/LeagueList.tsx
import { LeagueCard } from './LeagueCard';
import { Skeleton } from '../ui/skeleton';
import type { FPLMiniLeague } from '../../services/fpl';

interface LeagueListProps {
  leagues: FPLMiniLeague[];
  onLeagueClick: (leagueId: number) => void;
  isLoading: boolean;
  tournaments?: Map<number, { status: 'active' | 'completed' }>;
}

export function LeagueList({
  leagues,
  onLeagueClick,
  isLoading,
  tournaments = new Map(),
}: LeagueListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground">Loading leagues...</p>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (leagues.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No leagues found. Connect your FPL team to see your leagues.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {leagues.map((league) => {
        const tournament = tournaments.get(league.id);
        return (
          <LeagueCard
            key={league.id}
            league={league}
            hasTournament={!!tournament}
            tournamentStatus={tournament?.status}
            onClick={() => onLeagueClick(league.id)}
          />
        );
      })}
    </div>
  );
}
