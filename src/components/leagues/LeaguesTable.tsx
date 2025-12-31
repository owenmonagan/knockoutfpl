// src/components/leagues/LeaguesTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

export interface LeagueWithTournament {
  // From FPL API (existing)
  id: number; // fplLeagueId
  name: string;
  entryRank: number;
  memberCount: number;

  // Tournament status (from getTournamentSummaryForLeague)
  tournament: {
    id: string;
    status: 'active' | 'completed';
    currentRound: number;
    totalRounds: number;
  } | null;

  // User's progress (if they're a participant)
  userProgress: {
    status: 'active' | 'eliminated' | 'winner';
    eliminationRound: number | null;
  } | null;
}

interface LeaguesTableProps {
  leagues: LeagueWithTournament[];
  onLeagueAction: (league: LeagueWithTournament) => void;
  isLoading?: boolean;
}

function getStatusText(
  userProgress: LeagueWithTournament['userProgress'],
  tournament: LeagueWithTournament['tournament']
): string {
  if (!userProgress) {
    return '—';
  }

  switch (userProgress.status) {
    case 'winner':
      return 'Winner';
    case 'eliminated':
      return `Eliminated R${userProgress.eliminationRound}`;
    case 'active':
      return `Round ${tournament?.currentRound} of ${tournament?.totalRounds}`;
    default:
      return '—';
  }
}

function getButtonText(tournament: LeagueWithTournament['tournament']): string {
  return tournament ? 'View Tournament' : 'Create Tournament';
}

export function LeaguesTable({
  leagues,
  onLeagueAction,
  isLoading = false,
}: LeaguesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground">Loading leagues...</p>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
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
    <>
      {/* Desktop view - Table layout */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>League</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Your Rank</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leagues.map((league) => (
              <TableRow key={league.id}>
                <TableCell className="font-medium">{league.name}</TableCell>
                <TableCell>{league.memberCount}</TableCell>
                <TableCell>#{league.entryRank}</TableCell>
                <TableCell>{getStatusText(league.userProgress, league.tournament)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLeagueAction(league)}
                  >
                    {getButtonText(league.tournament)}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view - Stacked rows */}
      <div className="md:hidden space-y-3">
        {leagues.map((league) => (
          <div
            key={league.id}
            className="border rounded-lg p-4 space-y-2"
          >
            <div className="font-medium">{league.name}</div>
            <div className="text-sm text-muted-foreground">
              {league.memberCount} members · Rank #{league.entryRank}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm">
                {getStatusText(league.userProgress, league.tournament)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLeagueAction(league)}
              >
                {getButtonText(league.tournament)}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
