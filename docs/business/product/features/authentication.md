# Feature: Authentication

Email/password and Google sign-in. Standard Firebase setup.

---

## Summary

Handles user signup, login, logout, password recovery, and session management. First-time users are created automatically on successful sign-in via either method.

See [../overview.md](../overview.md) for context.

---

## Behaviors

### Sign In Options
Two authentication methods are available:

1. **Email/Password** (primary method)
   - Enter email and password on login page
   - Firebase Auth handles credential verification
   - Link to signup page for new users

2. **Google Sign-In**
   - "Continue with Google" button on login page
   - Firebase Auth handles OAuth popup flow
   - Account created automatically if new user

### Sign In Flow
- On success:
  - If user record exists → check for manager_id
  - If no user record → create one (first-time user)
- After sign-in routing:
  - Has `manager_id` → Leagues page (league browser)
  - No `manager_id` → FPL Connection page

### Sign Up
- Dedicated signup page at `/signup`
- Requires email and password
- Password confirmation field
- Redirects to `/connect` after successful signup

### Forgot Password
- Dedicated page at `/forgot-password`
- User enters email address
- Firebase sends password reset email
- Success message shown regardless of whether email exists (security best practice)
- Link back to login page

### First-Time User
- User record created in DataConnect (PostgreSQL) on first sign-in
- Fields initialized:
  - `email` - from sign-in
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
- Unauthenticated user visiting protected route → redirect to `/login`
- After sign-in → redirect to `/leagues` (or `/connect` if no FPL team linked)
- Public routes (bracket view at `/league/{id}`) remain accessible without auth

### Session Persistence
- Session persists across browser refreshes
- Firebase handles token refresh automatically
- Session expires based on Firebase defaults (configurable)

### Sign Out
- Clears local session
- Returns to landing page
- No server-side session invalidation needed (Firebase handles)

---

## Inputs

- Email and password (for email/password sign-in or sign-up)
- Google OAuth token (from Google sign-in flow)
- Email address (for password reset)

---

## Outputs

- Authenticated session
- User record in DataConnect (created or existing)
- Password reset email (for forgot password flow)

---

## Edge Cases

### Sign-in Cancelled
- User closes Google popup or clicks cancel
- Show no error, remain on login page

### Invalid Credentials
- Email/password mismatch
- Show generic error "Invalid email or password" (don't reveal which is wrong)

### Network Error During Auth
- Firebase handles retry logic
- On failure, show generic "Sign in failed, please try again" message

### Email Already Registered
- During signup with email that exists
- Show error indicating email is already in use
- Suggest login or password reset

### Google Account Email Changed
- User identified by Firebase UID, not email
- Email in user record may become stale (acceptable for MVP)

### Multiple Browser Tabs
- Firebase syncs auth state across tabs automatically
- Sign out in one tab signs out all tabs

---

## Scope Limits

- No other social providers (Apple, Facebook, Twitter, etc.)
- No email verification step (user can sign in immediately)
- No account linking (Google and email/password accounts are separate)
- No account deletion flow (manual admin process for MVP)

---

## Related

- See [fpl-connection.md](./fpl-connection.md) for post-auth flow
- See [../journeys/new-user-first-tournament.md](../journeys/new-user-first-tournament.md) for full user flow
