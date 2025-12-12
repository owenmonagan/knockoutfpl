import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import * as AuthContext from '../contexts/AuthContext';
import * as userService from '../services/user';
import * as fplService from '../services/fpl';
import * as challengeService from '../services/challenge';

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
}));

vi.mock('../services/challenge', () => ({
  getUserChallenges: vi.fn(),
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

    // Default: no challenges
    vi.mocked(challengeService.getUserChallenges).mockResolvedValue([]);
  });

  describe('PHASE 1: Basic Page Structure', () => {
    it('Step 1: renders with main element', () => {
      render(<DashboardPage />);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('Step 2: shows "Dashboard" heading', () => {
      render(<DashboardPage />);
      const heading = screen.getByRole('heading', { name: /dashboard/i });
      expect(heading).toBeInTheDocument();
    });

    it('Step 3: has container with proper spacing', () => {
      render(<DashboardPage />);
      const main = screen.getByRole('main');
      // Check for container classes (max-w, mx-auto, padding)
      expect(main).toHaveClass('container');
    });

    it('Step 4: shows welcome message', () => {
      render(<DashboardPage />);
      const welcome = screen.getByText(/welcome/i);
      expect(welcome).toBeInTheDocument();
    });

    it("Step 5: displays user's display name in welcome", () => {
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

    it('Step 5a: shows "Create Challenge" button in header even when challenges exist', async () => {
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

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

      // Mock at least one pending challenge so EmptyState is NOT shown
      vi.mocked(challengeService.getUserChallenges).mockResolvedValue([
        {
          challengeId: 'challenge-1',
          gameweek: 10,
          status: 'pending',
          creatorUserId: 'test-uid',
        } as any,
      ]);

      renderWithRouter(<DashboardPage />);

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
      });

      // EmptyState should NOT be shown (because we have challenges)
      expect(screen.queryByText('No Upcoming Challenges')).not.toBeInTheDocument();

      // But we should still see a "Create Challenge" button in the header
      // (This test will fail because the button is only in EmptyState currently)
      const buttons = screen.queryAllByRole('button', { name: /create challenge/i });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('PHASE 2: FPL Connection Card Integration', () => {
    it('Step 6 (Integration): renders FPLConnectionCard component', async () => {
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

  describe('PHASE 3: Real Data Integration', () => {
    const mockAuthUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    } as any;

    const mockUserProfile = {
      userId: 'test-uid',
      fplTeamId: 0,
      fplTeamName: '',
      email: 'test@example.com',
      displayName: 'Test User',
      wins: 0,
      losses: 0,
      createdAt: {} as any,
      updatedAt: {} as any,
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('Integration Test 1: fetches user profile on mount', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: mockAuthUser,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(userService.getUserProfile).mockResolvedValue(mockUserProfile);

      render(<DashboardPage />);

      await waitFor(() => {
        expect(userService.getUserProfile).toHaveBeenCalledWith('test-uid');
      });
    });

    it('Integration Test 2: calls connectFPLTeam when connecting team', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: mockAuthUser,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(userService.getUserProfile).mockResolvedValue(mockUserProfile);
      vi.mocked(userService.connectFPLTeam).mockResolvedValue(undefined);

      render(<DashboardPage />);

      // Wait for initial load
      await waitFor(() => {
        expect(userService.getUserProfile).toHaveBeenCalledWith('test-uid');
      });

      // Find the input and button
      const input = screen.getByLabelText(/fpl team id/i);
      const button = screen.getByRole('button', { name: /connect/i });

      // Enter valid team ID
      fireEvent.change(input, { target: { value: '158256' } });

      // Click connect
      fireEvent.click(button);

      // Should call connectFPLTeam with userId and teamId
      await waitFor(() => {
        expect(userService.connectFPLTeam).toHaveBeenCalledWith('test-uid', 158256);
      });
    });

    it('Integration Test 3: refreshes user profile after connecting team', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: mockAuthUser,
        loading: false,
        isAuthenticated: true,
      });

      // First call: returns unconnected user
      // Second call: returns connected user
      const connectedUserProfile = {
        ...mockUserProfile,
        fplTeamId: 158256,
        fplTeamName: 'Test Team',
      };

      vi.mocked(userService.getUserProfile)
        .mockResolvedValueOnce(mockUserProfile) // Initial load
        .mockResolvedValueOnce(connectedUserProfile); // After connect

      vi.mocked(userService.connectFPLTeam).mockResolvedValue(undefined);

      render(<DashboardPage />);

      // Wait for initial load
      await waitFor(() => {
        expect(userService.getUserProfile).toHaveBeenCalledTimes(1);
      });

      // Should show "Connect Your FPL Team" title
      expect(screen.getByRole('heading', { name: /connect your fpl team/i })).toBeInTheDocument();

      // Find the input and button
      const input = screen.getByLabelText(/fpl team id/i);
      const button = screen.getByRole('button', { name: /connect/i });

      // Enter valid team ID
      fireEvent.change(input, { target: { value: '158256' } });

      // Click connect
      fireEvent.click(button);

      // Should call connectFPLTeam
      await waitFor(() => {
        expect(userService.connectFPLTeam).toHaveBeenCalledWith('test-uid', 158256);
      });

      // Should refresh user profile (second call)
      await waitFor(() => {
        expect(userService.getUserProfile).toHaveBeenCalledTimes(2);
      });

      // Should now show "Your FPL Team" title
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /^your fpl team$/i })).toBeInTheDocument();
      });
    });

    it('Integration Test 4: fetches FPL data when user is connected', async () => {
      // User is already connected
      const connectedUserProfile = {
        ...mockUserProfile,
        fplTeamId: 158256,
        fplTeamName: 'Test Team',
      };

      const mockFPLData = {
        teamName: 'Test Team',
        overallPoints: 427,
        overallRank: 841192,
        gameweekPoints: 78,
        gameweekRank: 1656624,
        teamValue: 102.0,
      };

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: mockAuthUser,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(userService.getUserProfile).mockResolvedValue(connectedUserProfile);
      vi.mocked(fplService.getFPLTeamInfo).mockResolvedValue(mockFPLData);

      render(<DashboardPage />);

      // Wait for user profile to load
      await waitFor(() => {
        expect(userService.getUserProfile).toHaveBeenCalledWith('test-uid');
      });

      // Should call getFPLTeamInfo with the fplTeamId
      await waitFor(() => {
        expect(fplService.getFPLTeamInfo).toHaveBeenCalledWith(158256);
      });
    });

    it('Integration Test 5: calls updateUserProfile when updating team', async () => {
      // User is already connected
      const connectedUserProfile = {
        ...mockUserProfile,
        fplTeamId: 158256,
        fplTeamName: 'Old Team',
      };

      const mockFPLData = {
        teamName: 'Old Team',
        overallPoints: 427,
        overallRank: 841192,
        gameweekPoints: 78,
        gameweekRank: 1656624,
        teamValue: 102.0,
      };

      const newTeamFPLData = {
        teamId: 999999,
        teamName: 'New Team',
        overallPoints: 500,
        overallRank: 100000,
        gameweekPoints: 80,
        gameweekRank: 50000,
        teamValue: 105.0,
      };

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: mockAuthUser,
        loading: false,
        isAuthenticated: true,
      });

      vi.mocked(userService.getUserProfile).mockResolvedValue(connectedUserProfile);
      vi.mocked(fplService.getFPLTeamInfo)
        .mockResolvedValueOnce(mockFPLData) // Initial load
        .mockResolvedValueOnce(newTeamFPLData); // After update
      vi.mocked(userService.updateUserProfile).mockResolvedValue(undefined);

      render(<DashboardPage />);

      // Wait for initial load
      await waitFor(() => {
        expect(userService.getUserProfile).toHaveBeenCalledWith('test-uid');
      });

      // Click Edit button
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      // Change team ID
      const input = screen.getByLabelText(/fpl team id/i);
      fireEvent.change(input, { target: { value: '999999' } });

      // Click Update button
      const updateButton = screen.getByRole('button', { name: /update/i });
      fireEvent.click(updateButton);

      // Should call getFPLTeamInfo with new team ID
      await waitFor(() => {
        expect(fplService.getFPLTeamInfo).toHaveBeenCalledWith(999999);
      });

      // Should call updateUserProfile with new team data
      await waitFor(() => {
        expect(userService.updateUserProfile).toHaveBeenCalledWith('test-uid', {
          fplTeamId: 999999,
          fplTeamName: 'New Team',
        });
      });
    });
  });

  describe('PHASE 4: Stats Section', () => {
    beforeEach(() => {
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
    });

    it('Step 41: shows 4 stat cards', async () => {
      render(<DashboardPage />);
      await waitFor(() => {
        const statCards = screen.getAllByRole('article');
        // 1 FPL Connection Card + 4 Stat Cards + 3 Empty States = 8 total articles
        expect(statCards).toHaveLength(8);
      });
    });

    it('Step 42: shows "Total Challenges" card with 0', async () => {
      render(<DashboardPage />);
      await waitFor(() => {
        const totalChallengesLabel = screen.getByText('Total Challenges');
        expect(totalChallengesLabel).toBeInTheDocument();

        // Check the value is in the same card
        const card = totalChallengesLabel.closest('[role="article"]');
        expect(card).toHaveTextContent('0');
        expect(card).toHaveTextContent('Total Challenges');
      });
    });

    it('Step 43: shows "Wins" card with 0', async () => {
      render(<DashboardPage />);
      await waitFor(() => {
        const winsLabel = screen.getByText('Wins');
        expect(winsLabel).toBeInTheDocument();

        // Check the value is in the same card
        const card = winsLabel.closest('[role="article"]');
        expect(card).toHaveTextContent('0');
        expect(card).toHaveTextContent('Wins');
      });
    });

    it('Step 44: shows "Losses" card with 0', async () => {
      render(<DashboardPage />);
      await waitFor(() => {
        const lossesLabel = screen.getByText('Losses');
        expect(lossesLabel).toBeInTheDocument();

        // Check the value is in the same card
        const card = lossesLabel.closest('[role="article"]');
        expect(card).toHaveTextContent('0');
        expect(card).toHaveTextContent('Losses');
      });
    });

    it('Step 45: shows "Win Rate" card with "N/A"', async () => {
      render(<DashboardPage />);
      await waitFor(() => {
        const winRateLabel = screen.getByText('Win Rate');
        expect(winRateLabel).toBeInTheDocument();

        // Check the value is in the same card
        const card = winRateLabel.closest('[role="article"]');
        expect(card).toHaveTextContent('N/A');
        expect(card).toHaveTextContent('Win Rate');
      });
    });

    it('Step 46: stats are in responsive grid', async () => {
      render(<DashboardPage />);
      await waitFor(() => {
        const totalChallengesLabel = screen.getByText('Total Challenges');
        const gridContainer = totalChallengesLabel.closest('.grid');

        expect(gridContainer).toBeInTheDocument();
        expect(gridContainer).toHaveClass('grid');
        expect(gridContainer).toHaveClass('gap-4');
        expect(gridContainer).toHaveClass('md:grid-cols-2');
        expect(gridContainer).toHaveClass('lg:grid-cols-4');
      });
    });
  });

  describe('PHASE 6: Challenge Sections', () => {
    beforeEach(() => {
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
    });

    it('Step 55: shows "Upcoming Challenges" section header', async () => {
      render(<DashboardPage />);
      await waitFor(() => {
        const header = screen.getByRole('heading', { name: 'Upcoming Challenges (0)', level: 2 });
        expect(header).toBeInTheDocument();
      });
    });

    it('Step 56: shows count in header (0 initially)', async () => {
      render(<DashboardPage />);
      await waitFor(() => {
        const header = screen.getByRole('heading', { name: /upcoming challenges.*0/i });
        expect(header).toBeInTheDocument();
      });
    });

    it('Step 57: shows empty state for upcoming challenges', async () => {
      render(<DashboardPage />);
      await waitFor(() => {
        expect(screen.getByText('No Upcoming Challenges')).toBeInTheDocument();
      });
    });

    it('Step 58: empty state has "Create Challenge" button', async () => {
      renderWithRouter(<DashboardPage />);
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /create challenge/i });
        expect(button).toBeInTheDocument();
      });
    });

    it('Step 58a: clicking "Create Challenge" button navigates to /create-challenge', async () => {
      const user = userEvent.setup();
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      renderWithRouter(<DashboardPage />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button', { name: /create challenge/i });
        expect(buttons.length).toBeGreaterThan(0);
      });

      // Click the first "Create Challenge" button (could be header or empty state)
      const createButtons = screen.getAllByRole('button', { name: /create challenge/i });
      await user.click(createButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/create-challenge');
    });

    it('Step 59: shows "Active Challenges" section header', async () => {
      render(<DashboardPage />);
      await waitFor(() => {
        const header = screen.getByRole('heading', { name: 'Active Challenges (0)', level: 2 });
        expect(header).toBeInTheDocument();
      });
    });

    it('Step 60: shows empty state for active challenges', async () => {
      render(<DashboardPage />);
      await waitFor(() => {
        expect(screen.getByText('No Active Challenges')).toBeInTheDocument();
      });
    });

    it('Step 61: shows "Completed Challenges" section header', async () => {
      render(<DashboardPage />);
      await waitFor(() => {
        const header = screen.getByRole('heading', { name: 'Completed Challenges (0)', level: 2 });
        expect(header).toBeInTheDocument();
      });
    });

    it('Step 62: shows empty state for completed challenges', async () => {
      render(<DashboardPage />);
      await waitFor(() => {
        expect(screen.getByText('No Completed Challenges')).toBeInTheDocument();
      });
    });
  });

  describe('PHASE 7: Loading States', () => {
    it('Step 63: shows skeleton loading while fetching user', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        } as any,
        loading: false,
        isAuthenticated: true,
      });

      // Make getUserProfile return a delayed promise
      vi.mocked(userService.getUserProfile).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          userId: 'test-uid',
          fplTeamId: 0,
          fplTeamName: '',
          email: 'test@example.com',
          displayName: 'Test User',
          wins: 0,
          losses: 0,
          createdAt: {} as any,
          updatedAt: {} as any,
        }), 100))
      );

      render(<DashboardPage />);

      // Should show skeleton (check for skeleton class)
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);

      // Should NOT show the real content yet
      expect(screen.queryByRole('heading', { name: /connect your fpl team/i })).not.toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
      });

      // Should now show real content
      expect(screen.getByRole('heading', { name: /connect your fpl team/i })).toBeInTheDocument();
    });
  });

  describe('PHASE 8: Challenge Integration', () => {
    it('Step 74: fetches user challenges on mount', async () => {
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

      vi.mocked(challengeService.getUserChallenges).mockResolvedValue([]);

      render(<DashboardPage />);

      await waitFor(() => {
        expect(challengeService.getUserChallenges).toHaveBeenCalledWith('test-uid');
      });
    });

    it('Step 75: calculates and displays stats from challenge data', async () => {
      const mockChallenges = [
        {
          challengeId: 'challenge-1',
          status: 'completed',
          winnerId: 'test-uid',
        } as any,
        {
          challengeId: 'challenge-2',
          status: 'completed',
          winnerId: 'other-user',
          isDraw: false,
        } as any,
      ];

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

      vi.mocked(challengeService.getUserChallenges).mockResolvedValue(mockChallenges);

      renderWithRouter(<DashboardPage />);

      await waitFor(() => {
        const totalCard = screen.getByText('Total Challenges').closest('[role="article"]');
        expect(totalCard).toHaveTextContent('2');
      });

      await waitFor(() => {
        const winsCard = screen.getByText('Wins').closest('[role="article"]');
        expect(winsCard).toHaveTextContent('1');
      });

      await waitFor(() => {
        const lossesCard = screen.getByText('Losses').closest('[role="article"]');
        expect(lossesCard).toHaveTextContent('1');
      });

      await waitFor(() => {
        const winRateCard = screen.getByText('Win Rate').closest('[role="article"]');
        expect(winRateCard).toHaveTextContent('50%');
      });
    });

    it('Step 76: displays pending challenges with ChallengeCards', async () => {
      const pendingChallenge = {
        challengeId: 'pending-1',
        gameweek: 10,
        status: 'pending',
        creatorUserId: 'test-uid',
      } as any;

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

      vi.mocked(challengeService.getUserChallenges).mockResolvedValue([pendingChallenge]);

      renderWithRouter(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/gameweek 10/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/pending/i)).toBeInTheDocument();
      });
    });

    it('Step 77: displays active challenges with ChallengeCards', async () => {
      const activeChallenge = {
        challengeId: 'active-1',
        gameweek: 11,
        status: 'accepted',
        creatorUserId: 'test-uid',
        opponentUserId: 'other-user',
        opponentFplTeamName: 'Opponent Team',
      } as any;

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

      vi.mocked(challengeService.getUserChallenges).mockResolvedValue([activeChallenge]);

      renderWithRouter(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/gameweek 11/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        const badges = screen.getAllByText(/active/i);
        // Should have section header and badge
        expect(badges.length).toBeGreaterThan(0);
      });

      await waitFor(() => {
        expect(screen.getByText(/opponent team/i)).toBeInTheDocument();
      });
    });

    it('Step 78: displays completed challenges with ChallengeCards', async () => {
      const completedChallenge = {
        challengeId: 'completed-1',
        gameweek: 9,
        status: 'completed',
        creatorUserId: 'test-uid',
        creatorScore: 85,
        opponentUserId: 'other-user',
        opponentFplTeamName: 'Opponent Team',
        opponentScore: 72,
        winnerId: 'test-uid',
        isDraw: false,
      } as any;

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

      vi.mocked(challengeService.getUserChallenges).mockResolvedValue([completedChallenge]);

      renderWithRouter(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/gameweek 9/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/won/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/85/)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/72/)).toBeInTheDocument();
      });
    });
  });

  describe('Compare Teams Feature', () => {
    it('shows Compare FPL Teams card', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { uid: 'test-user-1', displayName: 'Test User' } as any,
        loading: false,
        isAuthenticated: true,
      });
      vi.mocked(userService.getUserProfile).mockResolvedValue({
        userId: 'test-user-1',
        fplTeamId: 123456,
        fplTeamName: 'Test Team',
      } as any);
      vi.mocked(challengeService.getUserChallenges).mockResolvedValue([]);

      renderWithRouter(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/compare fpl teams/i)).toBeInTheDocument();
      });
    });
  });
});
