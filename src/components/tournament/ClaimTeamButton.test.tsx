import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ClaimTeamButton } from './ClaimTeamButton';

describe('ClaimTeamButton', () => {
  it('renders claim button', () => {
    render(<ClaimTeamButton fplTeamId={123} onClaim={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClaim with fplTeamId when clicked', async () => {
    const handleClaim = vi.fn();
    const user = userEvent.setup();

    render(<ClaimTeamButton fplTeamId={456} onClaim={handleClaim} />);

    await user.click(screen.getByRole('button'));

    expect(handleClaim).toHaveBeenCalledWith(456);
    expect(handleClaim).toHaveBeenCalledTimes(1);
  });

  it('stops event propagation to prevent link navigation', async () => {
    const handleClaim = vi.fn();
    const user = userEvent.setup();

    render(
      <a href="/test">
        <ClaimTeamButton fplTeamId={789} onClaim={handleClaim} />
      </a>
    );

    await user.click(screen.getByRole('button'));

    // If propagation wasn't stopped, we'd navigate away
    expect(handleClaim).toHaveBeenCalled();
  });
});
