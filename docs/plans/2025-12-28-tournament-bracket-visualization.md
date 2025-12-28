# Tournament Bracket Visualization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a visual bracket tree layout showing tournament progression from Round 1 to Final, with match cards and winner advancement lines.

**Architecture:** CSS Grid-based bracket layout with connector lines. Each round is a column, matches within rounds are rows. Connector lines drawn with CSS borders/pseudo-elements. Responsive: horizontal bracket on desktop, stacked rounds on mobile.

**Tech Stack:** React, Tailwind CSS, shadcn/ui components, existing tournament types

---

## Context

**Current State:**
- `BracketView.tsx` renders tournament header + rounds as vertical list
- `RoundSection.tsx` renders round header + match cards vertically
- `MatchCard.tsx` renders individual match with player names/scores
- `bracket.ts` has logic for generating brackets, determining winners
- Tournament data loaded via `getTournamentByLeague()` from Firestore

**Screenshot of current view:**
- Shows only Card header: "Change Name" with Active badge
- "Starting Gameweek 1 • 4 rounds" subtitle
- No actual bracket visualization appears (rounds/matches not rendering)

**Target State:**
- Horizontal bracket tree: Round 1 → Round 2 → Semi-Finals → Final
- Connector lines showing which match winners advance where
- Visual highlighting for completed matches, current round, winners
- Mobile: stacked rounds with clear progression

**Reference design:** Standard NCAA/March Madness bracket layout

---

## Task 1: Fix Missing Bracket Data (Debug)

**Files:**
- Investigate: `src/pages/LeaguePage.tsx`
- Investigate: Browser DevTools Network tab

**Step 1: Check why rounds aren't rendering**

The screenshot shows the Card header but no rounds. Either:
a) `tournament.rounds` is empty array
b) RoundSection rendering is broken
c) Data not loading correctly

Open browser DevTools, check React DevTools for `BracketView` props.

**Step 2: Add console.log to BracketView**

Temporarily add to `BracketView.tsx`:
```typescript
export function BracketView({ tournament }: BracketViewProps) {
  console.log('BracketView tournament:', tournament);
  console.log('BracketView rounds:', tournament.rounds);
```

**Step 3: Verify data in browser console**

Run: `npm run dev`
Navigate to bracket page
Check console for tournament data structure

**Step 4: Remove debug logs**

Remove the console.log statements after debugging.

**Step 5: Commit if fix found**

```bash
git add src/components/tournament/BracketView.tsx
git commit -m "fix: debug bracket rendering issue"
```

---

## Task 2: Create Bracket Layout Component

**Files:**
- Create: `src/components/tournament/BracketLayout.tsx`
- Test: `src/components/tournament/BracketLayout.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/components/tournament/BracketLayout.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BracketLayout } from './BracketLayout';
import type { Round, Participant } from '../../types/tournament';

describe('BracketLayout', () => {
  const mockParticipants: Participant[] = [
    { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Manager A', seed: 1 },
    { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Manager B', seed: 2 },
    { fplTeamId: 3, fplTeamName: 'Team C', managerName: 'Manager C', seed: 3 },
    { fplTeamId: 4, fplTeamName: 'Team D', managerName: 'Manager D', seed: 4 },
  ];

  const mockRounds: Round[] = [
    {
      roundNumber: 1,
      name: 'Semi-Finals',
      gameweek: 20,
      isComplete: false,
      matches: [
        { id: 'r1-m1', player1: { fplTeamId: 1, seed: 1, score: null }, player2: { fplTeamId: 4, seed: 4, score: null }, winnerId: null, isBye: false },
        { id: 'r1-m2', player1: { fplTeamId: 2, seed: 2, score: null }, player2: { fplTeamId: 3, seed: 3, score: null }, winnerId: null, isBye: false },
      ],
    },
    {
      roundNumber: 2,
      name: 'Final',
      gameweek: 21,
      isComplete: false,
      matches: [
        { id: 'r2-m1', player1: null, player2: null, winnerId: null, isBye: false },
      ],
    },
  ];

  it('renders all rounds as columns', () => {
    render(<BracketLayout rounds={mockRounds} participants={mockParticipants} />);

    expect(screen.getByText('Semi-Finals')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });

  it('renders matches within each round', () => {
    render(<BracketLayout rounds={mockRounds} participants={mockParticipants} />);

    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
    expect(screen.getByText('Team C')).toBeInTheDocument();
    expect(screen.getByText('Team D')).toBeInTheDocument();
  });

  it('has horizontal layout on desktop', () => {
    render(<BracketLayout rounds={mockRounds} participants={mockParticipants} />);

    const container = screen.getByTestId('bracket-layout');
    expect(container).toHaveClass('md:grid-flow-col');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- BracketLayout`
