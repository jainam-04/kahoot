const express = require('express');
const router = express.Router();
const { getPlans, getFaqs, getPlatformStats } = require('../controllers/infoController');

// GET /api/plans
router.get('/plans', getPlans);

// GET /api/faqs
router.get('/faqs', getFaqs);

// GET /api/stats & /api/platform-stats
router.get('/stats', getPlatformStats);
router.get('/platform-stats', getPlatformStats);

module.exports = router;
