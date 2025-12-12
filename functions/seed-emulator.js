// Seed script for Firebase Emulator
const admin = require('firebase-admin');

// Initialize with emulator settings
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
admin.initializeApp({ projectId: 'knockoutfpl-dev' });

const db = admin.firestore();

async function seedData() {
  console.log('🌱 Seeding emulator data...\n');

  try {
    // Create User 1
    console.log('Creating testUser1...');
    await db.collection('users').doc('testUser1').set({
      userId: 'testUser1',
      fplTeamId: 158256,
      fplTeamName: 'Test Team 1',
      email: 'test1@test.com',
      displayName: 'Test User 1',
      wins: 0,
      losses: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ testUser1 created\n');

    // Create User 2
    console.log('Creating testUser2...');
    await db.collection('users').doc('testUser2').set({
      userId: 'testUser2',
      fplTeamId: 999999, // Different team
      fplTeamName: 'Test Team 2',
      email: 'test2@test.com',
      displayName: 'Test User 2',
      wins: 0,
      losses: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ testUser2 created\n');

    // Create Test Challenge (ready for scoring)
    console.log('Creating testChallenge1...');
    await db.collection('challenges').doc('testChallenge1').set({
      challengeId: 'testChallenge1',
      gameweek: 7, // Use a completed gameweek
      status: 'accepted',
      creatorUserId: 'testUser1',
      creatorFplId: 158256,
      creatorFplTeamName: 'Test Team 1',
      creatorScore: null,
      opponentUserId: 'testUser2',
      opponentFplId: 999999,
      opponentFplTeamName: 'Test Team 2',
      opponentScore: null,
      winnerId: null,
      isDraw: false,
      gameweekDeadline: admin.firestore.Timestamp.fromDate(new Date('2025-10-01')),
      gameweekFinished: true, // CRITICAL: Must be true for scoring
      completedAt: null, // CRITICAL: Must be null for scoring
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ testChallenge1 created\n');

    console.log('🎉 Seed data created successfully!');
    console.log('\n📊 Summary:');
    console.log('   - 2 users created (testUser1, testUser2)');
    console.log('   - 1 challenge created (testChallenge1)');
    console.log('   - Challenge status: accepted, ready for scoring\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
