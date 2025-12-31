// src/components/tournament/BracketView.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BracketView } from './BracketView';
import type { Tournament } from '../../types/tournament';
import { Timestamp } from 'firebase/firestore';

describe('BracketView', () => {
  const mockTournament: Tournament = {
    id: 'tour-1',
    fplLeagueId: 123,
    fplLeagueName: 'Test League',
    creatorUserId: 'user-1',
    startGameweek: 20,
    currentRound: 1,
    totalRounds: 2,
    status: 'active',
    participants: [
      { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Manager A', seed: 1 },
      { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Manager B', seed: 2 },
      { fplTeamId: 3, fplTeamName: 'Team C', managerName: 'Manager C', seed: 3 },
      { fplTeamId: 4, fplTeamName: 'Team D', managerName: 'Manager D', seed: 4 },
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Semi-Finals',
        gameweek: 20,
        isComplete: false,
        matches: [
          { id: 'r1-m1', player1: { fplTeamId: 1, seed: 1, score: null }, player2: { fplTeamId: 4, seed: 4, score: null }, winnerId: null, isBye: false },
          { id: 'r1-m2', player1: { fplTeamId: 2, seed: 2, score: null }, player2: { fplTeamId: 3, seed: 3, score: null }, winnerId: null, isBye: false },
        ],
      },
      {
        roundNumber: 2,
        name: 'Final',
        gameweek: 21,
        isComplete: false,
        matches: [
          { id: 'r2-m1', player1: null, player2: null, winnerId: null, isBye: false },
        ],
      },
    ],
    winnerId: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  it('renders tournament header', () => {
    render(<BracketView tournament={mockTournament} />);

    expect(screen.getByText('Test League')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders bracket layout with all rounds', () => {
    render(<BracketView tournament={mockTournament} />);

    expect(screen.getByText('Semi-Finals')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });

  it('renders all participants in bracket and table', () => {
    render(<BracketView tournament={mockTournament} />);

    // Each team appears twice: once in bracket, once in table
    expect(screen.getAllByText('Team A')).toHaveLength(2);
    expect(screen.getAllByText('Team B')).toHaveLength(2);
    expect(screen.getAllByText('Team C')).toHaveLength(2);
    expect(screen.getAllByText('Team D')).toHaveLength(2);
  });

  it('renders participants table with seeds and seeding description', () => {
    render(<BracketView tournament={mockTournament} />);

    expect(screen.getByText('Participants')).toBeInTheDocument();
    expect(screen.getByText('Initial seeding based on GW19 league standings')).toBeInTheDocument();
    expect(screen.getByText('Manager A')).toBeInTheDocument();
    expect(screen.getByText('Manager B')).toBeInTheDocument();
  });

  it('shows completed badge when tournament finished', () => {
    const completedTournament = { ...mockTournament, status: 'completed' as const };
    render(<BracketView tournament={completedTournament} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows updating indicator when isRefreshing is true', () => {
    render(<BracketView tournament={mockTournament} isRefreshing={true} />);

    expect(screen.getByText('Updating...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner has role="status"
  });

  it('does not show updating indicator when isRefreshing is false', () => {
    render(<BracketView tournament={mockTournament} isRefreshing={false} />);

    expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
  });

  it('does not show updating indicator by default (prop not provided)', () => {
    render(<BracketView tournament={mockTournament} />);

    expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
  });
});
