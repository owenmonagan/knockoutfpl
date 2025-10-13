import { Timestamp } from 'firebase/firestore';

export type ChallengeStatus = 'pending' | 'accepted' | 'active' | 'completed';

export interface Challenge {
  challengeId: string;
  gameweek: number;
  status: ChallengeStatus;
  creatorUserId: string;
  creatorFplId: number;
  creatorFplTeamName: string;
  creatorScore: number | null;
  opponentUserId: string | null;
  opponentFplId: number | null;
  opponentFplTeamName: string | null;
  opponentScore: number | null;
  winnerId: string | null;
  isDraw: boolean;
  gameweekDeadline: Timestamp;
  gameweekFinished: boolean;
  completedAt: Timestamp | null;
  createdAt: Timestamp;
}
