import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { getRoundName } from '@/lib/bracket';

export interface LeagueSummaryCardProps {
  leagueName: string;
  memberCount: number;
  userRank?: number;

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

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

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

function getBadgeConfig(variant: CardVariant): { text: string; className: string } {
  switch (variant) {
    case 'active':
      return {
        text: 'Active',
        className: 'bg-primary text-background-dark',
      };
    case 'winner':
      return {
        text: 'Champion',
        className: 'bg-amber-500 text-background-dark',
      };
    case 'eliminated':
      return {
        text: 'Eliminated',
        className: 'bg-[#3d1f1f] text-red-400',
      };
    case 'completed':
      return {
        text: 'Completed',
        className: 'bg-[#3d1f1f] text-red-400',
      };
    case 'no-tournament':
    default:
      return {
        text: 'Classic',
        className: 'bg-[#0f231a] text-text-subtle border border-[#3d5248]',
      };
  }
}

function getHeaderGradient(variant: CardVariant): string {
  switch (variant) {
    case 'active':
      return 'bg-gradient-to-br from-[#1a4d38] to-background-dark';
    case 'winner':
      return 'bg-gradient-to-br from-amber-900/50 to-background-dark';
    case 'eliminated':
    case 'completed':
      return 'bg-gradient-to-br from-[#2e1616] to-background-dark';
    case 'no-tournament':
    default:
      return 'bg-gradient-to-br from-[#273a31] to-background-dark';
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

  const renderBadge = () => {
    const { text, className } = getBadgeConfig(variant);
    return (
      <span
        className={cn(
          'px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wide',
          className
        )}
      >
        {text}
      </span>
    );
  };

  // Stats grid placeholder - will be implemented in Task 4
  const renderStatsGrid = () => {
    return <div>Stats placeholder</div>;
  };

  // Button
  const renderButton = () => {
    if (hasTournament) {
      return (
        <Button
          size="sm"
          className="w-full"
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
        className="w-full"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        Create Tournament
      </Button>
    );
  };

  return (
    <Card
      role="article"
      className={cn(
        getCardClasses(variant),
        'cursor-pointer hover:-translate-y-1 overflow-hidden'
      )}
      onClick={onClick}
    >
      {/* Header Section */}
      <div
        data-testid="league-card-header"
        className={cn(
          'relative h-24 p-4 flex flex-col justify-between overflow-hidden',
          getHeaderGradient(variant)
        )}
      >
        {/* Top row: Badge + Manager count */}
        <div className="relative z-10 flex justify-between items-start">
          {renderBadge()}
          <span className="text-white/60 text-xs font-medium">
            {memberCount} Managers
          </span>
        </div>
        {/* Bottom: League name */}
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-white line-clamp-1">
            {leagueName}
            {userProgress?.status === 'winner' && (
              <span className="ml-2">&#127942;</span>
            )}
          </h3>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4 flex flex-col gap-3">
        {renderStatsGrid()}
        {renderButton()}
      </CardContent>
    </Card>
  );
}
