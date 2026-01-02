# No Tournament Empty State Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a polished empty state for LeaguePage when no tournament exists, with dynamic league info and auth-aware CTAs.

**Architecture:** Create a presentational component (`NoTournamentEmptyState`) that receives league data as props. Add a service function to fetch league info from FPL API. Update LeaguePage to fetch league info and render the new component.

**Tech Stack:** React, TypeScript, Tailwind CSS, Material Symbols icons, Vitest for testing

---

## Task 1: Add `getLeagueInfo` Service Function

**Files:**
- Modify: `src/services/fpl.ts` (add new function at end)
- Modify: `src/services/fpl.test.ts` (add new test describe block)

**Step 1: Write the failing test**

Add to `src/services/fpl.test.ts`:

```typescript
describe('getLeagueInfo', () => {
  it('should return league info with name and member count', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        league: {
          id: 29895,
          name: 'London Pub League',
        },
        standings: {
          results: Array(12).fill({ entry: 1 }),
        },
      }),
    });

    const result = await getLeagueInfo(29895);

    expect(result).toEqual({
      id: 29895,
      name: 'London Pub League',
      memberCount: 12,
    });
    expect(fetch).toHaveBeenCalledWith('/api/fpl/leagues-classic/29895/standings/');
  });

  it('should throw error when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(getLeagueInfo(99999)).rejects.toThrow('Failed to fetch league info');
  });

  it('should return 0 memberCount when standings is empty', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        league: { id: 123, name: 'Empty League' },
        standings: { results: [] },
      }),
    });

    const result = await getLeagueInfo(123);

    expect(result.memberCount).toBe(0);
  });
});
```

Update import at top of file:

```typescript
import { getFPLTeamInfo, getUserMiniLeagues, getLeagueStandings, getLeagueInfo } from './fpl';
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/services/fpl.test.ts --run`

Expected: FAIL with "getLeagueInfo is not exported"

**Step 3: Write minimal implementation**

Add to `src/services/fpl.ts` (after existing exports, before the file ends):

```typescript
export interface FPLLeagueInfo {
  id: number;
  name: string;
  memberCount: number;
}

export async function getLeagueInfo(leagueId: number): Promise<FPLLeagueInfo> {
  const response = await fetch(`/api/fpl/leagues-classic/${leagueId}/standings/`);

  if (!response.ok) {
    throw new Error('Failed to fetch league info');
  }

  const data = await response.json();

  return {
    id: data.league.id,
    name: data.league.name,
    memberCount: data.standings?.results?.length || 0,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/services/fpl.test.ts --run`

Expected: PASS (all tests including new ones)

**Step 5: Commit**

```bash
git add src/services/fpl.ts src/services/fpl.test.ts
git commit -m "feat(fpl): add getLeagueInfo service function"
```

---

## Task 2: Create `NoTournamentEmptyState` Component (Structure Only)

**Files:**
- Create: `src/components/leagues/NoTournamentEmptyState.tsx`
- Create: `src/components/leagues/NoTournamentEmptyState.test.tsx`

**Step 1: Write the failing test**

Create `src/components/leagues/NoTournamentEmptyState.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NoTournamentEmptyState } from './NoTournamentEmptyState';

const defaultProps = {
  leagueName: 'London Pub League',
  managerCount: 12,
  isAuthenticated: true,
  onCreate: vi.fn(),
};

const renderComponent = (props = {}) => {
  return render(
    <BrowserRouter>
      <NoTournamentEmptyState {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe('NoTournamentEmptyState', () => {
  it('should render the headline', () => {
    renderComponent();
    expect(screen.getByText('No Tournament Yet')).toBeInTheDocument();
  });

  it('should display the league name in the description', () => {
    renderComponent({ leagueName: 'Test League' });
    expect(screen.getByText('Test League')).toBeInTheDocument();
  });

  it('should render the trophy icon', () => {
    renderComponent();
    expect(screen.getByText('emoji_events')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/leagues/NoTournamentEmptyState.test.tsx --run`

Expected: FAIL with "Cannot find module './NoTournamentEmptyState'"

**Step 3: Write minimal implementation**

Create `src/components/leagues/NoTournamentEmptyState.tsx`:

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
}

