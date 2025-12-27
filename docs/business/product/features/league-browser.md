# Feature: League Browser

Shows all FPL mini-leagues the connected manager belongs to. This is the authenticated dashboard.

---

## Summary

Entry point for creating or viewing tournaments. The primary navigation for authenticated users.

See [../overview.md](../overview.md) for context.

---

## Behaviors

### Fetch Leagues
- Call FPL API with user's `manager_id` to get their leagues
- Endpoint: `GET /api/entry/{manager_id}/`
- Extract `leagues.classic` array (ignore H2H leagues)

### Display
- List of leagues, each showing:
  - League name
  - Member count
  - User's current rank in league
  - Action button: "Create Tournament" or "View Tournament"
  - If tournament exists: user's progress (e.g., "Round 2 of 4" or "Eliminated R1" or "Winner")

### Tournament Status
- For each league, check if tournament exists in our database
- Tournament exists → show "View Tournament" + progress indicator
- No tournament → show "Create Tournament"

### Navigation
- Clicking either action navigates to `/league/{fpl_league_id}`
- "Create Tournament" triggers creation first, then shows bracket
- "View Tournament" goes directly to bracket

### Data Sources
- **League list**: Fetched fresh from FPL API on each page load (membership can change)
- **Tournament participants**: Stored at tournament creation time (snapshot of league members when created)
- These are separate concerns—dashboard shows current FPL leagues, tournaments remember who was in the league when created

---

## Inputs

- User's `manager_id` (from user record)

---

## Outputs

- List of mini-leagues with tournament status and user progress
- Navigation to tournament creation or viewing

---

## Edge Cases

### User Has No Classic Leagues
- Only in overall leagues or H2H leagues
- Show empty state: "You're not in any classic mini-leagues. Join one on the FPL site to create a tournament."

### FPL API Unavailable
- Timeout or 5xx error
- Show error state: "Couldn't load your leagues. Please try again."
- Retry button

### User's Manager ID No Longer Valid
- FPL API returns 404 (team deleted or ID changed)
- Redirect to FPL Connection page to re-link

### League Has Tournament But User Not in It
- User joined league after tournament was created
- Show "View Tournament" (they can still watch)
- They won't appear in the bracket (weren't in snapshot)

### User in Tournament But Left League
- User left league on FPL after tournament created
- Still show tournament with their progress (they're in the snapshot)
- League may not appear in their fresh FPL league list

---

## Scope Limits

- No league search
- No joining leagues through Knockout FPL—must join via FPL first
- Classic leagues only (Head-to-Head not supported)
- No sorting or filtering of leagues

---

## Related

- See [fpl-connection.md](./fpl-connection.md) for how manager_id is linked
- See [tournament-creation.md](./tournament-creation.md) for create flow
- See [tournament-bracket.md](./tournament-bracket.md) for view flow
