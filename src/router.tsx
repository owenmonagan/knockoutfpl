import type { RouteObject } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ComparePage } from './pages/ComparePage';
import { TestDataPage } from './pages/TestDataPage';
import { LeaguePage } from './pages/LeaguePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const router: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/compare',
    element: <ComparePage />,
  },
  {
    path: '/test-data',
    element: <TestDataPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/league/:leagueId',
    element: (
      <ProtectedRoute>
        <LeaguePage />
      </ProtectedRoute>
    ),
  },
];
