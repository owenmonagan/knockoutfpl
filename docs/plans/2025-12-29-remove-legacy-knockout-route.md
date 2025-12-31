# Remove Legacy `/knockout` Route Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the legacy `/knockout/:leagueId` route and all associated dead code, consolidating to `/league/:leagueId`.

**Architecture:** The `/knockout` route dynamically generates brackets from the FPL API (never persisted). The `/league` route fetches stored tournaments from Firestore. Since `LeaguesPage` already navigates to `/league/{id}`, the `/knockout` route is unreachable and can be safely removed. Additionally, ~150 lines of dead FPL service functions are removed.

**Tech Stack:** React + TypeScript + Vite + Playwright E2E tests

---

## Background

Two routes exist for viewing tournament brackets:

| Route | Component | Status | Behavior |
|-------|-----------|--------|----------|
| `/league/:leagueId` | `LeaguePage` | ✅ Correct | Fetches stored tournaments from DB |
| `/knockout/:leagueId` | `KnockoutPage` | ❌ Legacy | Dynamically generates brackets from FPL API |

The `LeaguesPage` already navigates to `/league/{id}`, making `/knockout` unreachable from normal user flows.

---

## Summary of Changes

| Category | Files | Action |
|----------|-------|--------|
| Delete | `src/pages/KnockoutPage.tsx` (203 lines) | Remove |
| Delete | `src/pages/KnockoutPage.test.tsx` (223 lines) | Remove |
| Modify | `src/router.tsx` | Remove import + route |
| Modify | `src/services/fpl.ts` | Remove dead functions (~150 lines) |
| Modify | `src/services/fpl.test.ts` | Remove dead tests (~350 lines) |
| Modify | E2E tests (3 files) | Update `/knockout/` → `/league/` |

---

## Task 1: Update E2E Tests - shared-link-viewer.spec.ts

**Files:**
- Modify: `e2e/journeys/shared-link-viewer.spec.ts`

**Step 1: Update the comment on line 16**

Replace line 16's mention of `/knockout/:id`:

```typescript
// Old:
// Note: The current implementation has /league/:id and /knockout/:id as protected
// New:
// Note: The current implementation has /league/:id as a public route.
```

**Step 2: Update test "should NOT redirect anonymous users from knockout page" (lines 48-57)**

This test should be removed since the `/knockout` route no longer exists:

```typescript
// DELETE this entire test block (lines 48-57):
test('should NOT redirect anonymous users from knockout page @smoke', async ({
  page,
}) => {
  // Navigate to knockout page as an anonymous user
  await page.goto(`/knockout/${TEST_LEAGUE_ID}`);
  await page.waitForLoadState('networkidle');

  // Should stay on knockout page (not redirect to login)
  await expect(page).toHaveURL(`/knockout/${TEST_LEAGUE_ID}`);
});
```

**Step 3: Update test "should display bracket without authentication" (lines 63-72)**

Change `/knockout/` to `/league/`:

```typescript
test('should display bracket without authentication @critical', async ({ page }) => {
  await page.goto(`/league/${TEST_LEAGUE_ID}`);
  await page.waitForLoadState('networkidle');

  // Should NOT redirect to login
  await expect(page).toHaveURL(`/league/${TEST_LEAGUE_ID}`);

  // Bracket should be visible - shows teams remaining count
  await expect(page.getByText(/REMAIN|\d+ teams/i).first()).toBeVisible({ timeout: 15000 });
});
```

**Step 4: Update test "should show all participants and matchups" (lines 74-81)**

```typescript
test('should show all participants and matchups', async ({ page }) => {
  await page.goto(`/league/${TEST_LEAGUE_ID}`);
  await page.waitForLoadState('networkidle');

  // Verify seeds are displayed
  await expect(page.getByText('(1)')).toBeVisible();
  await expect(page.getByText('(16)')).toBeVisible();
});
```

**Step 5: Update test "should display current round status and scores" (lines 83-93)**

