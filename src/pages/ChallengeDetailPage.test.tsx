import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, useParams, useNavigate } from 'react-router-dom';
import { ChallengeDetailPage } from './ChallengeDetailPage';
import { useAuth } from '../contexts/AuthContext';
import { getChallenge, acceptChallenge } from '../services/challenge';
import { getUserProfile } from '../services/user';
import { Timestamp } from 'firebase/firestore';
import type { Challenge } from '../types/challenge';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

// Mock AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock services
vi.mock('../services/challenge', () => ({
  getChallenge: vi.fn(),
  acceptChallenge: vi.fn(),
}));

vi.mock('../services/user', () => ({
  getUserProfile: vi.fn(),
}));

vi.mock('../services/fpl', () => ({
  getFPLTeamInfo: vi.fn(),
  getFPLTeamPicks: vi.fn(),
  getFPLPlayers: vi.fn(),
  getFPLLiveScores: vi.fn(),
  getFPLFixtures: vi.fn(),
  getFPLGameweekScore: vi.fn().mockResolvedValue({ points: 70 }),
}));

// Test helper: Create a mock challenge
function createMockChallenge(overrides?: Partial<Challenge>): Challenge {
  const deadline = new Date('2025-10-21T10:30:00Z');
  return {
    challengeId: 'test-challenge-123',
    gameweek: 8,
    status: 'pending',
    creatorUserId: 'user-creator-123',
    creatorFplId: 158256,
    creatorFplTeamName: "Owen's Team",
    creatorScore: null,
    opponentUserId: null,
    opponentFplId: null,
    opponentFplTeamName: null,
    opponentScore: null,
    winnerId: null,
    isDraw: false,
    gameweekDeadline: Timestamp.fromDate(deadline),
    gameweekFinished: false,
    completedAt: null,
    createdAt: Timestamp.now(),
    ...overrides,
  };
}

