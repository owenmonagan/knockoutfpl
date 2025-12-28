// src/components/tournament/BracketMatchCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BracketMatchCard } from './BracketMatchCard';
import type { Match, Participant } from '../../types/tournament';

describe('BracketMatchCard', () => {
  const mockParticipants: Participant[] = [
    { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Manager A', seed: 1 },
    { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Manager B', seed: 2 },
  ];

  const mockMatch: Match = {
    id: 'r1-m1',
    player1: { fplTeamId: 1, seed: 1, score: 65 },
    player2: { fplTeamId: 2, seed: 2, score: 58 },
    winnerId: 1,
    isBye: false,
  };

  it('renders both player names', () => {
    render(<BracketMatchCard match={mockMatch} participants={mockParticipants} />);

    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
  });

  it('renders seeds', () => {
    render(<BracketMatchCard match={mockMatch} participants={mockParticipants} />);

    expect(screen.getByText('(1)')).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('renders scores when available', () => {
    render(<BracketMatchCard match={mockMatch} participants={mockParticipants} />);

    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText('58')).toBeInTheDocument();
  });

  it('highlights winner', () => {
    render(<BracketMatchCard match={mockMatch} participants={mockParticipants} />);

    const winnerRow = screen.getByText('Team A').closest('[data-winner]');
    expect(winnerRow).toHaveAttribute('data-winner', 'true');
  });

  it('shows BYE for bye matches', () => {
    const byeMatch: Match = {
      id: 'r1-m1',
      player1: { fplTeamId: 1, seed: 1, score: null },
      player2: null,
      winnerId: 1,
      isBye: true,
    };
    render(<BracketMatchCard match={byeMatch} participants={mockParticipants} />);

    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('BYE')).toBeInTheDocument();
  });

  it('shows TBD for empty slots', () => {
    const emptyMatch: Match = {
      id: 'r2-m1',
      player1: null,
      player2: null,
      winnerId: null,
      isBye: false,
    };
    render(<BracketMatchCard match={emptyMatch} participants={mockParticipants} />);

    expect(screen.getAllByText('TBD')).toHaveLength(2);
  });
});
