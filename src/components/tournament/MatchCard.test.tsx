// src/components/tournament/MatchCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchCard } from './MatchCard';
import type { Match } from '../../types/tournament';

describe('MatchCard', () => {
  const mockMatch: Match = {
    id: 'r1-m1',
    player1: { fplTeamId: 1, seed: 1, score: null },
    player2: { fplTeamId: 2, seed: 4, score: null },
    winnerId: null,
    isBye: false,
  };

  const mockParticipants = [
    { fplTeamId: 1, fplTeamName: 'Team Alpha', managerName: 'John', seed: 1 },
    { fplTeamId: 2, fplTeamName: 'Team Beta', managerName: 'Jane', seed: 4 },
  ];

  it('should render without crashing', () => {
    render(<MatchCard match={mockMatch} participants={mockParticipants} gameweek={16} />);
  });

  it('should display player 1 team name', () => {
    render(<MatchCard match={mockMatch} participants={mockParticipants} gameweek={16} />);
    expect(screen.getByText('Team Alpha')).toBeInTheDocument();
  });

  it('should display player 2 team name', () => {
    render(<MatchCard match={mockMatch} participants={mockParticipants} gameweek={16} />);
    expect(screen.getByText('Team Beta')).toBeInTheDocument();
  });

  it('should show seed numbers', () => {
    render(<MatchCard match={mockMatch} participants={mockParticipants} gameweek={16} />);
    expect(screen.getByText(/\(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(4\)/)).toBeInTheDocument();
  });

  it('should show BYE when player 2 is null', () => {
    const byeMatch: Match = {
      ...mockMatch,
      player2: null,
      isBye: true,
      winnerId: 1,
    };
    render(<MatchCard match={byeMatch} participants={mockParticipants} gameweek={16} />);
    expect(screen.getByText('BYE')).toBeInTheDocument();
  });

  it('should display scores when available', () => {
    const matchWithScores: Match = {
      ...mockMatch,
      player1: { fplTeamId: 1, seed: 1, score: 65 },
      player2: { fplTeamId: 2, seed: 4, score: 58 },
      winnerId: 1,
    };
    render(<MatchCard match={matchWithScores} participants={mockParticipants} gameweek={16} />);
    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText('58')).toBeInTheDocument();
  });

  it('should highlight winner', () => {
    const matchWithWinner: Match = {
      ...mockMatch,
      player1: { fplTeamId: 1, seed: 1, score: 65 },
      player2: { fplTeamId: 2, seed: 4, score: 58 },
      winnerId: 1,
    };
    render(<MatchCard match={matchWithWinner} participants={mockParticipants} gameweek={16} />);
    // Winner row should have special styling - check for the winner indicator
    const teamAlpha = screen.getByText('Team Alpha');
    expect(teamAlpha.closest('div')).toHaveClass('font-semibold');
  });

  it('should show gameweek badge', () => {
    render(<MatchCard match={mockMatch} participants={mockParticipants} gameweek={16} />);
    expect(screen.getByText(/GW ?16/i)).toBeInTheDocument();
  });
});
