# Feature: Tournament Creation

<!-- TODO: Complete specification -->

Creates a knockout tournament from an FPL classic league.

---

## Summary

One-click setup with automatic bracket generation. One tournament per league.

See [../overview.md](../overview.md) for context.

---

## Behaviors

<!-- TODO: Expand with detailed specifications -->

### Create Tournament
- Triggered from League Browser "Create Tournament" action
- One tournament per mini-league (if exists, redirects to view instead)
- All league members automatically become participants (pulled from FPL)

### Bracket Generation
- Auto-generated with seeding based on current league rank
- Higher seeds face lower seeds in round 1
- Byes assigned when participant count isn't a power of 2
- Tournament starts from the next gameweek

### Post-Creation
- Lands on bracket page
- "Share this link" prompt displayed
- Link format: `knockoutfpl.com/league/{fpl_league_id}`

---

## Inputs

- FPL League ID (from League Browser selection)

---

## Outputs

- Tournament record created in database
- Bracket structure with all matchups
- Shareable URL

---

## Edge Cases

<!-- TODO: Document error states -->

- Tournament already exists for this league (redirect to view)
- League has only 1-2 members
- FPL API unavailable during creation
- Season ended (no future gameweeks)

---

## Scope Limits

- No custom participant selection (all league members included)
- No manual seeding
- No scheduling tournaments for future gameweeks
- No multiple concurrent tournaments per league

---

## Related

- See [league-browser.md](./league-browser.md) for entry point
- See [tournament-bracket.md](./tournament-bracket.md) for post-creation view
- See [../journeys/new-user-first-tournament.md](../journeys/new-user-first-tournament.md) for full flow
