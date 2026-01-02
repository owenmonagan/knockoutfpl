// src/components/tournament/NWayMatchCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NWayMatchCard } from './NWayMatchCard';
import type { Match, Participant } from '../../types/tournament';

const mockParticipants: Participant[] = [
  { fplTeamId: 1, fplTeamName: 'Team Alpha', managerName: 'Alice', seed: 1 },
  { fplTeamId: 2, fplTeamName: 'Team Beta', managerName: 'Bob', seed: 2 },
  { fplTeamId: 3, fplTeamName: 'Team Gamma', managerName: 'Charlie', seed: 3 },
];

describe('NWayMatchCard', () => {
  it('renders all players sorted by score (highest first)', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: 45 },
        { fplTeamId: 2, seed: 2, score: 52 },
        { fplTeamId: 3, seed: 3, score: 38 },
      ],
      winnerId: 2,
      isBye: false,
    };

    render(
      <NWayMatchCard match={match} participants={mockParticipants} gameweek={10} />
    );

    const teamNames = screen.getAllByTestId('team-name');
    expect(teamNames[0]).toHaveTextContent('Team Beta'); // 52 pts
    expect(teamNames[1]).toHaveTextContent('Team Alpha'); // 45 pts
    expect(teamNames[2]).toHaveTextContent('Team Gamma'); // 38 pts
  });

  it('highlights the winner', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: 52 },
        { fplTeamId: 2, seed: 2, score: 45 },
      ],
      winnerId: 1,
      isBye: false,
    };

    render(
      <NWayMatchCard match={match} participants={mockParticipants} gameweek={10} />
    );

    const winnerRow = screen.getByTestId('player-row-1');
    expect(winnerRow).toHaveClass('font-semibold');
  });

  it('shows rank indicators (1st, 2nd, 3rd)', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: 52 },
        { fplTeamId: 2, seed: 2, score: 45 },
        { fplTeamId: 3, seed: 3, score: 38 },
      ],
      winnerId: 1,
      isBye: false,
    };

    render(
      <NWayMatchCard match={match} participants={mockParticipants} gameweek={10} />
    );

    expect(screen.getByText('1st')).toBeInTheDocument();
    expect(screen.getByText('2nd')).toBeInTheDocument();
    expect(screen.getByText('3rd')).toBeInTheDocument();
  });

  it('shows BYE for missing players', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: null },
      ],
      winnerId: 1,
      isBye: true,
    };

    render(
      <NWayMatchCard match={match} participants={mockParticipants} gameweek={10} />
    );

    expect(screen.getByText('BYE')).toBeInTheDocument();
  });

  it('shows pending state when no scores yet', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: null },
        { fplTeamId: 2, seed: 2, score: null },
        { fplTeamId: 3, seed: 3, score: null },
      ],
      winnerId: null,
      isBye: false,
    };

    render(
      <NWayMatchCard match={match} participants={mockParticipants} gameweek={10} />
    );

    // Should show teams in seed order when no scores
    const teamNames = screen.getAllByTestId('team-name');
    expect(teamNames[0]).toHaveTextContent('Team Alpha'); // seed 1
    expect(teamNames[1]).toHaveTextContent('Team Beta'); // seed 2
    expect(teamNames[2]).toHaveTextContent('Team Gamma'); // seed 3
  });

  it('highlights user match when isUserMatch is true', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: 45 },
        { fplTeamId: 2, seed: 2, score: 52 },
      ],
      winnerId: 2,
      isBye: false,
    };

    render(
      <NWayMatchCard
        match={match}
        participants={mockParticipants}
        gameweek={10}
        isUserMatch
        userTeamId={1}
      />
    );

    const card = screen.getByTestId('nway-match-card');
    expect(card).toHaveClass('border-amber-500');
  });

  it('shows gameweek badge', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: null },
        { fplTeamId: 2, seed: 2, score: null },
      ],
      winnerId: null,
      isBye: false,
    };

    render(
      <NWayMatchCard match={match} participants={mockParticipants} gameweek={10} />
    );

    expect(screen.getByText(/GW ?10/i)).toBeInTheDocument();
  });

  it('shows checkmark next to winner score', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: 52 },
        { fplTeamId: 2, seed: 2, score: 45 },
      ],
      winnerId: 1,
      isBye: false,
    };

    render(
      <NWayMatchCard match={match} participants={mockParticipants} gameweek={10} />
    );

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('reduces opacity of loser rows', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: 52 },
        { fplTeamId: 2, seed: 2, score: 45 },
        { fplTeamId: 3, seed: 3, score: 38 },
      ],
      winnerId: 1,
      isBye: false,
    };

    render(
      <NWayMatchCard match={match} participants={mockParticipants} gameweek={10} />
    );

    const loserRow2 = screen.getByTestId('player-row-2');
    const loserRow3 = screen.getByTestId('player-row-3');
    expect(loserRow2).toHaveClass('opacity-50');
    expect(loserRow3).toHaveClass('opacity-50');
  });

  it('shows scores for each player', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: 52 },
        { fplTeamId: 2, seed: 2, score: 45 },
        { fplTeamId: 3, seed: 3, score: 38 },
      ],
      winnerId: 1,
      isBye: false,
    };

    render(
      <NWayMatchCard match={match} participants={mockParticipants} gameweek={10} />
    );

    expect(screen.getByText('52')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('38')).toBeInTheDocument();
  });

  it('shows seed numbers for each player', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: null },
        { fplTeamId: 2, seed: 2, score: null },
        { fplTeamId: 3, seed: 3, score: null },
      ],
      winnerId: null,
      isBye: false,
    };

    render(
      <NWayMatchCard match={match} participants={mockParticipants} gameweek={10} />
    );

    expect(screen.getByText(/\(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(2\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(3\)/)).toBeInTheDocument();
  });

  it('handles 4-way match correctly', () => {
    const fourWayParticipants: Participant[] = [
      ...mockParticipants,
      { fplTeamId: 4, fplTeamName: 'Team Delta', managerName: 'Diana', seed: 4 },
    ];

    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: 52 },
        { fplTeamId: 2, seed: 2, score: 45 },
        { fplTeamId: 3, seed: 3, score: 38 },
        { fplTeamId: 4, seed: 4, score: 61 },
      ],
      winnerId: 4,
      isBye: false,
    };

    render(
      <NWayMatchCard match={match} participants={fourWayParticipants} gameweek={10} />
    );

    // Should be sorted by score: Delta (61), Alpha (52), Beta (45), Gamma (38)
    const teamNames = screen.getAllByTestId('team-name');
    expect(teamNames[0]).toHaveTextContent('Team Delta'); // 61 pts - winner
    expect(teamNames[1]).toHaveTextContent('Team Alpha'); // 52 pts
    expect(teamNames[2]).toHaveTextContent('Team Beta'); // 45 pts
    expect(teamNames[3]).toHaveTextContent('Team Gamma'); // 38 pts

    // Should show 4th place indicator
    expect(screen.getByText('4th')).toBeInTheDocument();
  });

  it('falls back to legacy player1/player2 format', () => {
    const legacyMatch: Match = {
      id: 'match-1',
      player1: { fplTeamId: 1, seed: 1, score: 52 },
      player2: { fplTeamId: 2, seed: 2, score: 45 },
      winnerId: 1,
      isBye: false,
    };

    render(
      <NWayMatchCard match={legacyMatch} participants={mockParticipants} gameweek={10} />
    );

    expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    expect(screen.getByText('Team Beta')).toBeInTheDocument();
  });
});
