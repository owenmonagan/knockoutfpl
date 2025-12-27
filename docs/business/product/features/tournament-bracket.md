# Feature: Tournament Bracket

Visual representation of the tournament showing all matches and progression paths.

---

## Summary

Public URL with bracket view. Includes "Claim team" functionality for viral signup.

See [../overview.md](../overview.md) for context.

---

## Behaviors

### Public Viewing
- URL: `knockoutfpl.com/league/{fpl_league_id}`
- No sign-in required to view
- Anyone with the link can see the bracket

### Bracket Display
- Tree layout from first round to final
- Shows matchups with:
  - Manager name
  - Team name
  - Seed number
  - Points (visible during and after round)
  - Win/loss indicator (after round completes)
- Highlights:
  - Current round matches (in progress)
  - Winners advancing through bracket
  - Eliminated managers (greyed out or struck through)
- Tournament header shows:
  - League name
  - Current round / total rounds
  - Current gameweek

### Points Display
- Points shown during active gameweek (updated periodically)
- Points are from FPL API, not live-calculated
- Match winner not determined until gameweek fully completes
- After gameweek completes, points become final and winner advances

### Bracket States
- **Pre-start**: All matches shown, no scores yet, "Starts GW {n}" label
- **In progress**: Current round highlighted, previous rounds show results
- **Completed**: Winner highlighted, all results shown, "Winner: {name}" banner

### Claim Team
- Each team in bracket has "Claim team" button (visible when not signed in)
- Clicking triggers Google sign-in
- Manager ID pre-filled from bracket context
- After sign-in, user lands on dashboard

### Share Prompt
- After tournament creation, shows "Share this link" modal/prompt
- Copy button for easy sharing
- URL displayed: `knockoutfpl.com/league/{fpl_league_id}`

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

### Tournament Doesn't Exist for League ID
- No tournament created for this league
- Show: "No tournament exists for this league yet."
- If user is signed in and in the league, show "Create Tournament" button

### Invalid League ID
- League ID doesn't exist in FPL
- Show: "League not found."

### Tournament Completed
- Show final results with winner highlighted
- "Winner: {manager_name}" banner
- Full bracket still visible with all results

### User Already Signed In Clicks "Claim Team"
- User signed in but viewing bracket for different manager
- Option A: Pre-fill different manager ID on FPL Connection page
- Option B: Warn "You're already connected as {name}. Switch teams?"
- For MVP: Just redirect to dashboard (they're already signed in)

### User Claims Team Not in Tournament
- User clicks claim, signs in, but their manager ID isn't in this tournament
- They joined league after tournament created
- Redirect to dashboard, show tournament in "View" mode

### Bye Matches
- Some first-round slots show "BYE" instead of opponent
- Seed advances automatically, no score displayed
- BYE slots not clickable for claim

---

## Scope Limits

- No bracket editing after creation
- No printable/exportable bracket
- No live scoring during gameweek (points from FPL API, refreshed periodically)
- No comments or reactions on matches
- No notifications when matches complete

---

## Related

- See [tournament-creation.md](./tournament-creation.md) for how brackets are generated
- See [scoring-progression.md](./scoring-progression.md) for how matches are decided
- See [../journeys/shared-link-viewer.md](../journeys/shared-link-viewer.md) for claim flow
