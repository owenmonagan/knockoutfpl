# Feature: League Browser

<!-- TODO: Complete specification -->

Shows all FPL mini-leagues the connected manager belongs to. This is the authenticated dashboard.

---

## Summary

Entry point for creating or viewing tournaments. The primary navigation for authenticated users.

See [../overview.md](../overview.md) for context.

---

## Behaviors

<!-- TODO: Expand with detailed specifications -->

### Fetch Leagues
- Fetches leagues from FPL API using linked Team ID
- Classic leagues only (not Head-to-Head)

### Display
- List of leagues with:
  - League name
  - Member count
  - Manager's current rank
  - Action: "Create Tournament" or "View Tournament"

### Tournament Status
- Shows "View Tournament" if tournament exists for this league
- Shows "Create Tournament" if no tournament exists

### Navigation
- Clicking either action navigates to `knockoutfpl.com/league/{fpl_league_id}`

---

## Inputs

- User's FPL Team ID (from user record)

---

## Outputs

- List of mini-leagues with tournament status
- Navigation to tournament creation or viewing

---

## Edge Cases

<!-- TODO: Document error states -->

- User has no mini-leagues (only in overall leagues)
- FPL API unavailable
- User's Team ID no longer valid

---

## Scope Limits

- No league search
- No joining leagues through Knockout FPL—must join via FPL first
- Classic leagues only (Head-to-Head not supported)

---

## Related

- See [fpl-connection.md](./fpl-connection.md) for how Team ID is linked
- See [tournament-creation.md](./tournament-creation.md) for create flow
- See [tournament-bracket.md](./tournament-bracket.md) for view flow
