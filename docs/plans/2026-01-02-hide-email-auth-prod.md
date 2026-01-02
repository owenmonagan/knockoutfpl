# Hide Email/Password Auth in Production

**Date:** 2026-01-02
**Status:** Planning
**Scope:** Small UI change

## Goal

Hide email/password authentication UI in production while keeping it available for dev/test. Google Sign-In should be the only visible auth option in production.

## Environment Detection

Use existing Vite environment variable pattern:

```typescript
// src/lib/config.ts (new file) or inline
const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
```

**Why this approach:**
- `import.meta.env.DEV` is built-in to Vite (true in dev, false in production build)
- Alternatively, reuse `VITE_USE_FIREBASE_EMULATORS` which is already set per-environment
- Either approach works; `DEV` is simpler

## Components to Modify

### 1. LoginForm.tsx
**Lines 59-101:** Wrap in conditional:
- Hide the "Or" divider
- Hide the email/password form
- Hide "Forgot password?" link

```tsx
{isDevelopment && (
  <>
    <div className="relative">...</div>  {/* "Or" divider */}
    <form onSubmit={handleSubmit}>...</form>
  </>
)}
```

### 2. SignUpForm.tsx
**Lines 77-136:** Same pattern:
- Hide the "Or" divider
- Hide the email/password form (email, displayName, password, confirmPassword fields)

### 3. LoginForm.tsx CardFooter (line 105-112)
**Consider:** Hide "Don't have an account? Sign up" link in prod, OR keep it (Google signup is handled by same flow).
**Recommendation:** Keep the footer link - SignUpPage will also only show Google auth in prod.

### 4. SignUpForm.tsx CardFooter (lines 139-146)
Keep the "Already have an account? Log in" link - same reasoning.

### 5. ForgotPasswordPage.tsx
**Two options:**

**Option A (Recommended):** Redirect to /login in production
- Check `isDevelopment` at component level
- If production, immediately navigate to /login
- Simple, handles bookmarks gracefully

**Option B:** Remove route entirely in production
- More complex, requires dynamic route configuration
- Overkill for this use case

## Route Handling

**No route changes needed.** Keep /forgot-password route registered:
- Edge case (bookmarked URL) handled by ForgotPasswordPage redirect
- Keeps router.tsx simpler
- Avoids conditional route complexity

## Edge Cases

| Scenario | Solution |
|----------|----------|
| User bookmarked /forgot-password in prod | Redirect to /login |
| User types email in prod then deploys to dev | N/A - UI is hidden, not form state |
| Google auth error in prod | Keep error alert visible (already at top level) |

## Implementation Checklist

1. [ ] Create `src/lib/config.ts` with `isDevelopment` export
2. [ ] Update `LoginForm.tsx` - wrap email form + divider in conditional
3. [ ] Update `SignUpForm.tsx` - wrap email form + divider in conditional
4. [ ] Update `ForgotPasswordPage.tsx` - redirect to /login if production
5. [ ] Update CardDescription text conditionally (or keep generic)
6. [ ] Test in dev mode (email form visible)
7. [ ] Test production build (`npm run build && npm run preview`)
8. [ ] E2E: verify login page shows only Google button in prod build

## Files Changed

- `src/lib/config.ts` (new)
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/SignUpForm.tsx`
- `src/pages/ForgotPasswordPage.tsx`

## Estimated Effort

30 minutes
