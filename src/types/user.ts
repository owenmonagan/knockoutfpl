/**
 * User document structure in Firestore (/users/{userId})
 */
export interface User {
  userId: string;
  fplTeamId: number;
  fplTeamName: string;
  email: string;
  displayName: string;
  wins: number;
  losses: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data for creating a new user profile
 */
export interface CreateUserData {
  userId: string;
  email: string;
  displayName: string;
}
