# Consistent Navbar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add consistent navigation across all pages with contextual navbar variants (landing, auth, authenticated).

**Architecture:** Create a shared `AppLayout` component that wraps all routes and renders a `Navbar` with the appropriate variant based on current route and auth state. The existing Navbar moves from `components/landing/` to `components/layout/` and gains variant support.

**Tech Stack:** React Router (Outlet), shadcn/ui Button, existing AuthContext and auth service.

---

## Task 1: Create Layout Directory and Move Navbar

**Files:**
- Create: `src/components/layout/` directory
- Move: `src/components/landing/Navbar.tsx` → `src/components/layout/Navbar.tsx`
- Move: `src/components/landing/Navbar.test.tsx` → `src/components/layout/Navbar.test.tsx`

**Step 1: Create directory and move files**

```bash
mkdir -p src/components/layout
mv src/components/landing/Navbar.tsx src/components/layout/Navbar.tsx
mv src/components/landing/Navbar.test.tsx src/components/layout/Navbar.test.tsx
```

**Step 2: Update test import path**

In `src/components/layout/Navbar.test.tsx`, the import is relative so no change needed:
```tsx
import { Navbar } from './Navbar';
```

**Step 3: Run tests to verify move didn't break anything**

Run: `npm test -- --run`
Expected: All tests pass (Navbar tests still work from new location)

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move Navbar to layout directory"
```

---

## Task 2: Add Variant Support to Navbar

**Files:**
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/components/layout/Navbar.test.tsx`

**Step 1: Write failing tests for variant prop**

Update `src/components/layout/Navbar.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './Navbar';

// Mock the auth service
vi.mock('../../services/auth', () => ({
  signOut: vi.fn(() => Promise.resolve()),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderNavbar = (variant: 'landing' | 'auth' | 'authenticated' = 'landing') => {
    return render(
      <BrowserRouter>
        <Navbar variant={variant} />
      </BrowserRouter>
    );
  };

  describe('common behavior', () => {
    it('renders without crashing', () => {
      renderNavbar();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('displays KNOCKOUT FPL logo text', () => {
      renderNavbar();
      expect(screen.getByText('KNOCKOUT FPL')).toBeInTheDocument();
    });
  });

  describe('landing variant', () => {
    it('displays Login link', () => {
      renderNavbar('landing');
      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    });

    it('Login link navigates to /login', () => {
      renderNavbar('landing');
      const loginLink = screen.getByRole('link', { name: /login/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('logo links to home page', () => {
      renderNavbar('landing');
      const logoLink = screen.getByRole('link', { name: /knockout fpl/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('has dark background', () => {
      renderNavbar('landing');
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('bg-midnight');
    });
  });

  describe('auth variant', () => {
    it('displays Back to home link', () => {
      renderNavbar('auth');
      expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument();
    });

    it('Back to home link navigates to /', () => {
      renderNavbar('auth');
      const backLink = screen.getByRole('link', { name: /back to home/i });
      expect(backLink).toHaveAttribute('href', '/');
    });

    it('logo links to home page', () => {
      renderNavbar('auth');
      const logoLink = screen.getByRole('link', { name: /knockout fpl/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('has dark background', () => {
      renderNavbar('auth');
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('bg-midnight');
    });

    it('does not display Login link', () => {
      renderNavbar('auth');
      expect(screen.queryByRole('link', { name: /^login$/i })).not.toBeInTheDocument();
    });
  });

  describe('authenticated variant', () => {
    it('displays Logout button', () => {
      renderNavbar('authenticated');
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('logo links to dashboard', () => {
      renderNavbar('authenticated');
      const logoLink = screen.getByRole('link', { name: /knockout fpl/i });
      expect(logoLink).toHaveAttribute('href', '/dashboard');
    });

    it('has light background with border', () => {
      renderNavbar('authenticated');
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('bg-white');
      expect(nav).toHaveClass('border-b');
    });

    it('calls signOut and navigates to / when Logout clicked', async () => {
      const { signOut } = await import('../../services/auth');
      const user = userEvent.setup();

      renderNavbar('authenticated');
      const logoutButton = screen.getByRole('button', { name: /logout/i });

      await user.click(logoutButton);

      expect(signOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/components/layout/Navbar.test.tsx`
Expected: FAIL - variant prop not implemented

**Step 3: Implement variant support in Navbar**

Update `src/components/layout/Navbar.tsx`:

