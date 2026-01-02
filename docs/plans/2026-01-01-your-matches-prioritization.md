# Your Matches Prioritization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Filter "Your Matches" section to show only live matches (or nearest upcoming if none live), removing clutter from multiple leagues.

**Architecture:** Modify `aggregateMatches()` in `LeaguesPage.tsx` to prioritize live matches, fallback to single nearest upcoming match, and remove recent results entirely.

**Tech Stack:** React, TypeScript, Vitest

---

## Task 1: Extract aggregateMatches to a Testable Function

**Files:**
- Create: `src/lib/aggregateMatches.ts`
- Test: `src/lib/aggregateMatches.test.ts`
- Modify: `src/pages/LeaguesPage.tsx:125-170`

### Step 1: Create the new module with type definitions

Create `src/lib/aggregateMatches.ts`:

```typescript
import type { MatchSummaryCardProps } from '../components/dashboard/MatchSummaryCard';

export interface MatchInput {
  isLive: boolean;
  opponentTeamName: string;
  opponentFplTeamId: number;
  roundName: string;
  yourScore: number | null;
  theirScore: number | null;
  gameweek: number;
  result: 'won' | 'lost' | 'pending';
}

export interface LeagueMatchData {
  leagueId: number;
  leagueName: string;
  currentMatch: MatchInput | null;
}

export interface AggregateMatchesOptions {
  yourTeamName: string;
  yourFplTeamId: number;
  onNavigate: (leagueId: number) => void;
}

/**
 * Aggregates matches from multiple leagues, prioritizing live matches.
 *
 * Priority:
 * 1. All live matches (isLive === true)
 * 2. If no live matches: single nearest upcoming match (lowest gameweek)
 * 3. Recent results are excluded entirely
 */
export function aggregateMatches(
  leagues: LeagueMatchData[],
  options: AggregateMatchesOptions
): MatchSummaryCardProps[] {
  const { yourTeamName, yourFplTeamId, onNavigate } = options;

  const liveMatches: MatchSummaryCardProps[] = [];
  const upcomingMatches: MatchSummaryCardProps[] = [];

  for (const league of leagues) {
    if (!league.currentMatch) continue;

    const match = league.currentMatch;
    const cardProps: MatchSummaryCardProps = {
      type: match.isLive ? 'live' : 'upcoming',
      yourTeamName,
      yourFplTeamId,
      opponentTeamName: match.opponentTeamName,
      opponentFplTeamId: match.opponentFplTeamId,
      leagueName: league.leagueName,
      roundName: match.roundName,
      yourScore: match.yourScore,
      theirScore: match.theirScore,
      gameweek: match.gameweek,
      onClick: () => onNavigate(league.leagueId),
    };

    if (match.isLive) {
      liveMatches.push(cardProps);
    } else {
      upcomingMatches.push(cardProps);
    }
  }

  // Priority 1: Return all live matches
  if (liveMatches.length > 0) {
    return liveMatches;
  }

  // Priority 2: Return single nearest upcoming match
  if (upcomingMatches.length > 0) {
    upcomingMatches.sort((a, b) => (a.gameweek ?? 0) - (b.gameweek ?? 0));
    return [upcomingMatches[0]];
  }

  // No matches to show
  return [];
}
```

### Step 2: Run TypeScript to verify no errors

Run: `npx tsc --noEmit src/lib/aggregateMatches.ts`
Expected: No output (success)

### Step 3: Commit the new module

```bash
git add src/lib/aggregateMatches.ts
git commit -m "feat: add aggregateMatches utility function

Extracts match aggregation logic for testability.
Prioritizes live matches, falls back to nearest upcoming.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Write Tests for aggregateMatches

**Files:**
- Create: `src/lib/aggregateMatches.test.ts`

### Step 1: Write failing tests for all scenarios

Create `src/lib/aggregateMatches.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { aggregateMatches, type LeagueMatchData, type AggregateMatchesOptions } from './aggregateMatches';

