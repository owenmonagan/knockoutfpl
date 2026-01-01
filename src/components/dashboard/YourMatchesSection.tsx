import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { MatchSummaryCard } from './MatchSummaryCard';
import type { MatchSummaryCardProps } from './MatchSummaryCard';
import { cn } from '@/lib/utils';

export interface YourMatchesSectionProps {
  matches: MatchSummaryCardProps[];
  currentGameweek?: number;
  isLive?: boolean;
  onMatchClick?: (index: number) => void;
}

export function YourMatchesSection(props: YourMatchesSectionProps) {
  const { matches, currentGameweek, isLive, onMatchClick } = props;

  const hasMatches = matches.length > 0;

  return (
    <section aria-labelledby="your-matches-heading">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="material-symbols-outlined text-xl text-primary"
          aria-hidden="true"
        >
          sports_score
        </span>
        <h2
          id="your-matches-heading"
          className="text-lg font-semibold text-foreground"
        >
          Your Matches
        </h2>
        {currentGameweek && isLive && (
          <Badge variant="default" className="ml-2">
            GW {currentGameweek} Live
          </Badge>
        )}
      </div>

      {/* Match Cards or Empty State */}
      {hasMatches ? (
        <div
          className={cn(
            'flex overflow-x-auto gap-5 pb-6',
            '-mx-4 px-4 md:mx-0 md:px-0',
            'md:grid md:grid-cols-2 lg:grid-cols-3',
            'snap-x snap-mandatory',
            'hide-scrollbar'
          )}
        >
          {matches.map((match, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[280px] md:w-auto snap-start"
            >
              <MatchSummaryCard
                {...match}
                onClick={
                  onMatchClick || match.onClick
                    ? () => {
                        if (onMatchClick) {
                          onMatchClick(index);
                        }
                        if (match.onClick) {
                          match.onClick();
                        }
                      }
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-foreground font-medium">
              Your knockout journey starts here.
            </p>
            <p className="text-muted-foreground mt-1">
              Pick a league and create your first tournament.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
