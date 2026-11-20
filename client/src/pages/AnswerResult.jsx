import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, Clock, Star, BarChart2, Hourglass, Check, X, AlertCircle, 
  Loader2, Crown, Medal, ArrowRight, ArrowLeft, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import AnimatedPage from '../components/AnimatedPage';
import { connectSocket, getSocket, emitJoinRoom, emitLeaveRoom } from '../services/socketService';
import { startQuestion, endGame, getGame, showLeaderboard, leaveGame } from '../services/gameService';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';

const isUnansweredAnswer = (answer) => {
  return answer.answerIndex === -1 || answer.answerIndex === undefined || answer.answerIndex === null;
};

const parseBgConfig = (bgStr) => {
  if (!bgStr) {
    return {
      url: '',
      blur: 0,
      brightness: 100,
      overlayOpacity: 30,
      gradientOverlay: 'none',
      gradientColor1: '#7c3aed',
      gradientColor2: '#06b6d4',
      position: 'center',
      fit: 'cover',
      darkOverlay: true
    };
  }
  try {
    let config = bgStr;
    while (typeof config === 'string' && (config.trim().startsWith('{') || config.trim().startsWith('"'))) {
      const parsed = JSON.parse(config);
      if (typeof parsed === 'string' && parsed === config) break;
      config = parsed;
    }

    if (config && typeof config === 'object') {
      return {
        url: config.url || '',
        blur: typeof config.blur === 'number' ? config.blur : 0,
        brightness: typeof config.brightness === 'number' ? config.brightness : 100,
        overlayOpacity: typeof config.overlayOpacity === 'number' ? config.overlayOpacity : 30,
        gradientOverlay: config.gradientOverlay || 'none',
        gradientColor1: config.gradientColor1 || '#7c3aed',
        gradientColor2: config.gradientColor2 || '#06b6d4',
        position: config.position || 'center',
        fit: config.fit || 'cover',
        darkOverlay: config.darkOverlay !== undefined ? !!config.darkOverlay : true
      };
    }
  } catch (e) {}
  return {
    url: typeof bgStr === 'string' ? bgStr : (bgStr?.url || ''),
    blur: 0,
    brightness: 100,
    overlayOpacity: 30,
    gradientOverlay: 'none',
    gradientColor1: '#7c3aed',
    gradientColor2: '#06b6d4',
    position: 'center',
    fit: 'cover',
    darkOverlay: true
  };
};

