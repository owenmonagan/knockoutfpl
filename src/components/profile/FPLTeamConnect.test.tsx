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
});
