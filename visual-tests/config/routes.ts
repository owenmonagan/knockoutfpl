export type RouteState = {
  name: string;
  description: string;
};

export type RouteConfig = {
  path: string;
  auth: boolean;
  fplRequired: boolean;
  states: RouteState[];
};

export const routes: Record<string, RouteConfig> = {
  landing: {
    path: '/',
    auth: false,
    fplRequired: false,
    states: [
      { name: 'default', description: 'Default landing page for unauthenticated users' },
      { name: 'authenticated', description: 'Landing page when user is logged in' },
    ],
  },
  login: {
    path: '/login',
    auth: false,
    fplRequired: false,
    states: [
      { name: 'default', description: 'Empty login form' },
      { name: 'validation-error', description: 'Form with validation errors (invalid email/password format)' },
      { name: 'auth-error', description: 'Form showing authentication error (wrong credentials)' },
      { name: 'loading', description: 'Form in submitting state' },
    ],
  },
  signup: {
    path: '/signup',
    auth: false,
    fplRequired: false,
    states: [
      { name: 'default', description: 'Empty signup form' },
      { name: 'validation-error', description: 'Form with validation errors' },
      { name: 'loading', description: 'Form in submitting state' },
    ],
  },
  'forgot-password': {
    path: '/forgot-password',
    auth: false,
    fplRequired: false,
    states: [
      { name: 'default', description: 'Empty forgot password form' },
      { name: 'success', description: 'Email sent confirmation message' },
      { name: 'error', description: 'Error state (email not found, etc.)' },
    ],
  },
  connect: {
    path: '/connect',
    auth: true,
    fplRequired: false,
    states: [
      { name: 'default', description: 'Empty FPL team connection form' },
      { name: 'validation-error', description: 'Form with validation errors (invalid team ID format)' },
      { name: 'invalid-team', description: 'Team ID not found in FPL' },
      { name: 'loading', description: 'Form in submitting state' },
    ],
  },
  dashboard: {
    path: '/dashboard',
    auth: true,
    fplRequired: true,
    states: [
      { name: 'empty', description: 'No tournaments joined' },
      { name: 'with-tournaments', description: 'Has active tournaments' },
      { name: 'with-matches', description: 'Has upcoming matches to display' },
      { name: 'loading', description: 'Loading dashboard data' },
    ],
  },
  leagues: {
    path: '/leagues',
    auth: true,
    fplRequired: true,
    states: [
      { name: 'empty', description: 'No leagues available' },
      { name: 'with-leagues', description: 'Has leagues to display' },
      { name: 'loading', description: 'Loading leagues data' },
    ],
  },
  league: {
    path: '/league/:leagueId',
    auth: false,
    fplRequired: false,
    states: [
      { name: 'default', description: 'Normal league view with bracket' },
      { name: 'not-found', description: 'Invalid league ID - 404 state' },
      { name: 'loading', description: 'Loading league data' },
    ],
  },
  profile: {
    path: '/profile',
    auth: true,
    fplRequired: true,
    states: [
      { name: 'default', description: 'Profile view mode' },
      { name: 'editing', description: 'Profile edit mode active' },
      { name: 'loading', description: 'Loading profile data' },
    ],
  },
} as const;

export type RouteName = keyof typeof routes;
