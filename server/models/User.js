const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['user', 'superadmin'],
        default: 'user'
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
    securityQuestion: {
        type: String,
        required: [true, 'Please select a security question']
    },
    securityAnswer: {
        type: String,
        required: [true, 'Please provide an answer to the security question']
    },
    securityAnswerAttempts: {
        type: Number,
        default: 0
    },
    securityAnswerLockedUntil: {
        type: Date
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function() {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    if (this.isModified('securityAnswer')) {
        const salt = await bcrypt.genSalt(10);
        this.securityAnswer = await bcrypt.hash(this.securityAnswer, salt);
    }
});

// Compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Compare security answer
userSchema.methods.compareSecurityAnswer = async function(enteredAnswer) {
    return await bcrypt.compare(enteredAnswer, this.securityAnswer);
};

module.exports = mongoose.model('User', userSchema);