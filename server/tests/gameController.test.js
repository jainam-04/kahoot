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

