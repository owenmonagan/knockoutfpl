# Tournament Creation Journey

> **Status:** DRAFT - needs flow diagrams and validation
> **Last Updated:** December 2025

---

## Overview

How a user creates a knockout tournament for their FPL mini-league.

```
Dashboard → My Leagues → Select League → Choose Gameweek → Confirm → Bracket Generated
```

---

## Prerequisites

<!-- TODO: Verify these are enforced -->

Before starting this flow, user must:
- [x] Be authenticated
- [x] Have FPL Team ID connected
- [ ] Be a member of at least one mini-league (from FPL)

---

## Step 1: Navigate to Leagues (DRAFT)

<!-- TODO: Verify this matches implementation -->

**URL:** `/leagues`

**What user sees:**
- List of their FPL mini-leagues
- Each league shows: name, member count, user's rank
- "Create Tournament" button on each league card

**Data source:** FPL API via user's Team ID

**User actions:**
- Click "Create Tournament" on a league → Go to creation form
- Click league name → View league details (optional)

**Error states:**
- FPL API error → Show retry message
- No leagues found → Show explanation

---

## Step 2: Create Tournament Form (DRAFT)

<!-- TODO: Verify this matches CreateTournamentPage.tsx -->

**URL:** `/tournament/create/:leagueId`

**What user sees:**
- League name (confirmation)
- Member list preview (who will be in tournament)
- Gameweek selector (current and future gameweeks)
- Create button

**Validation:**
- Gameweek: Must be current or future
- League: Must have 2+ members

**User actions:**
- Select gameweek → Updates preview
- Click "Create Tournament" → Generates bracket

**Decision points:**
- Which gameweek to start? (User chooses)

---

## Step 3: Bracket Generation (DRAFT)

<!-- TODO: Verify this is automatic -->

**Triggered by:** User clicking "Create Tournament"

**What happens (backend):**
1. Fetch league standings from FPL API
2. Assign seeds based on rank
3. Generate bracket structure
4. Calculate byes if odd number
5. Save tournament to Firestore
6. Redirect user to tournament view

**What user sees:**
- Loading indicator
- Success → Redirect to tournament page
- Error → Error message with retry option

---

## Step 4: Tournament Created (DRAFT)

<!-- TODO: Verify this matches TournamentPage.tsx -->

**URL:** `/tournament/:tournamentId`

**What user sees:**
- Tournament name
- Bracket visualization
- Round 1 matchups with seeds
- "Share" button (optional)

**User actions:**
- View bracket
- Share link with league members
- Return to dashboard

---

## Post-Creation (DRAFT)

<!-- TODO: Document what happens next -->

**Automatic:**
- Tournament appears on creator's dashboard
- Other league members can view (if they have accounts)

**Manual:**
- Creator can share link to tournament

**Open questions:**
- [ ] Do league members need accounts to view?
- [ ] Is there a notification to league members?
- [ ] Can multiple tournaments exist for same league?

---

## Error Handling (DRAFT)

<!-- TODO: Document each error case -->

| Error | User Message | Recovery |
|-------|--------------|----------|
| Not authenticated | Redirect to login | Login, then retry |
| FPL API down | "Couldn't fetch league data" | Retry button |
| League not found | "League not found" | Go back to leagues |
| Not a league member | "You're not a member of this league" | Go to leagues |
| Tournament already exists | <!-- TODO --> | <!-- TODO --> |

---

## Related

- [onboarding.md](./onboarding.md) - How users get here
- [tournament-participation.md](./tournament-participation.md) - What happens next
- [../specs/functional-spec.md](../specs/functional-spec.md) - Bracket generation rules
