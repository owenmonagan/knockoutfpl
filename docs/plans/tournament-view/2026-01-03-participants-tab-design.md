# Participants Tab Design

> Browse all teams in the tournament with their seed and current status.

**Date:** 2026-01-03
**Status:** Ready for implementation
**Parent:** [Scalable Cup View Design](./2026-01-03-scalable-cup-view-design.md)

---

## Overview

Primary use case: **casual browsing of the field** to see what everyone's seed was.

Users want to scroll through all participants, optionally searching or changing sort order.

---

## Core Interaction Model

**Three controls:**

1. **Search bar** — Filters the list as you type (team name or manager name)
2. **Sort toggle** — "Best seeds" (1, 2, 3...) or "Worst seeds" (...48K, 48K-1, 48K-2)
3. **Scroll** — Infinite scroll with 100-item pagination

**Two sections:**

1. **YOU** — Pinned at top, always visible (if user is identified + in tournament)
2. **ALL PARTICIPANTS** — Everyone else in current sort order, filtered by search

**Tap action:** Opens FPL team history page in new tab
`fantasy.premierleague.com/entry/{fplTeamId}/history`

---

## Layout (Mobile-First)

```
┌─────────────────────────────────────┐
│ Overview  Matches  [Participants]   │  <- Tab bar
├─────────────────────────────────────┤
│ Search teams...                     │  <- Search input
├─────────────────────────────────────┤
│ [Best seeds]  [Worst seeds]         │  <- Sort toggle (segmented control)
├─────────────────────────────────────┤
│ YOU                                 │  <- Section header
│ ┌─────────────────────────────────┐ │
│ │ #847  Your Team Name            │ │
│ │       Your Name - Still in      │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ALL PARTICIPANTS (48,152)           │  <- Count in header
│ ┌─────────────────────────────────┐ │
│ │ #1   Top Seed FC                │ │
│ │      John Smith - Still in      │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ #2   Runner Up United           │ │
│ │      Jane Doe - Still in        │ │
│ └─────────────────────────────────┘ │
│ ...                                 │
│ ┌─────────────────────────────────┐ │
│ │        Loading more...          │ │  <- Sentinel / loading indicator
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Participant Card Component

Two-line card design:

```
┌─────────────────────────────────────┐
│ #847  Team Name Here                │  <- Seed (bold) + Team name
│       Manager Name - Still in       │  <- Manager + Status
└─────────────────────────────────────┘
```

**Card elements:**

| Element | Style |
|---------|-------|
| Seed | Bold, left-aligned (e.g., `#1`, `#847`, `#48,152`) |
| Team name | Primary text, truncates if long |
| Manager name | Secondary/muted text |
| Status | After manager with bullet separator |

**YOUR card variant:** Same layout with subtle accent background/border.

**Touch target:** Full card tappable. Minimum 48px height.

---

## Status Display

| State | Display | Color |
|-------|---------|-------|
| Still in | `Still in` | Default/green |
| Eliminated | `Out R3` | Muted/red |
| Champion | `Champion` | Gold/accent |

---

## Behaviors

### Reset Triggers

- Sort direction changes → reset offset, clear list, reload
- Search query changes → reset offset, clear list, reload (debounced 300ms)

### Search Filtering

- Filters in place (list shrinks as you type)
- YOUR card hides if it doesn't match the search
- Searches both team name and manager name

### Empty States

| Condition | Display |
|-----------|---------|
| No search results | "No teams match your search" |
| User not in tournament | Hide YOU section entirely |

---

## Data Loading

Follows same pagination pattern as Matches tab.
See: `docs/plans/2026-01-03-matches-tab-pagination.md`

### Query

```graphql
query GetTournamentParticipants(
  $tournamentId: UUID!,
  $limit: Int = 100,
  $offset: Int = 0,
  $orderByDirection: OrderDirection = ASC
) @auth(level: PUBLIC) {
  tournamentEntries(
    where: { tournamentId: { eq: $tournamentId } }
    orderBy: { seed: $orderByDirection }
    limit: $limit
    offset: $offset
  ) {
    fplTeamId
    fplTeamName
    managerName
    seed
    eliminatedInRound
  }
}
```

### State Management

```tsx
const PAGE_SIZE = 100;
const [participants, setParticipants] = useState<Participant[]>([]);
const [offset, setOffset] = useState(0);
const [hasMore, setHasMore] = useState(true);
const [isLoading, setIsLoading] = useState(false);
const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
const [searchQuery, setSearchQuery] = useState('');
```

### User's Entry

Fetched from existing tournament context (already loaded for Overview tab).

---

## Implementation Checklist

- [ ] Add `GetTournamentParticipants` query with offset/limit/orderBy
- [ ] Create `ParticipantCard` component (two-line layout)
- [ ] Update `ParticipantsTab` with search input
- [ ] Add sort toggle (segmented control)
- [ ] Implement infinite scroll with IntersectionObserver
- [ ] Pin user's card at top (YOU section)
- [ ] Add debounced search filtering
- [ ] Handle empty states
- [ ] Link cards to FPL history (new tab)
