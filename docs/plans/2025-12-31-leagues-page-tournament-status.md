# Leagues Page Tournament Status

> **Status:** Design approved, ready for implementation
> **Date:** 2025-12-31

## Problem

The leagues page currently shows "Start Knockout" for every league, even when a tournament already exists. It should:
1. Show "Create Tournament" (not "Start Knockout") when no tournament exists
2. Show "View Tournament" when a tournament exists
3. Display the user's progress in the tournament (e.g., "Round 2 of 4", "Eliminated R1", "Winner")

## Design

### Data Model

```typescript
interface LeagueWithTournament {
  // From FPL API (existing)
  id: number;           // fplLeagueId
  name: string;
  entryRank: number;
  memberCount: number;

  // New: Tournament status
  tournament: {
    id: string;
    status: 'active' | 'completed';
    currentRound: number;
    totalRounds: number;
  } | null;

  // New: User's progress (if they're a participant)
  userProgress: {
    status: 'active' | 'eliminated' | 'winner';
    eliminationRound: number | null;
  } | null;
}
```

**Progress display logic:**

| userProgress.status | Display |
|---------------------|---------|
| `'winner'` | "Winner" |
| `'eliminated'` | "Eliminated R{eliminationRound}" |
| `'active'` | "Round {currentRound} of {totalRounds}" |
| `null` (not in bracket) | — (just show "View Tournament") |

**Button logic:**

| tournament | Button |
|------------|--------|
| `null` | "Create Tournament" |
| exists | "View Tournament" |

---

### Fetching Logic

**New service function in `tournament.ts`:**

```typescript
export async function getTournamentSummaryForLeague(
  fplLeagueId: number,
  userFplTeamId: number | null
): Promise<{
  tournament: { id: string; status: string; currentRound: number; totalRounds: number } | null;
  userProgress: { status: string; eliminationRound: number | null } | null;
}>
```

**Flow:**
1. Call `getLeagueTournaments(fplLeagueId)`
2. If no tournament -> return `{ tournament: null, userProgress: null }`
3. If tournament exists and `userFplTeamId` provided -> call `getParticipant(tournamentId, userFplTeamId)`
4. Return combined result

**In LeaguesPage:**
```typescript
// After fetching leagues from FPL API, enrich with tournament data
const leaguesWithTournaments = await Promise.all(
  miniLeagues.map(async (league) => {
    const [standings, tournamentData] = await Promise.all([
      getLeagueStandings(league.id),
      getTournamentSummaryForLeague(league.id, userProfile.fplTeamId)
    ]);
    return {
      ...league,
      memberCount: standings.length,
      ...tournamentData
    };
  })
);
```

All league enrichment queries run in parallel for performance.

---

### UI: Responsive Table

**Desktop (>=768px):** Table layout

| League | Members | Your Rank | Status | Action |
|--------|---------|-----------|--------|--------|
| Man City | 50 | #19249 | — | Create Tournament |
| USA | 50 | #9564 | Round 2 of 4 | View Tournament |
| Gameweek 1 | 50 | #272070 | Eliminated R1 | View Tournament |

**Mobile (<768px):** Stacked rows

```
┌─────────────────────────────────┐
│ Man City                        │
│ 50 members · Rank #19249        │
│ [Create Tournament]             │
├─────────────────────────────────┤
│ USA                             │
│ 50 members · Rank #9564         │
│ Round 2 of 4  [View Tournament] │
└─────────────────────────────────┘
```

- Button always visible (no horizontal scroll)
- Use Tailwind responsive classes for layout switching

**Components used:** `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `Button`, `Badge`, `Skeleton` from shadcn/ui

---

### Loading & Error States

**Loading:**
- Show skeleton table rows while fetching (3-4 placeholder rows)
- Use shadcn `Skeleton` component for each cell
- Button disabled during load

**Error states:**

| Scenario | Handling |
|----------|----------|
| FPL API fails | Show error message with retry button (existing behavior) |
| Tournament query fails for one league | Gracefully degrade — show league without tournament info, button defaults to "Create Tournament" |
| User has no classic leagues | Empty state message (existing) |

---

## File Changes

**New files:**
- `src/components/leagues/LeaguesTable.tsx` — new table component
- `src/components/leagues/LeaguesTable.test.tsx` — tests

**Modified files:**
- `src/services/tournament.ts` — add `getTournamentSummaryForLeague()` function
- `src/pages/LeaguesPage.tsx` — replace `LeaguePickerCard` with `LeaguesTable`, add tournament data fetching
- `src/pages/LeaguesPage.test.tsx` — update tests

**Potentially removable:**
- `src/components/leagues/LeaguePickerCard.tsx` — no longer used (confirm no other usages first)
- `src/components/leagues/LeaguePickerCard.test.tsx` — corresponding tests

**shadcn components to add:**
- `Table` (via `npx shadcn@latest add table`)
- `Skeleton` (via `npx shadcn@latest add skeleton`)

---

## Implementation Order

1. Add shadcn Table and Skeleton components
2. Create `getTournamentSummaryForLeague()` in tournament service
3. Create `LeaguesTable` component with responsive layout
4. Update `LeaguesPage` to use new component and fetch tournament data
5. Update/add tests
6. Remove unused `LeaguePickerCard` if confirmed unused
