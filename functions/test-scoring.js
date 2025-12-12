// Test script to manually trigger scoring function
const admin = require('firebase-admin');

// Initialize with emulator settings
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
admin.initializeApp({ projectId: 'knockoutfpl-dev' });

const db = admin.firestore();

// Import the scoring logic
const { scoreChallenge } = require('./lib/challengeScoring');

async function testScoring() {
  console.log('🧪 Testing Challenge Scoring Function...\n');

  try {
    // Get the test challenge
    console.log('📋 Fetching test challenge from Firestore...');
    const challengeDoc = await db.collection('challenges').doc('testChallenge1').get();

    if (!challengeDoc.exists) {
      console.error('❌ Test challenge not found!');
      process.exit(1);
    }

    const challenge = { challengeId: challengeDoc.id, ...challengeDoc.data() };
    console.log(`✅ Found challenge: ${challenge.challengeId}`);
    console.log(`   Gameweek: ${challenge.gameweek}`);
    console.log(`   Status: ${challenge.status}`);
    console.log(`   Creator FPL ID: ${challenge.creatorFplId}`);
    console.log(`   Opponent FPL ID: ${challenge.opponentFplId}\n`);

    // Test scoreChallenge function
    console.log('⚽ Fetching scores from FPL API...');
    const scoreData = await scoreChallenge({
      challengeId: challenge.challengeId,
      gameweek: challenge.gameweek,
      creatorFplId: challenge.creatorFplId,
      creatorUserId: challenge.creatorUserId,
      opponentFplId: challenge.opponentFplId,
      opponentUserId: challenge.opponentUserId,
    });

    console.log(`✅ Scores fetched successfully!`);
    console.log(`   Creator Score: ${scoreData.creatorScore}`);
    console.log(`   Opponent Score: ${scoreData.opponentScore}`);
    console.log(`   Winner ID: ${scoreData.winnerId || 'Draw'}`);
    console.log(`   Is Draw: ${scoreData.isDraw}\n`);

    // Update Firestore
    console.log('💾 Updating Firestore with results...');
    await db.runTransaction(async (transaction) => {
      const challengeRef = db.collection('challenges').doc(challenge.challengeId);
      const creatorRef = db.collection('users').doc(challenge.creatorUserId);
      const opponentRef = db.collection('users').doc(challenge.opponentUserId);

      const [creatorDoc, opponentDoc] = await Promise.all([
        transaction.get(creatorRef),
        transaction.get(opponentRef),
      ]);

      // Update challenge
      transaction.update(challengeRef, {
        creatorScore: scoreData.creatorScore,
        opponentScore: scoreData.opponentScore,
        winnerId: scoreData.winnerId,
        isDraw: scoreData.isDraw,
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update user records
      if (!scoreData.isDraw) {
        const creatorData = creatorDoc.data();
        const opponentData = opponentDoc.data();

        if (scoreData.winnerId === challenge.creatorUserId) {
          transaction.update(creatorRef, {
            wins: (creatorData?.wins || 0) + 1,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          transaction.update(opponentRef, {
            losses: (opponentData?.losses || 0) + 1,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          transaction.update(creatorRef, {
            losses: (creatorData?.losses || 0) + 1,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          transaction.update(opponentRef, {
            wins: (opponentData?.wins || 0) + 1,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    });

    console.log('✅ Firestore updated successfully!\n');

    // Verify updates
    console.log('🔍 Verifying Firestore updates...');
    const updatedChallenge = await db.collection('challenges').doc('testChallenge1').get();
    const updatedCreator = await db.collection('users').doc('testUser1').get();
    const updatedOpponent = await db.collection('users').doc('testUser2').get();

    console.log('\n📊 Final State:');
    console.log('   Challenge:');
    console.log(`     - Status: ${updatedChallenge.data().status}`);
    console.log(`     - Creator Score: ${updatedChallenge.data().creatorScore}`);
    console.log(`     - Opponent Score: ${updatedChallenge.data().opponentScore}`);
    console.log(`     - Winner ID: ${updatedChallenge.data().winnerId || 'Draw'}`);
    console.log('   Creator (testUser1):');
    console.log(`     - Wins: ${updatedCreator.data().wins}`);
    console.log(`     - Losses: ${updatedCreator.data().losses}`);
    console.log('   Opponent (testUser2):');
    console.log(`     - Wins: ${updatedOpponent.data().wins}`);
    console.log(`     - Losses: ${updatedOpponent.data().losses}`);

    console.log('\n🎉 Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testScoring();