describe('aggregateMatches', () => {
  const defaultOptions: AggregateMatchesOptions = {
    yourTeamName: 'My Team',
    yourFplTeamId: 123,
    onNavigate: vi.fn(),
  };

  const createMatch = (overrides: Partial<LeagueMatchData['currentMatch']> & { isLive: boolean; gameweek: number }) => ({
    opponentTeamName: 'Opponent',
    opponentFplTeamId: 456,
    roundName: 'Round 1',
    yourScore: null,
    theirScore: null,
    result: 'pending' as const,
    ...overrides,
  });

  describe('live matches priority', () => {
    it('returns all live matches when present', () => {
      const leagues: LeagueMatchData[] = [
        { leagueId: 1, leagueName: 'League A', currentMatch: createMatch({ isLive: true, gameweek: 15 }) },
        { leagueId: 2, leagueName: 'League B', currentMatch: createMatch({ isLive: true, gameweek: 15 }) },
        { leagueId: 3, leagueName: 'League C', currentMatch: createMatch({ isLive: false, gameweek: 16 }) },
      ];

      const result = aggregateMatches(leagues, defaultOptions);

      expect(result).toHaveLength(2);
      expect(result.every(m => m.type === 'live')).toBe(true);
    });

    it('returns single live match when only one exists', () => {
      const leagues: LeagueMatchData[] = [
        { leagueId: 1, leagueName: 'League A', currentMatch: createMatch({ isLive: true, gameweek: 15 }) },
        { leagueId: 2, leagueName: 'League B', currentMatch: createMatch({ isLive: false, gameweek: 16 }) },
      ];

      const result = aggregateMatches(leagues, defaultOptions);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('live');
      expect(result[0].leagueName).toBe('League A');
    });
  });

  describe('upcoming match fallback', () => {
    it('returns single nearest upcoming when no live matches', () => {
      const leagues: LeagueMatchData[] = [
        { leagueId: 1, leagueName: 'League A', currentMatch: createMatch({ isLive: false, gameweek: 18 }) },
        { leagueId: 2, leagueName: 'League B', currentMatch: createMatch({ isLive: false, gameweek: 16 }) },
        { leagueId: 3, leagueName: 'League C', currentMatch: createMatch({ isLive: false, gameweek: 17 }) },
      ];

      const result = aggregateMatches(leagues, defaultOptions);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('upcoming');
      expect(result[0].leagueName).toBe('League B'); // gameweek 16 is nearest
      expect(result[0].gameweek).toBe(16);
    });

    it('returns first match when multiple have same gameweek', () => {
      const leagues: LeagueMatchData[] = [
        { leagueId: 1, leagueName: 'League A', currentMatch: createMatch({ isLive: false, gameweek: 16 }) },
        { leagueId: 2, leagueName: 'League B', currentMatch: createMatch({ isLive: false, gameweek: 16 }) },
      ];

      const result = aggregateMatches(leagues, defaultOptions);

      expect(result).toHaveLength(1);
      // Sort is stable, so first one wins
    });
  });

  describe('empty states', () => {
    it('returns empty array when no leagues', () => {
      const result = aggregateMatches([], defaultOptions);
      expect(result).toEqual([]);
    });

    it('returns empty array when all leagues have no currentMatch', () => {
      const leagues: LeagueMatchData[] = [
        { leagueId: 1, leagueName: 'League A', currentMatch: null },
        { leagueId: 2, leagueName: 'League B', currentMatch: null },
      ];

      const result = aggregateMatches(leagues, defaultOptions);
      expect(result).toEqual([]);
    });
  });

  describe('match properties', () => {
    it('includes correct properties in returned match', () => {
      const leagues: LeagueMatchData[] = [
        {
          leagueId: 42,
          leagueName: 'Test League',
          currentMatch: {
            isLive: true,
            opponentTeamName: 'Rival FC',
            opponentFplTeamId: 789,
            roundName: 'Semi-Final',
            yourScore: 55,
            theirScore: 48,
            gameweek: 15,
            result: 'pending',
          },
        },
      ];

      const result = aggregateMatches(leagues, defaultOptions);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'live',
        yourTeamName: 'My Team',
        yourFplTeamId: 123,
        opponentTeamName: 'Rival FC',
        opponentFplTeamId: 789,
        leagueName: 'Test League',
        roundName: 'Semi-Final',
        yourScore: 55,
        theirScore: 48,
        gameweek: 15,
      });
    });

    it('attaches onClick handler that navigates to league', () => {
      const onNavigate = vi.fn();
      const leagues: LeagueMatchData[] = [
        { leagueId: 42, leagueName: 'League A', currentMatch: createMatch({ isLive: true, gameweek: 15 }) },
      ];

      const result = aggregateMatches(leagues, { ...defaultOptions, onNavigate });

      result[0].onClick?.();
      expect(onNavigate).toHaveBeenCalledWith(42);
    });
  });

  describe('excludes recent results', () => {
    it('does not include recentResult matches (handled by not passing them)', () => {
      // This test documents that recentResult is not part of LeagueMatchData
      // The function only processes currentMatch, so recent results are automatically excluded
      const leagues: LeagueMatchData[] = [
        { leagueId: 1, leagueName: 'League A', currentMatch: null },
      ];

      const result = aggregateMatches(leagues, defaultOptions);
      expect(result).toEqual([]);
    });
  });
});
```

### Step 2: Run tests to verify they pass

Run: `npm test -- src/lib/aggregateMatches.test.ts`
Expected: All 10 tests pass

### Step 3: Commit the tests

```bash
git add src/lib/aggregateMatches.test.ts
git commit -m "test: add comprehensive tests for aggregateMatches

