# Bracket Tab 5-Round Cap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Cap the bracket view at 5 rounds for large tournaments, with a prompt to view earlier rounds in the Matches tab.

**Architecture:** Update `BracketTab` to slice rounds array to last 5, add an info banner when rounds are hidden that links to Matches tab, remove `UserPathBracket` component entirely.

**Tech Stack:** React, TypeScript, react-router-dom (useSearchParams), shadcn/ui (Button)

---

## Task 1: Add getVisibleRounds Helper

**Files:**
- Modify: `src/components/tournament/tabs/BracketTab.tsx`
- Test: `src/components/tournament/tabs/BracketTab.test.tsx`

**Step 1: Write the failing test for getVisibleRounds**

Add to `BracketTab.test.tsx`:

```typescript
import { getVisibleRounds } from './BracketTab';
import type { Round } from '@/types/tournament';

// Helper to create mock rounds
function createMockRounds(count: number): Round[] {
  return Array.from({ length: count }, (_, i) => ({
    roundNumber: i + 1,
    name: `Round ${i + 1}`,
    gameweek: 20 + i,
    matches: [],
    isComplete: false,
  }));
}

describe('getVisibleRounds', () => {
  it('returns all rounds when 5 or fewer', () => {
    const rounds = createMockRounds(3);
    const result = getVisibleRounds(rounds);

    expect(result.visibleRounds).toHaveLength(3);
    expect(result.hiddenCount).toBe(0);
  });

  it('returns last 5 rounds when more than 5', () => {
    const rounds = createMockRounds(10);
    const result = getVisibleRounds(rounds);

    expect(result.visibleRounds).toHaveLength(5);
    expect(result.visibleRounds[0].roundNumber).toBe(6);
    expect(result.visibleRounds[4].roundNumber).toBe(10);
    expect(result.hiddenCount).toBe(5);
  });

  it('returns exactly 5 rounds when exactly 5', () => {
    const rounds = createMockRounds(5);
    const result = getVisibleRounds(rounds);

    expect(result.visibleRounds).toHaveLength(5);
    expect(result.hiddenCount).toBe(0);
  });

  it('handles 15 rounds (large tournament)', () => {
    const rounds = createMockRounds(15);
    const result = getVisibleRounds(rounds);

    expect(result.visibleRounds).toHaveLength(5);
    expect(result.visibleRounds[0].roundNumber).toBe(11);
    expect(result.hiddenCount).toBe(10);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/tournament/tabs/BracketTab.test.tsx`

Expected: FAIL with "getVisibleRounds is not exported" or similar

**Step 3: Implement getVisibleRounds**

Add at top of `BracketTab.tsx` (after imports):

```typescript
import type { Round } from '@/types/tournament';

const MAX_BRACKET_ROUNDS = 5;

export function getVisibleRounds(rounds: Round[]): {
  visibleRounds: Round[];
  hiddenCount: number;
} {
  if (rounds.length <= MAX_BRACKET_ROUNDS) {
    return { visibleRounds: rounds, hiddenCount: 0 };
  }

  const startIndex = rounds.length - MAX_BRACKET_ROUNDS;
  return {
    visibleRounds: rounds.slice(startIndex),
    hiddenCount: startIndex,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/tournament/tabs/BracketTab.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/tournament/tabs/BracketTab.tsx src/components/tournament/tabs/BracketTab.test.tsx
git commit -m "feat(bracket): add getVisibleRounds helper for 5-round cap"
```

---

## Task 2: Add EarlierRoundsPrompt Component

**Files:**
- Modify: `src/components/tournament/tabs/BracketTab.tsx`
- Modify: `src/components/tournament/tabs/BracketTab.test.tsx`

**Step 1: Write the failing test for EarlierRoundsPrompt**

Add to `BracketTab.test.tsx`:

