import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import * as AuthContext from '../contexts/AuthContext';
import * as userService from '../services/user';
import * as fplService from '../services/fpl';

// Helper to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/user', () => ({
  getUserProfile: vi.fn(),
  connectFPLTeam: vi.fn(),
  updateUserProfile: vi.fn(),
}));

vi.mock('../services/fpl', () => ({
  getFPLTeamInfo: vi.fn(),
  getUserMiniLeagues: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('DashboardPage', () => {
  beforeEach(() => {
    // Default: user not authenticated
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
  });

  describe('Basic Page Structure', () => {
    it('renders with main element', () => {
      render(<DashboardPage />);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('shows "Dashboard" heading', () => {
      render(<DashboardPage />);
      const heading = screen.getByRole('heading', { name: /dashboard/i });
      expect(heading).toBeInTheDocument();
    });

    it('has container with proper spacing', () => {
      render(<DashboardPage />);
      const main = screen.getByRole('main');
      // Check for container classes (max-w, mx-auto, padding)
      expect(main).toHaveClass('container');
    });

    it('shows welcome message', () => {
      render(<DashboardPage />);
      const welcome = screen.getByText(/welcome/i);
      expect(welcome).toBeInTheDocument();
    });

    it("displays user's display name in welcome message", () => {
      // Mock authenticated user with display name
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      render(<DashboardPage />);
      const welcome = screen.getByText(/welcome back, test user/i);
      expect(welcome).toBeInTheDocument();
    });
  });

  describe('FPL Connection Card', () => {
    it('renders FPLConnectionCard component', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      // Mock getUserProfile to resolve immediately
      vi.mocked(userService.getUserProfile).mockResolvedValue({
        userId: 'test-uid',
        fplTeamId: 0,
        fplTeamName: '',
        email: 'test@example.com',
        displayName: 'Test User',
        wins: 0,
        losses: 0,
        createdAt: {} as any,
        updatedAt: {} as any,
      });

      render(<DashboardPage />);

      // Wait for loading to complete
      await waitFor(() => {
        const cardTitle = screen.getByRole('heading', { name: /connect your fpl team/i });
        expect(cardTitle).toBeInTheDocument();
      });
    });
  });

  describe('Your Leagues Section', () => {
    it('shows "Your Leagues" section heading', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(userService.getUserProfile).mockResolvedValue({
        userId: 'test-uid',
        fplTeamId: 0,
        fplTeamName: '',
        email: 'test@example.com',
        displayName: 'Test User',
        wins: 0,
        losses: 0,
        createdAt: {} as any,
        updatedAt: {} as any,
      });

      render(<DashboardPage />);

      // Wait for loading to complete and check for "Your Leagues" heading
      await waitFor(() => {
        const leaguesHeading = screen.getByRole('heading', { name: /your leagues/i });
        expect(leaguesHeading).toBeInTheDocument();
      });
    });
  });
});