Expected: FAIL with "Cannot find module './BracketLayout'"

**Step 3: Write minimal implementation**

```typescript
// src/components/tournament/BracketLayout.tsx
import type { Round, Participant } from '../../types/tournament';
import { BracketRound } from './BracketRound';

interface BracketLayoutProps {
  rounds: Round[];
  participants: Participant[];
}

export function BracketLayout({ rounds, participants }: BracketLayoutProps) {
  return (
    <div
      data-testid="bracket-layout"
      className="grid gap-4 md:grid-flow-col md:auto-cols-fr"
    >
      {rounds.map((round) => (
        <BracketRound
          key={round.roundNumber}
          round={round}
          participants={participants}
          totalRounds={rounds.length}
        />
      ))}
    </div>
  );
}
```

**Step 4: Run test to verify it fails (needs BracketRound)**

Run: `npm test -- BracketLayout`
Expected: FAIL with "Cannot find module './BracketRound'"

---

## Task 3: Create BracketRound Component

**Files:**
- Create: `src/components/tournament/BracketRound.tsx`
- Test: `src/components/tournament/BracketRound.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/components/tournament/BracketRound.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BracketRound } from './BracketRound';
import type { Round, Participant } from '../../types/tournament';

describe('BracketRound', () => {
  const mockParticipants: Participant[] = [
    { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Manager A', seed: 1 },
    { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Manager B', seed: 2 },
  ];

  const mockRound: Round = {
    roundNumber: 1,
    name: 'Final',
    gameweek: 20,
    isComplete: false,
    matches: [
      { id: 'r1-m1', player1: { fplTeamId: 1, seed: 1, score: null }, player2: { fplTeamId: 2, seed: 2, score: null }, winnerId: null, isBye: false },
    ],
  };

  it('renders round name as header', () => {
    render(<BracketRound round={mockRound} participants={mockParticipants} totalRounds={1} />);

    expect(screen.getByRole('heading', { name: 'Final' })).toBeInTheDocument();
  });

  it('renders gameweek info', () => {
    render(<BracketRound round={mockRound} participants={mockParticipants} totalRounds={1} />);

    expect(screen.getByText('GW 20')).toBeInTheDocument();
  });

  it('renders all matches in the round', () => {
    render(<BracketRound round={mockRound} participants={mockParticipants} totalRounds={1} />);

    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
  });

  it('shows complete badge when round is complete', () => {
    const completeRound = { ...mockRound, isComplete: true };
    render(<BracketRound round={completeRound} participants={mockParticipants} totalRounds={1} />);

    expect(screen.getByText('Complete')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- BracketRound`
Expected: FAIL with "Cannot find module './BracketRound'"

**Step 3: Write minimal implementation**

