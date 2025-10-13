import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FPLTeamConnect } from './FPLTeamConnect';

describe('FPLTeamConnect', () => {
  it('should render team ID input field', () => {
    render(<FPLTeamConnect userId="test-uid" />);

    expect(screen.getByLabelText(/fpl team id/i)).toBeInTheDocument();
  });
});
