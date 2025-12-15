// src/components/leagues/LeagueCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeagueCard } from './LeagueCard';

describe('LeagueCard', () => {
  const mockLeague = {
    id: 123,
    name: 'Test League',
    entryRank: 5,
  };

  it('should render without crashing', () => {
    render(<LeagueCard league={mockLeague} onClick={() => {}} />);
  });

  it('should display league name', () => {
    render(<LeagueCard league={mockLeague} onClick={() => {}} />);
    expect(screen.getByText('Test League')).toBeInTheDocument();
  });

  it('should display rank', () => {
    render(<LeagueCard league={mockLeague} onClick={() => {}} />);
    expect(screen.getByText(/rank #5/i)).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<LeagueCard league={mockLeague} onClick={handleClick} />);

    const card = screen.getByRole('article');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should show tournament badge when hasTournament is true', () => {
    render(<LeagueCard league={mockLeague} onClick={() => {}} hasTournament={true} tournamentStatus="active" />);
    expect(screen.getByText(/tournament active/i)).toBeInTheDocument();
  });

  it('should show completed badge when tournament is completed', () => {
    render(<LeagueCard league={mockLeague} onClick={() => {}} hasTournament={true} tournamentStatus="completed" />);
    expect(screen.getByText(/tournament complete/i)).toBeInTheDocument();
  });
});
