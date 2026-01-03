# User Path Bracket Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace position-based paginated bracket with user-centric path view showing focal team's journey to the final with opponent histories.

**Architecture:** Two-phase data fetching (user path via existing query, opponent histories via new query). UserPathBracket component renders the focal team's path horizontally with opponent match histories below each future match.

**Tech Stack:** React, TypeScript, Firebase DataConnect (GraphQL), shadcn/ui components

---

## Task 1: Add GetOpponentMatchHistories Query

**Files:**
- Modify: `dataconnect/connector/queries.gql`

**Step 1: Add the query**

Add at the end of the file (before the closing):

```graphql
# =============================================================================
# USER PATH BRACKET QUERIES
# =============================================================================

# Get match histories for multiple opponents in a tournament
# Used to show how opponents reached their current position
query GetOpponentMatchHistories(
  $tournamentId: UUID!
  $entryIds: [Int!]!
) @auth(level: PUBLIC) {
  matchPicks(
    where: {
      tournamentId: { eq: $tournamentId }
      entryId: { in: $entryIds }
    }
    orderBy: [{ entryId: ASC }, { matchId: ASC }]
  ) {
    entryId
    slot
    match {
      matchId
      roundNumber
      positionInRound
      status
      winnerEntryId
      isBye
      matchPicks_on_match {
        entryId
        slot
        participant {
          entryId
          teamName
          managerName
          seed
        }
      }
    }
  }
}
```

**Step 2: Regenerate DataConnect SDK**

Run: `npm run dataconnect:generate`

Expected: SDK regenerated with new `getOpponentMatchHistories` function

**Step 3: Commit**

```bash
git add dataconnect/connector/queries.gql dataconnect/dataconnect-generated/
git commit -m "feat: add GetOpponentMatchHistories query for user path bracket"
```

---

## Task 2: Add GetHighestSeedRemaining Query

**Files:**
- Modify: `dataconnect/connector/queries.gql`

**Step 1: Add the query**

Add after GetOpponentMatchHistories:

```graphql
# Get highest seed still active in tournament (for spectator default view)
query GetHighestSeedRemaining(
  $tournamentId: UUID!
) @auth(level: PUBLIC) {
  participants(
    where: {
      tournamentId: { eq: $tournamentId }
      status: { eq: "active" }
    }
    orderBy: { seed: ASC }
    limit: 1
  ) {
    entryId
    teamName
    managerName
    seed
  }
}
```

**Step 2: Regenerate DataConnect SDK**

Run: `npm run dataconnect:generate`

Expected: SDK regenerated with new `getHighestSeedRemaining` function

**Step 3: Commit**

```bash
git add dataconnect/connector/queries.gql dataconnect/dataconnect-generated/
git commit -m "feat: add GetHighestSeedRemaining query for spectator default"
```

---

## Task 3: Add fetchOpponentHistories Service Function

**Files:**
- Modify: `src/services/tournament.ts`

**Step 1: Add import**

At the top of the file, add `getOpponentMatchHistories` to the imports from `@knockoutfpl/dataconnect`:

```typescript
import {
  getLeagueTournaments,
  getTournamentWithParticipants,
  getTournamentRounds,
  getRoundMatches,
  getAllTournamentMatchPicks,
  getPicksForEvent,
  getCurrentEvent,
  getUserTournamentMatches,
  getOpponentMatchHistories,  // Add this
} from '@knockoutfpl/dataconnect';
```

**Step 2: Add interface and function**

Add after the `fetchUserTournamentMatches` function:

