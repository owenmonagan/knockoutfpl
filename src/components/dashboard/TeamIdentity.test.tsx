import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamIdentity } from './TeamIdentity';

describe('TeamIdentity', () => {
  const defaultProps = {
    teamName: "Haaland's Hairband FC",
    managerName: 'Owen Smith',
    overallRank: 124000,
    gameweekNumber: 34,
    gameweekPoints: 78,
    onSync: vi.fn(),
    onEditTeam: vi.fn(),
  };

  it('renders without crashing', () => {
    render(<TeamIdentity {...defaultProps} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays the team name', () => {
    render(<TeamIdentity {...defaultProps} />);
    expect(screen.getByText("Haaland's Hairband FC")).toBeInTheDocument();
  });

  it('displays the manager name with prefix', () => {
    render(<TeamIdentity {...defaultProps} />);
    expect(screen.getByText(/Manager: Owen Smith/)).toBeInTheDocument();
  });

  it('displays overall rank badge with formatted number', () => {
    render(<TeamIdentity {...defaultProps} />);
    expect(screen.getByText(/OR:/)).toBeInTheDocument();
    expect(screen.getByText(/124k/)).toBeInTheDocument();
  });

  it('displays gameweek points badge', () => {
    render(<TeamIdentity {...defaultProps} />);
    expect(screen.getByText(/GW34:/)).toBeInTheDocument();
    expect(screen.getByText(/78 pts/)).toBeInTheDocument();
  });

  it('renders sync button', () => {
    render(<TeamIdentity {...defaultProps} />);
    expect(screen.getByRole('button', { name: /sync/i })).toBeInTheDocument();
  });

  it('calls onSync when sync button clicked', async () => {
    const user = userEvent.setup();
    const onSync = vi.fn();
    render(<TeamIdentity {...defaultProps} onSync={onSync} />);

    await user.click(screen.getByRole('button', { name: /sync/i }));
    expect(onSync).toHaveBeenCalledTimes(1);
  });

  it('renders edit team button', () => {
    render(<TeamIdentity {...defaultProps} />);
    expect(screen.getByRole('button', { name: /edit|change team/i })).toBeInTheDocument();
  });

  it('calls onEditTeam when edit button clicked', async () => {
    const user = userEvent.setup();
    const onEditTeam = vi.fn();
    render(<TeamIdentity {...defaultProps} onEditTeam={onEditTeam} />);

    await user.click(screen.getByRole('button', { name: /edit|change team/i }));
    expect(onEditTeam).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when syncing', () => {
    render(<TeamIdentity {...defaultProps} isSyncing={true} />);
    const syncButton = screen.getByRole('button', { name: /sync/i });
    expect(syncButton).toBeDisabled();
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('formats large ranks with k suffix', () => {
    render(<TeamIdentity {...defaultProps} overallRank={1500000} />);
    expect(screen.getByText(/1.5m/i)).toBeInTheDocument();
  });

  it('formats small ranks without suffix', () => {
    render(<TeamIdentity {...defaultProps} overallRank={500} />);
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });
});
