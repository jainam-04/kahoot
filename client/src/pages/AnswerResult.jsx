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

          {/* Section - Result Content Card (Figma: width 953px, max-w 1000px, 32px radius) */}
          <div className="relative w-full max-w-[953px] bg-white border border-[#F3E8FF]/60 shadow-[0px_20px_25px_-5px_rgba(59,7,100,0.05),0px_8px_10px_-6px_rgba(59,7,100,0.05)] backdrop-blur-[4px] rounded-[32px] px-6 sm:px-10 py-7 sm:py-10 transition-all duration-300 overflow-hidden isolate">
            
            {/* Subtle internal decorative gradient blobs in card top corners */}
            <div className="absolute w-[224px] h-[224px] -right-[63px] -top-[63px] bg-[rgba(255,228,230,0.4)] blur-[64px] rounded-full pointer-events-none z-0" />
            <div className="absolute w-[224px] h-[224px] -left-[63px] -top-[63px] bg-[rgba(243,232,255,0.4)] blur-[64px] rounded-full pointer-events-none z-0" />

            {activeTab === 'my-result' ? (
              isHost ? (
                /* Host View: Answer Breakdown chart + Next Question controls */
                <div className="relative z-10 space-y-6">
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
                /* Player View: Figma 1:1 Result Feedback */
                <div className="relative z-10 flex flex-col items-center text-center">
                  
                  {/* Feedback Badge with Concentric Halo, Inner Circle & Accents */}
                  <div className="relative w-[112px] h-[112px] flex items-center justify-center mb-4 isolate">
                    
                    {/* Playful radial exclamation dashes for Wrong Answer (Figma 1:1) */}
                    {!isCorrect && !isUnanswered && (
                      <>
                        {/* Top-left dash */}
                        <div className="absolute w-[6px] h-[12px] -left-[15px] -top-[12.5px] bg-[#F87171] rounded-full -rotate-[40deg] pointer-events-none z-0" />
                        {/* Top-right dash */}
                        <div className="absolute w-[6px] h-[14px] right-[18.7px] -top-[16.6px] bg-[#F87171] rounded-full rotate-[25deg] pointer-events-none z-1" />
                        {/* Left horizontal dash */}
                        <div className="absolute w-[12px] h-[6px] -left-[20px] top-[28px] bg-[#F87171] rounded-full pointer-events-none z-2" />
                        {/* Right horizontal dash */}
                        <div className="absolute w-[8px] h-[6px] -right-[19.4px] top-[31px] bg-[#F87171] rounded-full rotate-[15deg] pointer-events-none z-3" />
                      </>
                    )}

                    {/* Accents for Correct Answer */}
                    {isCorrect && (
                      <>
                        <div className="absolute -left-3 top-2 pointer-events-none animate-pulse">
                          <svg className="w-4 h-4 text-[#38BDF8] fill-[#38BDF8]" viewBox="0 0 24 24">
                            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                          </svg>
                        </div>
                        <div className="absolute -right-3 -top-1 w-1.5 h-4 bg-[#F59E0B] rounded-full rotate-25 shadow-xs pointer-events-none" />
                      </>
                    )}

                    {/* Concentric Outer Halo */}
                    <div className={`w-[112px] h-[112px] rounded-full flex items-center justify-center transition-all ${
                      isUnanswered
                        ? 'bg-[rgba(255,237,213,0.7)] shadow-[0px_0px_45px_8px_rgba(249,115,22,0.22)]'
                        : isCorrect
                          ? 'bg-[rgba(209,250,229,0.7)] shadow-[0px_0px_45px_8px_rgba(34,197,94,0.22)]'
                          : 'bg-[rgba(254,226,226,0.7)] shadow-[0px_0px_45px_8px_rgba(239,68,68,0.22)]'
                    }`}>
                      {/* Concentric Inner Circle */}
                      <div className={`w-[92px] h-[92px] rounded-full flex items-center justify-center border-[4px] border-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition-all ${
                        isUnanswered
                          ? 'bg-[#F97316]'
                          : isCorrect
                            ? 'bg-gradient-to-b from-[#22C55E] to-[#10B981]'
                            : 'bg-[#EF4444]'
                      }`}>
                        {isUnanswered ? (
                          <AlertCircle className="w-10 h-10 text-white stroke-[3.5]" />
                        ) : isCorrect ? (
                          <Check className="w-10 h-10 text-white stroke-[3.5]" />
                        ) : (
                          <X className="w-10 h-10 text-white stroke-[3.5]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Heading 1 - Feedback Headlines */}
                  <h2 className="font-['Inter'] font-extrabold text-[36px] leading-[40px] tracking-[-0.9px] text-center mt-2">
                    {isUnanswered ? (
                      <>
                        <span className="text-[#EA580C]">Answer Not</span> <span className="text-[#0F172A]">Submitted</span>
                      </>
                    ) : isCorrect ? (
                      <span className="text-[#0B4A2C]">Correct Answer!</span>
                    ) : (
                      <>
                        <span className="text-[#EF4444]">Wrong</span> <span className="text-[#0F172A]">Answer</span>
                      </>
                    )}
                  </h2>

                  {/* Subtitle */}
                  <p className="font-['Inter'] font-medium text-[16px] leading-[24px] text-[#64748B] text-center mt-1.5">
                    {isUnanswered
                      ? 'No answer was recorded before the timer ended.'
                      : isCorrect
                        ? 'Superb speed! Claim your points.'
                        : "Better luck next time! Keep going, you're doing great."}
                  </p>

                  {/* The Correct Answer Revealed Banner (Figma 1:1) */}
                  {(!isCorrect || isUnanswered) && (
                    <div className="w-full max-w-[871px] min-h-[55px] bg-[rgba(255,241,242,0.7)] border border-[rgba(254,205,211,0.8)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[16px] px-5 py-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-5">
                      <span className="font-['Inter'] font-bold text-[14px] leading-[20px] tracking-[0.7px] uppercase text-[#64748B]">
                        THE CORRECT ANSWER IS
                      </span>

                      {/* Option Pill */}
                      <div className="h-[32px] px-4 py-1.5 bg-[#EF4444] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-full flex items-center gap-1.5 shrink-0">
                        <div className="w-1.5 h-1.5 bg-white rounded-[1px] rotate-45 shrink-0" />
                        <span className="font-['Inter'] font-bold text-[14px] leading-[20px] text-white">
                          Option {optionLetters[correctAnswerIdx] || 'A'}
                        </span>
                      </div>

                      {/* Colon & Option Answer Text */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-['Inter'] font-extrabold text-[18px] leading-[28px] text-[#FB7185]">
                          :
                        </span>
                        <span className="font-['Inter'] font-bold text-[16px] leading-[24px] text-[#0F172A] break-words">
                          {correctAnswerText || 'HyperText Markup Language'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Section - Performance Metrics (3-Column Performance Stats Cards) */}
                  <div className="w-full max-w-[871px] grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-6">
                    {/* Card 1: Solve Time */}
                    <div className="relative bg-[#F6F4FE] border border-[#E9E4FC] rounded-[24px] p-5 sm:p-6 flex flex-col items-center justify-center shadow-[0px_8px_24px_-4px_rgba(79,70,229,0.05)]">
                      <div className="w-12 h-12 rounded-full bg-[#E8E2FD] flex items-center justify-center mb-3">
                        <Clock className="w-6 h-6 text-[#6C47FF] stroke-[2.2]" />
                      </div>
                      <span className="font-['Inter'] font-bold text-[12px] leading-[18px] tracking-[0.6px] text-[#5B557A] uppercase text-center mb-1">
                        SOLVE TIME
                      </span>
                      <span className="font-['Inter'] font-extrabold text-[34px] leading-[36px] tracking-[-0.85px] text-[#6C47FF] text-center">
                        {timeTaken}s
                      </span>
                    </div>

                    {/* Card 2: Points Received */}
                    <div className="relative bg-[#EDFBF4] border border-[#D5F5E4] rounded-[24px] p-5 sm:p-6 flex flex-col items-center justify-center shadow-[0px_8px_24px_-4px_rgba(79,70,229,0.05)]">
                      <div className="w-12 h-12 rounded-full bg-[#D4F7E4] flex items-center justify-center mb-3">
                        <Star className="w-6 h-6 text-[#059669] fill-[#059669]" />
                      </div>
                      <span className="font-['Inter'] font-bold text-[12px] leading-[18px] tracking-[0.6px] text-[#356B52] uppercase text-center mb-1">
                        POINTS RECEIVED
                      </span>
                      <span className="font-['Inter'] font-extrabold text-[34px] leading-[36px] tracking-[-0.85px] text-[#059669] text-center">
                        {isUnanswered ? '+0' : isCorrect ? `+${pointsEarned}` : '+0'}
                      </span>
                    </div>

                    {/* Card 3: Total Score */}
                    <div className="relative bg-[#F0F7FF] border border-[#DDECFC] rounded-[24px] p-5 sm:p-6 flex flex-col items-center justify-center shadow-[0px_8px_24px_-4px_rgba(79,70,229,0.05)]">
                      <div className="w-12 h-12 rounded-full bg-[#DCECFD] flex items-center justify-center mb-3">
                        <Trophy className="w-6 h-6 text-[#0284C7] stroke-[2]" />
                      </div>
                      <span className="font-['Inter'] font-bold text-[12px] leading-[18px] tracking-[0.6px] text-[#47607B] uppercase text-center mb-1">
                        TOTAL SCORE
                      </span>
                      <span className="font-['Inter'] font-extrabold text-[34px] leading-[36px] tracking-[-0.85px] text-[#0284FE] text-center">
                        {currentScore} pts
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator Banners (Lobby Rank + Waiting Banner) */}
                  <div className="w-full max-w-[871px] flex flex-col gap-3 mt-6">
                    {/* Lobby Rank Banner */}
                    <div className="w-full min-h-[45px] bg-[#F3F1FD] border border-[#E7E2FA] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[16px] px-5 py-2.5 flex items-center justify-center gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-[#6C47FF] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center text-white shrink-0">
                        <BarChart2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 text-center">
                        <span className="font-['Inter'] font-medium text-[16px] leading-[24px] text-[#334155]">
                          Lobby rank: <strong className="font-bold text-[18px] text-[#6C47FF]">#{myRank}</strong>
                        </span>
                        <span className="font-bold text-[16px] text-[#94A3B8]">•</span>
                        <span className="font-['Inter'] font-medium text-[16px] leading-[24px] text-[#334155]">
                          Total score: <strong className="font-bold text-[18px] text-[#6C47FF]">{myScore} pts</strong>
                        </span>
                      </div>
                    </div>

                    {/* Waiting Banner */}
                    <div className="w-full min-h-[46px] bg-[#F7F5FE] border border-[#ECE7FC] rounded-[16px] px-5 py-2.5 flex items-center justify-center gap-2.5">
                      <Hourglass className="w-4 h-4 text-[#6C47FF] animate-spin shrink-0" />
                      <span className="font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#6C47FF] text-center">
                        Waiting for Host to trigger next action...
                      </span>
                    </div>
                  </div>

                </div>
              )
            ) : (
              /* Lobby Standings View (Podium + Leaderboard inside the 953px card) */
              <div className="relative z-10 space-y-6">
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
