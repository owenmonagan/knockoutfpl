// src/components/leagues/LeagueList.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeagueList } from './LeagueList';
import type { FPLMiniLeague } from '../../services/fpl';

describe('LeagueList', () => {
  const mockLeagues: FPLMiniLeague[] = [
    { id: 1, name: 'League One', entryRank: 3 },
    { id: 2, name: 'League Two', entryRank: 7 },
  ];

  it('should render without crashing', () => {
    render(<LeagueList leagues={mockLeagues} onLeagueClick={() => {}} isLoading={false} />);
  });

  it('should show loading state when isLoading is true', () => {
    render(<LeagueList leagues={[]} onLeagueClick={() => {}} isLoading={true} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should show empty state when no leagues', () => {
    render(<LeagueList leagues={[]} onLeagueClick={() => {}} isLoading={false} />);
    expect(screen.getByText(/no leagues found/i)).toBeInTheDocument();
  });

  it('should render list of league cards', () => {
    render(<LeagueList leagues={mockLeagues} onLeagueClick={() => {}} isLoading={false} />);
    expect(screen.getByText('League One')).toBeInTheDocument();
    expect(screen.getByText('League Two')).toBeInTheDocument();
  });

  it('should call onLeagueClick with league id when card is clicked', () => {
    const handleClick = vi.fn();
    render(<LeagueList leagues={mockLeagues} onLeagueClick={handleClick} isLoading={false} />);

    const cards = screen.getAllByRole('article');
    cards[0].click();

    expect(handleClick).toHaveBeenCalledWith(1);
  });
});
