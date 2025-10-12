import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompareTeams } from './CompareTeams';
import * as fplService from '../services/fpl';

describe('CompareTeams', () => {
  it('should render input form with team IDs and gameweek', () => {
    render(<CompareTeams />);

    expect(screen.getByLabelText(/team 1 id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/team 2 id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gameweek/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compare teams/i })).toBeInTheDocument();
  });

  it('should display comparison results when form is submitted', async () => {
    const user = userEvent.setup();

    vi.spyOn(fplService, 'getFPLTeamInfo')
      .mockResolvedValueOnce({ teamId: 158256, teamName: "Owen's XI", managerName: 'Owen Test' })
      .mockResolvedValueOnce({ teamId: 71631, teamName: "Rival Team", managerName: 'Rival Manager' });

    vi.spyOn(fplService, 'getFPLGameweekScore')
      .mockResolvedValueOnce({ gameweek: 7, points: 78 })
      .mockResolvedValueOnce({ gameweek: 7, points: 76 });

    render(<CompareTeams />);

    await user.type(screen.getByLabelText(/team 1 id/i), '158256');
    await user.type(screen.getByLabelText(/team 2 id/i), '71631');
    await user.type(screen.getByLabelText(/gameweek/i), '7');
    await user.click(screen.getByRole('button', { name: /compare teams/i }));

    await waitFor(() => {
      expect(screen.getByText(/Owen's XI/i)).toBeInTheDocument();
      expect(screen.getByText('78')).toBeInTheDocument();
      expect(screen.getByText(/Rival Team/i)).toBeInTheDocument();
      expect(screen.getByText('76')).toBeInTheDocument();
    });
  });

  it('should highlight the winner', async () => {
    const user = userEvent.setup();

    vi.spyOn(fplService, 'getFPLTeamInfo')
      .mockResolvedValueOnce({ teamId: 158256, teamName: "Owen's XI", managerName: 'Owen Test' })
      .mockResolvedValueOnce({ teamId: 71631, teamName: "Rival Team", managerName: 'Rival Manager' });

    vi.spyOn(fplService, 'getFPLGameweekScore')
      .mockResolvedValueOnce({ gameweek: 7, points: 78 })
      .mockResolvedValueOnce({ gameweek: 7, points: 76 });

    render(<CompareTeams />);

    await user.type(screen.getByLabelText(/team 1 id/i), '158256');
    await user.type(screen.getByLabelText(/team 2 id/i), '71631');
    await user.type(screen.getByLabelText(/gameweek/i), '7');
    await user.click(screen.getByRole('button', { name: /compare teams/i }));

    await waitFor(() => {
      const winnerBadges = screen.getAllByText(/Winner/i);
      expect(winnerBadges.length).toBe(1);
    });
  });

  it('should show loading state while fetching data', async () => {
    const user = userEvent.setup();

    let resolveTeamInfo: any;
    const teamInfoPromise = new Promise((resolve) => {
      resolveTeamInfo = resolve;
    });

    vi.spyOn(fplService, 'getFPLTeamInfo').mockReturnValue(teamInfoPromise as any);
    vi.spyOn(fplService, 'getFPLGameweekScore').mockResolvedValue({ gameweek: 7, points: 78 });

    render(<CompareTeams />);

    await user.type(screen.getByLabelText(/team 1 id/i), '158256');
    await user.type(screen.getByLabelText(/team 2 id/i), '71631');
    await user.type(screen.getByLabelText(/gameweek/i), '7');
    await user.click(screen.getByRole('button', { name: /compare teams/i }));

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    resolveTeamInfo({ teamId: 158256, teamName: "Owen's XI", managerName: 'Owen Test' });
  });

  it('should populate form with example data when example button is clicked', async () => {
    const user = userEvent.setup();

    render(<CompareTeams />);

    await user.click(screen.getByRole('button', { name: /try example/i }));

    expect(screen.getByLabelText(/team 1 id/i)).toHaveValue(158256);
    expect(screen.getByLabelText(/team 2 id/i)).toHaveValue(71631);
    expect(screen.getByLabelText(/gameweek/i)).toHaveValue(7);
  });
});
