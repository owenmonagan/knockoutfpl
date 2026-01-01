import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { LeagueSummaryCard } from './LeagueSummaryCard';
import type { LeagueSummaryCardProps } from './LeagueSummaryCard';

// Extend LeagueSummaryCardProps without the onClick handler
export interface LeagueData extends Omit<LeagueSummaryCardProps, 'onClick'> {
  leagueId: number;
}

export interface YourLeaguesSectionProps {
  leagues: LeagueData[];
  onLeagueClick: (leagueId: number) => void;
  isLoading?: boolean;
}

type SortPriority = 0 | 1 | 2 | 3;

function getLeagueSortPriority(league: LeagueData): SortPriority {
  const { tournament, userProgress } = league;

  // No tournament = lowest priority (3)
  if (!tournament) {
    return 3;
  }

  // Completed tournaments = priority 2
  if (tournament.status === 'completed') {
    return 2;
  }

  // Active tournament, user eliminated = priority 1
  if (userProgress?.status === 'eliminated') {
    return 1;
  }

  // Active tournament, user still alive = priority 0 (highest)
  return 0;
}

function sortLeagues(leagues: LeagueData[]): LeagueData[] {
  return [...leagues].sort((a, b) => {
    return getLeagueSortPriority(a) - getLeagueSortPriority(b);
  });
}

function LeagueCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Line 1: League name */}
        <Skeleton className="h-5 w-3/4" />
        {/* Line 2: Member count and gameweek range */}
        <Skeleton className="h-4 w-1/2" />
        {/* Line 3: Progress info */}
        <Skeleton className="h-4 w-2/3" />
        {/* Button */}
        <Skeleton className="h-9 w-full mt-3" />
      </CardContent>
    </Card>
  );
}

export function YourLeaguesSection(props: YourLeaguesSectionProps) {
  const { leagues, onLeagueClick, isLoading = false } = props;

  const sortedLeagues = sortLeagues(leagues);
  const hasLeagues = leagues.length > 0;

  return (
    <section aria-labelledby="your-leagues-heading">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="material-symbols-outlined text-xl text-primary"
          aria-hidden="true"
        >
          trophy
        </span>
        <h2
          id="your-leagues-heading"
          className="text-lg font-semibold text-foreground"
        >
          Your Leagues
        </h2>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LeagueCardSkeleton />
          <LeagueCardSkeleton />
          <LeagueCardSkeleton />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !hasLeagues && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-foreground font-medium">
              No leagues found.
            </p>
            <p className="text-muted-foreground mt-1">
              Connect your FPL team to see your leagues here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* League Cards Grid */}
      {!isLoading && hasLeagues && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedLeagues.map((league) => (
            <LeagueSummaryCard
              key={league.leagueId}
              leagueName={league.leagueName}
              memberCount={league.memberCount}
              tournament={league.tournament}
              userProgress={league.userProgress}
              onClick={() => onLeagueClick(league.leagueId)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
