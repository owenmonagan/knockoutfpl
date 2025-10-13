import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FPLTeamConnect } from './FPLTeamConnect';

// Mock FPL service
vi.mock('../../services/fpl', () => ({
  getFPLTeamInfo: vi.fn(),
}));

// Mock user service
vi.mock('../../services/user', () => ({
  connectFPLTeam: vi.fn(),
}));

describe('FPLTeamConnect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render team ID input field', () => {
    render(<FPLTeamConnect userId="test-uid" />);

    expect(screen.getByLabelText(/fpl team id/i)).toBeInTheDocument();
  });

  it('should render verify team button', () => {
    render(<FPLTeamConnect userId="test-uid" />);

    expect(screen.getByRole('button', { name: /verify team/i })).toBeInTheDocument();
  });

  it('should disable verify button when team ID is empty', () => {
    render(<FPLTeamConnect userId="test-uid" />);

    const button = screen.getByRole('button', { name: /verify team/i });
    expect(button).toBeDisabled();
  });

  it('should call getFPLTeamInfo when verify button is clicked', async () => {
    const user = userEvent.setup();
    const { getFPLTeamInfo } = await import('../../services/fpl');

    vi.mocked(getFPLTeamInfo).mockResolvedValue({
      teamId: 158256,
      teamName: "Owen's Team",
      managerName: 'Owen Smith',
    });

    render(<FPLTeamConnect userId="test-uid" />);

    const input = screen.getByLabelText(/fpl team id/i);
    await user.type(input, '158256');

    const button = screen.getByRole('button', { name: /verify team/i });
    await user.click(button);

    expect(getFPLTeamInfo).toHaveBeenCalledWith(158256);
  });

  it('should show loading state during verification', async () => {
    const user = userEvent.setup();
    const { getFPLTeamInfo } = await import('../../services/fpl');

    // Create a promise we can control
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(getFPLTeamInfo).mockReturnValue(promise as any);

    render(<FPLTeamConnect userId="test-uid" />);

    const input = screen.getByLabelText(/fpl team id/i);
    await user.type(input, '158256');

    const button = screen.getByRole('button', { name: /verify team/i });
    await user.click(button);

    // Should show verifying state
    expect(screen.getByText(/verifying/i)).toBeInTheDocument();

    // Clean up
    resolvePromise!({
      teamId: 158256,
      teamName: "Owen's Team",
      managerName: 'Owen Smith',
    });
  });

  it('should display verified team information after successful verification', async () => {
    const user = userEvent.setup();
    const { getFPLTeamInfo } = await import('../../services/fpl');

    vi.mocked(getFPLTeamInfo).mockResolvedValue({
      teamId: 158256,
      teamName: "Owen's Team",
      managerName: 'Owen Smith',
    });

    render(<FPLTeamConnect userId="test-uid" />);

    const input = screen.getByLabelText(/fpl team id/i);
    await user.type(input, '158256');

    const button = screen.getByRole('button', { name: /verify team/i });
    await user.click(button);

    // Wait for verification to complete and team info to appear
    expect(await screen.findByText("Owen's Team")).toBeInTheDocument();
    expect(screen.getByText(/owen smith/i)).toBeInTheDocument();
  });

  it('should show connect button after successful verification', async () => {
    const user = userEvent.setup();
    const { getFPLTeamInfo } = await import('../../services/fpl');

    vi.mocked(getFPLTeamInfo).mockResolvedValue({
      teamId: 158256,
      teamName: "Owen's Team",
      managerName: 'Owen Smith',
    });

    render(<FPLTeamConnect userId="test-uid" />);

    const input = screen.getByLabelText(/fpl team id/i);
    await user.type(input, '158256');

    const verifyButton = screen.getByRole('button', { name: /verify team/i });
    await user.click(verifyButton);

    // Wait for connect button to appear
    expect(await screen.findByRole('button', { name: /connect team/i })).toBeInTheDocument();
  });

  it('should call connectFPLTeam when connect button is clicked', async () => {
    const user = userEvent.setup();
    const { getFPLTeamInfo } = await import('../../services/fpl');
    const { connectFPLTeam } = await import('../../services/user');

    vi.mocked(getFPLTeamInfo).mockResolvedValue({
      teamId: 158256,
      teamName: "Owen's Team",
      managerName: 'Owen Smith',
    });

    vi.mocked(connectFPLTeam).mockResolvedValue();

    render(<FPLTeamConnect userId="test-uid" />);

    const input = screen.getByLabelText(/fpl team id/i);
    await user.type(input, '158256');

    const verifyButton = screen.getByRole('button', { name: /verify team/i });
    await user.click(verifyButton);

    const connectButton = await screen.findByRole('button', { name: /connect team/i });
    await user.click(connectButton);

    expect(connectFPLTeam).toHaveBeenCalledWith('test-uid', 158256);
  });
});
