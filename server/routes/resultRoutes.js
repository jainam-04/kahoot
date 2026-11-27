const express = require('express');
const router = express.Router();
const {
    saveResult,
    getResultBySession,
    getMyResults,
    getResultLeaderboard,
    updatePlayerMobile
} = require('../controllers/resultController');
const { protect } = require('../middleware/authMiddleware');

router.post('/save', protect, saveResult);
router.get('/my', protect, getMyResults);
router.get('/:sessionId/leaderboard', getResultLeaderboard);
router.get('/:sessionId', getResultBySession);
router.patch('/:sessionId/player-mobile', protect, updatePlayerMobile);

module.exports = router;