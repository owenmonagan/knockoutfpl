// src/components/leagues/LeaguesTable.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeaguesTable } from './LeaguesTable';
import type { LeagueWithTournament } from './LeaguesTable';

describe('LeaguesTable', () => {
  const mockLeagues: LeagueWithTournament[] = [
    {
      id: 1,
      name: 'Man City',
      entryRank: 19249,
      memberCount: 50,
      tournament: null,
      userProgress: null,
    },
    {
      id: 2,
      name: 'USA',
      entryRank: 9564,
      memberCount: 50,
      tournament: {
        id: 'tournament-1',
        status: 'active',
        currentRound: 2,
        totalRounds: 4,
      },
      userProgress: {
        status: 'active',
        eliminationRound: null,
      },
    },
    {
      id: 3,
      name: 'Gameweek 1',
      entryRank: 272070,
      memberCount: 50,
      tournament: {
        id: 'tournament-2',
        status: 'active',
        currentRound: 3,
        totalRounds: 4,
      },
      userProgress: {
        status: 'eliminated',
        eliminationRound: 1,
      },
    },
    {
      id: 4,
      name: 'Champions League',
      entryRank: 100,
      memberCount: 32,
      tournament: {
        id: 'tournament-3',
        status: 'completed',
        currentRound: 5,
        totalRounds: 5,
      },
      userProgress: {
        status: 'winner',
        eliminationRound: null,
      },
    },
  ];

  it('should render without crashing', () => {
    render(<LeaguesTable leagues={mockLeagues} onLeagueAction={() => {}} />);
  });

  it('should display league names', () => {
    render(<LeaguesTable leagues={mockLeagues} onLeagueAction={() => {}} />);
    // Both desktop and mobile views render, so we get duplicates
    expect(screen.getAllByText('Man City').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('USA').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Gameweek 1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Champions League').length).toBeGreaterThanOrEqual(1);
  });

  it('should display member counts', () => {
    render(<LeaguesTable leagues={mockLeagues} onLeagueAction={() => {}} />);
    // Both desktop and mobile views render, so we get duplicates
    expect(screen.getAllByText('50').length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText('32').length).toBeGreaterThanOrEqual(1);
  });

  it('should display ranks with # prefix', () => {
    render(<LeaguesTable leagues={mockLeagues} onLeagueAction={() => {}} />);
    // Desktop shows #rank, mobile shows "Rank #rank" - test desktop table cell
    expect(screen.getAllByText('#19249').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('#9564').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('#272070').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('#100').length).toBeGreaterThanOrEqual(1);
  });

  describe('button text logic', () => {
    it('should show "Create Tournament" when tournament is null', () => {
      const leagueWithoutTournament: LeagueWithTournament[] = [
        {
          id: 1,
          name: 'Test League',
          entryRank: 1,
          memberCount: 10,
          tournament: null,
          userProgress: null,
        },
      ];
      render(<LeaguesTable leagues={leagueWithoutTournament} onLeagueAction={() => {}} />);
      // Both desktop and mobile render, so we get 2 buttons
      const buttons = screen.getAllByRole('button', { name: 'Create Tournament' });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it('should show "View Tournament" when tournament exists', () => {
      const leagueWithTournament: LeagueWithTournament[] = [
        {
          id: 1,
          name: 'Test League',
          entryRank: 1,
          memberCount: 10,
          tournament: {
            id: 'tournament-1',
            status: 'active',
            currentRound: 1,
            totalRounds: 4,
          },
          userProgress: null,
        },
      ];
      render(<LeaguesTable leagues={leagueWithTournament} onLeagueAction={() => {}} />);
      // Both desktop and mobile render, so we get 2 buttons
      const buttons = screen.getAllByRole('button', { name: 'View Tournament' });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('status text logic', () => {
    it('should show dash when userProgress is null', () => {
      const league: LeagueWithTournament[] = [
        {
          id: 1,
          name: 'Test League',
          entryRank: 1,
          memberCount: 10,
          tournament: null,
          userProgress: null,
        },
      ];
      render(<LeaguesTable leagues={league} onLeagueAction={() => {}} />);
      // Both desktop and mobile render with status dash
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });

    it('should show "Winner" when userProgress.status is winner', () => {
      const league: LeagueWithTournament[] = [
        {
          id: 1,
          name: 'Test League',
          entryRank: 1,
          memberCount: 10,
          tournament: {
            id: 'tournament-1',
            status: 'completed',
            currentRound: 4,
            totalRounds: 4,
          },
          userProgress: {
            status: 'winner',
            eliminationRound: null,
          },
        },
      ];
      render(<LeaguesTable leagues={league} onLeagueAction={() => {}} />);
      // Both desktop and mobile render
      expect(screen.getAllByText('Winner').length).toBeGreaterThanOrEqual(1);
    });

    it('should show "Eliminated R{n}" when userProgress.status is eliminated', () => {
      const league: LeagueWithTournament[] = [
        {
          id: 1,
          name: 'Test League',
          entryRank: 1,
          memberCount: 10,
          tournament: {
            id: 'tournament-1',
            status: 'active',
            currentRound: 3,
            totalRounds: 4,
          },
          userProgress: {
            status: 'eliminated',
            eliminationRound: 2,
          },
        },
      ];
      render(<LeaguesTable leagues={league} onLeagueAction={() => {}} />);
      // Both desktop and mobile render
      expect(screen.getAllByText('Eliminated R2').length).toBeGreaterThanOrEqual(1);
    });

    it('should show "Round {n} of {total}" when userProgress.status is active', () => {
      const league: LeagueWithTournament[] = [
        {
          id: 1,
          name: 'Test League',
          entryRank: 1,
          memberCount: 10,
          tournament: {
            id: 'tournament-1',
            status: 'active',
            currentRound: 2,
            totalRounds: 4,
          },
          userProgress: {
            status: 'active',
            eliminationRound: null,
          },
        },
      ];
      render(<LeaguesTable leagues={league} onLeagueAction={() => {}} />);
      // Both desktop and mobile render
      expect(screen.getAllByText('Round 2 of 4').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('click handling', () => {
    it('should call onLeagueAction with the correct league when button is clicked', () => {
      const handleAction = vi.fn();
      const singleLeague: LeagueWithTournament[] = [mockLeagues[0]];
      render(<LeaguesTable leagues={singleLeague} onLeagueAction={handleAction} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);

      expect(handleAction).toHaveBeenCalledTimes(1);
      expect(handleAction).toHaveBeenCalledWith(singleLeague[0]);
    });

    it('should call onLeagueAction when clicking a View Tournament button', () => {
      const handleAction = vi.fn();
      const leagueWithTournament: LeagueWithTournament[] = [mockLeagues[1]]; // USA - has tournament
      render(<LeaguesTable leagues={leagueWithTournament} onLeagueAction={handleAction} />);

      const buttons = screen.getAllByRole('button', { name: 'View Tournament' });
      fireEvent.click(buttons[0]);

      expect(handleAction).toHaveBeenCalledTimes(1);
      expect(handleAction).toHaveBeenCalledWith(leagueWithTournament[0]);
    });
  });

  describe('sorting', () => {
    it('should sort leagues by priority: active > winner > eliminated > no participation > no tournament', () => {
      const handleAction = vi.fn();
      render(<LeaguesTable leagues={mockLeagues} onLeagueAction={handleAction} />);

      // Get all league names in order (desktop table has them in order)
      const rows = screen.getAllByRole('row');
      // Skip header row, get cell content
      const leagueNames = rows.slice(1).map(row => {
        const cells = row.querySelectorAll('td');
        return cells[0]?.textContent;
      }).filter(Boolean);

      // Expected order after sorting:
      // 1. USA (active) - priority 1
      // 2. Champions League (winner) - priority 2
      // 3. Gameweek 1 (eliminated) - priority 3
      // 4. Man City (no tournament) - priority 5
      expect(leagueNames).toEqual(['USA', 'Champions League', 'Gameweek 1', 'Man City']);
    });

    it('should sort alphabetically within same priority', () => {
      const handleAction = vi.fn();
      const leaguesWithSamePriority: LeagueWithTournament[] = [
        {
          id: 1,
          name: 'Zebra League',
          entryRank: 1,
          memberCount: 10,
          tournament: null,
          userProgress: null,
        },
        {
          id: 2,
          name: 'Alpha League',
          entryRank: 2,
          memberCount: 10,
          tournament: null,
          userProgress: null,
        },
        {
          id: 3,
          name: 'Beta League',
          entryRank: 3,
          memberCount: 10,
          tournament: null,
          userProgress: null,
        },
      ];
      render(<LeaguesTable leagues={leaguesWithSamePriority} onLeagueAction={handleAction} />);

      const rows = screen.getAllByRole('row');
      const leagueNames = rows.slice(1).map(row => {
        const cells = row.querySelectorAll('td');
        return cells[0]?.textContent;
      }).filter(Boolean);

      expect(leagueNames).toEqual(['Alpha League', 'Beta League', 'Zebra League']);
    });
  });

  describe('loading state', () => {
    it('should show loading skeleton when isLoading is true', () => {
      render(<LeaguesTable leagues={[]} onLeagueAction={() => {}} isLoading={true} />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should not show loading skeleton when isLoading is false', () => {
      render(<LeaguesTable leagues={mockLeagues} onLeagueAction={() => {}} isLoading={false} />);
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show empty message when leagues array is empty', () => {
      render(<LeaguesTable leagues={[]} onLeagueAction={() => {}} isLoading={false} />);
      expect(screen.getByText(/no leagues/i)).toBeInTheDocument();
    });
  });

  describe('responsive layout', () => {
    it('should render table headers', () => {
      render(<LeaguesTable leagues={mockLeagues} onLeagueAction={() => {}} />);
      expect(screen.getByText('League')).toBeInTheDocument();
      // Members, Your Rank may be hidden on mobile, but should exist in DOM
      expect(screen.getByText('Members')).toBeInTheDocument();
      expect(screen.getByText('Your Rank')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });
});
