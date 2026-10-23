const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const gameController = require('../controllers/gameController');
const GameSession = require('../models/GameSession');

test('game controller exports the handlers used by the routes', () => {
  assert.equal(typeof gameController.createGame, 'function');
  assert.equal(typeof gameController.joinGame, 'function');
  assert.equal(typeof gameController.startQuestion, 'function');
  assert.equal(typeof gameController.submitAnswer, 'function');
  assert.equal(typeof gameController.getLeaderboard, 'function');
  assert.equal(typeof gameController.endGame, 'function');
  assert.equal(typeof gameController.getGame, 'function');
});

test('GameSession validates cleanly when players only have name provided', () => {
  const session = new GameSession({
    pin: '123456',
    quizId: new mongoose.Types.ObjectId(),
    hostId: new mongoose.Types.ObjectId(),
    players: [
      { name: 'Student 1' },
      { name: 'Student 2', fullName: 'Student Two', mobileNumber: '9876543210' },
      { name: 'Student 3', avatar: '👤' }
    ]
  });

  const err = session.validateSync();
  assert.equal(err, undefined, 'Validation should succeed without error');
  assert.equal(session.players[0].fullName, '');
  assert.equal(session.players[0].mobileNumber, '');
  assert.equal(session.players[0].avatar, '👤');
});

test('submitAnswer validates required inputs', async () => {
  const res = {
    statusCode: 200,
    data: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.data = payload; return this; }
  };

  await gameController.submitAnswer({ body: { pin: '', playerName: 'John', answerIndex: 0 } }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.data.success, false);

  await gameController.submitAnswer({ body: { pin: '123456', playerName: '  ', answerIndex: 0 } }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.data.success, false);
});

test('submitAnswer matches player with trailing space and records answer', async () => {
  const originalFindOne = GameSession.findOne;
  try {
    const mockSession = {
      pin: '999888',
      status: 'active',
      currentQuestionIndex: 0,
      questionStartTime: Date.now(),
      quizId: {
        questions: [
          {
            questionText: 'What is 2+2?',
            options: ['3', '4', '5'],
            correctAnswer: 1,
            timeLimit: 20
          }
        ]
      },
      players: [
        {
          name: 'Priya',
          fullName: 'Priya Sharma',
          nickname: 'Priya',
          answers: [],
          totalScore: 0
        }
      ],
      save: async function() { return this; }
    };

    GameSession.findOne = () => ({
      populate: async () => mockSession
    });

    const res = {
      statusCode: 200,
      data: null,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.data = payload; return this; }
    };

    // Submit with trailing whitespace and lowercase "priya  "
    await gameController.submitAnswer({
      body: { pin: '999888', playerName: '  priya  ', answerIndex: 1 },
      app: { get: () => null }
    }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.isCorrect, true);
    assert.equal(mockSession.players[0].answers.length, 1);
    assert.equal(mockSession.players[0].answers[0].answerIndex, 1);
  } finally {
    GameSession.findOne = originalFindOne;
  }
});

test('submitAnswer auto-registers missing player and accepts answer rather than 404', async () => {
  const originalFindOne = GameSession.findOne;
  try {
    const mockSession = {
      pin: '999888',
      status: 'active',
      currentQuestionIndex: 0,
      questionStartTime: Date.now(),
      quizId: {
        questions: [
          {
            questionText: 'Capital of France?',
            options: ['Berlin', 'Madrid', 'Paris'],
            correctAnswer: 2,
            timeLimit: 20
          }
        ]
      },
      players: [],
      save: async function() { return this; }
    };

    GameSession.findOne = () => ({
      populate: async () => mockSession
    });

    const res = {
      statusCode: 200,
      data: null,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.data = payload; return this; }
    };

    // Submit for a student not initially in players list
    await gameController.submitAnswer({
      body: { pin: '999888', playerName: 'Aarav', answerIndex: 2 },
      app: { get: () => null }
    }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.equal(mockSession.players.length, 1);
    assert.equal(mockSession.players[0].name, 'Aarav');
    assert.equal(mockSession.players[0].answers.length, 1);
  } finally {
    GameSession.findOne = originalFindOne;
  }
});

test('submitAnswer uses atomic findOneAndUpdate when connected', async () => {
  const originalFindOne = GameSession.findOne;
  const originalFindOneAndUpdate = GameSession.findOneAndUpdate;
  const originalConnection = mongoose.connection.readyState;
  try {
    // Simulate connected state
    Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

    let findOneAndUpdateCalled = false;
    let atomicQuery = null;
    let atomicUpdate = null;

    const mockSession = {
      pin: '112233',
      status: 'active',
      currentQuestionIndex: 0,
      questionStartTime: Date.now(),
      quizId: {
        questions: [
          {
            questionText: 'Capital of India?',
            options: ['Mumbai', 'Delhi', 'Kolkata'],
            correctAnswer: 1,
            timeLimit: 20
          }
        ]
      },
      players: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Rohan',
          answers: [],
          totalScore: 0
        }
      ]
    };

    GameSession.findOne = () => ({
      populate: async () => mockSession
    });

    GameSession.findOneAndUpdate = async (query, update) => {
      findOneAndUpdateCalled = true;
      atomicQuery = query;
      atomicUpdate = update;
      return {
        ...mockSession,
        players: [
          {
            ...mockSession.players[0],
            answers: [{ questionIndex: 0, answerIndex: 1, isCorrect: true, score: 1000 }],
            totalScore: 1000
          }
        ]
      };
    };

    const res = {
      statusCode: 200,
      data: null,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.data = payload; return this; }
    };

    await gameController.submitAnswer({
      body: { pin: '112233', playerName: 'Rohan', answerIndex: 1 },
      app: { get: () => null }
    }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.equal(findOneAndUpdateCalled, true, 'findOneAndUpdate should have been used for atomic update');
    assert.equal(atomicQuery.pin, '112233');
    assert.equal(atomicQuery.status, 'active');
    assert.ok(atomicQuery.players.$elemMatch, 'query should use $elemMatch on players');
    assert.ok(atomicUpdate.$push['players.$.answers'], 'update should push to players.$.answers');
    assert.ok(atomicUpdate.$inc['players.$.totalScore'], 'update should inc players.$.totalScore');
  } finally {
    Object.defineProperty(mongoose.connection, 'readyState', { value: originalConnection, configurable: true });
    GameSession.findOne = originalFindOne;
    GameSession.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

