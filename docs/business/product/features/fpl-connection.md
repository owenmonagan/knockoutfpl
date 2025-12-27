# Feature: FPL Connection

<!-- TODO: Complete specification -->

Links a manager's FPL Team ID to their Knockout FPL account.

---

## Summary

Enables us to fetch the user's mini-leagues from the FPL API.

See [../overview.md](../overview.md) for context.

---

## Behaviors

<!-- TODO: Expand with detailed specifications -->

### Enter Team ID
- User enters their FPL Team ID (numeric, e.g., `158256`)
- Found in URL when viewing team on FPL site: `fantasy.premierleague.com/entry/{team_id}/...`

### Validation
- System validates ID exists via FPL API
- Team name pulled automatically from FPL
- Invalid ID shows error message

### Storage
- Team ID stored in user record
- No ownership verification—multiple accounts can link same Team ID

### Claim Flow (from shared link)
- When user clicks "Claim team" on bracket, Team ID is pre-filled
- Still requires Google sign-in, but skips manual Team ID entry

---

## Inputs

- FPL Team ID (number)
- Or: Team ID from bracket context (claim flow)

---

## Outputs

- User record updated with `fplTeamId` and `fplTeamName`
- Access to user's mini-leagues via FPL API

---

## Edge Cases

<!-- TODO: Document error states -->

- Invalid Team ID (doesn't exist)
- FPL API unavailable
- User already has a different Team ID linked (allow overwrite? or block?)

---

## Scope Limits

- No automatic FPL login integration (FPL has no public OAuth)
- No verification that user "owns" the FPL team
- No support for multiple FPL teams per account

---

## Related

- See [authentication.md](./authentication.md) for sign-in flow
- See [league-browser.md](./league-browser.md) for what happens after connection
