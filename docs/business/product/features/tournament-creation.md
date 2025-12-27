# Feature: Tournament Creation

Creates a knockout tournament from an FPL classic league.

---

## Summary

One-click setup with automatic bracket generation. One tournament per league.

See [../overview.md](../overview.md) for context.

---

## Behaviors

### Create Tournament
- Triggered from League Browser "Create Tournament" action
- One tournament per mini-league (if exists, redirect to bracket instead)
- All league members automatically become participants

### Fetch Participants
- Call FPL API to get league standings: `GET /api/leagues-classic/{league_id}/standings/`
- Extract all managers with their:
  - `manager_id`
  - `manager_name` (player_name from FPL)
  - `team_name` (entry_name from FPL)
  - `rank` (current league rank at creation time)
- Store as tournament participant snapshot

### Bracket Generation
- Seeding based on league rank at creation time (rank 1 = seed 1)
- Standard bracket structure: higher seeds face lower seeds in round 1
- Byes assigned when participant count isn't a power of 2
  - Byes go to top seeds
  - Example: 10 participants → 6 byes (seeds 1-6 get byes, seeds 7-10 play round 1)
- Calculate total rounds: `ceil(log2(participant_count))`

### Tournament Timing
- Tournament starts from the next gameweek
- Determine current gameweek from FPL API: `GET /api/bootstrap-static/`
- Find first event where `finished: false`

### Post-Creation
- Lands on bracket page
- "Share this link" prompt displayed
- URL: `knockoutfpl.com/league/{fpl_league_id}`

---

## Inputs

- FPL League ID (from League Browser selection)
- User's `manager_id` (creator is recorded)

---

## Outputs

- Tournament record created in database:
  - `fpl_league_id`
  - `fpl_league_name`
  - `creator_id` (user who created it)
  - `start_gameweek`
  - `current_round` (starts at 1)
  - `total_rounds`
  - `status` ('active')
  - `participants` (snapshot array)
  - `bracket` (match structure)
  - `created_at`
  - `updated_at`
- Redirect to bracket page with share prompt

---

## Edge Cases

### Tournament Already Exists
- User clicks "Create Tournament" but another user just created it
- Redirect to bracket view (no error, just show the tournament)

### League Has Only 1 Member
- Can't run a knockout with 1 person
- Show error: "Need at least 2 managers to create a tournament"

### League Has 2 Members
- Valid but trivial (1 match = final)
- Allow creation

### FPL API Unavailable
- Can't fetch league members
- Show error: "Couldn't reach FPL. Please try again."
- Keep user on dashboard

### Season Ended (No Future Gameweeks)
- All events have `finished: true`
- Show error: "The FPL season has ended. Tournaments will be available when the new season starts."

### Very Large League
- No hard limit, but UI may struggle with 100+ participants
- Accept for MVP, consider pagination later

### League Standings Still Processing
- FPL API may return incomplete data during gameweek processing
- Accept whatever FPL returns (edge case, unlikely to matter)

---

## Scope Limits

- No custom participant selection (all league members included)
- No manual seeding
- No scheduling tournaments for future gameweeks (always starts next GW)
- No multiple concurrent tournaments per league
- No tournament deletion or cancellation

---

## Related

- See [league-browser.md](./league-browser.md) for entry point
- See [tournament-bracket.md](./tournament-bracket.md) for post-creation view
- See [../journeys/new-user-first-tournament.md](../journeys/new-user-first-tournament.md) for full flow
