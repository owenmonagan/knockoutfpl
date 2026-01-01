import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface TeamIdentityProps {
  teamName: string;
  managerName: string;
  overallRank: number;
  gameweekNumber: number;
  gameweekPoints: number;
  onSync: () => void;
  onEditTeam: () => void;
  isSyncing?: boolean;
}

function formatRank(rank: number): string {
  if (rank >= 1_000_000) {
    return `${(rank / 1_000_000).toFixed(1)}m`;
  }
  if (rank >= 1_000) {
    return `${Math.round(rank / 1_000)}k`;
  }
  return rank.toString();
}

export function TeamIdentity({
  teamName,
  managerName,
  overallRank,
  gameweekNumber,
  gameweekPoints,
  onSync,
  onEditTeam,
  isSyncing = false,
}: TeamIdentityProps) {
  return (
    <Card role="banner">
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        {/* Left: Team Info */}
        <div className="flex flex-col gap-3">
          {/* Team name with edit button */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {teamName}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEditTeam}
              aria-label="Change team"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </Button>
          </div>

          {/* Manager name */}
          <p className="text-muted-foreground">Manager: {managerName}</p>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Overall Rank Badge */}
            <Badge
              variant="outline"
              className="gap-1.5 border-primary/20 bg-primary/10 text-primary"
            >
              <span className="material-symbols-outlined text-[16px]">
                leaderboard
              </span>
              OR: {formatRank(overallRank)}
            </Badge>

            {/* Gameweek Points Badge */}
            <Badge variant="secondary" className="gap-1.5">
              <span className="material-symbols-outlined text-[16px]">
                trending_up
              </span>
              GW{gameweekNumber}: {gameweekPoints} pts
            </Badge>
          </div>
        </div>

        {/* Right: Sync Button */}
        <Button
          onClick={onSync}
          disabled={isSyncing}
          className="w-full sm:w-auto"
        >
          <span className="material-symbols-outlined mr-2 text-lg">sync</span>
          {isSyncing ? 'Syncing...' : 'Sync Latest Data'}
        </Button>
      </CardContent>
    </Card>
  );
}