export default function AnswerResult() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { playerName } = useGame();
  const { themeMode } = useTheme();
  const isLight = themeMode !== 'dark';
  const localPlayer = playerName || localStorage.getItem('guest_playerName');
  const optionLetters = ['A', 'B', 'C', 'D'];

  // Active navigation tab: 'my-result' or 'standings'
  const [activeTab, setActiveTab] = useState('my-result');

  // Retrieved stats from local storage & live state
  const [isHost, setIsHost] = useState(() => {
    const hostToken = localStorage.getItem('token');
    const hostedPin = localStorage.getItem('current_hosted_pin');
    return !!hostToken && hostedPin === pin;
  });
  const [correctAnswerIdx, setCorrectAnswerIdx] = useState(() => {
    const saved = localStorage.getItem('last_correctAnswerIndex');
    return saved !== null ? Number(saved) : 0;
  });
  const [correctAnswerText, setCorrectAnswerText] = useState(() => {
    return localStorage.getItem('last_correctAnswerText') || '';
  });
  const [isCorrect, setIsCorrect] = useState(() => localStorage.getItem('last_isCorrect') === 'true');
  const [pointsEarned, setPointsEarned] = useState(() => Number(localStorage.getItem('last_pointsEarned') || 0));
  const [currentScore, setCurrentScore] = useState(() => Number(localStorage.getItem('last_score') || 0));
  const [timeTaken, setTimeTaken] = useState(() => localStorage.getItem('last_timeTaken') || '0.00');
  const [answerStats, setAnswerStats] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLastQuestion, setIsLastQuestion] = useState(() => localStorage.getItem('last_isLastQuestion') === 'true');
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(() => localStorage.getItem('last_answerSubmitted') === 'true');
  const [isLoading, setIsLoading] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isShowingLeaderboard, setIsShowingLeaderboard] = useState(false);
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('last_bg_image') || '');
  const confettiFiredRef = useRef(false);

  const myLeaderboardEntry = leaderboard.find(p => {
    const pName = (p.username || p.name || '').trim().toLowerCase();
    const target = (localPlayer || '').trim().toLowerCase();
    return pName === target;
  });

  const myRank = myLeaderboardEntry?.rank || 1;
  const myScore = myLeaderboardEntry?.totalScore !== undefined ? myLeaderboardEntry.totalScore : currentScore;

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
    let user = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) user = JSON.parse(userStr);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
    
    let isUserHost = false;

    // Read stored variables from localStorage
    const savedIsCorrect = localStorage.getItem('last_isCorrect');
    const savedPoints = localStorage.getItem('last_pointsEarned');
    const savedScore = localStorage.getItem('last_score');
    const savedCorrectIdx = localStorage.getItem('last_correctAnswerIndex');
    const savedCorrectText = localStorage.getItem('last_correctAnswerText');

    if (savedIsCorrect !== null) {
      setIsCorrect(savedIsCorrect === 'true');
      setPointsEarned(Number(savedPoints || 0));
      setCurrentScore(Number(savedScore || 0));
      setCorrectAnswerIdx(Number(savedCorrectIdx || 0));
    }
    if (savedCorrectText) {
      setCorrectAnswerText(savedCorrectText);
    }
    const savedHasSubmitted = localStorage.getItem('last_answerSubmitted');
    if (savedHasSubmitted !== null) {
      setHasSubmittedAnswer(savedHasSubmitted === 'true');
    }
    const savedTimeTaken = localStorage.getItem('last_timeTaken');
    if (savedTimeTaken !== null) {
      setTimeTaken(savedTimeTaken);
    }
    setIsLastQuestion(localStorage.getItem('last_isLastQuestion') === 'true');

    try {
      setAnswerStats(JSON.parse(localStorage.getItem('last_answerStats') || '[]'));
      setLeaderboard(JSON.parse(localStorage.getItem('last_leaderboard') || '[]'));
    } catch (e) {
      console.error('Error parsing stats:', e);
    }

    // Fetch live state to ensure accuracy
    const fetchLiveState = async () => {
      try {
        const response = await getGame(pin);
        if (response.success && response.game) {
          const game = response.game;
          isUserHost = !!hostToken && (user && (game.host === user.id || game.host?._id === user.id));
          setIsHost(isUserHost);
          const currentIdx = game.currentQuestion - 1;
          const currentQuestion = game.quiz?.questions?.[currentIdx];
          const globalBg = game.quiz?.backgroundImage || '';
          const currentBg = currentQuestion?.backgroundImage || globalBg;
          setBgImage(currentBg);
          localStorage.setItem('quiz_global_bg_image', globalBg);
          localStorage.setItem('last_bg_image', currentBg);
          setIsLastQuestion(game.currentQuestion === game.quiz?.questions?.length);
          if (currentQuestion) {
            const correctIdx = Number(currentQuestion.correctAnswer ?? 0);
            setCorrectAnswerIdx(correctIdx);
            const correctText = currentQuestion.options?.[correctIdx] || '';
            if (correctText) {
              setCorrectAnswerText(correctText);
              localStorage.setItem('last_correctAnswerText', correctText);
            }
            
            // Calculate stats for chart
            const stats = currentQuestion.options?.map((_, optIdx) => 
              game.players?.reduce((count, player) => {
                const ans = player.answers?.find(a => a.questionIndex === currentIdx);
                return count + (ans && Number(ans.answerIndex) === optIdx ? 1 : 0);
              }, 0) || 0
            ) || [];
            setAnswerStats(stats);
            
            // Find player record
            if (!isUserHost && localPlayer) {
              const myPlayerRecord = game.players?.find(p => p.name.toLowerCase() === localPlayer.toLowerCase());
              if (myPlayerRecord) {
                const myAnswer = myPlayerRecord.answers?.find(a => a.questionIndex === currentIdx);
                const submittedAnswer = myAnswer && !isUnansweredAnswer(myAnswer);
                
                const didSubmit = Boolean(submittedAnswer) || localStorage.getItem('last_answerSubmitted') === 'true';
                const correct = submittedAnswer ? myAnswer.isCorrect : localStorage.getItem('last_isCorrect') === 'true';
                
                setHasSubmittedAnswer(didSubmit);
                setIsCorrect(correct);
                setPointsEarned(submittedAnswer ? myAnswer.score : Number(localStorage.getItem('last_pointsEarned') || 0));
                setCurrentScore(myPlayerRecord.totalScore || Number(localStorage.getItem('last_score') || 0));
                setTimeTaken(submittedAnswer ? (myAnswer.timeTaken / 1000).toFixed(2) : localStorage.getItem('last_timeTaken') || '0.00');
                
                if (correct && !confettiFiredRef.current) {
                  confettiFiredRef.current = true;
                  confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 }
                  });
                }
              }
            }
          }

          // Build leaderboard
          const sortedPlayers = [...(game.players || [])].sort((a, b) => {
            const aScore = a.totalScore || 0;
            const bScore = b.totalScore || 0;
            if (aScore !== bScore) return bScore - aScore;

            const aCorrect = a.answers?.filter(ans => ans.isCorrect).length || 0;
            const bCorrect = b.answers?.filter(ans => ans.isCorrect).length || 0;
            if (aCorrect !== bCorrect) return bCorrect - aCorrect;
            const aTime = a.answers?.reduce((acc, ans) => acc + (ans.isCorrect ? ans.timeTaken : 0), 0) || 0;
            const bTime = b.answers?.reduce((acc, ans) => acc + (ans.isCorrect ? ans.timeTaken : 0), 0) || 0;
            if (aTime !== bTime) return aTime - bTime;
            return new Date(a.joinedAt || 0) - new Date(b.joinedAt || 0);
          });
          
          const leaderboardData = sortedPlayers.map((p, idx) => {
            const totalCorrect = p.answers?.filter(a => a.isCorrect).length || 0;
            const totalTimeCorrect = p.answers?.reduce((acc, ans) => acc + (ans.isCorrect ? ans.timeTaken : 0), 0) || 0;
            const currentAns = p.answers?.find(a => a.questionIndex === currentIdx);
            return {
              username: p.name,
              rank: idx + 1,
              correctAnswers: totalCorrect,
              totalScore: p.totalScore,
              timeCorrect: (totalTimeCorrect / 1000).toFixed(2),
              lastTimeTaken: currentAns && currentAns.isCorrect ? (currentAns.timeTaken / 1000).toFixed(2) : '0.00'
            };
          });
          setLeaderboard(leaderboardData);
        }
      } catch (err) {
        console.error('Error fetching live state:', err);
      }
    };
    fetchLiveState();

    // Confetti on correct answer if not already fired
    if (!isUserHost && localStorage.getItem('last_isCorrect') === 'true' && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    // Connect Socket and listen for navigation events
    const socket = connectSocket();
    const roleOrName = isUserHost ? 'Host' : localPlayer;
    
    const joinRoom = () => {
      emitJoinRoom(pin, roleOrName);
    };

    socket.on('connect', joinRoom);
    if (socket.connected) {
      joinRoom();
    }

    socket.on('question_started', (data) => {
      toast.success('Get ready for the next question!');
      navigate(`/live/${pin}`, { state: { socketQuestionData: data } });
    });

    socket.on('show_leaderboard', () => {
      navigate(`/leaderboard/${pin}`);
    });

    const handleQuizEnded = (data) => {
      navigate(`/final-result/${pin}`, { state: { finalData: data } });
    };

    socket.on('quiz_ended', handleQuizEnded);
    socket.on('show-final-result', handleQuizEnded);
    socket.on('show_final_result', handleQuizEnded);

    const handleHostEnded = (data) => {
      if (!isUserHost && data?.reason === 'host_left') {
        const msg = data?.message || 'Host has ended the quiz';
        toast.error(msg, { id: 'host-ended-toast', duration: 5000 });
        localStorage.removeItem('guest_pin');
        localStorage.removeItem('guest_playerName');
        navigate('/join', { state: { endedMessage: msg } });
      }
    };

    socket.on('room_closed', handleHostEnded);
    socket.on('host_left', handleHostEnded);

    return () => {
      socket.off('connect', joinRoom);
      socket.off('question_started');
      socket.off('show_leaderboard');
      socket.off('quiz_ended', handleQuizEnded);
      socket.off('show-final-result', handleQuizEnded);
      socket.off('show_final_result', handleQuizEnded);
      socket.off('room_closed', handleHostEnded);
      socket.off('host_left', handleHostEnded);
    };
  }, [pin, playerName, navigate, localPlayer]);

  const handleHostExit = () => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('host-end-quiz', { pin });
    }
    localStorage.removeItem('current_hosted_pin');
    toast('Quiz session ended', { icon: '🚪' });
    navigate('/dashboard');
  };

  const handleLeaveLobby = async () => {
    if (isHost) {
      handleHostExit();
      return;
    }
    setIsLeaving(true);
    try {
      emitLeaveRoom(pin, localPlayer);
    } catch (e) {
      console.error('Socket leave error:', e);
    }
    leaveGame(pin, localPlayer).catch(() => {});
    localStorage.removeItem('guest_pin');
    localStorage.removeItem('guest_playerName');
    localStorage.removeItem('guest_avatar');
    toast('Left the quiz lobby', { icon: '👋' });
    navigate('/join');
  };

  const handleShowLeaderboard = async () => {
    setIsShowingLeaderboard(true);
    try {
      const response = await showLeaderboard(pin);
      if (response.success) {
        navigate(`/leaderboard/${pin}`);
      } else {
        toast.error(response.message || 'Error showing leaderboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error showing leaderboard');
    } finally {
      setIsShowingLeaderboard(false);
    }
  };

  const handleNextStep = async () => {
    setIsLoading(true);
    try {
      if (isLastQuestion) {
        const response = await endGame(pin);
        if (response.success) {
          navigate(`/final-result/${pin}`);
        } else {
          toast.error(response.message || 'Error ending quiz');
        }
      } else {
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
          toast.error(response.message || 'Error advancing quiz');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Commencement error');
    } finally {
      setIsLoading(false);
    }
  };

  const bgConfig = parseBgConfig(bgImage);
  const isUnanswered = !hasSubmittedAnswer;

  const firstPlace = leaderboard.find(p => p.rank === 1);
  const secondPlace = leaderboard.find(p => p.rank === 2);
  const thirdPlace = leaderboard.find(p => p.rank === 3);

  return (
    <AnimatedPage>
      <div className="relative min-h-screen w-full flex flex-col bg-[#F8F5FF] overflow-x-hidden select-none">
        
        {/* Customized Background Layer or Default Brand Soft Purple */}
        {bgConfig.url ? (
          <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000 ease-out animate-fade-in">
            <div
              style={{
                backgroundImage: `url(${bgConfig.url})`,
                backgroundPosition: bgConfig.position,
                backgroundSize: bgConfig.fit,
                backgroundRepeat: 'no-repeat',
                filter: `blur(${bgConfig.blur}px) brightness(${bgConfig.brightness}%)`,
                position: 'fixed',
                inset: '-20px',
              }}
            />
            {bgConfig.darkOverlay && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: `rgba(0, 0, 0, ${bgConfig.overlayOpacity / 100})`,
                }}
              />
            )}
            {bgConfig.gradientOverlay !== 'none' && (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    bgConfig.gradientOverlay === 'linear'
                      ? `linear-gradient(135deg, ${bgConfig.gradientColor1}33, ${bgConfig.gradientColor2}33)`
                      : `radial-gradient(circle, ${bgConfig.gradientColor1}33 0%, ${bgConfig.gradientColor2}33 100%)`,
                }}
              />
            )}
          </div>
        ) : (
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[5%] left-[8%] w-[380px] h-[380px] rounded-full bg-[#E9D5FF]/40 blur-[90px]" />
            <div className="absolute bottom-[10%] right-[10%] w-[440px] h-[440px] rounded-full bg-[#DDD6FE]/40 blur-[100px]" />
            <div className="absolute top-[35%] right-[4%] w-[260px] h-[260px] rounded-full bg-[#EDE9FE]/50 blur-[80px]" />
            <div className="absolute bottom-[2%] left-[2%] w-[300px] h-[300px] rounded-full bg-[#F3E8FF]/40 blur-[80px]" />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TOP NAVIGATION BAR: Figma Header - TopNavigationBar (80px)                 */}
        {/* ========================================================================= */}
        <header className="relative z-30 w-full h-[80px] bg-white/90 border-b border-[#F1F5F9] backdrop-blur-[12px] px-4 sm:px-8">
          <div className="max-w-[1351px] h-full mx-auto flex items-center justify-between">
            {/* Brand Logo Container */}
            <Link
              to="/"
              className="flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95"
              title="GuBBi Home"
            >
              <img
                src="/gubbi-logo-transparent.png"
                alt="GuBBi"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
              />
            </Link>

            {/* Leave Lobby Button (Figma 1:1) */}
            <button
              type="button"
              onClick={handleLeaveLobby}
              disabled={isLeaving}
              className="h-[38px] px-4 py-2 rounded-[12px] bg-[#FFF0F3] border border-[#FECDD3] hover:bg-[#FFE4E8] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs select-none disabled:opacity-50"
              title={isHost ? 'Exit Quiz & Return to Dashboard' : 'Leave Quiz Lobby'}
            >
              {isLeaving ? (
                <Loader2 className="w-4 h-4 text-[#FF4769] animate-spin shrink-0" />
              ) : (
                <svg className="w-4 h-4 text-[#FF4769] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              )}
              <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#FF4769]">
                Leave Lobby
              </span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* MAIN STAGE: Segmented Controller + Figma Result Content Card              */}
        {/* ========================================================================= */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 pt-6 pb-12 w-full max-w-[1351px] mx-auto">
          
          {/* Section - Segmented Navigation Controller (850px) */}
          <div className="w-full max-w-[850px] mb-6">
            <div className="w-full h-[58px] p-[6px] bg-white/70 border border-white/60 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-[12px] rounded-[22px] flex items-center gap-2 drop-shadow-[0px_2px_15px_rgba(0,0,0,0.06)]">
              {/* Tab 1: My Result */}
              <button
                type="button"
                onClick={() => setActiveTab('my-result')}
                className={`flex-1 h-[46px] rounded-[18px] flex items-center justify-center gap-2 text-[12px] font-['Inter'] font-bold transition-all duration-200 cursor-pointer select-none ${
                  activeTab === 'my-result'
                    ? 'bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-[0px_4px_14px_rgba(79,70,229,0.25)]'
                    : 'text-[#64748B] hover:text-[#334155] bg-transparent'
                }`}
              >
                <BarChart2 className={`w-4 h-4 ${activeTab === 'my-result' ? 'text-white' : 'text-[#64748B]'}`} />
                <span>{isHost ? 'Answer Breakdown' : 'My Result'}</span>
              </button>

              {/* Tab 2: Lobby Standings */}
              <button
                type="button"
                onClick={() => setActiveTab('standings')}
                className={`flex-1 h-[46px] rounded-[18px] flex items-center justify-center gap-2 text-[12px] font-['Inter'] font-bold transition-all duration-200 cursor-pointer select-none ${
                  activeTab === 'standings'
                    ? 'bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-[0px_4px_14px_rgba(79,70,229,0.25)]'
                    : 'text-[#64748B] hover:text-[#334155] bg-transparent'
                }`}
              >
                <Trophy className={`w-4 h-4 ${activeTab === 'standings' ? 'text-white' : 'text-[#64748B]'}`} />
                <span>Lobby Standings</span>
              </button>
            </div>
          </div>

          {/* Section - Result Content Card (850px) */}
          <div className="w-full max-w-[850px] bg-white/95 border border-white/90 shadow-[0px_20px_45px_rgba(108,71,255,0.08)] backdrop-blur-[24px] rounded-[36px] p-6 sm:p-10 transition-all duration-300">
            {activeTab === 'my-result' ? (
              isHost ? (
                /* Host View: Answer Breakdown chart + Next Question controls */
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                      Host Presenter Panel
                    </span>
                    <h2 className="font-['Inter'] text-2xl font-extrabold text-slate-900 mt-2">
                      Answer Breakdown
                    </h2>
                  </div>

                  {/* Vertical Bar Chart */}
                  <div className="space-y-4">
                    {answerStats.map((count, idx) => {
                      const optionLabels = ['Option A', 'Option B', 'Option C', 'Option D'];
                      const maxCount = Math.max(...answerStats, 1);
                      const percentage = (count / maxCount) * 100;
                      const isCorrectOption = correctAnswerIdx === idx;
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className={isCorrectOption ? 'text-emerald-700 font-extrabold flex items-center gap-1' : 'text-slate-700 font-bold'}>
                              {optionLabels[idx]} {isCorrectOption && <CheckCircle className="h-4 w-4 text-emerald-600 inline" />}
                            </span>
                            <span className="font-black text-slate-900 text-xs sm:text-sm">
                              {count} {count === 1 ? 'Response' : 'Responses'}
                            </span>
                          </div>
                          <div className="w-full rounded-full h-3 overflow-hidden bg-slate-100 border border-slate-200 flex">
                            <div 
                              className={`h-full transition-all duration-1000 ${
                                isCorrectOption 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 ring-1 ring-emerald-400/50 shadow-[0_0_10px_rgba(34,197,94,0.4)]' 
                                  : 'bg-gradient-to-r from-slate-200 to-slate-300'
                              }`} 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Host Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={handleShowLeaderboard}
                      disabled={isShowingLeaderboard || isLoading}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#6C38FF] hover:bg-[#5825E3] text-white font-['Inter'] font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer select-none disabled:opacity-50"
                    >
                      {isShowingLeaderboard ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <>
                          <Trophy className="h-4 w-4 text-white" />
                          <span>Show Leaderboard Arena</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={isLoading || isShowingLeaderboard}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:opacity-95 text-white font-['Inter'] font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer select-none disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <>
                          <span className="font-extrabold">{isLastQuestion ? 'Show Final Standings' : 'Next Question Directly'}</span>
                          <ArrowRight className="h-4 w-4 text-white" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Player View: Figma 1:1 Result Content Card */
                <div className="flex flex-col items-center text-center">
                  
                  {/* Feedback Badge with Concentric Radiance Rings & Sparkle Accents */}
                  <div className="relative flex items-center justify-center mb-6">
                    {/* Floating Confetti Accents matching screenshot */}
                    {isCorrect && (
                      <>
                        {/* Blue 4-point star at top-left */}
                        <div className="absolute -left-3 top-2 pointer-events-none animate-pulse">
                          <svg className="w-4 h-4 text-[#38BDF8] fill-[#38BDF8]" viewBox="0 0 24 24">
                            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                          </svg>
                        </div>
                        {/* Yellow ticker/pill at top-right */}
                        <div className="absolute -right-3 -top-1 w-1.5 h-4 bg-[#F59E0B] rounded-full rotate-25 shadow-xs pointer-events-none" />
                      </>
                    )}

                    {/* Concentric radiance rings */}
                    <div className={`w-[112px] h-[112px] rounded-full flex items-center justify-center transition-all ${
                      isUnanswered
                        ? 'bg-[#FFEDD5]/60'
                        : isCorrect
                          ? 'bg-[#D1FAE5]/60'
                          : 'bg-[#FEE2E2]/60'
                    }`}>
                      <div className={`w-[92px] h-[92px] rounded-full flex items-center justify-center shadow-xs transition-all ${
                        isUnanswered
                          ? 'bg-[#FFEDD5]'
                          : isCorrect
                            ? 'bg-[#D1FAE5]'
                            : 'bg-[#FEE2E2]'
                      }`}>
                        <div className={`w-[76px] h-[76px] rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                          isUnanswered
                            ? 'bg-gradient-to-b from-[#F97316] to-[#EA580C] shadow-[0px_4px_16px_rgba(234,88,12,0.35)]'
                            : isCorrect
                              ? 'bg-gradient-to-b from-[#22C55E] to-[#10B981] shadow-[0px_4px_16px_rgba(16,185,129,0.35)]'
                              : 'bg-gradient-to-b from-[#EF4444] to-[#DC2626] shadow-[0px_4px_16px_rgba(220,38,38,0.35)]'
                        }`}>
                          {isUnanswered ? (
                            <AlertCircle className="w-10 h-10 text-white stroke-[3]" />
                          ) : isCorrect ? (
                            <Check className="w-10 h-10 text-white stroke-[3.5]" />
                          ) : (
                            <X className="w-10 h-10 text-white stroke-[3.5]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Headline */}
                  <h2 className={`font-['Inter'] font-extrabold text-[32px] sm:text-[38px] leading-tight tracking-tight ${
                    isUnanswered
                      ? 'text-[#C2410C]'
                      : isCorrect
                        ? 'text-[#0B4A2C]'
                        : 'text-[#991B1B]'
                  }`}>
                    {isUnanswered ? 'Answer Not Submitted' : isCorrect ? 'Correct Answer!' : 'Incorrect Answer!'}
                  </h2>

                  {/* Subtitle */}
                  <p className={`font-['Inter'] font-semibold text-[17px] sm:text-[20px] leading-snug mt-2 ${
                    isUnanswered
                      ? 'text-[#EA580C]'
                      : isCorrect
                        ? 'text-[#008A4E]'
                        : 'text-[#B91C1C]'
                  }`}>
                    {isUnanswered
                      ? 'No answer was recorded before the timer ended.'
                      : isCorrect
                        ? 'Superb speed! Claim your points.'
                        : 'Better luck on the next question!'}
                  </p>

                  {/* If incorrect or unanswered, show correct answer banner */}
                  {(!isCorrect || isUnanswered) && (
                    <div className="mt-4 px-4 py-2.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center gap-2 max-w-md mx-auto">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#9F1239]">Correct Answer:</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#E11D48] text-white text-xs font-extrabold">
                        Option {optionLetters[correctAnswerIdx] || 'A'}
                      </span>
                      {correctAnswerText && (
                        <span className="text-xs sm:text-sm font-extrabold text-[#881337] truncate">
                          {correctAnswerText}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 3 Performance Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-[750px] mt-8">
                    {/* 1. Solve Time */}
                    <div className="bg-[#F6F4FE] border border-[#E9E4FC] rounded-[20px] p-5 sm:p-6 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#E8E2FD] flex items-center justify-center mb-2.5">
                        <Clock className="w-5 h-5 text-[#6C47FF]" />
                      </div>
                      <span className="font-['Inter'] font-extrabold text-[11px] tracking-[0.08em] text-[#5B557A] uppercase">
                        SOLVE TIME
                      </span>
                      <span className="font-['Inter'] font-extrabold text-[26px] sm:text-[28px] leading-tight text-[#6C47FF] mt-1">
                        {timeTaken}s
                      </span>
                    </div>

                    {/* 2. Points Received */}
                    <div className="bg-[#EDFBF4] border border-[#D5F5E4] rounded-[20px] p-5 sm:p-6 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#D4F7E4] flex items-center justify-center mb-2.5">
                        <Star className="w-5 h-5 text-[#059669] fill-[#059669]" />
                      </div>
                      <span className="font-['Inter'] font-extrabold text-[11px] tracking-[0.08em] text-[#356B52] uppercase">
                        POINTS RECEIVED
                      </span>
                      <span className="font-['Inter'] font-extrabold text-[26px] sm:text-[28px] leading-tight text-[#059669] mt-1">
                        {isUnanswered ? '+0' : isCorrect ? `+${pointsEarned}` : '+0'}
                      </span>
                    </div>

                    {/* 3. Total Score */}
                    <div className="bg-[#F0F7FF] border border-[#DDECFC] rounded-[20px] p-5 sm:p-6 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#DCECFD] flex items-center justify-center mb-2.5">
                        <Trophy className="w-5 h-5 text-[#0284C7]" />
                      </div>
                      <span className="font-['Inter'] font-extrabold text-[11px] tracking-[0.08em] text-[#47607B] uppercase">
                        TOTAL SCORE
                      </span>
                      <span className="font-['Inter'] font-extrabold text-[26px] sm:text-[28px] leading-tight text-[#0284FE] mt-1">
                        {currentScore} pts
                      </span>
                    </div>
                  </div>

                  {/* Lobby Rank Banner */}
                  <div className="w-full max-w-[750px] bg-[#F3F1FD] border border-[#E7E2FA] rounded-[16px] px-5 py-3.5 flex items-center justify-center gap-2.5 mt-6">
                    <div className="w-7 h-7 rounded-full bg-[#6C47FF] flex items-center justify-center text-white shrink-0">
                      <BarChart2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-['Inter'] font-medium text-[14px] text-[#475569]">
                      Lobby rank: <strong className="font-extrabold text-[#6C47FF]">#{myRank}</strong>
                      <span className="mx-2 text-[#CBD5E1]">•</span>
                      Total score: <strong className="font-extrabold text-[#6C47FF]">{myScore} pts</strong>
                    </span>
                  </div>

                  {/* Waiting for Host Status Banner */}
                  <div className="w-full max-w-[750px] bg-[#F7F5FE] border border-[#ECE7FC] rounded-[16px] px-5 py-3.5 flex items-center justify-center gap-2.5 mt-3">
                    <Hourglass className="w-4 h-4 text-[#6C47FF] animate-spin shrink-0" />
                    <span className="font-['Inter'] font-bold text-[13px] text-[#6C47FF]">
                      Waiting for Host to trigger next action...
                    </span>
                  </div>

                </div>
              )
            ) : (
              /* Lobby Standings View (Podium + Leaderboard inside the 850px card) */
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#E8E2FD] flex items-center justify-center text-[#6C47FF]">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-['Inter'] font-extrabold text-lg text-slate-900">
                        Lobby Standings
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Live rankings for this question round
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                    {leaderboard.length} {leaderboard.length === 1 ? 'Challenger' : 'Challengers'}
                  </span>
                </div>

                {leaderboard.length === 0 ? (
                  <p className="text-xs italic text-center py-8 text-slate-500">
                    No score values recorded yet.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {/* Visual Podium */}
                    <div className="flex items-end justify-center gap-3 h-44 select-none px-2 pt-4">
                      {/* 2nd Place */}
                      {secondPlace ? (
                        <div className="flex flex-col items-center flex-1 min-w-0">
                          <span className="text-[11px] font-bold text-slate-800 truncate w-full text-center">
                            {secondPlace.username}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-500">
                            {secondPlace.totalScore || 0} pts
                          </span>
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: 60 }}
                            transition={{ type: 'spring', stiffness: 50, delay: 0.1 }}
                            className="w-full rounded-t-2xl flex flex-col items-center justify-center mt-2 bg-gradient-to-t from-slate-200 to-slate-100 border border-slate-300 shadow-sm"
                          >
                            <Medal className="h-5 w-5 text-slate-600 mb-1" />
                            <span className="text-[11px] font-black text-slate-700">2nd</span>
                          </motion.div>
                        </div>
                      ) : <div className="flex-1" />}

                      {/* 1st Place */}
                      {firstPlace ? (
                        <div className="flex flex-col items-center flex-1 min-w-0">
                          <Crown className="h-5 w-5 text-amber-500 animate-bounce mb-1" />
                          <span className="text-xs font-extrabold text-slate-900 truncate w-full text-center">
                            {firstPlace.username}
                          </span>
                          <span className="text-[10px] font-bold text-amber-600">
                            {firstPlace.totalScore || 0} pts
                          </span>
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: 95 }}
                            transition={{ type: 'spring', stiffness: 50 }}
                            className="w-full rounded-t-2xl flex flex-col items-center justify-center mt-2 bg-gradient-to-t from-amber-200/90 to-yellow-100 border border-amber-300 shadow-sm"
                          >
                            <Crown className="h-6 w-6 text-amber-600 mb-1" />
                            <span className="text-xs font-black text-amber-800">1st</span>
                          </motion.div>
                        </div>
                      ) : <div className="flex-1" />}

                      {/* 3rd Place */}
                      {thirdPlace ? (
                        <div className="flex flex-col items-center flex-1 min-w-0">
                          <span className="text-[11px] font-bold text-slate-800 truncate w-full text-center">
                            {thirdPlace.username}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-500">
                            {thirdPlace.totalScore || 0} pts
                          </span>
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: 45 }}
                            transition={{ type: 'spring', stiffness: 50, delay: 0.2 }}
                            className="w-full rounded-t-2xl flex flex-col items-center justify-center mt-2 bg-gradient-to-t from-amber-100 to-amber-50/70 border border-amber-200 shadow-sm"
                          >
                            <Medal className="h-4 w-4 text-amber-800 mb-0.5" />
                            <span className="text-[10px] font-black text-amber-900">3rd</span>
                          </motion.div>
                        </div>
                      ) : <div className="flex-1" />}
                    </div>

                    {/* Rankings List */}
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {leaderboard.map((player) => {
                        const isMe = player.username?.toLowerCase() === localPlayer?.toLowerCase();
                        return (
                          <div 
                            key={player.rank}
                            className={`px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                              isMe
                                ? 'bg-[#F3EEFF] border-[#DDD6FE] text-[#6C38FF] shadow-xs'
                                : 'bg-slate-50/80 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`w-6 text-center font-mono font-bold ${isMe ? 'text-[#6C38FF]' : 'text-slate-500'}`}>
                                #{player.rank}
                              </span>
                              <span className="font-bold truncate">
                                {player.username} {isMe && '(You)'}
                              </span>
                            </div>
                            <span className="font-['Inter'] font-black shrink-0 text-[#6C38FF]">
                              {player.totalScore || 0} pts
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* If Host, show control buttons here too */}
                {isHost && (
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={handleShowLeaderboard}
                      disabled={isShowingLeaderboard || isLoading}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#6C38FF] hover:bg-[#5825E3] text-white font-['Inter'] font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer select-none disabled:opacity-50"
                    >
                      {isShowingLeaderboard ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <>
                          <Trophy className="h-4 w-4 text-white" />
                          <span>Show Leaderboard Arena</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={isLoading || isShowingLeaderboard}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:opacity-95 text-white font-['Inter'] font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer select-none disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <>
                          <span className="font-extrabold">{isLastQuestion ? 'Show Final Standings' : 'Next Question Directly'}</span>
                          <ArrowRight className="h-4 w-4 text-white" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </main>
      </div>
    </AnimatedPage>
  );
}
