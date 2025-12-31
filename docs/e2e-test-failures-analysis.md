# E2E Test Failures Analysis

**Date:** 2025-12-31
**Test Run:** 32 passed, 26 failed, 9 skipped
**Emulator Config:** Auth + Firestore (DataConnect excluded due to instability)

---

## Summary by Category

| Category | Count | Root Cause |
|----------|-------|------------|
| DataConnect-dependent | 15 | No DataConnect emulator running |
| UI/Selector mismatch | 6 | Test expectations don't match current UI |
| Redirect flow issues | 5 | Signup doesn't redirect to expected page |

---

## Detailed Failure Analysis

### Category 1: DataConnect-Dependent Tests (15 failures)

These tests require tournament/bracket data from DataConnect which isn't available.

#### Journey Tests - New User First Tournament

| Test | File:Line | Why Failing |
|------|-----------|-------------|
| Complete flow: landing -> signup -> connect -> create -> share | `new-user-first-tournament.spec.ts:65` | After signup, expects redirect to `/connect` but stays on `/signup`. Signup flow may be failing silently due to missing DataConnect sync. |
| Should pre-fill tournament name from league name | `new-user-first-tournament.spec.ts:145` | Same as above - signup redirect failing |
| Should generate bracket on tournament creation | `new-user-first-tournament.spec.ts:167` | Same as above - signup redirect failing |
| Should show participant count after creation | `new-user-first-tournament.spec.ts:276` | Same as above - signup redirect failing |

#### Journey Tests - Onboarding

| Test | File:Line | Why Failing |
|------|-----------|-------------|
| Should display existing tournaments if user is in any | `onboarding.spec.ts:147` | After login, `waitForURL(/\/(connect|leagues|dashboard)/)` times out. User profile lookup via DataConnect fails, blocking redirect. |
| Should show "arena awaits" state when no tournaments exist | `onboarding.spec.ts:163` | Same - login redirect timing out |
| Should display mini leagues with create/view options | `onboarding.spec.ts:189` | Same - login redirect timing out |

#### Journey Tests - Returning User

| Test | File:Line | Why Failing |
|------|-----------|-------------|
| Should auto-redirect to dashboard when authenticated | `returning-user.spec.ts:38` | `waitForURL(/\/(connect|leagues|dashboard)/)` times out after login. ProtectedRoute calls `getUserProfile` which fails, setting `hasFplTeam=null` and not redirecting. |
| Should display all user leagues with tournament status | `returning-user.spec.ts:84` | Same - login redirect timing out |
| Should handle user with no tournaments gracefully | `returning-user.spec.ts:169` | Same - login redirect timing out |
| Should indicate eliminated status when user is out | `returning-user.spec.ts:208` | Same - login redirect timing out |
| Should show winner celebration when tournament complete | `returning-user.spec.ts:223` | Same - login redirect timing out |

#### Journey Tests - Shared Link Viewer

| Test | File:Line | Why Failing |
|------|-----------|-------------|
| Should display bracket without authentication | `shared-link-viewer.spec.ts:52` | Looking for `/REMAIN|\d+ teams/i` text - bracket data not loading from DataConnect |
| Should show all participants and matchups | `shared-link-viewer.spec.ts:63` | Looking for seed numbers `(1)`, `(16)` - no bracket data |
| Should display current round status and scores | `shared-link-viewer.spec.ts:72` | Looking for `GW\s*\d+` - no gameweek data from DataConnect |
| Should navigate to dashboard after viewing | `shared-link-viewer.spec.ts:198` | Login redirect times out (same pattern as above) |

---

### Category 2: UI/Selector Mismatch (6 failures)

These tests have expectations that don't match the current UI.

#### Knockout Demo Tests

