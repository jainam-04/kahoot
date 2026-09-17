const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true
    },
    options: {
        type: [String],
        required: [true, 'Options are required'],
        validate: {
            validator: function(v) {
                return v.length === 4;
            },
            message: 'Question must have exactly 4 options'
        }
    },
    correctAnswer: {
        type: Number,
        required: [true, 'Correct answer is required'],
        min: 0,
        max: 3
    },
    timeLimit: {
        type: Number,
        default: 60
    },
    backgroundImage: {
        type: String,
        default: ''
    }
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quiz title is required'],
        trim: true
    },
    category: {
        type: String,
        default: 'general knowledge',
        trim: true,
        lowercase: true
    },
    organizationName: {
        type: String,
        trim: true,
        default: ''
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questions: {
        type: [questionSchema],
        validate: {
            validator: function(v) {
                return v.length >= 1;
            },
            message: 'Quiz must have at least 1 question'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    backgroundImage: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);