import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { fetchFPLBootstrapData, fetchFPLTeamInfo, fetchFPLGameweekScore as fetchScore } from './fplApi';
import { scoreChallenge } from './challengeScoring';

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// ============================================================================
// FPL API Proxy Functions (HTTPS Callable)
// ============================================================================

/**
 * Get FPL bootstrap data (gameweeks, teams, players)
 * Proxies: /api/bootstrap-static/
 */
export const getFPLBootstrapData = onCall(async () => {
  try {
    const data = await fetchFPLBootstrapData();
    return { data };
  } catch (error: any) {
    console.error('getFPLBootstrapData error:', error);
    throw new HttpsError('internal', 'Failed to fetch FPL bootstrap data', { message: error.message });
  }
});

/**
 * Get FPL team info
 * Proxies: /api/entry/{teamId}/
 */
export const getFPLTeamInfo = onCall(async (request) => {
  const { teamId } = request.data;

  if (!teamId) {
    throw new HttpsError('invalid-argument', 'teamId is required');
  }

  try {
    const data = await fetchFPLTeamInfo(teamId);
    return { data };
  } catch (error: any) {
    console.error(`getFPLTeamInfo error for teamId ${teamId}:`, error);
    throw new HttpsError('internal', 'Failed to fetch FPL team info', { message: error.message });
  }
});

/**
 * Get FPL gameweek score
 * Proxies: /api/entry/{teamId}/event/{gameweek}/picks/
 */
export const getFPLGameweekScore = onCall(async (request) => {
  const { teamId, gameweek } = request.data;

  if (!teamId || !gameweek) {
    throw new HttpsError('invalid-argument', 'teamId and gameweek are required');
  }

  try {
    const data = await fetchScore(teamId, gameweek);
    return { data };
  } catch (error: any) {
    console.error(`getFPLGameweekScore error for teamId ${teamId}, gameweek ${gameweek}:`, error);
    throw new HttpsError('internal', 'Failed to fetch FPL gameweek score', { message: error.message });
  }
});

// ============================================================================
// Scheduled Function - Update Completed Gameweeks
// ============================================================================

/**
 * Runs every 2 hours to check for completed gameweeks
 * Fetches scores and updates challenge documents + user records
 *
 * Query logic:
 * - status === 'accepted' (opponent has accepted)
 * - gameweekFinished === true (gameweek is complete)
 * - completedAt === null (not yet scored)
 */
export const updateCompletedGameweeks = onSchedule(
  {
    schedule: 'every 2 hours',
    timeZone: 'Europe/London', // FPL timezone
    timeoutSeconds: 540, // 9 minutes (max is 540 for gen2)
    memory: '512MiB',
  },
  async (event) => {
    console.log('🚀 updateCompletedGameweeks triggered at', new Date().toISOString());

    try {
      // Query challenges that are ready for scoring
      const challengesSnapshot = await db
        .collection('challenges')
        .where('status', '==', 'accepted')
        .where('gameweekFinished', '==', true)
        .where('completedAt', '==', null)
        .get();

      console.log(`📊 Found ${challengesSnapshot.size} challenge(s) ready for scoring`);

      if (challengesSnapshot.empty) {
        console.log('✅ No challenges to score - exiting');
        return;
      }

      // Process each challenge
      const results = await Promise.allSettled(
        challengesSnapshot.docs.map(async (doc) => {
          const challenge = {
            challengeId: doc.id,
            ...doc.data(),
          } as any;

          console.log(`⚽ Scoring challenge ${challenge.challengeId} for gameweek ${challenge.gameweek}`);

          try {
            // Fetch scores and determine winner using tested business logic
            const scoreData = await scoreChallenge({
              challengeId: challenge.challengeId,
              gameweek: challenge.gameweek,
              creatorFplId: challenge.creatorFplId,
              creatorUserId: challenge.creatorUserId,
              opponentFplId: challenge.opponentFplId,
              opponentUserId: challenge.opponentUserId,
            });

            console.log(`📈 Scores: Creator ${scoreData.creatorScore} - ${scoreData.opponentScore} Opponent`);

            // Update challenge document and user records in an atomic transaction
            await db.runTransaction(async (transaction) => {
              const challengeRef = db.collection('challenges').doc(challenge.challengeId);
              const creatorRef = db.collection('users').doc(challenge.creatorUserId);
              const opponentRef = db.collection('users').doc(challenge.opponentUserId);

              // Read current user data
              const [creatorDoc, opponentDoc] = await Promise.all([
                transaction.get(creatorRef),
                transaction.get(opponentRef),
              ]);

              // Update challenge document with results
              transaction.update(challengeRef, {
                creatorScore: scoreData.creatorScore,
                opponentScore: scoreData.opponentScore,
                winnerId: scoreData.winnerId,
                isDraw: scoreData.isDraw,
                status: 'completed',
                completedAt: admin.firestore.FieldValue.serverTimestamp(),
              });

              // Update user win/loss records
              if (scoreData.isDraw) {
                console.log(`🤝 Challenge ${challenge.challengeId} ended in a draw`);
                // For MVP: draws don't update win/loss counters
                // Future: add draws counter
              } else {
                const creatorData = creatorDoc.data();
                const opponentData = opponentDoc.data();

                if (scoreData.winnerId === challenge.creatorUserId) {
                  // Creator won
                  transaction.update(creatorRef, {
                    wins: (creatorData?.wins || 0) + 1,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                  });
                  transaction.update(opponentRef, {
                    losses: (opponentData?.losses || 0) + 1,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                  });
                  console.log(`🏆 Creator won ${scoreData.creatorScore} - ${scoreData.opponentScore}`);
                } else {
                  // Opponent won
                  transaction.update(creatorRef, {
                    losses: (creatorData?.losses || 0) + 1,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                  });
                  transaction.update(opponentRef, {
                    wins: (opponentData?.wins || 0) + 1,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                  });
                  console.log(`🏆 Opponent won ${scoreData.opponentScore} - ${scoreData.creatorScore}`);
                }
              }
            });

            console.log(`✅ Successfully scored challenge ${challenge.challengeId}`);
          } catch (error: any) {
            console.error(`❌ Failed to score challenge ${challenge.challengeId}:`, error);
            throw error;
          }
        })
      );

      // Log summary results
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      console.log(`\n📊 Scoring Summary:`);
      console.log(`   ✅ Succeeded: ${succeeded}`);
      console.log(`   ❌ Failed: ${failed}`);
      console.log(`   📈 Total: ${challengesSnapshot.size}`);

      // Log details for failed challenges
      if (failed > 0) {
        console.error('\n❌ Failed Challenges:');
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const challengeId = challengesSnapshot.docs[index].id;
            console.error(`   - Challenge ${challengeId}:`, result.reason);
          }
        });
      }

      console.log('\n✅ updateCompletedGameweeks completed');
    } catch (error) {
      console.error('💥 Critical error in updateCompletedGameweeks:', error);
      throw error;
    }
  }
);

// Export proxy function
export { fplProxy } from './proxy';
