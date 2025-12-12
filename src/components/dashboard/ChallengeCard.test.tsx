import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChallengeCard } from './ChallengeCard';
import type { Challenge } from '../../types/challenge';
import { Timestamp } from 'firebase/firestore';
import { BrowserRouter } from 'react-router-dom';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('ChallengeCard', () => {
  const mockChallenge: Challenge = {
    challengeId: 'test-challenge-id',
    gameweek: 8,
    status: 'pending',
    creatorUserId: 'creator-id',
    creatorFplId: 123456,
    creatorFplTeamName: "Owen's Team",
    creatorScore: null,
    opponentUserId: null,
    opponentFplId: null,
    opponentFplTeamName: null,
    opponentScore: null,
    winnerId: null,
    isDraw: false,
    gameweekDeadline: Timestamp.fromDate(new Date('2025-10-21T11:30:00')),
    gameweekFinished: false,
    completedAt: null,
    createdAt: Timestamp.now(),
  };

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<ChallengeCard challenge={mockChallenge} currentUserId="creator-id" />);
    });

    it('should display gameweek number', () => {
      render(<ChallengeCard challenge={mockChallenge} currentUserId="creator-id" />);
      expect(screen.getByText(/gameweek 8/i)).toBeInTheDocument();
    });

    it('should show "Pending" badge for pending challenges', () => {
      render(<ChallengeCard challenge={mockChallenge} currentUserId="creator-id" />);
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });

    it('should show "Waiting for opponent..." message for pending challenges', () => {
      render(<ChallengeCard challenge={mockChallenge} currentUserId="creator-id" />);
      expect(screen.getByText(/waiting for opponent/i)).toBeInTheDocument();
    });

    it('should show share button for pending challenges', () => {
      render(<ChallengeCard challenge={mockChallenge} currentUserId="creator-id" />);
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });
  });

  describe('Active Challenge State', () => {
    const activeChallenge: Challenge = {
      ...mockChallenge,
      status: 'accepted',
      opponentUserId: 'opponent-id',
      opponentFplId: 654321,
      opponentFplTeamName: "John's Team",
    };

    it('should show "Active" badge for accepted challenges', () => {
      render(<ChallengeCard challenge={activeChallenge} currentUserId="creator-id" />);
      expect(screen.getByText(/active/i)).toBeInTheDocument();
    });

    it('should show opponent name in active challenges', () => {
      render(<ChallengeCard challenge={activeChallenge} currentUserId="creator-id" />);
      expect(screen.getByText(/john's team/i)).toBeInTheDocument();
    });
  });

  describe('Completed Challenge State - Winner', () => {
    const completedChallengeWon: Challenge = {
      ...mockChallenge,
      status: 'completed',
      opponentUserId: 'opponent-id',
      opponentFplId: 654321,
      opponentFplTeamName: "John's Team",
      creatorScore: 85,
      opponentScore: 72,
      winnerId: 'creator-id',
      isDraw: false,
    };

    it('should show "Won" badge for won challenges', () => {
      render(<ChallengeCard challenge={completedChallengeWon} currentUserId="creator-id" />);
      expect(screen.getByText(/won/i)).toBeInTheDocument();
    });

    it('should show both scores in completed challenges', () => {
      render(<ChallengeCard challenge={completedChallengeWon} currentUserId="creator-id" />);
      expect(screen.getByText(/85/)).toBeInTheDocument();
      expect(screen.getByText(/72/)).toBeInTheDocument();
    });
  });

  describe('Completed Challenge State - Loser', () => {
    const completedChallengeLost: Challenge = {
      ...mockChallenge,
      status: 'completed',
      opponentUserId: 'opponent-id',
      opponentFplId: 654321,
      opponentFplTeamName: "John's Team",
      creatorScore: 72,
      opponentScore: 85,
      winnerId: 'opponent-id',
      isDraw: false,
    };

    it('should show "Lost" badge for lost challenges', () => {
      render(<ChallengeCard challenge={completedChallengeLost} currentUserId="creator-id" />);
      expect(screen.getByText(/lost/i)).toBeInTheDocument();
    });
  });

  describe('Completed Challenge State - Draw', () => {
    const completedChallengeDraw: Challenge = {
      ...mockChallenge,
      status: 'completed',
      opponentUserId: 'opponent-id',
      opponentFplId: 654321,
      opponentFplTeamName: "John's Team",
      creatorScore: 75,
      opponentScore: 75,
      winnerId: null,
      isDraw: true,
    };

    it('should show "Draw" badge for drawn challenges', () => {
      render(<ChallengeCard challenge={completedChallengeDraw} currentUserId="creator-id" />);
      expect(screen.getByText(/draw/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to challenge detail page when card is clicked', () => {
      render(
        <BrowserRouter>
          <ChallengeCard challenge={mockChallenge} currentUserId="creator-id" />
        </BrowserRouter>
      );

      const card = screen.getByRole('article');
      fireEvent.click(card);

      expect(mockNavigate).toHaveBeenCalledWith('/challenge/test-challenge-id');
    });

    it('should not navigate when share button is clicked', () => {
      mockNavigate.mockClear();
      render(
        <BrowserRouter>
          <ChallengeCard challenge={mockChallenge} currentUserId="creator-id" />
        </BrowserRouter>
      );

      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
