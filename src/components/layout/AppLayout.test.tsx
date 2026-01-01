import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { AuthContext } from '../../contexts/AuthContext';
import type { User as FirebaseUser } from 'firebase/auth';

// Mock AppHeader to check which variant and authPage are passed
vi.mock('./AppHeader', () => ({
  AppHeader: ({
    variant,
    authPage,
  }: {
    variant: string;
    authPage?: string;
  }) => (
    <header data-testid="app-header" data-variant={variant} data-auth-page={authPage || ''}>
      AppHeader: {variant} {authPage && `(${authPage})`}
    </header>
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

  describe('landing page', () => {
    it('uses landing variant on / path', () => {
      renderWithRoute('/');
      const header = screen.getByTestId('app-header');
      expect(header).toHaveAttribute('data-variant', 'landing');
      expect(screen.getByText('Landing Page')).toBeInTheDocument();
    });
  });

  describe('auth variant', () => {
    it('uses auth variant on /login with login authPage', () => {
      renderWithRoute('/login');
      const header = screen.getByTestId('app-header');
      expect(header).toHaveAttribute('data-variant', 'auth');
      expect(header).toHaveAttribute('data-auth-page', 'login');
    });

    it('uses auth variant on /signup with signup authPage', () => {
      renderWithRoute('/signup');
      const header = screen.getByTestId('app-header');
      expect(header).toHaveAttribute('data-variant', 'auth');
      expect(header).toHaveAttribute('data-auth-page', 'signup');
    });

    it('uses auth variant on /forgot-password with forgot-password authPage', () => {
      renderWithRoute('/forgot-password');
      const header = screen.getByTestId('app-header');
      expect(header).toHaveAttribute('data-variant', 'auth');
      expect(header).toHaveAttribute('data-auth-page', 'forgot-password');
    });

    it('uses auth variant on public league page when not authenticated', () => {
      renderWithRoute('/league/123', false);
      const header = screen.getByTestId('app-header');
      expect(header).toHaveAttribute('data-variant', 'auth');
      expect(header).toHaveAttribute('data-auth-page', '');
    });
  });

  describe('authenticated variant', () => {
    it('uses authenticated variant on /dashboard when logged in', () => {
      renderWithRoute('/dashboard', true);
      const header = screen.getByTestId('app-header');
      expect(header).toHaveAttribute('data-variant', 'authenticated');
    });

    it('uses authenticated variant on /leagues when logged in', () => {
      renderWithRoute('/leagues', true);
      const header = screen.getByTestId('app-header');
      expect(header).toHaveAttribute('data-variant', 'authenticated');
    });

    it('uses authenticated variant on /profile when logged in', () => {
      renderWithRoute('/profile', true);
      const header = screen.getByTestId('app-header');
      expect(header).toHaveAttribute('data-variant', 'authenticated');
    });

    it('uses authenticated variant on /connect when logged in', () => {
      renderWithRoute('/connect', true);
      const header = screen.getByTestId('app-header');
      expect(header).toHaveAttribute('data-variant', 'authenticated');
    });

    it('uses authenticated variant on public league page when logged in', () => {
      renderWithRoute('/league/123', true);
      const header = screen.getByTestId('app-header');
      expect(header).toHaveAttribute('data-variant', 'authenticated');
    });
  });

  describe('page content rendering', () => {
    it('renders child route content via Outlet', () => {
      renderWithRoute('/dashboard', true);
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('renders header and content together', () => {
      renderWithRoute('/login');
      expect(screen.getByTestId('app-header')).toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });
});
