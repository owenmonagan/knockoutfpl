import type { RouteObject } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaguePage } from './pages/LeaguePage';
import { LeaguesPage } from './pages/LeaguesPage';
import { ConnectPage } from './pages/ConnectPage';
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
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/connect',
    element: (
      <ProtectedRoute>
        <ConnectPage />
      </ProtectedRoute>
    ),
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
    path: '/leagues',
    element: (
      <ProtectedRoute>
        <LeaguesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/league/:leagueId',
    element: <LeaguePage />,
  },
];
