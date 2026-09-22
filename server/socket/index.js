const GameSession = require('../models/GameSession');

module.exports = (io) => {

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // ─── HOST JOINS GAME ROOM ─────────────────
        socket.on('host-join', ({ pin, rawPin }) => {
            const roomPin = rawPin || pin;
            socket.join(roomPin);
            socket.join(`room_${roomPin}`);
            socket.data = socket.data || {};
            socket.data.pin = roomPin;
            socket.data.role = 'host';
            console.log(`Host joined room: ${roomPin} (and room_${roomPin})`);
        });

        // ─── PLAYER JOINS GAME ROOM ───────────────
        socket.on('player-join', async ({ pin, rawPin, playerName }) => {
            const roomPin = rawPin || pin;
            socket.join(roomPin);
            socket.join(`room_${roomPin}`);
            socket.data = socket.data || {};
            socket.data.pin = roomPin;
            socket.data.role = 'player';
            socket.data.name = playerName;
            socket.pin = roomPin;
            socket.playerName = playerName;
            console.log(`${playerName} joined room: ${roomPin} (and room_${roomPin})`);

            if (playerName && playerName.startsWith('__LEAVE__:')) {
                const username = playerName.replace('__LEAVE__:', '');
                try {
                    const game = await GameSession.findOne({ pin: roomPin });
                    if (game && game.status === 'waiting') {
                        const updatedGame = await GameSession.findOneAndUpdate(
                            { pin: roomPin, status: 'waiting' },
                            { $pull: { players: { name: username } } },
                            { new: true }
                        );
                        if (updatedGame) {
                            io.to(`room_${roomPin}`).emit('player_list', {
                                pin: updatedGame.pin,
                                players: updatedGame.players.map(p => ({ username: p.name, avatar: p.avatar, score: p.totalScore })),
                                roomStatus: updatedGame.status
                            });
                        }
                    }
                } catch (err) {
                    console.error('Error removing player on leave:', err.message);
                }
            } else if (playerName) {
                // Ensure player is in MongoDB if they rejoined (e.g. on reconnect)
                try {
                    const game = await GameSession.findOne({ pin: roomPin });
                    if (game && game.status === 'waiting') {
                        const hasPlayer = game.players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
                        if (!hasPlayer) {
                            const updatedGame = await GameSession.findOneAndUpdate(
                                { pin: roomPin, status: 'waiting' },
                                { $push: { players: { name: playerName, fullName: playerName, nickname: playerName, mobileNumber: '', avatar: '👤', totalScore: 0, answers: [] } } },
                                { new: true }
                            );
                            if (updatedGame) {
                                io.to(`room_${roomPin}`).emit('player_list', {
                                    pin: updatedGame.pin,
                                    players: updatedGame.players.map(p => ({ username: p.name, avatar: p.avatar, score: p.totalScore })),
                                    roomStatus: updatedGame.status
                                });
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error ensuring player in DB on join:', err.message);
                }

                // Notify everyone in room (host + other players) a new player joined
                io.to(`room_${roomPin}`).emit('player_connected', {
                    username: playerName,
                    message: `${playerName} joined the game!`
                });
            }
        });

        // ─── HOST STARTS QUESTION ─────────────────
        socket.on('question-started', ({ pin, question }) => {
            const roomName = `room_${pin}`;
            // Send question to ALL players in room
            io.to(roomName).emit('show-question', {
                questionNumber: question.questionNumber,
                totalQuestions: question.totalQuestions,
                questionText: question.questionText,
                options: question.options,
                timeLimit: question.timeLimit,
                timeLimitMs: question.timeLimitMs,
                startTime: question.startTime
            });

            console.log(`Question ${question.questionNumber} started in room: ${roomName}`);

            // Auto-end question after time limit (server-side safety net)
            setTimeout(async () => {
                try {
                    const game = await GameSession.findOne({ pin })
                        .populate('quizId');

                    if (!game || game.status !== 'active') return;

                    // Get leaderboard
                    const rankedPlayers = [...game.players]
                        .sort((a, b) => b.totalScore - a.totalScore)
                        .map((player, index) => ({
                            rank: index + 1,
                            name: player.name,
                            totalScore: player.totalScore,
                            correctAnswers: player.answers
                                .filter(a => a.isCorrect).length,
                            totalAnswers: player.answers.length
                        }));

                    io.to(roomName).emit('show-leaderboard', {
                        questionNumber: question.questionNumber,
                        totalQuestions: question.totalQuestions,
                        leaderboard: rankedPlayers,
                        isLastQuestion: question.questionNumber === question.totalQuestions
                    });

                    console.log(`Leaderboard sent for question ${question.questionNumber} in room: ${roomName}`);

                } catch (error) {
                    console.log('Timer error:', error.message);
                }

            }, question.timeLimitMs);
        });

        // ─── PLAYER SUBMITTED ANSWER ──────────────
        socket.on('answer-submitted', async ({ pin, playerName, isCorrect, score }) => {
            try {
                const roomName = `room_${pin}`;
                const game = await GameSession.findOne({ pin });
                if (!game) return;

                const totalPlayers = game.players.length;
                const currentQIndex = game.currentQuestionIndex;

                // Count how many answered this question
                const answeredCount = game.players.filter(player =>
                    player.answers.some(a => a.questionIndex === currentQIndex)
                ).length;

                // Tell everyone someone answered
                io.to(roomName).emit('player-answered', {
                    playerName,
                    answeredCount,
                    totalPlayers,
                    message: `${playerName} answered!`
                });

                // If ALL players answered → show leaderboard immediately
                if (answeredCount === totalPlayers) {
                    const rankedPlayers = [...game.players]
                        .sort((a, b) => b.totalScore - a.totalScore)
                        .map((player, index) => ({
                            rank: index + 1,
                            name: player.name,
                            totalScore: player.totalScore,
                            correctAnswers: player.answers
                                .filter(a => a.isCorrect).length,
                            totalAnswers: player.answers.length
                        }));

                    io.to(roomName).emit('show-leaderboard', {
                        leaderboard: rankedPlayers,
                        allAnswered: true
                    });
                }

            } catch (error) {
                console.log('Answer submitted error:', error.message);
            }
        });

        // ─── HOST MOVES TO NEXT QUESTION ─────────
        socket.on('next-question', ({ pin }) => {
            const roomName = `room_${pin}`;
            io.to(roomName).emit('prepare-next-question', {
                message: 'Next question coming...'
            });

            console.log(`Next question triggered in room: ${roomName}`);
        });

        // ─── GAME ENDED ───────────────────────────
        socket.on('game-ended', ({ pin, winner, finalLeaderboard }) => {
            const roomName = `room_${pin}`;
            const payload = {
                winner,
                finalLeaderboard,
                message: 'Game Over!'
            };
            io.to(roomName).emit('show-final-result', payload);
            io.to(pin).emit('show-final-result', payload);
            io.to(roomName).emit('quiz_ended', payload);
            io.to(pin).emit('quiz_ended', payload);
            io.to(roomName).emit('show_final_result', payload);
            io.to(pin).emit('show_final_result', payload);

            console.log(`Game ended in room: ${roomName}`);
        });

        // ─── HOST ENDS QUIZ EXPLICITLY ───────────
        socket.on('host-end-quiz', async ({ pin, rawPin }) => {
            const roomPin = rawPin || pin;
            console.log(`⚡ Host explicitly ended quiz for room: ${roomPin}`);

            try {
                await GameSession.findOneAndUpdate(
                    { pin: roomPin },
                    { status: 'finished' }
                );
            } catch (err) {
                console.error('Error updating game status on host end quiz:', err.message);
            }

            const payload = {
                message: 'Host has ended the quiz',
                reason: 'host_left'
            };
            io.to(`room_${roomPin}`).emit('room_closed', payload);
            io.to(roomPin).emit('room_closed', payload);
            io.to(`room_${roomPin}`).emit('host_left', payload);
            io.to(roomPin).emit('host_left', payload);
        });

        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.id}`);
            const pin = socket.pin || socket.data?.pin;
            const username = socket.playerName || socket.data?.name;
            const role = socket.data?.role;

            if (pin) {
                const roomName = `room_${pin}`;

                if (role === 'host') {
                    console.log(`⚡ Host disconnected from room: ${pin}`);
                    try {
                        const game = await GameSession.findOne({ pin });
                        // Only close session if game was actively in progress, not when host is in waiting lobby
                        // (Host may be switching apps to share WhatsApp link or reconnecting)
                        if (game && game.status !== 'waiting') {
                            await GameSession.findOneAndUpdate(
                                { pin },
                                { status: 'finished' }
                            );
                            const payload = {
                                message: 'Host has ended the quiz',
                                reason: 'host_disconnected'
                            };
                            io.to(roomName).emit('room_closed', payload);
                            io.to(pin).emit('room_closed', payload);
                            io.to(roomName).emit('host_left', payload);
                            io.to(pin).emit('host_left', payload);
                        }
                    } catch (err) {
                        console.error('Error handling host disconnect:', err.message);
                    }
                } else if (username) {
                    io.to(roomName).emit('player_disconnected', { username });
                    io.to(pin).emit('player-joined', {
                        playerName: `__LEAVE__:${username}`,
                        message: `${username} left the game!`
                    });

                    try {
                        const game = await GameSession.findOne({ pin });
                        if (game && game.status === 'waiting') {
                            const updatedGame = await GameSession.findOneAndUpdate(
                                { pin, status: 'waiting' },
                                { $pull: { players: { name: username } } },
                                { new: true }
                            );
                            if (updatedGame) {
                                io.to(roomName).emit('player_list', {
                                    pin: updatedGame.pin,
                                    players: updatedGame.players.map(p => ({ username: p.name, avatar: p.avatar, score: p.totalScore })),
                                    roomStatus: updatedGame.status
                                });
                            }
                        }
                    } catch (err) {
                        console.error('Error removing player on disconnect:', err.message);
                    }
                }
            }
        });
    });
};