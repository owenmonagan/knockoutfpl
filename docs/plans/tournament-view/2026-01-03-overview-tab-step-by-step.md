# Overview Tab Step-by-Step Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the Overview tab for tournament view with Your Matchup card, Tournament Stats, Possible Opponents, and Match History sections.

**Architecture:** Add shadcn Tabs to wrap existing BracketView content. Create new components for Overview tab sections. Reuse existing YourMatchesSection for match history. Calculate sibling match for Possible Opponents using bracket position math.

**Tech Stack:** React, TypeScript, shadcn/ui (Tabs, Card, Badge, Progress), Tailwind CSS, Lucide icons

---

## Phase 1: Tab Structure + Shell

### Task 1.1: Add shadcn Tabs Component

**Files:**
- Create: `src/components/ui/tabs.tsx` (via shadcn CLI)

**Step 1: Install tabs component**

Run: `npx shadcn@latest add tabs`
Expected: Creates `src/components/ui/tabs.tsx`

**Step 2: Verify installation**

Run: `ls src/components/ui/tabs.tsx`
Expected: File exists

**Step 3: Commit**

```bash
git add src/components/ui/tabs.tsx
git commit -m "chore: add shadcn tabs component"
```

---

### Task 1.2: Create Tab Wrapper Components (Placeholders)

**Files:**
- Create: `src/components/tournament/tabs/OverviewTab.tsx`
- Create: `src/components/tournament/tabs/MatchesTab.tsx`
- Create: `src/components/tournament/tabs/ParticipantsTab.tsx`
- Create: `src/components/tournament/tabs/BracketTab.tsx`
- Create: `src/components/tournament/tabs/index.ts`

**Step 1: Create tabs directory**

Run: `mkdir -p src/components/tournament/tabs`

**Step 2: Create OverviewTab placeholder**

Create `src/components/tournament/tabs/OverviewTab.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function OverviewTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Overview content coming soon...</p>
      </CardContent>
    </Card>
  );
}
```

**Step 3: Create MatchesTab placeholder**

Create `src/components/tournament/tabs/MatchesTab.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MatchesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matches</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Browse all matches - coming soon...</p>
      </CardContent>
    </Card>
  );
}
```

**Step 4: Create ParticipantsTab wrapper**

Create `src/components/tournament/tabs/ParticipantsTab.tsx`:

```tsx
import { Card, CardContent } from '@/components/ui/card';
import { ParticipantsTable } from '../ParticipantsTable';
import type { Participant } from '@/types/tournament';

interface ParticipantsTabProps {
  participants: Participant[];
  seedingGameweek: number;
}

export function ParticipantsTab({ participants, seedingGameweek }: ParticipantsTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <ParticipantsTable
          participants={participants}
          seedingGameweek={seedingGameweek}
        />
      </CardContent>
    </Card>
  );
}
```

**Step 5: Create BracketTab wrapper**

Create `src/components/tournament/tabs/BracketTab.tsx`:

```tsx
import { BracketLayout } from '../BracketLayout';
import { UserPathBracket } from '../UserPathBracket';
import type { Tournament } from '@/types/tournament';

interface BracketTabProps {
  tournament: Tournament;
  userFplTeamId?: number | null;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
}

export function BracketTab({
  tournament,
  userFplTeamId,
  isAuthenticated,
  onClaimTeam,
}: BracketTabProps) {
  if (tournament.rounds.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Bracket will appear when the tournament starts.
      </p>
    );
  }

  // Use UserPathBracket for large tournaments (>64 participants)
  if (tournament.participants.length > 64) {
    return (
      <UserPathBracket
        tournament={tournament}
        userFplTeamId={userFplTeamId}
        isAuthenticated={isAuthenticated}
        currentGameweek={tournament.currentGameweek}
      />
    );
  }

  return (
    <BracketLayout
      rounds={tournament.rounds}
      participants={tournament.participants}
      currentGameweek={tournament.currentGameweek}
      isAuthenticated={isAuthenticated}
      onClaimTeam={onClaimTeam}
    />
  );
}
```

**Step 6: Create index barrel export**

Create `src/components/tournament/tabs/index.ts`:

```tsx
export { OverviewTab } from './OverviewTab';
export { MatchesTab } from './MatchesTab';
export { ParticipantsTab } from './ParticipantsTab';
export { BracketTab } from './BracketTab';
```

**Step 7: Commit**

```bash
git add src/components/tournament/tabs/
git commit -m "feat: add tab wrapper components (placeholders)"
```

---

### Task 1.3: Create TournamentView with Tabs

**Files:**
- Create: `src/components/tournament/TournamentView.tsx`
- Modify: `src/pages/LeaguePage.tsx` (update import)

**Step 1: Create TournamentView component**

Create `src/components/tournament/TournamentView.tsx`:

