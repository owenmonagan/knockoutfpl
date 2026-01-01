# Team Identity Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update TeamIdentity component to show FPL stats badges, sync button, and edit team link as per design mockup.

**Architecture:** Enhance existing `TeamIdentity` component with new props for stats data and callbacks. `LeaguesPage` already fetches all required data - just needs to pass it down and handle the sync/edit actions.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui (Button, Card), Material Symbols icons

---

## Task 1: Update TeamIdentity Props and Basic Structure

**Files:**
- Modify: `src/components/dashboard/TeamIdentity.tsx`
- Modify: `src/components/dashboard/TeamIdentity.test.tsx`

**Step 1: Write failing tests for new props**

Add to `TeamIdentity.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { TeamIdentity } from './TeamIdentity';

// Helper to wrap with router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('TeamIdentity', () => {
  const defaultProps = {
    teamName: "Haaland's Hairband FC",
    managerName: 'Owen Smith',
    overallRank: 124000,
    gameweekNumber: 34,
    gameweekPoints: 78,
    onSync: vi.fn(),
    onEditTeam: vi.fn(),
  };

  it('renders without crashing', () => {
    renderWithRouter(<TeamIdentity {...defaultProps} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays the team name', () => {
    renderWithRouter(<TeamIdentity {...defaultProps} />);
    expect(screen.getByText("Haaland's Hairband FC")).toBeInTheDocument();
  });

  it('displays the manager name with prefix', () => {
    renderWithRouter(<TeamIdentity {...defaultProps} />);
    expect(screen.getByText(/Manager: Owen Smith/)).toBeInTheDocument();
  });

  it('displays overall rank badge with formatted number', () => {
    renderWithRouter(<TeamIdentity {...defaultProps} />);
    expect(screen.getByText(/OR:/)).toBeInTheDocument();
    expect(screen.getByText(/124k/)).toBeInTheDocument();
  });

  it('displays gameweek points badge', () => {
    renderWithRouter(<TeamIdentity {...defaultProps} />);
    expect(screen.getByText(/GW34:/)).toBeInTheDocument();
    expect(screen.getByText(/78 pts/)).toBeInTheDocument();
  });

  it('renders sync button', () => {
    renderWithRouter(<TeamIdentity {...defaultProps} />);
    expect(screen.getByRole('button', { name: /sync/i })).toBeInTheDocument();
  });

  it('calls onSync when sync button clicked', async () => {
    const user = userEvent.setup();
    const onSync = vi.fn();
    renderWithRouter(<TeamIdentity {...defaultProps} onSync={onSync} />);

    await user.click(screen.getByRole('button', { name: /sync/i }));
    expect(onSync).toHaveBeenCalledTimes(1);
  });

  it('renders edit team button', () => {
    renderWithRouter(<TeamIdentity {...defaultProps} />);
    expect(screen.getByRole('button', { name: /edit|change team/i })).toBeInTheDocument();
  });

  it('calls onEditTeam when edit button clicked', async () => {
    const user = userEvent.setup();
    const onEditTeam = vi.fn();
    renderWithRouter(<TeamIdentity {...defaultProps} onEditTeam={onEditTeam} />);

    await user.click(screen.getByRole('button', { name: /edit|change team/i }));
    expect(onEditTeam).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when syncing', () => {
    renderWithRouter(<TeamIdentity {...defaultProps} isSyncing={true} />);
    const syncButton = screen.getByRole('button', { name: /sync/i });
    expect(syncButton).toBeDisabled();
  });

  it('formats large ranks with k suffix', () => {
    renderWithRouter(<TeamIdentity {...defaultProps} overallRank={1500000} />);
    expect(screen.getByText(/1.5m/i)).toBeInTheDocument();
  });

  it('formats small ranks without suffix', () => {
    renderWithRouter(<TeamIdentity {...defaultProps} overallRank={500} />);
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npm test -- src/components/dashboard/TeamIdentity.test.tsx
```

Expected: Multiple failures - new props not accepted, badges not rendered, buttons not found.

