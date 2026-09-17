const Quiz = require('../models/Quiz');
const GameSession = require('../models/GameSession');

const createQuiz = async (req, res) => {
    try {
        const { title, category, description, organizationName, questions, backgroundImage } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Please provide quiz title'
            });
        }

        if (!questions || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least 1 question'
            });
        }

        for (let i = 0; i < questions.length; i++) {
            if (questions[i].options.length !== 4) {
                return res.status(400).json({
                    success: false,
                    message: `Question ${i + 1} must have exactly 4 options`
                });
            }
        }

        const quiz = await Quiz.create({
            title,
            category,
            description,
            organizationName,
            questions,
            backgroundImage: backgroundImage || '',
            createdBy: req.user.id
        });

        console.log('[CREATE QUIZ] Saved backgroundImage length:', (backgroundImage || '').length);
        console.log('[CREATE QUIZ] backgroundImage preview:', (backgroundImage || '').substring(0, 120));

        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            quiz: quiz
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const listQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ isActive: true })
            .populate('createdBy', 'name email')
            .select('-questions');

        res.status(200).json({
            success: true,
            count: quizzes.length,
            quizzes: quizzes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        res.status(200).json({
            success: true,
            quiz: quiz
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        console.log('[DELETE QUIZ DEBUG]', {
            quizCreatedBy: quiz.createdBy,
            quizCreatedByStr: quiz.createdBy?.toString(),
            reqUserId: req.user?.id,
            reqUser_idStr: req.user?._id?.toString()
        });

        const createdByStr = quiz.createdBy?.toString();
        const reqUserIdStr = req.user?._id?.toString();

        if (createdByStr !== reqUserIdStr) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this quiz'
            });
        }

        quiz.isActive = false;
        await quiz.save();

        // Also clean up any active or waiting game sessions for this quiz
        await GameSession.updateMany(
            { quizId: quiz._id, status: { $ne: 'finished' } },
            { $set: { status: 'finished' } }
        );

        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({
            createdBy: req.user.id,
            isActive: true
        });

        res.status(200).json({
            success: true,
            count: quizzes.length,
            quizzes: quizzes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        const createdByStr = quiz.createdBy?.toString();
        const reqUserIdStr = req.user?._id?.toString();
        if (createdByStr !== reqUserIdStr) {
            return res.status(401).json({ success: false, message: 'Not authorized to edit this quiz' });
        }

        const { title, category, description, organizationName, questions, backgroundImage } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: 'Please provide quiz title' });
        }
        if (!questions || questions.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide at least 1 question' });
        }
        for (let i = 0; i < questions.length; i++) {
            if (questions[i].options.length !== 4) {
                return res.status(400).json({ success: false, message: `Question ${i + 1} must have exactly 4 options` });
            }
        }

        quiz.title          = title;
        quiz.category       = category || quiz.category;
        quiz.description    = description || '';
        quiz.organizationName = organizationName || '';
        quiz.questions      = questions;
        quiz.backgroundImage = backgroundImage || '';
        await quiz.save();

        res.status(200).json({ success: true, message: 'Quiz updated successfully', quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createQuiz,
    listQuizzes,
    getQuiz,
    deleteQuiz,
    getMyQuizzes,
    updateQuiz
};