const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getProfile,
    forgotPassword,
    verifySecurityAnswer,
    resetPassword,
    deleteAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-security-answer', verifySecurityAnswer);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;