import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Home, BarChart3, Loader2, RefreshCw, CheckCircle, Save,
  BookOpen, Clock, XCircle, AlertCircle, Award,
  Trophy, Target, TrendingUp, Percent, User, Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import AnimatedPage from '../components/AnimatedPage';
import { getGame } from '../services/gameService';
import { saveResult } from '../services/resultService';
import { disconnectSocket } from '../services/socketService';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { useTheme } from '../context/ThemeContext';

const isUnansweredAnswer = (answer) => {
  const value = answer?.answerIndex;
  return value === null || value === undefined || value === '' || value === -1 || Number.isNaN(Number(value));
};

const getSubmittedAnswers = (answers = []) => (answers || []).filter((answer) => !isUnansweredAnswer(answer));

export default function FinalResult() {
  const { themeMode } = useTheme();
  const isLight = themeMode !== 'dark';

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [isLight]);

  const { pin } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const socketData = location.state?.finalData;

  const [isHost, setIsHost] = useState(() => {
    const hostToken = localStorage.getItem('token');
    const hostedPin = localStorage.getItem('current_hosted_pin');
    return !!hostToken && hostedPin === pin;
  });
  const [isSaved, setIsSaved] = useState(false);
  const localPlayerName = localStorage.getItem('guest_playerName');

  // Fetch final game data
  const { 
    data: gameData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['final-game', pin],
    queryFn: () => getGame(pin),
    refetchOnWindowFocus: false,
    staleTime: 0
  });

  // Construct game object with instant socket state fallback
  const game = gameData?.game || (socketData ? {
    pin,
    players: (socketData.finalLeaderboard || []).map(p => ({
      name: p.username || p.name,
      avatar: p.avatar,
      totalScore: p.score !== undefined ? p.score : (p.totalScore || 0),
      answers: p.answers || []
    })),
    winner: socketData.winner
  } : null);

  const sessionId = game?.id;

  // Auto-save results to MongoDB Result schema for Host
  useEffect(() => {
    if (isHost && sessionId && !isSaved) {
      const persistResults = async () => {
        try {
          const res = await saveResult(sessionId);
          if (res.success) {
            setIsSaved(true);
            toast.success('Battle metrics saved to Dashboard!');
          }
        } catch (err) {
          console.log('Result save status:', err?.response?.data?.message || err?.message);
          setIsSaved(true); // Stop loop on error/already-saved
        }
      };
      persistResults();
    }
  }, [isHost, sessionId, isSaved]);

  useEffect(() => {
    const hostToken = localStorage.getItem('token');
    let user = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) user = JSON.parse(userStr);
    } catch (e) {}

    if (game && user && (game.host === user.id || game.host?._id === user.id)) {
      setIsHost(true);
    } else {
      setIsHost(!localPlayerName && !!hostToken);
    }
  }, [game, localPlayerName]);

  const players = game?.players || [];
  
  // Sort players by total score (points), accuracy, and speed
  const rankedPlayers = [...players]
    .sort((a, b) => {
      const aScore = a.totalScore || 0;
      const bScore = b.totalScore || 0;
      
      if (aScore !== bScore) {
        return bScore - aScore;
      }
      
      const aCorrect = a.answers?.filter(ans => ans.isCorrect).length || 0;
      const bCorrect = b.answers?.filter(ans => ans.isCorrect).length || 0;
      
      if (aCorrect !== bCorrect) {
        return bCorrect - aCorrect;
      }
      
      const aTime = a.answers?.reduce((acc, ans) => acc + (ans.isCorrect ? ans.timeTaken : 0), 0) || 0;
      const bTime = b.answers?.reduce((acc, ans) => acc + (ans.isCorrect ? ans.timeTaken : 0), 0) || 0;
      
      if (aTime !== bTime) {
        return aTime - bTime;
      }
      
      return new Date(a.joinedAt || 0) - new Date(b.joinedAt || 0);
    })
    .map((p, idx) => {
      const totalCorrect = p.answers?.filter(a => a.isCorrect).length || 0;
      const totalTimeCorrect = p.answers?.reduce((acc, ans) => acc + (ans.isCorrect ? ans.timeTaken : 0), 0) || 0;
      return {
        ...p,
        rank: idx + 1,
        correctAnswers: totalCorrect,
        timeCorrect: (totalTimeCorrect / 1000).toFixed(2)
      };
    });

  const questions = game?.quiz?.questions || [];
  const currentPlayer = rankedPlayers.find(p => p.name?.toLowerCase() === localPlayerName?.toLowerCase());

  const winner = rankedPlayers[0];
  const second = rankedPlayers[1];
  const third = rankedPlayers[2];

  // Dynamic reveal timing calculation based on total player count
  const totalPlayerCount = rankedPlayers.length;
  const revealDelays = totalPlayerCount >= 3 ? {
    p3Rise: 0.5,
    p3Reveal: 1.3,
    p2Rise: 1.7,
    p2Reveal: 2.5,
    p1Rise: 3.0,
    p1Reveal: 3.9,
    p1Crown: 4.2
  } : totalPlayerCount === 2 ? {
    p2Rise: 0.5,
    p2Reveal: 1.3,
    p1Rise: 1.8,
    p1Reveal: 2.7,
    p1Crown: 2.9
  } : {
    p1Rise: 0.5,
    p1Reveal: 1.3,
    p1Crown: 1.5
  };

  useEffect(() => {
    // Confetti logic aligned with podium reveal sequence
    let interval;
    const totalCount = rankedPlayers.length;

    const delays = totalCount >= 3 ? {
      t3: 1400,
      t2: 2700,
      t1: 4200
    } : totalCount === 2 ? {
      t2: 1400,
      t1: 2700
    } : {
      t1: 1500
    };

    let t3Timeout, t2Timeout, t1Timeout;

    if (delays.t3) {
      t3Timeout = setTimeout(() => {
        confetti({ particleCount: 45, spread: 65, origin: { x: 0.8, y: 0.65 }, colors: ['#CD7F32', '#ffffff', '#783bd1'] });
      }, delays.t3);
    }

    if (delays.t2) {
      t2Timeout = setTimeout(() => {
        confetti({ particleCount: 55, spread: 65, origin: { x: 0.2, y: 0.65 }, colors: ['#C0C0C0', '#ffffff', '#6b2cbd'] });
      }, delays.t2);
    }

    if (delays.t1) {
      t1Timeout = setTimeout(() => {
        // Grand winner burst
        confetti({
          particleCount: 250,
          spread: 120,
          startVelocity: 60,
          origin: { y: 0.65 },
          zIndex: 50,
          colors: ['#FFC83D', '#46178F', '#864CBF', '#06B6D4', '#ffffff']
        });

        // Continuous celebrate loop
        const duration = 12 * 1000;
        const animationEnd = Date.now() + duration;
        interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);

          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ['#FFC83D', '#ffffff', '#864CBF', '#06B6D4', '#F43F5E'],
            zIndex: 50
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ['#FFC83D', '#ffffff', '#864CBF', '#06B6D4', '#F43F5E'],
            zIndex: 50
          });
        }, 300);
      }, delays.t1);
    }

    return () => {
      if (t3Timeout) clearTimeout(t3Timeout);
      if (t2Timeout) clearTimeout(t2Timeout);
      if (t1Timeout) clearTimeout(t1Timeout);
      if (interval) clearInterval(interval);
      disconnectSocket();
    };
  }, [rankedPlayers.length]);

  // Calculate player statistics
  const playerStats = currentPlayer ? {
    totalQuestions: questions.length,
    correctAnswers: currentPlayer.correctAnswers || 0,
    incorrectAnswers: getSubmittedAnswers(currentPlayer.answers).filter(a => !a.isCorrect).length || 0,
    notSubmitted: questions.length - getSubmittedAnswers(currentPlayer.answers).length,
    totalScore: currentPlayer.totalScore || 0,
    percentage: questions.length > 0 ? Math.round((currentPlayer.correctAnswers || 0) / questions.length * 100) : 0,
    rank: currentPlayer.rank || 0
  } : null;

  if (isLoading && !game) {
    return (
      <AnimatedPage>
        <div className={`flex-1 flex items-center justify-center min-h-screen ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#46178F] text-white'}`}>
          <div className="text-center space-y-4">
            <Loader2 className={`h-12 w-12 animate-spin mx-auto ${isLight ? 'text-primary' : 'text-white'}`} />
            <p className={`text-sm font-bold uppercase tracking-widest ${isLight ? 'text-slate-600' : 'text-white'}`}>Loading Results...</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className={`relative min-h-screen font-outfit overflow-x-hidden overflow-y-auto flex flex-col justify-between transition-colors duration-200 ${
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

          @keyframes glowGoldPulse {
            0%, 100% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.4), inset 0 0 15px rgba(255, 215, 0, 0.2); }
            50% { box-shadow: 0 0 45px rgba(255, 215, 0, 0.85), inset 0 0 25px rgba(255, 215, 0, 0.4); }
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
              transition={{ delay: 2.2, duration: 2.6, ease: "easeInOut", times: [0, 0.1, 0.3, 0.7, 0.85, 1] }}
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

        <div className="relative z-10 flex flex-col items-center flex-1 w-full px-4 pt-6 pb-6">
          {/* Header (Title & Category) */}
          <div className="w-full max-w-6xl flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h1 className={`text-2xl md:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {game?.quiz?.title || 'Quiz Results'}
              </h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-gray-300'
              }`}>
                {game?.quiz?.category || 'General'}
              </span>
            </div>
          </div>

          {/* Show Podium for Everyone, Show Detailed Report for Players Below */}
          <>
              {/* Quiz Title / Battle Finished Card */}
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
                className={`rounded-2xl px-6 sm:px-10 py-4 mb-4 sm:mb-6 text-center border ${
                  isLight 
                    ? 'bg-white border-slate-200/90 shadow-sm text-slate-900' 
                    : 'backdrop-blur-md border-white/10 bg-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] text-white'
                }`}
              >
                <h1 className={`text-3xl md:text-4xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Battle Finished!</h1>
                <div className="flex justify-center mt-2">
                  <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border ${
                    isLight 
                      ? 'bg-slate-100 text-slate-700 border-slate-200' 
                      : 'border-white/10 bg-white/5 text-gray-200'
                  }`}>
                    <span>Congratulations to all players!</span>
                  </div>
                </div>
              </motion.div>

              {/* PODIUM CONTAINER */}
              <div className="flex items-end justify-center w-full max-w-3xl h-[400px] sm:h-[500px] md:h-[580px] mt-2 sm:mt-4 md:mt-8 mb-4 sm:mb-8 gap-1 sm:gap-3 md:gap-4 relative">
                
                {/* 2ND PLACE PODIUM (Left) */}
                {second && (
                  <div className="flex flex-col items-center flex-1 z-10 w-1/3">
                    <motion.div 
                      initial={{ opacity: 0, y: 20, scale: 0.7 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.4, delay: revealDelays.p2Reveal }}
                      className="flex flex-col items-center mb-1 sm:mb-2 text-center"
                    >
                      <motion.div 
                        animate={{ y: [0, -6, 0], rotate: [-4, 4, -4] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                        className="text-4xl sm:text-6xl md:text-7xl mb-1 sm:mb-2 filter drop-shadow-xl select-none"
                      >
                        {second.avatar ? <Avatar emoji={second.avatar} className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" /> : <User className={`w-12 h-12 ${isLight ? 'text-slate-400' : 'text-white/50'}`} />}
                      </motion.div>
                      <div className={`font-black text-[11px] sm:text-xs md:text-sm tracking-tight truncate max-w-[70px] sm:max-w-[80px] ${
                        isLight ? 'text-slate-900' : 'text-white drop-shadow-md'
                      }`}>{second.name}</div>
                      <div className={`font-black text-[9px] sm:text-[10px] md:text-xs mt-0.5 ${
                        isLight ? 'text-slate-600' : 'text-gray-300 drop-shadow-sm'
                      }`}>{second.totalScore || 0} pts</div>
                    </motion.div>

                    <motion.div 
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ type: 'spring', stiffness: 55, damping: 14, delay: revealDelays.p2Rise }}
                      style={{ transformOrigin: 'bottom' }}
                      className={`w-full h-[150px] sm:h-[190px] md:h-[250px] bg-gradient-to-b from-[#e0e0e0] via-[#a6a6a6] to-[#6b6b6b] rounded-t-2xl sm:rounded-t-3xl flex flex-col items-center justify-start pt-2 sm:pt-4 relative overflow-hidden border-t-[4px] sm:border-t-[6px] ${
                        isLight 
                          ? 'border-slate-300 shadow-[0_10px_25px_rgba(0,0,0,0.08)]' 
                          : 'border-[#ffffff] shadow-[0_15px_35px_rgba(255,255,255,0.08)]'
                      }`}
                    >
                      {/* Silver Medal */}
                      <div className="relative flex flex-col items-center mb-1 sm:mb-2 mt-1 sm:mt-2">
                        <div className="w-3 sm:w-4 h-4 sm:h-5 bg-blue-600 rounded-sm mb-[-4px] z-0 shadow-inner border border-blue-800 flex overflow-hidden">
                          <div className="w-1/3 h-full bg-white/30"></div>
                          <div className="w-1/3 h-full bg-transparent"></div>
                          <div className="w-1/3 h-full bg-white/30"></div>
                        </div>
                        <div className="relative z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-gray-100 via-gray-300 to-gray-500 flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] border-2 border-[#a8a9ad]">
                          <div className="w-[85%] h-[85%] rounded-full border border-white/60 flex items-center justify-center bg-gradient-to-tr from-gray-500/20 to-transparent">
                            <span className="font-outfit text-sm sm:text-lg font-black text-white drop-shadow-md">2</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* 1ST PLACE PODIUM (Center) */}
                {winner && (
                  <div className="flex flex-col items-center flex-1 z-20 w-1/3 -mx-1 sm:-mx-2 md:-mx-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 25, scale: 0.6 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5, delay: revealDelays.p1Reveal }}
                      className="flex flex-col items-center mb-1 sm:mb-2 text-center relative"
                    >
                      <motion.div 
                        animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="text-5xl sm:text-7xl md:text-8xl mb-1 sm:mb-2 filter drop-shadow-2xl relative z-10 select-none cursor-pointer"
                      >
                        {/* Crown */}
                        <motion.div 
                          initial={{ opacity: 0, y: -20, scale: 0, rotate: -20 }}
                          animate={{ opacity: 1, y: 0, scale: 1, rotate: 10 }}
                          transition={{ delay: revealDelays.p1Crown, type: 'spring', bounce: 0.6 }}
                          className="absolute -top-3 sm:-top-5 lg:-top-6 left-1/2 -translate-x-1/2 text-2xl sm:text-4xl lg:text-5xl z-20 drop-shadow-md origin-bottom-left"
                        >
                          <Crown className="w-7 h-7 sm:w-10 sm:h-10 text-yellow-400" />
                        </motion.div>
                        
                        {/* Golden Trophy floating next to avatar */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                          transition={{ opacity: { delay: revealDelays.p1Crown }, scale: { delay: revealDelays.p1Crown, type: 'spring' }, y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
                          className="absolute -right-4 sm:-right-6 bottom-0 filter drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]"
                        >
                          <Trophy className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-500" />
                        </motion.div>

                        {/* Golden Halo aura behind 1st place */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 blur-xl z-0 animate-pulse ${
                          isLight ? 'opacity-30' : 'opacity-50'
                        }`} />

                        {winner.avatar ? <Avatar emoji={winner.avatar} className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 relative z-10" /> : <User className={`w-14 h-14 ${isLight ? 'text-slate-400' : 'text-white/50'}`} />}
                      </motion.div>

                      <div className={`font-extrabold text-xs sm:text-sm md:text-lg tracking-tight truncate max-w-[90px] sm:max-w-[120px] ${
                        isLight ? 'text-slate-900' : 'text-white drop-shadow-md'
                      }`}>{winner.name}</div>
                      <div className={`font-black text-[10px] sm:text-xs md:text-sm mt-0.5 ${
                        isLight ? 'text-amber-600' : 'text-yellow-300 drop-shadow-sm'
                      }`}>{winner.totalScore || 0} pts</div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ type: 'spring', stiffness: 45, damping: 12, delay: revealDelays.p1Rise }}
                      style={{ transformOrigin: 'bottom', animation: 'glowGoldPulse 3s ease-in-out infinite' }}
                      className={`w-full h-[210px] sm:h-[270px] md:h-[330px] bg-gradient-to-b from-[#ffd700] via-[#d4af37] to-[#aa7c11] rounded-t-2xl sm:rounded-t-3xl flex flex-col items-center justify-start pt-2 sm:pt-4 relative overflow-hidden border-t-[4px] sm:border-t-[6px] border-[#ffe082] ${
                        isLight 
                          ? 'shadow-[0_15px_35px_rgba(212,175,55,0.25)]' 
                          : 'shadow-[0_15px_45px_rgba(255,215,0,0.2)]'
                      }`}
                    >
                      {/* Gold Medal */}
                      <div className="relative flex flex-col items-center mb-1 sm:mb-2 mt-1 sm:mt-2">
                        <div className="w-4 sm:w-5 h-5 sm:h-6 bg-red-600 rounded-sm mb-[-6px] z-0 shadow-inner border border-red-800 flex overflow-hidden">
                          <div className="w-1/3 h-full bg-white/30"></div>
                          <div className="w-1/3 h-full bg-transparent"></div>
                          <div className="w-1/3 h-full bg-white/30"></div>
                        </div>
                        <div className="relative z-10 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-100 via-yellow-400 to-amber-600 flex items-center justify-center shadow-[0_4px_15px_rgba(255,200,0,0.5)] border-[2px] sm:border-[3px] border-[#d4af37]">
                          <div className="w-[85%] h-[85%] rounded-full border border-yellow-200/50 flex items-center justify-center bg-gradient-to-tr from-yellow-600/30 to-transparent">
                            <span className="font-outfit text-base sm:text-2xl font-black text-white drop-shadow-md">1</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* 3RD PLACE PODIUM (Right) */}
                {third && (
                  <div className="flex flex-col items-center flex-1 z-10 w-1/3">
                    <motion.div 
                      initial={{ opacity: 0, y: 20, scale: 0.7 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.4, delay: revealDelays.p3Reveal }}
                      className="flex flex-col items-center mb-1 sm:mb-2 text-center"
                    >
                      <motion.div 
                        animate={{ y: [0, -5, 0], rotate: [-4, 4, -4] }}
                        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                        className="text-4xl sm:text-6xl md:text-7xl mb-1 sm:mb-2 filter drop-shadow-xl select-none"
                      >
                        {third.avatar ? <Avatar emoji={third.avatar} className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16" /> : <User className={`w-10 h-10 ${isLight ? 'text-slate-400' : 'text-white/50'}`} />}
                      </motion.div>
                      <div className={`font-black text-[11px] sm:text-xs md:text-sm tracking-tight truncate max-w-[70px] sm:max-w-[80px] ${
                        isLight ? 'text-slate-900' : 'text-white drop-shadow-md'
                      }`}>{third.name}</div>
                      <div className={`font-black text-[9px] sm:text-[10px] md:text-xs mt-0.5 ${
                        isLight ? 'text-slate-600' : 'text-gray-300 drop-shadow-sm'
                      }`}>{third.totalScore || 0} pts</div>
                    </motion.div>

                    <motion.div 
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ type: 'spring', stiffness: 60, damping: 15, delay: revealDelays.p3Rise }}
                      style={{ transformOrigin: 'bottom' }}
                      className={`w-full h-[105px] sm:h-[140px] md:h-[190px] bg-gradient-to-b from-[#cd7f32] via-[#a05a2c] to-[#5a2e0e] rounded-t-2xl sm:rounded-t-3xl flex flex-col items-center justify-start pt-2 sm:pt-4 relative overflow-hidden border-t-[4px] sm:border-t-[6px] ${
                        isLight 
                          ? 'border-[#ffb74d] shadow-[0_10px_20px_rgba(0,0,0,0.08)]' 
                          : 'border-[#ffb74d] shadow-[0_15px_25px_rgba(205,127,50,0.08)]'
                      }`}
                    >
                      {/* Bronze Medal */}
                      <div className="relative flex flex-col items-center mb-1 sm:mb-2 mt-1 sm:mt-2">
                        <div className="w-3 sm:w-4 h-4 sm:h-5 bg-emerald-600 rounded-sm mb-[-4px] z-0 shadow-inner border border-emerald-800 flex overflow-hidden">
                          <div className="w-1/3 h-full bg-white/30"></div>
                          <div className="w-1/3 h-full bg-transparent"></div>
                          <div className="w-1/3 h-full bg-white/30"></div>
                        </div>
                        <div className="relative z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#ffc894] via-[#cd7f32] to-[#8b4513] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] border-2 border-[#a0522d]">
                          <div className="w-[85%] h-[85%] rounded-full border border-[#ffd8b8]/30 flex items-center justify-center bg-gradient-to-tr from-[#6b3510]/30 to-transparent">
                            <span className="font-outfit text-sm sm:text-lg font-black text-white drop-shadow-md">3</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

              </div>

          {/* RUNNER UPS */}
          {rankedPlayers.length > 3 ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.6, duration: 0.8 }}
              className="w-full max-w-lg mt-8 sm:mt-12 mb-6"
            >
              <div className={`rounded-2xl p-4 border ${
                isLight 
                  ? 'bg-white border-slate-200 shadow-sm' 
                  : 'bg-black/30 backdrop-blur-md border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
              }`}>
                <h3 className={`font-bold mb-4 px-2 uppercase tracking-widest text-sm flex items-center gap-2 ${
                  isLight ? 'text-slate-700' : 'text-white/80'
                }`}>
                  <span>Runners Up</span>
                  <div className={`h-[1px] flex-1 ${isLight ? 'bg-slate-200' : 'bg-white/20'}`}></div>
                </h3>
                <div className="flex flex-col gap-2">
                  {rankedPlayers.slice(3).map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 5.0 + index * 0.2 }}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 border ${
                        player.name === localPlayerName
                          ? isLight
                            ? 'bg-purple-50 border-purple-200 shadow-xs scale-[1.02]'
                            : 'bg-[#864CBF]/40 border-[#864CBF] shadow-[0_0_15px_rgba(134,76,191,0.5)] scale-[1.02]'
                          : isLight
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200/80'
                            : 'bg-white/5 hover:bg-white/10 border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-black w-6 text-right ${isLight ? 'text-slate-400' : 'text-white/50'}`}>{player.rank}</span>
                        <div className="flex justify-center items-center">
                          {player.avatar ? <Avatar emoji={player.avatar} className="w-8 h-8" /> : <User className={`w-6 h-6 ${isLight ? 'text-slate-400' : 'text-white/50'}`} />}
                        </div>
                        <span className={`font-bold text-base md:text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>{player.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{player.totalScore || 0} pts</span>
                        <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{player.correctAnswers || 0} correct</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}

          {/* Summary Cards for Player */}
          {playerStats && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-6xl mx-auto mb-8"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
                    {/* Total Questions */}
                    <div className={`p-3 sm:p-4 rounded-xl border ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/10'
                    }`}>
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                        <Target className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className={`text-[10px] sm:text-xs font-bold uppercase truncate ${
                          isLight ? 'text-slate-500' : 'text-gray-400'
                        }`}>Total Questions</span>
                      </div>
                      <p className={`text-xl sm:text-2xl font-black ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>{playerStats.totalQuestions}</p>
                    </div>

                    {/* Correct Answers */}
                    <div className={`p-3 sm:p-4 rounded-xl border ${
                      isLight ? 'bg-emerald-50/70 border-emerald-200/80 shadow-sm' : 'bg-green-500/10 border-green-500/20'
                    }`}>
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className={`text-[10px] sm:text-xs font-bold uppercase truncate ${
                          isLight ? 'text-emerald-700' : 'text-green-400'
                        }`}>Correct</span>
                      </div>
                      <p className={`text-xl sm:text-2xl font-black ${
                        isLight ? 'text-emerald-950' : 'text-white'
                      }`}>{playerStats.correctAnswers}</p>
                    </div>

                    {/* Incorrect Answers */}
                    <div className={`p-3 sm:p-4 rounded-xl border ${
                      isLight ? 'bg-rose-50/70 border-rose-200/80 shadow-sm' : 'bg-red-500/10 border-red-500/20'
                    }`}>
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                        <span className={`text-[10px] sm:text-xs font-bold uppercase truncate ${
                          isLight ? 'text-rose-700' : 'text-red-400'
                        }`}>Incorrect</span>
                      </div>
                      <p className={`text-xl sm:text-2xl font-black ${
                        isLight ? 'text-rose-950' : 'text-white'
                      }`}>{playerStats.incorrectAnswers}</p>
                    </div>

                    {/* Not Submitted */}
                    <div className={`p-3 sm:p-4 rounded-xl border ${
                      isLight ? 'bg-amber-50/70 border-amber-200/80 shadow-sm' : 'bg-orange-500/10 border-orange-500/20'
                    }`}>
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                        <span className={`text-[10px] sm:text-xs font-bold uppercase truncate ${
                          isLight ? 'text-amber-700' : 'text-orange-400'
                        }`}>Not Submitted</span>
                      </div>
                      <p className={`text-xl sm:text-2xl font-black ${
                        isLight ? 'text-amber-950' : 'text-white'
                      }`}>{playerStats.notSubmitted}</p>
                    </div>

                    {/* Score */}
                    <div className={`p-3 sm:p-4 rounded-xl border ${
                      isLight ? 'bg-purple-50/70 border-purple-200/80 shadow-sm' : 'bg-purple-500/10 border-purple-500/20'
                    }`}>
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                        <Trophy className="h-4 w-4 text-purple-600 shrink-0" />
                        <span className={`text-[10px] sm:text-xs font-bold uppercase truncate ${
                          isLight ? 'text-purple-700' : 'text-purple-400'
                        }`}>Score</span>
                      </div>
                      <p className={`text-xl sm:text-2xl font-black ${
                        isLight ? 'text-purple-950' : 'text-white'
                      }`}>{playerStats.totalScore}</p>
                    </div>

                    {/* Percentage */}
                    <div className={`p-3 sm:p-4 rounded-xl border ${
                      isLight ? 'bg-blue-50/70 border-blue-200/80 shadow-sm' : 'bg-blue-500/10 border-blue-500/20'
                    }`}>
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                        <Percent className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className={`text-[10px] sm:text-xs font-bold uppercase truncate ${
                          isLight ? 'text-blue-700' : 'text-blue-400'
                        }`}>Percentage</span>
                      </div>
                      <p className={`text-xl sm:text-2xl font-black ${
                        isLight ? 'text-blue-950' : 'text-white'
                      }`}>{playerStats.percentage}%</p>
                    </div>

                    {/* Rank */}
                    <div className={`p-3 sm:p-4 rounded-xl border ${
                      isLight ? 'bg-amber-50/70 border-amber-200/80 shadow-sm' : 'bg-yellow-500/10 border-yellow-500/20'
                    }`}>
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                        <Award className="h-4 w-4 text-amber-600 shrink-0" />
                        <span className={`text-[10px] sm:text-xs font-bold uppercase truncate ${
                          isLight ? 'text-amber-700' : 'text-yellow-400'
                        }`}>Rank</span>
                      </div>
                      <p className={`text-xl sm:text-2xl font-black ${
                        isLight ? 'text-amber-950' : 'text-white'
                      }`}>#{playerStats.rank}</p>
                    </div>

                    {/* Completion */}
                    <div className={`p-3 sm:p-4 rounded-xl border ${
                      isLight ? 'bg-teal-50/70 border-teal-200/80 shadow-sm' : 'bg-teal-500/10 border-teal-500/20'
                    }`}>
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-teal-600 shrink-0" />
                        <span className={`text-[10px] sm:text-xs font-bold uppercase truncate ${
                          isLight ? 'text-teal-700' : 'text-teal-400'
                        }`}>Completion</span>
                      </div>
                      <p className={`text-xl sm:text-2xl font-black ${
                        isLight ? 'text-teal-950' : 'text-white'
                      }`}>
                        {Math.round(((playerStats.totalQuestions - playerStats.notSubmitted) / playerStats.totalQuestions) * 100)}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Detailed Question Review for Student */}
              {!isHost && currentPlayer && questions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className={`w-full max-w-4xl mx-auto p-4 sm:p-6 rounded-2xl text-left border ${
                    isLight 
                      ? 'bg-white border-slate-200 shadow-sm' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <h2 className={`font-outfit text-xl font-bold mb-1 flex items-center gap-2 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span>Your Performance Breakdown</span>
                  </h2>
                  <p className={`text-xs mb-6 ${
                    isLight ? 'text-slate-600' : 'text-gray-400'
                  }`}>
                    Review your answers below to see where you excelled and where you can improve.
                  </p>

                  <div className="space-y-4 sm:space-y-5">
                    {questions.map((q, idx) => {
                      const userAnswer = currentPlayer.answers?.find(a => a.questionIndex === idx);
                      const isUserCorrect = userAnswer?.isCorrect;
                      const hasAnswered = !!userAnswer && !isUnansweredAnswer(userAnswer);

                      return (
                        <div 
                          key={idx} 
                          className={`p-4 sm:p-5 rounded-xl space-y-3.5 border ${
                            isLight 
                              ? 'bg-slate-50/70 border-slate-200' 
                              : 'bg-white/[0.02] border-white/5'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <span className={`text-[10px] sm:text-[11px] uppercase font-bold tracking-wider ${
                                isLight ? 'text-slate-500' : 'text-gray-500'
                              }`}>
                                Question {idx + 1}
                              </span>
                              <h3 className={`text-sm sm:text-base font-bold mt-0.5 leading-snug ${
                                isLight ? 'text-slate-900' : 'text-white'
                              }`}>
                                {q.questionText}
                              </h3>
                            </div>
                            <div className="shrink-0">
                              {hasAnswered ? (
                                isUserCorrect ? (
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                    isLight 
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs' 
                                      : 'bg-green-500/10 text-green-400 border-green-500/20'
                                  }`}>
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Correct Answer
                                  </span>
                                ) : (
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                    isLight 
                                      ? 'bg-rose-50 text-rose-800 border-rose-200 shadow-2xs' 
                                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                                  }`}>
                                    <XCircle className="h-3.5 w-3.5 text-rose-600" /> Incorrect Answer
                                  </span>
                                )
                              ) : (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                  isLight 
                                    ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-2xs' 
                                    : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                  }`}>
                                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Answer Not Submitted
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Your Answer and Correct Answer */}
                          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border ${
                            isLight ? 'bg-white border-slate-200/80' : 'bg-white/[0.03] border-white/5'
                          }`}>
                            <div>
                              <span className={`text-[10px] font-bold uppercase ${
                                isLight ? 'text-slate-500' : 'text-gray-500'
                              }`}>Your Answer:</span>
                              <p className={`text-sm mt-0.5 font-bold ${
                                hasAnswered 
                                  ? (isUserCorrect 
                                      ? (isLight ? 'text-emerald-700' : 'text-green-400') 
                                      : (isLight ? 'text-rose-700' : 'text-red-400'))
                                  : (isLight ? 'text-amber-700' : 'text-orange-400')
                              }`}>
                                {hasAnswered 
                                  ? q.options[userAnswer?.answerIndex] || 'Not selected'
                                  : 'Not Answered'
                                }
                              </p>
                            </div>
                            <div>
                              <span className={`text-[10px] font-bold uppercase ${
                                isLight ? 'text-slate-500' : 'text-gray-500'
                              }`}>Correct Answer:</span>
                              <p className={`text-sm mt-0.5 font-bold ${
                                isLight ? 'text-emerald-700' : 'text-green-400'
                              }`}>
                                {q.options[q.correctAnswer]}
                              </p>
                            </div>
                          </div>

                          {/* Answer Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                            {q.options.map((opt, optIdx) => {
                              const isCorrectOption = optIdx === q.correctAnswer;
                              const isSelectedOption = userAnswer && Number(userAnswer.answerIndex) === optIdx;

                              let optClass = isLight 
                                ? "border-slate-200 bg-white text-slate-700 shadow-2xs" 
                                : "border-white/5 bg-white/5 text-gray-400";
                              let icon = null;

                              if (isCorrectOption) {
                                optClass = isLight
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-400/40 shadow-xs"
                                  : "border-green-500/30 bg-green-500/10 text-green-300 font-medium";
                                icon = <CheckCircle className={`h-4 w-4 ${isLight ? 'text-emerald-600' : 'text-green-500'} shrink-0`} />;
                              } else if (isSelectedOption && !isUserCorrect) {
                                optClass = isLight
                                  ? "border-rose-300 bg-rose-50 text-rose-900 font-bold ring-1 ring-rose-400/40 shadow-xs"
                                  : "border-red-500/30 bg-red-500/10 text-red-300 font-medium";
                                icon = <XCircle className={`h-4 w-4 ${isLight ? 'text-rose-600' : 'text-red-500'} shrink-0`} />;
                              }

                              return (
                                <div
                                  key={optIdx}
                                  className={`flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${optClass}`}
                                >
                                  <span className="truncate">{opt}</span>
                                  {icon}
                                </div>
                              );
                            })}
                          </div>

                          {/* Extra Info (Score & Time) */}
                          {hasAnswered && (
                            <div className={`flex flex-wrap items-center justify-between gap-3 text-xs pt-2.5 mt-1 border-t ${
                              isLight ? 'border-slate-200 text-slate-500' : 'border-white/5 text-gray-400'
                            }`}>
                              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                <Clock className={`h-3.5 w-3.5 ${isLight ? 'text-slate-400' : 'text-gray-400'} shrink-0`} />
                                <span>Time taken: <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-gray-300'}`}>{(userAnswer.timeTaken / 1000).toFixed(2)}s</span></span>
                              </span>
                              {isUserCorrect && (
                                <span className={`inline-flex items-center gap-1.5 font-bold whitespace-nowrap ${
                                  isLight ? 'text-amber-600' : 'text-yellow-400'
                                }`}>
                                  <Award className={`h-3.5 w-3.5 ${isLight ? 'text-amber-600' : 'text-yellow-400'} shrink-0`} />
                                  <span>+{userAnswer.score} pts</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </>


          {/* ACTIONS */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="w-full max-w-md grid gap-3 mt-8 mb-4"
          >
            {isHost ? (
              <>
                {isSaved ? (
                  <Link 
                    to={`/results/${game?.id}`}
                    className="w-full py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 text-base font-black active:translate-y-1 transition-all bg-primary text-white hover:bg-primary-dark shadow-md"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>View Full Analytics</span>
                  </Link>
                ) : (
                  <button
                    onClick={async () => {
                      if (!sessionId) return;
                      toast.loading('Saving metrics...', { id: 'save-res' });
                      try {
                        const res = await saveResult(sessionId);
                        if (res.success) {
                          setIsSaved(true);
                          toast.success('Results successfully saved! 💾');
                        }
                      } catch (err) {
                        toast.error(err.response?.data?.message || 'Error saving results');
                      } finally {
                        toast.dismiss('save-res');
                      }
                    }}
                    className="w-full py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 text-base font-black active:translate-y-1 transition-all animate-pulse bg-primary text-white hover:bg-primary-dark shadow-md"
                  >
                    <Save className="h-5 w-5" />
                    <span>Save Results to Dashboard</span>
                  </button>
                )}
                <Link 
                  to="/dashboard"
                  className={`w-full py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 text-base font-bold transition-all border ${
                    isLight 
                      ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm' 
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  <span>Return to Dashboard</span>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/join"
                  className="w-full py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 text-base font-black active:translate-y-1 transition-all bg-primary text-white hover:bg-primary-dark shadow-md"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Play Again</span>
                </Link>
                <Link 
                  to="/join"
                  className={`w-full py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 text-base font-bold transition-all border ${
                    isLight 
                      ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm' 
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  <span>Exit Game</span>
                </Link>
              </>
            )}
          </motion.div>

        </div>
      </div>
    </AnimatedPage>
  );
}

