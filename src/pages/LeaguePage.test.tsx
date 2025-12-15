// src/pages/LeaguePage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LeaguePage } from './LeaguePage';
import { AuthContext } from '../contexts/AuthContext';
import type { User as FirebaseUser } from 'firebase/auth';
import * as fplService from '../services/fpl';
import * as tournamentService from '../services/tournament';

// Mock services
vi.mock('../services/fpl', () => ({
  getLeagueStandings: vi.fn(),
  getCurrentGameweek: vi.fn(),
}));

vi.mock('../services/tournament', () => ({
  getTournamentByLeague: vi.fn(),
  createTournament: vi.fn(),
}));

const mockUser = { uid: 'user-123', email: 'test@example.com' } as FirebaseUser;

const mockAuthContext = {
  user: mockUser,
  loading: false,
  isAuthenticated: true,
};

const renderLeaguePage = (leagueId: string = '123') => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <MemoryRouter initialEntries={[`/league/${leagueId}`]}>
        <Routes>
          <Route path="/league/:leagueId" element={<LeaguePage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('LeaguePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(tournamentService.getTournamentByLeague).mockImplementation(() => new Promise(() => {}));

    renderLeaguePage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should show CreateTournamentButton when no tournament exists', async () => {
    vi.mocked(tournamentService.getTournamentByLeague).mockResolvedValue(null);

    renderLeaguePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument();
    });
  });

  it('should show BracketView when tournament exists', async () => {
    vi.mocked(tournamentService.getTournamentByLeague).mockResolvedValue({
      id: 'tournament-1',
      fplLeagueId: 123,
      fplLeagueName: 'Test League',
      status: 'active',
      participants: [],
      rounds: [],
      startGameweek: 16,
      totalRounds: 2,
    } as any);

    renderLeaguePage();

    await waitFor(() => {
      expect(screen.getByText('Test League')).toBeInTheDocument();
    });
  });
});
