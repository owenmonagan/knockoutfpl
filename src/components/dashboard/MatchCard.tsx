import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';

export interface MatchCardProps {
  type: 'live' | 'upcoming' | 'finished';
  opponentTeamName: string;
  leagueName: string;
  roundName: string;
  // For live/finished matches
  yourScore?: number | null;
  theirScore?: number | null;
  // For upcoming matches
  gameweek?: number;
  startsIn?: string; // e.g., "Saturday", "2 days"
  // For finished matches
  result?: 'won' | 'lost';
  // Navigation
  onClick?: () => void;
}

function getStatusText(yourScore: number, theirScore: number): string {
  if (yourScore > theirScore) {
    return "You're ahead";
  } else if (yourScore < theirScore) {
    return "You're behind";
  }
  return 'Tied';
}

function getCardClasses(type: MatchCardProps['type'], result?: 'won' | 'lost'): string {
  const baseClasses = 'transition-all duration-200';

  switch (type) {
    case 'live':
      return cn(
        baseClasses,
        'border-primary shadow-[0_0_20px_rgba(0,255,136,0.1)]'
      );
    case 'upcoming':
      return cn(baseClasses, 'border-dashed');
    case 'finished':
      if (result === 'won') {
        return cn(baseClasses, 'border-l-4 border-l-primary');
      }
      return cn(baseClasses, 'opacity-90');
    default:
      return baseClasses;
  }
}

export function MatchCard(props: MatchCardProps) {
  const {
    type,
    opponentTeamName,
    leagueName,
    roundName,
    yourScore,
    theirScore,
    gameweek,
    startsIn,
    result,
    onClick,
  } = props;

  const isClickable = !!onClick;

  // Line 1: Opponent display
  const renderLine1 = () => {
    if (type === 'finished') {
      if (result === 'won') {
        return (
          <span className="font-semibold text-foreground">
            <span className="text-primary mr-1">&#10003;</span>
            Beat {opponentTeamName}
          </span>
        );
      }
      return (
        <span className="font-semibold text-muted-foreground">
          <span className="text-destructive mr-1">&#10007;</span>
          Lost to {opponentTeamName}
        </span>
      );
    }

    return (
      <span className="font-semibold text-foreground">
        vs {opponentTeamName}
      </span>
    );
  };

  // Line 2: League and round
  const renderLine2 = () => (
    <span className="text-sm text-muted-foreground">
      {leagueName} &middot; {roundName}
    </span>
  );

  // Line 3: Score/timing info
  const renderLine3 = () => {
    if (type === 'upcoming') {
      const gwText = gameweek ? `GW${gameweek}` : '';
      const startsText = startsIn ? `Starts ${startsIn}` : '';
      const separator = gwText && startsText ? ' \u00B7 ' : '';
      return (
        <span className="text-sm text-muted-foreground">
          {gwText}{separator}{startsText}
        </span>
      );
    }

    if (type === 'live' || type === 'finished') {
      const hasScores =
        yourScore !== null &&
        yourScore !== undefined &&
        theirScore !== null &&
        theirScore !== undefined;

      if (!hasScores) {
        return null;
      }

      const scoreText = `${yourScore} - ${theirScore}`;

      if (type === 'live') {
        const status = getStatusText(yourScore, theirScore);
        return (
          <span className="text-sm">
            <span className="font-semibold text-foreground">{scoreText}</span>
            <span className="text-muted-foreground"> &middot; {status}</span>
          </span>
        );
      }

      // Finished match - just show score
      return (
        <span className="text-sm text-muted-foreground">{scoreText}</span>
      );
    }

    return null;
  };

  return (
    <Card
      role="article"
      className={cn(
        getCardClasses(type, result),
        isClickable && 'cursor-pointer hover:-translate-y-1'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-1">
        <div>{renderLine1()}</div>
        <div>{renderLine2()}</div>
        <div>{renderLine3()}</div>
      </CardContent>
    </Card>
  );
}
