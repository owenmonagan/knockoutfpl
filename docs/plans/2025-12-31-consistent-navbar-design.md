# Consistent Navbar Design

## Overview

Add consistent navigation across all pages in the app. Currently, only the landing page has a navbar. This design introduces a shared layout with contextual navbar variants.

## Design

### Navbar Variants

| Page Type | Variant | Background | Left | Right |
|-----------|---------|------------|------|-------|
| Landing (`/`) | `landing` | Dark (midnight) | Logo → `/` | Login link |
| Auth pages (`/login`, `/signup`, `/forgot-password`) | `auth` | Dark (midnight) | Logo → `/` | Back to home |
| Authenticated pages | `authenticated` | White + border | Logo → `/dashboard` | Logout button |
| Public league view (not logged in) | `auth` | Dark (midnight) | Logo → `/` | Back to home |

### Navigation Philosophy

- **Dashboard is the hub** - Users navigate to Leagues, Profile, etc. from Dashboard
- **Navbar stays minimal** - Logo + one action (Login/Logout/Back)
- **Visual distinction** - Light background for "in-app" feel when authenticated

### Component Structure

#### Navbar Component

```tsx
// src/components/layout/Navbar.tsx
interface NavbarProps {
  variant: 'landing' | 'auth' | 'authenticated';
}
```

Behavior by variant:
- `landing` - Dark bg, logo links to `/`, shows "Login" link
- `auth` - Dark bg, logo links to `/`, shows "Back to home" link
- `authenticated` - White bg with border, logo links to `/dashboard`, shows Logout button

#### AppLayout Component

```tsx
// src/components/layout/AppLayout.tsx
// Wraps all routes, renders Navbar + Outlet
// Determines variant from current route and auth state
```

Variant logic:
1. Path is `/` → `landing`
2. Path is `/login`, `/signup`, `/forgot-password` → `auth`
3. User is authenticated → `authenticated`
4. Otherwise → `auth`

### Router Integration

```tsx
// src/router.tsx
<Route element={<AppLayout />}>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignUpPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  <Route path="/connect" element={<ProtectedRoute><ConnectPage /></ProtectedRoute>} />
  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
  <Route path="/leagues" element={<ProtectedRoute><LeaguesPage /></ProtectedRoute>} />
  <Route path="/league/:leagueId" element={<LeaguePage />} />
</Route>
```

### Styling

**Authenticated variant:**
```tsx
className="sticky top-0 z-50 bg-white border-b border-gray-200"
```

**Logout button:** shadcn `Button` with `variant="ghost"` or `variant="outline"`

## Implementation Steps

1. Create `src/components/layout/` directory
2. Move and refactor `Navbar.tsx` to support variants
3. Create `AppLayout.tsx` with variant logic
4. Update `router.tsx` to use layout wrapper
5. Remove direct `<Navbar />` from `LandingPage.tsx`
6. Test all page types render correct navbar variant

## Files Changed

- `src/components/landing/Navbar.tsx` → `src/components/layout/Navbar.tsx` (move + refactor)
- `src/components/layout/AppLayout.tsx` (new)
- `src/router.tsx` (wrap routes in AppLayout)
- `src/pages/LandingPage.tsx` (remove Navbar import)
