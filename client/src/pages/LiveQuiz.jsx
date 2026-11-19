import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Loader2, ArrowRight, XCircle, LogOut, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import { connectSocket, getSocket, emitJoinRoom, emitLeaveRoom } from '../services/socketService';
import { submitAnswer, getGame, endQuestion, leaveGame } from '../services/gameService';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';

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
      if (typeof parsed === 'string' && parsed === config) {
        break;
      }
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
  } catch (e) { void e; }
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

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// 4 Geometric Option Configurations Matching Figma 1:1
const optionStyles = [
  // Option 1: Red Triangle
  {
    bg: 'bg-[rgba(255,241,242,0.7)]',
    border: 'border-[rgba(254,205,211,0.9)]',
    hover: 'hover:bg-[rgba(255,241,242,0.95)] hover:border-[#FDA4AF]',
    selectedRing: 'ring-2 ring-[#F43F5E]/60 border-[#F43F5E] shadow-sm',
    radioBorder: 'border-[rgba(251,113,133,0.9)]',
    radioDot: 'bg-[#F43F5E]',
    shape: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="#EF4444">
        <polygon points="12 4, 21 20, 3 20" />
      </svg>
    ),
  },
  // Option 2: Royal Blue Diamond
  {
    bg: 'bg-[rgba(239,246,255,0.7)]',
    border: 'border-[rgba(191,219,254,0.9)]',
    hover: 'hover:bg-[rgba(239,246,255,0.95)] hover:border-[#93C5FD]',
    selectedRing: 'ring-2 ring-[#3B82F6]/60 border-[#3B82F6] shadow-sm',
    radioBorder: 'border-[rgba(96,165,250,0.9)]',
    radioDot: 'bg-[#3B82F6]',
    shape: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="#2563EB">
        <polygon points="12 2, 22 12, 12 22, 2 12" />
      </svg>
    ),
  },
  // Option 3: Amber Circle
  {
    bg: 'bg-[rgba(255,251,235,0.7)]',
    border: 'border-[rgba(253,230,138,0.9)]',
    hover: 'hover:bg-[rgba(255,251,235,0.95)] hover:border-[#FCD34D]',
    selectedRing: 'ring-2 ring-[#F59E0B]/60 border-[#F59E0B] shadow-sm',
    radioBorder: 'border-[rgba(251,191,36,0.9)]',
    radioDot: 'bg-[#F59E0B]',
    shape: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="#F59E0B">
        <circle cx="12" cy="12" r="8.5" />
      </svg>
    ),
  },
  // Option 4: Emerald Rounded Square
  {
    bg: 'bg-[rgba(236,253,245,0.7)]',
    border: 'border-[rgba(167,243,208,0.9)]',
    hover: 'hover:bg-[rgba(236,253,245,0.95)] hover:border-[#6EE7B7]',
    selectedRing: 'ring-2 ring-[#10B981]/60 border-[#10B981] shadow-sm',
    radioBorder: 'border-[rgba(52,211,153,0.9)]',
    radioDot: 'bg-[#10B981]',
    shape: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="#10B981">
        <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      </svg>
    ),
  },
];

