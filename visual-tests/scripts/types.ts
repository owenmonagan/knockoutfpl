import type { Page } from '@playwright/test';

export type RouteName =
  | 'landing'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'connect'
  | 'dashboard'
  | 'leagues'
  | 'league'
  | 'profile';

export interface StateSetupContext {
  /** Playwright page instance */
  page: Page;
  /** Name of the route being captured */
  routeName: RouteName;
  /** Name of the state being captured */
  stateName: string;
  /** Base URL of the application */
  baseURL: string;
}

export interface StateSetupResult {
  /** URL to navigate to (if different from route path) */
  url?: string;
  /** Whether to wait for network idle before screenshot (default: true) */
  waitForNetworkIdle?: boolean;
  /** Custom wait time in ms after page load */
  additionalWaitMs?: number;
  /** Elements to wait for before screenshot */
  waitForSelectors?: string[];
  /** Cleanup function to run after screenshot */
  cleanup?: () => Promise<void>;
}

/**
 * A state handler sets up a specific state for a route before screenshot capture.
 * It can navigate, fill forms, intercept network, etc.
 */
export type StateHandler = (ctx: StateSetupContext) => Promise<StateSetupResult>;

/**
 * Maps state names to their handler functions for a single route.
 */
export interface RouteHandlers {
  [stateName: string]: StateHandler;
}

/**
 * Maps route names to their state handlers.
 */
export type StateHandlerRegistry = Record<RouteName, RouteHandlers>;
