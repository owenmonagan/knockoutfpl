import type { StateHandlerRegistry } from '../types';
import { landingHandlers } from './landing';
import { loginHandlers } from './login';
import { signupHandlers } from './signup';
import { forgotPasswordHandlers } from './forgot-password';
import { connectHandlers } from './connect';
import { dashboardHandlers } from './dashboard';
import { leaguesHandlers } from './leagues';
import { leagueHandlers } from './league';
import { profileHandlers } from './profile';

export const stateHandlers: StateHandlerRegistry = {
  landing: landingHandlers,
  login: loginHandlers,
  signup: signupHandlers,
  'forgot-password': forgotPasswordHandlers,
  connect: connectHandlers,
  dashboard: dashboardHandlers,
  leagues: leaguesHandlers,
  league: leagueHandlers,
  profile: profileHandlers,
};
