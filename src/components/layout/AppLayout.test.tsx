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
