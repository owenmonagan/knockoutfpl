import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserMenu } from './UserMenu';

describe('UserMenu', () => {
  it('renders', () => {
    render(<UserMenu displayName="Test User" email="test@example.com" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows display name in trigger', () => {
    render(<UserMenu displayName="Test User" email="test@example.com" />);
    expect(screen.getByRole('button', { name: /Test User/i })).toBeInTheDocument();
  });

  it('shows Sign Out option when clicked', async () => {
    const user = userEvent.setup();
    render(<UserMenu displayName="Test User" email="test@example.com" onSignOut={() => {}} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument();
  });

  it('calls onSignOut when Sign Out is clicked', async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();
    render(<UserMenu displayName="Test User" email="test@example.com" onSignOut={onSignOut} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('menuitem', { name: /sign out/i }));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
