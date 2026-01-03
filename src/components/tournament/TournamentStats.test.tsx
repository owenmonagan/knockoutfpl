import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TournamentStats } from './TournamentStats';

describe('TournamentStats', () => {
  const baseProps = {
    totalParticipants: 48204,
    remainingParticipants: 3012,
    currentRound: 5,
    totalRounds: 16,
    currentRoundName: 'Quarter-Finals',
    currentGameweek: 28,
    userSeed: 142,
    userStatus: 'in' as const,
  };

  it('renders teams remaining with progress', () => {
    render(<TournamentStats {...baseProps} />);

    expect(screen.getByText(/3,012/)).toBeInTheDocument();
    expect(screen.getByText(/48,204/)).toBeInTheDocument();
  });

  it('renders current round info', () => {
    render(<TournamentStats {...baseProps} />);

    expect(screen.getByText('Quarter-Finals')).toBeInTheDocument();
    expect(screen.getByText(/GW ?28/i)).toBeInTheDocument();
    expect(screen.getByText(/11 rounds remaining/i)).toBeInTheDocument();
  });

  it('renders user seed', () => {
    render(<TournamentStats {...baseProps} />);

    expect(screen.getByText('#142')).toBeInTheDocument();
  });

  it('renders active status for users still in', () => {
    render(<TournamentStats {...baseProps} userStatus="in" />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders eliminated status with round', () => {
    render(
      <TournamentStats {...baseProps} userStatus="eliminated" eliminatedRound={4} />
    );

    expect(screen.getByText(/Eliminated/)).toBeInTheDocument();
    expect(screen.getByText(/R4/)).toBeInTheDocument();
  });

  it('renders winner status', () => {
    render(<TournamentStats {...baseProps} userStatus="winner" />);

    expect(screen.getByText('Champion')).toBeInTheDocument();
  });
});
