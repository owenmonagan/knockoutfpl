import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { LeagueSummaryCard } from './LeagueSummaryCard';
import type { LeagueSummaryCardProps } from './LeagueSummaryCard';
import { MAX_TOURNAMENT_PARTICIPANTS } from '../../constants/tournament';

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

  // Split leagues into unlocked (can create tournaments) and locked (too large)
  const unlockedLeagues = leagues.filter(
    (league) => league.memberCount <= MAX_TOURNAMENT_PARTICIPANTS
  );
  const lockedLeagues = leagues.filter(
    (league) => league.memberCount > MAX_TOURNAMENT_PARTICIPANTS
  );

  const sortedUnlockedLeagues = sortLeagues(unlockedLeagues);
  const sortedLockedLeagues = sortLeagues(lockedLeagues);

  const hasLeagues = leagues.length > 0;
  const hasUnlockedLeagues = unlockedLeagues.length > 0;
  const hasLockedLeagues = lockedLeagues.length > 0;

  return (
    <div className="space-y-8">
      {/* Your Leagues Section (Unlocked) */}
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

        {/* Empty State - No leagues at all */}
        {!isLoading && !hasLeagues && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-foreground font-medium">No leagues found.</p>
              <p className="text-muted-foreground mt-1">
                Connect your FPL team to see your leagues here.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State - All leagues are locked */}
        {!isLoading && hasLeagues && !hasUnlockedLeagues && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-foreground font-medium">
                No eligible leagues found.
              </p>
              <p className="text-muted-foreground mt-1">
                All your leagues have more than {MAX_TOURNAMENT_PARTICIPANTS}{' '}
                members.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Unlocked League Cards Grid */}
        {!isLoading && hasUnlockedLeagues && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedUnlockedLeagues.map((league) => (
              <LeagueSummaryCard
                key={league.leagueId}
                leagueName={league.leagueName}
                memberCount={league.memberCount}
                userRank={league.userRank}
                tournament={league.tournament}
                userProgress={league.userProgress}
                isLocked={false}
                onClick={() => onLeagueClick(league.leagueId)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Your Locked Leagues Section */}
      {!isLoading && hasLockedLeagues && (
        <section aria-labelledby="locked-leagues-heading">
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="material-symbols-outlined text-xl text-muted-foreground"
              aria-hidden="true"
            >
              lock
            </span>
            <h2
              id="locked-leagues-heading"
              className="text-lg font-semibold text-muted-foreground"
            >
              Your Locked Leagues
            </h2>
            <span className="text-sm text-muted-foreground">
              (more than {MAX_TOURNAMENT_PARTICIPANTS} members)
            </span>
          </div>

          {/* Locked League Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedLockedLeagues.map((league) => (
              <LeagueSummaryCard
                key={league.leagueId}
                leagueName={league.leagueName}
                memberCount={league.memberCount}
                userRank={league.userRank}
                tournament={league.tournament}
                userProgress={league.userProgress}
                isLocked={true}
                onClick={() => onLeagueClick(league.leagueId)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
