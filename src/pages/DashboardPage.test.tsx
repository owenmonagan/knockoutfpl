import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardPage } from './DashboardPage';
import * as AuthContext from '../contexts/AuthContext';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('DashboardPage', () => {
  it('should render dashboard content', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { email: 'test@example.com', uid: 'test-uid' } as any,
      loading: false,
      isAuthenticated: true,
    });

    render(<DashboardPage />);

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });
});
