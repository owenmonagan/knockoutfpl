// src/components/tournament/BracketLayout.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BracketLayout } from './BracketLayout';
import type { Round, Participant } from '../../types/tournament';

describe('BracketLayout', () => {
  const mockParticipants: Participant[] = [
    { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Manager A', seed: 1 },
    { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Manager B', seed: 2 },
    { fplTeamId: 3, fplTeamName: 'Team C', managerName: 'Manager C', seed: 3 },
    { fplTeamId: 4, fplTeamName: 'Team D', managerName: 'Manager D', seed: 4 },
  ];

  const mockRounds: Round[] = [
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
  ];

  it('renders all rounds as columns', () => {
    render(<BracketLayout rounds={mockRounds} participants={mockParticipants} />);

    expect(screen.getByText('Semi-Finals')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });

  it('renders matches within each round', () => {
    render(<BracketLayout rounds={mockRounds} participants={mockParticipants} />);

    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
    expect(screen.getByText('Team C')).toBeInTheDocument();
    expect(screen.getByText('Team D')).toBeInTheDocument();
  });

  it('has horizontal layout on desktop', () => {
    render(<BracketLayout rounds={mockRounds} participants={mockParticipants} />);

    const container = screen.getByTestId('bracket-layout');
    expect(container).toHaveClass('md:flex-row');
  });

  it('stacks vertically on mobile', () => {
    render(<BracketLayout rounds={mockRounds} participants={mockParticipants} />);

    const container = screen.getByTestId('bracket-layout');
    // Default (mobile) should be vertical, md: becomes horizontal
    expect(container).toHaveClass('flex-col');
    expect(container).toHaveClass('md:flex-row');
  });
});