**Step 3: Update component interface and implementation**

Replace `src/components/dashboard/TeamIdentity.tsx`:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface TeamIdentityProps {
  teamName: string;
  managerName: string;
  overallRank: number;
  gameweekNumber: number;
  gameweekPoints: number;
  onSync: () => void;
  onEditTeam: () => void;
  isSyncing?: boolean;
}

function formatRank(rank: number): string {
  if (rank >= 1_000_000) {
    return `${(rank / 1_000_000).toFixed(1)}m`;
  }
  if (rank >= 1_000) {
    return `${Math.round(rank / 1_000)}k`;
  }
  return rank.toString();
}

export function TeamIdentity({
  teamName,
  managerName,
  overallRank,
  gameweekNumber,
  gameweekPoints,
  onSync,
  onEditTeam,
  isSyncing = false,
}: TeamIdentityProps) {
  return (
    <Card role="banner">
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        {/* Left: Team Info */}
        <div className="flex flex-col gap-3">
          {/* Team name with edit button */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {teamName}
            </h1>
            <button
              onClick={onEditTeam}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Change team"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          </div>

          {/* Manager name */}
          <p className="text-muted-foreground">Manager: {managerName}</p>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Overall Rank Badge */}
            <div className="inline-flex items-center gap-1.5 rounded bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              <span className="material-symbols-outlined text-[16px]">
                leaderboard
              </span>
              OR: {formatRank(overallRank)}
            </div>

            {/* Gameweek Points Badge */}
            <div className="inline-flex items-center gap-1.5 rounded bg-muted px-2.5 py-1 text-xs font-bold text-foreground">
              <span className="material-symbols-outlined text-[16px]">
                trending_up
              </span>
              GW{gameweekNumber}: {gameweekPoints} pts
            </div>
          </div>
        </div>

        {/* Right: Sync Button */}
        <Button
          onClick={onSync}
          disabled={isSyncing}
          className="w-full sm:w-auto"
        >
          <span className="material-symbols-outlined mr-2 text-lg">sync</span>
          {isSyncing ? 'Syncing...' : 'Sync Latest Data'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- src/components/dashboard/TeamIdentity.test.tsx
```

Expected: All tests pass.

**Step 5: Commit**

```bash
git add src/components/dashboard/TeamIdentity.tsx src/components/dashboard/TeamIdentity.test.tsx
git commit -m "feat(dashboard): redesign TeamIdentity with badges and actions"
```

---

## Task 2: Update LeaguesPage to Pass New Props

**Files:**
- Modify: `src/pages/LeaguesPage.tsx`
- Modify: `src/pages/LeaguesPage.test.tsx`

**Step 1: Write failing test for LeaguesPage passing new props**

Add to `LeaguesPage.test.tsx`:

```tsx
it('passes FPL stats to TeamIdentity', async () => {
  const mockTeamInfo = {
    teamId: 123,
    teamName: 'Test FC',
    managerName: 'Test Manager',
    overallRank: 50000,
    gameweekPoints: 65,
  };

  vi.mocked(getUserProfile).mockResolvedValue({
    id: 'user-123',
    fplTeamId: 123,
    email: 'test@example.com',
  });
  vi.mocked(getFPLTeamInfo).mockResolvedValue(mockTeamInfo);
  vi.mocked(getFPLBootstrapData).mockResolvedValue({ currentGameweek: 34 });
  vi.mocked(getUserMiniLeagues).mockResolvedValue([]);

  render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContextAuthenticated}>
        <LeaguesPage />
      </AuthContext.Provider>
    </BrowserRouter>
  );

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('Test FC')).toBeInTheDocument();
  });

  // Verify badges are shown
  expect(screen.getByText(/OR:/)).toBeInTheDocument();
  expect(screen.getByText(/50k/)).toBeInTheDocument();
  expect(screen.getByText(/GW34:/)).toBeInTheDocument();
  expect(screen.getByText(/65 pts/)).toBeInTheDocument();
});