```typescript
// src/components/tournament/BracketRound.tsx
import { Badge } from '../ui/badge';
import { BracketMatchCard } from './BracketMatchCard';
import type { Round, Participant } from '../../types/tournament';

interface BracketRoundProps {
  round: Round;
  participants: Participant[];
  totalRounds: number;
}

export function BracketRound({ round, participants, totalRounds }: BracketRoundProps) {
  return (
    <div className="flex flex-col" data-testid={`bracket-round-${round.roundNumber}`}>
      <div className="flex items-center justify-between mb-3 px-2">
        <div>
          <h3 className="text-sm font-semibold">{round.name}</h3>
          <span className="text-xs text-muted-foreground">GW {round.gameweek}</span>
        </div>
        {round.isComplete && (
          <Badge variant="secondary" className="text-xs">Complete</Badge>
        )}
      </div>

      <div className="flex flex-col justify-around flex-1 gap-2">
        {round.matches.map((match, index) => (
          <BracketMatchCard
            key={match.id}
            match={match}
            participants={participants}
            showConnector={round.roundNumber < totalRounds}
            isTopHalf={index % 2 === 0}
          />
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it fails (needs BracketMatchCard)**

Run: `npm test -- BracketRound`
Expected: FAIL with "Cannot find module './BracketMatchCard'"

---

## Task 4: Create BracketMatchCard Component

**Files:**
- Create: `src/components/tournament/BracketMatchCard.tsx`
- Test: `src/components/tournament/BracketMatchCard.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/components/tournament/BracketMatchCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BracketMatchCard } from './BracketMatchCard';
import type { Match, Participant } from '../../types/tournament';