// Helper to highlight keywords (like HTML question from Figma)
const renderQuestionText = (text) => {
  if (!text) return '';
  if (text.includes('HTML') && text.includes('all web browsers')) {
    return (
      <>
        What does <span className="text-[#551BF5]">HTML</span> stand for, powering structure across{' '}
        <span className="text-[#551BF5]">all web browsers</span>?
      </>
    );
  }
  if (text.includes('`') || text.includes('*')) {
    const parts = text.split(/(`[^`]+`|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return <span key={i} className="text-[#551BF5] font-mono">{part.slice(1, -1)}</span>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <span key={i} className="text-[#551BF5] font-black">{part.slice(1, -1)}</span>;
      }
      return part;
    });
  }
  return text;
};

export default function LiveQuiz() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { playerName, setPin, setPlayerName, setCurrentQuestion, setLeaderboard } = useGame();
  const { themeMode } = useTheme();

  const localPlayer = (playerName || localStorage.getItem('guest_playerName') || '').trim();
  const hostToken = localStorage.getItem('token');
  const hostedPin = localStorage.getItem('current_hosted_pin');
  const isUserHost = !!hostToken && hostedPin === pin;
  const isHost = isUserHost;
  const [question, setQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(1);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [category, setCategory] = useState('general');
  const [bgImage, setBgImage] = useState(localStorage.getItem('last_bg_image') || '');

  // Ref to prevent auto-end from firing more than once per question
  const autoEndCalledRef = React.useRef(false);

  // Player state
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const questionRef = React.useRef(question);
  questionRef.current = question;

  // Leave state
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const localPlayer = (playerName || localStorage.getItem('guest_playerName') || '').trim();
    const hostToken = localStorage.getItem('token');
    const hostedPin = localStorage.getItem('current_hosted_pin');
    const isUserHost = !!hostToken && hostedPin === pin;

    if (!localPlayer && !isUserHost) {
      toast.error('Session invalid. Please join again.');
      navigate('/join');
      return;
    }

    // 1. Fetch current question details if reloaded
    const fetchCurrentState = async () => {
      try {
        const response = await getGame(pin);
        if (response.success && response.game) {
          const game = response.game;
          setTotalPlayers(game.players?.length || 0);

          if (game.status === 'active' && game.quiz?.questions) {
            const currentIdx = game.currentQuestion - 1;
            const q = game.quiz.questions[currentIdx];
            setQuestion(q);
            setQuestionNumber(game.currentQuestion);
            setTotalQuestions(game.quiz.questions.length);
            setCategory(game.quiz.category || 'general');
            const globalBg = game.backgroundImage || game.quiz.backgroundImage || '';
            const currentBg = q.backgroundImage || globalBg;
            setBgImage(currentBg);
            localStorage.setItem('last_category', game.quiz.category || 'general');
            localStorage.setItem('quiz_global_bg_image', globalBg);
            localStorage.setItem('last_bg_image', currentBg);

            if (game.questionStartTime) {
              const elapsedSeconds = Math.floor((Date.now() - new Date(game.questionStartTime).getTime()) / 1000);
              const limit = q.timeLimit || 20;
              const remaining = Math.max(0, limit - elapsedSeconds);
              setTimeLeft(remaining);
            } else {
              setTimeLeft(q.timeLimit || 20);
            }

            if (!isUserHost && localPlayer) {
              const target = localPlayer.toLowerCase();
              const myPlayerRecord = game.players?.find(p => {
                const pName = (p.name || '').trim().toLowerCase();
                const pNick = (p.nickname || '').trim().toLowerCase();
                const pFull = (p.fullName || '').trim().toLowerCase();
                return pName === target || (pNick && pNick === target) || (pFull && pFull === target);
              });
              if (myPlayerRecord) {
                const myAnswer = myPlayerRecord.answers?.find(a => a.questionIndex === currentIdx);
                if (myAnswer) {
                  setHasAnswered(true);
                  localStorage.setItem('last_hasAnswered', 'true');
                  localStorage.setItem('last_answerSubmitted', 'true');
                  setSelectedIdx(Number(myAnswer.answerIndex));
                }
              }
            }
          } else if (game.status === 'finished') {
            navigate(`/final-result/${pin}`);
          }
        }
      } catch (err) {
        console.error('Error fetching game state:', err);
      }
    };

    if (location.state?.socketQuestionData) {
      const data = location.state.socketQuestionData;
      const q = data.question;
      setQuestion(q);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setTimeLeft(data.timeLeft);
      setCategory(q.category || 'general');
      localStorage.setItem('last_category', q.category || 'general');
      const globalBg = data.quizBackgroundImage || localStorage.getItem('quiz_global_bg_image') || '';
      localStorage.setItem('quiz_global_bg_image', globalBg);
      const resolvedBg = q.backgroundImage || globalBg;
      setBgImage(resolvedBg);
      localStorage.setItem('last_bg_image', resolvedBg);
      setHasAnswered(false);
      localStorage.setItem('last_hasAnswered', 'false');
      localStorage.setItem('last_answerSubmitted', 'false');
      setSelectedIdx(null);
    } else {
      fetchCurrentState();
    }

    // 2. Connect Socket and Register Listeners
    const socket = connectSocket();
    const roleOrName = isUserHost ? 'Host' : localPlayer;

    const joinRoom = () => {
      emitJoinRoom(pin, roleOrName);
    };

    socket.on('connect', joinRoom);
    if (socket.connected) {
      joinRoom();
    }

    socket.on('timer_update', ({ timeLeft: time }) => {
      setTimeLeft(time);
    });

    socket.on('player_answered', ({ answeredCount: count, totalPlayers: total }) => {
      setAnsweredCount(count);
      setTotalPlayers(total);
    });

    socket.on('question_started', (data) => {
      const q = data.question;
      setQuestion(q);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setTimeLeft(data.timeLeft);
      setCategory(q.category || 'general');
      localStorage.setItem('last_category', q.category || 'general');
      const globalBg = data.quizBackgroundImage || localStorage.getItem('quiz_global_bg_image') || '';
      localStorage.setItem('quiz_global_bg_image', globalBg);
      const resolvedBg = q.backgroundImage || globalBg;
      setBgImage(resolvedBg);
      localStorage.setItem('last_bg_image', resolvedBg);
      setHasAnswered(false);
      localStorage.setItem('last_hasAnswered', 'false');
      setSelectedIdx(null);
      autoEndCalledRef.current = false;
    });

    socket.on('question_ended', (data) => {
      const currentQ = questionRef.current || question;
      const correctIdx = Number(data.correctAnswerIndex ?? currentQ?.correctAnswer ?? 0);
      const correctText = data.correctAnswerText || (data.options && data.options[correctIdx]) || (currentQ?.options && currentQ.options[correctIdx]) || '';

      localStorage.setItem('last_correctAnswerIndex', String(correctIdx));
      if (correctText) {
        localStorage.setItem('last_correctAnswerText', correctText);
      }
      localStorage.setItem('last_answerStats', JSON.stringify(data.answerStats || []));
      localStorage.setItem('last_leaderboard', JSON.stringify(data.leaderboard || []));
      localStorage.setItem('last_isLastQuestion', data.isLastQuestion ? 'true' : 'false');
      localStorage.setItem('last_category', category);

      if (!isUserHost) {
        const target = (localPlayer || '').trim().toLowerCase();
        const myData = data.leaderboard?.find(p => {
          const pName = (p.username || p.name || '').trim().toLowerCase();
          return pName === target;
        });
        if (myData) {
          localStorage.setItem('last_isCorrect', myData.lastAnswerCorrect ? 'true' : 'false');
          localStorage.setItem('last_pointsEarned', String(myData.pointsEarned));
          localStorage.setItem('last_score', String(myData.score));
          localStorage.setItem('last_timeTaken', String(myData.lastTimeTaken || '0.00'));
        }
      }

      setTimeout(() => {
        navigate(`/result/answer/${pin}`);
      }, 500);
    });

    const handleHostEnded = (data) => {
      if (!isUserHost && data?.reason === 'host_left') {
        const msg = 'Host ended the quiz';
        toast.error(msg, { id: 'host-ended-toast', duration: 5000 });
        localStorage.removeItem('guest_pin');
        localStorage.removeItem('guest_playerName');
        navigate('/join', { state: { endedMessage: msg } });
      }
    };

    const handleQuizEnded = (data) => {
      navigate(`/final-result/${pin}`, { state: { finalData: data } });
    };

    socket.on('quiz_ended', handleQuizEnded);
    socket.on('show-final-result', handleQuizEnded);
    socket.on('show_final_result', handleQuizEnded);
    socket.on('room_closed', handleHostEnded);
    socket.on('host_left', handleHostEnded);

    return () => {
      socket.off('connect', joinRoom);
      socket.off('timer_update');
      socket.off('player_answered');
      socket.off('question_started');
      socket.off('question_ended');
      socket.off('quiz_ended', handleQuizEnded);
      socket.off('show-final-result', handleQuizEnded);
      socket.off('show_final_result', handleQuizEnded);
      socket.off('room_closed', handleHostEnded);
      socket.off('host_left', handleHostEnded);
    };
  }, [pin, playerName, navigate, location.state]);

  const handleHostExit = () => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('host-end-quiz', { pin });
    }
    localStorage.removeItem('current_hosted_pin');
    navigate('/dashboard');
  };

  const handleLeaveLobby = () => {
    if (isLeaving) return;
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

  const [isEnding, setIsEnding] = useState(false);

  const handleManualEndQuestion = async () => {
    setIsEnding(true);
    try {
      const response = await endQuestion(pin);
      if (!response.success) {
        toast.error(response.message || 'Failed to end question');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error ending question');
    } finally {
      setIsEnding(false);
    }
  };

  const handleSelectAnswer = async (index) => {
    if (hasAnswered || isHost || timeLeft <= 0) return;

    const player = (playerName || localStorage.getItem('guest_playerName') || '').trim();
    if (!player) {
      toast.error('Player session not found. Please rejoin.');
      return;
    }

    setHasAnswered(true);
    setSelectedIdx(index);

    try {
      const response = await submitAnswer(pin, player, index);

      if (response.success) {
        localStorage.setItem('last_hasAnswered', 'true');
        localStorage.setItem('last_answerSubmitted', 'true');
        if (response.isCorrect !== undefined) {
          localStorage.setItem('last_isCorrect', response.isCorrect ? 'true' : 'false');
          localStorage.setItem('last_pointsEarned', String(response.score || 0));
          localStorage.setItem('last_score', String(response.totalScore || 0));
          localStorage.setItem('last_timeTaken', String(response.timeTakenSeconds || '0.00'));
          if (response.correctAnswer !== undefined) {
            localStorage.setItem('last_correctAnswerIndex', String(response.correctAnswer));
          }
          if (response.correctAnswerText) {
            localStorage.setItem('last_correctAnswerText', response.correctAnswerText);
          } else if (questionRef.current?.options && response.correctAnswer !== undefined) {
            const txt = questionRef.current.options[response.correctAnswer] || '';
            if (txt) localStorage.setItem('last_correctAnswerText', txt);
          }
        }
      } else {
        const msg = response.message || 'Error locking answer';
        if (msg.includes('already answered')) {
          localStorage.setItem('last_hasAnswered', 'true');
          localStorage.setItem('last_answerSubmitted', 'true');
        } else {
          toast.error(msg);
          setHasAnswered(false);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error submitting answer';
      if (msg.includes('already answered')) {
        localStorage.setItem('last_hasAnswered', 'true');
        localStorage.setItem('last_answerSubmitted', 'true');
      } else {
        toast.error(msg);
        setHasAnswered(false);
      }
    }
  };

  // Local countdown timer
  useEffect(() => {
    if (!question) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [question]);

  // Host auto-end question logic
  useEffect(() => {
    if (!isHost || !question) return;

    const autoEnd = async () => {
      if (autoEndCalledRef.current) return;
      autoEndCalledRef.current = true;
      try {
        await endQuestion(pin);
      } catch (err) {
        console.error('Error auto-ending question:', err);
        autoEndCalledRef.current = false;
      }
    };

    const allAnswered = totalPlayers > 0 && answeredCount === totalPlayers;
    const timeIsUp = timeLeft === 0;

    if (allAnswered || timeIsUp) {
      autoEnd();
    }
  }, [timeLeft, answeredCount, totalPlayers, isHost, question, pin]);

  if (!question) {
    return (
      <AnimatedPage>
        <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F7F4FD]">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#6C38FF] mx-auto" />
            <p className="text-xs text-gray-500 font-medium font-['Inter']">Synchronizing game board...</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  const bgConfig = parseBgConfig(bgImage);

  return (
    <AnimatedPage>
      <div className="relative min-h-screen w-full flex flex-col bg-[#F8F5FF] overflow-x-hidden select-none">

        {/* Customized Background Layer (if host uploaded one) or Default Brand Soft Purple */}
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
            {/* Soft Ambient Bubbles/Orbs matching Figma Screenshot */}
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
        {/* MAIN GAMEPLAY STAGE                                                      */}
        {/* ========================================================================= */}
        <main className="relative z-20 flex-1 w-full max-w-[1351px] mx-auto px-4 sm:px-8 py-5 sm:py-6 lg:py-8 flex flex-col items-center justify-start gap-5 sm:gap-6">
          
          {/* ----------------------------------------------------------------------- */}
          {/* FLOATING PROGRESS AND TIMER BAR (Figma 1:1)                             */}
          {/* ----------------------------------------------------------------------- */}
          <div
            className="w-full max-w-[1097px] rounded-[16px] px-4 py-3 flex items-center justify-between gap-4 transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0px 1px 20px rgba(0, 0, 0, 0.19)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Left: Book Icon + Counter + Progress Bar Track */}
            <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#7C3AED]" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <span className="font-['Inter'] font-bold text-[12px] leading-4 tracking-[0.3px] text-[#1E293B]">
                  Question {questionNumber} of {totalQuestions}
                </span>
                <div className="w-full h-[6px] bg-[rgba(226,232,240,0.9)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(4, (questionNumber / Math.max(1, totalQuestions)) * 100)}%`,
                      background: 'linear-gradient(90deg, #7C3AED 0%, #4F46E5 100%)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Countdown Timer */}
            <div
              className={`h-[30px] px-3 rounded-[12px] flex items-center gap-1.5 shrink-0 transition-all ${
                timeLeft <= 5 ? 'animate-pulse ring-2 ring-red-400' : ''
              }`}
              style={{
                background: '#FFF1F2',
                border: '1px solid rgba(254, 205, 211, 0.8)',
              }}
            >
              <svg className="w-4 h-4 text-[#F43F5E] shrink-0" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="font-['Inter'] font-extrabold text-[12px] leading-4 tracking-[0.6px] text-[#0F172A] tabular-nums">
                {formatTime(timeLeft).replace(':', ' : ')}
              </span>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* QUIZ DEMO CARD CONTAINER (Figma floating rounded-3xl box)                */}
          {/* ----------------------------------------------------------------------- */}
          <div
            className="w-full max-w-[1097px] rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 lg:p-12 flex flex-col gap-6 sm:gap-8 lg:gap-[39px] transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(243, 232, 255, 0.9)',
              boxShadow:
                '0px -3px 60px rgba(85, 27, 245, 0.15), 0px 10px 25px -5px rgba(0, 0, 0, 0.08), 0px 0px 0px 1px rgba(0, 0, 0, 0.08)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* INNER QUESTION CARD (Figma 1:1) */}
            <div className="w-full rounded-[18px] sm:rounded-[24px] bg-white border border-[#F1F5F9] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-5 sm:p-8 lg:p-10 flex flex-col justify-center">
              <h2 className="font-['Inter'] font-extrabold text-xl sm:text-2xl lg:text-[30px] lg:leading-[36px] tracking-[-0.75px] text-[#0F172A] leading-snug break-words">
                {renderQuestionText(question.questionText)}
              </h2>
            </div>

            {/* 2x2 ANSWER OPTIONS GRID (Figma 1:1) */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
              {question.options.map((opt, idx) => {
                const style = optionStyles[idx % optionStyles.length];
                const isSelected = selectedIdx === idx;
                const isDisabled = hasAnswered || isHost || timeLeft <= 0;

                let btnClass = `w-full min-h-[58px] sm:min-h-[64px] px-4 sm:px-5 py-3.5 sm:py-4 rounded-[16px] border shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-between gap-3 text-left transition-all ${style.bg} ${style.border}`;

                if (!isDisabled) {
                  btnClass += ` ${style.hover} cursor-pointer active:scale-[0.99] hover:scale-[1.01]`;
                } else if (isHost) {
                  btnClass += ' cursor-default';
                } else if (hasAnswered) {
                  if (isSelected) {
                    btnClass += ` ${style.selectedRing} scale-[1.01] shadow-md`;
                  } else {
                    btnClass += ' opacity-40 cursor-not-allowed scale-[0.99]';
                  }
                } else if (timeLeft <= 0) {
                  btnClass += ' opacity-40 cursor-not-allowed';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectAnswer(idx)}
                    className={btnClass}
                  >
                    {/* Left: Shape Icon + Option Text */}
                    <div className="flex items-center gap-3.5 min-w-0 pr-2">
                      <div className="w-7 h-7 flex items-center justify-center shrink-0">
                        {style.shape}
                      </div>
                      <span className="font-['Inter'] font-bold text-sm sm:text-base leading-6 text-[#0F172A] break-words">
                        {opt}
                      </span>
                    </div>

                    {/* Right: Radio Selection Circle */}
                    <div className="shrink-0 pl-1">
                      <div
                        className={`w-6 h-6 rounded-full bg-white/60 border-2 ${style.radioBorder} flex items-center justify-center transition-all`}
                      >
                        {isSelected && (
                          <div className={`w-3 h-3 rounded-full ${style.radioDot} animate-scale-in`} />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* INTERACTION / HOST STATE PANEL BELOW GRID */}
            <div className="w-full pt-1">
              {isHost ? (
                /* Host Controls */
                <div className="w-full max-w-md mx-auto rounded-2xl p-4 bg-white/95 border border-[#E9D5FF] shadow-xs text-center space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
                    <span className="uppercase tracking-wider">Lobby Progress</span>
                    <span className="text-[#0F172A] font-extrabold">{answeredCount} / {totalPlayers} Answered</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${totalPlayers ? (answeredCount / totalPlayers) * 100 : 0}%`,
                        background: 'linear-gradient(90deg, #7C3AED 0%, #4F46E5 100%)',
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleManualEndQuestion}
                    disabled={isEnding}
                    className="w-full h-10 px-4 rounded-xl text-white font-['Inter'] font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-50"
                    style={{ background: 'linear-gradient(106.05deg, #6C38FF 0%, #551BF5 100%)' }}
                  >
                    {isEnding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>End Question / Skip to Standings</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : hasAnswered ? (
                /* Player Answer Locked Banner */
                <div className="flex items-center justify-center">
                  <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-[#E9D5FF] text-[#551BF5] shadow-xs backdrop-blur-md">
                    <Loader2 className="w-4 h-4 animate-spin text-[#551BF5]" />
                    <span className="font-['Inter'] font-bold text-xs sm:text-sm">
                      Answer Locked! Waiting for other challengers...
                    </span>
                  </div>
                </div>
              ) : timeLeft <= 0 ? (
                /* Time's Up Banner */
                <div className="flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-50 border border-red-200 text-red-600 shadow-xs">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="font-['Inter'] font-bold text-xs sm:text-sm">
                      Time's Up! Moving to standings...
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

          </div>

        </main>
      </div>
    </AnimatedPage>
  );
}