Covers live priority, upcoming fallback, empty states, and properties.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Update LeaguesPage to Use New Function

**Files:**
- Modify: `src/pages/LeaguesPage.tsx:125-170`

### Step 1: Import the new function

At top of `src/pages/LeaguesPage.tsx`, add import:

```typescript
import { aggregateMatches, type LeagueMatchData } from '../lib/aggregateMatches';
```

### Step 2: Replace the aggregateMatches function

Replace the existing `aggregateMatches` function (lines 125-170) with:

```typescript
  // Transform league data to YourMatchesSection format
  const getMatches = (): MatchSummaryCardProps[] => {
    const leagueMatchData: LeagueMatchData[] = leagues.map((league) => ({
      leagueId: league.id,
      leagueName: league.name,
      currentMatch: league.userProgress?.currentMatch
        ? {
            isLive: league.userProgress.currentMatch.isLive,
            opponentTeamName: league.userProgress.currentMatch.opponentTeamName,
            opponentFplTeamId: league.userProgress.currentMatch.opponentFplTeamId,
            roundName: league.userProgress.currentMatch.roundName,
            yourScore: league.userProgress.currentMatch.yourScore,
            theirScore: league.userProgress.currentMatch.theirScore,
            gameweek: league.userProgress.currentMatch.gameweek,
            result: league.userProgress.currentMatch.result,
          }
        : null,
    }));

    return aggregateMatches(leagueMatchData, {
      yourTeamName: teamInfo?.teamName ?? 'My Team',
      yourFplTeamId: teamInfo?.teamId ?? 0,
      onNavigate: (leagueId) => navigate(`/league/${leagueId}`),
    });
  };
```

### Step 3: Update the variable usage

Find where `aggregateMatches()` is called (around line 206) and replace with `getMatches()`:

```typescript
  const matches = getMatches();
```

### Step 4: Run tests to verify no regressions

Run: `npm test -- src/pages/LeaguesPage.test.tsx`
Expected: All existing tests pass

### Step 5: Commit the integration

