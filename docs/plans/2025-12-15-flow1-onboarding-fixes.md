# Flow 1: Onboarding Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all blocking issues from the E2E flow test so Flow 1 (Landing → Signup → Dashboard) works end-to-end.

**Architecture:** Add timeout-based error detection to AuthContext that catches Firebase connection failures. Add a ForgotPasswordPage. Improve error boundaries. Make the app usable even when Firebase is unavailable during development.

**Tech Stack:** React 18, TypeScript, Firebase Auth, Vitest, React Router

---

## Summary of Issues to Fix

From `docs/reports/e2e-flow-test-2025-12-15.md`:

1. **Protected routes show skeleton indefinitely** when Firebase can't connect
2. **Missing `/forgot-password` route** (linked from LoginForm but 404s)
3. **No graceful error handling** when Firebase emulators are unavailable

---

## Task 1: Add Timeout to AuthContext for Connection Errors

**Files:**
- Modify: `src/contexts/AuthContext.tsx`
- Test: `src/contexts/AuthContext.test.tsx`

### Step 1: Write the failing test for timeout behavior

Add a test that verifies the context times out after a reasonable period and sets an error state.

```typescript
// Add to src/contexts/AuthContext.test.tsx

describe('AuthContext timeout behavior', () => {
  it('sets connectionError after timeout when auth state never resolves', async () => {
    // Mock onAuthStateChanged to never call the callback
    vi.mocked(onAuthStateChanged).mockImplementation(() => {
      // Return unsubscribe but never call callback
      return vi.fn();
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.connectionError).toBe(false);

    // Fast-forward past timeout (5 seconds)
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // Should have error state
    expect(result.current.loading).toBe(false);
    expect(result.current.connectionError).toBe(true);
  });
});
```

### Step 2: Run test to verify it fails

Run: `npm test -- --run src/contexts/AuthContext.test.tsx`
Expected: FAIL with "connectionError" property not existing

### Step 3: Add connectionError state and timeout to AuthContext

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';

