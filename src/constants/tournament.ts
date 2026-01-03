// src/constants/tournament.ts
import { isDevelopment } from '../lib/config';

export const MIN_TOURNAMENT_PARTICIPANTS = 2;

// In dev mode, allow large leagues (up to 50,000) for testing background import
export const MAX_TOURNAMENT_PARTICIPANTS = isDevelopment ? 50000 : 48;
