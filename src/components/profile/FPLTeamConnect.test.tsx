import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FPLTeamConnect } from './FPLTeamConnect';

describe('FPLTeamConnect', () => {
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
});
