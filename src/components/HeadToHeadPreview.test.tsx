import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeadToHeadPreview } from './HeadToHeadPreview';
import * as fplService from '../services/fpl';
import * as teamStats from '../lib/teamStats';

vi.mock('../services/fpl');
vi.mock('../lib/teamStats', async () => {
  const actual = await vi.importActual<typeof import('../lib/teamStats')>('../lib/teamStats');
  return {
    ...actual,
    calculateAveragePoints: vi.fn(),
    calculateForm: vi.fn(),
    // Keep the real calculateAdvantage since it's pure
  };
});

describe('HeadToHeadPreview', () => {
  it('renders both team names', async () => {
    vi.mocked(fplService.getFPLTeamInfo).mockResolvedValue({
      teamId: 123,
      teamName: 'Test Team',
      managerName: 'Manager',
      overallRank: 1000,
      overallPoints: 500,
    });
    vi.mocked(teamStats.calculateAveragePoints).mockResolvedValue(70);
    vi.mocked(teamStats.calculateForm).mockResolvedValue('W-W-W-L-W');

    render(<HeadToHeadPreview creatorFplId={123} creatorName="Monzaga" opponentFplId={456} opponentName="Eyad fc" gameweek={10} />);

    expect(await screen.findByText(/Monzaga/i)).toBeInTheDocument();
    expect(await screen.findByText(/Eyad fc/i)).toBeInTheDocument();
  });

  it('shows VS layout between teams', async () => {
    vi.mocked(fplService.getFPLTeamInfo).mockResolvedValue({
      teamId: 123,
      teamName: 'Test Team',
      managerName: 'Manager',
      overallRank: 1000,
      overallPoints: 500,
    });
    vi.mocked(teamStats.calculateAveragePoints).mockResolvedValue(70);
    vi.mocked(teamStats.calculateForm).mockResolvedValue('W-W-W-L-W');

    render(<HeadToHeadPreview creatorFplId={123} creatorName="Monzaga" opponentFplId={456} opponentName="Eyad fc" gameweek={10} />);

    expect(await screen.findByText(/VS/i)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    vi.mocked(fplService.getFPLTeamInfo).mockImplementation(() => new Promise(() => {}));
    vi.mocked(teamStats.calculateAveragePoints).mockImplementation(() => new Promise(() => {}));
    vi.mocked(teamStats.calculateForm).mockImplementation(() => new Promise(() => {}));

    render(<HeadToHeadPreview creatorFplId={123} creatorName="Monzaga" opponentFplId={456} opponentName="Eyad fc" gameweek={10} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays creator rank after loading', async () => {
    vi.mocked(fplService.getFPLTeamInfo)
      .mockResolvedValueOnce({
        teamId: 123,
        teamName: 'Test Team',
        managerName: 'Manager',
        overallRank: 15000,
        overallPoints: 500,
      })
      .mockResolvedValueOnce({
        teamId: 456,
        teamName: 'Opponent Team',
        managerName: 'Opponent',
        overallRank: 25000,
        overallPoints: 400,
      });
    vi.mocked(teamStats.calculateAveragePoints).mockResolvedValue(70);
    vi.mocked(teamStats.calculateForm).mockResolvedValue('W-W-W-L-W');

    render(<HeadToHeadPreview creatorFplId={123} creatorName="Monzaga" opponentFplId={456} opponentName="Eyad fc" gameweek={10} />);

    expect(await screen.findByText(/15,000/i)).toBeInTheDocument();
  });

  it('displays opponent rank after loading', async () => {
    vi.mocked(fplService.getFPLTeamInfo)
      .mockResolvedValueOnce({
        teamId: 123,
        teamName: 'Creator Team',
        managerName: 'Creator',
        overallRank: 15000,
        overallPoints: 500,
      })
      .mockResolvedValueOnce({
        teamId: 456,
        teamName: 'Opponent Team',
        managerName: 'Opponent',
        overallRank: 25000,
        overallPoints: 400,
      });
    vi.mocked(teamStats.calculateAveragePoints).mockResolvedValue(70);
    vi.mocked(teamStats.calculateForm).mockResolvedValue('W-W-W-L-W');

    render(<HeadToHeadPreview creatorFplId={123} creatorName="Monzaga" opponentFplId={456} opponentName="Eyad fc" gameweek={10} />);

    expect(await screen.findByText(/25,000/i)).toBeInTheDocument();
  });

  it('displays overall points for both teams', async () => {
    vi.mocked(fplService.getFPLTeamInfo)
      .mockResolvedValueOnce({
        teamId: 123,
        teamName: 'Creator Team',
        managerName: 'Creator',
        overallRank: 15000,
        overallPoints: 1250,
      })
      .mockResolvedValueOnce({
        teamId: 456,
        teamName: 'Opponent Team',
        managerName: 'Opponent',
        overallRank: 25000,
        overallPoints: 980,
      });
    vi.mocked(teamStats.calculateAveragePoints).mockResolvedValue(70);
    vi.mocked(teamStats.calculateForm).mockResolvedValue('W-W-W-L-W');

    render(<HeadToHeadPreview creatorFplId={123} creatorName="Monzaga" opponentFplId={456} opponentName="Eyad fc" gameweek={10} />);

    expect(await screen.findByText(/1,250/i)).toBeInTheDocument();
    expect(await screen.findByText(/980/i)).toBeInTheDocument();
  });

  it('displays average points per gameweek for creator', async () => {
    vi.mocked(fplService.getFPLTeamInfo).mockResolvedValue({
      teamId: 123,
      teamName: 'Test Team',
      managerName: 'Manager',
      overallRank: 15000,
      overallPoints: 1250,
    });
    vi.mocked(teamStats.calculateAveragePoints)
      .mockResolvedValueOnce(72)  // creator
      .mockResolvedValueOnce(65); // opponent

    render(<HeadToHeadPreview creatorFplId={123} creatorName="Monzaga" opponentFplId={456} opponentName="Eyad fc" gameweek={10} />);

    expect(await screen.findByText(/📈 Avg: 72 pts\/GW/i)).toBeInTheDocument();
  });

  it('displays average points per gameweek for opponent', async () => {
    vi.mocked(fplService.getFPLTeamInfo).mockResolvedValue({
      teamId: 456,
      teamName: 'Test Team',
      managerName: 'Manager',
      overallRank: 18000,
      overallPoints: 980,
    });
    vi.mocked(teamStats.calculateAveragePoints)
      .mockResolvedValueOnce(72)  // creator
      .mockResolvedValueOnce(68); // opponent

    render(<HeadToHeadPreview creatorFplId={123} creatorName="Monzaga" opponentFplId={456} opponentName="Eyad fc" gameweek={10} />);

    expect(await screen.findByText(/📈 Avg: 68 pts\/GW/i)).toBeInTheDocument();
  });

  it('displays form for creator', async () => {
    vi.mocked(fplService.getFPLTeamInfo).mockResolvedValue({
      teamId: 123,
      teamName: 'Test Team',
      managerName: 'Manager',
      overallRank: 15000,
      overallPoints: 1250,
    });
    vi.mocked(teamStats.calculateAveragePoints)
      .mockResolvedValueOnce(72)  // creator
      .mockResolvedValueOnce(68); // opponent
    vi.mocked(teamStats.calculateForm)
      .mockResolvedValueOnce('W-L-W-W-L'); // creator form

    render(<HeadToHeadPreview creatorFplId={123} creatorName="Monzaga" opponentFplId={456} opponentName="Eyad fc" gameweek={10} />);

    expect(await screen.findByText(/Form: W-L-W-W-L/i)).toBeInTheDocument();
  });

  it('displays form for opponent', async () => {
    vi.mocked(fplService.getFPLTeamInfo).mockResolvedValue({
      teamId: 456,
      teamName: 'Test Team',
      managerName: 'Manager',
      overallRank: 18000,
      overallPoints: 980,
    });
    vi.mocked(teamStats.calculateAveragePoints)
      .mockResolvedValueOnce(72)  // creator
      .mockResolvedValueOnce(68); // opponent
    vi.mocked(teamStats.calculateForm)
      .mockResolvedValueOnce('W-L-W-W-L')  // creator form
      .mockResolvedValueOnce('L-W-L-L-W'); // opponent form

    render(<HeadToHeadPreview creatorFplId={123} creatorName="Monzaga" opponentFplId={456} opponentName="Eyad fc" gameweek={10} />);

    expect(await screen.findByText(/Form: L-W-L-L-W/i)).toBeInTheDocument();
  });

  it('displays advantage when creator has higher average', async () => {
    vi.mocked(fplService.getFPLTeamInfo).mockResolvedValue({
      teamId: 123,
      teamName: 'Test Team',
      managerName: 'Manager',
      overallRank: 15000,
      overallPoints: 1250,
    });
    vi.mocked(teamStats.calculateAveragePoints)
      .mockResolvedValueOnce(72)  // creator
      .mockResolvedValueOnce(68); // opponent
    vi.mocked(teamStats.calculateForm)
      .mockResolvedValueOnce('W-L-W-W-L')  // creator form
      .mockResolvedValueOnce('L-W-L-L-W'); // opponent form

    render(<HeadToHeadPreview creatorFplId={123} creatorName="Monzaga" opponentFplId={456} opponentName="Eyad fc" gameweek={10} />);

    expect(await screen.findByText(/⚡ \+4 pts\/GW \(You!\)/i)).toBeInTheDocument();
  });

  it('displays 🎯 emoji before Rank', async () => {
    vi.mocked(fplService.getFPLTeamInfo).mockResolvedValue({
      teamId: 123,
      teamName: 'Test Team',
      managerName: 'Manager',
      overallRank: 15000,
      overallPoints: 1250,
    });
    vi.mocked(teamStats.calculateAveragePoints).mockResolvedValue(70);
    vi.mocked(teamStats.calculateForm).mockResolvedValue('W-W-W-L-W');

    render(<HeadToHeadPreview creatorFplId={123} creatorName="Monzaga" opponentFplId={456} opponentName="Eyad fc" gameweek={10} />);

    // Both creator and opponent ranks should have the emoji
    const rankElements = await screen.findAllByText(/🎯 Rank:/i);
    expect(rankElements.length).toBe(2);
  });

  it('displays 🔥 emoji before Form', async () => {
    vi.mocked(fplService.getFPLTeamInfo).mockResolvedValue({
      teamId: 123,
      teamName: 'Test Team',
      managerName: 'Manager',
      overallRank: 15000,
      overallPoints: 1250,
    });
    vi.mocked(teamStats.calculateAveragePoints).mockResolvedValue(70);
    vi.mocked(teamStats.calculateForm).mockResolvedValue('W-W-W-L-W');

    render(<HeadToHeadPreview creatorFplId={123} creatorName="Monzaga" opponentFplId={456} opponentName="Eyad fc" gameweek={10} />);

    // Both creator and opponent form should have the emoji
    const formElements = await screen.findAllByText(/🔥 Form:/i);
    expect(formElements.length).toBe(2);
  });

  it('displays visual separator between team names and stats', async () => {
    vi.mocked(fplService.getFPLTeamInfo).mockResolvedValue({
      teamId: 123,
      teamName: 'Test Team',
      managerName: 'Manager',
      overallRank: 15000,
      overallPoints: 1250,
    });
    vi.mocked(teamStats.calculateAveragePoints).mockResolvedValue(70);
    vi.mocked(teamStats.calculateForm).mockResolvedValue('W-W-W-L-W');

    render(<HeadToHeadPreview creatorFplId={123} creatorName="Monzaga" opponentFplId={456} opponentName="Eyad fc" gameweek={10} />);

    const separator = await screen.findByTestId('team-separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('border-t');
  });
});
