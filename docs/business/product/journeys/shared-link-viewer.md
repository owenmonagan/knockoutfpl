# Journey: Shared Link Viewer

<!-- TODO: Document the complete link viewer flow -->

The path from clicking a shared link to claiming a team and signing up.

---

## Overview

**User goal:** See how I'm doing in the tournament my friend shared.

**Entry point:** `knockoutfpl.com/league/{fpl_league_id}` (shared link)

**Success:** Viewed bracket; optionally claimed team and signed up.

---

## Steps

<!-- TODO: Expand each step with details, edge cases, error states -->

1. Click shared link (e.g., `knockoutfpl.com/league/634129`)
2. View bracket immediately (no auth required)
3. Find my team in the bracket
4. Click "Claim team" button on my team
5. Sign up or log in (FPL Team ID already known from context)
6. Land on leagues page showing my leagues

---

## Feature Dependencies

- [tournament-bracket.md](../features/tournament-bracket.md) (public viewing)
- [authentication.md](../features/authentication.md) (claim flow)
- [fpl-connection.md](../features/fpl-connection.md) (pre-filled from context)
- [league-browser.md](../features/league-browser.md) (post-signup landing)

---

## Edge Cases

<!-- TODO: Document what happens when things go wrong -->

- Tournament doesn't exist for this league ID
- User claims a team but their account is already linked to a different FPL Team ID
- User clicks claim but cancels sign-in

---

## Related

- See [../overview.md](../overview.md) for feature summaries
- See [new-user-first-tournament.md](./new-user-first-tournament.md) for how the link was created
- See [returning-user.md](./returning-user.md) for subsequent visits
