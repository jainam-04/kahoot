const Result = require('../models/Result');
const GameSession = require('../models/GameSession');

const isUnansweredAnswer = (answer) => {
    if (!answer) return true;

    const value = answer.answerIndex;
    return value === null || value === undefined || value === '' || value === -1 || Number.isNaN(Number(value));
};

const saveResult = async (req, res) => {
    try {
        const { sessionId } = req.body;

        const game = await GameSession.findById(sessionId)
            .populate('quizId');

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game session not found'
            });
        }

        const existingResult = await Result.findOne({ sessionId });
        if (existingResult) {
            return res.status(400).json({
                success: false,
                message: 'Result already saved'
            });
        }

        const sortedPlayers = [...game.players].sort((a, b) => {
            if (a.totalScore !== b.totalScore) {
                return b.totalScore - a.totalScore;
            }
            
            const aCorrect = a.answers.filter(ans => ans.isCorrect).length;
            const bCorrect = b.answers.filter(ans => ans.isCorrect).length;
            
            if (aCorrect !== bCorrect) {
                return bCorrect - aCorrect;
            }
            
            const aTime = a.answers.reduce((acc, ans) => acc + (ans.isCorrect ? ans.timeTaken : 0), 0);
            const bTime = b.answers.reduce((acc, ans) => acc + (ans.isCorrect ? ans.timeTaken : 0), 0);
            
            if (aTime !== bTime) {
                return aTime - bTime;
            }
            
            return new Date(a.joinedAt || 0) - new Date(b.joinedAt || 0);
        });

        const playerResults = sortedPlayers.map((player, index) => {
            const submittedAnswers = player.answers.filter(a => !isUnansweredAnswer(a));
            const correct = submittedAnswers.filter(a => a.isCorrect).length;
            const wrong = submittedAnswers.filter(a => !a.isCorrect).length;
            const unanswered = Math.max(0, game.quizId.questions.length - submittedAnswers.length);
            const cleanFullName = player.fullName || player.name || `Player ${index + 1}`;
            const cleanMobile = player.mobileNumber || '';
            const cleanNickname = player.nickname || player.name || cleanFullName;

            return {
                name: player.name || cleanFullName,
                fullName: cleanFullName,
                nickname: cleanNickname,
                mobileNumber: cleanMobile,
                totalScore: player.totalScore || 0,
                correctAnswers: correct,
                wrongAnswers: wrong,
                unansweredQuestions: unanswered,
                rank: index + 1,
                answers: player.answers || []
            };
        });

        const result = await Result.create({
            sessionId: game._id,
            quizId: game.quizId._id,
            hostId: game.hostId,
            quizTitle: game.quizId.title,
            organizationName: game.quizId.organizationName || '',
            players: playerResults,
            winner: sortedPlayers[0]?.fullName || sortedPlayers[0]?.name || '',
            totalQuestions: game.quizId.questions.length
        });

        res.status(201).json({
            success: true,
            message: 'Result saved successfully',
            result: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getResultBySession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        let result = await Result.findOne({ sessionId })
            .populate('quizId', 'title category organizationName')
            .populate('hostId', 'name email');

        if (!result) {
            const mongoose = require('mongoose');
            let game = null;
            if (mongoose.Types.ObjectId.isValid(sessionId)) {
                game = await GameSession.findById(sessionId).populate('quizId').populate('hostId');
            }
            if (!game) {
                game = await GameSession.findOne({ pin: sessionId }).populate('quizId').populate('hostId');
            }
            if (game) {
                result = await Result.findOne({ sessionId: game._id })
                    .populate('quizId', 'title category organizationName')
                    .populate('hostId', 'name email');

                // Auto-create Result document if it doesn't exist yet
                if (!result && game.quizId) {
                    const sortedPlayers = [...(game.players || [])].sort((a, b) => {
                        if (a.totalScore !== b.totalScore) {
                            return b.totalScore - a.totalScore;
                        }
                        const aCorrect = (a.answers || []).filter(ans => ans.isCorrect).length;
                        const bCorrect = (b.answers || []).filter(ans => ans.isCorrect).length;
                        if (aCorrect !== bCorrect) {
                            return bCorrect - aCorrect;
                        }
                        const aTime = (a.answers || []).reduce((acc, ans) => acc + (ans.isCorrect ? ans.timeTaken : 0), 0);
                        const bTime = (b.answers || []).reduce((acc, ans) => acc + (ans.isCorrect ? ans.timeTaken : 0), 0);
                        if (aTime !== bTime) {
                            return aTime - bTime;
                        }
                        return new Date(a.joinedAt || 0) - new Date(b.joinedAt || 0);
                    });

                    const playerResults = sortedPlayers.map((player, index) => {
                        const submittedAnswers = (player.answers || []).filter(a => !isUnansweredAnswer(a));
                        const correct = submittedAnswers.filter(a => a.isCorrect).length;
                        const wrong = submittedAnswers.filter(a => !a.isCorrect).length;
                        const totalQ = game.quizId.questions ? game.quizId.questions.length : 0;
                        const unanswered = Math.max(0, totalQ - submittedAnswers.length);
                        const cleanFullName = player.fullName || player.name || `Player ${index + 1}`;
                        const cleanMobile = player.mobileNumber || '';
                        const cleanNickname = player.nickname || player.name || cleanFullName;

                        return {
                            name: player.name || cleanFullName,
                            fullName: cleanFullName,
                            nickname: cleanNickname,
                            mobileNumber: cleanMobile,
                            totalScore: player.totalScore || 0,
                            correctAnswers: correct,
                            wrongAnswers: wrong,
                            unansweredQuestions: unanswered,
                            rank: index + 1,
                            answers: player.answers || []
                        };
                    });

                    result = await Result.create({
                        sessionId: game._id,
                        quizId: game.quizId._id,
                        hostId: game.hostId?._id || game.hostId,
                        quizTitle: game.quizId.title || 'Quiz Match',
                        organizationName: game.quizId.organizationName || '',
                        players: playerResults,
                        winner: sortedPlayers[0]?.fullName || sortedPlayers[0]?.name || '',
                        totalQuestions: game.quizId.questions ? game.quizId.questions.length : 0
                    });

                    result = await Result.findById(result._id)
                        .populate('quizId', 'title category organizationName')
                        .populate('hostId', 'name email');
                }
            }
        }

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Result not found'
            });
        }

        res.status(200).json({
            success: true,
            result: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ hostId: req.user.id })
            .populate('quizId', 'title category organizationName')
            .sort({ playedAt: -1 });

        res.status(200).json({
            success: true,
            count: results.length,
            results: results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getResultLeaderboard = async (req, res) => {
    try {
        const { sessionId } = req.params;

        let result = await Result.findOne({ sessionId });
        if (!result) {
            const game = await GameSession.findOne({ pin: sessionId });
            if (game) {
                result = await Result.findOne({ sessionId: game._id });
            }
        }

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Result not found'
            });
        }

        const leaderboard = result.players.map(player => ({
            rank: player.rank,
            name: player.name,
            fullName: player.fullName || player.name,
            nickname: player.nickname || player.name,
            mobileNumber: player.mobileNumber || '',
            totalScore: player.totalScore,
            correctAnswers: player.correctAnswers,
            wrongAnswers: player.wrongAnswers,
            unansweredQuestions: player.unansweredQuestions !== undefined ? player.unansweredQuestions : (result.totalQuestions - player.correctAnswers - player.wrongAnswers),
            totalAnswers: player.correctAnswers + player.wrongAnswers
        }));

        res.status(200).json({
            success: true,
            winner: result.winner,
            quizTitle: result.quizTitle,
            totalQuestions: result.totalQuestions,
            playedAt: result.playedAt,
            leaderboard: leaderboard
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    saveResult,
    getResultBySession,
    getMyResults,
    getResultLeaderboard
};