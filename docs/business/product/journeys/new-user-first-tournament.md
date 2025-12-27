# Journey: New User First Tournament

<!-- TODO: Document the complete creator flow -->

The path from first visit to creating a tournament and sharing the link.

---

## Overview

**User goal:** Create a knockout tournament for my FPL mini-league and share it with friends.

**Entry point:** `knockoutfpl.com`

**Success:** Tournament created, shareable link copied/sent.

---

## Steps

<!-- TODO: Expand each step with details, edge cases, error states -->

1. Land on `knockoutfpl.com` (sign-in button only)
2. Sign in with Google
3. Enter FPL Team ID
4. View dashboard (league list)
5. Click "Create Tournament" on a league
6. Land on bracket page with "Share this link" prompt

---

## Feature Dependencies

- [authentication.md](../features/authentication.md)
- [fpl-connection.md](../features/fpl-connection.md)
- [league-browser.md](../features/league-browser.md)
- [tournament-creation.md](../features/tournament-creation.md)
- [tournament-bracket.md](../features/tournament-bracket.md)

---

## Edge Cases

<!-- TODO: Document what happens when things go wrong -->

- Invalid FPL Team ID entered
- League has only 1 member
- Tournament already exists for this league

---

## Related

- See [../overview.md](../overview.md) for feature summaries
- See [shared-link-viewer.md](./shared-link-viewer.md) for what happens when someone clicks the shared link