```tsx
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShareTournamentDialog } from './ShareTournamentDialog';
import { TeamSearchOverlay } from './TeamSearchOverlay';
import { OverviewTab, MatchesTab, ParticipantsTab, BracketTab } from './tabs';
import type { Tournament } from '@/types/tournament';

interface TournamentViewProps {
  tournament: Tournament;
  isRefreshing?: boolean;
  isAuthenticated?: boolean;
  userFplTeamId?: number | null;
  onClaimTeam?: (fplTeamId: number) => void;
}

type TabValue = 'overview' | 'matches' | 'participants' | 'bracket';

const TAB_OPTIONS: { value: TabValue; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'matches', label: 'Matches' },
  { value: 'participants', label: 'Participants' },
  { value: 'bracket', label: 'Bracket' },
];

export function TournamentView({
  tournament,
  isRefreshing = false,
  isAuthenticated,
  userFplTeamId,
  onClaimTeam,
}: TournamentViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Get tab from URL or default to 'overview'
  const currentTab = (searchParams.get('tab') as TabValue) || 'overview';

  // Update URL when tab changes
  const handleTabChange = useCallback(
    (value: string) => {
      setSearchParams({ tab: value });
    },
    [setSearchParams]
  );

  // Get current round for share dialog
  const currentRound = tournament.rounds.find(
    (r) => r.roundNumber === tournament.currentRound
  );

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{tournament.fplLeagueName}</CardTitle>
            <div className="flex items-center gap-2">
              {isRefreshing && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Spinner className="size-3" />
                  <span>Updating...</span>
                </div>
              )}
              <Badge variant={tournament.status === 'completed' ? 'secondary' : 'default'}>
                {tournament.status === 'completed' ? 'Completed' : 'Active'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShareDialog(true)}
                aria-label="Share tournament"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Starting Gameweek {tournament.startGameweek} • {tournament.totalRounds} rounds
          </p>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          {TAB_OPTIONS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="matches" className="mt-6">
          <MatchesTab />
        </TabsContent>

        <TabsContent value="participants" className="mt-6">
          <ParticipantsTab
            participants={tournament.participants}
            seedingGameweek={tournament.startGameweek - 1}
          />
        </TabsContent>

        <TabsContent value="bracket" className="mt-6">
          <BracketTab
            tournament={tournament}
            userFplTeamId={userFplTeamId}
            isAuthenticated={isAuthenticated}
            onClaimTeam={onClaimTeam}
          />
        </TabsContent>
      </Tabs>

      {/* Share Tournament Dialog */}
      <ShareTournamentDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        leagueId={tournament.fplLeagueId}
        leagueName={tournament.fplLeagueName}
        roundName={currentRound?.name}
        participantCount={tournament.participants.length}
      />
    </div>
  );
}
```

**Step 2: Update LeaguePage to use TournamentView**

Modify `src/pages/LeaguePage.tsx`:

Replace line 6:
```tsx
import { BracketView } from '../components/tournament/BracketView';
```

With:
```tsx
import { TournamentView } from '../components/tournament/TournamentView';
```

Replace line 199 (the BracketView usage):
```tsx
        <BracketView
```

With:
```tsx
        <TournamentView
```

**Step 3: Run tests to verify nothing broke**

Run: `npm test -- --run src/pages/LeaguePage`
Expected: Tests pass (or skip if no tests exist for LeaguePage)

**Step 4: Commit**

```bash
git add src/components/tournament/TournamentView.tsx src/pages/LeaguePage.tsx
git commit -m "feat: add TournamentView with tabs, replace BracketView usage"
```

---

### Task 1.4: Add TournamentView Test

**Files:**
- Create: `src/components/tournament/TournamentView.test.tsx`

**Step 1: Write basic test**

Create `src/components/tournament/TournamentView.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { TournamentView } from './TournamentView';
import type { Tournament } from '@/types/tournament';

// Mock ShareTournamentDialog
vi.mock('./ShareTournamentDialog', () => ({
  ShareTournamentDialog: () => null,
}));

const mockTournament: Tournament = {
  id: 'tour-1',
  fplLeagueId: 123,
  fplLeagueName: 'Test League',
  creatorUserId: 'user-1',
  startGameweek: 20,
  currentRound: 1,
  currentGameweek: 20,
  totalRounds: 2,
  status: 'active',
  participants: [
    { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Manager A', seed: 1 },
    { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Manager B', seed: 2 },
  ],
  rounds: [
    {
      roundNumber: 1,
      name: 'Final',
      gameweek: 20,
      isComplete: false,
      matches: [
        {
          id: 'r1-m1',
          player1: { fplTeamId: 1, seed: 1, score: null },
          player2: { fplTeamId: 2, seed: 2, score: null },
          winnerId: null,
          isBye: false,
        },
      ],
    },
  ],
  winnerId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('TournamentView', () => {
  it('renders tournament header with name and status', () => {
    renderWithRouter(<TournamentView tournament={mockTournament} />);

    expect(screen.getByText('Test League')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders all four tab triggers', () => {
    renderWithRouter(<TournamentView tournament={mockTournament} />);

    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Matches' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Participants' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Bracket' })).toBeInTheDocument();
  });

  it('defaults to overview tab', () => {
    renderWithRouter(<TournamentView tournament={mockTournament} />);

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'data-state',
      'active'
    );
  });

  it('switches tabs when clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<TournamentView tournament={mockTournament} />);

    await user.click(screen.getByRole('tab', { name: 'Participants' }));

    expect(screen.getByRole('tab', { name: 'Participants' })).toHaveAttribute(
      'data-state',
      'active'
    );
    expect(screen.getByText('Participants')).toBeInTheDocument();
  });
});
```

**Step 2: Run the test**

Run: `npm test -- --run src/components/tournament/TournamentView.test.tsx`
Expected: All tests pass

**Step 3: Commit**

```bash
git add src/components/tournament/TournamentView.test.tsx
git commit -m "test: add TournamentView component tests"
```

---

## Phase 2: Your Matchup Card + Match History

### Task 2.1: Create YourMatchupCard Component

**Files:**
- Create: `src/components/tournament/YourMatchupCard.tsx`
- Create: `src/components/tournament/YourMatchupCard.test.tsx`

**Step 1: Write the failing test**

