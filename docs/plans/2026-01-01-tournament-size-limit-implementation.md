# Tournament Size Limit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Limit tournaments to 48 managers max, showing a "locked" state for oversized leagues.

**Architecture:** Computed `isLocked` property based on `memberCount > 48`. No database changes. Frontend shows lock badge on cards and locked empty state on league page. Backend validates the same limit.

**Tech Stack:** React, TypeScript, Vitest, Firebase Cloud Functions

---

## Task 1: Add Tournament Constants

**Files:**
- Create: `src/constants/tournament.ts`

**Step 1: Create the constants file**

```typescript
// src/constants/tournament.ts
export const MAX_TOURNAMENT_PARTICIPANTS = 48;
```

**Step 2: Verify file exists**

Run: `cat src/constants/tournament.ts`
Expected: Shows the constant definition

**Step 3: Commit**

```bash
git add src/constants/tournament.ts
git commit -m "feat: add MAX_TOURNAMENT_PARTICIPANTS constant"
```

---

## Task 2: Update Backend Validation

**Files:**
- Modify: `functions/src/createTournament.ts:128`
- Modify: `functions/src/createTournament.test.ts:58-62`

**Step 1: Write the failing test**

In `functions/src/createTournament.test.ts`, update the test at line ~58:

```typescript
it('throws if more than 48 participants', () => {
  const results = Array(49).fill({});
  const standings = { standings: { results } };
  expect(() => validateLeagueStandings(standings)).toThrow('maximum 48');
});

it('passes with exactly 48 participants', () => {
  const results = Array(48).fill({});
  const standings = { standings: { results } };
  expect(() => validateLeagueStandings(standings)).not.toThrow();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run functions/src/createTournament.test.ts`
Expected: FAIL - "maximum 50" doesn't match "maximum 48"

**Step 3: Update the validation**

In `functions/src/createTournament.ts` at line ~128, change:

```typescript
if (count > 48) {
  throw new HttpsError('failed-precondition', 'League exceeds maximum 48 participants');
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run functions/src/createTournament.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/createTournament.ts functions/src/createTournament.test.ts
git commit -m "feat: reduce max tournament size from 50 to 48 participants"
```

---

## Task 3: Add Locked State to NoTournamentEmptyState

**Files:**
- Modify: `src/components/leagues/NoTournamentEmptyState.tsx`
- Modify: `src/components/leagues/NoTournamentEmptyState.test.tsx`

**Step 1: Write the failing tests**

Add to `src/components/leagues/NoTournamentEmptyState.test.tsx`:

```typescript
describe('locked state', () => {
  it('should show lock icon when isLocked is true', () => {
    renderComponent({ isLocked: true });
    expect(screen.getByText('lock')).toBeInTheDocument();
  });

  it('should show locked message when isLocked is true', () => {
    renderComponent({ isLocked: true });
    expect(screen.getByText('This league is too large for a tournament')).toBeInTheDocument();
  });

  it('should not show create button when isLocked is true', () => {
    renderComponent({ isLocked: true, isAuthenticated: true });
    expect(screen.queryByRole('button', { name: /create tournament/i })).not.toBeInTheDocument();
  });

  it('should not show How It Works section when isLocked is true', () => {
    renderComponent({ isLocked: true });
    expect(screen.queryByText('How it works')).not.toBeInTheDocument();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/components/leagues/NoTournamentEmptyState.test.tsx`
Expected: FAIL - isLocked prop doesn't exist

**Step 3: Implement the locked state**

Update `src/components/leagues/NoTournamentEmptyState.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { CreateTournamentButton } from '../tournament/CreateTournamentButton';

interface NoTournamentEmptyStateProps {
  leagueName: string;
  managerCount: number;
  isAuthenticated: boolean;
  onCreate: (startEvent: number) => Promise<void>;
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
            <CreateTournamentButton onCreate={onCreate} />
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
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/components/leagues/NoTournamentEmptyState.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/leagues/NoTournamentEmptyState.tsx src/components/leagues/NoTournamentEmptyState.test.tsx
git commit -m "feat: add locked state to NoTournamentEmptyState"
```

---

## Task 4: Update LeaguePage to Pass isLocked

**Files:**
- Modify: `src/pages/LeaguePage.tsx`
- Modify: `src/pages/LeaguePage.test.tsx`

**Step 1: Write the failing test**

Add to `src/pages/LeaguePage.test.tsx`:

```typescript
import { MAX_TOURNAMENT_PARTICIPANTS } from '../constants/tournament';

describe('locked leagues', () => {
  it('should pass isLocked=true when league exceeds max participants', async () => {
    vi.mocked(getTournamentByLeague).mockResolvedValue(null);
    vi.mocked(getLeagueInfo).mockResolvedValue({
      id: 123,
      name: 'Big League',
      memberCount: MAX_TOURNAMENT_PARTICIPANTS + 1,
    });

    render(
      <MemoryRouter initialEntries={['/league/123']}>
        <Routes>
          <Route path="/league/:leagueId" element={<LeaguePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('This league is too large for a tournament')).toBeInTheDocument();
    });
  });

  it('should pass isLocked=false when league is within limit', async () => {
    vi.mocked(getTournamentByLeague).mockResolvedValue(null);
    vi.mocked(getLeagueInfo).mockResolvedValue({
      id: 123,
      name: 'Small League',
      memberCount: MAX_TOURNAMENT_PARTICIPANTS,
    });

    render(
      <MemoryRouter initialEntries={['/league/123']}>
        <Routes>
          <Route path="/league/:leagueId" element={<LeaguePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No Tournament Yet')).toBeInTheDocument();
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/pages/LeaguePage.test.tsx`
Expected: FAIL - constant doesn't exist yet

