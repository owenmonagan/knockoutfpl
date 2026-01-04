# Participants Tab Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the Participants tab with search, sort toggle, and infinite scroll pagination.

**Architecture:** Follows the same pattern as MatchesTab - pinned user section at top, infinite scroll for everyone else, IntersectionObserver for load-more triggering. Uses TournamentEntry table (not deprecated Participant table).

**Tech Stack:** React, shadcn/ui (Input, Toggle Group), DataConnect queries, IntersectionObserver

**Prerequisite:** Assumes schema migration from `docs/plans/2026-01-03-league-entry-schema-migration.md` is complete. Uses `TournamentEntry` table with `Entry` relation for team/manager names.

---

## Task 1: Update GetTournamentEntries Query

**Files:**
- Modify: `dataconnect/connector/queries.gql:149-166`

**Step 1: Update query to support pagination and sort direction**

Find the existing `GetTournamentEntries` query and replace with:

```graphql
# Get tournament entries with entry details (paginated, sortable)
query GetTournamentEntries(
  $tournamentId: UUID!
  $limit: Int = 100
  $offset: Int = 0
) @auth(level: PUBLIC) {
  tournamentEntries(
    where: { tournamentId: { eq: $tournamentId } }
    orderBy: { seed: ASC }
    limit: $limit
    offset: $offset
  ) {
    entryId
    seed
    status
    eliminationRound
    uid
    entry {
      name
      playerFirstName
      playerLastName
      summaryOverallPoints
    }
  }
}

# Get tournament entries sorted by worst seeds first (for reverse sort)
query GetTournamentEntriesDesc(
  $tournamentId: UUID!
  $limit: Int = 100
  $offset: Int = 0
) @auth(level: PUBLIC) {
  tournamentEntries(
    where: { tournamentId: { eq: $tournamentId } }
    orderBy: { seed: DESC }
    limit: $limit
    offset: $offset
  ) {
    entryId
    seed
    status
    eliminationRound
    uid
    entry {
      name
      playerFirstName
      playerLastName
      summaryOverallPoints
    }
  }
}
```

**Step 2: Regenerate SDK**

Run: `npm run dataconnect:generate`

Expected: SDK regenerated with new query signatures

**Step 3: Commit**

```bash
git add dataconnect/connector/queries.gql dataconnect/dataconnect-generated/
git commit -m "feat(queries): add paginated GetTournamentEntries with sort direction"
```

---

## Task 2: Create ParticipantCard Component

**Files:**
- Create: `src/components/tournament/ParticipantCard.tsx`
- Create: `src/components/tournament/ParticipantCard.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/components/tournament/ParticipantCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ParticipantCard } from './ParticipantCard';

const mockParticipant = {
  entryId: 12345,
  seed: 847,
  status: 'active' as const,
  eliminationRound: null,
  teamName: 'Test Team FC',
  managerName: 'John Smith',
};

describe('ParticipantCard', () => {
  it('renders seed, team name, manager name, and status', () => {
    render(<ParticipantCard participant={mockParticipant} />);

    expect(screen.getByText('#847')).toBeInTheDocument();
    expect(screen.getByText('Test Team FC')).toBeInTheDocument();
    expect(screen.getByText(/John Smith/)).toBeInTheDocument();
    expect(screen.getByText(/Still in/)).toBeInTheDocument();
  });

  it('shows eliminated status with round number', () => {
    render(
      <ParticipantCard
        participant={{ ...mockParticipant, status: 'eliminated', eliminationRound: 3 }}
      />
    );

    expect(screen.getByText(/Out R3/)).toBeInTheDocument();
  });

  it('shows champion status', () => {
    render(
      <ParticipantCard
        participant={{ ...mockParticipant, status: 'champion' }}
      />
    );

    expect(screen.getByText(/Champion/)).toBeInTheDocument();
  });

  it('opens FPL history in new tab when clicked', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();

    render(<ParticipantCard participant={mockParticipant} />);

    await user.click(screen.getByRole('button'));

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://fantasy.premierleague.com/entry/12345/history',
      '_blank'
    );

    windowOpenSpy.mockRestore();
  });

  it('applies highlight styling for isUser variant', () => {
    render(<ParticipantCard participant={mockParticipant} isUser />);

    const card = screen.getByRole('button');
    expect(card).toHaveClass('border-primary');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- ParticipantCard.test.tsx`

