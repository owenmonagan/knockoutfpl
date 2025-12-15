// src/components/tournament/RoundSection.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoundSection } from './RoundSection';
import type { Round, Participant } from '../../types/tournament';

describe('RoundSection', () => {
  const mockParticipants: Participant[] = [
    { fplTeamId: 1, fplTeamName: 'Team Alpha', managerName: 'John', seed: 1 },
    { fplTeamId: 2, fplTeamName: 'Team Beta', managerName: 'Jane', seed: 2 },
    { fplTeamId: 3, fplTeamName: 'Team Gamma', managerName: 'Bob', seed: 3 },
    { fplTeamId: 4, fplTeamName: 'Team Delta', managerName: 'Alice', seed: 4 },
  ];

  const mockRound: Round = {
    roundNumber: 1,
    name: 'Semi-Finals',
    gameweek: 16,
    matches: [
      {
        id: 'r1-m1',
        player1: { fplTeamId: 1, seed: 1, score: null },
        player2: { fplTeamId: 4, seed: 4, score: null },
        winnerId: null,
        isBye: false,
      },
      {
        id: 'r1-m2',
        player1: { fplTeamId: 2, seed: 2, score: null },
        player2: { fplTeamId: 3, seed: 3, score: null },
        winnerId: null,
        isBye: false,
      },
    ],
    isComplete: false,
  };

  it('should render without crashing', () => {
    render(<RoundSection round={mockRound} participants={mockParticipants} />);
  });

  it('should display round name as header', () => {
    render(<RoundSection round={mockRound} participants={mockParticipants} />);
    expect(screen.getByText('Semi-Finals')).toBeInTheDocument();
  });

  it('should display gameweek number', () => {
    render(<RoundSection round={mockRound} participants={mockParticipants} />);
    expect(screen.getByText(/gameweek 16/i)).toBeInTheDocument();
  });

  it('should render all matches', () => {
    render(<RoundSection round={mockRound} participants={mockParticipants} />);
    expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    expect(screen.getByText('Team Beta')).toBeInTheDocument();
    expect(screen.getByText('Team Gamma')).toBeInTheDocument();
    expect(screen.getByText('Team Delta')).toBeInTheDocument();
  });

  it('should show complete badge when round is complete', () => {
    const completedRound = { ...mockRound, isComplete: true };
    render(<RoundSection round={completedRound} participants={mockParticipants} />);
    expect(screen.getByText(/complete/i)).toBeInTheDocument();
  });
});