```typescript
import { EarlierRoundsPrompt } from './BracketTab';

describe('EarlierRoundsPrompt', () => {
  it('renders correct singular text for 1 hidden round', () => {
    const onViewMatches = vi.fn();
    render(<EarlierRoundsPrompt hiddenCount={1} onViewMatches={onViewMatches} />);

    expect(screen.getByText(/1 earlier round available/)).toBeInTheDocument();
  });

  it('renders correct plural text for multiple hidden rounds', () => {
    const onViewMatches = vi.fn();
    render(<EarlierRoundsPrompt hiddenCount={10} onViewMatches={onViewMatches} />);

    expect(screen.getByText(/10 earlier rounds available/)).toBeInTheDocument();
  });

  it('calls onViewMatches when button clicked', async () => {
    const onViewMatches = vi.fn();
    const user = userEvent.setup();
    render(<EarlierRoundsPrompt hiddenCount={5} onViewMatches={onViewMatches} />);

    await user.click(screen.getByRole('button', { name: /View Matches/i }));

    expect(onViewMatches).toHaveBeenCalledTimes(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/tournament/tabs/BracketTab.test.tsx`

Expected: FAIL with "EarlierRoundsPrompt is not exported"

**Step 3: Implement EarlierRoundsPrompt**

Add to `BracketTab.tsx` (after getVisibleRounds):

```typescript
import { Button } from '@/components/ui/button';

interface EarlierRoundsPromptProps {
  hiddenCount: number;
  onViewMatches: () => void;
}

export function EarlierRoundsPrompt({
  hiddenCount,
  onViewMatches,
}: EarlierRoundsPromptProps) {
  const roundWord = hiddenCount === 1 ? 'round' : 'rounds';

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/50 px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Showing final 5 rounds. {hiddenCount} earlier {roundWord} available in
        the Matches tab.
      </p>
      <Button variant="outline" size="sm" onClick={onViewMatches}>
        View Matches →
      </Button>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/tournament/tabs/BracketTab.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/tournament/tabs/BracketTab.tsx src/components/tournament/tabs/BracketTab.test.tsx
git commit -m "feat(bracket): add EarlierRoundsPrompt component"
```

---

## Task 3: Update BracketTab to Use Round Slicing

**Files:**
- Modify: `src/components/tournament/tabs/BracketTab.tsx`
- Modify: `src/components/tournament/tabs/BracketTab.test.tsx`

**Step 1: Write the failing integration test**

Add to `BracketTab.test.tsx`:

```typescript
import { MemoryRouter } from 'react-router-dom';
import { BracketTab } from './BracketTab';
import type { Tournament } from '@/types/tournament';

// Helper to create a tournament with N rounds
function createTournamentWithRounds(roundCount: number): Tournament {
  return {
    id: 'test-tournament',
    fplLeagueId: 123,
    fplLeagueName: 'Test League',
    creatorUserId: 'user1',
    startGameweek: 20,
    currentRound: 1,
    currentGameweek: 20,
    totalRounds: roundCount,
    status: 'active',
    participants: [],
    rounds: createMockRounds(roundCount),
    winnerId: null,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };
}

describe('BracketTab integration', () => {
  it('shows all rounds when 5 or fewer', () => {
    const tournament = createTournamentWithRounds(3);

    render(
      <MemoryRouter>
        <BracketTab tournament={tournament} />
      </MemoryRouter>
    );

    expect(screen.queryByText(/earlier rounds/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('bracket-layout')).toBeInTheDocument();
  });

  it('shows prompt and only last 5 rounds when more than 5', () => {
    const tournament = createTournamentWithRounds(10);

    render(
      <MemoryRouter>
        <BracketTab tournament={tournament} />
      </MemoryRouter>
    );

    expect(screen.getByText(/5 earlier rounds available/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Matches/i })).toBeInTheDocument();
  });

  it('navigates to matches tab when button clicked', async () => {
    const tournament = createTournamentWithRounds(10);
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/?tab=bracket']}>
        <BracketTab tournament={tournament} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /View Matches/i }));

    // The URL should now have tab=matches
    // Note: In real test, verify via useSearchParams or location
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/tournament/tabs/BracketTab.test.tsx`