Expected: FAIL - Cannot find module './ParticipantCard'

**Step 3: Write minimal implementation**

```tsx
// src/components/tournament/ParticipantCard.tsx
import { cn } from '@/lib/utils';

export interface ParticipantCardData {
  entryId: number;
  seed: number;
  status: 'active' | 'eliminated' | 'champion';
  eliminationRound: number | null;
  teamName: string;
  managerName: string;
}

interface ParticipantCardProps {
  participant: ParticipantCardData;
  isUser?: boolean;
  className?: string;
}

function getStatusDisplay(
  status: ParticipantCardData['status'],
  eliminationRound: number | null
): { text: string; className: string } {
  switch (status) {
    case 'active':
      return { text: 'Still in', className: 'text-green-600 dark:text-green-400' };
    case 'eliminated':
      return {
        text: `Out R${eliminationRound ?? '?'}`,
        className: 'text-muted-foreground',
      };
    case 'champion':
      return { text: 'Champion', className: 'text-yellow-600 dark:text-yellow-400' };
  }
}

export function ParticipantCard({
  participant,
  isUser = false,
  className,
}: ParticipantCardProps) {
  const { entryId, seed, status, eliminationRound, teamName, managerName } = participant;
  const statusDisplay = getStatusDisplay(status, eliminationRound);

  const handleClick = () => {
    window.open(
      `https://fantasy.premierleague.com/entry/${entryId}/history`,
      '_blank'
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
        'min-h-[48px] cursor-pointer',
        isUser && 'border-primary border-2 bg-primary/5',
        className
      )}
    >
      {/* Row 1: Seed + Team Name */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-muted-foreground">
          #{seed.toLocaleString()}
        </span>
        <span className="font-medium truncate">{teamName}</span>
      </div>

      {/* Row 2: Manager + Status */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
        <span className="truncate">{managerName}</span>
        <span>-</span>
        <span className={statusDisplay.className}>{statusDisplay.text}</span>
      </div>
    </button>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- ParticipantCard.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/tournament/ParticipantCard.tsx src/components/tournament/ParticipantCard.test.tsx
git commit -m "feat(components): add ParticipantCard with two-line layout"
```

---

## Task 3: Update ParticipantsTab with Search and Sort

**Files:**
- Modify: `src/components/tournament/tabs/ParticipantsTab.tsx`

**Step 1: Write failing test for search and sort**

Create new test file:

```tsx
// src/components/tournament/tabs/ParticipantsTab.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ParticipantsTab } from './ParticipantsTab';

// Mock the DataConnect query
vi.mock('@knockoutfpl/dataconnect', () => ({
  getTournamentEntries: vi.fn().mockResolvedValue({
    data: {
      tournamentEntries: [
        {
          entryId: 1,
          seed: 1,
          status: 'active',
          eliminationRound: null,
          entry: { name: 'Top Seed FC', playerFirstName: 'John', playerLastName: 'Smith' },
        },
        {
          entryId: 2,
          seed: 2,
          status: 'active',
          eliminationRound: null,
          entry: { name: 'Second Place', playerFirstName: 'Jane', playerLastName: 'Doe' },
        },
      ],
    },
  }),
  getTournamentEntriesDesc: vi.fn().mockResolvedValue({
    data: {
      tournamentEntries: [
        {
          entryId: 100,
          seed: 100,
          status: 'eliminated',
          eliminationRound: 2,
          entry: { name: 'Last Place FC', playerFirstName: 'Bob', playerLastName: 'Wilson' },
        },
      ],
    },
  }),
}));

const mockTournament = {
  id: 'test-tournament-id',
  participantCount: 128,
};

describe('ParticipantsTab', () => {
  it('renders search input', () => {
    render(<ParticipantsTab tournamentId={mockTournament.id} participantCount={128} />);

    expect(screen.getByPlaceholderText(/search teams/i)).toBeInTheDocument();
  });

  it('renders sort toggle with Best seeds and Worst seeds options', () => {
    render(<ParticipantsTab tournamentId={mockTournament.id} participantCount={128} />);

    expect(screen.getByRole('button', { name: /best seeds/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /worst seeds/i })).toBeInTheDocument();
  });

  it('shows participant count in header', () => {
    render(<ParticipantsTab tournamentId={mockTournament.id} participantCount={128} />);

    expect(screen.getByText(/all participants/i)).toBeInTheDocument();
    expect(screen.getByText(/128/)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- ParticipantsTab.test.tsx`

Expected: FAIL - tests fail because current implementation doesn't have search/sort

**Step 3: Write the implementation**

```tsx
// src/components/tournament/tabs/ParticipantsTab.tsx
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ParticipantCard, type ParticipantCardData } from '../ParticipantCard';
import { Spinner } from '@/components/ui/spinner';
import {
  getTournamentEntries,
  getTournamentEntriesDesc,
} from '@knockoutfpl/dataconnect';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const PAGE_SIZE = 100;

interface ParticipantsTabProps {
  tournamentId: string;
  participantCount: number;
  userEntryId?: number;
  userEntry?: ParticipantCardData;
}

type SortDirection = 'asc' | 'desc';

// Transform API response to ParticipantCardData
function transformEntry(entry: {
  entryId: number;
  seed: number;
  status: string;
  eliminationRound: number | null;
  entry: {
    name: string;
    playerFirstName: string | null;
    playerLastName: string | null;
  };
}): ParticipantCardData {
  const managerName = [entry.entry.playerFirstName, entry.entry.playerLastName]
    .filter(Boolean)
    .join(' ') || 'Unknown';

  return {
    entryId: entry.entryId,
    seed: entry.seed,
    status: entry.status as ParticipantCardData['status'],
    eliminationRound: entry.eliminationRound,
    teamName: entry.entry.name,
    managerName,
  };
}

export function ParticipantsTab({
  tournamentId,
  participantCount,
  userEntryId,
  userEntry,
}: ParticipantsTabProps) {
  // Search and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Pagination state
  const [participants, setParticipants] = useState<ParticipantCardData[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  // Filter participants by search query (client-side filtering)
  const filteredParticipants = useMemo(() => {
    if (!debouncedSearch.trim()) return participants;

    const query = debouncedSearch.toLowerCase();
    return participants.filter(
      (p) =>
        p.teamName.toLowerCase().includes(query) ||
        p.managerName.toLowerCase().includes(query)
    );
  }, [participants, debouncedSearch]);

  // Check if user matches search
  const showUserCard = useMemo(() => {
    if (!userEntry) return false;
    if (!debouncedSearch.trim()) return true;

    const query = debouncedSearch.toLowerCase();
    return (
      userEntry.teamName.toLowerCase().includes(query) ||
      userEntry.managerName.toLowerCase().includes(query)
    );
  }, [userEntry, debouncedSearch]);

  // Load more participants
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const queryFn =
        sortDirection === 'asc' ? getTournamentEntries : getTournamentEntriesDesc;

      const result = await queryFn({
        tournamentId,
        limit: PAGE_SIZE,
        offset,
      });

      const newParticipants = result.data.tournamentEntries.map(transformEntry);
      setParticipants((prev) => [...prev, ...newParticipants]);
      setOffset((prev) => prev + newParticipants.length);
      setHasMore(newParticipants.length === PAGE_SIZE);
    } catch (error) {
      console.error('Failed to load participants:', error);
      setHasMore(false);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [hasMore, offset, tournamentId, sortDirection]);

  // Reset when sort direction changes
  useEffect(() => {
    isLoadingRef.current = false;
    setParticipants([]);
    setOffset(0);
    setHasMore(true);
  }, [sortDirection]);

  // Initial load
  useEffect(() => {
    if (participants.length === 0 && hasMore && !isLoading && offset === 0) {
      loadMore();
    }
  }, [participants.length, hasMore, isLoading, offset, loadMore]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingRef.current) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <Input
        type="text"
        placeholder="Search teams..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />

      {/* Sort Toggle */}
      <ToggleGroup
        type="single"
        value={sortDirection}
        onValueChange={(value) => value && setSortDirection(value as SortDirection)}
        className="justify-start"
      >
        <ToggleGroupItem value="asc" aria-label="Best seeds first">
          Best seeds
        </ToggleGroupItem>
        <ToggleGroupItem value="desc" aria-label="Worst seeds first">
          Worst seeds
        </ToggleGroupItem>
      </ToggleGroup>

      {/* YOU Section */}
      {showUserCard && userEntry && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
            You
          </h3>
          <ParticipantCard participant={userEntry} isUser />
        </section>
      )}

      {/* ALL PARTICIPANTS Section */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
          All Participants ({participantCount.toLocaleString()})
        </h3>

        {filteredParticipants.length > 0 ? (
          <div className="space-y-2">
            {filteredParticipants.map((participant) => (
              <ParticipantCard
                key={participant.entryId}
                participant={participant}
                isUser={participant.entryId === userEntryId}
              />
            ))}
          </div>
        ) : debouncedSearch && !isLoading ? (
          <p className="text-sm text-muted-foreground py-4">
            No teams match your search
          </p>
        ) : null}

        {/* Sentinel for infinite scroll */}
        {hasMore && (
          <div ref={sentinelRef} className="h-10 flex items-center justify-center">
            {isLoading && <Spinner className="size-5" />}
          </div>
        )}
      </section>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- ParticipantsTab.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/tournament/tabs/ParticipantsTab.tsx src/components/tournament/tabs/ParticipantsTab.test.tsx
git commit -m "feat(ParticipantsTab): add search, sort toggle, and infinite scroll"
```

---

## Task 4: Add useDebouncedValue Hook (if not exists)

**Files:**
- Create: `src/hooks/useDebouncedValue.ts` (if doesn't exist)

**Step 1: Check if hook exists**

Run: `ls src/hooks/useDebouncedValue.ts`

If exists, skip to Task 5.

**Step 2: Write the hook**

```tsx
// src/hooks/useDebouncedValue.ts
import { useState, useEffect } from 'react';

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**Step 3: Commit**

```bash
git add src/hooks/useDebouncedValue.ts
git commit -m "feat(hooks): add useDebouncedValue hook"
```

---

## Task 5: Update TournamentView to Pass User Entry

**Files:**
- Modify: `src/components/tournament/TournamentView.tsx`

**Step 1: Find where ParticipantsTab is rendered**

Search for `ParticipantsTab` in TournamentView.tsx and update the props to include user's entry data.

**Step 2: Update to pass userEntry prop**

The TournamentView should already have access to the user's entry from tournament context. Update the ParticipantsTab usage:

```tsx
// In the tabs section where ParticipantsTab is rendered:
<ParticipantsTab
  tournamentId={tournament.id}
  participantCount={tournament.participantCount}
  userEntryId={userFplTeamId}
  userEntry={userTournamentEntry ? {
    entryId: userTournamentEntry.entryId,
    seed: userTournamentEntry.seed,
    status: userTournamentEntry.status,
    eliminationRound: userTournamentEntry.eliminationRound,
    teamName: userTournamentEntry.teamName,
    managerName: userTournamentEntry.managerName,
  } : undefined}
/>
```

**Step 3: Commit**

```bash
git add src/components/tournament/TournamentView.tsx
git commit -m "feat(TournamentView): pass user entry to ParticipantsTab"
```

---

## Task 6: Remove Old ParticipantsTable

**Files:**
- Delete: `src/components/tournament/ParticipantsTable.tsx`

**Step 1: Check for remaining usages**

Run: `grep -r "ParticipantsTable" src/`

If there are usages, update them to use the new ParticipantCard pattern or remove them.

**Step 2: Delete the file**

Run: `rm src/components/tournament/ParticipantsTable.tsx`

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor: remove deprecated ParticipantsTable component"
```

---

## Task 7: Manual Verification

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Navigate to a tournament**

1. Go to a tournament with many participants
2. Click on the Participants tab

**Step 3: Verify functionality**

Checklist:
- [ ] Search input is visible
- [ ] Sort toggle shows "Best seeds" and "Worst seeds"
- [ ] Default sort is "Best seeds" (ascending)
- [ ] Scrolling loads more participants
- [ ] Switching sort reloads the list
- [ ] Searching filters participants in real-time
- [ ] User's card appears in "You" section (if authenticated)
- [ ] Clicking a participant opens FPL history in new tab
- [ ] "No teams match your search" shows for empty results

**Step 4: Commit any fixes**

If any issues found, fix and commit.

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Update query with pagination | `queries.gql` |
| 2 | Create ParticipantCard | `ParticipantCard.tsx`, `ParticipantCard.test.tsx` |
| 3 | Update ParticipantsTab | `ParticipantsTab.tsx`, `ParticipantsTab.test.tsx` |
| 4 | Add debounce hook | `useDebouncedValue.ts` |
| 5 | Wire up in TournamentView | `TournamentView.tsx` |
| 6 | Remove old component | `ParticipantsTable.tsx` |
| 7 | Manual verification | - |