```typescript
test('should display current round status and scores', async ({ page }) => {
  await page.goto(`/league/${TEST_LEAGUE_ID}`);
  await page.waitForLoadState('networkidle');

  // Verify gameweek info (use .first() since multiple GW badges exist)
  await expect(page.getByText(/GW\s*\d+/).first()).toBeVisible({ timeout: 15000 });

  // Verify scores are displayed (2-3 digit numbers)
  const scores = page.locator('text=/^\\d{2,3}$/');
  await expect(scores.first()).toBeVisible();
});
```

**Step 6: Update Logged-in Viewer tests (lines 139-191)**

Update test "should display bracket with user context" (lines 139-164):

```typescript
test('should display bracket with user context @critical', async ({ page }) => {
  // Navigate to league page for a large league
  await page.goto(`/league/${TEST_LEAGUE_ID}`);
  await page.waitForLoadState('networkidle');

  // Should be on league page (not redirected)
  await expect(page).toHaveURL(/\/league/);

  // Wait for bracket to load
  // Either show bracket content OR show loading/error state
  const bracketOrContent = page.locator(
    'text=/REMAIN|teams|loading|no tournament/i'
  );
  await expect(bracketOrContent).toBeVisible({ timeout: 30000 });

  // If bracket loaded successfully, verify header structure
  const hasRemaining = await page.getByText(/REMAIN/i).isVisible().catch(() => false);

  if (hasRemaining) {
    // Verify gameweek info is shown
    await expect(page.getByText(/GW\d+/)).toBeVisible();

    // Verify seeds are displayed
    await expect(page.getByText('(1)')).toBeVisible();
  }
});
```

Update test "should highlight user own team in bracket" (lines 166-191):

```typescript
test('should highlight user own team in bracket @critical', async ({ page }) => {
  // Navigate to league page
  await page.goto(`/league/${TEST_LEAGUE_ID}`);
  await page.waitForLoadState('networkidle');

  // Wait for bracket to load
  const bracketLoaded = await page
    .getByText(/REMAIN/i)
    .isVisible({ timeout: 30000 })
    .catch(() => false);

  if (bracketLoaded) {
    // If user is in this bracket, "YOUR MATCH" should be highlighted
    const yourMatch = page.getByText(/YOUR MATCH/i);
    const yourMatchVisible = await yourMatch.isVisible().catch(() => false);

    if (yourMatchVisible) {
      // Verify the user's match is displayed with special styling
      await expect(yourMatch).toBeVisible();
    }
  }
});
```

Update test "should navigate to dashboard after viewing" (lines 209-231):

```typescript
test('should navigate to dashboard after viewing', async ({ page }) => {
  // Navigate to league page
  await page.goto(`/league/${TEST_LEAGUE_ID}`);
  await page.waitForLoadState('networkidle');

  // Click back to leagues link
  const backLink = page.getByText(/← Back to Leagues/i);
  await expect(backLink).toBeVisible();
  await backLink.click();

  // Should navigate to leagues page
  await expect(page).toHaveURL(/\/leagues/);
  await expect(
    page.getByRole('heading', { name: /your mini leagues/i })
  ).toBeVisible();

  // From leagues, can navigate to dashboard
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/dashboard');
  await expect(
    page.getByRole('heading', { name: /dashboard/i })
  ).toBeVisible();
});
```

**Step 7: Run tests to verify changes**

Run: `npm run test:e2e -- e2e/journeys/shared-link-viewer.spec.ts`

Expected: Tests pass (may fail if `/knockout` route still exists - this is expected at this stage)

**Step 8: Commit**

