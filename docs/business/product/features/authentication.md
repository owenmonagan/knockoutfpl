# Feature: Authentication

Google Auth only. Standard Firebase setup.

---

## Summary

Handles user signup, login, logout, and session management. First-time users are created automatically on successful Google sign-in.

See [../overview.md](../overview.md) for context.

---

## Behaviors

### Sign In
- "Sign in with Google" button on landing page
- Firebase Auth handles OAuth flow
- On success:
  - If user record exists → check for manager_id
  - If no user record → create one (first-time user)
- After sign-in routing:
  - Has `manager_id` → Dashboard (league browser)
  - No `manager_id` → FPL Connection page

### First-Time User
- User record created in DataConnect (PostgreSQL) on first sign-in
- Fields initialized:
  - `email` - from Google account
  - `created_at` - now
  - `updated_at` - now
  - `manager_id` - null
  - `manager_name` - null

### After FPL Connection
- When manager ID is added:
  - `manager_id` - set to the FPL Team ID
  - `manager_name` - fetched from FPL API
  - `updated_at` - now

### Protected Routes
- Dashboard, FPL Connection, and any authenticated pages require sign-in
- Unauthenticated user visiting protected route → redirect to landing page
- After sign-in → redirect back to originally requested page (if applicable)
- Public routes (bracket view at `/league/{id}`) remain accessible without auth

### Session Persistence
- Session persists across browser refreshes
- Firebase handles token refresh automatically
- Session expires based on Firebase defaults (configurable)

### Sign Out
- Clears local session
- Returns to landing page
- No server-side session invalidation needed (Firebase handles)

### Dev/Test Mode
- Email/password sign-in available in development and test environments only
- Not exposed in production UI
- Enables automated testing without Google OAuth complexity
- Test accounts can be seeded in Firebase emulator

---

## Inputs

- Google OAuth token (from Google sign-in flow)
- Or: Email/password (dev/test mode only)

---

## Outputs

- Authenticated session
- User record in DataConnect (created or existing)

---

## Edge Cases

### Sign-in Cancelled
- User closes Google popup or clicks cancel
- Show no error, remain on landing page

### Network Error During Auth
- Firebase handles retry logic
- On failure, show generic "Sign in failed, please try again" message

### Google Account Email Changed
- User identified by Firebase UID, not email
- Email in user record may become stale (acceptable for MVP)

### Multiple Browser Tabs
- Firebase syncs auth state across tabs automatically
- Sign out in one tab signs out all tabs

---

## Scope Limits

- No email/password authentication in production
- No other social providers (Apple, Facebook, etc.)
- No password recovery (not applicable with Google Auth)
- No email verification step (Google handles this)
- No account deletion flow (manual admin process for MVP)

---

## Related

- See [fpl-connection.md](./fpl-connection.md) for post-auth flow
- See [../journeys/new-user-first-tournament.md](../journeys/new-user-first-tournament.md) for full user flow