**Step 3: Update LeaguePage**

In `src/pages/LeaguePage.tsx`, add the import and isLocked computation:

```tsx
// Add import at top
import { MAX_TOURNAMENT_PARTICIPANTS } from '../constants/tournament';

// In the component, before the return, compute isLocked:
const isLocked = leagueInfo ? leagueInfo.memberCount > MAX_TOURNAMENT_PARTICIPANTS : false;

// Update the NoTournamentEmptyState usage:
<NoTournamentEmptyState
  leagueName={leagueInfo.name}
  managerCount={leagueInfo.memberCount}
  isAuthenticated={!!user}
  onCreate={handleCreateTournament}
  isLocked={isLocked}
/>
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/pages/LeaguePage.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/pages/LeaguePage.tsx src/pages/LeaguePage.test.tsx
git commit -m "feat: pass isLocked prop to NoTournamentEmptyState"
```

---

## Task 5: Add Lock Badge to LeagueCard

**Files:**
- Modify: `src/components/leagues/LeagueCard.tsx`
- Modify: `src/components/leagues/LeagueCard.test.tsx`

**Step 1: Write the failing tests**

Add to `src/components/leagues/LeagueCard.test.tsx`:

```typescript
describe('locked state', () => {
  it('should show lock icon when isLocked is true', () => {
    render(<LeagueCard league={mockLeague} onClick={() => {}} isLocked={true} />);
    expect(screen.getByText('lock')).toBeInTheDocument();
  });

  it('should not show lock icon when isLocked is false', () => {
    render(<LeagueCard league={mockLeague} onClick={() => {}} isLocked={false} />);
    expect(screen.queryByText('lock')).not.toBeInTheDocument();
  });

  it('should not show lock icon by default', () => {
    render(<LeagueCard league={mockLeague} onClick={() => {}} />);
    expect(screen.queryByText('lock')).not.toBeInTheDocument();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/components/leagues/LeagueCard.test.tsx`
Expected: FAIL - isLocked prop doesn't exist

**Step 3: Add isLocked prop to LeagueCard**

Update `src/components/leagues/LeagueCard.tsx`:

```tsx
// src/components/leagues/LeagueCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import type { FPLMiniLeague } from '../../services/fpl';

interface LeagueCardProps {
  league: FPLMiniLeague;
  onClick: () => void;
  hasTournament?: boolean;
  tournamentStatus?: 'active' | 'completed';
  isLocked?: boolean;
}

export function LeagueCard({
  league,
  onClick,
  hasTournament = false,
  tournamentStatus,
  isLocked = false,
}: LeagueCardProps) {
  return (
    <Card
      role="article"
      className="cursor-pointer hover:bg-accent transition-colors"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            {league.name}
            {isLocked && (
              <span className="material-symbols-outlined text-base text-muted-foreground" aria-label="League too large">
                lock
              </span>
            )}
          </span>
          {hasTournament && tournamentStatus && (
            <Badge variant={tournamentStatus === 'active' ? 'default' : 'secondary'}>
              {tournamentStatus === 'active' ? 'Tournament Active' : 'Tournament Complete'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Rank #{league.entryRank}</p>
      </CardContent>
    </Card>
  );
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/components/leagues/LeagueCard.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/leagues/LeagueCard.tsx src/components/leagues/LeagueCard.test.tsx
git commit -m "feat: add lock badge to LeagueCard for oversized leagues"
```

---

## Task 6: Wire Up LeagueCard isLocked in Parent Components

**Files:**
- Find and modify parent component that renders LeagueCard (likely `LeaguesPage.tsx` or `LeagueList.tsx`)

**Step 1: Find where LeagueCard is used**

Run: `grep -r "LeagueCard" src/ --include="*.tsx" | grep -v test | grep -v "LeagueCard.tsx"`

**Step 2: Update parent to pass isLocked**

The parent component needs to:
1. Import `MAX_TOURNAMENT_PARTICIPANTS`
2. Compute `isLocked` for each league based on member count
3. Pass `isLocked` prop to `LeagueCard`

Note: This may require fetching member counts for each league if not already available.

**Step 3: Run all tests**

Run: `npm test`
Expected: All tests pass

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: wire up isLocked prop in league list"
```

---

## Task 7: Final Verification

**Step 1: Run full test suite**

Run: `npm test`
Expected: All tests pass

**Step 2: Manual E2E verification (optional)**

1. Start dev server: `npm run dev`
2. Navigate to a league with >48 members (if available)
3. Verify lock badge appears on card
4. Verify locked empty state appears on league page

**Step 3: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore: final cleanup for tournament size limit"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add constant | `src/constants/tournament.ts` |
| 2 | Backend validation | `functions/src/createTournament.ts`, tests |
| 3 | Locked empty state | `NoTournamentEmptyState.tsx`, tests |
| 4 | LeaguePage integration | `LeaguePage.tsx`, tests |
| 5 | LeagueCard lock badge | `LeagueCard.tsx`, tests |
| 6 | Wire up in parent | Parent component TBD |
| 7 | Final verification | All tests |