Create `src/components/tournament/YourMatchupCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { YourMatchupCard } from './YourMatchupCard';

describe('YourMatchupCard', () => {
  const baseProps = {
    roundName: 'Quarter-Finals',
    gameweek: 24,
    yourTeamName: 'O-win FC',
    yourManagerName: 'Owen',
    yourSeed: 142,
    yourScore: null,
    opponentTeamName: 'Klopps & Robbers',
    opponentManagerName: 'Sarah',
    opponentSeed: 4005,
    opponentScore: null,
    matchType: 'upcoming' as const,
  };

  it('renders round name and gameweek', () => {
    render(<YourMatchupCard {...baseProps} />);

    expect(screen.getByText('Quarter-Finals')).toBeInTheDocument();
    expect(screen.getByText(/GW ?24/i)).toBeInTheDocument();
  });

  it('renders your team info with seed', () => {
    render(<YourMatchupCard {...baseProps} />);

    expect(screen.getByText('O-win FC')).toBeInTheDocument();
    expect(screen.getByText(/Seed #142/)).toBeInTheDocument();
  });

  it('renders opponent team info with seed', () => {
    render(<YourMatchupCard {...baseProps} />);

    expect(screen.getByText('Klopps & Robbers')).toBeInTheDocument();
    expect(screen.getByText(/Seed #4005/)).toBeInTheDocument();
  });

  it('shows VS for upcoming matches', () => {
    render(<YourMatchupCard {...baseProps} matchType="upcoming" />);

    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('shows scores for live matches', () => {
    render(
      <YourMatchupCard
        {...baseProps}
        matchType="live"
        yourScore={72}
        opponentScore={65}
      />
    );

    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument();
  });

  it('shows Live badge for live matches', () => {
    render(<YourMatchupCard {...baseProps} matchType="live" yourScore={72} opponentScore={65} />);

    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('shows result badge for finished matches', () => {
    render(
      <YourMatchupCard
        {...baseProps}
        matchType="finished"
        yourScore={72}
        opponentScore={65}
        result="won"
      />
    );

    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/tournament/YourMatchupCard.test.tsx`
Expected: FAIL - module not found

**Step 3: Write the implementation**

Create `src/components/tournament/YourMatchupCard.tsx`:

```tsx
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
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/tournament/YourMatchupCard.test.tsx`
Expected: All tests pass

**Step 5: Commit**

```bash
git add src/components/tournament/YourMatchupCard.tsx src/components/tournament/YourMatchupCard.test.tsx
git commit -m "feat: add YourMatchupCard component with vertical layout"
```

---

### Task 2.2: Wire Up OverviewTab with Real Data

**Files:**
- Modify: `src/components/tournament/tabs/OverviewTab.tsx`

**Step 1: Update OverviewTab with props and YourMatchupCard**

Replace `src/components/tournament/tabs/OverviewTab.tsx`:

