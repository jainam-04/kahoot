const GameSession = require('../models/GameSession');
const Quiz = require('../models/Quiz');
const QRCode = require('qrcode');
const os = require('os');

const getLocalIPAddress = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
};

const generatePIN = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const calculateScore = (isCorrect, timeTaken, timeLimit) => {
    if (!isCorrect) return 0;
    const timeLimitMs = timeLimit * 1000;
    const timeRemaining = timeLimitMs - timeTaken;
    const baseScore = 1000;
    const timeBonus = Math.max(0, Math.round((timeRemaining / timeLimitMs) * 1000));
    return baseScore + timeBonus;
};

const sortAndRankPlayers = (players, currentQuestionIndex) => {
    const sorted = [...players].sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
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

    return sorted.map((p, idx) => {
        const totalCorrect = p.answers.filter(a => a.isCorrect).length;
        const totalTimeCorrect = p.answers.reduce((acc, ans) => acc + (ans.isCorrect ? ans.timeTaken : 0), 0);
        const lastAnswer = p.answers.find(a => a.questionIndex === currentQuestionIndex);

        return {
            name: p.name,
            username: p.name,
            avatar: p.avatar,
            score: p.totalScore,
            totalScore: p.totalScore,
            rank: idx + 1,
            correctAnswers: totalCorrect,
            totalAnswers: p.answers.length,
            timeCorrect: (totalTimeCorrect / 1000).toFixed(2),
            lastAnswerCorrect: lastAnswer ? lastAnswer.isCorrect : false,
            pointsEarned: lastAnswer ? lastAnswer.score : 0,
            lastTimeTaken: lastAnswer ? (lastAnswer.timeTaken / 1000).toFixed(2) : '0.00'
        };
    });
};