```typescript
/**
 * Match info for opponent history display
 */
export interface OpponentMatchInfo {
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  entryId: number;
  teamName: string;
  managerName: string;
  seed: number;
  opponentTeamName: string | null;
  opponentSeed: number | null;
  status: 'pending' | 'active' | 'complete';
  won: boolean | null; // null if not complete
  isBye: boolean;
}

/**
 * Fetch match histories for multiple opponents.
 * Returns a map of entryId -> array of matches they played.
 */
export async function fetchOpponentHistories(
  tournamentId: string,
  opponentEntryIds: number[]
): Promise<Map<number, OpponentMatchInfo[]>> {
  if (opponentEntryIds.length === 0) {
    return new Map();
  }

  const result = await getOpponentMatchHistories(dataConnect, {
    tournamentId: tournamentId as UUIDString,
    entryIds: opponentEntryIds,
  });

  const historyMap = new Map<number, OpponentMatchInfo[]>();

  for (const pick of result.data.matchPicks || []) {
    const match = pick.match;

    // Find opponent in this match
    const opponentPick = match.matchPicks_on_match?.find(
      (p) => p.entryId !== pick.entryId
    );

    const matchInfo: OpponentMatchInfo = {
      matchId: match.matchId,
      roundNumber: match.roundNumber,
      positionInRound: match.positionInRound,
      entryId: pick.entryId,
      teamName: pick.participant?.teamName ?? 'Unknown',
      managerName: pick.participant?.managerName ?? '',
      seed: pick.participant?.seed ?? 0,
      opponentTeamName: opponentPick?.participant?.teamName ?? null,
      opponentSeed: opponentPick?.participant?.seed ?? null,
      status: match.status as 'pending' | 'active' | 'complete',
      won: match.status === 'complete' ? match.winnerEntryId === pick.entryId : null,
      isBye: match.isBye,
    };

    if (!historyMap.has(pick.entryId)) {
      historyMap.set(pick.entryId, []);
    }
    historyMap.get(pick.entryId)!.push(matchInfo);
  }

  // Sort each entry's matches by round number
  for (const [entryId, matches] of historyMap) {
    matches.sort((a, b) => a.roundNumber - b.roundNumber);
    historyMap.set(entryId, matches);
  }

  return historyMap;
}
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 4: Commit**

```bash
git add src/services/tournament.ts
git commit -m "feat: add fetchOpponentHistories service function"
```

---

## Task 4: Add fetchHighestSeedRemaining Service Function

**Files:**
- Modify: `src/services/tournament.ts`

**Step 1: Add import**

Add `getHighestSeedRemaining` to the imports:

```typescript
import {
  // ... existing imports ...
  getOpponentMatchHistories,
  getHighestSeedRemaining,  // Add this
} from '@knockoutfpl/dataconnect';
```

**Step 2: Add interface and function**

Add after `fetchOpponentHistories`:

```typescript
/**
 * Basic participant info for focal team selection
 */
export interface FocalTeamInfo {
  entryId: number;
  teamName: string;
  managerName: string;
  seed: number;
}

/**
 * Fetch the highest seed still active in the tournament.
 * Used as default focal team for spectators.
 */
export async function fetchHighestSeedRemaining(
  tournamentId: string
): Promise<FocalTeamInfo | null> {
  const result = await getHighestSeedRemaining(dataConnect, {
    tournamentId: tournamentId as UUIDString,
  });

  const participant = result.data.participants?.[0];
  if (!participant) return null;

  return {
    entryId: participant.entryId,
    teamName: participant.teamName,
    managerName: participant.managerName,
    seed: participant.seed,
  };
}
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 4: Commit**

```bash
git add src/services/tournament.ts
git commit -m "feat: add fetchHighestSeedRemaining service function"
```

---

## Task 5: Create PathMatchCard Component

**Files:**
- Create: `src/components/tournament/PathMatchCard.tsx`

**Step 1: Create the component**