```bash
git add e2e/journeys/shared-link-viewer.spec.ts
git commit -m "$(cat <<'EOF'
test: update shared-link-viewer E2E tests from /knockout to /league

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Update E2E Tests - returning-user.spec.ts

**Files:**
- Modify: `e2e/journeys/returning-user.spec.ts`

**Step 1: Update test "should indicate eliminated status" (lines 208-221)**

Change `/knockout/315` to `/league/315`:

```typescript
test('should indicate eliminated status when user is out @dashboard @critical', async ({ page }) => {
  // Login as test user
  await loginAndWait(page);

  // Navigate to the eliminated tournament (fplLeagueId: 315)
  // In this tournament, test user (158256) lost in Round 1 with score 45 vs 67
  await page.goto('/league/315');
  await page.waitForLoadState('networkidle');

  // Verify user's match shows losing status
  // The MatchCard applies "opacity-50" class to the losing player
  // Test user's team name is "o-win"
  await expect(page.locator('.opacity-50').filter({ hasText: /o-win/i })).toBeVisible();
});
```

**Step 2: Update test "should show winner celebration" (lines 223-235)**

Change `/knockout/316` to `/league/316`:

```typescript
test('should show winner celebration when tournament complete @dashboard @critical', async ({ page }) => {
  // Login as test user
  await loginAndWait(page);

  // Navigate to the completed tournament where user won (fplLeagueId: 316)
  // Test user (158256) won all 4 rounds and is the tournament winner
  await page.goto('/league/316');
  await page.waitForLoadState('networkidle');

  // Verify tournament complete status
  // The UI should show champion/winner status or completed tournament indicator
  await expect(page.getByText(/champion|winner|completed/i)).toBeVisible();
});
```

**Step 3: Run tests to verify changes**

Run: `npm run test:e2e -- e2e/journeys/returning-user.spec.ts`

Expected: Tests pass (may fail if `/knockout` route still exists - expected)

**Step 4: Commit**

```bash
git add e2e/journeys/returning-user.spec.ts
git commit -m "$(cat <<'EOF'
test: update returning-user E2E tests from /knockout to /league

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Update E2E Tests - tournament.spec.ts

**Files:**
- Modify: `e2e/tournament.spec.ts`

**Step 1: Update comment on line 33**

Change the comment mentioning `/knockout/{id}`:

```typescript
// Old (line 33):
// - Knockout brackets are at /knockout/{id} (not /league/{id})
// New:
// - Knockout brackets are at /league/{id}
```

**Step 2: Run tests to verify changes**

Run: `npm run test:e2e -- e2e/tournament.spec.ts`

Expected: Tests are skipped (existing behavior), no new failures

**Step 3: Commit**

```bash
git add e2e/tournament.spec.ts
git commit -m "$(cat <<'EOF'
docs: update tournament E2E test comment to reflect /league route

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Delete KnockoutPage Files

**Files:**
- Delete: `src/pages/KnockoutPage.tsx`
- Delete: `src/pages/KnockoutPage.test.tsx`

**Step 1: Delete the legacy page files**

```bash
rm src/pages/KnockoutPage.tsx
rm src/pages/KnockoutPage.test.tsx
```

**Step 2: Run unit tests to verify no regressions**

Run: `npm test`

Expected: FAIL - router.tsx imports a non-existent file (expected, will fix in Task 5)

**Step 3: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
refactor: delete legacy KnockoutPage component

Removes 426 lines of dead code (203 component + 223 tests).
The /knockout/:leagueId route is unreachable from normal user flows.
All bracket viewing now uses /league/:leagueId via LeaguePage.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Update Router

**Files:**
- Modify: `src/router.tsx`

**Step 1: Remove KnockoutPage import and route**

Remove line 10 (import) and lines 67-70 (route):

```typescript
// DELETE line 10:
import { KnockoutPage } from './pages/KnockoutPage';

// DELETE lines 67-70:
{
  path: '/knockout/:leagueId',
  element: <KnockoutPage />,
},
```

The file should end after the `/league/:leagueId` route (line 66).

**Step 2: Run TypeScript check**

Run: `npm run build`

Expected: PASS - no TypeScript errors

**Step 3: Run unit tests**

Run: `npm test`

Expected: PASS - all tests pass

**Step 4: Commit**

```bash
git add src/router.tsx
git commit -m "$(cat <<'EOF'
refactor: remove /knockout route from router

Route consolidation: all bracket viewing now uses /league/:leagueId

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Clean Up FPL Service - Remove Dead Functions

**Files:**
- Modify: `src/services/fpl.ts`

**Step 1: Identify code to keep**

Keep ONLY these (lines 1-50, 218-253):
- `FPLMiniLeague` interface (lines 1-5)
- `LeagueStanding` interface (lines 7-13)
- `FPLTeamInfo` interface (lines 15-24)
- `getFPLTeamInfo()` function (lines 31-50)
- `getUserMiniLeagues()` function (lines 218-233)
- `getLeagueStandings()` function (lines 235-253)