describe('BracketMatchCard', () => {
  const mockParticipants: Participant[] = [
    { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Manager A', seed: 1 },
    { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Manager B', seed: 2 },
  ];

  const mockMatch: Match = {
    id: 'r1-m1',
    player1: { fplTeamId: 1, seed: 1, score: 65 },
    player2: { fplTeamId: 2, seed: 2, score: 58 },
    winnerId: 1,
    isBye: false,
  };

  it('renders both player names', () => {
    render(<BracketMatchCard match={mockMatch} participants={mockParticipants} />);

    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
  });

  it('renders seeds', () => {
    render(<BracketMatchCard match={mockMatch} participants={mockParticipants} />);

    expect(screen.getByText('(1)')).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('renders scores when available', () => {
    render(<BracketMatchCard match={mockMatch} participants={mockParticipants} />);

    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText('58')).toBeInTheDocument();
  });

  it('highlights winner', () => {
    render(<BracketMatchCard match={mockMatch} participants={mockParticipants} />);

    const winnerRow = screen.getByText('Team A').closest('[data-winner]');
    expect(winnerRow).toHaveAttribute('data-winner', 'true');
  });

  it('shows BYE for bye matches', () => {
    const byeMatch: Match = {
      id: 'r1-m1',
      player1: { fplTeamId: 1, seed: 1, score: null },
      player2: null,
      winnerId: 1,
      isBye: true,
    };
    render(<BracketMatchCard match={byeMatch} participants={mockParticipants} />);

    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('BYE')).toBeInTheDocument();
  });

  it('shows TBD for empty slots', () => {
    const emptyMatch: Match = {
      id: 'r2-m1',
      player1: null,
      player2: null,
      winnerId: null,
      isBye: false,
    };
    render(<BracketMatchCard match={emptyMatch} participants={mockParticipants} />);

    expect(screen.getAllByText('TBD')).toHaveLength(2);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- BracketMatchCard`
Expected: FAIL with "Cannot find module './BracketMatchCard'"

**Step 3: Write minimal implementation**

```typescript
// src/components/tournament/BracketMatchCard.tsx
import { Card } from '../ui/card';
import type { Match, Participant } from '../../types/tournament';
import { cn } from '../../lib/utils';

interface BracketMatchCardProps {
  match: Match;
  participants: Participant[];
  showConnector?: boolean;
  isTopHalf?: boolean;
}

export function BracketMatchCard({
  match,
  participants,
  showConnector = false,
  isTopHalf = true,
}: BracketMatchCardProps) {
  const getParticipant = (fplTeamId: number | null): Participant | null => {
    if (!fplTeamId) return null;
    return participants.find((p) => p.fplTeamId === fplTeamId) || null;
  };

  const player1 = match.player1 ? getParticipant(match.player1.fplTeamId) : null;
  const player2 = match.player2 ? getParticipant(match.player2.fplTeamId) : null;

  const renderPlayerSlot = (
    player: typeof match.player1,
    participant: Participant | null,
    isBye: boolean = false
  ) => {
    const isWinner = match.winnerId !== null && player?.fplTeamId === match.winnerId;
    const isLoser = match.winnerId !== null && player?.fplTeamId !== match.winnerId;

    if (!player && !isBye) {
      return (
        <div className="flex justify-between items-center px-2 py-1.5 text-muted-foreground text-sm">
          <span>TBD</span>
        </div>
      );
    }

    if (isBye && !player) {
      return (
        <div className="flex justify-between items-center px-2 py-1.5 text-muted-foreground text-sm">
          <span>BYE</span>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex justify-between items-center px-2 py-1.5 text-sm",
          isWinner && "font-semibold bg-green-50 dark:bg-green-950",
          isLoser && "opacity-50"
        )}
        data-winner={isWinner}
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="truncate">{participant?.fplTeamName || 'TBD'}</span>
          {participant && (
            <span className="text-muted-foreground text-xs">({participant.seed})</span>
          )}
        </div>
        {player?.score !== null && player?.score !== undefined && (
          <span className={cn("tabular-nums", isWinner && "text-green-600 dark:text-green-400")}>
            {player.score}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <Card className="w-44 overflow-hidden">
        {renderPlayerSlot(match.player1, player1)}
        <div className="border-t" />
        {match.isBye && !match.player2
          ? renderPlayerSlot(null, null, true)
          : renderPlayerSlot(match.player2, player2)
        }
      </Card>

      {showConnector && (
        <div
          className={cn(
            "absolute right-0 w-4 border-r-2 border-gray-300",
            isTopHalf ? "top-1/2 h-1/2 border-t-2" : "bottom-1/2 h-1/2 border-b-2"
          )}
          style={{ transform: 'translateX(100%)' }}
        />
      )}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- BracketMatchCard`
Expected: PASS

**Step 5: Run all bracket tests**

Run: `npm test -- Bracket`
Expected: All PASS

**Step 6: Commit**

```bash
git add src/components/tournament/BracketMatchCard.tsx src/components/tournament/BracketMatchCard.test.tsx
git commit -m "feat: add BracketMatchCard component with player slots and connectors"
```

---

## Task 5: Complete BracketRound Tests

**Files:**
- Modify: `src/components/tournament/BracketRound.test.tsx`

**Step 1: Run BracketRound tests now that BracketMatchCard exists**

Run: `npm test -- BracketRound`
Expected: PASS

**Step 2: Commit**

```bash
git add src/components/tournament/BracketRound.tsx src/components/tournament/BracketRound.test.tsx
git commit -m "feat: add BracketRound component for round column display"
```

---

## Task 6: Complete BracketLayout Tests

**Files:**
- Modify: `src/components/tournament/BracketLayout.test.tsx`

**Step 1: Run BracketLayout tests now that dependencies exist**

Run: `npm test -- BracketLayout`
Expected: PASS

**Step 2: Commit**

```bash
git add src/components/tournament/BracketLayout.tsx src/components/tournament/BracketLayout.test.tsx
git commit -m "feat: add BracketLayout component for horizontal bracket grid"
```

---

## Task 7: Update BracketView to Use New Layout

**Files:**
- Modify: `src/components/tournament/BracketView.tsx`
- Modify: `src/components/tournament/BracketView.test.tsx`

**Step 1: Update test to expect new structure**

```typescript
// Update BracketView.test.tsx to test BracketLayout integration
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BracketView } from './BracketView';
import type { Tournament } from '../../types/tournament';
import { Timestamp } from 'firebase/firestore';

describe('BracketView', () => {
  const mockTournament: Tournament = {
    id: 'tour-1',
    fplLeagueId: 123,
    fplLeagueName: 'Test League',
    creatorUserId: 'user-1',
    startGameweek: 20,
    currentRound: 1,
    totalRounds: 2,
    status: 'active',
    participants: [
      { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Manager A', seed: 1 },
      { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Manager B', seed: 2 },
      { fplTeamId: 3, fplTeamName: 'Team C', managerName: 'Manager C', seed: 3 },
      { fplTeamId: 4, fplTeamName: 'Team D', managerName: 'Manager D', seed: 4 },
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Semi-Finals',
        gameweek: 20,
        isComplete: false,
        matches: [
          { id: 'r1-m1', player1: { fplTeamId: 1, seed: 1, score: null }, player2: { fplTeamId: 4, seed: 4, score: null }, winnerId: null, isBye: false },
          { id: 'r1-m2', player1: { fplTeamId: 2, seed: 2, score: null }, player2: { fplTeamId: 3, seed: 3, score: null }, winnerId: null, isBye: false },
        ],
      },
      {
        roundNumber: 2,
        name: 'Final',
        gameweek: 21,
        isComplete: false,
        matches: [
          { id: 'r2-m1', player1: null, player2: null, winnerId: null, isBye: false },
        ],
      },
    ],
    winnerId: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  it('renders tournament header', () => {
    render(<BracketView tournament={mockTournament} />);

    expect(screen.getByText('Test League')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders bracket layout with all rounds', () => {
    render(<BracketView tournament={mockTournament} />);

    expect(screen.getByText('Semi-Finals')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });

  it('renders all participants in bracket', () => {
    render(<BracketView tournament={mockTournament} />);

    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
    expect(screen.getByText('Team C')).toBeInTheDocument();
    expect(screen.getByText('Team D')).toBeInTheDocument();
  });

  it('shows completed badge when tournament finished', () => {
    const completedTournament = { ...mockTournament, status: 'completed' as const };
    render(<BracketView tournament={completedTournament} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to see current state**

Run: `npm test -- BracketView`
Note: May pass or fail depending on current implementation

**Step 3: Update BracketView implementation**

```typescript
// src/components/tournament/BracketView.tsx
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BracketLayout } from './BracketLayout';
import type { Tournament } from '../../types/tournament';

interface BracketViewProps {
  tournament: Tournament;
}

export function BracketView({ tournament }: BracketViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{tournament.fplLeagueName}</CardTitle>
          <Badge variant={tournament.status === 'completed' ? 'secondary' : 'default'}>
            {tournament.status === 'completed' ? 'Completed' : 'Active'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Starting Gameweek {tournament.startGameweek} • {tournament.totalRounds} rounds
        </p>
      </CardHeader>
      <CardContent>
        {tournament.rounds.length > 0 ? (
          <BracketLayout
            rounds={tournament.rounds}
            participants={tournament.participants}
          />
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Bracket will appear when the tournament starts.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- BracketView`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/tournament/BracketView.tsx src/components/tournament/BracketView.test.tsx
git commit -m "refactor: BracketView uses new BracketLayout for horizontal display"
```

---

## Task 8: Add Connector Lines CSS

**Files:**
- Modify: `src/components/tournament/BracketLayout.tsx`
- Modify: `src/index.css`

**Step 1: Add bracket-specific CSS**

Add to `src/index.css`:
```css
/* Bracket connector lines */
.bracket-connector {
  position: relative;
}

.bracket-connector::after {
  content: '';
  position: absolute;
  right: -1rem;
  top: 50%;
  width: 1rem;
  height: 2px;
  background-color: hsl(var(--border));
}

.bracket-connector-top::before {
  content: '';
  position: absolute;
  right: -1rem;
  top: 50%;
  bottom: 0;
  width: 2px;
  background-color: hsl(var(--border));
}

.bracket-connector-bottom::before {
  content: '';
  position: absolute;
  right: -1rem;
  top: 0;
  bottom: 50%;
  width: 2px;
  background-color: hsl(var(--border));
}
```

**Step 2: Update BracketMatchCard to use CSS classes**

Replace the inline connector div with CSS class approach:
```typescript
// In BracketMatchCard.tsx, update the connector rendering
{showConnector && (
  <div
    className={cn(
      "bracket-connector",
      isTopHalf ? "bracket-connector-top" : "bracket-connector-bottom"
    )}
  />
)}
```

**Step 3: Run visual test in browser**

Run: `npm run dev`
Navigate to bracket page
Verify connector lines appear between rounds

**Step 4: Commit**

```bash
git add src/index.css src/components/tournament/BracketMatchCard.tsx
git commit -m "style: add CSS connector lines between bracket rounds"
```

---

## Task 9: Add Mobile Responsive Layout

**Files:**
- Modify: `src/components/tournament/BracketLayout.tsx`

**Step 1: Add test for mobile layout**

Add to BracketLayout.test.tsx:
```typescript
it('stacks vertically on mobile', () => {
  render(<BracketLayout rounds={mockRounds} participants={mockParticipants} />);

  const container = screen.getByTestId('bracket-layout');
  // Default (mobile) should be vertical, md: becomes horizontal
  expect(container).toHaveClass('flex-col');
  expect(container).toHaveClass('md:flex-row');
});
```

**Step 2: Update layout for responsive behavior**

```typescript
// src/components/tournament/BracketLayout.tsx
export function BracketLayout({ rounds, participants }: BracketLayoutProps) {
  return (
    <div
      data-testid="bracket-layout"
      className="flex flex-col gap-6 md:flex-row md:gap-4 md:overflow-x-auto"
    >
      {rounds.map((round) => (
        <BracketRound
          key={round.roundNumber}
          round={round}
          participants={participants}
          totalRounds={rounds.length}
        />
      ))}
    </div>
  );
}
```

**Step 3: Run tests**

Run: `npm test -- BracketLayout`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/tournament/BracketLayout.tsx src/components/tournament/BracketLayout.test.tsx
git commit -m "style: responsive bracket layout - vertical on mobile, horizontal on desktop"
```

---

## Task 10: E2E Verification with Playwright MCP

**Files:**
- None (manual testing)

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Navigate to bracket page**

Use Playwright MCP:
```
browser_navigate({ url: 'http://localhost:5174/league/29858' })
browser_snapshot()
```

**Step 3: Take screenshot of bracket**

```
browser_take_screenshot({ filename: 'bracket-final.png', fullPage: true })
```

**Step 4: Verify expected elements**

- Tournament header with league name
- Status badge (Active/Completed)
- Round columns (Semi-Finals, Final, etc.)
- Match cards with team names and seeds
- Connector lines between rounds (on desktop)

**Step 5: Check console for errors**

```
browser_console_messages({ level: 'error' })
```
Expected: No errors

**Step 6: Test mobile viewport**

```
browser_resize({ width: 375, height: 667 })
browser_snapshot()
```
Verify: Rounds stack vertically

---

## Summary

| Task | Description | Files Changed |
|------|-------------|---------------|
| 1 | Debug missing data | `BracketView.tsx` (temp logs) |
| 2 | BracketLayout component | `BracketLayout.tsx`, `.test.tsx` |
| 3 | BracketRound component | `BracketRound.tsx`, `.test.tsx` |
| 4 | BracketMatchCard component | `BracketMatchCard.tsx`, `.test.tsx` |
| 5 | Complete BracketRound tests | `BracketRound.test.tsx` |
| 6 | Complete BracketLayout tests | `BracketLayout.test.tsx` |
| 7 | Integrate into BracketView | `BracketView.tsx`, `.test.tsx` |
| 8 | Add connector CSS | `index.css`, `BracketMatchCard.tsx` |
| 9 | Mobile responsive | `BracketLayout.tsx` |
| 10 | E2E verification | Manual Playwright MCP |

**Total new files:** 6 (3 components + 3 test files)
**Total modified files:** 4 (BracketView, index.css)
