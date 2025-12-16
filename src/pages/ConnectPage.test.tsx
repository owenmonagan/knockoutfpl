import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConnectPage } from './ConnectPage';

// Mock AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id', displayName: 'Test User' },
  }),
}));

// Mock user service
vi.mock('../services/user', () => ({
  connectFPLTeam: vi.fn(),
}));

// Mock FPL service
vi.mock('../services/fpl', () => ({
  getFPLTeamInfo: vi.fn(),
}));

describe('ConnectPage', () => {
  it('renders the page title', () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Connect Your FPL Team')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Let's see what you're made of.")).toBeInTheDocument();
  });

  it('renders the FPL Team ID input', () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    expect(screen.getByLabelText('FPL Team ID')).toBeInTheDocument();
  });

  it('renders the help link', () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Where's my Team ID?")).toBeInTheDocument();
  });

  it('renders the Find My Team button', () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: 'Find My Team' })).toBeInTheDocument();
  });
});
