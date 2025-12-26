# Functional Specification

> **Status:** DRAFT - needs implementation verification and edge case documentation
> **Last Updated:** December 2025

---

## Tournament Lifecycle (DRAFT)

<!-- TODO: Verify state machine matches implementation -->

```
┌─────────┐     create      ┌────────┐    GW starts    ┌────────┐
│ (none)  │ ───────────────→│ pending │───────────────→│ active │
└─────────┘                 └────────┘                 └────────┘
                                                            │
                                                      final round
                                                        complete
                                                            │
                                                            ▼
                                                     ┌───────────┐
                                                     │ completed │
                                                     └───────────┘
```

### States

| State | Description | Transitions |
|-------|-------------|-------------|
| `pending` | Created, waiting for first gameweek | → `active` when first round GW starts |
| `active` | Tournament in progress | → `completed` when final round finishes |
| `completed` | Tournament finished, winner determined | Terminal state |

---

## Bracket Generation (DRAFT)

<!-- TODO: Verify algorithm matches src/lib/bracket.ts -->

### Seeding Rules

1. Fetch mini-league standings at tournament creation
2. Assign seeds 1 through N based on rank (1 = top of league)
3. Store seeds - they don't change even if league standings change

### Match Pairing

```
Seed 1 vs Seed N
Seed 2 vs Seed N-1
Seed 3 vs Seed N-2
...
```

### Bye Allocation

1. Calculate matches needed: `ceil(N/2)`
2. Calculate byes needed: `(matches * 2) - N`
3. Assign byes to top seeds (seeds 1, 2, 3, ...)

**Example:** 5 participants
- Matches in round 1: `ceil(5/2) = 3`
- Players needed: 6
- Byes needed: 6 - 5 = 1
- Seed 1 gets bye

---

## Scoring Rules (DRAFT)

<!-- TODO: Document scoring timing and caching -->

### Score Fetching

1. Scores fetched from FPL API on page load
2. Only fetch for matches in current or past gameweeks
3. Cache scores for completed gameweeks (they won't change)

### Score Finality

| Gameweek Status | Score Type |
|-----------------|------------|
| Not started | No score shown |
| In progress | Provisional (may change) |
| Finished | Final (locked) |

### When to Fetch

- [ ] On page load
- [ ] Manual refresh button
- [ ] Background job (every 2 hours during active gameweek)

---

## Tiebreaker Rules (DRAFT)

<!-- TODO: Confirm tiebreaker priority -->

When two participants have identical gameweek scores:

1. **Higher seed wins** - Lower seed number advances
2. **Same seed (shouldn't happen)** - Random selection

**Rationale:** Rewards mini-league performance. Simple and predictable.

---

## Edge Cases (DRAFT)

<!-- TODO: Document each edge case with resolution -->

### Participant Issues

| Case | Resolution |
|------|------------|
| User leaves FPL mid-tournament | <!-- TODO --> |
| User deletes their account | <!-- TODO --> |
| FPL team becomes private | <!-- TODO --> |

### Scoring Issues

| Case | Resolution |
|------|------------|
| FPL API is down | <!-- TODO: Retry logic? Manual fallback? --> |
| Gameweek is rescheduled | <!-- TODO --> |
| Score corrections after gameweek ends | <!-- TODO --> |

### Tournament Issues

| Case | Resolution |
|------|------------|
| Only 1 person in league | Cannot create tournament (min 2) |
| League has 100+ members | <!-- TODO: Max size? --> |
| Creator wants to cancel | <!-- TODO: Can they? --> |

---

## Validation Rules (DRAFT)

<!-- TODO: Document all validation -->

### Tournament Creation

| Field | Validation |
|-------|------------|
| Mini-league ID | Must exist, user must be member |
| Start gameweek | Must be current or future |
| Participant count | Minimum 2 |

### User Input

| Field | Validation |
|-------|------------|
| FPL Team ID | Must exist in FPL API |
| Email | Valid email format |
| Password | Min 8 chars, complexity rules |

---

## Error States (DRAFT)

<!-- TODO: Document error handling -->

### API Errors

| Error | User Message | Recovery |
|-------|--------------|----------|
| FPL API timeout | "Couldn't load FPL data. Try again." | Retry button |
| FPL API 404 | "Team not found. Check your Team ID." | Edit input |
| Firebase error | "Something went wrong. Try again." | Retry button |

### Application Errors

| Error | User Message | Recovery |
|-------|--------------|----------|
| Not authenticated | Redirect to login | Login |
| Not authorized | "You don't have access to this tournament" | Go to dashboard |
| Tournament not found | "Tournament not found" | Go to dashboard |

---

## Related

- [glossary.md](./glossary.md) - Term definitions
- [../requirements/tournament-prd.md](../requirements/tournament-prd.md) - Requirements
- [../../technical/data/data-dictionary.md](../../technical/data/data-dictionary.md) - Data structures