```tsx
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { YourMatchesSection } from '@/components/dashboard/YourMatchesSection';
import { YourMatchupCard } from '../YourMatchupCard';
import type { Tournament, Participant, Match } from '@/types/tournament';
import type { MatchSummaryCardProps } from '@/components/dashboard/MatchSummaryCard';
import { getMatchPlayers } from '@/types/tournament';

interface OverviewTabProps {
  tournament: Tournament;
  userFplTeamId?: number | null;
  userMatches: MatchSummaryCardProps[];
  userParticipant?: Participant | null;
}

export function OverviewTab({
  tournament,
  userFplTeamId,
  userMatches,
  userParticipant,
}: OverviewTabProps) {
  // Find user's current/next match
  const currentMatch = useMemo(() => {
    if (!userFplTeamId) return null;

    // Find match in current round or next upcoming round
    for (const round of tournament.rounds) {
      for (const match of round.matches) {
        const players = getMatchPlayers(match);
        if (players.some((p) => p.fplTeamId === userFplTeamId)) {
          return { match, round };
        }
      }
    }
    return null;
  }, [tournament.rounds, userFplTeamId]);

  // Prepare matchup card props
  const matchupProps = useMemo(() => {
    if (!currentMatch || !userParticipant) return null;

    const { match, round } = currentMatch;
    const players = getMatchPlayers(match);
    const yourPlayer = players.find((p) => p.fplTeamId === userFplTeamId);
    const opponent = players.find((p) => p.fplTeamId !== userFplTeamId);

    if (!yourPlayer) return null;

    const roundStarted = round.gameweek <= tournament.currentGameweek;
    const isComplete = round.isComplete;

    let matchType: 'live' | 'upcoming' | 'finished';
    let result: 'won' | 'lost' | undefined;

    if (isComplete && match.winnerId) {
      matchType = 'finished';
      result = match.winnerId === userFplTeamId ? 'won' : 'lost';
    } else if (roundStarted) {
      matchType = 'live';
    } else {
      matchType = 'upcoming';
    }

    const opponentParticipant = opponent
      ? tournament.participants.find((p) => p.fplTeamId === opponent.fplTeamId)
      : null;

    return {
      roundName: round.name,
      gameweek: round.gameweek,
      yourTeamName: userParticipant.fplTeamName,
      yourManagerName: userParticipant.managerName,
      yourSeed: userParticipant.seed,
      yourScore: yourPlayer.score,
      opponentTeamName: opponentParticipant?.fplTeamName,
      opponentManagerName: opponentParticipant?.managerName,
      opponentSeed: opponentParticipant?.seed,
      opponentScore: opponent?.score ?? null,
      matchType,
      result,
    };
  }, [currentMatch, userParticipant, userFplTeamId, tournament]);

  const hasMatchHistory = userMatches.length > 0;
  const isParticipant = !!userParticipant;

  return (
    <div className="space-y-6">
      {/* Grid layout: 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Your Matchup Card - 2/3 width */}
        <div className="lg:col-span-2">
          {isParticipant && matchupProps ? (
            <YourMatchupCard {...matchupProps} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Match</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {isParticipant
                    ? 'No current match found.'
                    : 'Connect your FPL team to see your match.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tournament Stats placeholder - 1/3 width */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tournament Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming in Phase 3...</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Second row: Friends + Possible Opponents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Friends Activity placeholder - 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Friends Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming in Phase 4...</p>
            </CardContent>
          </Card>
        </div>

        {/* Possible Opponents placeholder - 1/3 width */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Possible Next Opponents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming in Phase 3...</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Match History - full width */}
      {hasMatchHistory && (
        <Card>
          <CardHeader>
            <CardTitle>Your Match History</CardTitle>
          </CardHeader>
          <CardContent>
            <YourMatchesSection
              matches={userMatches}
              currentGameweek={tournament.currentGameweek}
              isLive={userMatches.some((m) => m.type === 'live')}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

**Step 2: Update TournamentView to pass props to OverviewTab**

Modify `src/components/tournament/TournamentView.tsx` - add the data preparation and pass props.

Add these imports at the top:
```tsx
import type { Participant } from '@/types/tournament';
import { getMatchPlayers } from '@/types/tournament';
import type { MatchSummaryCardProps } from '@/components/dashboard/MatchSummaryCard';
```

Add this helper function before the component (copy from BracketView.tsx):
```tsx
function buildMatchesForTeam(
  tournament: Tournament,
  fplTeamId: number
): MatchSummaryCardProps[] {
  const participantMap = new Map<number, Participant>(
    tournament.participants.map((p) => [p.fplTeamId, p])
  );

  const yourParticipant = participantMap.get(fplTeamId);
  if (!yourParticipant) return [];

  const matches: MatchSummaryCardProps[] = [];

  for (const round of tournament.rounds) {
    for (const match of round.matches) {
      const players = getMatchPlayers(match);
      const yourPlayer = players.find((p) => p.fplTeamId === fplTeamId);

      if (!yourPlayer) continue;

      const opponents = players.filter((p) => p.fplTeamId !== fplTeamId);
      const opponent = opponents[0];

      const opponentParticipant = opponent
        ? participantMap.get(opponent.fplTeamId)
        : null;

      const roundStarted = round.gameweek <= tournament.currentGameweek;
      const hasScores =
        yourPlayer.score !== null &&
        (!opponent || opponent.score !== null);
      const isComplete = round.isComplete && hasScores;

      let matchType: 'live' | 'upcoming' | 'finished';
      let result: 'won' | 'lost' | undefined;

      if (isComplete) {
        matchType = 'finished';
        result = match.winnerId === fplTeamId ? 'won' : 'lost';
      } else if (roundStarted && !round.isComplete) {
        matchType = 'live';
      } else {
        matchType = 'upcoming';
      }

      matches.push({
        type: matchType,
        yourTeamName: yourParticipant.fplTeamName,
        yourFplTeamId: fplTeamId,
        opponentTeamName: opponentParticipant?.fplTeamName,
        opponentFplTeamId: opponent?.fplTeamId,
        leagueName: tournament.fplLeagueName,
        roundName: round.name,
        yourScore: yourPlayer.score,
        theirScore: opponent?.score ?? null,
        gameweek: round.gameweek,
        result,
      });
    }
  }

  return matches.sort((a, b) => (a.gameweek ?? 0) - (b.gameweek ?? 0));
}
```

Inside the component, add these memos after the existing state:
```tsx
  // Check if user is a participant
  const userIsParticipant = useMemo(() => {
    if (!isAuthenticated || !userFplTeamId) return false;
    return tournament.participants.some((p) => p.fplTeamId === userFplTeamId);
  }, [isAuthenticated, userFplTeamId, tournament.participants]);

  // Get user's participant info
  const userParticipant = useMemo(() => {
    if (!userIsParticipant || !userFplTeamId) return null;
    return tournament.participants.find((p) => p.fplTeamId === userFplTeamId);
  }, [tournament.participants, userIsParticipant, userFplTeamId]);

  // Build user's matches
  const userMatches = useMemo(() => {
    if (!userIsParticipant || !userFplTeamId) return [];
    return buildMatchesForTeam(tournament, userFplTeamId);
  }, [tournament, userIsParticipant, userFplTeamId]);
```

Update the OverviewTab in TabsContent:
```tsx
        <TabsContent value="overview" className="mt-6">
          <OverviewTab
            tournament={tournament}
            userFplTeamId={userFplTeamId}
            userMatches={userMatches}
            userParticipant={userParticipant}
          />
        </TabsContent>
```

**Step 3: Run tests**

Run: `npm test -- --run`
Expected: Tests pass

**Step 4: Commit**

```bash
git add src/components/tournament/tabs/OverviewTab.tsx src/components/tournament/TournamentView.tsx
git commit -m "feat: wire up OverviewTab with YourMatchupCard and match history"
```

---

## Phase 3: Tournament Stats + Possible Opponents

### Task 3.1: Create TournamentStats Component

**Files:**
- Create: `src/components/tournament/TournamentStats.tsx`
- Create: `src/components/tournament/TournamentStats.test.tsx`

**Step 1: Write the failing test**

Create `src/components/tournament/TournamentStats.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TournamentStats } from './TournamentStats';

