# Feature: FPL Connection

Links a manager's FPL Team ID to their Knockout FPL account. Enables fetching the user's mini-leagues.

---

## Summary

After Google sign-in, user enters their FPL Team ID. System validates it exists and stores it. This unlocks the dashboard (league browser).

See [../overview.md](../overview.md) for context.

---

## Behaviors

### Enter Manager ID
- User enters numeric FPL Team ID (e.g., `158256`)
- Helper text: "Find this in your FPL URL: fantasy.premierleague.com/entry/**158256**/history"
- Submit button validates and saves

### Validation
- Call FPL API to verify ID exists: `GET /api/entry/{manager_id}/`
- On success: extract `name` field as manager name
- On failure (404): show "Manager ID not found. Please check and try again."

### Save Connection
- Update user record:
  - `manager_id` - the validated ID
  - `manager_name` - from FPL API response
  - `updated_at` - now
- Redirect to Dashboard

### Claim Flow (from shared bracket link)
- When user clicks "Claim team" on bracket, manager ID is pre-filled
- Still requires Google sign-in first
- After sign-in, lands on FPL Connection with ID pre-populated
- User confirms (or changes) and submits

---

## Inputs

- FPL Manager ID (numeric, entered by user or pre-filled from claim flow)

---

## Outputs

- User record updated with `manager_id`, `manager_name`, `updated_at`
- Redirect to Dashboard

---

## Edge Cases

### Invalid Manager ID Format
- Non-numeric input → show "Manager ID must be a number"
- Validate client-side before API call

### Manager ID Not Found
- FPL API returns 404
- Show "Manager ID not found. Please check and try again."
- Keep user on page to retry

### FPL API Unavailable
- Timeout or 5xx error
- Show "Couldn't reach FPL. Please try again in a moment."
- Keep user on page to retry

### User Already Has Manager ID
- User returns to FPL Connection page (via settings or navigation)
- Show current connection: "Connected as: {manager_name} ({manager_id})"
- Allow changing to different ID (overwrites previous)

### Same Manager ID, Different User
- Multiple Knockout FPL accounts can link same FPL Manager ID
- No conflict resolution needed - we're tracking, not verifying ownership

---

## Scope Limits

- No automatic FPL login integration (FPL has no public OAuth)
- No ownership verification (anyone can enter any valid ID)
- No support for multiple FPL teams per account
- No unlinking without replacing with different ID

---

## Related

- See [authentication.md](./authentication.md) for sign-in flow
- See [league-browser.md](./league-browser.md) for what happens after connection
