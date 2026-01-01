import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import * as AuthContext from '../../contexts/AuthContext';
import { getUserProfile } from '../../services/user';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../services/user', () => ({
  getUserProfile: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProtectedRoute', () => {
  it('should render children when user is authenticated and has FPL team', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { uid: 'test-uid' } as any,
      loading: false,
      isAuthenticated: true,
      connectionError: false,
    });

    vi.mocked(getUserProfile).mockResolvedValue({
      userId: 'test-uid',
      fplTeamId: 158256,
      fplTeamName: 'Test Team',
      email: 'test@test.com',
      displayName: 'Test',
      wins: 0,
      losses: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should redirect to login when user is not authenticated', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
      connectionError: false,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show skeleton loading state when loading', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      loading: true,
      isAuthenticated: false,
      connectionError: false,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    // Should show skeleton (check for skeleton class)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);

    // Should NOT show protected content while loading
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('displays connection error message when Firebase is unavailable', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
      connectionError: true,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  describe('FPL Team redirect', () => {
    it('redirects to /connect when user has no FPL Team ID', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { uid: 'test-user-id' } as any,
        loading: false,
        isAuthenticated: true,
        connectionError: false,
      });

      vi.mocked(getUserProfile).mockResolvedValue({
        userId: 'test-user-id',
        fplTeamId: 0,
        fplTeamName: '',
        email: 'test@test.com',
        displayName: 'Test User',
        wins: 0,
        losses: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route path="/connect" element={<div>Connect Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Connect Page')).toBeInTheDocument();
      });
    });

    it('does not redirect when user has FPL Team ID', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { uid: 'test-user-id' } as any,
        loading: false,
        isAuthenticated: true,
        connectionError: false,
      });

      vi.mocked(getUserProfile).mockResolvedValue({
        userId: 'test-user-id',
        fplTeamId: 158256,
        fplTeamName: 'Owen FC',
        email: 'test@test.com',
        displayName: 'Test User',
        wins: 0,
        losses: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route path="/connect" element={<div>Connect Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });
  });
});
