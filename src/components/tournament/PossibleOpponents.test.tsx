import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PossibleOpponents } from './PossibleOpponents';

describe('PossibleOpponents', () => {
  const baseProps = {
    team1Name: 'KDB De Bruyne',
    team1Score: 62,
    team2Name: 'No Kane No Gain',
    team2Score: 41,
    matchType: 'live' as const,
    nextGameweek: 29,
  };

  it('renders section title', () => {
    render(<PossibleOpponents {...baseProps} />);

    expect(screen.getByText(/Possible Next Opponents/i)).toBeInTheDocument();
  });

  it('renders both team names', () => {
    render(<PossibleOpponents {...baseProps} />);

    expect(screen.getByText('KDB De Bruyne')).toBeInTheDocument();
    expect(screen.getByText('No Kane No Gain')).toBeInTheDocument();
  });

  it('renders scores for live matches', () => {
    render(<PossibleOpponents {...baseProps} matchType="live" />);

    expect(screen.getByText('62')).toBeInTheDocument();
    expect(screen.getByText('41')).toBeInTheDocument();
  });

  it('renders footer message with next gameweek', () => {
    render(<PossibleOpponents {...baseProps} />);

    expect(screen.getByText(/If you win, you'll face the winner in GW29/i)).toBeInTheDocument();
  });

  it('renders VS for upcoming matches', () => {
    render(<PossibleOpponents {...baseProps} matchType="upcoming" team1Score={null} team2Score={null} />);

    expect(screen.getByText('VS')).toBeInTheDocument();
  });
});
