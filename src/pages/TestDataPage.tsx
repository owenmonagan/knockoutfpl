import { useState } from 'react';
import { Button } from '../components/ui/button';
import { db } from '../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getCurrentGameweek } from '../services/fpl';

export function TestDataPage() {
  const [liveChallengeId, setLiveChallengeId] = useState<string | null>(null);
  const [completedChallengeId, setCompletedChallengeId] = useState<string | null>(null);
  const [previewChallengeId, setPreviewChallengeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateLiveChallenge = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Fetch current gameweek from FPL API
      const currentGameweek = await getCurrentGameweek();
      const previousGameweek = currentGameweek - 1;

      // Create a past deadline (2 days ago) to trigger live state
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const challengeData = {
        gameweek: previousGameweek,
        status: 'accepted',
        creatorUserId: 'testUser1',
        creatorFplId: 158256,
        creatorFplTeamName: 'Monzaga',
        creatorScore: null,
        opponentUserId: 'testUser2',
        opponentFplId: 2780009,
        opponentFplTeamName: 'Eyad fc',
        opponentScore: null,
        winnerId: null,
        isDraw: false,
        gameweekDeadline: Timestamp.fromDate(twoDaysAgo),
        gameweekFinished: false, // Gameweek still in progress = LIVE state
        completedAt: null,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'challenges'), challengeData);
      setLiveChallengeId(docRef.id);
      setSuccess('Success! Live challenge created.');
    } catch (err) {
      setError('Error writing to Firebase. Please use Firebase Emulator or update Firestore rules. See TESTING.md for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCompletedChallenge = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      // Create a past deadline (7 days ago) for a completed gameweek
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const challengeData = {
        gameweek: 7,
        status: 'completed',
        creatorUserId: 'testUser1',
        creatorFplId: 158256,
        creatorFplTeamName: 'Monzaga',
        creatorScore: 85,
        opponentUserId: 'testUser2',
        opponentFplId: 2780009,
        opponentFplTeamName: 'Eyad fc',
        opponentScore: 72,
        winnerId: 'testUser1', // Creator wins
        isDraw: false,
        gameweekDeadline: Timestamp.fromDate(sevenDaysAgo),
        gameweekFinished: true, // Gameweek finished
        completedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'challenges'), challengeData);
      setCompletedChallengeId(docRef.id);
      setSuccess('Success! Completed challenge created.');
    } catch (err) {
      setError('Error writing to Firebase. Please use Firebase Emulator or update Firestore rules. See TESTING.md for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePreviewChallenge = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Create a future deadline (2 days from now) to trigger preview state
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

      const challengeData = {
        gameweek: 8,
        status: 'accepted',
        creatorUserId: 'testUser1',
        creatorFplId: 158256,
        creatorFplTeamName: 'Monzaga',
        creatorScore: null,
        opponentUserId: 'testUser2',
        opponentFplId: 2780009,
        opponentFplTeamName: 'Eyad fc',
        opponentScore: null,
        winnerId: null,
        isDraw: false,
        gameweekDeadline: Timestamp.fromDate(twoDaysFromNow),
        gameweekFinished: false, // Gameweek hasn't started = PREVIEW state
        completedAt: null,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'challenges'), challengeData);
      setPreviewChallengeId(docRef.id);
      setSuccess('Success! Preview challenge created.');
    } catch (err) {
      setError('Error writing to Firebase. Please use Firebase Emulator or update Firestore rules. See TESTING.md for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <h1>Test Data Generator</h1>
      <div className="flex gap-2">
        <Button onClick={handleCreateLiveChallenge} disabled={isLoading}>Create Live Challenge</Button>
        <Button onClick={handleCreateCompletedChallenge} disabled={isLoading}>Create Completed Challenge</Button>
        <Button onClick={handleCreatePreviewChallenge} disabled={isLoading}>Create Preview Challenge</Button>
      </div>
      {error && (
        <div className="text-red-500">{error}</div>
      )}
      {success && (
        <div className="text-green-500">{success}</div>
      )}
      {liveChallengeId && (
        <a href={`/challenge/${liveChallengeId}`}>View Live Challenge</a>
      )}
      {completedChallengeId && (
        <a href={`/challenge/${completedChallengeId}`}>View Completed Challenge</a>
      )}
      {previewChallengeId && (
        <a href={`/challenge/${previewChallengeId}`}>View Preview Challenge</a>
      )}
    </main>
  );
}
