/**
 * Environment configuration
 */

/**
 * Whether the app is running in development mode.
 * Used to conditionally show dev-only features like email/password auth.
 */
export const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
