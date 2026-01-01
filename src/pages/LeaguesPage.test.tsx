import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
  getFPLTeamInfo: vi.fn(),
  getFPLBootstrapData: vi.fn(),
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
      connectionError: false,
    });

    // Default: no tournament data
    vi.mocked(tournamentService.getTournamentSummaryForLeague).mockResolvedValue({
      tournament: null,
      userProgress: null,
    });

    // Default: no team info
    vi.mocked(fplService.getFPLTeamInfo).mockResolvedValue({
      teamId: 123456,
      teamName: 'Test Team',
      managerName: 'Test Manager',
      overallRank: 50000,
      gameweekPoints: 65,
    });

    // Default: bootstrap data
    vi.mocked(fplService.getFPLBootstrapData).mockResolvedValue({
      currentGameweek: 15,
    });
  });

  describe('Page Sections', () => {
    it('renders the Your Matches section heading', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        loading: false,
        isAuthenticated: true,
        connectionError: false,
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

      const matchesHeading = await screen.findByRole('heading', { name: /your matches/i });
      expect(matchesHeading).toBeInTheDocument();
    });

    it('renders the Your Leagues section heading', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        loading: false,
        isAuthenticated: true,
        connectionError: false,
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

      const leaguesHeading = await screen.findByRole('heading', { name: /your leagues/i });
      expect(leaguesHeading).toBeInTheDocument();
    });
  });

  describe('Team Identity Section', () => {
    it('displays team name and manager name after loading', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        loading: false,
        isAuthenticated: true,
        connectionError: false,
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

      vi.mocked(fplService.getFPLTeamInfo).mockResolvedValue({
        teamId: 123456,
        teamName: 'My FPL Squad',
        managerName: 'John Smith',
        overallRank: 75000,
        gameweekPoints: 72,
      });

      vi.mocked(fplService.getUserMiniLeagues).mockResolvedValue([]);

      renderWithRouter(<LeaguesPage />);

      const teamName = await screen.findByText('My FPL Squad');
      const managerName = await screen.findByText(/manager: john smith/i);
      expect(teamName).toBeInTheDocument();
      expect(managerName).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows skeleton loaders while fetching data', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        loading: false,
        isAuthenticated: true,
        connectionError: false,
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

      // Keep in loading state for team info
      vi.mocked(fplService.getFPLTeamInfo).mockImplementation(() => new Promise(() => {}));
      vi.mocked(fplService.getUserMiniLeagues).mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<LeaguesPage />);

      // Check for skeleton loaders - they're rendered as div elements with animate-pulse class
      await waitFor(() => {
        const skeletons = document.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBeGreaterThan(0);
      });
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
        connectionError: false,
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

      // LeagueSummaryCard renders league names
      const league1Element = await screen.findByText('Test League');
      const league2Element = await screen.findByText('Another League');
      expect(league1Element).toBeInTheDocument();
      expect(league2Element).toBeInTheDocument();
    });

    it('displays league member counts in managers format', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        loading: false,
        isAuthenticated: true,
        connectionError: false,
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

      // LeagueSummaryCard shows "X managers" format
      const memberCount = await screen.findByText(/2 managers/i);
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
        connectionError: false,
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

      // YourLeaguesSection component shows this message when no leagues
      const emptyMessage = await screen.findByText(/no leagues found/i);
      expect(emptyMessage).toBeInTheDocument();
    });

    it('shows matches empty state when no matches', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        loading: false,
        isAuthenticated: true,
        connectionError: false,
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

      // YourMatchesSection shows this message when no matches
      const matchesEmptyMessage = await screen.findByText(/your knockout journey starts here/i);
      expect(matchesEmptyMessage).toBeInTheDocument();
    });
  });

  describe('Matches Display', () => {
    it('displays current match when user has one', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        loading: false,
        isAuthenticated: true,
        connectionError: false,
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
      ]);

      vi.mocked(tournamentService.getTournamentSummaryForLeague).mockResolvedValue({
        tournament: {
          id: 'tournament-1',
          status: 'active',
          currentRound: 1,
          totalRounds: 4,
          startGameweek: 15,
          endGameweek: 18,
        },
        userProgress: {
          status: 'active',
          eliminationRound: null,
          currentRoundName: 'Round 1',
          currentMatch: {
            opponentTeamName: 'Rival Team',
            opponentManagerName: 'Rival Manager',
            roundNumber: 1,
            roundName: 'Round 1',
            gameweek: 15,
            yourScore: 45,
            theirScore: 42,
            isLive: true,
            result: 'pending',
          },
          recentResult: null,
          nextOpponent: null,
        },
      });

      renderWithRouter(<LeaguesPage />);

      // MatchSummaryCard shows "vs OpponentName" for live/upcoming matches
      const opponentText = await screen.findByText(/vs rival team/i);
      expect(opponentText).toBeInTheDocument();
    });
  });
});
