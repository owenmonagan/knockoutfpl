import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/initials';
import { getFplTeamUrl } from '@/lib/fpl-urls';

export interface MatchSummaryCardProps {
  type: 'live' | 'upcoming' | 'finished';

  // Team info
  yourTeamName: string;
  opponentTeamName?: string; // undefined = TBD

  // FPL Team IDs for linking
  yourFplTeamId: number;
  opponentFplTeamId?: number; // undefined for TBD

  // Context
  leagueName: string;
  roundName: string;

  // Scores (live/finished)
  yourScore?: number | null;
  theirScore?: number | null;

  // Finished result
  result?: 'won' | 'lost';

  // Upcoming info
  gameweek?: number;

  // Navigation
  onClick?: () => void;
}

interface TeamAvatarProps {
  teamName?: string;
  isYou?: boolean;
  isWinner?: boolean;
  isLoser?: boolean;
  isTBD?: boolean;
}

function TeamAvatar({ teamName, isYou, isWinner, isLoser, isTBD }: TeamAvatarProps) {
  const initials = isTBD ? 'TBD' : teamName ? getInitials(teamName) : '??';

  const baseClasses = 'h-12 w-12 rounded-full flex items-center justify-center font-bold text-sm';

  if (isTBD) {
    return (
      <div className={cn(baseClasses, 'border-2 border-dashed border-muted-foreground/50 text-muted-foreground text-xs')}>
        {initials}
      </div>
    );
  }

  if (isWinner) {
    return (
      <div className={cn(baseClasses, 'border-2 border-primary bg-primary/10 text-primary')}>
        {initials}
      </div>
    );
  }

  if (isLoser) {
    return (
      <div className={cn(baseClasses, 'border border-muted bg-muted/50 text-muted-foreground grayscale')}>
        {initials}
      </div>
    );
  }

  if (isYou) {
    return (
      <div className={cn(baseClasses, 'border-2 border-primary bg-primary/10 text-primary')}>
        {initials}
      </div>
    );
  }

  // Default: opponent in live/upcoming
  return (
    <div className={cn(baseClasses, 'border border-muted bg-muted/50 text-muted-foreground')}>
      {initials}
    </div>
  );
}

interface TeamLinkProps {
  fplTeamId?: number;
  gameweek?: number;
  roundStarted: boolean;
  children: React.ReactNode;
  className?: string;
}

function TeamLink({ fplTeamId, gameweek, roundStarted, children, className }: TeamLinkProps) {
  if (!fplTeamId || !gameweek) {
    return <div className={className}>{children}</div>;
  }

  return (
    <a
      href={getFplTeamUrl(fplTeamId, gameweek, roundStarted)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn(className, 'hover:opacity-80 transition-opacity')}
    >
      {children}
    </a>
  );
}

export function MatchSummaryCard(props: MatchSummaryCardProps) {
  const {
    type,
    yourTeamName,
    opponentTeamName,
    yourFplTeamId,
    opponentFplTeamId,
    leagueName,
    roundName,
    yourScore,
    theirScore,
    gameweek,
    result,
    onClick,
  } = props;

  const isClickable = !!onClick;
  const isTBD = !opponentTeamName;
  const hasScores = yourScore != null && theirScore != null;
  const scoreDiff = hasScores ? yourScore - theirScore : 0;

  // Determine avatar states
  const youWon = type === 'finished' && result === 'won';
  const youLost = type === 'finished' && result === 'lost';

  // Card classes based on state
  const cardClasses = cn(
    'overflow-hidden transition-all duration-200',
    {
      'border-2 border-primary shadow-[0_0_20px_rgba(0,255,136,0.1)]': type === 'live',
      'border-dashed': type === 'upcoming',
      'opacity-90': youLost,
    },
    isClickable && 'cursor-pointer hover:-translate-y-1'
  );

  // Header badge content
  const renderStatusBadge = () => {
    switch (type) {
      case 'live':
        return (
          <Badge variant="default" className="gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
            Live
          </Badge>
        );
      case 'finished':
        return (
          <Badge variant="secondary">
            Finished
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge variant="outline">
            Upcoming
          </Badge>
        );
    }
  };

  // Score or VS display
  const renderScoreSection = () => {
    if (type === 'upcoming') {
      return (
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold text-muted-foreground">VS</span>
          {gameweek && (
            <span className="text-xs text-muted-foreground">GW{gameweek}</span>
          )}
        </div>
      );
    }

    if (!hasScores) {
      return <span className="text-muted-foreground">-</span>;
    }

    return (
      <div className="flex flex-col items-center gap-1">
        <div className="text-2xl font-black tracking-wider tabular-nums">
          {yourScore}
          <span className="text-muted-foreground mx-1">-</span>
          {theirScore}
        </div>
        {type === 'live' && scoreDiff !== 0 && (
          <Badge variant={scoreDiff > 0 ? 'default' : 'destructive'} className="text-xs">
            {scoreDiff > 0 ? '+' : ''}{scoreDiff} pts
          </Badge>
        )}
        {type === 'live' && scoreDiff === 0 && (
          <Badge variant="secondary" className="text-xs">
            Tied
          </Badge>
        )}
        {type === 'finished' && (
          <Badge variant={youWon ? 'default' : 'destructive'} className="text-xs">
            {youWon ? 'Won' : 'Lost'}
          </Badge>
        )}
      </div>
    );
  };

  // Footer content
  const renderFooter = () => {
    if (type === 'live' && hasScores) {
      if (scoreDiff > 0) return 'Winning';
      if (scoreDiff < 0) return 'Losing';
      return 'Tied';
    }
    if (type === 'finished') {
      return youLost ? (
        <span className="text-destructive">Eliminated</span>
      ) : (
        <span className="text-primary">Advanced</span>
      );
    }
    if (type === 'upcoming' && isTBD && gameweek) {
      return `Opponent TBD after GW${gameweek - 1}`;
    }
    return null;
  };

  return (
    <Card role="article" className={cardClasses} onClick={onClick}>
      {/* Header */}
      <div className="px-4 py-2 border-b bg-muted/30 flex justify-between items-center">
        {renderStatusBadge()}
        <span className="text-xs text-muted-foreground">
          {leagueName} · {roundName}
        </span>
      </div>

      {/* Body */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Your team */}
          <TeamLink
            fplTeamId={yourFplTeamId}
            gameweek={gameweek}
            roundStarted={type === 'live' || type === 'finished'}
            className="flex flex-col items-center gap-2 flex-1"
          >
            <TeamAvatar
              teamName={yourTeamName}
              isYou
              isWinner={youWon}
              isLoser={youLost}
            />
            <span className="text-xs font-medium text-center line-clamp-1">You</span>
          </TeamLink>

          {/* Score/VS */}
          {renderScoreSection()}

          {/* Opponent */}
          <TeamLink
            fplTeamId={opponentFplTeamId}
            gameweek={gameweek}
            roundStarted={type === 'live' || type === 'finished'}
            className="flex flex-col items-center gap-2 flex-1"
          >
            <TeamAvatar
              teamName={opponentTeamName}
              isTBD={isTBD}
              isWinner={youLost}
              isLoser={youWon}
            />
            <span className="text-xs font-medium text-muted-foreground text-center line-clamp-1">
              {isTBD ? 'TBD' : opponentTeamName}
            </span>
          </TeamLink>
        </div>
      </CardContent>

      {/* Footer */}
      <div className="px-4 py-2 border-t bg-muted/20 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{renderFooter()}</span>
        {isClickable && (
          <span className="text-xs text-muted-foreground">
            Details →
          </span>
        )}
      </div>
    </Card>
  );
}
