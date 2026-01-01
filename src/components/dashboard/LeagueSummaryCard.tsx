import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { getRoundName } from '@/lib/bracket';

export interface LeagueSummaryCardProps {
  leagueName: string;
  memberCount: number;

  // Tournament data (null if no tournament)
  tournament?: {
    startGameweek: number;
    endGameweek: number;
    currentRound: number;
    totalRounds: number;
    status: 'active' | 'completed';
  } | null;

  // User's progress (null if not participating or no tournament)
  userProgress?: {
    status: 'active' | 'eliminated' | 'winner';
    currentRoundName?: string; // e.g., "Semi-finals"
    eliminationRound?: number | null;
  } | null;

  onClick: () => void;
}

type CardVariant = 'active' | 'eliminated' | 'winner' | 'completed' | 'no-tournament';

function getCardVariant(props: LeagueSummaryCardProps): CardVariant {
  const { tournament, userProgress } = props;

  if (!tournament) {
    return 'no-tournament';
  }

  if (tournament.status === 'completed') {
    if (userProgress?.status === 'winner') {
      return 'winner';
    }
    return 'completed';
  }

  // Active tournament
  if (userProgress?.status === 'eliminated') {
    return 'eliminated';
  }

  return 'active';
}

function getCardClasses(variant: CardVariant): string {
  const baseClasses = 'transition-all duration-200';

  switch (variant) {
    case 'active':
      return cn(
        baseClasses,
        'border-primary/50 shadow-[0_0_20px_rgba(0,255,136,0.1)]'
      );
    case 'winner':
      return cn(
        baseClasses,
        'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
      );
    case 'eliminated':
    case 'completed':
      return cn(baseClasses, 'opacity-80');
    case 'no-tournament':
      return cn(baseClasses, 'border-dashed');
    default:
      return baseClasses;
  }
}

function getGameweekRange(
  tournament: NonNullable<LeagueSummaryCardProps['tournament']>
): string {
  return `GW${tournament.startGameweek} → GW${tournament.endGameweek}`;
}

function getUserProgressText(
  tournament: NonNullable<LeagueSummaryCardProps['tournament']>,
  userProgress: LeagueSummaryCardProps['userProgress']
): string {
  const roundInfo = `Round ${tournament.currentRound} of ${tournament.totalRounds}`;

  if (!userProgress) {
    return roundInfo;
  }

  if (userProgress.status === 'winner') {
    return `Completed \u00B7 You: Winner`;
  }

  if (userProgress.status === 'eliminated') {
    const eliminatedText = userProgress.eliminationRound
      ? `Eliminated R${userProgress.eliminationRound}`
      : 'Eliminated';

    if (tournament.status === 'completed') {
      return `Completed \u00B7 You: ${eliminatedText}`;
    }
    return `${roundInfo} \u00B7 You: ${eliminatedText}`;
  }

  // User is still active
  const roundName =
    userProgress.currentRoundName ||
    getRoundName(tournament.currentRound, tournament.totalRounds);
  return `${roundInfo} \u00B7 You: ${roundName}`;
}

export function LeagueSummaryCard(props: LeagueSummaryCardProps) {
  const { leagueName, memberCount, tournament, userProgress, onClick } = props;

  const variant = getCardVariant(props);
  const hasTournament = !!tournament;

  // Line 1: League name
  const renderLine1 = () => {
    const isWinner = userProgress?.status === 'winner';
    return (
      <span className="font-semibold text-foreground">
        {leagueName}
        {isWinner && <span className="ml-2">&#127942;</span>}
      </span>
    );
  };

  // Line 2: Member count and gameweek range
  const renderLine2 = () => {
    const managersText = `${memberCount} managers`;
    const gwText = tournament ? getGameweekRange(tournament) : '\u2014';
    return (
      <span className="text-sm text-muted-foreground">
        {managersText} &middot; {gwText}
      </span>
    );
  };

  // Line 3: Progress info (only when tournament exists)
  const renderLine3 = () => {
    if (!tournament) {
      return null;
    }

    return (
      <span className="text-sm text-muted-foreground">
        {getUserProgressText(tournament, userProgress)}
      </span>
    );
  };

  // Button
  const renderButton = () => {
    if (hasTournament) {
      return (
        <Button
          size="sm"
          className="mt-3 w-full"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Tournament
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        Create Tournament
      </Button>
    );
  };

  const line3 = renderLine3();

  return (
    <Card
      role="article"
      className={cn(
        getCardClasses(variant),
        'cursor-pointer hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)]'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-1">
        <div>{renderLine1()}</div>
        <div>{renderLine2()}</div>
        {line3 && <div>{line3}</div>}
        {renderButton()}
      </CardContent>
    </Card>
  );
}
