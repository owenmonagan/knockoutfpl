import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PreviewStateView } from './PreviewStateView';
import { Timestamp } from 'firebase/firestore';
import * as fplService from '../services/fpl';
import * as teamStats from '../lib/teamStats';

vi.mock('../services/fpl');
vi.mock('../lib/teamStats', async () => {
  const actual = await vi.importActual<typeof import('../lib/teamStats')>('../lib/teamStats');
  return {
    ...actual,
    calculateAveragePoints: vi.fn().mockResolvedValue(70),
    calculateForm: vi.fn().mockResolvedValue('W-W-W-L-W'),
  };
});

describe('PreviewStateView', () => {
  beforeEach(() => {
    // Setup default mocks
    vi.mocked(fplService.getFPLTeamPicks).mockResolvedValue({
      picks: [],
      entryHistory: { event: 9, points: 70, totalPoints: 700 },
      activeChip: null,
    } as any);
    vi.mocked(fplService.getFPLPlayers).mockResolvedValue(new Map());
    vi.mocked(fplService.getFPLLiveScores).mockResolvedValue(new Map());
    vi.mocked(fplService.getFPLFixtures).mockResolvedValue([]);
  });


  it('renders without crashing', () => {
    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={10}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="test-challenge-id"
      />
    );

    expect(screen.getByTestId('preview-state-view')).toBeInTheDocument();
  });

  it('shows gameweek title', () => {
    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={15}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="test-challenge-id"
      />
    );

    // Gameweek appears in multiple places (h2 and subtitle)
    const gameweekElements = screen.getAllByText(/Gameweek 15/i);
    expect(gameweekElements.length).toBeGreaterThan(0);
  });

  it('shows status badge with "⏰ Starting Soon" text', () => {
    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={15}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="test-challenge-id"
      />
    );

    expect(screen.getByText(/⏰ Starting Soon/i)).toBeInTheDocument();
  });

  it('integrates CountdownTimer with deadline', () => {
    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={15}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="test-challenge-id"
      />
    );

    expect(screen.getByRole('timer')).toBeInTheDocument();
    expect(screen.getByText(/Kicks off in/i)).toBeInTheDocument();
  });

  it('integrates HeadToHeadPreview with team data', async () => {
    vi.mocked(fplService.getFPLTeamInfo).mockResolvedValue({
      teamId: 123,
      teamName: 'Test Team',
      managerName: 'Manager',
      overallRank: 15000,
      overallPoints: 1250,
    });

    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={15}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="test-challenge-id"
      />
    );

    // Team names appear in both title and HeadToHeadPreview
    const monzagaElements = await screen.findAllByText(/Monzaga/i);
    expect(monzagaElements.length).toBeGreaterThan(0);

    const eyadElements = await screen.findAllByText(/Eyad fc/i);
    expect(eyadElements.length).toBeGreaterThan(0);

    // "VS" appears in both title (as "vs") and HeadToHeadPreview (as "VS")
    const vsElements = await screen.findAllByText(/VS/i);
    expect(vsElements.length).toBeGreaterThan(0);
  });

  it('renders with Card wrapper', () => {
    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    const { container } = render(
      <PreviewStateView
        gameweek={10}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="test-challenge-id"
      />
    );

    // Card component from shadcn adds specific data attributes or classes
    const card = container.querySelector('[data-testid="preview-card"]');
    expect(card).toBeInTheDocument();
  });

  it('applies gradient background to Card', () => {
    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    const { container } = render(
      <PreviewStateView
        gameweek={10}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="test-challenge-id"
      />
    );

    const card = container.querySelector('[data-testid="preview-card"]');
    expect(card?.className).toMatch(/bg-gradient-to-r/);
    expect(card?.className).toMatch(/from-cyan-400/);
    expect(card?.className).toMatch(/to-purple-500/);
  });

  it('displays ⚔️ emoji in title with team names', () => {
    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={10}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="test-challenge-id"
      />
    );

    expect(screen.getByText(/⚔️ Monzaga vs Eyad fc/i)).toBeInTheDocument();
  });

  it('displays "Showdown" subtitle with gameweek number', () => {
    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={7}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="test-challenge-id"
      />
    );

    expect(screen.getByText(/Gameweek 7 Showdown/i)).toBeInTheDocument();
  });

  it('displays "⏰ Starting Soon" badge instead of "Pending"', () => {
    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={10}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="test-challenge-id"
      />
    );

    expect(screen.getByText(/⏰ Starting Soon/i)).toBeInTheDocument();
  });

  it('does not display "Preview Teams" button', () => {
    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={15}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="challenge123"
      />
    );

    const previewButton = screen.queryByRole('button', { name: /preview teams/i });
    expect(previewButton).not.toBeInTheDocument();
  });

  it('displays "Share Challenge" button', () => {
    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={15}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="challenge123"
      />
    );

    const shareButton = screen.getByRole('button', { name: /share challenge/i });
    expect(shareButton).toBeInTheDocument();
  });

  it('copies challenge URL to clipboard when Share Challenge button is clicked', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    // Mock clipboard API
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={15}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="challenge123"
      />
    );

    const shareButton = screen.getByRole('button', { name: /share challenge/i });
    await user.click(shareButton);

    // Should copy challenge URL to clipboard
    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining('/challenge/challenge123')
    );
  });

  it('fetches live scores for previous gameweek when component mounts', async () => {
    // Clear previous mocks
    vi.clearAllMocks();

    // Mock getFPLLiveScores
    vi.mocked(fplService.getFPLLiveScores).mockResolvedValue(new Map([
      [1, 10],
      [2, 5],
    ]));

    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={15}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="challenge123"
      />
    );

    // Should call getFPLLiveScores with previous gameweek (14)
    await waitFor(() => {
      expect(fplService.getFPLLiveScores).toHaveBeenCalledWith(14);
    });
  });

  it('fetches team picks and players for matchup preview on mount', async () => {
    // Clear previous mocks
    vi.clearAllMocks();

    // Mock all required API calls
    vi.mocked(fplService.getFPLLiveScores).mockResolvedValue(new Map([[1, 10]]));
    vi.mocked(fplService.getFPLTeamPicks).mockResolvedValue({
      picks: [{ element: 1, position: 1, multiplier: 1, is_captain: false, is_vice_captain: false }],
      entryHistory: { event: 14, points: 50, totalPoints: 500 },
      activeChip: null,
    });
    vi.mocked(fplService.getFPLPlayers).mockResolvedValue(
      new Map([[1, { id: 1, web_name: 'Salah', element_type: 3, team: 1, now_cost: 130 }]])
    );

    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={15}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="challenge123"
      />
    );

    // Should fetch team picks for both teams with previous gameweek (14)
    await waitFor(() => {
      expect(fplService.getFPLTeamPicks).toHaveBeenCalledWith(123, 14);
    });
    await waitFor(() => {
      expect(fplService.getFPLTeamPicks).toHaveBeenCalledWith(456, 14);
    });

    // Should fetch players data
    await waitFor(() => {
      expect(fplService.getFPLPlayers).toHaveBeenCalled();
    });
  });

  it('displays matchup preview below Preview Card', async () => {
    // Clear previous mocks
    vi.clearAllMocks();

    // Mock API calls with matchup data
    vi.mocked(fplService.getFPLLiveScores).mockResolvedValue(new Map([
      [1, 10],
      [2, 5],
    ]));

    // Creator team has player 1, opponent has player 2
    vi.mocked(fplService.getFPLTeamPicks).mockImplementation((teamId: number) => {
      if (teamId === 123) {
        return Promise.resolve({
          picks: [{ element: 1, position: 1, multiplier: 1, is_captain: false, is_vice_captain: false }],
          entryHistory: { event: 14, points: 10, totalPoints: 500 },
          activeChip: null,
        });
      } else {
        return Promise.resolve({
          picks: [{ element: 2, position: 1, multiplier: 1, is_captain: false, is_vice_captain: false }],
          entryHistory: { event: 14, points: 5, totalPoints: 450 },
          activeChip: null,
        });
      }
    });

    vi.mocked(fplService.getFPLPlayers).mockResolvedValue(
      new Map([
        [1, { id: 1, web_name: 'Salah', element_type: 3, team: 1, now_cost: 130 }],
        [2, { id: 2, web_name: 'Haaland', element_type: 4, team: 2, now_cost: 140 }],
      ])
    );

    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={15}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="challenge123"
      />
    );

    // Wait for data to load and matchup preview to be displayed
    await waitFor(() => {
      expect(screen.getByText(/matchup results/i)).toBeInTheDocument();
    });

    // Should display team names in matchup (multiple occurrences expected)
    const monzagaElements = screen.getAllByText(/monzaga/i);
    expect(monzagaElements.length).toBeGreaterThan(0);

    const eyadElements = screen.getAllByText(/eyad fc/i);
    expect(eyadElements.length).toBeGreaterThan(0);
  });

  it('displays real player matchup data from previous gameweek', async () => {
    // Clear previous mocks
    vi.clearAllMocks();

    // Mock API calls with real matchup data
    vi.mocked(fplService.getFPLLiveScores).mockResolvedValue(new Map([
      [1, 10],  // Salah scored 10
      [2, 5],   // Haaland scored 5
    ]));

    // Creator has Salah, opponent has Haaland
    vi.mocked(fplService.getFPLTeamPicks).mockImplementation((teamId: number) => {
      if (teamId === 123) {
        return Promise.resolve({
          picks: [{ element: 1, position: 1, multiplier: 1, is_captain: false, is_vice_captain: false }],
          entryHistory: { event: 14, points: 10, totalPoints: 500 },
          activeChip: null,
        });
      } else {
        return Promise.resolve({
          picks: [{ element: 2, position: 1, multiplier: 1, is_captain: false, is_vice_captain: false }],
          entryHistory: { event: 14, points: 5, totalPoints: 450 },
          activeChip: null,
        });
      }
    });

    vi.mocked(fplService.getFPLPlayers).mockResolvedValue(
      new Map([
        [1, { id: 1, web_name: 'Salah', element_type: 3, team: 1, now_cost: 130 }],
        [2, { id: 2, web_name: 'Haaland', element_type: 4, team: 2, now_cost: 140 }],
      ])
    );

    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={15}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="challenge123"
      />
    );

    // Wait for data to load and matchup to be displayed
    await waitFor(() => {
      expect(screen.getByText(/matchup results/i)).toBeInTheDocument();
    });

    // Should display actual player names in the matchup
    await waitFor(() => {
      const salahElements = screen.queryAllByText(/salah/i);
      expect(salahElements.length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      const haalandElements = screen.queryAllByText(/haaland/i);
      expect(haalandElements.length).toBeGreaterThan(0);
    });

    // Should display scores from previous gameweek (10-5)
    await waitFor(() => {
      const scoreText = screen.getByText('10');
      expect(scoreText).toBeInTheDocument();
    });

    await waitFor(() => {
      const scoreText = screen.getByText('5');
      expect(scoreText).toBeInTheDocument();
    });
  });

  it('displays PREVIEW badge near Matchup Results', async () => {
    // Clear previous mocks
    vi.clearAllMocks();

    // Mock minimal API calls
    vi.mocked(fplService.getFPLLiveScores).mockResolvedValue(new Map());
    vi.mocked(fplService.getFPLTeamPicks).mockResolvedValue({
      picks: [],
      entryHistory: { event: 14, points: 0, totalPoints: 0 },
      activeChip: null,
    });
    vi.mocked(fplService.getFPLPlayers).mockResolvedValue(new Map());

    const deadline = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 72));

    render(
      <PreviewStateView
        gameweek={15}
        deadline={deadline}
        creatorFplId={123}
        creatorName="Monzaga"
        opponentFplId={456}
        opponentName="Eyad fc"
        challengeId="challenge123"
      />
    );

    // Should display "Matchup Results" heading
    await waitFor(() => {
      expect(screen.getByText(/matchup results/i)).toBeInTheDocument();
    });

    // Should display PREVIEW badge (as a badge element, not just in button text)
    const previewBadges = screen.queryAllByText(/^PREVIEW$/);
    expect(previewBadges.length).toBeGreaterThan(0);
  });
});
