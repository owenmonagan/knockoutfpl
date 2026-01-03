import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/initials';

export interface YourMatchupCardProps {
  roundName: string;
  gameweek: number;
  yourTeamName: string;
  yourManagerName?: string;
  yourSeed: number;
  yourScore: number | null;
  opponentTeamName?: string;
  opponentManagerName?: string;
  opponentSeed?: number;
  opponentScore: number | null;
  matchType: 'live' | 'upcoming' | 'finished';
  result?: 'won' | 'lost';
  onViewDetails?: () => void;
}

interface TeamRowProps {
  label: string;
  teamName: string;
  managerName?: string;
  seed: number;
  score: number | null;
  isYou?: boolean;
  isWinner?: boolean;
  isLoser?: boolean;
  showScore: boolean;
}

function TeamRow({
  label,
  teamName,
  managerName,
  seed,
  score,
  isYou,
  isWinner,
  isLoser,
  showScore,
}: TeamRowProps) {
  const initials = getInitials(teamName);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        isYou && 'bg-primary/5 border border-primary/20',
        isLoser && 'opacity-60'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'h-12 w-12 rounded-full flex items-center justify-center font-bold text-sm',
          isWinner && 'border-2 border-primary bg-primary/10 text-primary',
          isLoser && 'border border-muted bg-muted/30 text-muted-foreground',
          !isWinner && !isLoser && isYou && 'border-2 border-primary bg-primary/10 text-primary',
          !isWinner && !isLoser && !isYou && 'border border-muted bg-muted/50 text-muted-foreground'
        )}
      >
        {initials}
      </div>

      {/* Team Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium mb-0.5">
          {label} (Seed #{seed.toLocaleString()})
        </p>
        <p className={cn('font-bold truncate', isLoser && 'text-muted-foreground')}>
          {teamName}
        </p>
        {managerName && (
          <p className="text-sm text-muted-foreground truncate">{managerName}</p>
        )}
      </div>

      {/* Score */}
      {showScore && score !== null && (
        <div className={cn('text-3xl font-black tabular-nums', isLoser && 'text-muted-foreground')}>
          {score}
        </div>
      )}
    </div>
  );
}

export function YourMatchupCard({
  roundName,
  gameweek,
  yourTeamName,
  yourManagerName,
  yourSeed,
  yourScore,
  opponentTeamName,
  opponentManagerName,
  opponentSeed,
  opponentScore,
  matchType,
  result,
  onViewDetails,
}: YourMatchupCardProps) {
  const showScores = matchType !== 'upcoming';
  const youWon = result === 'won';
  const youLost = result === 'lost';
  const isTBD = !opponentTeamName;

  // Card styling based on state
  const cardClasses = cn('overflow-hidden transition-all duration-200', {
    'border-2 border-primary shadow-[0_0_20px_rgba(0,255,136,0.2)]': matchType === 'live',
    'border border-primary/30': matchType === 'finished' && youWon,
    'border border-muted': matchType === 'finished' && youLost,
    'border-2 border-dashed border-muted': matchType === 'upcoming',
  });

  return (
    <Card className={cardClasses}>
      {/* Header */}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold">{roundName}</span>
            {matchType === 'live' && (
              <Badge variant="default" className="gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                Live
              </Badge>
            )}
            {matchType === 'finished' && (
              <Badge variant={youWon ? 'default' : 'destructive'}>
                {youWon ? 'Advanced' : 'Eliminated'}
              </Badge>
            )}
            {matchType === 'upcoming' && <Badge variant="outline">Upcoming</Badge>}
          </div>
          <span className="text-sm text-muted-foreground">GW{gameweek}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Your Team */}
        <TeamRow
          label="YOU"
          teamName={yourTeamName}
          managerName={yourManagerName}
          seed={yourSeed}
          score={yourScore}
          isYou
          isWinner={youWon}
          isLoser={youLost}
          showScore={showScores}
        />

        {/* VS Divider */}
        <div className="flex items-center justify-center py-1">
          <span className="text-xl font-bold text-muted-foreground">VS</span>
        </div>

        {/* Opponent */}
        {isTBD ? (
          <div className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-muted">
            <span className="text-muted-foreground">Opponent TBD</span>
          </div>
        ) : (
          <TeamRow
            label="OPPONENT"
            teamName={opponentTeamName}
            managerName={opponentManagerName}
            seed={opponentSeed ?? 0}
            score={opponentScore}
            isWinner={youLost}
            isLoser={youWon}
            showScore={showScores}
          />
        )}
      </CardContent>

      {/* Footer with actions */}
      {onViewDetails && (
        <CardFooter className="border-t bg-muted/30">
          <Button variant="default" className="w-full" onClick={onViewDetails}>
            View Match Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