**Step 2: Delete dead code**

Delete these (lines 26-216):
- `FPLGameweekScore` interface (26-29)
- `getFPLGameweekScore()` (52-65)
- `FPLPick` interface (67-73)
- `FPLTeamPicks` interface (75-83)
- `getFPLTeamPicks()` (85-103)
- `FPLPlayer` interface (105-111)
- `getFPLPlayers()` (113-128)
- `FPLLiveElement` interface (130-135)
- `getFPLLiveScores()` (137-152)
- `getCurrentGameweek()` (154-159)
- `FPLGameweekInfo` interface (161-165)
- `getGameweekInfo()` (167-172)
- `FPLFixture` interface (174-182)
- `getFPLFixtures()` (184-197)
- `FixtureStatus` type (199)
- `getPlayerFixtureStatus()` (201-216)

**Step 3: Write the cleaned file**

The final `fpl.ts` should be:

```typescript
export interface FPLMiniLeague {
  id: number;
  name: string;
  entryRank: number;
}

export interface LeagueStanding {
  fplTeamId: number;
  teamName: string;
  managerName: string;
  rank: number;
  totalPoints: number;
}

export interface FPLTeamInfo {
  teamId: number;
  teamName: string;
  managerName: string;
  overallPoints?: number;
  overallRank?: number;
  gameweekPoints?: number;
  gameweekRank?: number;
  teamValue?: number;
}

export async function getFPLTeamInfo(teamId: number): Promise<FPLTeamInfo> {
  const response = await fetch(`/api/fpl/entry/${teamId}/`);

  if (!response.ok) {
    throw new Error('Failed to fetch team info');
  }

  const data = await response.json();

  return {
    teamId: data.id,
    teamName: data.name,
    managerName: `${data.player_first_name} ${data.player_last_name}`,
    overallPoints: data.summary_overall_points,
    overallRank: data.summary_overall_rank,
    gameweekPoints: data.summary_event_points,
    gameweekRank: data.summary_event_rank,
    teamValue: data.last_deadline_value ? data.last_deadline_value / 10 : undefined,
  };
}

export async function getUserMiniLeagues(teamId: number): Promise<FPLMiniLeague[]> {
  const response = await fetch(`/api/fpl/entry/${teamId}/`);

  if (!response.ok) {
    throw new Error('Failed to fetch team data');
  }

  const data = await response.json();
  const classicLeagues = data.leagues?.classic || [];

  return classicLeagues.map((league: any) => ({
    id: league.id,
    name: league.name,
    entryRank: league.entry_rank,
  }));
}

export async function getLeagueStandings(leagueId: number): Promise<LeagueStanding[]> {
  const response = await fetch(`/api/fpl/leagues-classic/${leagueId}/standings/`);

  if (!response.ok) {
    throw new Error('Failed to fetch league standings');
  }

  const data = await response.json();
  const results = data.standings?.results || [];

  return results.map((entry: any) => ({
    fplTeamId: entry.entry,
    teamName: entry.entry_name,
    managerName: entry.player_name,
    rank: entry.rank,
    totalPoints: entry.total,
  }));
}
```

**Step 4: Run TypeScript check**

Run: `npm run build`

Expected: PASS - no TypeScript errors

**Step 5: Run unit tests**

Run: `npm test`

Expected: FAIL - fpl.test.ts imports deleted functions (expected, will fix in Task 7)

**Step 6: Commit**