```tsx
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { signOut } from '../../services/auth';

interface NavbarProps {
  variant: 'landing' | 'auth' | 'authenticated';
}

export function Navbar({ variant }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isDark = variant === 'landing' || variant === 'auth';
  const logoHref = variant === 'authenticated' ? '/dashboard' : '/';

  return (
    <nav
      className={`sticky top-0 z-50 ${
        isDark ? 'bg-midnight' : 'bg-white border-b border-gray-200'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to={logoHref}
          className={`text-body-lg font-bold uppercase tracking-wide ${
            isDark ? 'text-white' : 'text-midnight'
          }`}
        >
          KNOCKOUT FPL
        </Link>

        {variant === 'landing' && (
          <Link
            to="/login"
            className="text-white transition-colors hover:text-gold"
          >
            Login
          </Link>
        )}

        {variant === 'auth' && (
          <Link
            to="/"
            className="text-white transition-colors hover:text-gold"
          >
            ← Back to home
          </Link>
        )}

        {variant === 'authenticated' && (
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </div>
    </nav>
  );
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/components/layout/Navbar.test.tsx`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/components/layout/Navbar.tsx src/components/layout/Navbar.test.tsx
git commit -m "feat: add variant support to Navbar (landing, auth, authenticated)"
```

---

## Task 3: Create AppLayout Component

**Files:**
- Create: `src/components/layout/AppLayout.tsx`
- Create: `src/components/layout/AppLayout.test.tsx`

**Step 1: Write failing tests for AppLayout**

Create `src/components/layout/AppLayout.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { AuthContext } from '../../contexts/AuthContext';
import type { User as FirebaseUser } from 'firebase/auth';

// Mock Navbar to check which variant is passed
vi.mock('./Navbar', () => ({
  Navbar: ({ variant }: { variant: string }) => (
    <nav data-testid="navbar" data-variant={variant}>
      Navbar: {variant}
    </nav>
  ),
}));

describe('AppLayout', () => {
  const renderWithRoute = (
    path: string,
    isAuthenticated: boolean = false
  ) => {
    const mockUser = isAuthenticated
      ? ({ uid: 'test-uid', email: 'test@example.com' } as FirebaseUser)
      : null;

    return render(
      <AuthContext.Provider
        value={{
          user: mockUser,
          loading: false,
          isAuthenticated,
          connectionError: false,
        }}
      >
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<div>Landing Page</div>} />
              <Route path="/login" element={<div>Login Page</div>} />
              <Route path="/signup" element={<div>Signup Page</div>} />
              <Route path="/forgot-password" element={<div>Forgot Password</div>} />
              <Route path="/dashboard" element={<div>Dashboard Page</div>} />
              <Route path="/leagues" element={<div>Leagues Page</div>} />
              <Route path="/profile" element={<div>Profile Page</div>} />
              <Route path="/connect" element={<div>Connect Page</div>} />
              <Route path="/league/:leagueId" element={<div>League Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('landing variant', () => {
    it('uses landing variant on / path', () => {
      renderWithRoute('/');
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveAttribute('data-variant', 'landing');
    });
  });

  describe('auth variant', () => {
    it('uses auth variant on /login', () => {
      renderWithRoute('/login');
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveAttribute('data-variant', 'auth');
    });

    it('uses auth variant on /signup', () => {
      renderWithRoute('/signup');
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveAttribute('data-variant', 'auth');
    });

    it('uses auth variant on /forgot-password', () => {
      renderWithRoute('/forgot-password');
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveAttribute('data-variant', 'auth');
    });

    it('uses auth variant on public league page when not authenticated', () => {
      renderWithRoute('/league/123', false);
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveAttribute('data-variant', 'auth');
    });
  });

  describe('authenticated variant', () => {
    it('uses authenticated variant on /dashboard when logged in', () => {
      renderWithRoute('/dashboard', true);
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveAttribute('data-variant', 'authenticated');
    });

    it('uses authenticated variant on /leagues when logged in', () => {
      renderWithRoute('/leagues', true);
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveAttribute('data-variant', 'authenticated');
    });

    it('uses authenticated variant on /profile when logged in', () => {
      renderWithRoute('/profile', true);
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveAttribute('data-variant', 'authenticated');
    });

    it('uses authenticated variant on /connect when logged in', () => {
      renderWithRoute('/connect', true);
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveAttribute('data-variant', 'authenticated');
    });

    it('uses authenticated variant on public league page when logged in', () => {
      renderWithRoute('/league/123', true);
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveAttribute('data-variant', 'authenticated');
    });
  });

  describe('page content rendering', () => {
    it('renders child route content via Outlet', () => {
      renderWithRoute('/dashboard', true);
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('renders navbar and content together', () => {
      renderWithRoute('/');
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByText('Landing Page')).toBeInTheDocument();
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/components/layout/AppLayout.test.tsx`
Expected: FAIL - AppLayout doesn't exist

**Step 3: Implement AppLayout**

Create `src/components/layout/AppLayout.tsx`:

```tsx
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar } from './Navbar';

type NavbarVariant = 'landing' | 'auth' | 'authenticated';

const AUTH_PATHS = ['/login', '/signup', '/forgot-password'];

export function AppLayout() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const getNavbarVariant = (): NavbarVariant => {
    const path = location.pathname;

    // Landing page
    if (path === '/') {
      return 'landing';
    }

    // Auth pages always use auth variant
    if (AUTH_PATHS.includes(path)) {
      return 'auth';
    }

    // Authenticated users get authenticated variant
    if (isAuthenticated) {
      return 'authenticated';
    }

    // Default to auth (for public pages like /league/:id when not logged in)
    return 'auth';
  };

  return (
    <>
      <Navbar variant={getNavbarVariant()} />
      <Outlet />
    </>
  );
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/components/layout/AppLayout.test.tsx`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/components/layout/AppLayout.tsx src/components/layout/AppLayout.test.tsx
git commit -m "feat: add AppLayout component with navbar variant logic"
```

---

## Task 4: Create Layout Index Export

**Files:**
- Create: `src/components/layout/index.ts`

**Step 1: Create index file**

Create `src/components/layout/index.ts`:

```tsx
export { Navbar } from './Navbar';
export { AppLayout } from './AppLayout';
```

**Step 2: Verify tests still pass**

Run: `npm test -- --run`
Expected: All tests pass

**Step 3: Commit**

```bash
git add src/components/layout/index.ts
git commit -m "chore: add layout component exports"
```

---

## Task 5: Update Router to Use AppLayout

**Files:**
- Modify: `src/router.tsx`
- Modify: `src/router.test.tsx`

**Step 1: Update router.tsx**

Update `src/router.tsx`:

```tsx
import type { RouteObject } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaguePage } from './pages/LeaguePage';
import { LeaguesPage } from './pages/LeaguesPage';
import { ConnectPage } from './pages/ConnectPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout';

export const router: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/signup',
        element: <SignUpPage />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: '/connect',
        element: (
          <ProtectedRoute>
            <ConnectPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/leagues',
        element: (
          <ProtectedRoute>
            <LeaguesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/league/:leagueId',
        element: <LeaguePage />,
      },
    ],
  },
];
```

**Step 2: Run tests to check for failures**

Run: `npm test -- --run`
Expected: Some tests may fail due to duplicate navbars (LandingPage still renders its own)

**Step 3: Commit router changes**

```bash
git add src/router.tsx
git commit -m "feat: wrap routes in AppLayout for consistent navbar"
```

---

## Task 6: Remove Navbar from LandingPage

**Files:**
- Modify: `src/pages/LandingPage.tsx`
- Modify: `src/pages/LandingPage.test.tsx`

**Step 1: Update LandingPage to remove Navbar import**

Update `src/pages/LandingPage.tsx`:

```tsx
import { Hero } from '../components/landing/Hero';
import { ValueProps } from '../components/landing/ValueProps';
import { SocialProof } from '../components/landing/SocialProof';