```bash
git add src/pages/LeaguesPage.tsx
git commit -m "refactor: use aggregateMatches utility in LeaguesPage

Prioritizes live matches, shows single upcoming as fallback.
Removes recent results from Your Matches section.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Update LeaguesPage Tests

**Files:**
- Modify: `src/pages/LeaguesPage.test.tsx`

### Step 1: Add test for live match prioritization

Add to the `Matches Display` describe block:

```typescript
    it('shows only live matches when multiple matches exist', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { uid: 'test-uid', email: 'test@example.com', displayName: 'Test User' } as any,
        loading: false,
        isAuthenticated: true,
        connectionError: false,
      });

      vi.mocked(userService.getUserProfile).mockResolvedValue({
        userId: 'test-uid',
        fplTeamId: 123456,
        fplTeamName: 'Test Team',
        email: 'test@example.com',
        displayName: 'Test User',
        wins: 0,
        losses: 0,
        createdAt: {} as any,
        updatedAt: {} as any,
      });

      vi.mocked(fplService.getUserMiniLeagues).mockResolvedValue([
        { id: 123, name: 'League A', entryRank: 1 },
        { id: 456, name: 'League B', entryRank: 2 },
      ]);

      vi.mocked(fplService.getLeagueStandings).mockResolvedValue([
        { fplTeamId: 1, teamName: 'Team 1', managerName: 'Manager 1', rank: 1, totalPoints: 100 },
      ]);

      // League A has live match, League B has upcoming
      vi.mocked(tournamentService.getTournamentSummaryForLeague)
        .mockResolvedValueOnce({
          tournament: { id: 't1', status: 'active', currentRound: 1, totalRounds: 4, startGameweek: 15, endGameweek: 18 },
          userProgress: {
            status: 'active',
            eliminationRound: null,
            currentRoundName: 'Round 1',
            currentMatch: {
              opponentTeamName: 'Live Opponent',
              opponentManagerName: 'Manager',
              opponentFplTeamId: 789,
              roundNumber: 1,
              roundName: 'Round 1',
              gameweek: 15,
              yourScore: 50,
              theirScore: 45,
              isLive: true,
              result: 'pending',
            },
            recentResult: null,
            nextOpponent: null,
          },
        })
        .mockResolvedValueOnce({
          tournament: { id: 't2', status: 'active', currentRound: 1, totalRounds: 4, startGameweek: 16, endGameweek: 19 },
          userProgress: {
            status: 'active',
            eliminationRound: null,
            currentRoundName: 'Round 1',
            currentMatch: {
              opponentTeamName: 'Upcoming Opponent',
              opponentManagerName: 'Manager',
              opponentFplTeamId: 999,
              roundNumber: 1,
              roundName: 'Round 1',
              gameweek: 16,
              yourScore: null,
              theirScore: null,
              isLive: false,
              result: 'pending',
            },
            recentResult: null,
            nextOpponent: null,
          },
        });

      renderWithRouter(<LeaguesPage />);

      // Should show the live opponent, not the upcoming one
      await waitFor(() => {
        expect(screen.getByText(/Live Opponent/)).toBeInTheDocument();
      });
      expect(screen.queryByText(/Upcoming Opponent/)).not.toBeInTheDocument();
    });
