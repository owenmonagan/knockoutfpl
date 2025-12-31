// src/components/tournament/BracketRound.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BracketRound } from './BracketRound';
import type { Round, Participant } from '../../types/tournament';

describe('BracketRound', () => {
  const mockParticipants: Participant[] = [
    { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Manager A', seed: 1 },
    { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Manager B', seed: 2 },
  ];

  const mockRound: Round = {
    roundNumber: 1,
    name: 'Final',
    gameweek: 20,
    isComplete: false,
    matches: [
      { id: 'r1-m1', player1: { fplTeamId: 1, seed: 1, score: null }, player2: { fplTeamId: 2, seed: 2, score: null }, winnerId: null, isBye: false },
    ],
  };

  it('renders round name as header', () => {
    render(<BracketRound round={mockRound} participants={mockParticipants} currentGameweek={20} />);

    expect(screen.getByRole('heading', { name: 'Final' })).toBeInTheDocument();
  });

  it('renders gameweek info', () => {
    render(<BracketRound round={mockRound} participants={mockParticipants} currentGameweek={20} />);

    expect(screen.getByText('GW 20')).toBeInTheDocument();
  });

  it('renders all matches in the round', () => {
    render(<BracketRound round={mockRound} participants={mockParticipants} currentGameweek={20} />);

    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
  });

  it('shows complete badge when round is complete', () => {
    const completeRound = { ...mockRound, isComplete: true };
    render(<BracketRound round={completeRound} participants={mockParticipants} currentGameweek={20} />);

    expect(screen.getByText('Complete')).toBeInTheDocument();
  });
});
