import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NoTournamentEmptyState } from './NoTournamentEmptyState';

const defaultProps = {
  leagueName: 'London Pub League',
  managerCount: 12,
  isAuthenticated: true,
  onCreate: vi.fn(),
};

const renderComponent = (props = {}) => {
  return render(
    <BrowserRouter>
      <NoTournamentEmptyState {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe('NoTournamentEmptyState', () => {
  it('should render the headline', () => {
    renderComponent();
    expect(screen.getByText('No Tournament Yet')).toBeInTheDocument();
  });

  it('should display the league name in the description', () => {
    renderComponent({ leagueName: 'Test League' });
    expect(screen.getByText('Test League')).toBeInTheDocument();
  });

  it('should render the trophy icon', () => {
    renderComponent();
    expect(screen.getByText('emoji_events')).toBeInTheDocument();
  });
});