describe('TournamentStats', () => {
  const baseProps = {
    totalParticipants: 48204,
    remainingParticipants: 3012,
    currentRound: 5,
    totalRounds: 16,
    currentRoundName: 'Quarter-Finals',
    currentGameweek: 28,
    userSeed: 142,
    userStatus: 'in' as const,
  };

  it('renders teams remaining with progress', () => {
    render(<TournamentStats {...baseProps} />);

    expect(screen.getByText(/3,012/)).toBeInTheDocument();
    expect(screen.getByText(/48,204/)).toBeInTheDocument();
  });

  it('renders current round info', () => {
    render(<TournamentStats {...baseProps} />);

    expect(screen.getByText('Quarter-Finals')).toBeInTheDocument();
    expect(screen.getByText(/GW ?28/i)).toBeInTheDocument();
    expect(screen.getByText(/11 rounds remaining/i)).toBeInTheDocument();
  });

  it('renders user seed', () => {
    render(<TournamentStats {...baseProps} />);

    expect(screen.getByText('#142')).toBeInTheDocument();
  });

  it('renders active status for users still in', () => {
    render(<TournamentStats {...baseProps} userStatus="in" />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders eliminated status with round', () => {
    render(
      <TournamentStats {...baseProps} userStatus="eliminated" eliminatedRound={4} />
    );

    expect(screen.getByText(/Eliminated/)).toBeInTheDocument();
    expect(screen.getByText(/R4/)).toBeInTheDocument();
  });

  it('renders winner status', () => {
    render(<TournamentStats {...baseProps} userStatus="winner" />);

    expect(screen.getByText('Champion')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/tournament/TournamentStats.test.tsx`
Expected: FAIL - module not found

**Step 3: Write the implementation**

Create `src/components/tournament/TournamentStats.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TournamentStatsProps {
  totalParticipants: number;
  remainingParticipants: number;
  currentRound: number;
  totalRounds: number;
  currentRoundName: string;
  currentGameweek: number;
  userSeed?: number;
  userStatus: 'in' | 'eliminated' | 'winner' | null;
  eliminatedRound?: number;
}

export function TournamentStats({
  totalParticipants,
  remainingParticipants,
  currentRound,
  totalRounds,
  currentRoundName,
  currentGameweek,
  userSeed,
  userStatus,
  eliminatedRound,
}: TournamentStatsProps) {
  const progressPercent = (remainingParticipants / totalParticipants) * 100;
  const roundsRemaining = totalRounds - currentRound;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4" />
          Tournament Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Teams Remaining */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Teams Remaining</span>
            <span className="font-bold">
              {remainingParticipants.toLocaleString()} / {totalParticipants.toLocaleString()}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Current Round */}
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground mb-1">Current Round</p>
          <p className="font-bold">{currentRoundName}</p>
          <p className="text-sm text-muted-foreground">
            GW{currentGameweek} • {roundsRemaining} rounds remaining
          </p>
        </div>

        {/* Your Status */}
        {userStatus && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-2">Your Status</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Seed */}
              {userSeed && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Seed</p>
                  <p className="font-bold">#{userSeed.toLocaleString()}</p>
                </div>
              )}

              {/* Status */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                <div className="flex items-center gap-1.5">
                  {userStatus === 'in' && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="font-bold">Active</span>
                    </>
                  )}
                  {userStatus === 'eliminated' && (
                    <span className="font-bold text-muted-foreground">
                      Eliminated R{eliminatedRound}
                    </span>
                  )}
                  {userStatus === 'winner' && (
                    <Badge variant="default" className="font-bold">
                      Champion
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/tournament/TournamentStats.test.tsx`
Expected: All tests pass

**Step 5: Commit**

```bash
git add src/components/tournament/TournamentStats.tsx src/components/tournament/TournamentStats.test.tsx
git commit -m "feat: add TournamentStats component"
```

---

### Task 3.2: Create PossibleOpponents Component

**Files:**
- Create: `src/components/tournament/PossibleOpponents.tsx`
- Create: `src/components/tournament/PossibleOpponents.test.tsx`

**Step 1: Write the failing test**

Create `src/components/tournament/PossibleOpponents.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PossibleOpponents } from './PossibleOpponents';

describe('PossibleOpponents', () => {
  const baseProps = {
    team1Name: 'KDB De Bruyne',
    team1Score: 62,
    team2Name: 'No Kane No Gain',
    team2Score: 41,
    matchType: 'live' as const,
    nextGameweek: 29,
  };

  it('renders section title', () => {
    render(<PossibleOpponents {...baseProps} />);

    expect(screen.getByText(/Possible Next Opponents/i)).toBeInTheDocument();
  });

  it('renders both team names', () => {
    render(<PossibleOpponents {...baseProps} />);

    expect(screen.getByText('KDB De Bruyne')).toBeInTheDocument();
    expect(screen.getByText('No Kane No Gain')).toBeInTheDocument();
  });

  it('renders scores for live matches', () => {
    render(<PossibleOpponents {...baseProps} matchType="live" />);

    expect(screen.getByText('62')).toBeInTheDocument();
    expect(screen.getByText('41')).toBeInTheDocument();
  });

  it('renders footer message with next gameweek', () => {
    render(<PossibleOpponents {...baseProps} />);

    expect(screen.getByText(/If you win, you'll face the winner in GW29/i)).toBeInTheDocument();
  });

  it('renders VS for upcoming matches', () => {
    render(<PossibleOpponents {...baseProps} matchType="upcoming" team1Score={null} team2Score={null} />);

    expect(screen.getByText('VS')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/tournament/PossibleOpponents.test.tsx`
Expected: FAIL - module not found

**Step 3: Write the implementation**

Create `src/components/tournament/PossibleOpponents.tsx`:

```tsx
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
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/tournament/PossibleOpponents.test.tsx`
Expected: All tests pass

**Step 5: Commit**

```bash
git add src/components/tournament/PossibleOpponents.tsx src/components/tournament/PossibleOpponents.test.tsx
git commit -m "feat: add PossibleOpponents component"
```

---

### Task 3.3: Add findSiblingMatch Helper

**Files:**
- Create: `src/lib/tournament-utils.ts`
- Create: `src/lib/tournament-utils.test.ts`

**Step 1: Write the failing test**

Create `src/lib/tournament-utils.test.ts`:

```tsx
import { describe, it, expect } from 'vitest';
import { findSiblingMatch, calculateRemainingParticipants, getUserStatus } from './tournament-utils';
import type { Tournament, Match, Round } from '@/types/tournament';

describe('tournament-utils', () => {
  describe('findSiblingMatch', () => {
    it('returns null when user match has no sibling (final)', () => {
      const rounds: Round[] = [
        {
          roundNumber: 1,
          name: 'Final',
          gameweek: 20,
          isComplete: false,
          matches: [{ id: 'final', player1: null, player2: null, winnerId: null, isBye: false }],
        },
      ];
      const userMatch: Match = { id: 'final', player1: null, player2: null, winnerId: null, isBye: false };

      const result = findSiblingMatch(rounds, userMatch, 1);

      expect(result).toBeNull();
    });

    it('finds sibling match in semi-finals', () => {
      const rounds: Round[] = [
        {
          roundNumber: 1,
          name: 'Semi-Finals',
          gameweek: 20,
          isComplete: false,
          matches: [
            { id: 'sf1', player1: { fplTeamId: 1, seed: 1, score: null }, player2: { fplTeamId: 4, seed: 4, score: null }, winnerId: null, isBye: false },
            { id: 'sf2', player1: { fplTeamId: 2, seed: 2, score: null }, player2: { fplTeamId: 3, seed: 3, score: null }, winnerId: null, isBye: false },
          ],
        },
        {
          roundNumber: 2,
          name: 'Final',
          gameweek: 21,
          isComplete: false,
          matches: [{ id: 'final', player1: null, player2: null, winnerId: null, isBye: false }],
        },
      ];
      const userMatch = rounds[0].matches[0]; // sf1

      const result = findSiblingMatch(rounds, userMatch, 1);

      expect(result).not.toBeNull();
      expect(result?.match.id).toBe('sf2');
      expect(result?.round.name).toBe('Semi-Finals');
    });
  });

  describe('calculateRemainingParticipants', () => {
    it('counts participants not eliminated', () => {
      const rounds: Round[] = [
        {
          roundNumber: 1,
          name: 'Round 1',
          gameweek: 20,
          isComplete: true,
          matches: [
            { id: 'm1', player1: { fplTeamId: 1, seed: 1, score: 50 }, player2: { fplTeamId: 2, seed: 2, score: 40 }, winnerId: 1, isBye: false },
            { id: 'm2', player1: { fplTeamId: 3, seed: 3, score: 60 }, player2: { fplTeamId: 4, seed: 4, score: 55 }, winnerId: 3, isBye: false },
          ],
        },
      ];

      const result = calculateRemainingParticipants(rounds);

      expect(result).toBe(2); // Teams 1 and 3 remain
    });
  });

  describe('getUserStatus', () => {
    it('returns in when user has no losses', () => {
      const result = getUserStatus(undefined, false);
      expect(result).toBe('in');
    });

    it('returns eliminated with round when user lost', () => {
      const result = getUserStatus(3, false);
      expect(result).toBe('eliminated');
    });

    it('returns winner when tournament complete and user not eliminated', () => {
      const result = getUserStatus(undefined, true);
      expect(result).toBe('winner');
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/lib/tournament-utils.test.ts`
Expected: FAIL - module not found

**Step 3: Write the implementation**

Create `src/lib/tournament-utils.ts`:

```tsx
import type { Round, Match } from '@/types/tournament';
import { getMatchPlayers } from '@/types/tournament';

/**
 * Find the sibling match that feeds into the same next-round match.
 * Uses bracket position math: matches at positions 2n and 2n+1 feed into position n.
 */
export function findSiblingMatch(
  rounds: Round[],
  userMatch: Match,
  userRoundNumber: number
): { match: Match; round: Round } | null {
  const userRound = rounds.find((r) => r.roundNumber === userRoundNumber);
  if (!userRound) return null;

  // Find position of user's match in current round
  const userMatchIndex = userRound.matches.findIndex((m) => m.id === userMatch.id);
  if (userMatchIndex === -1) return null;

  // In a standard bracket:
  // - Matches at positions 0,1 feed into next round position 0
  // - Matches at positions 2,3 feed into next round position 1
  // - etc.
  // So sibling is at: even index -> index+1, odd index -> index-1
  const siblingIndex = userMatchIndex % 2 === 0 ? userMatchIndex + 1 : userMatchIndex - 1;

  // Check if sibling exists
  if (siblingIndex < 0 || siblingIndex >= userRound.matches.length) {
    return null; // No sibling (e.g., in final)
  }

  const siblingMatch = userRound.matches[siblingIndex];
  return { match: siblingMatch, round: userRound };
}

/**
 * Calculate how many participants are still in the tournament.
 * A participant is "out" if they lost a match (winnerId exists and isn't them).
 */
export function calculateRemainingParticipants(rounds: Round[]): number {
  const eliminatedTeams = new Set<number>();

  for (const round of rounds) {
    for (const match of round.matches) {
      if (!match.winnerId || match.isBye) continue;

      const players = getMatchPlayers(match);
      for (const player of players) {
        if (player.fplTeamId !== match.winnerId) {
          eliminatedTeams.add(player.fplTeamId);
        }
      }
    }
  }

  // Count unique participants
  const allParticipants = new Set<number>();
  for (const round of rounds) {
    for (const match of round.matches) {
      const players = getMatchPlayers(match);
      for (const player of players) {
        allParticipants.add(player.fplTeamId);
      }
    }
  }

  return allParticipants.size - eliminatedTeams.size;
}

/**
 * Get user's tournament status.
 */
export function getUserStatus(
  eliminatedRound: number | undefined,
  tournamentComplete: boolean
): 'in' | 'eliminated' | 'winner' {
  if (eliminatedRound !== undefined) {
    return 'eliminated';
  }
  if (tournamentComplete) {
    return 'winner';
  }
  return 'in';
}

/**
 * Find what round a user was eliminated in (if any).
 */
export function findEliminatedRound(
  rounds: Round[],
  userFplTeamId: number
): number | undefined {
  for (const round of rounds) {
    for (const match of round.matches) {
      if (!match.winnerId || match.isBye) continue;

      const players = getMatchPlayers(match);
      const userPlayer = players.find((p) => p.fplTeamId === userFplTeamId);

      if (userPlayer && match.winnerId !== userFplTeamId) {
        return round.roundNumber;
      }
    }
  }
  return undefined;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/lib/tournament-utils.test.ts`
Expected: All tests pass

**Step 5: Commit**

```bash
git add src/lib/tournament-utils.ts src/lib/tournament-utils.test.ts
git commit -m "feat: add tournament utility functions"
```

---

### Task 3.4: Wire Up Phase 3 Components to OverviewTab

**Files:**
- Modify: `src/components/tournament/tabs/OverviewTab.tsx`

**Step 1: Update OverviewTab with TournamentStats and PossibleOpponents**

Replace `src/components/tournament/tabs/OverviewTab.tsx` with the full implementation:

```tsx
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { YourMatchesSection } from '@/components/dashboard/YourMatchesSection';
import { YourMatchupCard } from '../YourMatchupCard';
import { TournamentStats } from '../TournamentStats';
import { PossibleOpponents } from '../PossibleOpponents';
import type { Tournament, Participant } from '@/types/tournament';
import type { MatchSummaryCardProps } from '@/components/dashboard/MatchSummaryCard';
import { getMatchPlayers } from '@/types/tournament';
import {
  findSiblingMatch,
  calculateRemainingParticipants,
  getUserStatus,
  findEliminatedRound,
} from '@/lib/tournament-utils';

interface OverviewTabProps {
  tournament: Tournament;
  userFplTeamId?: number | null;
  userMatches: MatchSummaryCardProps[];
  userParticipant?: Participant | null;
}

export function OverviewTab({
  tournament,
  userFplTeamId,
  userMatches,
  userParticipant,
}: OverviewTabProps) {
  // Find user's current/latest match
  const currentMatchData = useMemo(() => {
    if (!userFplTeamId) return null;

    // Find the latest round where user has a match
    for (let i = tournament.rounds.length - 1; i >= 0; i--) {
      const round = tournament.rounds[i];
      for (const match of round.matches) {
        const players = getMatchPlayers(match);
        if (players.some((p) => p.fplTeamId === userFplTeamId)) {
          return { match, round };
        }
      }
    }
    return null;
  }, [tournament.rounds, userFplTeamId]);

  // Prepare matchup card props
  const matchupProps = useMemo(() => {
    if (!currentMatchData || !userParticipant) return null;

    const { match, round } = currentMatchData;
    const players = getMatchPlayers(match);
    const yourPlayer = players.find((p) => p.fplTeamId === userFplTeamId);
    const opponent = players.find((p) => p.fplTeamId !== userFplTeamId);

    if (!yourPlayer) return null;

    const roundStarted = round.gameweek <= tournament.currentGameweek;
    const isComplete = round.isComplete;

    let matchType: 'live' | 'upcoming' | 'finished';
    let result: 'won' | 'lost' | undefined;

    if (isComplete && match.winnerId) {
      matchType = 'finished';
      result = match.winnerId === userFplTeamId ? 'won' : 'lost';
    } else if (roundStarted) {
      matchType = 'live';
    } else {
      matchType = 'upcoming';
    }

    const opponentParticipant = opponent
      ? tournament.participants.find((p) => p.fplTeamId === opponent.fplTeamId)
      : null;

    return {
      roundName: round.name,
      gameweek: round.gameweek,
      yourTeamName: userParticipant.fplTeamName,
      yourManagerName: userParticipant.managerName,
      yourSeed: userParticipant.seed,
      yourScore: yourPlayer.score,
      opponentTeamName: opponentParticipant?.fplTeamName,
      opponentManagerName: opponentParticipant?.managerName,
      opponentSeed: opponentParticipant?.seed,
      opponentScore: opponent?.score ?? null,
      matchType,
      result,
    };
  }, [currentMatchData, userParticipant, userFplTeamId, tournament]);

  // Calculate tournament stats
  const statsProps = useMemo(() => {
    const remainingParticipants = calculateRemainingParticipants(tournament.rounds);
    const currentRound = tournament.rounds.find(
      (r) => r.roundNumber === tournament.currentRound
    );

    const eliminatedRound = userFplTeamId
      ? findEliminatedRound(tournament.rounds, userFplTeamId)
      : undefined;

    const userStatus = userParticipant
      ? getUserStatus(eliminatedRound, tournament.status === 'completed')
      : null;

    return {
      totalParticipants: tournament.participants.length,
      remainingParticipants,
      currentRound: tournament.currentRound,
      totalRounds: tournament.totalRounds,
      currentRoundName: currentRound?.name ?? `Round ${tournament.currentRound}`,
      currentGameweek: tournament.currentGameweek,
      userSeed: userParticipant?.seed,
      userStatus,
      eliminatedRound,
    };
  }, [tournament, userParticipant, userFplTeamId]);

  // Find possible next opponents
  const possibleOpponentsProps = useMemo(() => {
    if (!currentMatchData || !userFplTeamId) return null;

    const siblingData = findSiblingMatch(
      tournament.rounds,
      currentMatchData.match,
      currentMatchData.round.roundNumber
    );

    if (!siblingData) return null;

    const { match: siblingMatch, round: siblingRound } = siblingData;
    const players = getMatchPlayers(siblingMatch);

    if (players.length < 2) return null;

    const team1 = tournament.participants.find((p) => p.fplTeamId === players[0]?.fplTeamId);
    const team2 = tournament.participants.find((p) => p.fplTeamId === players[1]?.fplTeamId);

    if (!team1 || !team2) return null;

    const roundStarted = siblingRound.gameweek <= tournament.currentGameweek;
    const isComplete = siblingRound.isComplete;

    let matchType: 'live' | 'upcoming' | 'finished';
    if (isComplete && siblingMatch.winnerId) {
      matchType = 'finished';
    } else if (roundStarted) {
      matchType = 'live';
    } else {
      matchType = 'upcoming';
    }

    return {
      team1Name: team1.fplTeamName,
      team1Score: players[0]?.score ?? null,
      team1Id: team1.fplTeamId,
      team2Name: team2.fplTeamName,
      team2Score: players[1]?.score ?? null,
      team2Id: team2.fplTeamId,
      matchType,
      nextGameweek: siblingRound.gameweek + 1,
      winnerId: siblingMatch.winnerId ?? undefined,
    };
  }, [currentMatchData, tournament, userFplTeamId]);

  const hasMatchHistory = userMatches.length > 0;
  const isParticipant = !!userParticipant;

  return (
    <div className="space-y-6">
      {/* Grid layout: 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Your Matchup Card - 2/3 width */}
        <div className="lg:col-span-2">
          {isParticipant && matchupProps ? (
            <YourMatchupCard {...matchupProps} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Match</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {isParticipant
                    ? 'No current match found.'
                    : 'Connect your FPL team to see your match.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tournament Stats - 1/3 width */}
        <div>
          <TournamentStats {...statsProps} />
        </div>
      </div>

      {/* Second row: Friends + Possible Opponents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Friends Activity placeholder - 2/3 width */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Friends Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming in Phase 4...</p>
            </CardContent>
          </Card>
        </div>

        {/* Possible Opponents - 1/3 width */}
        <div className="order-1 lg:order-2">
          {possibleOpponentsProps ? (
            <PossibleOpponents {...possibleOpponentsProps} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Possible Next Opponents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {!isParticipant
                    ? 'Connect your FPL team to see potential opponents.'
                    : 'You\'re in the final - no next opponent!'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Match History - full width */}
      {hasMatchHistory && (
        <Card>
          <CardHeader>
            <CardTitle>Your Match History</CardTitle>
          </CardHeader>
          <CardContent>
            <YourMatchesSection
              matches={userMatches}
              currentGameweek={tournament.currentGameweek}
              isLive={userMatches.some((m) => m.type === 'live')}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

**Step 2: Run all tests**

Run: `npm test -- --run`
Expected: All tests pass

**Step 3: Commit**

```bash
git add src/components/tournament/tabs/OverviewTab.tsx
git commit -m "feat: integrate TournamentStats and PossibleOpponents into OverviewTab"
```

---

### Task 3.5: Final Integration Test

**Step 1: Run full test suite**

Run: `npm test -- --run`
Expected: All tests pass

**Step 2: Manual verification (optional)**

Run: `npm run dev`

Navigate to a tournament page, verify:
- [ ] Four tabs appear (Overview, Matches, Participants, Bracket)
- [ ] Overview tab shows Your Matchup card (if participant)
- [ ] Tournament Stats shows correct numbers
- [ ] Possible Opponents shows sibling match (if not in final)
- [ ] Match History shows past matches
- [ ] Tab switching works
- [ ] URL updates with `?tab=` parameter

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Overview tab implementation (Phase 1-3)"
```

---

## Summary

**Files Created:**
- `src/components/ui/tabs.tsx` (via shadcn)
- `src/components/tournament/tabs/OverviewTab.tsx`
- `src/components/tournament/tabs/MatchesTab.tsx`
- `src/components/tournament/tabs/ParticipantsTab.tsx`
- `src/components/tournament/tabs/BracketTab.tsx`
- `src/components/tournament/tabs/index.ts`
- `src/components/tournament/TournamentView.tsx`
- `src/components/tournament/TournamentView.test.tsx`
- `src/components/tournament/YourMatchupCard.tsx`
- `src/components/tournament/YourMatchupCard.test.tsx`
- `src/components/tournament/TournamentStats.tsx`
- `src/components/tournament/TournamentStats.test.tsx`
- `src/components/tournament/PossibleOpponents.tsx`
- `src/components/tournament/PossibleOpponents.test.tsx`
- `src/lib/tournament-utils.ts`
- `src/lib/tournament-utils.test.ts`

**Files Modified:**
- `src/pages/LeaguePage.tsx` (import change)

**Phase 4 (Future):**
- Friends Activity component
- FPL API integration for shared leagues