describe('ChallengeDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Phase 3.1: Basic Page Structure', () => {
    it('renders without crashing', () => {
      vi.mocked(useParams).mockReturnValue({ id: 'test-challenge-id' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      vi.mocked(getChallenge).mockResolvedValue(null);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Page should render without throwing
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      vi.mocked(useParams).mockReturnValue({ id: 'test-challenge-id' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      // Make getChallenge return a promise that doesn't resolve immediately
      vi.mocked(getChallenge).mockReturnValue(new Promise(() => {}));

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Should show loading text
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('shows "Challenge not found" when challenge is null', async () => {
      vi.mocked(useParams).mockReturnValue({ id: 'test-challenge-id' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      vi.mocked(getChallenge).mockResolvedValue(null);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Wait for loading to finish and check for not found message
      expect(await screen.findByText(/challenge not found/i)).toBeInTheDocument();
    });

    it('shows challenge data when loaded', async () => {
      const mockChallenge = createMockChallenge();
      vi.mocked(useParams).mockReturnValue({ id: 'test-challenge-id' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Wait for loading to finish and check challenge data is displayed
      expect(await screen.findByText(/gameweek 8/i)).toBeInTheDocument();
      expect(screen.getByText(/owen's team/i)).toBeInTheDocument();
    });
  });

  describe('Phase 3.2: Pending Challenge View', () => {
    it('shows deadline for pending challenge', async () => {
      const mockChallenge = createMockChallenge();
      vi.mocked(useParams).mockReturnValue({ id: 'test-challenge-id' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Should show deadline
      expect(await screen.findByText(/deadline/i)).toBeInTheDocument();
      expect(screen.getByText(/oct.*21/i)).toBeInTheDocument();
    });

    it('shows "Accept Challenge" button for authenticated user with FPL team', async () => {
      const mockChallenge = createMockChallenge({ creatorUserId: 'creator-123' });
      vi.mocked(useParams).mockReturnValue({ id: 'test-challenge-id' });
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'different-user-456' } as any,
        loading: false,
        isAuthenticated: true,
      });
      vi.mocked(getUserProfile).mockResolvedValue({
        userId: 'different-user-456',
        fplTeamId: 999999,
        fplTeamName: 'Test Team',
      } as any);
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Should show Accept Challenge button
      const button = await screen.findByRole('button', { name: /accept challenge/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('does not show "Accept Challenge" button when user is creator', async () => {
      const mockChallenge = createMockChallenge({ creatorUserId: 'creator-user-123' });
      vi.mocked(useParams).mockReturnValue({ id: 'test-challenge-id' });
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'creator-user-123' } as any,
        loading: false,
        isAuthenticated: true,
      });
      vi.mocked(getUserProfile).mockResolvedValue({
        userId: 'creator-user-123',
        fplTeamId: 158256,
        fplTeamName: "Owen's Team",
      } as any);
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Wait for page to load
      await screen.findByText(/gameweek 8/i);

      // Should NOT show Accept Challenge button
      expect(screen.queryByRole('button', { name: /accept challenge/i })).not.toBeInTheDocument();
    });

    it('uses Card component for layout', async () => {
      const mockChallenge = createMockChallenge();
      vi.mocked(useParams).mockReturnValue({ id: 'test-challenge-id' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      const { container } = render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Wait for page to load
      await screen.findByText(/gameweek 8/i);

      // Should use Card component (check for card className pattern from shadcn)
      const cardElement = container.querySelector('[class*="rounded-lg"][class*="border"]');
      expect(cardElement).toBeInTheDocument();
    });
  });

  describe('Phase 3.3: Accept Challenge Logic', () => {
    it('calls acceptChallenge service when Accept button is clicked', async () => {
      const { userEvent } = await import('@testing-library/user-event');
      const user = userEvent.setup();

      const mockChallenge = createMockChallenge({ challengeId: 'challenge-abc', creatorUserId: 'creator-123' });
      vi.mocked(useParams).mockReturnValue({ id: 'challenge-abc' });
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'opponent-456' } as any,
        loading: false,
        isAuthenticated: true,
      });
      vi.mocked(getUserProfile).mockResolvedValue({
        userId: 'opponent-456',
        fplTeamId: 888888,
        fplTeamName: 'Opponent Team',
      } as any);
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(acceptChallenge).mockResolvedValue();

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Wait for button to appear
      const button = await screen.findByRole('button', { name: /accept challenge/i });

      // Click the button
      await user.click(button);

      // Should call acceptChallenge with correct parameters
      expect(acceptChallenge).toHaveBeenCalledWith(
        'challenge-abc',
        'opponent-456',
        888888,
        'Opponent Team'
      );
    });

    it('validates FPL team via API before accepting challenge', async () => {
      const { userEvent } = await import('@testing-library/user-event');
      const user = userEvent.setup();
      const { getFPLTeamInfo } = await import('../services/fpl');

      const mockChallenge = createMockChallenge({ challengeId: 'challenge-validate', creatorUserId: 'creator-123' });
      vi.mocked(useParams).mockReturnValue({ id: 'challenge-validate' });
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'opponent-456' } as any,
        loading: false,
        isAuthenticated: true,
      });
      vi.mocked(getUserProfile).mockResolvedValue({
        userId: 'opponent-456',
        fplTeamId: 888888,
        fplTeamName: 'Opponent Team',
      } as any);
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(acceptChallenge).mockResolvedValue();

      // Mock getFPLTeamInfo to return valid team info
      vi.mocked(getFPLTeamInfo).mockResolvedValue({
        teamId: 888888,
        teamName: 'Opponent Team',
        managerName: 'Test Manager',
        overallPoints: 500,
        overallRank: 100000,
        gameweekPoints: 78,
        gameweekRank: 50000,
        teamValue: 100.0,
      });

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Wait for button to appear
      const button = await screen.findByRole('button', { name: /accept challenge/i });

      // Click the button
      await user.click(button);

      // Should call getFPLTeamInfo to validate team before accepting
      expect(getFPLTeamInfo).toHaveBeenCalledWith(888888);
    });

    it('shows error message when FPL team validation fails', async () => {
      const { userEvent } = await import('@testing-library/user-event');
      const user = userEvent.setup();
      const { getFPLTeamInfo } = await import('../services/fpl');

      const mockChallenge = createMockChallenge({ challengeId: 'challenge-invalid-team', creatorUserId: 'creator-123' });
      vi.mocked(useParams).mockReturnValue({ id: 'challenge-invalid-team' });
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'opponent-456' } as any,
        loading: false,
        isAuthenticated: true,
      });
      vi.mocked(getUserProfile).mockResolvedValue({
        userId: 'opponent-456',
        fplTeamId: 999999,
        fplTeamName: 'Invalid Team',
      } as any);
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      // Mock getFPLTeamInfo to reject (team not found)
      vi.mocked(getFPLTeamInfo).mockRejectedValue(new Error('Team not found'));

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Wait for button to appear
      const button = await screen.findByRole('button', { name: /accept challenge/i });

      // Click the button
      await user.click(button);

      // Should show error message
      expect(await screen.findByText(/unable to validate.*fpl.*team/i)).toBeInTheDocument();
    });
  });

  describe('Phase 3.4: Accepted/Active Challenge View', () => {
    it('shows both team names when challenge is accepted', async () => {
      // Past deadline = gameweek has started, should show live view
      const pastDeadline = new Date('2025-10-01T10:30:00Z');
      const mockChallenge = createMockChallenge({
        status: 'accepted',
        opponentUserId: 'opponent-456',
        opponentFplId: 888888,
        opponentFplTeamName: 'Opponent Team',
        gameweekDeadline: Timestamp.fromDate(pastDeadline),
      });
      vi.mocked(useParams).mockReturnValue({ id: 'test-challenge-id' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Should show both team names (from DifferentialView component - may appear multiple times)
      const owensTeams = await screen.findAllByText(/owen's team/i);
      expect(owensTeams.length).toBeGreaterThan(0);
      const opponentTeams = screen.getAllByText(/opponent team/i);
      expect(opponentTeams.length).toBeGreaterThan(0);
    });

    it('shows PreviewStateView when challenge accepted and gameweek not started', async () => {
      const { getFPLTeamInfo } = await import('../services/fpl');

      // Future deadline = gameweek hasn't started yet
      const futureDeadline = new Date('2099-10-21T10:30:00Z');
      const mockChallenge = createMockChallenge({
        status: 'accepted',
        opponentUserId: 'opponent-456',
        opponentFplId: 888888,
        opponentFplTeamName: 'Opponent Team',
        gameweekDeadline: Timestamp.fromDate(futureDeadline),
      });
      vi.mocked(useParams).mockReturnValue({ id: 'challenge-preview-state' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      // Mock FPL team info for HeadToHeadPreview
      vi.mocked(getFPLTeamInfo).mockResolvedValue({
        teamId: 158256,
        teamName: "Owen's Team",
        managerName: 'Owen',
        overallPoints: 1200,
        overallRank: 50000,
      } as any);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Should show countdown timer (unique to PreviewStateView)
      expect(await screen.findByRole('timer')).toBeInTheDocument();
      expect(screen.getByText(/kicks off in/i)).toBeInTheDocument();
      // Should show status badge
      expect(screen.getByText(/⏰ starting soon/i)).toBeInTheDocument();
      // Should show team names via HeadToHeadPreview (may appear multiple times)
      const owensTeamElements = await screen.findAllByText(/owen's team/i);
      expect(owensTeamElements.length).toBeGreaterThan(0);
      const opponentTeamElements = await screen.findAllByText(/opponent team/i);
      expect(opponentTeamElements.length).toBeGreaterThan(0);
    });
  });

  describe('Phase 3.5: Completed Challenge View', () => {
    it('shows DifferentialView when challenge is completed', async () => {
      const { getFPLTeamPicks, getFPLPlayers, getFPLLiveScores } = await import('../services/fpl');

      const pastDeadline = new Date('2025-10-01T10:30:00Z');
      const mockChallenge = createMockChallenge({
        status: 'completed',
        opponentUserId: 'opponent-456',
        opponentFplId: 888888,
        opponentFplTeamName: 'Opponent Team',
        creatorScore: 78,
        opponentScore: 76,
        winnerId: 'user-creator-123',
        isDraw: false,
        gameweekDeadline: Timestamp.fromDate(pastDeadline),
        gameweekFinished: true,
      });
      vi.mocked(useParams).mockReturnValue({ id: 'test-challenge-id' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      // Mock FPL service responses
      vi.mocked(getFPLTeamPicks).mockResolvedValue({
        picks: [
          { element: 1, multiplier: 2, is_captain: true, is_vice_captain: false, position: 1 }
        ],
        activeChip: null,
      } as any);
      vi.mocked(getFPLPlayers).mockResolvedValue(new Map([
        [1, { id: 1, web_name: 'Salah', element_type: 3, now_cost: 130 } as any]
      ]));
      vi.mocked(getFPLLiveScores).mockResolvedValue(new Map([[1, 12]]));

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Should show DifferentialView with matchup results
      expect(await screen.findByText(/matchup results/i)).toBeInTheDocument();
      // Should show both team names
      const owensTeams = screen.getAllByText(/owen's team/i);
      expect(owensTeams.length).toBeGreaterThan(0);
      const opponentTeams = screen.getAllByText(/opponent team/i);
      expect(opponentTeams.length).toBeGreaterThan(0);
    });
  });

  describe('Phase 3.6: Deadline Validation', () => {
    it('disables accept button when deadline has passed', async () => {
      // Create a challenge with a past deadline
      const pastDeadline = new Date('2025-10-01T10:30:00Z'); // Past date
      const mockChallenge = createMockChallenge({
        challengeId: 'challenge-past',
        creatorUserId: 'creator-123',
        gameweekDeadline: Timestamp.fromDate(pastDeadline),
      });

      vi.mocked(useParams).mockReturnValue({ id: 'challenge-past' });
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'opponent-456' } as any,
        loading: false,
        isAuthenticated: true,
      });
      vi.mocked(getUserProfile).mockResolvedValue({
        userId: 'opponent-456',
        fplTeamId: 888888,
        fplTeamName: 'Opponent Team',
      } as any);
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Wait for page to load
      await screen.findByText(/gameweek 8/i);

      // Should show "Challenge Expired" message
      expect(screen.getByText(/challenge expired/i)).toBeInTheDocument();
      // Should NOT show accept button (or it should be disabled)
      const acceptButton = screen.queryByRole('button', { name: /accept challenge/i });
      expect(acceptButton).not.toBeInTheDocument();
    });

    it('shows accept button when deadline has not passed', async () => {
      // Create a challenge with a future deadline
      const futureDeadline = new Date('2099-10-21T10:30:00Z'); // Future date
      const mockChallenge = createMockChallenge({
        challengeId: 'challenge-future',
        creatorUserId: 'creator-123',
        gameweekDeadline: Timestamp.fromDate(futureDeadline),
      });

      vi.mocked(useParams).mockReturnValue({ id: 'challenge-future' });
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'opponent-456' } as any,
        loading: false,
        isAuthenticated: true,
      });
      vi.mocked(getUserProfile).mockResolvedValue({
        userId: 'opponent-456',
        fplTeamId: 888888,
        fplTeamName: 'Opponent Team',
      } as any);
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Wait for page to load
      await screen.findByText(/gameweek 8/i);

      // Should NOT show "Challenge Expired" message
      expect(screen.queryByText(/challenge expired/i)).not.toBeInTheDocument();
      // Should show accept button and it should be enabled
      const acceptButton = await screen.findByRole('button', { name: /accept challenge/i });
      expect(acceptButton).toBeInTheDocument();
      expect(acceptButton).not.toBeDisabled();
    });
  });

  describe('Phase 3.7: Already Accepted Challenge', () => {
    it('shows message when challenge is already accepted by someone else', async () => {
      // Create a challenge that's already been accepted with past deadline (show live view)
      const pastDeadline = new Date('2025-10-01T10:30:00Z');
      const mockChallenge = createMockChallenge({
        status: 'accepted',
        creatorUserId: 'creator-123',
        opponentUserId: 'someone-else-789',
        opponentFplId: 777777,
        opponentFplTeamName: 'Someone Elses Team',
        gameweekDeadline: Timestamp.fromDate(pastDeadline),
      });

      vi.mocked(useParams).mockReturnValue({ id: 'challenge-taken' });
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'viewer-999' } as any,
        loading: false,
        isAuthenticated: true,
      });
      vi.mocked(getUserProfile).mockResolvedValue({
        userId: 'viewer-999',
        fplTeamId: 888888,
        fplTeamName: 'Viewer Team',
      } as any);
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Wait for page to load (may appear multiple times in differential view)
      const gameweekTexts = await screen.findAllByText(/gameweek 8/i);
      expect(gameweekTexts.length).toBeGreaterThan(0);

      // Should show both team names (creator vs opponent - may appear multiple times)
      const owensTeams = screen.getAllByText(/owen's team/i);
      expect(owensTeams.length).toBeGreaterThan(0);
      const someoneElsesTeams = screen.getAllByText(/someone elses team/i);
      expect(someoneElsesTeams.length).toBeGreaterThan(0);
      // Should NOT show accept button for viewer who is not part of the challenge
      const acceptButton = screen.queryByRole('button', { name: /accept challenge/i });
      expect(acceptButton).not.toBeInTheDocument();
    });
  });

  describe('Phase 3.8: User Without FPL Team', () => {
    it('shows message when user has no FPL team connected', async () => {
      const mockChallenge = createMockChallenge({ creatorUserId: 'creator-123' });
      vi.mocked(useParams).mockReturnValue({ id: 'challenge-nofpl' });
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'viewer-999' } as any,
        loading: false,
        isAuthenticated: true,
      });
      // User profile exists but has no FPL team (fplTeamId is 0 or null)
      vi.mocked(getUserProfile).mockResolvedValue({
        userId: 'viewer-999',
        fplTeamId: 0,
        fplTeamName: '',
      } as any);
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Wait for page to load
      await screen.findByText(/gameweek 8/i);

      // Should show message prompting user to connect FPL team
      expect(screen.getByText(/connect.*fpl.*team/i)).toBeInTheDocument();
      // Should NOT show accept button
      const acceptButton = screen.queryByRole('button', { name: /accept challenge/i });
      expect(acceptButton).not.toBeInTheDocument();
    });
  });

  describe('Phase 3.10: Live Comparison View', () => {
    it('fetches team picks and calculates differentials for live challenge', async () => {
      const { getFPLTeamPicks, getFPLPlayers, getFPLLiveScores } = await import('../services/fpl');
      const { calculateDifferentials } = await import('../services/differentials');

      // Create a challenge that's accepted with a past deadline (gameweek has started)
      const pastDeadline = new Date('2025-10-01T10:30:00Z'); // Past date = gameweek started
      const mockChallenge = createMockChallenge({
        status: 'accepted',
        creatorUserId: 'creator-123',
        creatorFplId: 158256,
        creatorFplTeamName: "Owen's Team",
        opponentUserId: 'opponent-456',
        opponentFplId: 888888,
        opponentFplTeamName: 'Opponent Team',
        gameweekDeadline: Timestamp.fromDate(pastDeadline),
      });

      vi.mocked(useParams).mockReturnValue({ id: 'challenge-live' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      // Mock FPL service responses
      vi.mocked(getFPLTeamPicks).mockResolvedValue({
        picks: [
          { element: 1, multiplier: 2, is_captain: true, is_vice_captain: false, position: 1 }
        ],
        activeChip: null,
      } as any);
      vi.mocked(getFPLPlayers).mockResolvedValue(new Map([
        [1, { id: 1, web_name: 'Salah', element_type: 3, now_cost: 130 } as any]
      ]));
      vi.mocked(getFPLLiveScores).mockResolvedValue(new Map([[1, 12]]));

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Wait for page to load
      await screen.findByText(/gameweek 8/i);

      // Should fetch team picks for both teams
      expect(getFPLTeamPicks).toHaveBeenCalledWith(158256, 8);
      expect(getFPLTeamPicks).toHaveBeenCalledWith(888888, 8);

      // Should fetch players data
      expect(getFPLPlayers).toHaveBeenCalled();

      // Should fetch live scores
      expect(getFPLLiveScores).toHaveBeenCalledWith(8);
    });

    it('fetches fixtures for the gameweek when challenge is live', async () => {
      const { getFPLTeamPicks, getFPLPlayers, getFPLLiveScores, getFPLFixtures } = await import('../services/fpl');

      const pastDeadline = new Date('2025-10-01T10:30:00Z');
      const mockChallenge = createMockChallenge({
        status: 'accepted',
        creatorUserId: 'creator-123',
        creatorFplId: 158256,
        opponentUserId: 'opponent-456',
        opponentFplId: 888888,
        gameweekDeadline: Timestamp.fromDate(pastDeadline),
      });

      vi.mocked(useParams).mockReturnValue({ id: 'challenge-fixtures' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      vi.mocked(getFPLTeamPicks).mockResolvedValue({ picks: [], activeChip: null } as any);
      vi.mocked(getFPLPlayers).mockResolvedValue(new Map());
      vi.mocked(getFPLLiveScores).mockResolvedValue(new Map());
      vi.mocked(getFPLFixtures).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      await screen.findByText(/gameweek 8/i);

      expect(getFPLFixtures).toHaveBeenCalledWith(8);
    });

    it('shows live comparison view when challenge is active and gameweek has started', async () => {
      const { getFPLTeamPicks, getFPLPlayers, getFPLLiveScores } = await import('../services/fpl');

      // Create a challenge that's accepted with a past deadline (gameweek has started)
      const pastDeadline = new Date('2025-10-01T10:30:00Z'); // Past date = gameweek started
      const mockChallenge = createMockChallenge({
        status: 'accepted',
        creatorUserId: 'creator-123',
        creatorFplId: 158256,
        creatorFplTeamName: "Owen's Team",
        opponentUserId: 'opponent-456',
        opponentFplId: 888888,
        opponentFplTeamName: 'Opponent Team',
        gameweekDeadline: Timestamp.fromDate(pastDeadline),
      });

      vi.mocked(useParams).mockReturnValue({ id: 'challenge-live' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      // Mock FPL service responses
      vi.mocked(getFPLTeamPicks).mockResolvedValue({
        picks: [
          { element: 1, multiplier: 2, is_captain: true, is_vice_captain: false, position: 1 }
        ],
        activeChip: null,
      } as any);
      vi.mocked(getFPLPlayers).mockResolvedValue(new Map([
        [1, { id: 1, web_name: 'Salah', element_type: 3, now_cost: 130 } as any]
      ]));
      vi.mocked(getFPLLiveScores).mockResolvedValue(new Map([[1, 12]]));

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Should show the live comparison view with "Matchup Results" heading
      // This is unique to the DifferentialView component
      expect(await screen.findByText(/matchup results/i)).toBeInTheDocument();
    });

    it('shows LIVE badge when gameweek is in progress', async () => {
      const pastDeadline = new Date('2025-10-01T10:30:00Z');
      const mockChallenge = createMockChallenge({
        status: 'active',
        opponentUserId: 'opponent-456',
        opponentFplId: 888888,
        opponentFplTeamName: 'Opponent Team',
        gameweekDeadline: Timestamp.fromDate(pastDeadline),
        gameweekFinished: false, // Gameweek is still in progress
      });

      vi.mocked(useParams).mockReturnValue({ id: 'challenge-live-badge' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Should show LIVE badge
      expect(await screen.findByText(/live/i)).toBeInTheDocument();
    });

    it('shows FINAL badge when challenge is completed', async () => {
      const pastDeadline = new Date('2025-10-01T10:30:00Z');
      const mockChallenge = createMockChallenge({
        status: 'completed',
        opponentUserId: 'opponent-456',
        opponentFplId: 888888,
        opponentFplTeamName: 'Opponent Team',
        gameweekDeadline: Timestamp.fromDate(pastDeadline),
        gameweekFinished: true, // Gameweek is finished
        creatorScore: 78,
        opponentScore: 65,
        winnerId: 'user-creator-123',
      });

      vi.mocked(useParams).mockReturnValue({ id: 'challenge-final-badge' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Should show FINAL badge
      expect(await screen.findByText(/final/i)).toBeInTheDocument();
    });

    it('fetches team picks and calculates differentials for completed challenge', async () => {
      const { getFPLTeamPicks, getFPLPlayers, getFPLLiveScores } = await import('../services/fpl');

      const pastDeadline = new Date('2025-10-01T10:30:00Z');
      const mockChallenge = createMockChallenge({
        status: 'completed',
        creatorUserId: 'creator-123',
        creatorFplId: 158256,
        creatorFplTeamName: "Owen's Team",
        opponentUserId: 'opponent-456',
        opponentFplId: 888888,
        opponentFplTeamName: 'Opponent Team',
        gameweekDeadline: Timestamp.fromDate(pastDeadline),
        gameweekFinished: true,
        creatorScore: 78,
        opponentScore: 65,
        winnerId: 'creator-123',
      });

      vi.mocked(useParams).mockReturnValue({ id: 'challenge-completed-data' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      // Mock FPL service responses
      vi.mocked(getFPLTeamPicks).mockResolvedValue({
        picks: [
          { element: 1, multiplier: 2, is_captain: true, is_vice_captain: false, position: 1 }
        ],
        activeChip: null,
      } as any);
      vi.mocked(getFPLPlayers).mockResolvedValue(new Map([
        [1, { id: 1, web_name: 'Salah', element_type: 3, now_cost: 130 } as any]
      ]));
      vi.mocked(getFPLLiveScores).mockResolvedValue(new Map([[1, 12]]));

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Wait for page to load
      await screen.findByText(/gameweek 8/i);

      // Should fetch team picks for both teams
      expect(getFPLTeamPicks).toHaveBeenCalledWith(158256, 8);
      expect(getFPLTeamPicks).toHaveBeenCalledWith(888888, 8);

      // Should fetch players data
      expect(getFPLPlayers).toHaveBeenCalled();

      // Should fetch live scores
      expect(getFPLLiveScores).toHaveBeenCalledWith(8);
    });

    it('shows DifferentialView for completed challenge', async () => {
      const { getFPLTeamPicks, getFPLPlayers, getFPLLiveScores } = await import('../services/fpl');

      const pastDeadline = new Date('2025-10-01T10:30:00Z');
      const mockChallenge = createMockChallenge({
        status: 'completed',
        creatorUserId: 'creator-123',
        creatorFplId: 158256,
        creatorFplTeamName: "Owen's Team",
        opponentUserId: 'opponent-456',
        opponentFplId: 888888,
        opponentFplTeamName: 'Opponent Team',
        gameweekDeadline: Timestamp.fromDate(pastDeadline),
        gameweekFinished: true,
        creatorScore: 78,
        opponentScore: 65,
        winnerId: 'creator-123',
      });

      vi.mocked(useParams).mockReturnValue({ id: 'challenge-completed-differential' });
      vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false });
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      // Mock FPL service responses
      vi.mocked(getFPLTeamPicks).mockResolvedValue({
        picks: [
          { element: 1, multiplier: 2, is_captain: true, is_vice_captain: false, position: 1 }
        ],
        activeChip: null,
      } as any);
      vi.mocked(getFPLPlayers).mockResolvedValue(new Map([
        [1, { id: 1, web_name: 'Salah', element_type: 3, now_cost: 130 } as any]
      ]));
      vi.mocked(getFPLLiveScores).mockResolvedValue(new Map([[1, 12]]));

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Should show DifferentialView with "Matchup Results" heading
      expect(await screen.findByText(/matchup results/i)).toBeInTheDocument();
    });
  });

  describe('Phase 3.9: Unauthenticated User Flow (FR-3.2)', () => {
    it('shows "Sign Up to Accept" button for unauthenticated users', async () => {
      const mockChallenge = createMockChallenge({
        challengeId: 'challenge-unauth',
        creatorUserId: 'creator-123'
      });

      vi.mocked(useParams).mockReturnValue({ id: 'challenge-unauth' });
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        isAuthenticated: false
      });
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Wait for page to load
      await screen.findByText(/gameweek 8/i);

      // Should show "Sign Up to Accept" button for unauthenticated users
      const signUpButton = await screen.findByRole('button', { name: /sign up to accept/i });
      expect(signUpButton).toBeInTheDocument();
    });

    it('navigates to signup with returnUrl when "Sign Up to Accept" is clicked', async () => {
      const { userEvent } = await import('@testing-library/user-event');
      const user = userEvent.setup();
      const mockNavigate = vi.fn();

      const mockChallenge = createMockChallenge({
        challengeId: 'challenge-unauth-2',
        creatorUserId: 'creator-123'
      });

      vi.mocked(useParams).mockReturnValue({ id: 'challenge-unauth-2' });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        isAuthenticated: false
      });
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      render(
        <BrowserRouter>
          <ChallengeDetailPage />
        </BrowserRouter>
      );

      // Wait for button to appear
      const signUpButton = await screen.findByRole('button', { name: /sign up to accept/i });

      // Click the button
      await user.click(signUpButton);

      // Should navigate to /signup with returnUrl
      expect(mockNavigate).toHaveBeenCalledWith('/signup?returnUrl=%2Fchallenge%2Fchallenge-unauth-2');
    });
  });

});