const createGame = async (req, res) => {
    try {
        const { quizId } = req.body;

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide quiz ID'
            });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        let pin;
        let pinExists = true;
        while (pinExists) {
            pin = generatePIN();
            const existing = await GameSession.findOne({ pin });
            if (!existing) pinExists = false;
        }

        const localIP = getLocalIPAddress();
        const hostname = os.hostname();
        const joinUrl = `http://${localIP}:5173/join?pin=${pin}`;
        const hostnameUrl = `http://${hostname}.local:5173/join?pin=${pin}`;
        const qrCode = await QRCode.toDataURL(joinUrl);

        const gameSession = await GameSession.create({
            pin,
            qrCode,
            quizId,
            hostId: req.user.id,
            status: 'waiting',
            players: [],
            currentQuestionIndex: -1,
            backgroundImage: quiz.backgroundImage || ''
        });

        res.status(201).json({
            success: true,
            message: 'Game created successfully',
            game: {
                id: gameSession._id,
                pin: gameSession.pin,
                qrCode: gameSession.qrCode,
                joinUrl: joinUrl,
                hostnameUrl: hostnameUrl,
                status: gameSession.status,
                quizTitle: quiz.title,
                totalQuestions: quiz.questions.length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const joinGame = async (req, res) => {
    try {
        const { pin, playerName, avatar, fullName, mobileNumber, nickname } = req.body;

        const cleanPin = pin ? pin.toString().trim() : '';
        const cleanName = playerName ? playerName.toString().trim() : '';

        if (!cleanPin || !cleanName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide PIN and player name'
            });
        }

        const escName = cleanName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        let updatedGame = await GameSession.findOneAndUpdate(
            {
                pin: cleanPin,
                status: 'waiting',
                'players.name': { $not: new RegExp('^' + escName + '$', 'i') }
            },
            { $push: { players: { name: cleanName, avatar: avatar || 'dog', fullName, mobileNumber, nickname, totalScore: 0, answers: [] } } },
            { new: true }
        );

        if (!updatedGame) {
            const checkGame = await GameSession.findOne({ pin: cleanPin });
            if (!checkGame) {
                return res.status(404).json({
                    success: false,
                    message: 'Game session not found. Check your PIN!'
                });
            }

            const existingPlayer = checkGame.players?.find(
                p => p.name.toLowerCase() === cleanName.toLowerCase()
            );

            if (existingPlayer) {
                updatedGame = checkGame;
            } else if (checkGame.status === 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'Quiz battle is already in progress!'
                });
            } else if (checkGame.status === 'finished') {
                return res.status(400).json({
                    success: false,
                    message: 'This quiz session has ended. Ask host for a new PIN.'
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'This nickname is already taken in the lobby!'
                });
            }
        }

        const io = req.app.get('io');
        if (io) {
            io.to(`room_${pin}`).emit('player_list', {
                pin: updatedGame.pin,
                players: updatedGame.players.map(p => ({ username: p.name, avatar: p.avatar, score: p.totalScore })),
                roomStatus: updatedGame.status
            });
        }

        res.status(200).json({
            success: true,
            message: `${playerName} joined successfully!`,
            game: {
                pin: updatedGame.pin,
                playerName: playerName,
                totalPlayers: updatedGame.players.length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const startQuestion = async (req, res) => {
    try {
        const { pin } = req.body;

        const game = await GameSession.findOne({ pin })
            .populate('quizId');

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        if (game.hostId.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Only host can start questions'
            });
        }

        const nextIndex = game.currentQuestionIndex + 1;
        const quiz = game.quizId;

        if (nextIndex >= quiz.questions.length) {
            return res.status(400).json({
                success: false,
                message: 'No more questions!'
            });
        }

        const nextQuestion = quiz.questions[nextIndex];
        const questionStartTime = Date.now();

        game.currentQuestionIndex = nextIndex;
        game.questionStartTime = questionStartTime;
        game.status = 'active';
        await game.save();

        const io = req.app.get('io');
        // Use the cached backgroundImage from GameSession (most reliable), fallback to quiz
        const quizBg = game.backgroundImage || quiz.backgroundImage || '';
        if (io) {
            io.to(`room_${pin}`).emit('question_started', {
                category: quiz.category || 'general',
                quizBackgroundImage: quizBg,
                question: {
                    questionIndex: nextIndex,
                    questionNumber: nextIndex + 1,
                    totalQuestions: quiz.questions.length,
                    questionText: nextQuestion.questionText,
                    options: nextQuestion.options,
                    timeLimit: nextQuestion.timeLimit,
                    timeLimitMs: nextQuestion.timeLimit * 1000,
                    startTime: questionStartTime,
                    category: quiz.category || 'general',
                    backgroundImage: nextQuestion.backgroundImage || ''
                },
                questionNumber: nextIndex + 1,
                totalQuestions: quiz.questions.length,
                timeLeft: nextQuestion.timeLimit
            });
        }

        res.status(200).json({
            success: true,
            message: 'Question started',
            quizBackgroundImage: quizBg,
            question: {
                questionIndex: nextIndex,
                questionNumber: nextIndex + 1,
                totalQuestions: quiz.questions.length,
                questionText: nextQuestion.questionText,
                options: nextQuestion.options,
                timeLimit: nextQuestion.timeLimit,
                timeLimitMs: nextQuestion.timeLimit * 1000,
                startTime: questionStartTime,
                category: quiz.category || 'general',
                backgroundImage: nextQuestion.backgroundImage || ''
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const submitAnswer = async (req, res) => {
    try {
        const { pin, playerName, answerIndex } = req.body;

        const game = await GameSession.findOne({ pin })
            .populate('quizId');

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        if (game.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Game is not active'
            });
        }

        const now = Date.now();
        const timeTaken = now - game.questionStartTime;

        const currentQuestion = game.quizId.questions[game.currentQuestionIndex];

        const timeLimitMs = currentQuestion.timeLimit * 1000;
        if (timeTaken > timeLimitMs) {
            return res.status(400).json({
                success: false,
                message: 'Time is up!'
            });
        }

        const isCorrect = Number(answerIndex) === Number(currentQuestion.correctAnswer);
        const score = calculateScore(isCorrect, timeTaken, currentQuestion.timeLimit);

        const escName = playerName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const updatedGame = await GameSession.findOneAndUpdate(
            {
                pin,
                status: 'active',
                players: {
                    $elemMatch: {
                        name: { $regex: new RegExp('^' + escName + '$', 'i') },
                        'answers.questionIndex': { $ne: game.currentQuestionIndex }
                    }
                }
            },
            {
                $push: {
                    'players.$.answers': {
                        questionIndex: game.currentQuestionIndex,
                        answerIndex: answerIndex,
                        isCorrect: isCorrect,
                        timeTaken: timeTaken,
                        score: score
                    }
                },
                $inc: {
                    'players.$.totalScore': score
                }
            },
            { new: true }
        );

        if (!updatedGame) {
            // Find why it failed
            const checkGame = await GameSession.findOne({ pin });
            if (!checkGame) {
                return res.status(404).json({
                    success: false,
                    message: 'Game not found'
                });
            }
            if (checkGame.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'Game is not active'
                });
            }
            const player = checkGame.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
            if (!player) {
                return res.status(404).json({
                    success: false,
                    message: 'Player not found in this game'
                });
            }
            const alreadyAnswered = player.answers.find(a => a.questionIndex === checkGame.currentQuestionIndex);
            if (alreadyAnswered) {
                return res.status(400).json({
                    success: false,
                    message: 'You already answered this question!'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'Failed to submit answer'
            });
        }

        const updatedPlayer = updatedGame.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());

        const io = req.app.get('io');
        if (io) {
            const answeredCount = updatedGame.players.filter(p =>
                p.answers.some(a => a.questionIndex === updatedGame.currentQuestionIndex)
            ).length;

            io.to(`room_${pin}`).emit('player_answered', {
                username: playerName,
                answeredCount,
                totalPlayers: updatedGame.players.length
            });
        }

        res.status(200).json({
            success: true,
            isCorrect: isCorrect,
            correctAnswer: currentQuestion.correctAnswer,
            timeTaken: timeTaken,
            timeTakenSeconds: (timeTaken / 1000).toFixed(2),
            score: score,
            totalScore: updatedPlayer ? updatedPlayer.totalScore : score,
            message: isCorrect ? 'Correct Answer! 🎉' : 'Wrong Answer! ❌'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const { pin } = req.params;

        const game = await GameSession.findOne({ pin });

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        const rankedPlayers = sortAndRankPlayers(game.players, game.currentQuestionIndex);

        res.status(200).json({
            success: true,
            currentQuestion: game.currentQuestionIndex + 1,
            totalPlayers: game.players.length,
            leaderboard: rankedPlayers
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const endGame = async (req, res) => {
    try {
        const { pin } = req.body;

        const game = await GameSession.findOne({ pin });

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        if (game.hostId.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Only host can end the game'
            });
        }

        const formattedRanked = sortAndRankPlayers(game.players, game.currentQuestionIndex);
        const winner = formattedRanked[0]?.name || '';

        formattedRanked.forEach((player, index) => {
            const playerIndex = game.players.findIndex(
                p => p.name === player.name
            );
            game.players[playerIndex].rank = player.rank;
        });

        game.status = 'finished';
        game.winner = winner;
        await game.save();

        const finalLeaderboard = formattedRanked;

        const io = req.app.get('io');
        if (io) {
            const payload = {
                winner,
                finalLeaderboard: finalLeaderboard,
                message: 'Battle finished!'
            };
            // Emit all event aliases for maximum client compatibility
            io.to(`room_${pin}`).emit('quiz_ended', payload);
            io.to(pin).emit('quiz_ended', payload);
            io.to(`room_${pin}`).emit('show_final_result', payload);
            io.to(pin).emit('show_final_result', payload);
            io.to(`room_${pin}`).emit('show-final-result', payload);
            io.to(pin).emit('show-final-result', payload);
        }

        res.status(200).json({
            success: true,
            message: 'Game ended successfully',
            winner: winner,
            finalLeaderboard: finalLeaderboard
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getGame = async (req, res) => {
    try {
        const { pin } = req.params;

        const game = await GameSession.findOne({ pin })
            .populate('quizId', 'title category description questions backgroundImage')
            .populate('hostId', 'name email');

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        const localIP = getLocalIPAddress();
        const hostname = os.hostname();
        const joinUrl = `http://${localIP}:5173/join?pin=${game.pin}`;
        const hostnameUrl = `http://${hostname}.local:5173/join?pin=${game.pin}`;

        res.status(200).json({
            success: true,
            game: {
                id: game._id,
                pin: game.pin,
                qrCode: game.qrCode,
                joinUrl: joinUrl,
                hostnameUrl: hostnameUrl,
                status: game.status,
                players: game.players,
                currentQuestion: game.currentQuestionIndex + 1,
                questionStartTime: game.questionStartTime,
                quiz: game.quizId,
                host: game.hostId,
                winner: game.winner,
                backgroundImage: game.backgroundImage || game.quizId?.backgroundImage || ''
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const endQuestion = async (req, res) => {
    try {
        const { pin } = req.body;

        const game = await GameSession.findOne({ pin })
            .populate('quizId');

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        if (game.hostId.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Only host can end the question'
            });
        }

        const currentQuestion = game.quizId.questions[game.currentQuestionIndex];
        const isLastQuestion = game.currentQuestionIndex === game.quizId.questions.length - 1;

        // Calculate ranked players
        const rankedPlayers = sortAndRankPlayers(game.players, game.currentQuestionIndex);

        // FIXED: coerce both sides to Number — answerIndex is stored as whatever
        // was submitted (may be a string from req.body), optIdx is always a number
        const answerStats = currentQuestion.options.map((_, optIdx) =>
            game.players.reduce((count, player) => {
                const ans = player.answers.find(a => a.questionIndex === game.currentQuestionIndex);
                return count + (ans && Number(ans.answerIndex) === optIdx ? 1 : 0);
            }, 0)
        );

        const io = req.app.get('io');
        if (io) {
            io.to(`room_${pin}`).emit('question_ended', {
                correctAnswerIndex: currentQuestion.correctAnswer,
                leaderboard: rankedPlayers,
                answerStats: answerStats,
                isLastQuestion: isLastQuestion
            });
        }

        res.status(200).json({
            success: true,
            message: 'Question ended successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const showLeaderboard = async (req, res) => {
    try {
        const { pin } = req.body;

        const game = await GameSession.findOne({ pin });
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        if (game.hostId.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Only host can show the leaderboard'
            });
        }

        const io = req.app.get('io');
        if (io) {
            io.to(`room_${pin}`).emit('show_leaderboard');
        }

        res.status(200).json({
            success: true,
            message: 'Show leaderboard command emitted'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createGame,
    joinGame,
    startQuestion,
    submitAnswer,
    getLeaderboard,
    endGame,
    getGame,
    endQuestion,
    showLeaderboard
};