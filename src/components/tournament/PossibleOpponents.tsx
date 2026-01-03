import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/initials';

export interface PossibleOpponentsProps {
  team1Name: string;
  team1Score: number | null;
  team2Name: string;
  team2Score: number | null;
  matchType: 'live' | 'upcoming' | 'finished';
  nextGameweek: number;
  winnerId?: number; // For finished matches
  team1Id?: number;
  team2Id?: number;
}

interface OpponentRowProps {
  teamName: string;
  score: number | null;
  showScore: boolean;
  isLeading?: boolean;
  isWinner?: boolean;
}

function OpponentRow({ teamName, score, showScore, isLeading, isWinner }: OpponentRowProps) {
  const initials = getInitials(teamName);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3',
        isWinner && 'bg-primary/5',
        !isWinner && isLeading && 'bg-muted/30'
      )}
    >
      <div
        className={cn(
          'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold',
          isWinner && 'border-2 border-primary bg-primary/10 text-primary',
          !isWinner && 'border border-muted bg-muted/50 text-muted-foreground'
        )}
      >
        {initials}
      </div>
      <span className={cn('flex-1 font-medium truncate', !isWinner && !isLeading && 'text-muted-foreground')}>
        {teamName}
      </span>
      {showScore && score !== null && (
        <span className={cn('font-bold tabular-nums', isWinner && 'text-primary')}>
          {score}
        </span>
      )}
    </div>
  );
}

export function PossibleOpponents({
  team1Name,
  team1Score,
  team2Name,
  team2Score,
  matchType,
  nextGameweek,
  winnerId,
  team1Id,
  team2Id,
}: PossibleOpponentsProps) {
  const showScores = matchType !== 'upcoming';
  const team1Leading = (team1Score ?? 0) > (team2Score ?? 0);
  const team2Leading = (team2Score ?? 0) > (team1Score ?? 0);
  const team1Won = winnerId === team1Id;
  const team2Won = winnerId === team2Id;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="h-4 w-4" />
          Possible Next Opponents
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border rounded-lg mx-4 mb-4 overflow-hidden">
          {/* Match Status Header */}
          <div className="px-3 py-2 bg-muted/30 border-b flex items-center justify-between">
            {matchType === 'live' && (
              <Badge variant="default" className="gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                Live
              </Badge>
            )}
            {matchType === 'upcoming' && <Badge variant="outline">Upcoming</Badge>}
            {matchType === 'finished' && <Badge variant="secondary">Finished</Badge>}
          </div>

          {/* Team 1 */}
          <OpponentRow
            teamName={team1Name}
            score={team1Score}
            showScore={showScores}
            isLeading={team1Leading}
            isWinner={team1Won}
          />

          {/* Divider with VS */}
          <div className="flex items-center px-3">
            <div className="flex-1 border-t" />
            {matchType === 'upcoming' && (
              <span className="px-2 text-sm font-bold text-muted-foreground">VS</span>
            )}
            {matchType !== 'upcoming' && <div className="flex-1" />}
            <div className="flex-1 border-t" />
          </div>

          {/* Team 2 */}
          <OpponentRow
            teamName={team2Name}
            score={team2Score}
            showScore={showScores}
            isLeading={team2Leading}
            isWinner={team2Won}
          />
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="pt-0">
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 w-full">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          <span>If you win, you'll face the winner in GW{nextGameweek}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
