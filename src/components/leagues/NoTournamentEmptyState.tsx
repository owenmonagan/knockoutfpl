import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { CreateTournamentButton } from '../tournament/CreateTournamentButton';

interface NoTournamentEmptyStateProps {
  leagueName: string;
  managerCount: number;
  isAuthenticated: boolean;
  onCreate: (startEvent: number, matchSize: number) => Promise<void>;
  isLocked?: boolean;
}

export function NoTournamentEmptyState({
  leagueName,
  managerCount,
  isAuthenticated,
  onCreate,
  isLocked = false,
}: NoTournamentEmptyStateProps) {
  if (isLocked) {
    return (
      <Card className="w-full max-w-lg mx-auto overflow-hidden">
        {/* Hero Area */}
        <div className="w-full h-48 bg-gradient-to-b from-secondary to-card flex items-center justify-center relative overflow-hidden">
          {/* Dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          {/* Lock icon */}
          <div className="relative z-10 bg-muted/50 p-6 rounded-full backdrop-blur-sm">
            <span className="material-symbols-outlined text-6xl text-muted-foreground" aria-hidden="true">
              lock
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-8 pb-10 pt-6 flex flex-col items-center text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
            This league is too large for a tournament
          </h1>
          <p className="text-muted-foreground text-base max-w-xs mx-auto leading-relaxed">
            <span className="text-foreground font-semibold">{leagueName}</span> has too many managers to create a knockout tournament.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto overflow-hidden">
      {/* Hero Area */}
      <div className="w-full h-48 bg-gradient-to-b from-secondary to-card flex items-center justify-center relative overflow-hidden">
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        {/* Trophy icon */}
        <div className="relative z-10 bg-primary/20 p-6 rounded-full backdrop-blur-sm">
          <span className="material-symbols-outlined text-6xl text-primary" aria-hidden="true">
            emoji_events
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="px-8 pb-10 pt-6 flex flex-col items-center text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
          No Tournament Yet
        </h1>
        <p className="text-muted-foreground text-base mb-8 max-w-xs mx-auto leading-relaxed">
          Be the first to create a knockout tournament for{' '}
          <span className="text-foreground font-semibold">{leagueName}</span>
        </p>

        {/* CTA Area */}
        {isAuthenticated ? (
          <div className="w-full md:w-auto min-w-[240px] mb-8">
            <CreateTournamentButton onCreate={onCreate} managerCount={managerCount} />
          </div>
        ) : (
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-4">
              Sign in to create a knockout tournament
            </p>
            <Link to="/signup">
              <Button className="btn-glow min-w-[240px]">
                Sign Up to Create Tournament
              </Button>
            </Link>
          </div>
        )}

        {/* How It Works Section */}
        <div className="w-full bg-secondary rounded-lg p-5 border border-border/50">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 text-left pl-1">
            How it works
          </p>
          <div className="flex flex-col gap-4">
            {/* Feature 1: Auto-Seeding */}
            <div className="flex items-start gap-3 text-left">
              <div className="mt-0.5 min-w-5 text-primary">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">leaderboard</span>
              </div>
              <div>
                <p className="text-sm font-medium">Auto-Seeding</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All {managerCount} managers auto-seeded by current rank
                </p>
              </div>
            </div>

            {/* Feature 2: Head-to-Head */}
            <div className="flex items-start gap-3 text-left">
              <div className="mt-0.5 min-w-5 text-primary">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">swords</span>
              </div>
              <div>
                <p className="text-sm font-medium">Head-to-Head</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Head-to-head matches each gameweek
                </p>
              </div>
            </div>

            {/* Feature 3: Auto-Updates */}
            <div className="flex items-start gap-3 text-left">
              <div className="mt-0.5 min-w-5 text-primary">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">sync</span>
              </div>
              <div>
                <p className="text-sm font-medium">Auto-Updates</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Scores update automatically from FPL
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