export function NoTournamentEmptyState({
  leagueName,
  managerCount,
  isAuthenticated,
  onCreate,
}: NoTournamentEmptyStateProps) {
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
          <span className="material-symbols-outlined text-6xl text-primary">
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
                <span className="material-symbols-outlined text-[20px]">leaderboard</span>
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
                <span className="material-symbols-outlined text-[20px]">swords</span>
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
                <span className="material-symbols-outlined text-[20px]">sync</span>
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

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/leagues/NoTournamentEmptyState.test.tsx --run`

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/leagues/NoTournamentEmptyState.tsx src/components/leagues/NoTournamentEmptyState.test.tsx
git commit -m "feat(leagues): add NoTournamentEmptyState component structure"
```

---

## Task 3: Add Tests for Auth Variations and Dynamic Content

**Files:**
- Modify: `src/components/leagues/NoTournamentEmptyState.test.tsx`

**Step 1: Write the failing tests**

Add to the existing describe block in `NoTournamentEmptyState.test.tsx`:

```typescript
describe('authenticated user', () => {
  it('should render CreateTournamentButton when authenticated', () => {
    renderComponent({ isAuthenticated: true });
    expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument();
  });

  it('should not show sign up link when authenticated', () => {
    renderComponent({ isAuthenticated: true });
    expect(screen.queryByText(/sign up to create tournament/i)).not.toBeInTheDocument();
  });
});

describe('unauthenticated user', () => {
  it('should render sign up button when not authenticated', () => {
    renderComponent({ isAuthenticated: false });
    expect(screen.getByRole('link', { name: /sign up to create tournament/i })).toBeInTheDocument();
  });

  it('should link to signup page', () => {
    renderComponent({ isAuthenticated: false });
    const link = screen.getByRole('link', { name: /sign up to create tournament/i });
    expect(link).toHaveAttribute('href', '/signup');
  });

  it('should show sign in prompt text', () => {
    renderComponent({ isAuthenticated: false });
    expect(screen.getByText(/sign in to create a knockout tournament/i)).toBeInTheDocument();
  });
});

describe('How It Works section', () => {
  it('should display dynamic manager count', () => {
    renderComponent({ managerCount: 18 });
    expect(screen.getByText(/all 18 managers/i)).toBeInTheDocument();
  });

  it('should show Auto-Seeding feature', () => {
    renderComponent();
    expect(screen.getByText('Auto-Seeding')).toBeInTheDocument();
  });

  it('should show Head-to-Head feature', () => {
    renderComponent();
    expect(screen.getByText('Head-to-Head')).toBeInTheDocument();
  });

  it('should show Auto-Updates feature', () => {
    renderComponent();
    expect(screen.getByText('Auto-Updates')).toBeInTheDocument();
  });
});
```

**Step 2: Run tests to verify they pass**

Run: `npm test -- src/components/leagues/NoTournamentEmptyState.test.tsx --run`

Expected: PASS (implementation already supports these cases)

**Step 3: Commit**

```bash
git add src/components/leagues/NoTournamentEmptyState.test.tsx
git commit -m "test(leagues): add comprehensive tests for NoTournamentEmptyState"
```

---

## Task 4: Update LeaguePage to Fetch League Info

**Files:**
- Modify: `src/pages/LeaguePage.tsx`
- Modify: `src/pages/LeaguePage.test.tsx`

**Step 1: Write the failing test**

Add to `src/pages/LeaguePage.test.tsx` (update the mock at top):

```typescript
// Update the mock to include getLeagueInfo
vi.mock('../services/fpl', () => ({
  getLeagueStandings: vi.fn(),
  getCurrentGameweek: vi.fn(),
  getFPLBootstrapData: vi.fn(),
  getLeagueInfo: vi.fn(),
}));
```

Add new test:

```typescript
it('should fetch league info on mount', async () => {
  vi.mocked(fplService.getLeagueInfo).mockResolvedValue({
    id: 123,
    name: 'Test League',
    memberCount: 12,
  });
  vi.mocked(tournamentService.getTournamentByLeague).mockResolvedValue(null);

  renderLeaguePage('123');

  await waitFor(() => {
    expect(fplService.getLeagueInfo).toHaveBeenCalledWith(123);
  });
});

it('should display league name from fetched info when no tournament', async () => {
  vi.mocked(fplService.getLeagueInfo).mockResolvedValue({
    id: 123,
    name: 'London Pub League',
    memberCount: 12,
  });
  vi.mocked(tournamentService.getTournamentByLeague).mockResolvedValue(null);

  renderLeaguePage('123');

  await waitFor(() => {
    expect(screen.getByText('London Pub League')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/LeaguePage.test.tsx --run`

Expected: FAIL (getLeagueInfo not called)

**Step 3: Update LeaguePage implementation**

Modify `src/pages/LeaguePage.tsx`:

1. Add import at top:

```typescript
import { getLeagueInfo, type FPLLeagueInfo } from '../services/fpl';
import { NoTournamentEmptyState } from '../components/leagues/NoTournamentEmptyState';
```

2. Add state for league info (after existing state declarations around line 20):

```typescript
const [leagueInfo, setLeagueInfo] = useState<FPLLeagueInfo | null>(null);
```

3. Update the loadData function to fetch league info (inside useEffect, around line 29):

Replace the entire `loadData` function with:

```typescript
async function loadData() {
  if (!leagueId) return;

  setIsLoading(true);
  try {
    // Fetch league info and tournament in parallel
    const [leagueInfoResult, existingTournament] = await Promise.all([
      getLeagueInfo(Number(leagueId)),
      getTournamentByLeague(Number(leagueId)),
    ]);

    if (!mountedRef.current) return;

    setLeagueInfo(leagueInfoResult);

    if (existingTournament) {
      setTournament(existingTournament);

      // Trigger background refresh (fire-and-forget)
      setIsRefreshing(true);
      callRefreshTournament(existingTournament.id)
        .then(async (result) => {
          if (!mountedRef.current) return;

          if (result && (result.picksRefreshed > 0 || result.matchesResolved > 0)) {
            const updatedTournament = await getTournamentByLeague(Number(leagueId));
            if (mountedRef.current && updatedTournament) {
              setTournament(updatedTournament);
            }
          }
        })
        .catch(() => {
          // Silent failure
        })
        .finally(() => {
          if (mountedRef.current) {
            setIsRefreshing(false);
          }
        });
    }
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    if (mountedRef.current) {
      setIsLoading(false);
    }
  }
}
```

4. Remove the yellow banner (delete lines 107-114 that contain the yellow sign-up CTA).

5. Replace the empty state Card with the new component (around lines 118-140):

Replace:
```tsx
) : (
  <Card>
    <CardHeader>
      <CardTitle>League {leagueId}</CardTitle>
      ...
    </CardHeader>
    <CardContent>
      ...
    </CardContent>
  </Card>
)}
```

With:
```tsx
) : leagueInfo ? (
  <NoTournamentEmptyState
    leagueName={leagueInfo.name}
    managerCount={leagueInfo.memberCount}
    isAuthenticated={!!user}
    onCreate={handleCreateTournament}
  />
) : null}
```

6. Remove unused imports (Card, CardContent, CardHeader if no longer used).

**Step 4: Run tests to verify they pass**

Run: `npm test -- src/pages/LeaguePage.test.tsx --run`

Expected: PASS

**Step 5: Commit**

```bash
git add src/pages/LeaguePage.tsx src/pages/LeaguePage.test.tsx
git commit -m "feat(LeaguePage): integrate NoTournamentEmptyState with league info"
```

---

## Task 5: Update Existing LeaguePage Tests

**Files:**
- Modify: `src/pages/LeaguePage.test.tsx`

**Step 1: Update beforeEach to mock getLeagueInfo**

In the `beforeEach` block, add:

```typescript
vi.mocked(fplService.getLeagueInfo).mockResolvedValue({
  id: 123,
  name: 'Test League',
  memberCount: 12,
});
```

**Step 2: Run all tests to verify they pass**

Run: `npm test -- src/pages/LeaguePage.test.tsx --run`

Expected: PASS (all existing tests should still pass)

**Step 3: Commit**

```bash
git add src/pages/LeaguePage.test.tsx
git commit -m "test(LeaguePage): update tests to mock getLeagueInfo"
```

---

## Task 6: Visual Verification with Playwright MCP

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Navigate and verify logged-out state**

Use Playwright MCP:

```
browser_navigate: http://localhost:5173/league/29895
browser_snapshot
```

Verify:
- Trophy icon visible in hero area
- "No Tournament Yet" headline
- League name displayed
- "Sign Up to Create Tournament" button visible
- "How it Works" section with 3 features

**Step 3: Log in and verify authenticated state**

```
browser_navigate: http://localhost:5173/login
browser_fill_form: email=testuser@knockoutfpl.com, password=TestPass123!
browser_click: Log In button
browser_navigate: http://localhost:5173/league/29895
browser_snapshot
```

Verify:
- CreateTournamentButton with gameweek selector visible
- No sign up prompt

**Step 4: Check console for errors**

```
browser_console_messages: level=error
```

Expected: No errors

**Step 5: Commit any fixes if needed**

---

## Task 7: Final Cleanup and Documentation

**Step 1: Run full test suite**

Run: `npm test --run`

Expected: All tests pass

**Step 2: Update design doc status**

In `docs/plans/2026-01-01-no-tournament-empty-state-design.md`, change:

```markdown
**Status:** Approved
```

To:

```markdown
**Status:** Implemented
```

**Step 3: Final commit**

```bash
git add docs/plans/2026-01-01-no-tournament-empty-state-design.md
git commit -m "docs: mark no tournament empty state design as implemented"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add getLeagueInfo service | fpl.ts, fpl.test.ts |
| 2 | Create NoTournamentEmptyState component | NoTournamentEmptyState.tsx, .test.tsx |
| 3 | Add comprehensive component tests | NoTournamentEmptyState.test.tsx |
| 4 | Integrate into LeaguePage | LeaguePage.tsx, LeaguePage.test.tsx |
| 5 | Update existing LeaguePage tests | LeaguePage.test.tsx |
| 6 | Visual verification | Playwright MCP |
| 7 | Cleanup and documentation | Design doc |

**Total estimated commits:** 7