```

### Step 2: Add test for upcoming fallback

Add to the `Matches Display` describe block:

```typescript
    it('shows nearest upcoming match when no live matches', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { uid: 'test-uid', email: 'test@example.com', displayName: 'Test User' } as any,
        loading: false,
        isAuthenticated: true,
        connectionError: false,
      });

      vi.mocked(userService.getUserProfile).mockResolvedValue({
        userId: 'test-uid',
        fplTeamId: 123456,
        fplTeamName: 'Test Team',
        email: 'test@example.com',
        displayName: 'Test User',
        wins: 0,
        losses: 0,
        createdAt: {} as any,
        updatedAt: {} as any,
      });

      vi.mocked(fplService.getUserMiniLeagues).mockResolvedValue([
        { id: 123, name: 'League A', entryRank: 1 },
        { id: 456, name: 'League B', entryRank: 2 },
      ]);

      vi.mocked(fplService.getLeagueStandings).mockResolvedValue([
        { fplTeamId: 1, teamName: 'Team 1', managerName: 'Manager 1', rank: 1, totalPoints: 100 },
      ]);

      // Both leagues have upcoming matches, different gameweeks
      vi.mocked(tournamentService.getTournamentSummaryForLeague)
        .mockResolvedValueOnce({
          tournament: { id: 't1', status: 'active', currentRound: 1, totalRounds: 4, startGameweek: 18, endGameweek: 21 },
          userProgress: {
            status: 'active',
            eliminationRound: null,
            currentRoundName: 'Round 1',
            currentMatch: {
              opponentTeamName: 'Far Opponent',
              opponentManagerName: 'Manager',
              opponentFplTeamId: 789,
              roundNumber: 1,
              roundName: 'Round 1',
              gameweek: 18,
              yourScore: null,
              theirScore: null,
              isLive: false,
              result: 'pending',
            },
            recentResult: null,
            nextOpponent: null,
          },
        })
        .mockResolvedValueOnce({
          tournament: { id: 't2', status: 'active', currentRound: 1, totalRounds: 4, startGameweek: 16, endGameweek: 19 },
          userProgress: {
            status: 'active',
            eliminationRound: null,
            currentRoundName: 'Round 1',
            currentMatch: {
              opponentTeamName: 'Near Opponent',
              opponentManagerName: 'Manager',
              opponentFplTeamId: 999,
              roundNumber: 1,
              roundName: 'Round 1',
              gameweek: 16,
              yourScore: null,
              theirScore: null,
              isLive: false,
              result: 'pending',
            },
            recentResult: null,
            nextOpponent: null,
          },
        });

      renderWithRouter(<LeaguesPage />);

      // Should show only the nearest upcoming (gameweek 16)
      await waitFor(() => {
        expect(screen.getByText(/Near Opponent/)).toBeInTheDocument();
      });
      expect(screen.queryByText(/Far Opponent/)).not.toBeInTheDocument();
    });
```

### Step 3: Run all LeaguesPage tests

Run: `npm test -- src/pages/LeaguesPage.test.tsx`
Expected: All tests pass (existing + 2 new)

### Step 4: Commit the test updates

```bash
git add src/pages/LeaguesPage.test.tsx
git commit -m "test: add LeaguesPage tests for match prioritization

Tests live match priority and upcoming match fallback behavior.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Run Full Test Suite and Verify

**Files:** None (verification only)

### Step 1: Run full test suite

Run: `npm test`
Expected: All tests pass

### Step 2: Start dev server for manual verification

Run: `npm run dev`

### Step 3: Manual verification checklist

- [ ] Navigate to leagues page
- [ ] Verify Your Matches section shows expected matches
- [ ] Check console for errors: `mcp__playwright__browser_console_messages`
- [ ] If live matches exist, only those are shown
- [ ] If no live, only single nearest upcoming shown
- [ ] Recent results no longer appear in Your Matches

### Step 4: Final commit with design doc update

Update the design doc status and commit:

```bash
# Update status in design doc from "Approved" to "Implemented"
sed -i '' 's/Status: Approved/Status: Implemented/' docs/plans/2026-01-01-your-matches-prioritization-design.md

git add docs/plans/2026-01-01-your-matches-prioritization-design.md
git commit -m "docs: mark Your Matches prioritization as implemented

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary

| Task | Files | Tests |
|------|-------|-------|
| 1. Extract function | `src/lib/aggregateMatches.ts` | - |
| 2. Write tests | `src/lib/aggregateMatches.test.ts` | 10 new |
| 3. Update LeaguesPage | `src/pages/LeaguesPage.tsx` | - |
| 4. Update page tests | `src/pages/LeaguesPage.test.tsx` | 2 new |
| 5. Verify | - | Full suite |

**Total commits:** 6
**Estimated test count:** 12 new tests
