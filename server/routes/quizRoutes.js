const express = require('express');
const router = express.Router();
const {
    createQuiz,
    listQuizzes,
    getQuiz,
    deleteQuiz,
    getMyQuizzes,
    updateQuiz,
    generateAIQuestions
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.get('/list', listQuizzes);
router.get('/user/myquizzes', protect, getMyQuizzes);
router.post('/generate-ai', protect, generateAIQuestions);
router.get('/:id', getQuiz);
router.post('/create', protect, createQuiz);
router.put('/:id', protect, updateQuiz);
router.delete('/:id', protect, deleteQuiz);

module.exports = router;