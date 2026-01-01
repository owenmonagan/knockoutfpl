# Unified Header Design

**Date:** 2025-12-31
**Status:** Approved

## Summary

Replace `LandingHeader` and `Navbar` with a single `AppHeader` component that adapts based on context, using the LandingHeader visual style throughout the app.

## Visual Style

- Height: `h-20` (80px)
- Background: `bg-background/90 backdrop-blur-md`
- Border: `border-b border-border`
- Logo: Trophy icon (`emoji_events`) + "Knockout FPL" text
- Max width container (`max-w-7xl`) with responsive padding

## Component Interface

```typescript
interface AppHeaderProps {
  variant: 'landing' | 'auth' | 'authenticated';
  authPage?: 'login' | 'signup' | 'forgot-password';
}
```

## Behavior by Variant

| Variant | Logo Links To | Right Side Content |
|---------|---------------|-------------------|
| `landing` | `/` | "Login" link + "Create Tournament" button |
| `auth` (login) | `/` | "Sign Up" link |
| `auth` (signup/forgot) | `/` | "Log In" link |
| `authenticated` | `/leagues` | "Logout" button (ghost variant) |

## File Changes

### Create
- `src/components/layout/AppHeader.tsx` — New unified header component

### Modify
- `src/components/layout/AppLayout.tsx` — Use `AppHeader` for all routes
- `src/pages/LandingPage.tsx` — Remove `LandingHeader` import/usage

### Delete
- `src/components/landing/LandingHeader.tsx`
- `src/components/landing/LandingHeader.test.tsx`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Navbar.test.tsx`

## Implementation Notes

- AppLayout will always render `<AppHeader />` (remove landing page conditional)
- Pass `authPage` prop to determine login/signup toggle text
- Logout handler uses existing `signOut` from auth service
