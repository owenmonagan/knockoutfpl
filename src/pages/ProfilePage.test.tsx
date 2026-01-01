import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfilePage } from './ProfilePage';
import { AuthContext } from '../contexts/AuthContext';
import * as userService from '../services/user';
import * as fplService from '../services/fpl';

// Mock the user service
vi.mock('../services/user');
vi.mock('../services/fpl');

const mockAuthUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
} as any;

const mockAuthContext = {
  user: mockAuthUser,
  loading: false,
  isAuthenticated: true,
  connectionError: false,
} as any;

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

  it('fetches FPL data when user has fplTeamId', async () => {
    const mockGetUserProfile = vi.mocked(userService.getUserProfile);
    const mockGetFPLTeamInfo = vi.mocked(fplService.getFPLTeamInfo);

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

    mockGetFPLTeamInfo.mockResolvedValue({
      teamId: 158256,
      teamName: 'Test FC',
      managerName: 'Test Manager',
      gameweekPoints: 65,
      gameweekRank: 500000,
      overallPoints: 450,
      overallRank: 100000,
      teamValue: 102.5,
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ProfilePage />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(mockGetFPLTeamInfo).toHaveBeenCalledWith(158256);
    });
  });

  it('does not fetch FPL data when fplTeamId is 0', async () => {
    const mockGetUserProfile = vi.mocked(userService.getUserProfile);
    const mockGetFPLTeamInfo = vi.mocked(fplService.getFPLTeamInfo);

    mockGetUserProfile.mockResolvedValue({
      userId: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      fplTeamId: 0,
      fplTeamName: '',
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

    await waitFor(() => {
      expect(mockGetUserProfile).toHaveBeenCalled();
    });

    expect(mockGetFPLTeamInfo).not.toHaveBeenCalled();
  });

  it('renders FPLConnectionCard with user and FPL data', async () => {
    const mockGetUserProfile = vi.mocked(userService.getUserProfile);
    const mockGetFPLTeamInfo = vi.mocked(fplService.getFPLTeamInfo);

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

    mockGetFPLTeamInfo.mockResolvedValue({
      teamId: 158256,
      teamName: 'Test FC',
      managerName: 'Test Manager',
      gameweekPoints: 65,
      gameweekRank: 500000,
      overallPoints: 450,
      overallRank: 100000,
      teamValue: 102.5,
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ProfilePage />
      </AuthContext.Provider>
    );

    // FPLConnectionCard shows team name as title when connected
    await waitFor(() => {
      expect(screen.getByText('Test FC')).toBeInTheDocument();
    });
  });

  it('shows loading skeleton while fetching profile', () => {
    const mockGetUserProfile = vi.mocked(userService.getUserProfile);
    mockGetUserProfile.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ProfilePage />
      </AuthContext.Provider>
    );

    // Should show skeleton loading state
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('handles error when handleConnect fails', async () => {
    const mockGetUserProfile = vi.mocked(userService.getUserProfile);
    const mockConnectFPLTeam = vi.mocked(userService.connectFPLTeam);

    mockGetUserProfile.mockResolvedValue({
      userId: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      fplTeamId: 0,
      fplTeamName: '',
      wins: 0,
      losses: 0,
      createdAt: { toDate: () => new Date() } as any,
      updatedAt: { toDate: () => new Date() } as any,
    });

    mockConnectFPLTeam.mockRejectedValue(new Error('Network error'));

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ProfilePage />
      </AuthContext.Provider>
    );

    // Wait for initial profile load
    await waitFor(() => {
      expect(mockGetUserProfile).toHaveBeenCalled();
    });

    // Find and fill input using label
    const input = screen.getByLabelText('FPL Team ID');
    const connectButton = screen.getByRole('button', { name: /connect/i });

    await userEvent.type(input, '158256');
    await userEvent.click(connectButton);

    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText(/failed to connect team/i)).toBeInTheDocument();
    });
  });

  it('renders ProfileForm with user data', async () => {
    const mockGetUserProfile = vi.mocked(userService.getUserProfile);
    mockGetUserProfile.mockResolvedValue({
      userId: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      fplTeamId: 0,
      fplTeamName: '',
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

    await waitFor(() => {
      expect(screen.getByText('Account Details')).toBeInTheDocument();
    });
  });
});