```typescript
// src/components/tournament/PathMatchCard.tsx
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';
import { getFplTeamUrl } from '../../lib/fpl-urls';
import type { UserMatchInfo } from '../../services/tournament';

interface PathMatchCardProps {
  match: UserMatchInfo;
  isFocalTeam: boolean;
  currentGameweek: number;
}

/**
 * Displays a match on the user's path to the final.
 * Highlighted styling for the focal team's matches.
 */
export function PathMatchCard({
  match,
  isFocalTeam,
  currentGameweek,
}: PathMatchCardProps) {
  const roundStarted = match.gameweek <= currentGameweek;
  const showScores = roundStarted && match.yourScore !== null;

  const renderPlayerRow = (
    teamName: string,
    seed: number | null,
    score: number | null,
    fplTeamId: number | null,
    isWinner: boolean,
    isLoser: boolean,
    isBye: boolean = false
  ) => {
    if (isBye) {
      return (
        <div className="flex justify-between items-center px-3 py-2 text-muted-foreground text-sm">
          <span>BYE</span>
        </div>
      );
    }

    if (!teamName) {
      return (
        <div className="flex justify-between items-center px-3 py-2 text-muted-foreground text-sm">
          <span>TBD</span>
        </div>
      );
    }

    const content = (
      <div
        className={cn(
          "flex justify-between items-center px-3 py-2 text-sm",
          isWinner && "font-semibold bg-green-50 dark:bg-green-950",
          isLoser && "opacity-50"
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="truncate">{teamName}</span>
          {seed !== null && !showScores && (
            <span className="text-muted-foreground text-xs">({seed})</span>
          )}
        </div>
        {showScores && score !== null && (
          <span className={cn(
            "tabular-nums font-medium",
            isWinner && "text-green-600 dark:text-green-400"
          )}>
            {score}
          </span>
        )}
      </div>
    );

    if (fplTeamId) {
      return (
        <a
          href={getFplTeamUrl(fplTeamId, match.gameweek, roundStarted)}
          target="_blank"
          rel="noopener noreferrer"
          className="block cursor-pointer hover:bg-muted/50 transition-colors"
        >
          {content}
        </a>
      );
    }

    return content;
  };

  const yourWon = match.result === 'won';
  const yourLost = match.result === 'lost';
  const opponentWon = match.result === 'lost';
  const opponentLost = match.result === 'won';

  return (
    <Card className={cn(
      "w-48 overflow-hidden",
      isFocalTeam && "ring-2 ring-primary"
    )}>
      {/* Round header */}
      <div className="px-3 py-1.5 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
        {match.roundName}
      </div>

      {/* Your team */}
      {renderPlayerRow(
        match.yourTeamName,
        match.yourSeed,
        match.yourScore,
        match.yourFplTeamId,
        yourWon,
        yourLost
      )}

      <div className="border-t" />

      {/* Opponent */}
      {match.isBye ? (
        renderPlayerRow('', null, null, null, false, false, true)
      ) : (
        renderPlayerRow(
          match.opponentTeamName ?? 'TBD',
          match.opponentSeed,
          match.opponentScore,
          match.opponentFplTeamId,
          opponentWon,
          opponentLost
        )
      )}
    </Card>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 3: Commit**

```bash
git add src/components/tournament/PathMatchCard.tsx
git commit -m "feat: add PathMatchCard component for user path display"
```

---

## Task 6: Create HistoryMatchCard Component

**Files:**
- Create: `src/components/tournament/HistoryMatchCard.tsx`

**Step 1: Create the component**

```typescript
// src/components/tournament/HistoryMatchCard.tsx
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';
import type { OpponentMatchInfo } from '../../services/tournament';

interface HistoryMatchCardProps {
  match: OpponentMatchInfo;
}

/**
 * Displays a match from an opponent's history.
 * Smaller, muted styling compared to PathMatchCard.
 */