```bash
git add src/services/fpl.ts
git commit -m "$(cat <<'EOF'
refactor: remove 170 lines of dead code from FPL service

Removed functions with zero consumers in the app:
- getFPLGameweekScore (only used by deleted KnockoutPage)
- getCurrentGameweek (only used by deleted KnockoutPage)
- getFPLTeamPicks (never used)
- getFPLPlayers (never used)
- getFPLLiveScores (never used)
- getGameweekInfo (never used)
- getFPLFixtures (never used)
- getPlayerFixtureStatus (never used)

Kept: getFPLTeamInfo, getUserMiniLeagues, getLeagueStandings

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Clean Up FPL Tests

**Files:**
- Modify: `src/services/fpl.test.ts`

**Step 1: Update imports**

Change line 2 from importing all functions to only the kept ones:

```typescript
// Old:
import { getFPLTeamInfo, getFPLGameweekScore, getFPLTeamPicks, getFPLPlayers, getFPLLiveScores, getCurrentGameweek, getGameweekInfo, getFPLFixtures, getPlayerFixtureStatus, getUserMiniLeagues, getLeagueStandings } from './fpl';

// New:
import { getFPLTeamInfo, getUserMiniLeagues, getLeagueStandings } from './fpl';
```

**Step 2: Remove test blocks for deleted functions**

Delete these describe blocks:
- `describe('getFPLGameweekScore', ...)` (lines 125-147)
- `describe('getFPLTeamPicks', ...)` (lines 149-187)
- `describe('getFPLPlayers', ...)` (lines 189-223)
- `describe('getFPLLiveScores', ...)` (lines 225-248)
- `describe('getCurrentGameweek', ...)` (lines 250-289)
- `describe('getGameweekInfo', ...)` (lines 291-371)
- `describe('getFPLFixtures', ...)` (lines 373-415)
- `describe('getPlayerFixtureStatus', ...)` (lines 417-467)

**Step 3: Write the cleaned file**

The final `fpl.test.ts` should be:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { getFPLTeamInfo, getUserMiniLeagues, getLeagueStandings } from './fpl';

describe('FPL Service', () => {
  describe('getFPLTeamInfo', () => {
    it('should fetch and return team information', async () => {
      const mockTeamData = {
        id: 158256,
        name: "Owen's XI",
        player_first_name: 'Owen',
        player_last_name: 'Test',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeamData,
      });

      const result = await getFPLTeamInfo(158256);

      expect(global.fetch).toHaveBeenCalledWith('/api/fpl/entry/158256/');
      expect(result).toEqual({
        teamId: 158256,
        teamName: "Owen's XI",
        managerName: 'Owen Test',
      });
    });

    it('should return overallPoints from summary_overall_points', async () => {
      const mockTeamData = {
        id: 158256,
        name: "Owen's XI",
        player_first_name: 'Owen',
        player_last_name: 'Test',
        summary_overall_points: 427,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeamData,
      });

      const result = await getFPLTeamInfo(158256);

      expect(result.overallPoints).toBe(427);
    });

    it('should return overallRank from summary_overall_rank', async () => {
      const mockTeamData = {
        id: 158256,
        name: "Owen's XI",
        player_first_name: 'Owen',
        player_last_name: 'Test',
        summary_overall_rank: 841192,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeamData,
      });

      const result = await getFPLTeamInfo(158256);

      expect(result.overallRank).toBe(841192);
    });

    it('should return gameweekPoints from summary_event_points', async () => {
      const mockTeamData = {
        id: 158256,
        name: "Owen's XI",
        player_first_name: 'Owen',
        player_last_name: 'Test',
        summary_event_points: 78,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeamData,
      });

      const result = await getFPLTeamInfo(158256);

      expect(result.gameweekPoints).toBe(78);
    });

    it('should return gameweekRank from summary_event_rank', async () => {
      const mockTeamData = {
        id: 158256,
        name: "Owen's XI",
        player_first_name: 'Owen',
        player_last_name: 'Test',
        summary_event_rank: 1656624,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeamData,
      });

      const result = await getFPLTeamInfo(158256);

      expect(result.gameweekRank).toBe(1656624);
    });

    it('should return teamValue in £m from last_deadline_value', async () => {
      const mockTeamData = {
        id: 158256,
        name: "Owen's XI",
        player_first_name: 'Owen',
        player_last_name: 'Test',
        last_deadline_value: 1020,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeamData,
      });

      const result = await getFPLTeamInfo(158256);

      expect(result.teamValue).toBe(102.0);
    });
  });

  describe('getUserMiniLeagues', () => {
    it('should return array of mini-leagues for a team', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          leagues: {
            classic: [
              { id: 123, name: 'Test League', entry_rank: 5 },
              { id: 456, name: 'Another League', entry_rank: 12 },
            ],
          },
        }),
      });

      const result = await getUserMiniLeagues(158256);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 123, name: 'Test League', entryRank: 5 });
      expect(result[1]).toEqual({ id: 456, name: 'Another League', entryRank: 12 });
      expect(fetch).toHaveBeenCalledWith('/api/fpl/entry/158256/');
    });
  });

  describe('getLeagueStandings', () => {
    it('should return standings for a league', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          standings: {
            results: [
              {
                entry: 158256,
                entry_name: 'Team A',
                player_name: 'John Doe',
                rank: 1,
                total: 500,
              },
              {
                entry: 789012,
                entry_name: 'Team B',
                player_name: 'Jane Smith',
                rank: 2,
                total: 480,
              },
            ],
          },
        }),
      });

      const result = await getLeagueStandings(123);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        fplTeamId: 158256,
        teamName: 'Team A',
        managerName: 'John Doe',
        rank: 1,
        totalPoints: 500,
      });
      expect(fetch).toHaveBeenCalledWith('/api/fpl/leagues-classic/123/standings/');
    });
  });
});
```

