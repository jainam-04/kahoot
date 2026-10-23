import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, ArrowRight, ArrowLeft, Loader2, Award, Users, Crown, Medal,
  Cpu, Monitor, Keyboard, Mouse, Database, Server, Wifi, Terminal, Code2,
  Atom, FlaskConical, Dna, Orbit, Telescope, Microscope,
  Globe, Compass, Map, Scroll, Landmark, Anchor, History,
  Sparkles, Lightbulb, Gamepad2, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import { getLeaderboard, startQuestion, endGame } from '../services/gameService';


import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { connectSocket, getSocket, emitJoinRoom, disconnectSocket } from '../services/socketService';

export default function Leaderboard() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { playerName } = useGame();
  const { themeMode } = useTheme();
  const isLight = themeMode !== 'dark';
  const localPlayer = playerName || localStorage.getItem('guest_playerName');

  // Component State
  const [leaderboard, setLeaderboard] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [myRank, setMyRank] = useState(null);
  const [category, setCategory] = useState('general');

  // Sync document root class with light/dark themeMode
  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [isLight]);

  useEffect(() => {
    const hostToken = localStorage.getItem('token');
    const hostedPin = localStorage.getItem('current_hosted_pin');
    const isUserHost = !!hostToken && hostedPin === pin;
    setIsHost(isUserHost);

    setIsLastQuestion(localStorage.getItem('last_isLastQuestion') === 'true');
    setCategory(localStorage.getItem('last_category') || 'general');

    // 1. Fetch current leaderboard stats
    const fetchLeaderboard = async () => {
      try {
        const response = await getLeaderboard(pin);
        if (response.success) {
          const board = response.leaderboard || [];
          setLeaderboard(board);

          if (localPlayer) {
            const target = (localPlayer || '').trim().toLowerCase();
            const me = board.find(p => (p.name || p.username || '').trim().toLowerCase() === target);
            if (me) setMyRank(me.rank);
          }
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };
    fetchLeaderboard();

    // 2. Connect Socket and Listen
    const socket = connectSocket();
    const roleOrName = isUserHost ? 'Host' : localPlayer;
    emitJoinRoom(pin, roleOrName);

    socket.on('question_started', (data) => {
      navigate(`/live/${pin}`, { state: { socketQuestionData: data } });
    });

    const handleQuizEnded = (data) => {
      navigate(`/final-result/${pin}`, { state: { finalData: data } });
    };

    socket.on('quiz_ended', handleQuizEnded);
    socket.on('show-final-result', handleQuizEnded);
    socket.on('show_final_result', handleQuizEnded);

    const handleHostEnded = (data) => {
      if (!isUserHost && data?.reason === 'host_left') {
        const msg = 'Host ended the quiz';
        toast.error(msg, { id: 'host-ended-toast', duration: 5000 });
        localStorage.removeItem('guest_pin');
        localStorage.removeItem('guest_playerName');
        navigate('/join', { state: { endedMessage: msg } });
      }
    };

    socket.on('room_closed', handleHostEnded);
    socket.on('host_left', handleHostEnded);

    return () => {
      socket.off('question_started');
      socket.off('quiz_ended', handleQuizEnded);
      socket.off('show-final-result', handleQuizEnded);
      socket.off('show_final_result', handleQuizEnded);
      socket.off('room_closed', handleHostEnded);
      socket.off('host_left', handleHostEnded);
    };
  }, [pin, playerName, navigate]);

  const handleHostExit = () => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('host-end-quiz', { pin });
    }
    localStorage.removeItem('current_hosted_pin');
    toast('Quiz session ended', { icon: '🚪' });
    navigate('/dashboard');
  };

  const handlePlayerExit = () => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('player_leave', { pin, playerName: localPlayer });
    }
    localStorage.removeItem('guest_pin');
    localStorage.removeItem('guest_playerName');
    navigate('/join');
  };

  const handleNextStep = async () => {
    setIsLoadingNext(true);
    try {
      if (isLastQuestion) {
        // Ends game
        const response = await endGame(pin);
        if (response.success) {
          navigate(`/final-result/${pin}`);
        } else {
          toast.error(response.message || 'Error ending quiz');
        }
      } else {
        // Advances question
        const response = await startQuestion(pin);
        if (response.success) {
          const socketQuestionData = {
            question: response.question,
            questionNumber: response.question.questionNumber,
            totalQuestions: response.question.totalQuestions,
            timeLeft: response.question.timeLimit,
            quizBackgroundImage: response.quizBackgroundImage || ''
          };
          navigate(`/live/${pin}`, { state: { socketQuestionData } });
        } else {
          toast.error(response.message || 'Error commencing question');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Commencement error');
    } finally {
      setIsLoadingNext(false);
    }
  };

  // Sort board players into podium positions
  const firstPlace = leaderboard.find(p => p.rank === 1);
  const secondPlace = leaderboard.find(p => p.rank === 2);
  const thirdPlace = leaderboard.find(p => p.rank === 3);
  const runnersUp = leaderboard.filter(p => p.rank > 3);
  return (
    <AnimatedPage>
      {/* Background with clean transition */}
      <div className={`relative min-h-screen font-outfit overflow-x-hidden overflow-y-auto flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200 ${
        isLight
          ? 'bg-slate-50 text-slate-900'
          : 'bg-gradient-to-br from-[#0c051e] via-[#241249] to-[#0a0216] text-white'
      }`}>
        
        {/* Component specific animations and keyframes */}
        <style>{`
          @keyframes sweepLeft {
            0%, 100% { transform: rotate(-35deg) scaleX(0.85); }
            50% { transform: rotate(-15deg) scaleX(1.15); }
          }
          @keyframes sweepRight {
            0%, 100% { transform: rotate(35deg) scaleX(0.85); }
            50% { transform: rotate(15deg) scaleX(1.15); }
          }
        `}</style>

        {!isLight ? (
          <>
            {/* Sweeping stage spotlights */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <div 
                className="absolute top-[-20%] left-[10%] w-[320px] h-[120vh] bg-gradient-to-r from-transparent via-white/10 to-transparent origin-top"
                style={{
                  transform: 'rotate(-25deg)',
                  animation: 'sweepLeft 8s ease-in-out infinite',
                }}
              />
              <div 
                className="absolute top-[-20%] right-[10%] w-[320px] h-[120vh] bg-gradient-to-l from-transparent via-white/10 to-transparent origin-top"
                style={{
                  transform: 'rotate(25deg)',
                  animation: 'sweepRight 8s ease-in-out infinite',
                }}
              />
            </div>

            {/* Radial vignette overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0c051e]/40 to-[#0a0216] pointer-events-none z-0" />
            
            {/* Animated Torch Spotlight for Suspense */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0.8, 1, 1, 0] }}
              transition={{ delay: 1, duration: 2.6, ease: "easeInOut", times: [0, 0.1, 0.3, 0.7, 0.85, 1] }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[80vh] bg-gradient-to-b from-white/70 via-white/20 to-transparent z-10 pointer-events-none mix-blend-overlay"
              style={{ clipPath: 'polygon(35% 0, 65% 0, 100% 100%, 0% 100%)' }}
            />
            
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#864CBF]/30 rounded-full blur-[120px] pointer-events-none z-0" />
          </>
        ) : (
          <>
            {/* Light ambient subtle glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-primary/[0.06] via-primary/[0.02] to-transparent rounded-full blur-3xl pointer-events-none z-0" />
          </>
        )}

        {/* Header Indicator */}
        <div className={`flex justify-between items-center border-b pb-4 mb-4 relative z-10 ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          <div className="flex items-center gap-2">
            {isHost ? (
              <button
                onClick={handleHostExit}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 border ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md shadow-sm'
                }`}
              >
                <ArrowLeft className={`h-3.5 w-3.5 shrink-0 ${isLight ? 'text-slate-700' : 'text-white'}`} />
                <span>Return to Dashboard</span>
              </button>
            ) : (
              <button
                onClick={handlePlayerExit}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 border ${
                  isLight
                    ? 'bg-white hover:bg-rose-50 text-rose-600 border-rose-200 shadow-xs'
                    : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/20'
                }`}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Leave</span>
              </button>
            )}
            <span className={`text-xs font-extrabold uppercase tracking-widest ${
              isLight ? 'text-slate-500' : 'text-gray-400'
            }`}>Scoreboard Standings</span>
          </div>
          <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 font-bold text-xs border ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800 shadow-xs'
              : 'bg-white/10 border-white/15 text-white'
          }`}>
            <Users className="h-4 w-4 text-primary" />
            <span>PIN {pin}</span>
          </div>
        </div>

        {/* PODIUM DISPLAY CONTAINER (VISIBLE TO EVERYONE) */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full my-4 sm:my-8 space-y-6 sm:space-y-8 animate-fade-in relative z-10">
          
          <h2 className={`font-outfit text-2xl sm:text-3.5xl font-black text-center ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            Leaderboard Arena
          </h2>

          <div className="flex items-end justify-center gap-2 sm:gap-6 w-full max-w-lg h-60 mt-4 sm:mt-8">
            
            {/* 2ND PLACE PODIUM */}
            {secondPlace ? (
              <div className="flex flex-col items-center flex-1 min-w-0">
                <span className={`text-[11px] sm:text-xs font-bold truncate w-full text-center max-w-[75px] sm:max-w-[90px] ${
                  isLight ? 'text-slate-800' : 'text-gray-200'
                }`}>{secondPlace.name}</span>
                <span className={`text-[9px] sm:text-[10px] font-semibold text-center w-full truncate ${
                  isLight ? 'text-slate-500' : 'text-gray-400'
                }`}>{secondPlace.totalScore || 0} pts ({secondPlace.lastTimeTaken || '0.00'}s)</span>
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 100 }}
                  transition={{ type: 'spring', stiffness: 50, delay: 0.2 }}
                  className={`w-full rounded-t-2xl flex items-center justify-center mt-2 border ${
                    isLight 
                      ? 'bg-gradient-to-t from-slate-200 to-slate-100 border-slate-300 shadow-sm' 
                      : 'bg-gradient-to-t from-white/5 to-white/15 border-white/10'
                  }`}
                >
                  <Medal className={`h-5 w-5 sm:h-6 sm:w-6 ${isLight ? 'text-slate-600' : 'text-gray-400'}`} />
                </motion.div>
              </div>
            ) : <div className="flex-1" />}

            {/* 1ST PLACE PODIUM (CROWN & MIDDLE TALL) */}
            {firstPlace ? (
              <div className="flex flex-col items-center flex-1 min-w-0">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 animate-bounce mb-1" />
                <span className={`text-xs sm:text-sm font-black truncate w-full text-center max-w-[85px] sm:max-w-[105px] podium-rank-1-name ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>{firstPlace.name}</span>
                <span className={`text-[9px] sm:text-[11px] font-extrabold text-center w-full truncate ${
                  isLight ? 'text-amber-700' : 'text-amber-400'
                }`}>{firstPlace.totalScore || 0} pts ({firstPlace.lastTimeTaken || '0.00'}s)</span>
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 140 }}
                  transition={{ type: 'spring', stiffness: 50 }}
                  className={`w-full border rounded-t-2xl flex items-center justify-center mt-2 relative ${
                    isLight 
                      ? 'bg-gradient-to-t from-amber-200/90 to-yellow-100 border-amber-300 shadow-md'
                      : 'bg-gradient-to-t from-primary/10 to-primary/30 border-primary/20'
                  }`}
                >
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                  <Crown className={`h-6 w-6 sm:h-8 sm:w-8 ${isLight ? 'text-amber-600' : 'text-yellow-400'}`} />
                </motion.div>
              </div>
            ) : <div className="flex-1" />}

            {/* 3RD PLACE PODIUM */}
            {thirdPlace ? (
              <div className="flex flex-col items-center flex-1 min-w-0">
                <span className={`text-[11px] sm:text-xs font-bold truncate w-full text-center max-w-[75px] sm:max-w-[90px] ${
                  isLight ? 'text-slate-800' : 'text-gray-200'
                }`}>{thirdPlace.name}</span>
                <span className={`text-[9px] sm:text-[10px] font-semibold text-center w-full truncate ${
                  isLight ? 'text-slate-500' : 'text-gray-400'
                }`}>{thirdPlace.totalScore || 0} pts ({thirdPlace.lastTimeTaken || '0.00'}s)</span>
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 75 }}
                  transition={{ type: 'spring', stiffness: 50, delay: 0.3 }}
                  className={`w-full rounded-t-2xl flex items-center justify-center mt-2 border ${
                    isLight 
                      ? 'bg-gradient-to-t from-amber-100 to-amber-50/50 border-amber-200 shadow-sm' 
                      : 'bg-gradient-to-t from-white/5 to-white/10 border-white/10'
                  }`}
                >
                  <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-amber-700" />
                </motion.div>
              </div>
            ) : <div className="flex-1" />}

          </div>

          {/* RUNNERS UP ROW LIST (4TH PLACE+) */}
          {runnersUp.length > 0 && (
            <div className="w-full max-w-md space-y-2 overflow-y-auto max-h-[160px] pr-1">
              {runnersUp.map((player, idx) => {
                const isMe = player.name?.toLowerCase() === localPlayer?.toLowerCase();
                return (
                  <div key={idx} className={`rounded-xl p-3.5 flex items-center justify-between text-xs border transition-all duration-300 ${
                    isMe
                      ? isLight
                        ? 'bg-purple-50 border-purple-300 shadow-sm scale-[1.02]'
                        : 'bg-[#864CBF]/40 border-[#864CBF] shadow-[0_0_15px_rgba(134,76,191,0.5)] scale-[1.02]'
                      : isLight
                        ? 'bg-white border-slate-200 shadow-xs'
                        : 'bg-black/40 border-white/10'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`font-mono font-bold ${isLight ? 'text-slate-400' : 'text-gray-400'}`}>#{player.rank}</span>
                      <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{player.name}</span>
                    </div>
                    <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-white'}`}>
                      {player.totalScore || 0} pts ({player.lastTimeTaken || '0.00'}s)
                    </span>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* BOTTOM ACTION LAYOUT */}
        <div className={`w-full max-w-md mx-auto mt-auto pt-4 border-t relative z-10 ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          {isHost ? (
            <button
              onClick={handleNextStep}
              disabled={isLoadingNext}
              className="w-full py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 text-base font-black active:scale-[0.98] transition-all bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg cursor-pointer select-none disabled:opacity-50"
            >
              {isLoadingNext ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <>
                  <span className="text-white font-black">{isLastQuestion ? 'Show Final Standings' : 'Launch Next Question'}</span>
                  <ArrowRight className="h-5 w-5 text-white" />
                </>
              )}
            </button>
          ) : (
            <div className={`p-4 sm:p-5 rounded-2xl border text-center space-y-1.5 shadow-sm transition-all ${
              isLight 
                ? 'bg-white border-slate-200 shadow-sm' 
                : 'bg-white/5 border-white/10 backdrop-blur-md'
            }`}>
              <p className={`text-[11px] uppercase tracking-widest font-black ${
                isLight ? 'text-slate-500' : 'text-gray-400'
              }`}>Your Standing</p>
              <h4 className={`font-outfit text-xl sm:text-2xl font-black ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {myRank ? `Rank #${myRank} of ${leaderboard.length}` : 'Calculating rankings...'}
              </h4>
              <p className={`text-xs font-bold animate-pulse mt-1 ${
                isLight ? 'text-primary' : 'text-primary-light'
              }`}>
                Waiting for host to commence next question...
              </p>
            </div>
          )}
        </div>

      </div>
    </AnimatedPage>
  );
}
