# Matches Tab Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the Matches tab to browse all matches by round with user's match highlighted at top.

**Architecture:** Rename `BracketMatchCard` to `CompactMatchCard` with flexible width, then build `MatchesTab` with round selector dropdown and two sections (You, Everyone Else).

**Tech Stack:** React, TypeScript, shadcn/ui (Select, Card), Tailwind CSS

---

## Task 1: Rename BracketMatchCard to CompactMatchCard

**Files:**
- Rename: `src/components/tournament/BracketMatchCard.tsx` → `src/components/tournament/CompactMatchCard.tsx`
- Modify: `src/components/tournament/BracketRound.tsx:3,38`
- Modify: `src/components/tournament/index.ts` (if exists, update export)

**Step 1: Rename the file**

```bash
git mv src/components/tournament/BracketMatchCard.tsx src/components/tournament/CompactMatchCard.tsx
```

**Step 2: Update component name in CompactMatchCard.tsx**

Change the interface name and export:

```tsx
// Old (line 8-15):
interface BracketMatchCardProps {
  match: Match;
  participants: Participant[];
  roundStarted: boolean;
  gameweek: number;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
}

// New:
interface CompactMatchCardProps {
  match: Match;
  participants: Participant[];
  roundStarted: boolean;
  gameweek: number;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
  className?: string;
}
```

```tsx
// Old (line 17-24):
export function BracketMatchCard({
  match,
  participants,
  roundStarted,
  gameweek,
  isAuthenticated = false,
  onClaimTeam,
}: BracketMatchCardProps) {

// New:
export function CompactMatchCard({
  match,
  participants,
  roundStarted,
  gameweek,
  isAuthenticated = false,
  onClaimTeam,
  className,
}: CompactMatchCardProps) {
```

**Step 3: Make width flexible via className**

```tsx
// Old (line 109):
return (
  <Card className="w-44 overflow-hidden">

// New:
return (
  <Card className={cn("overflow-hidden", className)}>
```

Add `cn` import at top if not present:
```tsx
import { cn } from '@/lib/utils';
```

**Step 4: Update BracketRound.tsx import and usage**

```tsx
// Old (line 3):
import { BracketMatchCard } from './BracketMatchCard';

// New:
import { CompactMatchCard } from './CompactMatchCard';
```

```tsx
// Old (line 38-46):
<BracketMatchCard
  key={match.id}
  match={match}
  participants={participants}
  roundStarted={roundStarted}
  gameweek={round.gameweek}
  isAuthenticated={isAuthenticated}
  onClaimTeam={onClaimTeam}
/>

// New:
<CompactMatchCard
  key={match.id}
  match={match}
  participants={participants}
  roundStarted={roundStarted}
  gameweek={round.gameweek}
  isAuthenticated={isAuthenticated}
  onClaimTeam={onClaimTeam}
  className="w-44"
/>
```

**Step 5: Run app to verify bracket still works**

```bash
npm run dev
```

Navigate to a tournament's Bracket tab - matches should render identically.

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: rename BracketMatchCard to CompactMatchCard

- Add className prop for flexible width control
- Update BracketRound to pass w-44 explicitly
- Prepares component for reuse in MatchesTab"
```

---

## Task 2: Add getRoundStatus utility function

**Files:**
- Create: `src/lib/tournament-utils.ts`

**Step 1: Create the utility file**

```typescript
// src/lib/tournament-utils.ts

export type RoundStatus = 'upcoming' | 'live' | 'complete';

/**
 * Determines the status of a round based on gameweek and completion.
 */
export function getRoundStatus(
  roundGameweek: number,
  currentGameweek: number,
  isComplete: boolean
): RoundStatus {
  if (isComplete) {
    return 'complete';
  }
  if (roundGameweek < currentGameweek) {
    // Past gameweek but not marked complete - treat as complete
    return 'complete';
  }
  if (roundGameweek === currentGameweek) {
    return 'live';
  }
  return 'upcoming';
}

/**
 * Returns display text for round status.
 */