it('handles sync button click by refetching data', async () => {
  const user = userEvent.setup();

  vi.mocked(getUserProfile).mockResolvedValue({
    id: 'user-123',
    fplTeamId: 123,
    email: 'test@example.com',
  });
  vi.mocked(getFPLTeamInfo).mockResolvedValue({
    teamId: 123,
    teamName: 'Test FC',
    managerName: 'Test Manager',
    overallRank: 50000,
    gameweekPoints: 65,
  });
  vi.mocked(getFPLBootstrapData).mockResolvedValue({ currentGameweek: 34 });
  vi.mocked(getUserMiniLeagues).mockResolvedValue([]);

  render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContextAuthenticated}>
        <LeaguesPage />
      </AuthContext.Provider>
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByText('Test FC')).toBeInTheDocument();
  });

  // Clear mock call counts
  vi.mocked(getFPLTeamInfo).mockClear();
  vi.mocked(getUserMiniLeagues).mockClear();

  // Click sync button
  await user.click(screen.getByRole('button', { name: /sync/i }));

  // Verify data was refetched
  await waitFor(() => {
    expect(getFPLTeamInfo).toHaveBeenCalled();
  });
});

it('navigates to /connect when edit team clicked', async () => {
  const user = userEvent.setup();
  const mockNavigate = vi.fn();
  vi.mocked(useNavigate).mockReturnValue(mockNavigate);

  vi.mocked(getUserProfile).mockResolvedValue({
    id: 'user-123',
    fplTeamId: 123,
    email: 'test@example.com',
  });
  vi.mocked(getFPLTeamInfo).mockResolvedValue({
    teamId: 123,
    teamName: 'Test FC',
    managerName: 'Test Manager',
    overallRank: 50000,
    gameweekPoints: 65,
  });
  vi.mocked(getFPLBootstrapData).mockResolvedValue({ currentGameweek: 34 });
  vi.mocked(getUserMiniLeagues).mockResolvedValue([]);

  render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContextAuthenticated}>
        <LeaguesPage />
      </AuthContext.Provider>
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByText('Test FC')).toBeInTheDocument();
  });

  await user.click(screen.getByRole('button', { name: /edit|change team/i }));

  expect(mockNavigate).toHaveBeenCalledWith('/connect');
});
```

**Step 2: Run tests to verify they fail**

```bash
npm test -- src/pages/LeaguesPage.test.tsx
```

Expected: Failures - props not passed, handlers not implemented.

**Step 3: Update LeaguesPage to pass new props and handle actions**

In `src/pages/LeaguesPage.tsx`, update the TeamIdentity section:

```tsx
// Add isSyncing state near other state declarations
const [isSyncing, setIsSyncing] = useState(false);

// Add sync handler function inside component
const handleSync = async () => {
  if (!authUser?.uid || isSyncing) return;

  setIsSyncing(true);
  setIsLoadingTeam(true);
  setIsLoadingLeagues(true);

  try {
    // Re-run the same data loading logic
    const userProfile = await getUserProfile(authUser.uid);
    if (!userProfile || userProfile.fplTeamId === 0) {
      setIsLoadingTeam(false);
      setIsLoadingLeagues(false);
      setIsSyncing(false);
      return;
    }

    const [fplTeamInfo, bootstrapData] = await Promise.all([
      getFPLTeamInfo(userProfile.fplTeamId).catch(() => null),
      getFPLBootstrapData().catch(() => ({ currentGameweek: undefined })),
    ]);

    setTeamInfo(fplTeamInfo);
    setCurrentGameweek(bootstrapData.currentGameweek);
    setIsLoadingTeam(false);

    const miniLeagues = await getUserMiniLeagues(userProfile.fplTeamId);
    const leaguesWithTournaments = await Promise.all(
      miniLeagues.map(async (league) => {
        const [standings, tournamentData] = await Promise.all([
          getLeagueStandings(league.id),
          getTournamentSummaryForLeague(league.id, userProfile.fplTeamId).catch(() => ({
            tournament: null,
            userProgress: null,
          })),
        ]);
        return {
          ...league,
          memberCount: standings.length,
          ...tournamentData,
        };
      })
    );

    setLeagues(leaguesWithTournaments);
  } finally {
    setIsLoadingLeagues(false);
    setIsSyncing(false);
  }
};

