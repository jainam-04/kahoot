const Result = require('../models/Result');
const GameSession = require('../models/GameSession');
const Quiz = require('../models/Quiz');

const isUnansweredAnswer = (answer) => {
    if (!answer) return true;

    const value = answer.answerIndex;
    return value === null || value === undefined || value === '' || value === -1 || Number.isNaN(Number(value));
};

const createResultDocFromGameSession = async (game) => {
    if (!game) return null;
    if (!game.quizId || !game.quizId.questions) {
        game = await GameSession.findById(game._id).populate('quizId').populate('hostId');
    }
    if (!game || !game.quizId) return null;

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

    const totalQ = game.quizId.questions ? game.quizId.questions.length : 0;

    const playerResults = sortedPlayers.map((player, index) => {
        const submittedAnswers = (player.answers || []).filter(a => !isUnansweredAnswer(a));
        const correct = submittedAnswers.filter(a => a.isCorrect).length;
        const wrong = submittedAnswers.filter(a => !a.isCorrect).length;
        const unanswered = Math.max(0, totalQ - submittedAnswers.length);
        const cleanFullName = player.fullName || player.name || `Player ${index + 1}`;
        const cleanMobile = player.mobileNumber || player.phone || player.phoneNumber || player.mobile || player.contactNumber || '';
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
        hostId: game.hostId?._id || game.hostId,
        quizTitle: game.quizId.title || 'Quiz Match',
        organizationName: game.quizId.organizationName || '',
        players: playerResults,
        winner: sortedPlayers[0]?.fullName || sortedPlayers[0]?.name || '',
        totalQuestions: totalQ,
        playedAt: game.createdAt || new Date()
    });

    return result;
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

        const result = await createResultDocFromGameSession(game);

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
        const mongoose = require('mongoose');
        const isValidObjectId = mongoose.Types.ObjectId.isValid(sessionId);

        let result = null;
        if (isValidObjectId) {
            result = await Result.findOne({
                $or: [{ _id: sessionId }, { sessionId: sessionId }]
            })
            .populate('quizId', 'title category organizationName')
            .populate('hostId', 'name email');
        } else {
            result = await Result.findOne({ sessionId })
                .populate('quizId', 'title category organizationName')
                .populate('hostId', 'name email');
        }

        if (!result) {
            let game = null;
            if (isValidObjectId) {
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
                    const newResult = await createResultDocFromGameSession(game);
                    if (newResult) {
                        result = await Result.findById(newResult._id)
                            .populate('quizId', 'title category organizationName')
                            .populate('hostId', 'name email');
                    }
                }
            }
        }

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Result not found'
            });
        }

        // Automatic Backfill: If any players in result are missing mobileNumber, try to recover from GameSession or other records
        const hasMissingMobile = result.players?.some(p => !p.mobileNumber || p.mobileNumber.trim() === '');
        if (hasMissingMobile) {
            let backfilled = false;

            // 1. Try to recover from the associated GameSession
            const sessionGame = await GameSession.findById(result.sessionId).lean().catch(() => null)
                || (isValidObjectId ? await GameSession.findById(sessionId).lean().catch(() => null) : null)
                || await GameSession.findOne({ pin: sessionId }).lean().catch(() => null);

            if (sessionGame && Array.isArray(sessionGame.players)) {
                for (const p of result.players) {
                    if (!p.mobileNumber || p.mobileNumber.trim() === '') {
                        const targetName = (p.name || '').trim().toLowerCase();
                        const targetFull = (p.fullName || '').trim().toLowerCase();
                        const targetNick = (p.nickname || '').trim().toLowerCase();

                        const matched = sessionGame.players.find(gp => {
                            const gpMobile = (gp.mobileNumber || gp.phone || gp.phoneNumber || '').toString().trim();
                            if (!gpMobile) return false;
                            const gpName = (gp.name || '').trim().toLowerCase();
                            const gpFull = (gp.fullName || '').trim().toLowerCase();
                            const gpNick = (gp.nickname || '').trim().toLowerCase();

                            return (targetName && (gpName === targetName || gpFull === targetName || gpNick === targetName))
                                || (targetFull && (gpName === targetFull || gpFull === targetFull || gpNick === targetFull))
                                || (targetNick && (gpName === targetNick || gpFull === targetNick || gpNick === targetNick));
                        });

                        if (matched) {
                            const foundNum = (matched.mobileNumber || matched.phone || matched.phoneNumber || '').toString().trim();
                            if (foundNum) {
                                p.mobileNumber = foundNum;
                                backfilled = true;
                            }
                        }
                    }
                }
            }

            // 2. If still missing, check across any other GameSession in DB where a player with the same name entered a phone number
            for (const p of result.players) {
                if (!p.mobileNumber || p.mobileNumber.trim() === '') {
                    const searchName = (p.fullName || p.name || '').trim();
                    if (searchName && searchName.length >= 2) {
                        const escSearch = searchName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                        const searchRegex = new RegExp('^' + escSearch + '$', 'i');

                        const otherSession = await GameSession.findOne({
                            'players': {
                                $elemMatch: {
                                    $or: [{ name: searchRegex }, { fullName: searchRegex }, { nickname: searchRegex }],
                                    mobileNumber: { $exists: true, $nin: ['', null] }
                                }
                            }
                        }).select('players').lean().catch(() => null);

                        if (otherSession && Array.isArray(otherSession.players)) {
                            const match = otherSession.players.find(op => {
                                const m = (op.mobileNumber || '').toString().trim();
                                if (!m) return false;
                                const opName = (op.name || '').trim().toLowerCase();
                                const opFull = (op.fullName || '').trim().toLowerCase();
                                const opNick = (op.nickname || '').trim().toLowerCase();
                                const sLower = searchName.toLowerCase();
                                return opName === sLower || opFull === sLower || opNick === sLower;
                            });
                            if (match) {
                                p.mobileNumber = (match.mobileNumber || '').toString().trim();
                                backfilled = true;
                            }
                        }

                        // Also check other Result documents
                        if (!p.mobileNumber || p.mobileNumber.trim() === '') {
                            const otherResult = await Result.findOne({
                                _id: { $ne: result._id },
                                'players': {
                                    $elemMatch: {
                                        $or: [{ name: searchRegex }, { fullName: searchRegex }, { nickname: searchRegex }],
                                        mobileNumber: { $exists: true, $nin: ['', null] }
                                    }
                                }
                            }).select('players').lean().catch(() => null);

                            if (otherResult && Array.isArray(otherResult.players)) {
                                const match = otherResult.players.find(op => {
                                    const m = (op.mobileNumber || '').toString().trim();
                                    if (!m) return false;
                                    const opName = (op.name || '').trim().toLowerCase();
                                    const opFull = (op.fullName || '').trim().toLowerCase();
                                    const opNick = (op.nickname || '').trim().toLowerCase();
                                    const sLower = searchName.toLowerCase();
                                    return opName === sLower || opFull === sLower || opNick === sLower;
                                });
                                if (match) {
                                    p.mobileNumber = (match.mobileNumber || '').toString().trim();
                                    backfilled = true;
                                }
                            }
                        }
                    }
                }
            }

            // Persist backfilled numbers into the Result document
            if (backfilled) {
                await Result.updateOne(
                    { _id: result._id },
                    { $set: { players: result.players } }
                ).catch(err => console.error('Error persisting backfilled mobile numbers:', err.message));
            }
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
        const hostId = req.user.id;

        // 1. Fetch existing Result documents session IDs
        const existingResults = await Result.find({ hostId }).select('sessionId');
        const existingSessionIds = existingResults.map(r => r.sessionId.toString());

        // 2. Find any played GameSessions for this host that don't have a Result document yet
        const unSavedSessions = await GameSession.find({
            hostId,
            _id: { $nin: existingSessionIds },
            'players.answers.0': { $exists: true }
        }).populate('quizId').populate('hostId');

        // 3. Auto-create Result documents for any un-saved sessions with player answers
        if (unSavedSessions.length > 0) {
            for (const session of unSavedSessions) {
                try {
                    await createResultDocFromGameSession(session);
                } catch (createErr) {
                    console.error('Error auto-creating result for session:', session._id, createErr.message);
                }
            }
        }

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
        const mongoose = require('mongoose');
        const isValidObjectId = mongoose.Types.ObjectId.isValid(sessionId);

        let result = null;
        if (isValidObjectId) {
            result = await Result.findOne({
                $or: [{ _id: sessionId }, { sessionId: sessionId }]
            });
        } else {
            result = await Result.findOne({ sessionId });
        }

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

const updatePlayerMobile = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { playerName, mobileNumber } = req.body;
        const mongoose = require('mongoose');
        const isValidObjectId = mongoose.Types.ObjectId.isValid(sessionId);

        const cleanMobile = (mobileNumber || '').toString().trim();
        const cleanPlayerName = (playerName || '').toString().trim();

        if (!cleanPlayerName) {
            return res.status(400).json({
                success: false,
                message: 'Player name is required'
            });
        }

        let result = null;
        if (isValidObjectId) {
            result = await Result.findOne({
                $or: [{ _id: sessionId }, { sessionId: sessionId }]
            });
        } else {
            result = await Result.findOne({ sessionId });
        }

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Result document not found'
            });
        }

        // Host authorization check
        if (result.hostId && result.hostId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only the host who organized this match can update player details'
            });
        }

        const target = cleanPlayerName.toLowerCase();
        const player = result.players?.find(p => {
            const pName = (p.name || '').trim().toLowerCase();
            const pFull = (p.fullName || '').trim().toLowerCase();
            const pNick = (p.nickname || '').trim().toLowerCase();
            return pName === target || pFull === target || pNick === target;
        });

        if (!player) {
            return res.status(404).json({
                success: false,
                message: `Player '${cleanPlayerName}' not found in rankings`
            });
        }

        player.mobileNumber = cleanMobile;
        await Result.updateOne(
            { _id: result._id },
            { $set: { players: result.players } }
        );

        // Also update GameSession if available
        if (result.sessionId) {
            GameSession.updateOne(
                { _id: result.sessionId, 'players.name': player.name },
                { $set: { 'players.$.mobileNumber': cleanMobile } }
            ).catch(() => {});
        }

        res.status(200).json({
            success: true,
            message: `Updated phone number for ${player.fullName || player.name}`,
            player: player
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
    getResultLeaderboard,
    updatePlayerMobile
};