export function getRoundStatusDisplay(status: RoundStatus): string {
  switch (status) {
    case 'live':
      return 'Live';
    case 'complete':
      return 'Complete';
    case 'upcoming':
      return 'Upcoming';
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/tournament-utils.ts
git commit -m "feat: add getRoundStatus utility for round status display"
```

---

## Task 3: Implement MatchesTab component

**Files:**
- Modify: `src/components/tournament/tabs/MatchesTab.tsx`

**Step 1: Add imports and interface**

Replace the entire file with:

```tsx
// src/components/tournament/tabs/MatchesTab.tsx
import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CompactMatchCard } from '../CompactMatchCard';
import { getRoundStatus, getRoundStatusDisplay } from '@/lib/tournament-utils';
import { cn } from '@/lib/utils';
import type { Tournament, Participant, Match, Round } from '@/types/tournament';

interface MatchesTabProps {
  tournament: Tournament;
  participants: Participant[];
  userFplTeamId?: number;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
}

export function MatchesTab({
  tournament,
  participants,
  userFplTeamId,
  isAuthenticated,
  onClaimTeam,
}: MatchesTabProps) {
  // Default to current round
  const [selectedRoundNumber, setSelectedRoundNumber] = useState(
    tournament.currentRound
  );

  // Get selected round data
  const selectedRound = useMemo(() => {
    return tournament.rounds.find((r) => r.roundNumber === selectedRoundNumber);
  }, [tournament.rounds, selectedRoundNumber]);

  // Get matches for selected round
  const matches = selectedRound?.matches ?? [];

  // Find user's match in this round
  const userMatch = useMemo(() => {
    if (!userFplTeamId) return null;
    return matches.find(
      (match) =>
        match.player1?.fplTeamId === userFplTeamId ||
        match.player2?.fplTeamId === userFplTeamId
    );
  }, [matches, userFplTeamId]);

  // Everyone else = all matches except user's
  const otherMatches = useMemo(() => {
    if (!userMatch) return matches;
    return matches.filter((match) => match.id !== userMatch.id);
  }, [matches, userMatch]);

  // Round status for display
  const roundStatus = selectedRound
    ? getRoundStatus(
        selectedRound.gameweek,
        tournament.currentGameweek,
        selectedRound.isComplete
      )
    : 'upcoming';

  const roundStarted =
    selectedRound && selectedRound.gameweek <= tournament.currentGameweek;

  return (
    <div className="space-y-6">
      {/* Round Selector */}
      <div className="space-y-2">
        <Select
          value={String(selectedRoundNumber)}
          onValueChange={(value) => setSelectedRoundNumber(Number(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select round" />
          </SelectTrigger>
          <SelectContent>
            {tournament.rounds.map((round) => (
              <SelectItem key={round.roundNumber} value={String(round.roundNumber)}>
                <span className="flex items-center gap-2">
                  {round.name}
                  {round.roundNumber === tournament.currentRound && (
                    <span className="text-xs text-muted-foreground">(current)</span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Round Status Line */}
        {selectedRound && (
          <p className="text-sm text-muted-foreground">
            GW{selectedRound.gameweek} •{' '}
            <span
              className={cn(
                roundStatus === 'live' && 'text-green-600 dark:text-green-400'
              )}
            >
              {getRoundStatusDisplay(roundStatus)}
            </span>
          </p>
        )}
      </div>

      {/* You Section */}
      {userMatch && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            You
          </h3>
          <CompactMatchCard
            match={userMatch}
            participants={participants}
            roundStarted={roundStarted ?? false}
            gameweek={selectedRound?.gameweek ?? 0}
            isAuthenticated={isAuthenticated}
            onClaimTeam={onClaimTeam}
            className="w-full border-2 border-primary"
          />
        </section>
      )}

      {/* Everyone Else Section */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          {userMatch ? 'Everyone Else' : 'All Matches'}
        </h3>
        {otherMatches.length > 0 ? (
          <div className="space-y-2">
            {otherMatches.map((match) => (
              <CompactMatchCard
                key={match.id}
                match={match}
                participants={participants}
                roundStarted={roundStarted ?? false}
                gameweek={selectedRound?.gameweek ?? 0}
                isAuthenticated={isAuthenticated}
                onClaimTeam={onClaimTeam}
                className="w-full"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No matches in this round.</p>
        )}
      </section>
    </div>
  );
}
```

**Step 2: Run dev server to verify it compiles**

```bash
npm run dev
```

Check for TypeScript errors in terminal.

**Step 3: Commit**

```bash
git add src/components/tournament/tabs/MatchesTab.tsx
git commit -m "feat: implement MatchesTab with round selector and sections

- Round selector dropdown defaults to current round
- Shows round status (GW + Live/Complete/Upcoming)
- You section: user's match with accent border
- Everyone Else section: all other matches
- Uses CompactMatchCard for consistent styling"
```

---

## Task 4: Wire up MatchesTab props in TournamentView

**Files:**
- Modify: `src/components/tournament/TournamentView.tsx:419-421`

**Step 1: Update MatchesTab usage to pass props**

Find line 419-421:
```tsx
<TabsContent value="matches" className="mt-6">
  <MatchesTab />
</TabsContent>
```

Replace with:
```tsx
<TabsContent value="matches" className="mt-6">
  <MatchesTab
    tournament={tournament}
    participants={tournament.participants}
    userFplTeamId={userFplTeamId ?? undefined}
    isAuthenticated={isAuthenticated}
    onClaimTeam={onClaimTeam}
  />
</TabsContent>
```

**Step 2: Run dev server and test**

```bash
npm run dev
```

1. Navigate to a tournament
2. Click the "Matches" tab
3. Verify:
   - Round selector shows all rounds
   - Current round is selected by default
   - Status line shows "GW{X} • Live/Complete/Upcoming"
   - If logged in as participant, "You" section appears with your match
   - "Everyone Else" section shows remaining matches
   - Switching rounds updates the match list

**Step 3: Commit**

```bash
git add src/components/tournament/TournamentView.tsx
git commit -m "feat: wire up MatchesTab props in TournamentView

Passes tournament, participants, userFplTeamId, isAuthenticated,
and onClaimTeam to enable full Matches tab functionality."
```

---

## Task 5: Manual E2E verification

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Test scenarios**

Use Playwright MCP or manual browser testing:

| Scenario | Expected |
|----------|----------|
| Unauthenticated user | No "You" section, just "All Matches" |
| Authenticated user in tournament | "You" section with accent border, "Everyone Else" below |
| Switch rounds | Matches update, status line updates |
| Round with no user match | No "You" section |
| Complete round | Status shows "Complete" |
| Live round | Status shows "Live" in green |
| Upcoming round | Status shows "Upcoming" |

**Step 3: Check console for errors**

No errors should appear in browser console.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Matches tab implementation

Implements browsable matches view with:
- Round selector dropdown (defaults to current)
- Round status display (Live/Complete/Upcoming)
- You section (when user has match in round)
- Everyone Else section (all other matches)

Part of scalable cup view design."
```

---

## Summary

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Rename BracketMatchCard → CompactMatchCard | refactor: rename... |
| 2 | Add getRoundStatus utility | feat: add getRoundStatus... |
| 3 | Implement MatchesTab component | feat: implement MatchesTab... |
| 4 | Wire up props in TournamentView | feat: wire up MatchesTab... |
| 5 | Manual E2E verification | feat: complete Matches tab... |

Total: ~5 commits, ~30 minutes implementation time.
