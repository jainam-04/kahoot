const User = require('../models/User');
const Quiz = require('../models/Quiz');
const GameSession = require('../models/GameSession');
const Result = require('../models/Result');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'quizarena_secret_key_2024',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

const register = async (req, res) => {
    try {
        const { name, email, password, securityQuestion, securityAnswer } = req.body;

        if (!name || !email || !password || !securityQuestion || !securityAnswer) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, password, security question and answer'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();
        const trimmedAnswer = securityAnswer.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please login.'
            });
        }

        const user = await User.create({ 
            name: trimmedName, 
            email: normalizedEmail, 
            password,
            securityQuestion,
            securityAnswer: trimmedAnswer
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registered successfully',
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(200).json({
                success: false,
                message: 'No account found with this email.'
            });
        }

        // Auto-clear lockout if duration has passed
        if (user.securityAnswerLockedUntil && user.securityAnswerLockedUntil <= Date.now()) {
            user.securityAnswerAttempts = 0;
            user.securityAnswerLockedUntil = undefined;
            await user.save({ validateBeforeSave: false });
        }

        const isLocked = Boolean(user.securityAnswerLockedUntil && user.securityAnswerLockedUntil > Date.now());
        const attempts = user.securityAnswerAttempts || 0;
        const maxAttempts = 5;
        const remainingAttempts = Math.max(0, maxAttempts - attempts);

        return res.status(200).json({
            success: true,
            securityQuestion: user.securityQuestion,
            message: 'Security question retrieved successfully',
            attempts,
            maxAttempts,
            remainingAttempts,
            isLocked,
            lockedUntil: user.securityAnswerLockedUntil ? new Date(user.securityAnswerLockedUntil).getTime() : null
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error occurred. Please try again later.'
        });
    }
};

const verifySecurityAnswer = async (req, res) => {
    try {
        const { email, answer } = req.body;

        if (!email || !answer) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and answer'
            });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        const maxAttempts = 5;

        // Check if locked out
        if (user.securityAnswerLockedUntil) {
            if (user.securityAnswerLockedUntil > Date.now()) {
                const lockedUntilMs = new Date(user.securityAnswerLockedUntil).getTime();
                return res.status(403).json({
                    success: false,
                    isLocked: true,
                    attempts: maxAttempts,
                    maxAttempts,
                    remainingAttempts: 0,
                    lockedUntil: lockedUntilMs,
                    message: 'Maximum attempts reached. Account temporarily locked for 2 minutes.'
                });
            } else {
                // Lock expired
                user.securityAnswerAttempts = 0;
                user.securityAnswerLockedUntil = undefined;
                await user.save({ validateBeforeSave: false });
            }
        }

        const trimmedAnswer = answer.trim().toLowerCase();
        const isMatch = await user.compareSecurityAnswer(trimmedAnswer);

        if (!isMatch) {
            user.securityAnswerAttempts = (user.securityAnswerAttempts || 0) + 1;
            
            if (user.securityAnswerAttempts >= maxAttempts) {
                user.securityAnswerLockedUntil = Date.now() + 2 * 60 * 1000; // 2 mins lock
                await user.save({ validateBeforeSave: false });
                const lockedUntilMs = new Date(user.securityAnswerLockedUntil).getTime();
                return res.status(403).json({
                    success: false,
                    isLocked: true,
                    attempts: maxAttempts,
                    maxAttempts,
                    remainingAttempts: 0,
                    lockedUntil: lockedUntilMs,
                    message: 'Maximum attempts reached. Account temporarily locked for 2 minutes.'
                });
            }
            
            await user.save({ validateBeforeSave: false });
            const remaining = maxAttempts - user.securityAnswerAttempts;
            return res.status(400).json({
                success: false,
                isLocked: false,
                attempts: user.securityAnswerAttempts,
                maxAttempts,
                remainingAttempts: remaining,
                message: `Incorrect security answer. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
            });
        }

        // Answer is correct, reset attempts
        user.securityAnswerAttempts = 0;
        user.securityAnswerLockedUntil = undefined;
        
        // Generate a temporary reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins validity
        
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Security answer verified successfully!',
            resetToken,
            attempts: 0,
            maxAttempts,
            remainingAttempts: maxAttempts,
            isLocked: false
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error occurred. Please try again later.'
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, resetToken, newPassword, confirmPassword, password } = req.body;
        const targetPassword = newPassword || password;

        if (!email || !resetToken || !targetPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, reset token, and new password'
            });
        }

        if (confirmPassword && targetPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (targetPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                isExpired: true,
                message: 'Session or reset token expired. Please restart the password recovery process.'
            });
        }

        user.password = targetPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // Reset attempts after successful password reset
        user.securityAnswerAttempts = 0;
        user.securityAnswerLockedUntil = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error occurred. Please try again later.'
        });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to confirm account deletion'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect password. Account deletion aborted.'
            });
        }

        // Cascade delete user-owned data
        await Promise.all([
            Quiz.deleteMany({ createdBy: userId }),
            GameSession.deleteMany({ hostId: userId }),
            Result.deleteMany({ hostId: userId }),
            User.findByIdAndDelete(userId)
        ]);

        res.status(200).json({
            success: true,
            message: 'Account and all associated quizzes and game sessions deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete account'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    forgotPassword,
    verifySecurityAnswer,
    resetPassword,
    deleteAccount
};