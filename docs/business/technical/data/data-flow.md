# Data Flow

> **Status:** DRAFT - needs sequence diagrams and verification
> **Last Updated:** December 2025

---

## Overview

How data moves through the system for key operations.

---

## Read Flows (DRAFT)

### Dashboard Load

<!-- TODO: Add sequence diagram -->

```
User opens /dashboard
    │
    ▼
AuthContext checks auth state
    │
    ▼
Fetch user document from Firestore
    │
    ▼
Query tournaments where user is participant
    │
    ▼
Render dashboard with tournaments list
```

**Data sources:**
- Firestore: `users/{userId}`
- Firestore: `tournaments` (where participant matches user)

---

### Tournament View

<!-- TODO: Add sequence diagram -->

```
User opens /tournament/:id
    │
    ▼
Fetch tournament document from Firestore
    │
    ▼
For each match in current round:
    │
    ├─ If gameweek not started: Show "GW X"
    │
    ├─ If gameweek in progress: Fetch scores from FPL API
    │
    └─ If gameweek complete: Show cached scores (or fetch if missing)
    │
    ▼
Render bracket with scores
```

**Data sources:**
- Firestore: `tournaments/{tournamentId}`
- FPL API: `/api/entry/{teamId}/event/{gameweek}/picks/`

---

### Leagues List

<!-- TODO: Add sequence diagram -->

```
User opens /leagues
    │
    ▼
Get user's FPL Team ID from user document
    │
    ▼
Call Cloud Function to fetch mini-leagues from FPL
    │
    ▼
Render leagues list
```

**Data sources:**
- Firestore: `users/{userId}` → `fplTeamId`
- FPL API: `/api/entry/{teamId}/` → `leagues.classic[]`

---

## Write Flows (DRAFT)

### User Signup

<!-- TODO: Add sequence diagram -->

```
User submits signup form
    │
    ▼
Firebase Auth: Create user
    │
    ▼
Firestore: Create user document
    │
    ▼
Redirect to /connect
```

**Data written:**
- Firebase Auth: New user
- Firestore: `users/{userId}` document

---

### FPL Connection

<!-- TODO: Add sequence diagram -->

```
User enters FPL Team ID
    │
    ▼
Cloud Function: Validate team exists in FPL API
    │
    ▼
Fetch team name from FPL API
    │
    ▼
Firestore: Update user document with FPL info
    │
    ▼
Redirect to /dashboard
```

**Data written:**
- Firestore: `users/{userId}` → `fplTeamId`, `fplTeamName`

---

### Tournament Creation

<!-- TODO: Add sequence diagram -->

```
User selects league and gameweek
    │
    ▼
Cloud Function: Fetch league standings from FPL API
    │
    ▼
Generate bracket (seeding, byes, matches)
    │
    ▼
Firestore: Create tournament document
    │
    ▼
Redirect to /tournament/:id
```

**Data written:**
- Firestore: `tournaments/{tournamentId}` document

---

## Background Flows (DRAFT)

### Score Update (Scheduled)

<!-- TODO: Verify this matches Cloud Function implementation -->

```
Cloud Function triggers (every 2 hours)
    │
    ▼
Query: Find active tournaments with current GW matches
    │
    ▼
For each tournament:
    │
    ├─ Check if gameweek is complete (FPL API)
    │
    ├─ If complete:
    │   │
    │   ├─ Fetch scores for all matches
    │   │
    │   ├─ Determine winners (handle tiebreaks)
    │   │
    │   ├─ Update match results in Firestore
    │   │
    │   ├─ If round complete, generate next round
    │   │
    │   └─ If tournament complete, set winner
    │
    └─ If not complete: Skip
```

**Data read:**
- Firestore: `tournaments` (status = active)
- FPL API: Bootstrap static (gameweek status)
- FPL API: Team picks (scores)

**Data written:**
- Firestore: `tournaments/{id}` → scores, winners, round progression

---

## Caching Strategy (DRAFT)

<!-- TODO: Document caching implementation -->

| Data | Cache Location | TTL | Invalidation |
|------|----------------|-----|--------------|
| Bootstrap static (GW info) | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |
| Completed GW scores | Firestore | Permanent | Never (final) |
| Live GW scores | None | N/A | Always fresh |
| League standings | None | N/A | Fetch at tournament creation |

---

## Data Freshness (DRAFT)

<!-- TODO: Document freshness requirements -->

| Data | Acceptable Staleness |
|------|----------------------|
| User profile | Real-time (Firestore sync) |
| Tournament bracket | Real-time (Firestore sync) |
| Completed scores | Permanent (cached in Firestore) |
| Live scores | < 5 minutes during active GW |
| League standings | Only need at tournament creation |
| Current gameweek | < 1 hour |

---

## Error Handling (DRAFT)

<!-- TODO: Document error recovery -->

| Failure Point | Impact | Recovery |
|---------------|--------|----------|
| FPL API down | Can't fetch scores | Show cached, retry later |
| Firestore write fails | Data loss | Retry with exponential backoff |
| Cloud Function timeout | Incomplete processing | Next scheduled run catches up |

---

## Related

- [data-dictionary.md](./data-dictionary.md) - Entity definitions
- [../integrations/fpl-api.md](../integrations/fpl-api.md) - FPL API details
- [../../product/specs/functional-spec.md](../../product/specs/functional-spec.md) - Business rules
