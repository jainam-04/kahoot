const User = require('../models/User');
const Quiz = require('../models/Quiz');
const GameSession = require('../models/GameSession');
const Result = require('../models/Result');
const Plan = require('../models/Plan');
const FAQ = require('../models/FAQ');

// @desc    Get complete Super Admin dashboard overview stats
// @route   GET /api/admin/stats
// @access  Public (or Admin protected)
exports.getAdminOverviewStats = async (req, res) => {
    try {
        const [
            usersCount,
            quizzesCount,
            sessionsCount,
            resultsCount,
            plansCount,
            faqsCount
        ] = await Promise.all([
            User.countDocuments(),
            Quiz.countDocuments(),
            GameSession.countDocuments(),
            Result.countDocuments(),
            Plan.countDocuments(),
            FAQ.countDocuments()
        ]);

        // Category breakdown from Quizzes
        const categoryStats = await Quiz.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Game sessions breakdown by status
        const sessionStatusStats = await GameSession.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Recent users/hosts
        const recentHosts = await User.find({}, '-password -securityAnswer')
            .sort({ createdAt: -1 })
            .limit(5);

        // Recent game sessions
        const recentSessions = await GameSession.find({})
            .populate('quizId', 'title category')
            .populate('hostId', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        // Total participants across all results
        const totalParticipantsAgg = await Result.aggregate([
            { $project: { playerCount: { $size: { $ifNull: ["$players", []] } } } },
            { $group: { _id: null, total: { $sum: "$playerCount" } } }
        ]);
        const totalParticipants = totalParticipantsAgg[0]?.total || 0;

        res.status(200).json({
            success: true,
            data: {
                totalUsers: usersCount,
                totalQuizzes: quizzesCount,
                totalSessions: sessionsCount,
                totalResults: resultsCount,
                totalPlans: plansCount,
                totalFaqs: faqsCount,
                totalParticipants,
                categoryStats,
                sessionStatusStats,
                recentHosts,
                recentSessions
            }
        });
    } catch (error) {
        console.error('Error fetching admin overview stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin overview statistics',
            error: error.message
        });
    }
};

// @desc    Get list of hosts/users with search & pagination
// @route   GET /api/admin/hosts
// @access  Public (or Admin)
exports.getHostsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const query = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const total = await User.countDocuments(query);
        const users = await User.find(query, '-password -securityAnswer')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Populate quiz and session counts for each user
        const usersWithStats = await Promise.all(users.map(async (u) => {
            const quizCount = await Quiz.countDocuments({ createdBy: u._id });
            const sessionCount = await GameSession.countDocuments({ hostId: u._id });
            return {
                ...u,
                quizCount,
                sessionCount
            };
        }));

        res.status(200).json({
            success: true,
            count: usersWithStats.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: usersWithStats
        });
    } catch (error) {
        console.error('Error fetching hosts list:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch hosts list',
            error: error.message
        });
    }
};

// @desc    Get list of quizzes with host info
// @route   GET /api/admin/quizzes
// @access  Public (or Admin)
exports.getQuizzesList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const category = req.query.category || '';
        const skip = (page - 1) * limit;

        const query = {};
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category.toLowerCase();
        }

        const total = await Quiz.countDocuments(query);
        const quizzes = await Quiz.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const formattedQuizzes = quizzes.map(q => ({
            _id: q._id,
            title: q.title,
            category: q.category,
            questionsCount: q.questions ? q.questions.length : 0,
            createdBy: q.createdBy ? {
                _id: q.createdBy._id,
                name: q.createdBy.name,
                email: q.createdBy.email
            } : null,
            isActive: q.isActive,
            createdAt: q.createdAt
        }));

        res.status(200).json({
            success: true,
            count: formattedQuizzes.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: formattedQuizzes
        });
    } catch (error) {
        console.error('Error fetching quizzes list:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quizzes list',
            error: error.message
        });
    }
};

// @desc    Get list of game sessions
// @route   GET /api/admin/sessions
// @access  Public (or Admin)
exports.getSessionsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status || '';
        const skip = (page - 1) * limit;

        const query = status ? { status } : {};

        const total = await GameSession.countDocuments(query);
        const sessions = await GameSession.find(query)
            .populate('quizId', 'title category')
            .populate('hostId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const formattedSessions = sessions.map(s => ({
            _id: s._id,
            pin: s.pin,
            status: s.status,
            quizTitle: s.quizId ? s.quizId.title : 'Unknown Quiz',
            quizCategory: s.quizId ? s.quizId.category : 'general',
            hostName: s.hostId ? s.hostId.name : 'Unknown Host',
            hostEmail: s.hostId ? s.hostId.email : '',
            playersCount: s.players ? s.players.length : 0,
            createdAt: s.createdAt
        }));

        res.status(200).json({
            success: true,
            count: formattedSessions.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: formattedSessions
        });
    } catch (error) {
        console.error('Error fetching game sessions list:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch game sessions list',
            error: error.message
        });
    }
};

// @desc    Get list of results
// @route   GET /api/admin/results
// @access  Public (or Admin)
exports.getResultsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await Result.countDocuments();
        const results = await Result.find({})
            .populate('quizId', 'title category')
            .populate('hostId', 'name email')
            .sort({ playedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const formattedResults = results.map(r => ({
            _id: r._id,
            quizTitle: r.quizTitle || (r.quizId ? r.quizId.title : 'Quiz'),
            hostName: r.hostId ? r.hostId.name : 'Host',
            hostEmail: r.hostId ? r.hostId.email : '',
            winner: r.winner || 'N/A',
            playersCount: r.players ? r.players.length : 0,
            totalQuestions: r.totalQuestions || 0,
            playedAt: r.playedAt || r.createdAt
        }));

        res.status(200).json({
            success: true,
            count: formattedResults.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: formattedResults
        });
    } catch (error) {
        console.error('Error fetching results list:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch game results list',
            error: error.message
        });
    }
};

// @desc    Manage Plans (CRUD)
// @route   GET, POST, PUT, DELETE /api/admin/plans
exports.getPlans = async (req, res) => {
    try {
        const plans = await Plan.find().sort({ displayOrder: 1, createdAt: -1 });
        res.status(200).json({ success: true, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPlan = async (req, res) => {
    try {
        const plan = await Plan.create(req.body);
        res.status(201).json({ success: true, data: plan });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndDelete(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        res.status(200).json({ success: true, message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Manage FAQs (CRUD)
// @route   GET, POST, PUT, DELETE /api/admin/faqs
exports.getFaqs = async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ displayOrder: 1, createdAt: -1 });
        res.status(200).json({ success: true, data: faqs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createFaq = async (req, res) => {
    try {
        const faq = await FAQ.create(req.body);
        res.status(201).json({ success: true, data: faq });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateFaq = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
        res.status(200).json({ success: true, data: faq });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteFaq = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndDelete(req.params.id);
        if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
        res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