export function LandingPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ValueProps />
      <SocialProof />
    </main>
  );
}
```

**Step 2: Update LandingPage tests**

The LandingPage tests may check for Navbar. Update `src/pages/LandingPage.test.tsx` to remove Navbar expectations since it's now provided by AppLayout:

Check the current test file first. If it tests for Navbar presence, those tests should be removed or moved to AppLayout tests.

**Step 3: Run tests to verify**

Run: `npm test -- --run`
Expected: All tests pass

**Step 4: Commit**

```bash
git add src/pages/LandingPage.tsx src/pages/LandingPage.test.tsx
git commit -m "refactor: remove Navbar from LandingPage (now in AppLayout)"
```

---

## Task 7: Run Full Test Suite and E2E Verification

**Step 1: Run all unit tests**

Run: `npm test -- --run`
Expected: All tests pass

**Step 2: Start dev server and verify visually**

Run: `npm run dev`

Use Playwright MCP to verify:

1. **Landing page (`/`):** Dark navbar, logo → `/`, Login link
2. **Login page (`/login`):** Dark navbar, logo → `/`, "Back to home" link
3. **Signup page (`/signup`):** Dark navbar, logo → `/`, "Back to home" link
4. **Dashboard (`/dashboard`):** Light navbar, logo → `/dashboard`, Logout button
5. **Leagues (`/leagues`):** Light navbar with Logout
6. **Profile (`/profile`):** Light navbar with Logout
7. **Public league (`/league/123`):** Dark navbar when not logged in

**Step 3: Check console for errors**

Use: `mcp__playwright__browser_console_messages({ level: 'error' })`
Expected: No errors

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address any E2E issues"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Move Navbar to layout directory | Move 2 files |
| 2 | Add variant support to Navbar | Modify Navbar + tests |
| 3 | Create AppLayout component | New AppLayout + tests |
| 4 | Create layout index export | New index.ts |
| 5 | Update router to use AppLayout | Modify router.tsx |
| 6 | Remove Navbar from LandingPage | Modify LandingPage |
| 7 | Full test suite + E2E verification | Verify all works |

**Estimated commits:** 7
