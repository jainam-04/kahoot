const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionIndex: {
        type: Number,
        required: true
    },
    answerIndex: {
        type: Number,
        default: -1
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    timeTaken: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: 0
    }
});

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    fullName: {
        type: String,
        default: '',
        trim: true
    },
    nickname: {
        type: String,
        default: '',
        trim: true
    },
    mobileNumber: {
        type: String,
        default: '',
        trim: true
    },
    avatar: {
        type: String,
        default: '👤'
    },
    totalScore: {
        type: Number,
        default: 0
    },
    answers: {
        type: [answerSchema],
        default: []
    },
    rank: {
        type: Number,
        default: 0
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

const gameSessionSchema = new mongoose.Schema({
    pin: {
        type: String,
        required: true,
        unique: true
    },
    qrCode: {
        type: String,
        default: ''
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
    players: {
        type: [playerSchema],
        default: []
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'finished'],
        default: 'waiting'
    },
    currentQuestionIndex: {
        type: Number,
        default: -1
    },
    questionStartTime: {
        type: Number,
        default: 0
    },
    winner: {
        type: String,
        default: ''
    },
    backgroundImage: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GameSession', gameSessionSchema);