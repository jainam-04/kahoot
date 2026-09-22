const express = require('express');
const router = express.Router();
const {
    getAdminOverviewStats,
    getHostsList,
    getQuizzesList,
    getSessionsList,
    getResultsList,
    getPlans,
    createPlan,
    updatePlan,
    deletePlan,
    getFaqs,
    createFaq,
    updateFaq,
    deleteFaq
} = require('../controllers/adminController');

// Super Admin Overview
router.get('/stats', getAdminOverviewStats);

// Database collections read routes
router.get('/hosts', getHostsList);
router.get('/quizzes', getQuizzesList);
router.get('/sessions', getSessionsList);
router.get('/results', getResultsList);

// Subscription Plans CRUD
router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// FAQs CRUD
router.get('/faqs', getFaqs);
router.post('/faqs', createFaq);
router.put('/faqs/:id', updateFaq);
router.delete('/faqs/:id', deleteFaq);

module.exports = router;
