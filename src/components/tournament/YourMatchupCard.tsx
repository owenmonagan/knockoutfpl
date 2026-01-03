import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface YourMatchupCardProps {
  roundName: string;
  gameweek: number;
  deadline?: string;
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
  onAnalyzeOpponent?: () => void;
}

interface TeamRowProps {
  teamName: string;
  managerName?: string;
  seed: number;
  score: number | null;
  isYourTeam: boolean;
  showScore: boolean;
  isScoreMuted: boolean;
}

function TeamRow({
  teamName,
  managerName,
  seed,
  score,
  isYourTeam,
  showScore,
  isScoreMuted,
}: TeamRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'font-bold truncate text-lg',
            isYourTeam ? 'text-primary' : 'text-foreground'
          )}
        >
          {teamName}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {managerName && `${managerName} `}(Seed #{seed.toLocaleString()})
        </p>
      </div>

      {showScore && score !== null && (
        <span
          className={cn(
            'text-3xl font-black tabular-nums shrink-0',
            isScoreMuted ? 'text-muted-foreground' : 'text-foreground'
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}

export function YourMatchupCard({
  roundName,
  gameweek,
  deadline,
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
  onAnalyzeOpponent,
}: YourMatchupCardProps) {
  const showScores = matchType !== 'upcoming';
  const youWon = result === 'won';
  const youLost = result === 'lost';
  const isTBD = !opponentTeamName;
  const isLive = matchType === 'live';
  const isFinished = matchType === 'finished';

  // Determine score muting based on result
  const yourScoreMuted = isFinished && youLost;
  const opponentScoreMuted = isFinished && youWon;

  // Card styling based on state
  const cardClasses = cn('overflow-hidden transition-all duration-200 relative', {
    'border-2 border-primary shadow-[0_0_20px_rgba(0,255,136,0.2)]': isLive,
    'border border-primary/30': isFinished && youWon,
    'border border-muted': isFinished && youLost,
    'border-2 border-dashed border-muted': matchType === 'upcoming',
  });

  // Status badge text and variant
  const getStatusBadge = () => {
    if (isLive) {
      return {
        text: `${roundName} Active`,
        variant: 'default' as const,
        showPulse: true,
      };
    }
    if (isFinished) {
      return {
        text: `${roundName} ${youWon ? 'Advanced' : 'Eliminated'}`,
        variant: youWon ? 'default' as const : 'destructive' as const,
        showPulse: false,
      };
    }
    return {
      text: `${roundName} Upcoming`,
      variant: 'outline' as const,
      showPulse: false,
    };
  };

  const statusBadge = getStatusBadge();

  // Gameweek info text
  const gameweekText = isFinished ? `GW${gameweek} • Finished` : `GW${gameweek}${deadline ? ` • ${deadline}` : ''}`;

  const hasActions = onViewDetails || onAnalyzeOpponent;

  return (
    <Card className={cardClasses}>
      {/* Header with status badge and trophy */}
      <CardHeader className="pb-3 relative">
        {/* Faint Trophy Icon - decorative */}
        <Trophy
          className="absolute top-4 right-4 h-12 w-12 text-muted-foreground opacity-10"
          aria-hidden="true"
        />

        <div className="space-y-1">
          {/* Status Badge */}
          <Badge variant={statusBadge.variant} className="gap-1.5">
            {statusBadge.showPulse && (
              <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
            )}
            {statusBadge.text}
          </Badge>

          {/* Title */}
          <h3 className="font-bold text-lg">Your Matchup</h3>

          {/* Gameweek and deadline */}
          <p className="text-sm text-muted-foreground">{gameweekText}</p>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Inner Score Card */}
        <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-4">
          {/* Your Team (always on top) */}
          <TeamRow
            teamName={yourTeamName}
            managerName={yourManagerName}
            seed={yourSeed}
            score={yourScore}
            isYourTeam={true}
            showScore={showScores}
            isScoreMuted={yourScoreMuted}
          />

          {/* Opponent */}
          {isTBD ? (
            <div className="flex items-center justify-center py-3 rounded-lg border-2 border-dashed border-muted">
              <span className="text-muted-foreground">Opponent TBD</span>
            </div>
          ) : (
            <TeamRow
              teamName={opponentTeamName}
              managerName={opponentManagerName}
              seed={opponentSeed ?? 0}
              score={opponentScore}
              isYourTeam={false}
              showScore={showScores}
              isScoreMuted={opponentScoreMuted}
            />
          )}
        </div>
      </CardContent>

      {/* Action Buttons */}
      {hasActions && (
        <CardFooter className="border-t bg-muted/30 gap-2">
          {onViewDetails && (
            <Button variant="default" className="flex-1" onClick={onViewDetails}>
              View Match Details
            </Button>
          )}
          {onAnalyzeOpponent && !isTBD && (
            <Button variant="ghost" className="flex-1" onClick={onAnalyzeOpponent}>
              Analyze Opponent
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