export function HistoryMatchCard({ match }: HistoryMatchCardProps) {
  const renderPlayerRow = (
    teamName: string,
    seed: number | null,
    isWinner: boolean,
    isLoser: boolean,
    isBye: boolean = false
  ) => {
    if (isBye) {
      return (
        <div className="flex justify-between items-center px-2 py-1 text-muted-foreground text-xs">
          <span>BYE</span>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex justify-between items-center px-2 py-1 text-xs",
          isWinner && "font-medium",
          isLoser && "opacity-50"
        )}
      >
        <span className="truncate">{teamName || 'TBD'}</span>
        {seed !== null && (
          <span className="text-muted-foreground text-[10px]">({seed})</span>
        )}
      </div>
    );
  };

  const focalWon = match.won === true;
  const focalLost = match.won === false;

  return (
    <Card className="w-36 overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
      {/* Round indicator */}
      <div className="px-2 py-0.5 bg-muted/30 text-[10px] font-medium text-muted-foreground border-b">
        R{match.roundNumber}
      </div>

      {/* Focal player (the opponent whose history we're showing) */}
      {renderPlayerRow(
        match.teamName,
        match.seed,
        focalWon,
        focalLost
      )}

      <div className="border-t" />

      {/* Their opponent in this historical match */}
      {match.isBye ? (
        renderPlayerRow('', null, false, false, true)
      ) : (
        renderPlayerRow(
          match.opponentTeamName ?? 'TBD',
          match.opponentSeed,
          focalLost, // opponent won if focal lost
          focalWon   // opponent lost if focal won
        )
      )}
    </Card>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 3: Commit**

```bash
git add src/components/tournament/HistoryMatchCard.tsx
git commit -m "feat: add HistoryMatchCard component for opponent history display"
```

---

## Task 7: Create UserPathBracket Component (Part 1 - Structure)

**Files:**
- Create: `src/components/tournament/UserPathBracket.tsx`

**Step 1: Create the component skeleton**

```typescript
// src/components/tournament/UserPathBracket.tsx
import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { PathMatchCard } from './PathMatchCard';
import { HistoryMatchCard } from './HistoryMatchCard';
import {
  fetchUserTournamentMatches,
  fetchOpponentHistories,
  fetchHighestSeedRemaining,
  type UserMatchInfo,
  type OpponentMatchInfo,
  type FocalTeamInfo,
} from '../../services/tournament';
import type { Tournament } from '../../types/tournament';

interface UserPathBracketProps {
  tournament: Tournament;
  userFplTeamId?: number | null;
  isAuthenticated?: boolean;
  currentGameweek: number;
}

export function UserPathBracket({
  tournament,
  userFplTeamId,
  isAuthenticated,
  currentGameweek,
}: UserPathBracketProps) {
  // Focal team state
  const [focalTeamId, setFocalTeamId] = useState<number | null>(null);
  const [focalTeamInfo, setFocalTeamInfo] = useState<FocalTeamInfo | null>(null);

  // Data state
  const [userPath, setUserPath] = useState<UserMatchInfo[]>([]);
  const [opponentHistories, setOpponentHistories] = useState<Map<number, OpponentMatchInfo[]>>(new Map());

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Determine initial focal team
  useEffect(() => {
    async function initFocalTeam() {
      // If user is authenticated and in tournament, use their team
      if (isAuthenticated && userFplTeamId) {
        setFocalTeamId(userFplTeamId);
        return;
      }

      // Otherwise, fetch highest seed remaining
      try {
        const highest = await fetchHighestSeedRemaining(tournament.id);
        if (highest) {
          setFocalTeamId(highest.entryId);
          setFocalTeamInfo(highest);
        }
      } catch (err) {
        console.error('Failed to fetch highest seed:', err);
      }
    }

    initFocalTeam();
  }, [tournament.id, isAuthenticated, userFplTeamId]);

  // Fetch user path and opponent histories when focal team changes
  useEffect(() => {
    if (!focalTeamId) return;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch focal team's path
        const path = await fetchUserTournamentMatches(
          tournament.id,
          focalTeamId,
          tournament.totalRounds,
          currentGameweek
        );
        setUserPath(path);

        // Extract opponent entry IDs from future matches
        const opponentIds = path
          .filter((m) => m.opponentFplTeamId !== null)
          .map((m) => m.opponentFplTeamId as number);

        // Fetch opponent histories
        if (opponentIds.length > 0) {
          const histories = await fetchOpponentHistories(tournament.id, opponentIds);
          setOpponentHistories(histories);
        }

        // Update focal team info from first match
        if (path.length > 0) {
          setFocalTeamInfo({
            entryId: path[0].yourFplTeamId,
            teamName: path[0].yourTeamName,
            managerName: '',
            seed: path[0].yourSeed,
          });
        }
      } catch (err) {
        console.error('Failed to fetch path data:', err);
        setError('Failed to load bracket data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [focalTeamId, tournament.id, tournament.totalRounds, currentGameweek]);

  // Calculate max opponent history depth (for grid layout)
  const maxHistoryDepth = useMemo(() => {
    return Math.max(0, ...userPath.map((m) => m.roundNumber - 1));
  }, [userPath]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <Spinner className="size-5" />
        <span className="text-muted-foreground">Loading bracket...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with team selector */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Viewing:</span>
          <span className="font-medium">
            {focalTeamInfo?.teamName ?? 'Select a team'}
          </span>
          {focalTeamInfo && (
            <span className="text-sm text-muted-foreground">
              (Seed #{focalTeamInfo.seed})
            </span>
          )}
          {isAuthenticated && focalTeamId === userFplTeamId && (
            <span className="text-sm text-primary">★ You</span>
          )}
        </div>

        {/* Search placeholder - will implement team search */}
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Path visualization */}
      <div className="space-y-4">
        {/* Your path row */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {userPath.map((match, index) => (
            <div key={match.matchId} className="flex items-center gap-2">
              <PathMatchCard
                match={match}
                isFocalTeam={true}
                currentGameweek={currentGameweek}
              />
              {index < userPath.length - 1 && (
                <span className="text-muted-foreground">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Opponent histories grid */}
        {maxHistoryDepth > 0 && (
          <div className="flex gap-4 overflow-x-auto">
            {/* Empty space for first match (no opponent history) */}
            <div className="w-48 shrink-0" />

            {/* History columns for each future match */}
            {userPath.slice(1).map((match) => {
              const opponentId = match.opponentFplTeamId;
              const history = opponentId ? opponentHistories.get(opponentId) : [];

              return (
                <div key={match.matchId} className="flex flex-col gap-2 shrink-0">
                  {(history ?? []).map((histMatch) => (
                    <HistoryMatchCard key={histMatch.matchId} match={histMatch} />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="text-xs text-muted-foreground">
        Showing {userPath.length} matches on path to final
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 3: Commit**

```bash
git add src/components/tournament/UserPathBracket.tsx
git commit -m "feat: add UserPathBracket component structure"
```

---

## Task 8: Integrate UserPathBracket into BracketView

**Files:**
- Modify: `src/components/tournament/BracketView.tsx`

**Step 1: Add import**

At the top of the file, add:

```typescript
import { UserPathBracket } from './UserPathBracket';
```

**Step 2: Replace PaginatedBracket with UserPathBracket**

Find this block (around line 473):

```typescript
            // Use paginated bracket for large tournaments
            tournament.participants.length > LARGE_TOURNAMENT_THRESHOLD ? (
              <PaginatedBracket
                rounds={tournament.rounds}
                participants={tournament.participants}
                currentGameweek={tournament.currentGameweek}
                isAuthenticated={isAuthenticated}
                onClaimTeam={onClaimTeam}
                totalParticipants={tournament.participants.length}
              />
            ) : (
```

Replace with:

```typescript
            // Use user path bracket for large tournaments
            tournament.participants.length > LARGE_TOURNAMENT_THRESHOLD ? (
              <UserPathBracket
                tournament={tournament}
                userFplTeamId={userFplTeamId}
                isAuthenticated={isAuthenticated}
                currentGameweek={tournament.currentGameweek}
              />
            ) : (
```

**Step 3: Remove PaginatedBracket import**

Remove or comment out the import:

```typescript
// import { PaginatedBracket } from './PaginatedBracket';
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 5: Verify build succeeds**

Run: `npm run build`

Expected: Build completes successfully

**Step 6: Commit**

```bash
git add src/components/tournament/BracketView.tsx
git commit -m "feat: integrate UserPathBracket for large tournaments"
```

---

## Task 9: Manual Testing Checklist

**Setup:**
1. Start local dev: `npm run dev`
2. Start emulators: `firebase emulators:start`
3. Navigate to a large tournament (>64 participants)

**Test Cases:**

- [ ] **Authenticated participant**: Shows "★ You" badge, their path displayed
- [ ] **Authenticated non-participant**: Shows highest seed remaining by default
- [ ] **Unauthenticated**: Shows highest seed remaining by default
- [ ] **Path display**: All matches from current round to final shown
- [ ] **Opponent histories**: Below each future match, opponent's past matches shown
- [ ] **Scores displayed**: For completed/active rounds, scores appear
- [ ] **Winner highlighting**: Completed matches show winner in green
- [ ] **Horizontal scroll**: Path scrolls horizontally on mobile
- [ ] **Loading state**: Spinner shows while fetching data
- [ ] **Error state**: Error message if fetch fails

**Step: Commit test results**

If all tests pass:
```bash
git commit --allow-empty -m "test: verify UserPathBracket works in manual testing"
```

---

## Task 10: Clean Up PaginatedBracket (Optional)

**Files:**
- Delete: `src/components/tournament/PaginatedBracket.tsx` (if no longer needed)

**Step 1: Verify PaginatedBracket is not used elsewhere**

Run: `grep -r "PaginatedBracket" src/`

Expected: Only the import in BracketView.tsx (now commented out)

**Step 2: Delete the file**

```bash
rm src/components/tournament/PaginatedBracket.tsx
```

**Step 3: Remove commented import from BracketView.tsx**

Delete the line:
```typescript
// import { PaginatedBracket } from './PaginatedBracket';
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove unused PaginatedBracket component"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add GetOpponentMatchHistories query | queries.gql |
| 2 | Add GetHighestSeedRemaining query | queries.gql |
| 3 | Add fetchOpponentHistories service | tournament.ts |
| 4 | Add fetchHighestSeedRemaining service | tournament.ts |
| 5 | Create PathMatchCard component | PathMatchCard.tsx |
| 6 | Create HistoryMatchCard component | HistoryMatchCard.tsx |
| 7 | Create UserPathBracket component | UserPathBracket.tsx |
| 8 | Integrate into BracketView | BracketView.tsx |
| 9 | Manual testing | - |
| 10 | Clean up PaginatedBracket | - |

**Total estimated tasks:** 10
**Estimated time:** 1-2 hours