**Step 4: Run unit tests**

Run: `npm test`

Expected: PASS - all tests pass

**Step 5: Commit**

```bash
git add src/services/fpl.test.ts
git commit -m "$(cat <<'EOF'
test: remove 350 lines of tests for deleted FPL functions

Cleaned up test file to match reduced fpl.ts module.
Tests remain for: getFPLTeamInfo, getUserMiniLeagues, getLeagueStandings

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Final Verification

**Files:**
- All modified files

**Step 1: Run TypeScript build**

Run: `npm run build`

Expected: PASS - no TypeScript errors

**Step 2: Run all unit tests**

Run: `npm test`

Expected: PASS - all tests pass

**Step 3: Run E2E tests**

Run: `npm run test:e2e`

Expected: PASS - all E2E tests pass (some may be skipped, but no failures)

**Step 4: Verify `/league/{id}` route works**

Start dev server and verify manually:

```bash
npm run dev
```

Navigate to: http://localhost:5173/league/314

Expected: Bracket loads correctly

**Step 5: Verify `/knockout/{id}` returns 404**

Navigate to: http://localhost:5173/knockout/314

Expected: Page not found or blank page (route doesn't exist)

**Step 6: Commit verification record**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: complete legacy /knockout route removal

Verification complete:
- Build passes with no TypeScript errors
- All unit tests pass
- All E2E tests pass
- /league/{id} route works correctly
- /knockout/{id} route no longer exists

Summary of changes:
- Deleted: KnockoutPage.tsx (203 lines)
- Deleted: KnockoutPage.test.tsx (223 lines)
- Reduced: fpl.ts from 253 to 83 lines (-170 lines)
- Reduced: fpl.test.ts from 531 to 166 lines (-365 lines)
- Updated: 3 E2E test files
- Updated: router.tsx

Total: ~760 lines of dead code removed

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Verification Checklist

- [ ] No TypeScript errors (`npm run build`)
- [ ] All unit tests pass (`npm test`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] `/league/{id}` route works correctly
- [ ] `/knockout/{id}` returns 404 or blank
- [ ] "Start Knockout" button still works (navigates to `/league/{id}`)
- [ ] `src/services/fpl.ts` reduced to ~83 lines
- [ ] `src/services/fpl.test.ts` reduced to ~166 lines

---

## Files NOT to Modify

These reference "Knockout" as the product name, not the route:

| File | Reason |
|------|--------|
| `PRODUCT.md` | Product name |
| `README.md` | Product name |
| `CLAUDE.md` | Product name |
| `src/components/landing/Hero.tsx` | "KNOCKOUT FPL" headline |
| `src/components/landing/Navbar.tsx` | "KNOCKOUT FPL" logo |
| `src/components/leagues/LeaguePickerCard.tsx` | "Start Knockout" button text |
| `docs/business/**` | Business docs |
| `dataconnect/**` | Package name |
| `functions/**` | Email addresses |
