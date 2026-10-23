const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const GameSession = require('../models/GameSession');
const Quiz = require('../models/Quiz');
const gameController = require('../controllers/gameController');

function invokeController(fn, body = {}, params = {}) {
  return new Promise(async (resolve) => {
    let capturedStatus = 200;
    const req = {
      body,
      params,
      app: {
        get: (key) => (key === 'io' ? { to: () => ({ emit: () => {} }) } : null)
      }
    };
    const res = {
      status(code) { capturedStatus = code; return this; },
      json(data) { resolve({ status: capturedStatus, data }); return this; }
    };
    try {
      await fn(req, res);
    } catch (err) {
      resolve({ status: 500, data: { success: false, error: err.message } });
    }
  });
}

test('Concurrent 25-30 Player Lobby & Gameplay Simulation Test', async (t) => {
  try {
    await mongoose.connect('mongodb://localhost:27017/kahoot', { serverSelectionTimeoutMS: 2000 });
  } catch {
    // fallback
  }

  if (mongoose.connection.readyState !== 1) {
    t.skip('MongoDB connection is not available in current test environment');
    return;
  }

  const testPin = 'SIM_' + Math.floor(100000 + Math.random() * 900000);
  const dummyHostId = new mongoose.Types.ObjectId();

  const testQuiz = await Quiz.create({
    title: 'Automated Concurrent Load Test',
    category: 'Science',
    createdBy: dummyHostId,
    questions: [
      {
        questionText: 'What is 5 x 5?',
        options: ['10', '15', '20', '25'],
        correctAnswer: 3,
        timeLimit: 30
      }
    ]
  });

  await GameSession.create({
    pin: testPin,
    quizId: testQuiz._id,
    hostId: dummyHostId,
    status: 'waiting',
    currentQuestionIndex: -1,
    players: []
  });

  try {
    // 1. Concurrent 25 Players Join
    const TOTAL = 25;
    const joinPromises = [];
    for (let i = 1; i <= TOTAL; i++) {
      const name = `Player_${String(i).padStart(2, '0')}`;
      joinPromises.push(
        invokeController(gameController.joinGame, {
          pin: testPin,
          playerName: name,
          avatar: 'dog',
          fullName: `Candidate ${i}`,
          nickname: name
        })
      );
    }

    const joinResults = await Promise.all(joinPromises);
    assert.equal(joinResults.every(r => r.status === 200), true, 'All 25 players should successfully join');

    const sessionAfterJoins = await GameSession.findOne({ pin: testPin });
    assert.equal(sessionAfterJoins.players.length, TOTAL, 'Database should contain exactly 25 players');

    // 2. Concurrent Player Leaves
    const toLeave = ['Player_04', 'Player_11'];
    const leavePromises = toLeave.map(name =>
      invokeController(gameController.leaveGame, { pin: testPin, playerName: name })
    );
    await Promise.all(leavePromises);

    const sessionAfterLeaves = await GameSession.findOne({ pin: testPin });
    assert.equal(sessionAfterLeaves.players.length, TOTAL - toLeave.length, 'Database should contain 23 players after 2 leave');
    const remainingNames = sessionAfterLeaves.players.map(p => p.name);
    assert.equal(remainingNames.includes('Player_04'), false, 'Left player must not exist in DB');
    assert.equal(remainingNames.includes('Player_11'), false, 'Left player must not exist in DB');

    // 3. Rejoin with Different Name (Previous Name Replacement)
    const rejoinRes = await invokeController(gameController.joinGame, {
      pin: testPin,
      playerName: 'NewStar_77',
      avatar: 'cat',
      fullName: 'New Star',
      nickname: 'NewStar_77',
      previousPlayerName: 'Player_15'
    });
    assert.equal(rejoinRes.status, 200);

    const sessionAfterRejoin = await GameSession.findOne({ pin: testPin });
    const updatedNames = sessionAfterRejoin.players.map(p => p.name);
    assert.equal(sessionAfterRejoin.players.length, 23, 'Player count should remain 23 (1 replaced by 1)');
    assert.equal(updatedNames.includes('Player_15'), false, 'Previous name Player_15 should be deleted');
    assert.equal(updatedNames.includes('NewStar_77'), true, 'New name NewStar_77 should be present');

    // 4. Concurrent Answer Submissions
    await GameSession.findOneAndUpdate(
      { pin: testPin },
      { status: 'active', currentQuestionIndex: 0, questionStartTime: Date.now() }
    );

    const answerPromises = sessionAfterRejoin.players.map(p =>
      invokeController(gameController.submitAnswer, {
        pin: testPin,
        playerName: p.name,
        answerIndex: 3
      })
    );
    const answerResults = await Promise.all(answerPromises);
    assert.equal(answerResults.every(r => r.status === 200), true, 'All 23 players should have answers recorded');

    // Duplicate answer rejected
    const dupRes = await invokeController(gameController.submitAnswer, {
      pin: testPin,
      playerName: sessionAfterRejoin.players[0].name,
      answerIndex: 2
    });
    assert.equal(dupRes.status, 400, 'Duplicate answer submission must be rejected');

    // 5. Leaderboard verification
    const lbRes = await invokeController(gameController.getLeaderboard, {}, { pin: testPin });
    assert.equal(lbRes.status, 200);
    const lb = lbRes.data?.leaderboard || [];
    assert.equal(lb.length, 23);
    assert.equal(typeof lb[0].name, 'string');
    assert.ok(lb[0].name.length > 0);

  } finally {
    await GameSession.deleteOne({ pin: testPin });
    await Quiz.deleteOne({ _id: testQuiz._id });
    await mongoose.disconnect();
  }
});
