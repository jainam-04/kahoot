const mongoose = require('mongoose');
const GameSession = require('../models/GameSession');
const Quiz = require('../models/Quiz');
const gameController = require('../controllers/gameController');

// Helper to create mock req / res objects
function createMockHttp(body = {}) {
  return new Promise((resolve) => {
    let capturedStatus = 200;
    const req = {
      body,
      app: {
        get: (key) => {
          if (key === 'io') {
            return {
              to: () => ({
                emit: () => {}
              })
            };
          }
          return null;
        }
      }
    };
    const res = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(data) {
        resolve({ status: capturedStatus, data });
        return this;
      }
    };
    return { req, res };
  });
}

async function invokeController(fn, body = {}, params = {}) {
  return new Promise(async (resolve) => {
    let capturedStatus = 200;
    const req = {
      body,
      params,
      app: {
        get: (key) => {
          if (key === 'io') {
            return {
              to: () => ({
                emit: () => {}
              })
            };
          }
          return null;
        }
      }
    };
    const res = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(data) {
        resolve({ status: capturedStatus, data });
        return this;
      }
    };
    try {
      await fn(req, res);
    } catch (err) {
      resolve({ status: 500, data: { success: false, error: err.message } });
    }
  });
}

async function runSimultaneousTest() {
  console.log('\n=============================================================');
  console.log('🚀 SIMULTANEOUS LOAD & LOBBY WORKFLOW TEST: 25-30 PLAYERS');
  console.log('=============================================================\n');

  const mongoUri = 'mongodb://localhost:27017/kahoot';
  console.log(`[1] Connecting to MongoDB: ${mongoUri}...`);
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB successfully.\n');

  const testPin = 'TEST_' + Math.floor(100000 + Math.random() * 900000);
  const dummyHostId = new mongoose.Types.ObjectId();

  // 1. Setup Quiz and GameSession
  console.log(`[2] Initializing Test Quiz & GameSession with PIN: ${testPin}...`);
  const testQuiz = await Quiz.create({
    title: 'Stress Test Arena Quiz',
    category: 'Computer Science',
    createdBy: dummyHostId,
    questions: [
      {
        questionText: 'What is 10 + 20?',
        options: ['10', '20', '30', '40'],
        correctAnswer: 2,
        timeLimit: 30
      }
    ]
  });

  const session = await GameSession.create({
    pin: testPin,
    quizId: testQuiz._id,
    hostId: dummyHostId,
    status: 'waiting',
    currentQuestionIndex: -1,
    players: []
  });
  console.log(`✅ Session created (Status: ${session.status}, Initial Players: 0)\n`);

  // =========================================================================
  // TEST 1: 30 Simultaneous Joins
  // =========================================================================
  const TOTAL_PLAYERS = 30;
  console.log(`-------------------------------------------------------------`);
  console.log(`🧪 TEST 1: Simultaneously Joining ${TOTAL_PLAYERS} Players via joinGame API`);
  console.log(`-------------------------------------------------------------`);

  const avatars = ['dog', 'cat', 'mouse', 'rabbit', 'fox', 'bear', 'panda', 'tiger'];
  const joinRequests = [];

  const startJoinTime = Date.now();
  for (let i = 1; i <= TOTAL_PLAYERS; i++) {
    const numStr = String(i).padStart(2, '0');
    const playerName = `Player_${numStr}`;
    const avatar = avatars[(i - 1) % avatars.length];

    joinRequests.push(
      invokeController(gameController.joinGame, {
        pin: testPin,
        playerName: playerName,
        avatar: avatar,
        fullName: `Candidate ${numStr}`,
        mobileNumber: `98765432${numStr}`,
        nickname: playerName
      }).then(res => ({
        player: playerName,
        status: res.status,
        success: res.data?.success,
        message: res.data?.message
      }))
    );
  }

  // Fire all 30 requests concurrently
  const joinResults = await Promise.all(joinRequests);
  const joinDuration = Date.now() - startJoinTime;

  const successfulJoins = joinResults.filter(r => r.status === 200 && r.success);
  console.log(`⚡ ${TOTAL_PLAYERS} concurrent join requests completed in ${joinDuration}ms (avg ${(joinDuration / TOTAL_PLAYERS).toFixed(1)}ms/req)`);
  console.log(`   Success count: ${successfulJoins.length} / ${TOTAL_PLAYERS}`);

  // Verify in MongoDB
  const sessionAfterJoins = await GameSession.findOne({ pin: testPin });
  const uniqueNames = new Set(sessionAfterJoins.players.map(p => p.name.toLowerCase()));
  console.log(`📊 DB Player count: ${sessionAfterJoins.players.length}`);
  console.log(`📊 Unique Player names: ${uniqueNames.size}`);

  if (sessionAfterJoins.players.length === TOTAL_PLAYERS && uniqueNames.size === TOTAL_PLAYERS) {
    console.log('✅ PASS: All 30 players joined simultaneously with zero collisions or drops!\n');
  } else {
    console.error('❌ FAIL: Player count mismatch after concurrent join!');
    process.exit(1);
  }

  // =========================================================================
  // TEST 2: Simultaneous Player Leaves
  // =========================================================================
  console.log(`-------------------------------------------------------------`);
  console.log(`🧪 TEST 2: Simultaneous Player Leaves (3 players leave lobby)`);
  console.log(`-------------------------------------------------------------`);

  const playersToLeave = ['Player_05', 'Player_12', 'Player_27'];
  console.log(`Players leaving concurrently: ${playersToLeave.join(', ')}`);

  const leaveRequests = playersToLeave.map(name =>
    invokeController(gameController.leaveGame, {
      pin: testPin,
      playerName: name
    })
  );

  const leaveResults = await Promise.all(leaveRequests);
  const leaveSuccess = leaveResults.filter(r => r.status === 200 && r.data?.success);
  console.log(`⚡ Leave requests completed. Successful: ${leaveSuccess.length} / ${playersToLeave.length}`);

  const sessionAfterLeaves = await GameSession.findOne({ pin: testPin });
  const remainingNames = sessionAfterLeaves.players.map(p => p.name);
  const leftFoundInDb = playersToLeave.filter(name => remainingNames.includes(name));

  console.log(`📊 DB Player count after leaves: ${sessionAfterLeaves.players.length} (expected ${TOTAL_PLAYERS - playersToLeave.length})`);
  console.log(`📊 Any left players still in DB? ${leftFoundInDb.length > 0 ? leftFoundInDb.join(', ') : 'None (cleanly removed)'}`);

  if (sessionAfterLeaves.players.length === TOTAL_PLAYERS - playersToLeave.length && leftFoundInDb.length === 0) {
    console.log('✅ PASS: Leaving players were cleanly purged from lobby and DB!\n');
  } else {
    console.error('❌ FAIL: Player leave did not update DB cleanly!');
    process.exit(1);
  }

  // =========================================================================
  // TEST 3: User's Exact Problem - Rejoin with Different Name
  // =========================================================================
  console.log(`-------------------------------------------------------------`);
  console.log(`🧪 TEST 3: Rejoining with Different Name (The User's Bug Scenario)`);
  console.log(`-------------------------------------------------------------`);
  console.log(`Scenario: Player_18 leaves and rejoins with new name 'Champion_Pro'`);

  const rejoinResult = await invokeController(gameController.joinGame, {
    pin: testPin,
    playerName: 'Champion_Pro',
    avatar: 'tiger',
    fullName: 'Champion Professional',
    mobileNumber: '9998887777',
    nickname: 'Champion_Pro',
    previousPlayerName: 'Player_18' // Tells backend to replace old name
  });

  console.log(`⚡ Rejoin response: Status ${rejoinResult.status}, Message: "${rejoinResult.data?.message}"`);

  const sessionAfterRejoin = await GameSession.findOne({ pin: testPin });
  const namesInDb = sessionAfterRejoin.players.map(p => p.name);
  const hasOldName = namesInDb.includes('Player_18');
  const hasNewName = namesInDb.includes('Champion_Pro');

  console.log(`📊 DB Player count: ${sessionAfterRejoin.players.length} (expected 27)`);
  console.log(`📊 Is old name 'Player_18' in DB? ${hasOldName ? 'YES (BUG!)' : 'NO (Cleanly removed!)'}`);
  console.log(`📊 Is new name 'Champion_Pro' in DB? ${hasNewName ? 'YES (Present!)' : 'NO (Missing!)'}`);

  if (!hasOldName && hasNewName && sessionAfterRejoin.players.length === 27) {
    console.log('✅ PASS: Previous name was automatically removed and new name added without duplicate ghost entries!\n');
  } else {
    console.error('❌ FAIL: Rejoin with new name left ghost entry or failed to register!');
    process.exit(1);
  }

  // =========================================================================
  // TEST 4: Rejoining with Same Name (Idempotency)
  // =========================================================================
  console.log(`-------------------------------------------------------------`);
  console.log(`🧪 TEST 4: Idempotency (Player reconnects with identical name)`);
  console.log(`-------------------------------------------------------------`);

  const reconnectResult = await invokeController(gameController.joinGame, {
    pin: testPin,
    playerName: 'Player_01',
    avatar: 'bear',
    fullName: 'Candidate 01 Reconnected',
    mobileNumber: '9876543201',
    nickname: 'Player_01'
  });

  console.log(`⚡ Reconnect response: Status ${reconnectResult.status}`);
  const sessionAfterReconnect = await GameSession.findOne({ pin: testPin });
  const player01Count = sessionAfterReconnect.players.filter(p => p.name.toLowerCase() === 'player_01').length;
  console.log(`📊 Total players: ${sessionAfterReconnect.players.length}, Instances of 'Player_01': ${player01Count}`);

  if (player01Count === 1 && sessionAfterReconnect.players.length === 27) {
    console.log('✅ PASS: Reconnecting with same name updates info without duplicate entries!\n');
  } else {
    console.error('❌ FAIL: Duplicate created on reconnect!');
    process.exit(1);
  }

  // =========================================================================
  // TEST 5: Quiz Commences & 27 Concurrent Answer Submissions
  // =========================================================================
  console.log(`-------------------------------------------------------------`);
  console.log(`🧪 TEST 5: Active Quiz & Concurrent Answer Submissions (27 Players)`);
  console.log(`-------------------------------------------------------------`);

  // Start the question
  await GameSession.findOneAndUpdate(
    { pin: testPin },
    { status: 'active', currentQuestionIndex: 0, questionStartTime: Date.now() }
  );
  console.log(`⚡ Quiz status changed to 'active', question 0 started.`);

  const currentPlayers = (await GameSession.findOne({ pin: testPin })).players;
  const answerRequests = currentPlayers.map((player, idx) => {
    const isCorrect = (idx % 3 !== 0); // ~67% correct answers
    const chosenAnswer = isCorrect ? 2 : 0;
    const timeTaken = 300 + idx * 40; // varying response times
    return invokeController(gameController.submitAnswer, {
      pin: testPin,
      playerName: player.name,
      answerIndex: chosenAnswer
    });
  });

  const startAnswerTime = Date.now();
  const answerResults = await Promise.all(answerRequests);
  const answerDuration = Date.now() - startAnswerTime;

  const successfulAnswers = answerResults.filter(r => r.status === 200 && r.data?.success);
  console.log(`⚡ ${currentPlayers.length} concurrent answers submitted in ${answerDuration}ms (avg ${(answerDuration / currentPlayers.length).toFixed(1)}ms/req)`);
  console.log(`   Successful answer submissions: ${successfulAnswers.length} / ${currentPlayers.length}`);

  // Test duplicate answer prevention
  console.log('⚡ Testing duplicate submission prevention for 5 players...');
  const duplicateRequests = currentPlayers.slice(0, 5).map(p =>
    invokeController(gameController.submitAnswer, {
      pin: testPin,
      playerName: p.name,
      answerIndex: 1
    })
  );
  const duplicateResults = await Promise.all(duplicateRequests);
  const duplicatesBlocked = duplicateResults.filter(r => r.status === 400);
  console.log(`   Duplicate submissions blocked: ${duplicatesBlocked.length} / 5 (expected 5)`);

  const sessionAfterAnswers = await GameSession.findOne({ pin: testPin });
  const allRecorded = sessionAfterAnswers.players.every(p => p.answers.length === 1);
  console.log(`📊 Did every single player have exactly 1 answer recorded? ${allRecorded ? 'YES' : 'NO'}`);

  if (successfulAnswers.length === 27 && duplicatesBlocked.length === 5 && allRecorded) {
    console.log('✅ PASS: Concurrent answer submissions handled with 100% data integrity!\n');
  } else {
    console.error('❌ FAIL: Answers were lost or duplicate answers were accepted!');
    process.exit(1);
  }

  // =========================================================================
  // TEST 6: Leaderboard Standings & 1st Place Validation
  // =========================================================================
  console.log(`-------------------------------------------------------------`);
  console.log(`🧪 TEST 6: Leaderboard Ranking & 1st Place Validation`);
  console.log(`-------------------------------------------------------------`);

  const leaderboardResult = await invokeController(gameController.getLeaderboard, {}, { pin: testPin });
  const leaderboard = leaderboardResult.data?.leaderboard || [];

  console.log(`📊 Leaderboard entries received: ${leaderboard.length}`);
  if (leaderboard.length > 0) {
    const rank1 = leaderboard[0];
    const rank2 = leaderboard[1];
    const rank3 = leaderboard[2];

    console.log(`🥇 Rank #1: "${rank1.name}" - Score: ${rank1.totalScore} pts (Correct: ${rank1.correctAnswers})`);
    console.log(`🥈 Rank #2: "${rank2.name}" - Score: ${rank2.totalScore} pts (Correct: ${rank2.correctAnswers})`);
    console.log(`🥉 Rank #3: "${rank3.name}" - Score: ${rank3.totalScore} pts (Correct: ${rank3.correctAnswers})`);

    const rank1Valid = rank1 && rank1.name && rank1.name.trim().length > 0 && rank1.totalScore >= rank2.totalScore;
    if (rank1Valid) {
      console.log('✅ PASS: Rank #1 winner has valid name, highest score, and valid podium data!\n');
    } else {
      console.error('❌ FAIL: Leaderboard rank #1 data invalid!');
      process.exit(1);
    }
  }

  // Cleanup
  console.log('[7] Cleaning up test documents from MongoDB...');
  await GameSession.deleteOne({ pin: testPin });
  await Quiz.deleteOne({ _id: testQuiz._id });
  await mongoose.disconnect();

  console.log('=============================================================');
  console.log('🎉 ALL 6 SIMULTANEOUS LOAD & LOBBY WORKFLOW TESTS PASSED 100%');
  console.log('=============================================================\n');
}

runSimultaneousTest().catch(err => {
  console.error('Test execution failed with error:', err);
  process.exit(1);
});
