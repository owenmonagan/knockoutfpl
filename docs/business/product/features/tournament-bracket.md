# Feature: Tournament Bracket

<!-- TODO: Complete specification -->

Visual representation of the tournament showing all matches and progression paths.

---

## Summary

Public URL with bracket view. Includes "Claim team" functionality for viral signup.

See [../overview.md](../overview.md) for context.

---

## Behaviors

<!-- TODO: Expand with detailed specifications -->

### Public Viewing
- URL: `knockoutfpl.com/league/{fpl_league_id}`
- No sign-in required to view
- Anyone with the link can see the bracket

### Bracket Display
- Tree layout from first round to final
- Shows matchups with manager names and FPL team names
- Displays scores once a round completes
- Highlights winners and elimination path
- Updates automatically as rounds progress

### Claim Team
- Each team in bracket has "Claim team" button
- Clicking triggers Google sign-in
- FPL Team ID pre-filled from bracket context
- After sign-in, user lands on dashboard

### Share Prompt
- After tournament creation, shows "Share this link" prompt
- Copy button for easy sharing

---

## Inputs

- FPL League ID (from URL)

---

## Outputs

- Bracket visualization
- Match results and progression
- Claim team / sign-up flow

---

## Edge Cases

<!-- TODO: Document error states -->

- Tournament doesn't exist for this league ID (show "No tournament" message? or create prompt?)
- Tournament completed (show final results, winner highlighted)
- User already signed in clicks "Claim team" for a different Team ID

---

## Scope Limits

- No bracket editing after creation
- No printable/exportable bracket
- No live scoring during gameweek (only final scores)

---

## Related

- See [tournament-creation.md](./tournament-creation.md) for how brackets are generated
- See [scoring-progression.md](./scoring-progression.md) for how matches are decided
- See [../journeys/shared-link-viewer.md](../journeys/shared-link-viewer.md) for claim flow