const AUTH_TIMEOUT_MS = 5000; // 5 seconds

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  connectionError: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    let hasResolved = false;

    // Set timeout to detect connection failures
    const timeoutId = setTimeout(() => {
      if (!hasResolved) {
        setConnectionError(true);
        setLoading(false);
      }
    }, AUTH_TIMEOUT_MS);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      hasResolved = true;
      clearTimeout(timeoutId);
      setUser(firebaseUser);
      setLoading(false);
      setConnectionError(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    connectionError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Step 4: Run test to verify it passes

Run: `npm test -- --run src/contexts/AuthContext.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/contexts/AuthContext.tsx src/contexts/AuthContext.test.tsx
git commit -m "feat(auth): add connection timeout to AuthContext

Adds 5-second timeout to detect Firebase connection failures.
Sets connectionError flag when auth state never resolves.
"
```

---

## Task 2: Update ProtectedRoute to Handle Connection Errors

**Files:**
- Modify: `src/components/auth/ProtectedRoute.tsx`
- Test: `src/components/auth/ProtectedRoute.test.tsx`

### Step 1: Write failing test for error state rendering

```typescript
// Add to src/components/auth/ProtectedRoute.test.tsx

describe('ProtectedRoute connection error handling', () => {
  it('displays connection error message when Firebase is unavailable', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
      connectionError: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify it fails

Run: `npm test -- --run src/components/auth/ProtectedRoute.test.tsx`
Expected: FAIL with "Unable to connect" not found

### Step 3: Update ProtectedRoute to show error state

```typescript
// src/components/auth/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, connectionError } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to Connect</AlertTitle>
          <AlertDescription className="mt-2">
            We couldn't connect to the authentication service. This may be because:
            <ul className="list-disc list-inside mt-2">
              <li>Firebase emulators aren't running (for local development)</li>
              <li>Network connection issues</li>
            </ul>
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### Step 4: Run test to verify it passes

Run: `npm test -- --run src/components/auth/ProtectedRoute.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/components/auth/ProtectedRoute.tsx src/components/auth/ProtectedRoute.test.tsx
git commit -m "feat(auth): show connection error in ProtectedRoute

Instead of infinite skeleton, shows user-friendly error message
when Firebase connection fails with a retry button.
"
```

---

## Task 3: Create ForgotPasswordPage

**Files:**
- Create: `src/pages/ForgotPasswordPage.tsx`
- Create: `src/pages/ForgotPasswordPage.test.tsx`
- Modify: `src/router.tsx`
- Modify: `src/router.test.tsx`

### Step 3.1: Write failing test for ForgotPasswordPage renders

```typescript
// src/pages/ForgotPasswordPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ForgotPasswordPage } from './ForgotPasswordPage';

describe('ForgotPasswordPage', () => {
  it('renders the forgot password form', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });
});
```

### Step 3.2: Run test to verify it fails

Run: `npm test -- --run src/pages/ForgotPasswordPage.test.tsx`
Expected: FAIL with module not found

### Step 3.3: Create minimal ForgotPasswordPage

```typescript
// src/pages/ForgotPasswordPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert>
              <AlertDescription>
                If an account exists with that email, you'll receive a password reset link shortly.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Remember your password?{' '}
            <Link to="/login" className="underline hover:text-primary">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
```

### Step 3.4: Run test to verify it passes

Run: `npm test -- --run src/pages/ForgotPasswordPage.test.tsx`
Expected: PASS

### Step 3.5: Add route to router.tsx

Update `src/router.tsx` to add the forgot-password route:

```typescript
// Add import at top
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Add to routes array after /signup
{
  path: '/forgot-password',
  element: <ForgotPasswordPage />,
},
```

### Step 3.6: Add router test

```typescript
// Add to src/router.test.tsx
it('has a forgot-password route', () => {
  const forgotPasswordRoute = router.find((r) => r.path === '/forgot-password');
  expect(forgotPasswordRoute).toBeDefined();
});
```

### Step 3.7: Run all tests

Run: `npm test -- --run`
Expected: All tests PASS

### Step 3.8: Commit

```bash
git add src/pages/ForgotPasswordPage.tsx src/pages/ForgotPasswordPage.test.tsx src/router.tsx src/router.test.tsx
git commit -m "feat(auth): add forgot password page

Implements /forgot-password route that was linked but missing.
Uses Firebase sendPasswordResetEmail for password reset flow.
"
```

---

## Task 4: Add Tests for Email Submission

**Files:**
- Modify: `src/pages/ForgotPasswordPage.test.tsx`

### Step 4.1: Write test for successful submission

```typescript
// Add to src/pages/ForgotPasswordPage.test.tsx
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({
  auth: {},
}));

import { sendPasswordResetEmail } from 'firebase/auth';

describe('ForgotPasswordPage form submission', () => {
  it('shows success message after submitting email', async () => {
    const user = userEvent.setup();
    vi.mocked(sendPasswordResetEmail).mockResolvedValue();

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByText(/password reset link/i)).toBeInTheDocument();
  });

  it('shows error message when submission fails', async () => {
    const user = userEvent.setup();
    vi.mocked(sendPasswordResetEmail).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });
});
```

### Step 4.2: Run tests

Run: `npm test -- --run src/pages/ForgotPasswordPage.test.tsx`
Expected: PASS

### Step 4.3: Commit

```bash
git add src/pages/ForgotPasswordPage.test.tsx
git commit -m "test(auth): add forgot password form submission tests"
```

---

## Task 5: Add Link Back to Login from ForgotPasswordPage

**Files:**
- Modify: `src/pages/ForgotPasswordPage.test.tsx`

### Step 5.1: Write test for login link

```typescript
// Add to src/pages/ForgotPasswordPage.test.tsx
it('has a link back to login page', () => {
  render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>
  );

  const loginLink = screen.getByRole('link', { name: /log in/i });
  expect(loginLink).toHaveAttribute('href', '/login');
});
```

### Step 5.2: Run test - should pass (already implemented)

Run: `npm test -- --run src/pages/ForgotPasswordPage.test.tsx`
Expected: PASS

### Step 5.3: Commit (if any changes)

```bash
git add src/pages/ForgotPasswordPage.test.tsx
git commit -m "test(auth): add login link test for forgot password page"
```

---

## Task 6: Run Full Test Suite

### Step 6.1: Run all unit tests

Run: `npm test -- --run`
Expected: All tests PASS

### Step 6.2: Run E2E smoke tests

Run: `npm run test:e2e:smoke`
Expected: All smoke tests PASS

### Step 6.3: Commit if any fixes needed

---

## Task 7: E2E Verification with Playwright MCP

### Step 7.1: Start dev server

Run: `npm run dev`

### Step 7.2: Verify forgot-password route exists

Use Playwright MCP to navigate to `/forgot-password` and verify it renders.

### Step 7.3: Verify protected route error handling

Navigate to `/dashboard` without emulators running - should show error message instead of infinite skeleton.

### Step 7.4: Document results

Update `docs/reports/e2e-flow-test-2025-12-15.md` with new test results.

---

## Task 8: Final Commit

```bash
git add .
git commit -m "feat: complete Flow 1 onboarding fixes

- Add 5s timeout to AuthContext for Firebase connection detection
- Show user-friendly error in ProtectedRoute when Firebase unavailable
- Add /forgot-password page with password reset flow
- All unit tests pass
- E2E verification complete
"
```

---

## Verification Checklist

- [ ] AuthContext times out after 5 seconds if Firebase doesn't respond
- [ ] ProtectedRoute shows error message instead of infinite skeleton
- [ ] ForgotPasswordPage renders at /forgot-password
- [ ] ForgotPasswordPage can submit email for password reset
- [ ] Login page "Forgot password?" link works
- [ ] All unit tests pass
- [ ] E2E smoke tests pass