| Test | File:Line | Why Failing | Fix Needed |
|------|-----------|-------------|------------|
| Complete flow: signup → connect → leagues → knockout | `knockout-demo.spec.ts:30` | Expects redirect to `/dashboard` after signup, but app redirects to `/connect` for new users without FPL team | Update test to expect `/connect` first |
| Login flow: existing user → dashboard → leagues | `knockout-demo.spec.ts:95` | Same - expects `/dashboard` but gets `/signup` (signup flow issue) | Investigate signup flow |
| Displays bracket structure correctly | `knockout-demo.spec.ts:149` | Same pattern | Fix signup redirect |
| Highlights winner with checkmark | `knockout-demo.spec.ts:194` | Same pattern | Fix signup redirect |
| Displays league cards with member count and rank | `knockout-demo.spec.ts:273` | Same pattern | Fix signup redirect |

#### Navigation Tests

| Test | File:Line | Why Failing | Fix Needed |
|------|-----------|-------------|------------|
| Should navigate from landing page to signup via Get Started button | `navigation.spec.ts:21` | Looking for `getByRole('link', { name: 'Get Started' })` - button text or role may have changed | Check LandingPage for actual button text/role |
| Should navigate from landing page to login via Log In button | `navigation.spec.ts:38` | Looking for `getByRole('link', { name: 'Log In' })` - same issue | Check LandingPage for actual link text |

---

### Category 3: Profile Page Tests (3 failures)

| Test | File:Line | Why Failing | Fix Needed |
|------|-----------|-------------|------------|
| Can edit display name | `profile.spec.ts:22` | Looking for display name text that's empty (`originalName` is empty string) | Profile page may not be showing display name correctly, or test user has no display name set |
| Can cancel display name edit | `profile.spec.ts:45` | Same - `originalName` is empty, selector `getByText('')` matches multiple elements | Fix display name handling |
| Can update FPL team from profile | `profile.spec.ts:75` | Looking for `GW Points` text after FPL team update - this UI element may not exist or has different text | Check ProfilePage FPL section UI |

---

## Root Cause Summary

### 1. DataConnect Unavailability (Primary Issue)

The DataConnect emulator's embedded Postgres crashes under load, so we run E2E tests without it. This causes:

- `getUserProfile()` calls to fail silently
- `ProtectedRoute` sets `hasFplTeam = null` instead of `true/false`
- Redirect logic doesn't trigger properly
- Tournament/bracket data doesn't load

**Affected code paths:**
- `src/services/user.ts` - `getUserProfile()`, `connectFPLTeam()`
- `src/components/auth/ProtectedRoute.tsx` - FPL team check
- `src/pages/ConnectPage.tsx` - Existing connection check

### 2. Test Expectations vs Reality

Some tests were written for an older UI or have incorrect assumptions:

- Landing page button text/roles changed
- Profile page display name handling changed
- Signup flow redirects to `/connect` not `/dashboard`

### 3. Signup Flow Not Completing

Several tests show signup staying on `/signup` instead of redirecting. This could be:
- Auth working but DataConnect user sync failing
- Some error blocking the redirect
- Test timing issues

---

## Recommended Fixes

### Short-term (Quick Wins)

1. **Update navigation tests** - Fix button selectors to match current LandingPage
2. **Update knockout-demo tests** - Change expected redirect from `/dashboard` to `/connect`
3. **Fix profile test selectors** - Handle empty display name case

### Medium-term

4. **Add DataConnect fallback data** - Seed Firestore with test tournament data that doesn't require DataConnect
5. **Make ProtectedRoute more resilient** - On DataConnect failure, check Firestore or skip FPL check entirely

### Long-term

6. **Wait for DataConnect emulator stability** - Firebase team may fix the embedded Postgres issues
7. **Use external Postgres** - Run Postgres in Docker for DataConnect instead of embedded

---

## Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/connect.spec.ts

# Run tests by tag
npm run test:e2e:smoke      # Smoke tests
npm run test:e2e:auth       # Auth tests
npm run test:e2e:critical   # Critical tests

# Debug a specific test
npx playwright test e2e/navigation.spec.ts --debug
```
