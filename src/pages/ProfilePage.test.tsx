import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePage } from './ProfilePage';

// Mock auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { uid: 'test-uid' } })),
}));

// Mock FPL service
vi.mock('../services/fpl', () => ({
  getFPLTeamInfo: vi.fn(),
}));

// Mock user service
vi.mock('../services/user', () => ({
  connectFPLTeam: vi.fn(),
}));

describe('ProfilePage', () => {
  it('should render profile page with FPL team connection', () => {
    render(<ProfilePage />);

    expect(screen.getByText(/connect your fpl team/i)).toBeInTheDocument();
  });
});
