import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { YourMatchupCard } from './YourMatchupCard';

describe('YourMatchupCard', () => {
  const baseProps = {
    roundName: 'Quarter-Finals',
    gameweek: 24,
    yourTeamName: 'O-win FC',
    yourManagerName: 'Owen',
    yourSeed: 142,
    yourScore: null,
    opponentTeamName: 'Klopps & Robbers',
    opponentManagerName: 'Sarah',
    opponentSeed: 4005,
    opponentScore: null,
    matchType: 'upcoming' as const,
  };

  it('renders round name and gameweek', () => {
    render(<YourMatchupCard {...baseProps} />);

    expect(screen.getByText('Quarter-Finals')).toBeInTheDocument();
    expect(screen.getByText(/GW ?24/i)).toBeInTheDocument();
  });

  it('renders your team info with seed', () => {
    render(<YourMatchupCard {...baseProps} />);

    expect(screen.getByText('O-win FC')).toBeInTheDocument();
    expect(screen.getByText(/Seed #142/)).toBeInTheDocument();
  });

  it('renders opponent team info with seed', () => {
    render(<YourMatchupCard {...baseProps} />);

    expect(screen.getByText('Klopps & Robbers')).toBeInTheDocument();
    expect(screen.getByText(/Seed #4,?005/)).toBeInTheDocument();
  });

  it('shows VS for upcoming matches', () => {
    render(<YourMatchupCard {...baseProps} matchType="upcoming" />);

    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('shows scores for live matches', () => {
    render(
      <YourMatchupCard
        {...baseProps}
        matchType="live"
        yourScore={72}
        opponentScore={65}
      />
    );

    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument();
  });

  it('shows Live badge for live matches', () => {
    render(<YourMatchupCard {...baseProps} matchType="live" yourScore={72} opponentScore={65} />);

    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('shows result badge for finished matches', () => {
    render(
      <YourMatchupCard
        {...baseProps}
        matchType="finished"
        yourScore={72}
        opponentScore={65}
        result="won"
      />
    );

    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });
});
