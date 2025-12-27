# Journey: Returning User

<!-- TODO: Document the complete returning user flow -->

The path for an authenticated user checking back on their tournaments.

---

## Overview

**User goal:** See how my tournaments are progressing—did I advance this week?

**Entry point:** `knockoutfpl.com`

**Success:** Viewed current tournament state and my status.

---

## Steps

<!-- TODO: Expand each step with details, edge cases, error states -->

1. Land on `knockoutfpl.com`
2. Sign in with Google (or already signed in)
3. View dashboard showing my leagues
4. Each league shows "View Tournament" or "Create Tournament"
5. Click "View Tournament" on an active tournament
6. See bracket with current round, my match, and results

---

## Feature Dependencies

- [authentication.md](../features/authentication.md) (session persistence)
- [league-browser.md](../features/league-browser.md) (dashboard)
- [tournament-bracket.md](../features/tournament-bracket.md)
- [scoring-progression.md](../features/scoring-progression.md)

---

## Edge Cases

<!-- TODO: Document what happens when things go wrong -->

- User was eliminated—what do they see?
- Tournament completed—is there a winner celebration?
- User's FPL Team ID changed (rare but possible)

---

## Related

- See [../overview.md](../overview.md) for feature summaries
- See [new-user-first-tournament.md](./new-user-first-tournament.md) for first-time experience
