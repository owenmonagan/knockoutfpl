# Feature: Authentication

<!-- TODO: Complete specification -->

Google Auth only. Standard Firebase setup.

---

## Summary

Handles user signup, login, logout, and session management.

See [../overview.md](../overview.md) for context.

---

## Behaviors

<!-- TODO: Expand with detailed specifications -->

### Sign In
- One-click Google sign-in via Firebase Auth
- Creates user record on first sign-in
- Redirects to FPL connection if no Team ID linked, otherwise to dashboard

### Session
- Session persists across browser refreshes
- Token refresh handled automatically by Firebase

### Sign Out
- Clears session
- Returns to landing page

---

## Inputs

- Google OAuth token (from Google sign-in flow)

---

## Outputs

- Authenticated session
- User record in Firestore

---

## Edge Cases

<!-- TODO: Document error states -->

- Google sign-in cancelled by user
- Google account already linked to different Knockout FPL account
- Network error during authentication

---

## Scope Limits

- No email/password authentication
- No other social providers (Apple, Facebook, etc.)
- No password recovery (not applicable with Google Auth)

---

## Related

- See [fpl-connection.md](./fpl-connection.md) for post-auth flow
- See [../journeys/new-user-first-tournament.md](../journeys/new-user-first-tournament.md) for full user flow
