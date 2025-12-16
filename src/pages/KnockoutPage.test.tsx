// src/pages/KnockoutPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { KnockoutPage } from './KnockoutPage';
import * as AuthContext from '../contexts/AuthContext';
import * as userService from '../services/user';
import * as fplService from '../services/fpl';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/user', () => ({
  getUserProfile: vi.fn(),
}));

vi.mock('../services/fpl', () => ({
  getUserMiniLeagues: vi.fn(),
  getLeagueStandings: vi.fn(),
  getCurrentGameweek: vi.fn(),
  getFPLGameweekScore: vi.fn(),
}));

describe('KnockoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: user authenticated with FPL team
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { uid: 'user123' } as any,
      loading: false,
      isAuthenticated: true,
    });

    vi.mocked(userService.getUserProfile).mockResolvedValue({
      userId: 'user123',
      fplTeamId: 158256,
      fplTeamName: "Owen's Team",
      email: 'owen@example.com',
      displayName: 'Owen',
      wins: 0,
      losses: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(fplService.getUserMiniLeagues).mockResolvedValue([
      { id: 12345, name: 'My League', entryRank: 1 },
    ]);

    // Default: Empty standings (will be overridden in specific tests)
    vi.mocked(fplService.getLeagueStandings).mockResolvedValue([]);
    vi.mocked(fplService.getCurrentGameweek).mockResolvedValue(15);

    // Default: Mock score fetching
    vi.mocked(fplService.getFPLGameweekScore).mockImplementation(async () => ({
      gameweek: 15,
      points: 60,
    }));
  });

  it('renders back link to leagues', () => {
    render(
      <MemoryRouter initialEntries={['/knockout/12345']}>
        <Routes>
          <Route path="/knockout/:leagueId" element={<KnockoutPage />} />
        </Routes>
      </MemoryRouter>
    );

    const backLink = screen.getByRole('link', { name: /back to leagues/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/leagues');
  });

  it('displays league name in uppercase', async () => {
    render(
      <MemoryRouter initialEntries={['/knockout/12345']}>
        <Routes>
          <Route path="/knockout/:leagueId" element={<KnockoutPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /MY LEAGUE/i });
      expect(heading).toBeInTheDocument();
    });
  });

  it('shows "16 REMAIN" for round 1 bracket', async () => {
    // Mock league with 16 teams
    const standings = Array.from({ length: 16 }, (_, i) => ({
      fplTeamId: 1000 + i,
      teamName: `Team ${i + 1}`,
      managerName: `Manager ${i + 1}`,
      rank: i + 1,
      totalPoints: 1000 - i * 10,
    }));

    vi.mocked(fplService.getLeagueStandings).mockResolvedValue(standings);

    render(
      <MemoryRouter initialEntries={['/knockout/12345']}>
        <Routes>
          <Route path="/knockout/:leagueId" element={<KnockoutPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const remainText = screen.getByText(/16 REMAIN/i);
      expect(remainText).toBeInTheDocument();
    });
  });

  it('fetches and displays gameweek scores', async () => {
    // Mock league with 16 teams
    const standings = Array.from({ length: 16 }, (_, i) => ({
      fplTeamId: 1000 + i,
      teamName: `Team ${i + 1}`,
      managerName: `Manager ${i + 1}`,
      rank: i + 1,
      totalPoints: 1000 - i * 10,
    }));

    vi.mocked(fplService.getLeagueStandings).mockResolvedValue(standings);

    // Mock score fetching - team 1000 gets 75, team 1015 gets 60
    vi.mocked(fplService.getFPLGameweekScore).mockImplementation(async (teamId: number) => ({
      gameweek: 15,
      points: teamId === 1000 ? 75 : teamId === 1015 ? 60 : 50,
    }));

    render(
      <MemoryRouter initialEntries={['/knockout/12345']}>
        <Routes>
          <Route path="/knockout/:leagueId" element={<KnockoutPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Team 1000 (seed 1) vs Team 1015 (seed 16) in first match
    await waitFor(() => {
      const scores = screen.getAllByText('75');
      expect(scores.length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      const scores = screen.getAllByText('60');
      expect(scores.length).toBeGreaterThan(0);
    });
  });

  it('highlights user match with "YOUR MATCH" label', async () => {
    // User's FPL team is 158256 (from mock)
    // Put user as seed 1 (rank 1)
    const standings = [
      { fplTeamId: 158256, teamName: "Owen's Team", managerName: 'Owen', rank: 1, totalPoints: 1000 },
      // Add 15 more teams to reach 16
      ...Array.from({ length: 15 }, (_, i) => ({
        fplTeamId: 1000 + i,
        teamName: `Team ${i + 2}`,
        managerName: `Manager ${i + 2}`,
        rank: i + 2,
        totalPoints: 990 - i * 10,
      })),
    ];

    vi.mocked(fplService.getLeagueStandings).mockResolvedValue(standings);

    // Mock score fetching
    vi.mocked(fplService.getFPLGameweekScore).mockImplementation(async () => ({
      gameweek: 15,
      points: 70,
    }));

    render(
      <MemoryRouter initialEntries={['/knockout/12345']}>
        <Routes>
          <Route path="/knockout/:leagueId" element={<KnockoutPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const yourMatchLabel = screen.getByText(/YOUR MATCH/i);
      expect(yourMatchLabel).toBeInTheDocument();
    });
  });

  it('displays subheader with team count and gameweek', async () => {
    const standings = Array.from({ length: 16 }, (_, i) => ({
      fplTeamId: 1000 + i,
      teamName: `Team ${i + 1}`,
      managerName: `Manager ${i + 1}`,
      rank: i + 1,
      totalPoints: 1000 - i * 10,
    }));

    vi.mocked(fplService.getLeagueStandings).mockResolvedValue(standings);
    vi.mocked(fplService.getCurrentGameweek).mockResolvedValue(15);

    // Mock score fetching
    vi.mocked(fplService.getFPLGameweekScore).mockImplementation(async () => ({
      gameweek: 15,
      points: 70,
    }));

    render(
      <MemoryRouter initialEntries={['/knockout/12345']}>
        <Routes>
          <Route path="/knockout/:leagueId" element={<KnockoutPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const subheader = screen.getByText(/16 teams.*GW15 scores/i);
      expect(subheader).toBeInTheDocument();
    });
  });
});
