import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfilePage } from './ProfilePage';
import { AuthContext } from '../contexts/AuthContext';
import * as userService from '../services/user';

// Mock the user service
vi.mock('../services/user');

const mockAuthUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
};

const mockAuthContext = {
  user: mockAuthUser,
  loading: false,
  isAuthenticated: true,
  connectionError: false,
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches user profile on mount', async () => {
    const mockGetUserProfile = vi.mocked(userService.getUserProfile);
    mockGetUserProfile.mockResolvedValue({
      userId: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      fplTeamId: 158256,
      fplTeamName: 'Test FC',
      wins: 0,
      losses: 0,
      createdAt: { toDate: () => new Date() } as any,
      updatedAt: { toDate: () => new Date() } as any,
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ProfilePage />
      </AuthContext.Provider>
    );

    expect(mockGetUserProfile).toHaveBeenCalledWith('test-user-123');
  });
});
