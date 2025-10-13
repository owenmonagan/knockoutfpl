import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DashboardPage } from './DashboardPage';
import * as AuthContext from '../contexts/AuthContext';
import * as userService from '../services/user';
import * as fplService from '../services/fpl';

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

describe('DashboardPage', () => {
  beforeEach(() => {
    // Default: user not authenticated
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
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
  });

  describe('PHASE 2: FPL Connection Card Integration', () => {
    it('Step 6 (Integration): renders FPLConnectionCard component', () => {
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

      // Look for the FPL Connection Card by its title
      const cardTitle = screen.getByRole('heading', { name: /connect your fpl team/i });
      expect(cardTitle).toBeInTheDocument();
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
    });

    it('Step 41: shows 4 stat cards', () => {
      render(<DashboardPage />);
      const statCards = screen.getAllByRole('article');
      // 1 FPL Connection Card + 4 Stat Cards + 3 Empty States = 8 total articles
      expect(statCards).toHaveLength(8);
    });

    it('Step 42: shows "Total Challenges" card with 0', () => {
      render(<DashboardPage />);
      const totalChallengesLabel = screen.getByText('Total Challenges');
      expect(totalChallengesLabel).toBeInTheDocument();

      // Check the value is in the same card
      const card = totalChallengesLabel.closest('[role="article"]');
      expect(card).toHaveTextContent('0');
      expect(card).toHaveTextContent('Total Challenges');
    });

    it('Step 43: shows "Wins" card with 0', () => {
      render(<DashboardPage />);
      const winsLabel = screen.getByText('Wins');
      expect(winsLabel).toBeInTheDocument();

      // Check the value is in the same card
      const card = winsLabel.closest('[role="article"]');
      expect(card).toHaveTextContent('0');
      expect(card).toHaveTextContent('Wins');
    });

    it('Step 44: shows "Losses" card with 0', () => {
      render(<DashboardPage />);
      const lossesLabel = screen.getByText('Losses');
      expect(lossesLabel).toBeInTheDocument();

      // Check the value is in the same card
      const card = lossesLabel.closest('[role="article"]');
      expect(card).toHaveTextContent('0');
      expect(card).toHaveTextContent('Losses');
    });

    it('Step 45: shows "Win Rate" card with "N/A"', () => {
      render(<DashboardPage />);
      const winRateLabel = screen.getByText('Win Rate');
      expect(winRateLabel).toBeInTheDocument();

      // Check the value is in the same card
      const card = winRateLabel.closest('[role="article"]');
      expect(card).toHaveTextContent('N/A');
      expect(card).toHaveTextContent('Win Rate');
    });

    it('Step 46: stats are in responsive grid', () => {
      render(<DashboardPage />);
      const totalChallengesLabel = screen.getByText('Total Challenges');
      const gridContainer = totalChallengesLabel.closest('.grid');

      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid');
      expect(gridContainer).toHaveClass('gap-4');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
      expect(gridContainer).toHaveClass('lg:grid-cols-4');
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
    });

    it('Step 55: shows "Upcoming Challenges" section header', () => {
      render(<DashboardPage />);
      const header = screen.getByRole('heading', { name: 'Upcoming Challenges (0)', level: 2 });
      expect(header).toBeInTheDocument();
    });

    it('Step 56: shows count in header (0 initially)', () => {
      render(<DashboardPage />);
      const header = screen.getByRole('heading', { name: /upcoming challenges.*0/i });
      expect(header).toBeInTheDocument();
    });

    it('Step 57: shows empty state for upcoming challenges', () => {
      render(<DashboardPage />);
      expect(screen.getByText('No Upcoming Challenges')).toBeInTheDocument();
    });

    it('Step 59: shows "Active Challenges" section header', () => {
      render(<DashboardPage />);
      const header = screen.getByRole('heading', { name: 'Active Challenges (0)', level: 2 });
      expect(header).toBeInTheDocument();
    });

    it('Step 60: shows empty state for active challenges', () => {
      render(<DashboardPage />);
      expect(screen.getByText('No Active Challenges')).toBeInTheDocument();
    });

    it('Step 61: shows "Completed Challenges" section header', () => {
      render(<DashboardPage />);
      const header = screen.getByRole('heading', { name: 'Completed Challenges (0)', level: 2 });
      expect(header).toBeInTheDocument();
    });

    it('Step 62: shows empty state for completed challenges', () => {
      render(<DashboardPage />);
      expect(screen.getByText('No Completed Challenges')).toBeInTheDocument();
    });
  });
});
