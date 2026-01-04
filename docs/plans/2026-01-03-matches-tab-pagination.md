# Matches Tab Infinite Scroll Pagination

**Goal:** Load 100 matches at a time with infinite scroll instead of all at once.

---

## Task 1: Update GetRoundMatches Query

**File:** `dataconnect/connector/queries.gql`

Add offset/limit parameters:

```graphql
query GetRoundMatches(
  $tournamentId: UUID!,
  $roundNumber: Int!,
  $limit: Int = 100,
  $offset: Int = 0
) @auth(level: PUBLIC) {
  matches(
    where: { tournamentId: { eq: $tournamentId }, roundNumber: { eq: $roundNumber } }
    orderBy: { positionInRound: ASC }
    limit: $limit
    offset: $offset
  ) {
    # ... existing fields
  }
}
```

Then regenerate SDK: `npx firebase dataconnect:sdk:generate`

---

## Task 2: Update MatchesTab Component

**File:** `src/components/tournament/tabs/MatchesTab.tsx`

### State Changes

```tsx
const PAGE_SIZE = 100;

const [otherMatches, setOtherMatches] = useState<Match[]>([]);
const [offset, setOffset] = useState(0);
const [hasMore, setHasMore] = useState(true);
const [isLoading, setIsLoading] = useState(false);
const sentinelRef = useRef<HTMLDivElement>(null);
```

### User's Match (from existing tournament data)

```tsx
const userMatch = useMemo(() => {
  if (!userFplTeamId) return null;
  const round = tournament.rounds.find(r => r.roundNumber === selectedRoundNumber);
  return round?.matches.find(m =>
    m.player1?.fplTeamId === userFplTeamId ||
    m.player2?.fplTeamId === userFplTeamId
  ) ?? null;
}, [tournament.rounds, selectedRoundNumber, userFplTeamId]);
```

### Load More Function

```tsx
const loadMore = useCallback(async () => {
  if (isLoading || !hasMore) return;

  setIsLoading(true);
  const result = await getRoundMatches({
    tournamentId: tournament.id,
    roundNumber: selectedRoundNumber,
    limit: PAGE_SIZE,
    offset,
  });

  const newMatches = result.data.matches;
  setOtherMatches(prev => [...prev, ...newMatches]);
  setOffset(prev => prev + newMatches.length);
  setHasMore(newMatches.length === PAGE_SIZE);
  setIsLoading(false);
}, [isLoading, hasMore, offset, tournament.id, selectedRoundNumber]);
```

### Reset on Round Change

```tsx
useEffect(() => {
  setOtherMatches([]);
  setOffset(0);
  setHasMore(true);
}, [selectedRoundNumber]);

// Initial load
useEffect(() => {
  if (otherMatches.length === 0 && hasMore) {
    loadMore();
  }
}, [selectedRoundNumber, otherMatches.length, hasMore, loadMore]);
```

### IntersectionObserver

```tsx
useEffect(() => {
  const sentinel = sentinelRef.current;
  if (!sentinel) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );

  observer.observe(sentinel);
  return () => observer.disconnect();
}, [hasMore, isLoading, loadMore]);
```

### Updated JSX

- "You" section uses `userMatch` (unchanged)
- "Everyone Else" section uses `otherMatches` (paginated)
- Add sentinel div after matches list:

```tsx
{hasMore && (
  <div ref={sentinelRef} className="h-10 flex items-center justify-center">
    {isLoading && <LoadingSpinner />}
  </div>
)}
```

---

## Task 3: Verify

1. Navigate to tournament with large round (256+ matches)
2. Confirm only ~100 matches load initially
3. Scroll down - more matches should load
4. Switch rounds - should reset and load fresh
5. User's match should always appear in "You" section
