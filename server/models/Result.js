const mongoose = require('mongoose');

const playerResultSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    fullName: {
        type: String
    },
    nickname: {
        type: String
    },
    mobileNumber: {
        type: String
    },
    totalScore: {
        type: Number,
        default: 0
    },
    correctAnswers: {
        type: Number,
        default: 0
    },
    wrongAnswers: {
        type: Number,
        default: 0
    },
    unansweredQuestions: {
        type: Number,
        default: 0
    },
    rank: {
        type: Number,
        default: 0
    },
    answers: [{
        questionIndex: Number,
        answerIndex: Number,
        isCorrect: Boolean,
        timeTaken: Number,
        score: Number
    }]
});

const resultSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GameSession',
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizTitle: {
        type: String,
        required: true
    },
    players: {
        type: [playerResultSchema],
        default: []
    },
    winner: {
        type: String,
        default: ''
    },
    totalQuestions: {
        type: Number,
        default: 0
    },
    playedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Result', resultSchema);