Expected: FAIL (BracketTab doesn't use slicing yet)

**Step 3: Update BracketTab implementation**

Replace entire `BracketTab.tsx` content:

```typescript
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BracketLayout } from '../BracketLayout';
import type { Tournament, Round } from '@/types/tournament';

const MAX_BRACKET_ROUNDS = 5;

export function getVisibleRounds(rounds: Round[]): {
  visibleRounds: Round[];
  hiddenCount: number;
} {
  if (rounds.length <= MAX_BRACKET_ROUNDS) {
    return { visibleRounds: rounds, hiddenCount: 0 };
  }

  const startIndex = rounds.length - MAX_BRACKET_ROUNDS;
  return {
    visibleRounds: rounds.slice(startIndex),
    hiddenCount: startIndex,
  };
}

interface EarlierRoundsPromptProps {
  hiddenCount: number;
  onViewMatches: () => void;
}

export function EarlierRoundsPrompt({
  hiddenCount,
  onViewMatches,
}: EarlierRoundsPromptProps) {
  const roundWord = hiddenCount === 1 ? 'round' : 'rounds';

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/50 px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Showing final 5 rounds. {hiddenCount} earlier {roundWord} available in
        the Matches tab.
      </p>
      <Button variant="outline" size="sm" onClick={onViewMatches}>
        View Matches →
      </Button>
    </div>
  );
}

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
  const [, setSearchParams] = useSearchParams();

  if (tournament.rounds.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Bracket will appear when the tournament starts.
      </p>
    );
  }

  const { visibleRounds, hiddenCount } = getVisibleRounds(tournament.rounds);

  const handleViewMatches = () => {
    setSearchParams({ tab: 'matches' }, { replace: true });
  };

  return (
    <div className="space-y-4">
      {hiddenCount > 0 && (
        <EarlierRoundsPrompt
          hiddenCount={hiddenCount}
          onViewMatches={handleViewMatches}
        />
      )}

      <BracketLayout
        rounds={visibleRounds}
        participants={tournament.participants}
        currentGameweek={tournament.currentGameweek}
        isAuthenticated={isAuthenticated}
        onClaimTeam={onClaimTeam}
      />
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/tournament/tabs/BracketTab.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/tournament/tabs/BracketTab.tsx src/components/tournament/tabs/BracketTab.test.tsx
git commit -m "feat(bracket): integrate 5-round cap with EarlierRoundsPrompt"
```

---

## Task 4: Remove UserPathBracket

**Files:**
- Delete: `src/components/tournament/UserPathBracket.tsx`
- Verify: No other files import it

**Step 1: Check for other usages**

Run: `grep -r "UserPathBracket" src/`

Expected: Only `BracketTab.tsx` (which we already updated)

**Step 2: Delete UserPathBracket.tsx**

```bash
rm src/components/tournament/UserPathBracket.tsx
```

**Step 3: Verify build still works**

Run: `npm run build`

Expected: Build succeeds

**Step 4: Run all tests**

Run: `npm test -- --run`

Expected: All tests pass

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(bracket): remove UserPathBracket component

No longer needed - BracketTab now always uses BracketLayout with 5-round cap."
```

---

## Task 5: Update Existing BracketTab Tests

**Files:**
- Modify: `src/components/tournament/tabs/BracketTab.test.tsx`

**Step 1: Review existing tests**

Check if any existing tests relied on UserPathBracket behavior (>64 participants triggering different view).

**Step 2: Update or remove obsolete tests**

If tests exist for "large tournament shows UserPathBracket", update them to verify the new behavior (shows last 5 rounds with prompt instead).

**Step 3: Run tests**

Run: `npm test -- --run src/components/tournament/tabs/BracketTab.test.tsx`

Expected: PASS

**Step 4: Commit**

```bash
git add src/components/tournament/tabs/BracketTab.test.tsx
git commit -m "test(bracket): update tests for 5-round cap behavior"
```

---

## Task 6: Manual E2E Verification

**Files:** None (verification only)

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Navigate to a tournament with >5 rounds**

If no such tournament exists in dev data, create one or mock it.

**Step 3: Verify behavior**

- [ ] Prompt shows with correct hidden count
- [ ] "View Matches →" button navigates to Matches tab
- [ ] Only last 5 rounds visible in bracket
- [ ] Small tournaments (≤5 rounds) show no prompt

**Step 4: Check console**

Use Playwright MCP: `mcp__playwright__browser_console_messages({ level: 'error' })`

Expected: No errors

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Add getVisibleRounds helper | 5 min |
| 2 | Add EarlierRoundsPrompt component | 5 min |
| 3 | Update BracketTab to use slicing | 10 min |
| 4 | Remove UserPathBracket | 5 min |
| 5 | Update existing tests | 5 min |
| 6 | Manual E2E verification | 5 min |
