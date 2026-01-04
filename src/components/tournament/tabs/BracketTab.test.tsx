import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { getVisibleRounds, EarlierRoundsPrompt, BracketTab } from './BracketTab';
import type { Round, Tournament } from '@/types/tournament';

// Helper to create mock rounds
function createMockRounds(count: number): Round[] {
  return Array.from({ length: count }, (_, i) => ({
    roundNumber: i + 1,
    name: `Round ${i + 1}`,
    gameweek: 20 + i,
    matches: [],
    isComplete: false,
  }));
}

describe('getVisibleRounds', () => {
  it('returns all rounds when 5 or fewer', () => {
    const rounds = createMockRounds(3);
    const result = getVisibleRounds(rounds);

    expect(result.visibleRounds).toHaveLength(3);
    expect(result.hiddenCount).toBe(0);
  });

  it('returns last 5 rounds when more than 5', () => {
    const rounds = createMockRounds(10);
    const result = getVisibleRounds(rounds);

    expect(result.visibleRounds).toHaveLength(5);
    expect(result.visibleRounds[0].roundNumber).toBe(6);
    expect(result.visibleRounds[4].roundNumber).toBe(10);
    expect(result.hiddenCount).toBe(5);
  });

  it('returns exactly 5 rounds when exactly 5', () => {
    const rounds = createMockRounds(5);
    const result = getVisibleRounds(rounds);

    expect(result.visibleRounds).toHaveLength(5);
    expect(result.hiddenCount).toBe(0);
  });

  it('handles 15 rounds (large tournament)', () => {
    const rounds = createMockRounds(15);
    const result = getVisibleRounds(rounds);

    expect(result.visibleRounds).toHaveLength(5);
    expect(result.visibleRounds[0].roundNumber).toBe(11);
    expect(result.hiddenCount).toBe(10);
  });

  it('handles empty rounds array', () => {
    const result = getVisibleRounds([]);
    expect(result.visibleRounds).toHaveLength(0);
    expect(result.hiddenCount).toBe(0);
  });
});

describe('EarlierRoundsPrompt', () => {
  it('renders correct singular text for 1 hidden round', () => {
    const onViewMatches = vi.fn();
    render(<EarlierRoundsPrompt hiddenCount={1} onViewMatches={onViewMatches} />);

    expect(screen.getByText(/1 earlier round available/)).toBeInTheDocument();
  });

  it('renders correct plural text for multiple hidden rounds', () => {
    const onViewMatches = vi.fn();
    render(<EarlierRoundsPrompt hiddenCount={10} onViewMatches={onViewMatches} />);

    expect(screen.getByText(/10 earlier rounds available/)).toBeInTheDocument();
  });

  it('calls onViewMatches when button clicked', async () => {
    const onViewMatches = vi.fn();
    const user = userEvent.setup();
    render(<EarlierRoundsPrompt hiddenCount={5} onViewMatches={onViewMatches} />);

    await user.click(screen.getByRole('button', { name: /View Matches/i }));

    expect(onViewMatches).toHaveBeenCalledTimes(1);
  });
});

// Helper to create a tournament with N rounds
function createTournamentWithRounds(roundCount: number): Tournament {
  return {
    id: 'test-tournament',
    fplLeagueId: 123,
    fplLeagueName: 'Test League',
    creatorUserId: 'user1',
    startGameweek: 20,
    currentRound: 1,
    currentGameweek: 20,
    totalRounds: roundCount,
    status: 'active',
    participants: [],
    rounds: createMockRounds(roundCount),
    winnerId: null,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };
}

describe('BracketTab integration', () => {
  it('shows all rounds when 5 or fewer', () => {
    const tournament = createTournamentWithRounds(3);

    render(
      <MemoryRouter>
        <BracketTab tournament={tournament} />
      </MemoryRouter>
    );

    expect(screen.queryByText(/earlier rounds/i)).not.toBeInTheDocument();
  });

  it('shows prompt and only last 5 rounds when more than 5', () => {
    const tournament = createTournamentWithRounds(10);

    render(
      <MemoryRouter>
        <BracketTab tournament={tournament} />
      </MemoryRouter>
    );

    expect(screen.getByText(/5 earlier rounds available/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Matches/i })).toBeInTheDocument();
  });
});
