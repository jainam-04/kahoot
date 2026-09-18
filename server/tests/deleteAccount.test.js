const test = require('node:test');
const assert = require('node:assert/strict');
const authController = require('../controllers/authController');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const GameSession = require('../models/GameSession');
const Result = require('../models/Result');

test('deleteAccount is exported by authController', () => {
  assert.equal(typeof authController.deleteAccount, 'function');
});

test('deleteAccount returns 400 if password is not provided', async () => {
  const req = {
    user: { id: 'test_user_id_123' },
    body: {}
  };
  let statusCode = null;
  let jsonResponse = null;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    }
  };

  await authController.deleteAccount(req, res);
  assert.equal(statusCode, 400);
  assert.equal(jsonResponse.success, false);
  assert.match(jsonResponse.message, /password is required/i);
});

test('deleteAccount returns 404 if user does not exist', async () => {
  const originalFindById = User.findById;
  User.findById = async () => null;

  try {
    const req = {
      user: { id: 'nonexistent_user' },
      body: { password: 'SomePassword123' }
    };
    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      }
    };

    await authController.deleteAccount(req, res);
    assert.equal(statusCode, 404);
    assert.equal(jsonResponse.success, false);
    assert.match(jsonResponse.message, /user not found/i);
  } finally {
    User.findById = originalFindById;
  }
});

test('deleteAccount returns 400 if password does not match', async () => {
  const originalFindById = User.findById;
  User.findById = async () => ({
    _id: 'user_123',
    comparePassword: async () => false
  });

  try {
    const req = {
      user: { id: 'user_123' },
      body: { password: 'WrongPassword' }
    };
    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      }
    };

    await authController.deleteAccount(req, res);
    assert.equal(statusCode, 400);
    assert.equal(jsonResponse.success, false);
    assert.match(jsonResponse.message, /incorrect password/i);
  } finally {
    User.findById = originalFindById;
  }
});

test('deleteAccount successfully cascades deletions and returns 200 on correct password', async () => {
  const originalFindById = User.findById;
  const originalFindByIdAndDelete = User.findByIdAndDelete;
  const originalQuizDeleteMany = Quiz.deleteMany;
  const originalGameSessionDeleteMany = GameSession.deleteMany;
  const originalResultDeleteMany = Result.deleteMany;

  let quizDeletedFor = null;
  let gameSessionDeletedFor = null;
  let resultDeletedFor = null;
  let userDeletedId = null;

  User.findById = async () => ({
    _id: 'user_123',
    comparePassword: async (pwd) => pwd === 'CorrectPassword123'
  });
  User.findByIdAndDelete = async (id) => { userDeletedId = id; return true; };
  Quiz.deleteMany = async (filter) => { quizDeletedFor = filter.createdBy; return { deletedCount: 3 }; };
  GameSession.deleteMany = async (filter) => { gameSessionDeletedFor = filter.hostId; return { deletedCount: 2 }; };
  Result.deleteMany = async (filter) => { resultDeletedFor = filter.hostId; return { deletedCount: 5 }; };

  try {
    const req = {
      user: { id: 'user_123' },
      body: { password: 'CorrectPassword123' }
    };
    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      }
    };

    await authController.deleteAccount(req, res);
    assert.equal(statusCode, 200);
    assert.equal(jsonResponse.success, true);
    assert.equal(userDeletedId, 'user_123');
    assert.equal(quizDeletedFor, 'user_123');
    assert.equal(gameSessionDeletedFor, 'user_123');
    assert.equal(resultDeletedFor, 'user_123');
  } finally {
    User.findById = originalFindById;
    User.findByIdAndDelete = originalFindByIdAndDelete;
    Quiz.deleteMany = originalQuizDeleteMany;
    GameSession.deleteMany = originalGameSessionDeleteMany;
    Result.deleteMany = originalResultDeleteMany;
  }
});
