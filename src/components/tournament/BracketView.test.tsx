// src/components/tournament/BracketView.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BracketView } from './BracketView';
import type { Tournament } from '../../types/tournament';
import { Timestamp } from 'firebase/firestore';

describe('BracketView', () => {
  const mockTournament: Tournament = {
    id: 'tournament-1',
    fplLeagueId: 123,
    fplLeagueName: 'Test League Tournament',
    creatorUserId: 'user-1',
    startGameweek: 16,
    currentRound: 1,
    totalRounds: 2,
    status: 'active',
    participants: [
      { fplTeamId: 1, fplTeamName: 'Team Alpha', managerName: 'John', seed: 1 },
      { fplTeamId: 2, fplTeamName: 'Team Beta', managerName: 'Jane', seed: 2 },
      { fplTeamId: 3, fplTeamName: 'Team Gamma', managerName: 'Bob', seed: 3 },
      { fplTeamId: 4, fplTeamName: 'Team Delta', managerName: 'Alice', seed: 4 },
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Semi-Finals',
        gameweek: 16,
        matches: [
          { id: 'r1-m1', player1: { fplTeamId: 1, seed: 1, score: null }, player2: { fplTeamId: 4, seed: 4, score: null }, winnerId: null, isBye: false },
          { id: 'r1-m2', player1: { fplTeamId: 2, seed: 2, score: null }, player2: { fplTeamId: 3, seed: 3, score: null }, winnerId: null, isBye: false },
        ],
        isComplete: false,
      },
      {
        roundNumber: 2,
        name: 'Final',
        gameweek: 17,
        matches: [
          { id: 'r2-m1', player1: null, player2: null, winnerId: null, isBye: false },
        ],
        isComplete: false,
      },
    ],
    winnerId: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  it('should render without crashing', () => {
    render(<BracketView tournament={mockTournament} />);
  });

  it('should display tournament name', () => {
    render(<BracketView tournament={mockTournament} />);
    expect(screen.getByText('Test League Tournament')).toBeInTheDocument();
  });

  it('should render all rounds', () => {
    render(<BracketView tournament={mockTournament} />);
    expect(screen.getByText('Semi-Finals')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });

  it('should show tournament status', () => {
    render(<BracketView tournament={mockTournament} />);
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it('should show completed status when tournament is done', () => {
    const completedTournament = { ...mockTournament, status: 'completed' as const, winnerId: 1 };
    render(<BracketView tournament={completedTournament} />);
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });
});
