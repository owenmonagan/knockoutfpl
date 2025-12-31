import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LeaguesPage } from './LeaguesPage';
import * as AuthContext from '../contexts/AuthContext';
import * as userService from '../services/user';
import * as fplService from '../services/fpl';
import * as tournamentService from '../services/tournament';

// Helper to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/user', () => ({
  getUserProfile: vi.fn(),
}));

vi.mock('../services/fpl', () => ({
  getUserMiniLeagues: vi.fn(),
  getLeagueStandings: vi.fn(),
}));

vi.mock('../services/tournament', () => ({
  getTournamentSummaryForLeague: vi.fn(),
}));

describe('LeaguesPage', () => {
  beforeEach(() => {
    // Default: user not authenticated
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    });

    // Default: no tournament data
    vi.mocked(tournamentService.getTournamentSummaryForLeague).mockResolvedValue({
      tournament: null,
      userProgress: null,
    });
  });

  describe('Basic Page Structure', () => {
    it('renders with "Your Mini Leagues" heading', () => {
      renderWithRouter(<LeaguesPage />);
      const heading = screen.getByRole('heading', { name: /your mini leagues/i });
      expect(heading).toBeInTheDocument();
    });

    it('shows subtitle about selecting a league', () => {
      renderWithRouter(<LeaguesPage />);
      const subtitle = screen.getByText(/select a league to start a knockout tournament/i);
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading message while fetching leagues', async () => {
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
        fplTeamId: 123456,
        fplTeamName: 'Test Team',
        email: 'test@example.com',
        displayName: 'Test User',
        wins: 0,
        losses: 0,
        createdAt: {} as any,
        updatedAt: {} as any,
      });

      // Keep in loading state
      vi.mocked(fplService.getUserMiniLeagues).mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<LeaguesPage />);

      const loadingMessage = await screen.findByText(/loading leagues/i);
      expect(loadingMessage).toBeInTheDocument();
    });
  });

  describe('Displaying Leagues', () => {
    it('displays leagues after loading', async () => {
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
        fplTeamId: 123456,
        fplTeamName: 'Test Team',
        email: 'test@example.com',
        displayName: 'Test User',
        wins: 0,
        losses: 0,
        createdAt: {} as any,
        updatedAt: {} as any,
      });

      vi.mocked(fplService.getUserMiniLeagues).mockResolvedValue([
        { id: 123, name: 'Test League', entryRank: 5 },
        { id: 456, name: 'Another League', entryRank: 10 },
      ]);

      vi.mocked(fplService.getLeagueStandings).mockResolvedValue([
        { fplTeamId: 1, teamName: 'Team 1', managerName: 'Manager 1', rank: 1, totalPoints: 100 },
      ]);

      renderWithRouter(<LeaguesPage />);

      // Note: LeaguesTable renders both desktop table and mobile view,
      // so each league name appears twice (in table cell and mobile card)
      const league1Elements = await screen.findAllByText('Test League');
      const league2Elements = await screen.findAllByText('Another League');
      expect(league1Elements.length).toBeGreaterThan(0);
      expect(league2Elements.length).toBeGreaterThan(0);
    });

    it('displays league member counts', async () => {
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
        fplTeamId: 123456,
        fplTeamName: 'Test Team',
        email: 'test@example.com',
        displayName: 'Test User',
        wins: 0,
        losses: 0,
        createdAt: {} as any,
        updatedAt: {} as any,
      });

      vi.mocked(fplService.getUserMiniLeagues).mockResolvedValue([
        { id: 123, name: 'Test League', entryRank: 5 },
      ]);

      vi.mocked(fplService.getLeagueStandings).mockResolvedValue([
        { fplTeamId: 1, teamName: 'Team 1', managerName: 'Manager 1', rank: 1, totalPoints: 100 },
        { fplTeamId: 2, teamName: 'Team 2', managerName: 'Manager 2', rank: 2, totalPoints: 90 },
      ]);

      renderWithRouter(<LeaguesPage />);

      const memberCount = await screen.findByText(/2 members/i);
      expect(memberCount).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state message when no leagues', async () => {
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
        fplTeamId: 123456,
        fplTeamName: 'Test Team',
        email: 'test@example.com',
        displayName: 'Test User',
        wins: 0,
        losses: 0,
        createdAt: {} as any,
        updatedAt: {} as any,
      });

      vi.mocked(fplService.getUserMiniLeagues).mockResolvedValue([]);

      renderWithRouter(<LeaguesPage />);

      // LeaguesTable component shows this message when no leagues
      const emptyMessage = await screen.findByText(/no leagues found/i);
      expect(emptyMessage).toBeInTheDocument();
    });
  });
});