// Add edit team handler
const handleEditTeam = () => {
  navigate('/connect');
};

// Update the TeamIdentity render section
{isLoadingTeam ? (
  <div className="space-y-2">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-5 w-32" />
  </div>
) : teamInfo ? (
  <TeamIdentity
    teamName={teamInfo.teamName}
    managerName={teamInfo.managerName}
    overallRank={teamInfo.overallRank ?? 0}
    gameweekNumber={currentGameweek ?? 0}
    gameweekPoints={teamInfo.gameweekPoints ?? 0}
    onSync={handleSync}
    onEditTeam={handleEditTeam}
    isSyncing={isSyncing}
  />
) : null}
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- src/pages/LeaguesPage.test.tsx
```

Expected: All tests pass.

**Step 5: Commit**

```bash
git add src/pages/LeaguesPage.tsx src/pages/LeaguesPage.test.tsx
git commit -m "feat(dashboard): wire up TeamIdentity with sync and edit actions"
```

---

## Task 3: Visual Polish and Edge Cases

**Files:**
- Modify: `src/components/dashboard/TeamIdentity.tsx`
- Modify: `src/components/dashboard/TeamIdentity.test.tsx`

**Step 1: Add edge case tests**

Add to `TeamIdentity.test.tsx`:

```tsx
describe('edge cases', () => {
  it('handles zero overall rank gracefully', () => {
    renderWithRouter(<TeamIdentity {...defaultProps} overallRank={0} />);
    expect(screen.getByText(/OR:/)).toBeInTheDocument();
  });

  it('handles zero gameweek points', () => {
    renderWithRouter(<TeamIdentity {...defaultProps} gameweekPoints={0} />);
    expect(screen.getByText(/0 pts/)).toBeInTheDocument();
  });

  it('handles missing gameweek number', () => {
    renderWithRouter(<TeamIdentity {...defaultProps} gameweekNumber={0} />);
    expect(screen.getByText(/GW0:/)).toBeInTheDocument();
  });

  it('handles very long team names without breaking layout', () => {
    const longName = 'This Is An Extremely Long Team Name That Should Not Break';
    renderWithRouter(<TeamIdentity {...defaultProps} teamName={longName} />);
    expect(screen.getByText(longName)).toBeInTheDocument();
  });
});
```

**Step 2: Run tests**

```bash
npm test -- src/components/dashboard/TeamIdentity.test.tsx
```

Expected: All pass (implementation already handles these).

**Step 3: Commit**

```bash
git add src/components/dashboard/TeamIdentity.test.tsx
git commit -m "test(dashboard): add edge case tests for TeamIdentity"
```

---

## Task 4: Manual E2E Verification

**Step 1: Start dev server with emulators**

```bash
npm run dev
```

**Step 2: Use Playwright MCP to verify**

```typescript
// Navigate to leagues page (must be logged in)
await browser_navigate('http://localhost:5173/leagues');
await browser_snapshot();

// Verify TeamIdentity card appears with:
// - Team name
// - Manager name
// - OR badge
// - GW badge
// - Sync button
// - Edit icon

// Click sync button
await browser_click({ element: 'Sync Latest Data button', ref: '...' });
// Verify loading state appears briefly

// Click edit icon
await browser_click({ element: 'Edit team button', ref: '...' });
// Verify navigation to /connect

// Check console for errors
await browser_console_messages({ level: 'error' });
```

**Step 3: Commit any fixes if needed**

---

## Summary

| Task | Description | Estimated Steps |
|------|-------------|-----------------|
| 1 | Update TeamIdentity component | 5 steps |
| 2 | Wire up LeaguesPage | 5 steps |
| 3 | Edge case tests | 3 steps |
| 4 | E2E verification | 3 steps |

**Total: ~16 steps, 4 commits**
