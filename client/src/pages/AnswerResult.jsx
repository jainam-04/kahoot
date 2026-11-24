import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Clock,
  Star,
  BarChart2,
  Hourglass,
  Check,
  X,
  AlertCircle,
  Loader2,
  Crown,
  Medal,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Award,
  Sparkles,
  Flame,
  HelpCircle,
  XCircle,
  Users,
  LogOut,
  Cpu,
  Monitor,
  Keyboard,
  Mouse,
  Database,
  Server,
  Wifi,
  Terminal,
  Code2,
  Atom,
  FlaskConical,
  Dna,
  Orbit,
  Telescope,
  Microscope,
  Globe,
  Compass,
  Map,
  Scroll,
  Landmark,
  Anchor,
  History,
  Bell,
  ChevronDown,
  Menu,
  Search,
  BarChart3,
  Lightbulb,
  Gamepad2,
  BookOpen
} from 'lucide-react';

import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import AnimatedPage from '../components/AnimatedPage';
import AppSidebar from '../components/AppSidebar';
import Avatar from '../components/Avatar';

import {
  connectSocket,
  getSocket,
  emitJoinRoom,
  emitLeaveRoom
} from '../services/socketService';

import {
  startQuestion,
  endGame,
  getGame,
  showLeaderboard,
  leaveGame
} from '../services/gameService';

import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import './AnswerResult.css';

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
  } catch (e) { }
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
  const localPlayer =
    playerName ||
    localStorage.getItem('guest_playerName') ||
    localStorage.getItem('player_name') ||
    (() => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        return u.name || u.username || '';
      } catch (e) {
        return '';
      }
    })() ||
    localStorage.getItem('username') ||
    '';
  const optionLetters = ['A', 'B', 'C', 'D'];

  // Active navigation tab: 'my-result' or 'standings'
  const [activeTab, setActiveTab] = useState('standings');

  const location = useLocation();

  // Retrieved stats from local storage, location.state & live state
  const [isHost, setIsHost] = useState(() => {
    const hostToken = localStorage.getItem('token');
    const hostedPin = localStorage.getItem('current_hosted_pin');
    return !!hostToken && (hostedPin === pin || localStorage.getItem('is_host') === 'true');
  });

  const [questionData, setQuestionData] = useState(() => {
    if (location.state?.questionData) return location.state.questionData;
    try {
      const saved = localStorage.getItem('last_questionData');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [questionNumber, setQuestionNumber] = useState(() => {
    if (location.state?.questionData?.questionNumber) return Number(location.state.questionData.questionNumber);
    const saved = localStorage.getItem('last_questionNumber');
    return saved ? Number(saved) : 1;
  });

  const [totalQuestions, setTotalQuestions] = useState(() => {
    if (location.state?.questionData?.totalQuestions) return Number(location.state.questionData.totalQuestions);
    const saved = localStorage.getItem('last_totalQuestions');
    return saved ? Number(saved) : 0;
  });

  const [category, setCategory] = useState(() => {
    return location.state?.questionData?.category || localStorage.getItem('last_category') || 'General';
  });

  const [correctAnswerIdx, setCorrectAnswerIdx] = useState(() => {
    if (location.state?.questionData?.correctAnswer !== undefined) return Number(location.state.questionData.correctAnswer);
    const saved = localStorage.getItem('last_correctAnswerIndex');
    return saved !== null ? Number(saved) : 0;
  });

  const [correctAnswerText, setCorrectAnswerText] = useState(() => {
    if (location.state?.questionData?.correctAnswerText) return location.state.questionData.correctAnswerText;
    return localStorage.getItem('last_correctAnswerText') || '';
  });

  const [isCorrect, setIsCorrect] = useState(() => localStorage.getItem('last_isCorrect') === 'true');
  const [pointsEarned, setPointsEarned] = useState(() => Number(localStorage.getItem('last_pointsEarned') || 0));
  const [currentScore, setCurrentScore] = useState(() => Number(localStorage.getItem('last_score') || 0));
  const [timeTaken, setTimeTaken] = useState(() => localStorage.getItem('last_timeTaken') || '0.00');

  const [answerStats, setAnswerStats] = useState(() => {
    if (location.state?.answerStats) return location.state.answerStats;
    try {
      const saved = localStorage.getItem('last_answerStats');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    if (location.state?.leaderboard) return location.state.leaderboard;
    try {
      const saved = localStorage.getItem('last_leaderboard');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isLastQuestion, setIsLastQuestion] = useState(() => {
    if (location.state?.isLastQuestion !== undefined) return Boolean(location.state.isLastQuestion);
    return localStorage.getItem('last_isLastQuestion') === 'true';
  });

  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(() => localStorage.getItem('last_answerSubmitted') === 'true');
  const [isLoading, setIsLoading] = useState(false);

  // Player result states
  const [isLeaving, setIsLeaving] = useState(false);
  const [isShowingLeaderboard, setIsShowingLeaderboard] = useState(false);

  // Host dashboard states
  const [mobileTab, setMobileTab] = useState('feedback');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [headerUserName] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.name || user.username || 'Host';
    } catch (error) {
      return 'Host';
    }
  });

  const [bgImage, setBgImage] = useState(
    () => localStorage.getItem('last_bg_image') || ''
  );

  const confettiFiredRef = useRef(false);

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
    let user = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) user = JSON.parse(userStr);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }

    const hostToken = localStorage.getItem('token');
    const hostedPin = localStorage.getItem('current_hosted_pin');
    let isUserHost = Boolean(
      (hostToken && hostedPin === pin) ||
      (hostToken && localStorage.getItem('is_host') === 'true')
    );
    setIsHost(isUserHost);

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
      if (correctAnswerIdx === 0 && savedCorrectIdx) {
        setCorrectAnswerIdx(Number(savedCorrectIdx));
      }
    }
    if (savedCorrectText && !correctAnswerText) {
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

    // Fetch live state to ensure accuracy
    const fetchLiveState = async () => {
      try {
        const response = await getGame(pin);
        if (response.success && response.game) {
          const game = response.game;
          const hostId = (game.host?._id || game.host)?.toString();
          const currentUserId = (user?.id || user?._id)?.toString();
          isUserHost = Boolean(
            (hostToken && hostedPin === pin) ||
            (hostToken && currentUserId && hostId && hostId === currentUserId) ||
            (hostToken && localStorage.getItem('is_host') === 'true')
          );
          setIsHost(isUserHost);
          if (isUserHost) {
            localStorage.setItem('current_hosted_pin', pin);
          }

          const currentIdx = Math.max(0, (game.currentQuestion || 1) - 1);
          const currentQuestion = game.quiz?.questions?.[currentIdx];
          if (currentQuestion) {
            setQuestionData(currentQuestion);
            localStorage.setItem('last_questionData', JSON.stringify(currentQuestion));
            const cIdx = Number(currentQuestion.correctAnswer ?? 0);
            setCorrectAnswerIdx(cIdx);
            const cText = currentQuestion.options?.[cIdx] || '';
            if (cText) {
              setCorrectAnswerText(cText);
              localStorage.setItem('last_correctAnswerText', cText);
            }
            setCategory(currentQuestion.category || game.quiz?.category || 'General');

            // Calculate stats for chart from game.players
            if (currentQuestion.options) {
              const stats = currentQuestion.options.map((_, optIdx) =>
                game.players?.reduce((count, player) => {
                  const ans = player.answers?.find(a => a.questionIndex === currentIdx);
                  return count + (ans && Number(ans.answerIndex) === optIdx ? 1 : 0);
                }, 0) || 0
              );
              setAnswerStats(stats);
              localStorage.setItem('last_answerStats', JSON.stringify(stats));
            }
          }

          setQuestionNumber(game.currentQuestion || (currentIdx + 1));
          setTotalQuestions(game.quiz?.questions?.length || 0);

          const globalBg = game.quiz?.backgroundImage || '';
          const currentBg = currentQuestion?.backgroundImage || globalBg;
          setBgImage(currentBg);
          localStorage.setItem('quiz_global_bg_image', globalBg);
          localStorage.setItem('last_bg_image', currentBg);

          if (game.quiz?.questions?.length) {
            setIsLastQuestion((game.currentQuestion || 1) >= game.quiz.questions.length);
          }

          // Build leaderboard from actual players
          if (game.players && game.players.length > 0) {
            const sortedPlayers = [...game.players].sort((a, b) => {
              const aScore = a.totalScore || 0;
              const bScore = b.totalScore || 0;
              if (aScore !== bScore) return bScore - aScore;

              const aCorrect = a.answers?.filter(ans => ans.isCorrect).length || 0;
              const bCorrect = b.answers?.filter(ans => ans.isCorrect).length || 0;

              if (aCorrect !== bCorrect) return bCorrect - aCorrect;

              const aTime = a.answers?.reduce(
                (acc, ans) => acc + (ans.isCorrect ? ans.timeTaken : 0), 0
              ) || 0;

              const bTime = b.answers?.reduce(
                (acc, ans) => acc + (ans.isCorrect ? ans.timeTaken : 0), 0
              ) || 0;

              if (aTime !== bTime) return aTime - bTime;

              return new Date(a.joinedAt || 0) - new Date(b.joinedAt || 0);
            });

            const leaderboardData = sortedPlayers.map((p, idx) => {
              const totalCorrect =
                p.answers?.filter(a => a.isCorrect).length || 0;

              const totalTimeCorrect = p.answers?.reduce(
                (acc, ans) => acc + (ans.isCorrect ? ans.timeTaken : 0),
                0
              ) || 0;

              const currentAns = p.answers?.find(
                a => a.questionIndex === currentIdx
              );

              return {
                username: p.name || p.username || `Player ${idx + 1}`,
                avatar: p.avatar,
                rank: idx + 1,
                correctAnswers: totalCorrect,
                totalScore: p.totalScore || 0,
                timeCorrect: (totalTimeCorrect / 1000).toFixed(2),
                lastTimeTaken: currentAns?.timeTaken !== undefined
                  ? (currentAns.timeTaken / 1000).toFixed(2)
                  : '0.0'
              };
            });

            setLeaderboard(leaderboardData);
            localStorage.setItem('last_leaderboard', JSON.stringify(leaderboardData));
          }

          // Find player record
          if (!isUserHost) {
            const myPlayerRecord = (localPlayer && game.players?.find(p => (p.name || '').toLowerCase() === localPlayer.toLowerCase())) ||
              (game.players?.length === 1 ? game.players[0] : null);
            if (myPlayerRecord) {
              const myAnswer = myPlayerRecord.answers?.find(a => a.questionIndex === currentIdx);
              const submittedAnswer = myAnswer && !isUnansweredAnswer(myAnswer);

              const didSubmit = Boolean(submittedAnswer) || localStorage.getItem('last_answerSubmitted') === 'true';
              const correct = submittedAnswer ? myAnswer.isCorrect : localStorage.getItem('last_isCorrect') === 'true';

              setHasSubmittedAnswer(didSubmit);
              setIsCorrect(correct);
              setPointsEarned(submittedAnswer ? (myAnswer.score ?? 0) : Number(localStorage.getItem('last_pointsEarned') || 0));
              setCurrentScore(myPlayerRecord.totalScore !== undefined ? myPlayerRecord.totalScore : Number(localStorage.getItem('last_score') || 0));
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
    leaveGame(pin, localPlayer).catch(() => { });
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

  // Build complete player roster for result and standings UI (strictly dynamic, zero fake players)
  const effectiveRoster = (leaderboard && leaderboard.length > 0)
    ? leaderboard.map((p, idx) => {
      const pName = p.username || p.name || `Player ${idx + 1}`;
      const isMe = localPlayer
        ? ((pName || '').trim().toLowerCase() === localPlayer.trim().toLowerCase() || !!p.isMe)
        : (leaderboard.length === 1 && !isHost);
      return {
        ...p,
        rank: p.rank || idx + 1,
        username: pName,
        totalScore: p.totalScore !== undefined ? p.totalScore : (p.score || 0),
        lastTimeTaken: p.lastTimeTaken || (p.timeTaken ? (Number(p.timeTaken) > 100 ? (p.timeTaken / 1000).toFixed(2) : Number(p.timeTaken).toFixed(2)) : '0.00'),
        correctAnswers: p.correctAnswers !== undefined ? p.correctAnswers : 0,
        isMe
      };
    })
    : (!isHost ? [{
      username: localPlayer || 'You',
      rank: 1,
      totalScore: currentScore || 0,
      lastTimeTaken: timeTaken || '0.00',
      correctAnswers: isCorrect ? 1 : 0,
      isMe: true
    }] : []);

  const firstPlace =
    effectiveRoster.find(p => p.rank === 1) || (effectiveRoster.length > 0 ? effectiveRoster[0] : null);

  const secondPlace =
    effectiveRoster.find(p => p.rank === 2) || (effectiveRoster.length > 1 ? effectiveRoster[1] : null);

  const thirdPlace =
    effectiveRoster.find(p => p.rank === 3) || (effectiveRoster.length > 2 ? effectiveRoster[2] : null);

  const myLeaderboardEntry =
    effectiveRoster.find(p => p.isMe) ||
    (localPlayer ? effectiveRoster.find(p => (p.username || '').toLowerCase() === localPlayer.toLowerCase()) : null) ||
    (!isHost && effectiveRoster.length === 1 ? effectiveRoster[0] : null) ||
    (!isHost && effectiveRoster.length > 0 ? effectiveRoster[0] : null);

  const myRank = myLeaderboardEntry?.rank || Number(localStorage.getItem('last_myRank') || 1);

  const myScore =
    myLeaderboardEntry?.totalScore !== undefined
      ? myLeaderboardEntry.totalScore
      : (currentScore || Number(localStorage.getItem('last_score') || 0));

  const resolvedCorrectAnswerText =
    correctAnswerText ||
    questionData?.correctAnswerText ||
    (questionData?.options && (typeof questionData.options[correctAnswerIdx] === 'string' ? questionData.options[correctAnswerIdx] : questionData.options[correctAnswerIdx]?.text)) ||
    (questionData?.answers && questionData.answers[correctAnswerIdx]) ||
    `Option ${optionLetters[correctAnswerIdx] || 'A'}`;

  const totalChallengers = effectiveRoster.length;

  // Host dashboard calculations
  const runnersUp = leaderboard.filter(p => p.rank > 3);

  const totalSubmissions = answerStats.reduce(
    (total, count) => total + (Number(count) || 0),
    0
  );

  const correctCount = Number(answerStats[correctAnswerIdx]) || 0;
  const questionAccuracy = totalSubmissions > 0
    ? Math.round((correctCount / totalSubmissions) * 100)
    : 0;

  const filteredLeaderboard = leaderboard.filter(player =>
    (player.username || '')
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
  );

  if (isHost) {
    return (
      <AnimatedPage>
        <div className="min-h-screen flex flex-col font-['Inter',sans-serif] antialiased bg-[#FDFDFE] text-slate-800">
          <AppSidebar
            isOpen={isMobileNavOpen}
            onClose={() => setIsMobileNavOpen(false)}
            onOpenProfile={() => navigate('/dashboard')}
            onOpenUpgrade={() => navigate('/dashboard')}
            onOpenSessions={() => navigate('/dashboard')}
            activeNav=""
          />

          <div className="flex-1 flex flex-col lg:pl-[230px] w-full min-w-0 transition-all">
            {/* Header: Sticky 74px matching Figma /reports & /dashboard */}
            <header className="sticky top-0 z-30 h-[74px] max-h-[74px] px-4 sm:px-8 backdrop-blur-md border-b flex items-center justify-between gap-4 bg-white/90 border-[#EEF0F6]">
              {/* Left: Mobile Drawer Hamburger Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(true)}
                  className="lg:hidden p-2 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>

              {/* Center: Live Session Status Pill */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#FAF5FF] border border-[#EDE9FE] shadow-2xs">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] sm:text-xs font-black text-[#6320EE] uppercase tracking-wider">
                    LIVE SESSION
                  </span>
                  <span className="text-slate-300 font-light text-xs">|</span>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-700 font-mono">
                    PIN: {pin}
                  </span>
                  <span className="text-slate-300 font-light text-xs hidden sm:inline">|</span>
                  <span className="text-xs font-bold text-[#6320EE] hidden sm:inline">
                    Question {questionNumber || 1} {totalQuestions ? `of ${totalQuestions}` : ''}
                  </span>
                  {category && (
                    <>
                      <span className="text-slate-300 font-light text-xs hidden md:inline">|</span>
                      <span className="text-xs font-bold text-slate-500 hidden md:inline">
                        {category}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right: End Quiz Button */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleHostExit}
                  className="h-[38px] px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  title="End Quiz & Return to Dashboard"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">End Quiz</span>
                </button>
              </div>
            </header>

            {/* Main Stage Content */}
            <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-[1120px] w-full mx-auto text-left">

              {/* Segmented Controller: Answer Breakdown vs Lobby Standings */}
              <div className="flex justify-center">
                <div className="inline-flex p-1.5 rounded-full bg-white border border-[#EDE9FE] shadow-sm gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMobileTab('feedback')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${mobileTab === 'feedback'
                      ? 'bg-gradient-to-r from-[#6320EE] to-[#7C3AED] text-white shadow-md shadow-[#6320EE]/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Answer Breakdown</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileTab('standings')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${mobileTab === 'standings'
                      ? 'bg-gradient-to-r from-[#6320EE] to-[#7C3AED] text-white shadow-md shadow-[#6320EE]/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Lobby Standings {leaderboard.length > 0 && `(${leaderboard.length})`}</span>
                  </button>
                </div>
              </div>

              {/* View 1: Answer Breakdown */}
              {mobileTab === 'feedback' ? (
                <div className="bg-white rounded-3xl border border-[#EDE9FE] shadow-[0px_4px_24px_-2px_rgba(99,32,238,0.06),0px_2px_8px_-1px_rgba(0,0,0,0.03)] p-5 sm:p-8 space-y-6">
                  {/* Top Bar: Title & Total Submissions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                    <div>
                      <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] tracking-tight">
                        Answer Breakdown
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Review participant responses and accuracy for this question
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <Users className="w-4 h-4 text-slate-500" />
                        <div className="text-left">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Submissions</span>
                          <span className="text-xs sm:text-sm font-extrabold text-[#1E1B4B]">
                            {totalSubmissions} {totalSubmissions === 1 ? 'Player' : 'Players'}
                          </span>
                        </div>
                      </div>

                      {totalSubmissions > 0 && (
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200">
                          <div className="text-left">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600">Accuracy</span>
                            <span className="text-xs sm:text-sm font-extrabold text-emerald-800">
                              {questionAccuracy}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Question Box */}
                  <div className="rounded-2xl bg-gradient-to-r from-[#FAF5FF] via-white to-[#F5F3FF] border border-[#EDE9FE] p-5 sm:p-6 shadow-2xs">
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-[#6320EE]/10 text-[#6320EE] border border-[#6320EE]/20 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Question {questionNumber || 1} {totalQuestions ? `of ${totalQuestions}` : ''}
                      </span>
                      {category && (
                        <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-white text-slate-600 border border-slate-200 shadow-2xs">
                          {category}
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg sm:text-2xl font-bold text-[#1E1B4B] leading-snug">
                      {questionData?.questionText || 'Loading question...'}
                    </h2>

                    {questionData?.image && (
                      <div className="mt-4 max-w-md mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                        <img src={questionData.image} alt="Question visual" className="w-full max-h-60 object-contain bg-slate-50" />
                      </div>
                    )}
                  </div>

                  {/* Options Breakdown Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(questionData?.options || []).map((option, idx) => {
                      const count = Number(answerStats[idx]) || 0;
                      const percentage = totalSubmissions > 0
                        ? Math.round((count / totalSubmissions) * 100)
                        : 0;
                      const isCorrectOption = correctAnswerIdx === idx;
                      const letter = optionLetters[idx] || String.fromCharCode(65 + idx);

                      const badgeStyles = [
                        'bg-rose-500 text-white shadow-rose-500/20',
                        'bg-blue-500 text-white shadow-blue-500/20',
                        'bg-amber-500 text-white shadow-amber-500/20',
                        'bg-emerald-500 text-white shadow-emerald-500/20'
                      ][idx % 4];

                      return (
                        <div
                          key={`${idx}-${option}`}
                          className={`relative rounded-2xl border-2 p-4 sm:p-5 transition-all shadow-sm ${isCorrectOption
                            ? 'border-emerald-500 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 ring-2 ring-emerald-500/20 shadow-emerald-500/10'
                            : 'border-slate-200/90 bg-white hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ${badgeStyles}`}>
                                {letter}
                              </span>
                              <span className={`text-sm sm:text-base font-bold break-words ${isCorrectOption ? 'text-emerald-950 font-extrabold' : 'text-slate-800'}`}>
                                {option}
                              </span>
                            </div>

                            {isCorrectOption && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500 text-white shadow-xs flex items-center gap-1 shrink-0 animate-in fade-in">
                                <CheckCircle className="w-3.5 h-3.5" /> Correct
                              </span>
                            )}
                          </div>

                          {/* Progress Bar & Response Count */}
                          <div className="space-y-1.5 mt-4">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-500">
                                {count} {count === 1 ? 'Player' : 'Players'}
                              </span>
                              <span className={`font-bold ${isCorrectOption ? 'text-emerald-700' : 'text-slate-700'}`}>
                                {percentage}%
                              </span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50 flex">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${isCorrectOption
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-xs'
                                  : 'bg-gradient-to-r from-[#6320EE] to-[#7C3AED]'
                                  }`}
                                style={{ width: `${Math.max(percentage, count > 0 ? 5 : 0)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {(!questionData?.options || questionData.options.length === 0) && (
                      <div className="col-span-full py-12 text-center space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#6320EE] mx-auto" />
                        <p className="text-sm font-semibold text-slate-500">Compiling question details and player responses...</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleShowLeaderboard}
                      disabled={isShowingLeaderboard || isLoading}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border-2 border-[#6320EE]/20 hover:border-[#6320EE] bg-white text-[#6320EE] font-bold text-sm shadow-xs hover:bg-[#FAF5FF] active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                    >
                      {isShowingLeaderboard ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#6320EE]" />
                      ) : (
                        <Trophy className="w-4 h-4 text-[#6320EE]" />
                      )}
                      <span>Show Leaderboard Arena</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={isLoading || isShowingLeaderboard}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#6320EE] to-[#7C3AED] hover:from-[#5218cc] hover:to-[#6d28d9] text-white font-bold text-sm shadow-md shadow-[#6320EE]/25 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          <span className="font-extrabold">
                            {isLastQuestion ? 'Show Final Standings' : 'Next Question Directly'}
                          </span>
                          <ArrowRight className="w-4 h-4 text-white" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* View 2: Lobby Standings */
                <div className="bg-white rounded-3xl border border-[#EDE9FE] shadow-[0px_4px_24px_-2px_rgba(99,32,238,0.06),0px_2px_8px_-1px_rgba(0,0,0,0.03)] p-5 sm:p-8 space-y-6">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-2xs">
                        <Trophy className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] tracking-tight">
                          Lobby Standings
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          Real-time challenger rankings after Question {questionNumber || 1}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#FAF5FF] text-[#6320EE] border border-[#EDE9FE]">
                        {effectiveRoster.length} {effectiveRoster.length === 1 ? 'Challenger' : 'Challengers'}
                      </span>
                    </div>
                  </div>

                  {/* Top Podium (100% Dynamic based on player count!) */}
                  {effectiveRoster.length > 0 ? (
                    <div
                      className={`grid ${effectiveRoster.length === 1
                        ? 'grid-cols-1 max-w-sm mx-auto'
                        : effectiveRoster.length === 2
                          ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
                          : 'grid-cols-1 sm:grid-cols-3'
                        } gap-4 pt-2`}
                    >
                      {/* 2nd Place */}
                      {secondPlace && (
                        <div className={`${effectiveRoster.length === 2 ? 'order-2' : 'order-2 sm:order-1'} rounded-2xl bg-slate-50/80 border border-slate-200 p-5 text-center flex flex-col items-center justify-between shadow-2xs`}>
                          <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-700 font-extrabold text-lg flex items-center justify-center mb-2">
                            {secondPlace.avatar ? <Avatar emoji={secondPlace.avatar} /> : (secondPlace.username || 'P').charAt(0).toUpperCase()}
                          </div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                            2nd Place
                          </span>
                          <h4 className="font-bold text-slate-900 mt-2 text-base truncate max-w-full">
                            {secondPlace.username}
                          </h4>
                          <span className="text-xl font-extrabold text-[#6320EE] mt-1">
                            {secondPlace.totalScore || 0} pts
                          </span>
                          <span className="text-xs text-slate-500 mt-1">
                            {secondPlace.correctAnswers || 0} correct
                          </span>
                        </div>
                      )}

                      {/* 1st Place */}
                      {firstPlace && (
                        <div className="order-1 sm:order-2 rounded-2xl bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 p-6 text-center flex flex-col items-center justify-between shadow-md relative sm:-mt-3">
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-white rounded-full p-1.5 shadow-xs">
                            <Crown className="w-4 h-4 fill-white" />
                          </div>
                          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xl flex items-center justify-center mb-2 ring-4 ring-amber-200">
                            {firstPlace.avatar ? <Avatar emoji={firstPlace.avatar} /> : (firstPlace.username || 'P').charAt(0).toUpperCase()}
                          </div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 uppercase tracking-wide">
                            1st Place {effectiveRoster.length === 1 && '• Champion'}
                          </span>
                          <h4 className="font-extrabold text-slate-900 mt-2 text-lg truncate max-w-full">
                            {firstPlace.username}
                          </h4>
                          <span className="text-2xl font-black text-[#6320EE] mt-1">
                            {firstPlace.totalScore || 0} pts
                          </span>
                          <span className="text-xs font-semibold text-slate-500 mt-1">
                            {firstPlace.correctAnswers || 0} correct • {firstPlace.lastTimeTaken || '0.0'}s
                          </span>
                        </div>
                      )}

                      {/* 3rd Place */}
                      {thirdPlace && (
                        <div className="order-3 rounded-2xl bg-slate-50/80 border border-slate-200 p-5 text-center flex flex-col items-center justify-between shadow-2xs">
                          <div className="w-12 h-12 rounded-full bg-amber-100/70 text-amber-900 font-extrabold text-lg flex items-center justify-center mb-2">
                            {thirdPlace.avatar ? <Avatar emoji={thirdPlace.avatar} /> : (thirdPlace.username || 'P').charAt(0).toUpperCase()}
                          </div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                            3rd Place
                          </span>
                          <h4 className="font-bold text-slate-900 mt-2 text-base truncate max-w-full">
                            {thirdPlace.username}
                          </h4>
                          <span className="text-xl font-extrabold text-[#6320EE] mt-1">
                            {thirdPlace.totalScore || 0} pts
                          </span>
                          <span className="text-xs text-slate-500 mt-1">
                            {thirdPlace.correctAnswers || 0} correct
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-500">
                      <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold">No player scores recorded yet.</p>
                    </div>
                  )}

                  {/* Full Rankings List */}
                  {effectiveRoster.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span>Challenger</span>
                        <div className="flex items-center gap-6">
                          <span>Accuracy</span>
                          <span className="w-20 text-right">Score</span>
                        </div>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {effectiveRoster.map((player) => (
                          <div key={player.rank} className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 text-center text-xs font-extrabold ${player.rank === 1 ? 'text-amber-500' : player.rank === 2 ? 'text-slate-500' : player.rank === 3 ? 'text-amber-700' : 'text-slate-400'}`}>
                                #{player.rank}
                              </span>
                              <div className="w-8 h-8 rounded-full bg-[#FAF5FF] text-[#6320EE] font-bold text-xs flex items-center justify-center border border-[#EDE9FE]">
                                {player.avatar ? <Avatar emoji={player.avatar} /> : (player.username || 'P').charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-bold text-slate-800">
                                {player.username}
                              </span>
                            </div>
                            <div className="flex items-center gap-6">
                              <span className="text-xs text-slate-500">
                                {player.correctAnswers || 0} {totalQuestions ? `/${totalQuestions}` : ''} correct
                              </span>
                              <span className="w-20 text-right font-extrabold text-sm text-[#6320EE]">
                                {player.totalScore || 0} pts
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setMobileTab('feedback')}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Answer Breakdown</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#6320EE] to-[#7C3AED] hover:from-[#5218cc] hover:to-[#6d28d9] text-white font-bold text-sm shadow-md shadow-[#6320EE]/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          <span className="font-extrabold">
                            {isLastQuestion ? 'Show Final Standings' : 'Next Question Directly'}
                          </span>
                          <ArrowRight className="w-4 h-4 text-white" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </AnimatedPage>
    );
  }

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
        {/* MAIN STAGE: Segmented Controller + Grand Container Card                   */}
        {/* ========================================================================= */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 pt-6 pb-12 w-full max-w-[1351px] mx-auto">

          {/* Section - Segmented Navigation Controller (830px Figma 1:1) */}
          <div className="w-full max-w-[830px] mb-6">
            <div className="w-full h-[58px] p-[6px] bg-white/70 border border-white/60 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-[12px] rounded-[22px] flex items-center gap-2 drop-shadow-[0px_2px_15px_rgba(0,0,0,0.06)]">
              {/* Tab 1: My Result */}
              <button
                type="button"
                onClick={() => setActiveTab('my-result')}
                className={`flex-1 h-[46px] rounded-[18px] flex items-center justify-center gap-2 text-[12px] font-['Inter'] font-bold transition-all duration-200 cursor-pointer select-none ${activeTab === 'my-result'
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
                className={`flex-1 h-[46px] rounded-[18px] flex items-center justify-center gap-2 text-[12px] font-['Inter'] font-bold transition-all duration-200 cursor-pointer select-none ${activeTab === 'standings'
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-[0px_4px_14px_rgba(79,70,229,0.25)]'
                  : 'text-[#64748B] hover:text-[#334155] bg-transparent'
                  }`}
              >
                <Trophy className={`w-4 h-4 ${activeTab === 'standings' ? 'text-white' : 'text-[#64748B]'}`} />
                <span>Lobby Standings</span>
              </button>
            </div>
          </div>

          {activeTab === 'my-result' ? (
            /* ======================================================================= */
            /* VIEW A: MY RESULT CONTENT CARD (953px)                                   */
            /* ======================================================================= */
            <div className="relative w-full max-w-[953px] bg-white border border-[#F3E8FF]/60 shadow-[0px_20px_25px_-5px_rgba(59,7,100,0.05),0px_8px_10px_-6px_rgba(59,7,100,0.05)] backdrop-blur-[4px] rounded-[32px] px-6 sm:px-10 py-7 sm:py-10 transition-all duration-300 overflow-hidden isolate">

              {/* Corner gradient blobs */}
              <div className="absolute w-[224px] h-[224px] -right-[63px] -top-[63px] bg-[rgba(255,228,230,0.4)] blur-[64px] rounded-full pointer-events-none z-0" />
              <div className="absolute w-[224px] h-[224px] -left-[63px] -top-[63px] bg-[rgba(243,232,255,0.4)] blur-[64px] rounded-full pointer-events-none z-0" />

              {isHost ? (
                /* Host View: Answer Breakdown */
                <div className="relative z-10 space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                      Host Presenter Panel
                    </span>
                    <h2 className="font-['Inter'] text-2xl font-extrabold text-slate-900 mt-2">
                      Answer Breakdown
                    </h2>
                  </div>

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
                              className={`h-full transition-all duration-1000 ${isCorrectOption
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
                /* Player View: Result Feedback */
                <div className="relative z-10 flex flex-col items-center text-center">

                  {/* Feedback Badge */}
                  <div className="relative w-[112px] h-[112px] flex items-center justify-center mb-4 isolate">
                    {!isCorrect && !isUnanswered && (
                      <>
                        <div className="absolute w-[6px] h-[12px] -left-[15px] -top-[12.5px] bg-[#F87171] rounded-full -rotate-[40deg] pointer-events-none z-0" />
                        <div className="absolute w-[6px] h-[14px] right-[18.7px] -top-[16.6px] bg-[#F87171] rounded-full rotate-[25deg] pointer-events-none z-1" />
                        <div className="absolute w-[12px] h-[6px] -left-[20px] top-[28px] bg-[#F87171] rounded-full pointer-events-none z-2" />
                        <div className="absolute w-[8px] h-[6px] -right-[19.4px] top-[31px] bg-[#F87171] rounded-full rotate-[15deg] pointer-events-none z-3" />
                      </>
                    )}

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

                    <div className={`w-[112px] h-[112px] rounded-full flex items-center justify-center transition-all ${isUnanswered
                      ? 'bg-[rgba(255,237,213,0.7)] shadow-[0px_0px_45px_8px_rgba(249,115,22,0.22)]'
                      : isCorrect
                        ? 'bg-[rgba(209,250,229,0.7)] shadow-[0px_0px_45px_8px_rgba(34,197,94,0.22)]'
                        : 'bg-[rgba(254,226,226,0.7)] shadow-[0px_0px_45px_8px_rgba(239,68,68,0.22)]'
                      }`}>
                      <div className={`w-[92px] h-[92px] rounded-full flex items-center justify-center border-[4px] border-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition-all ${isUnanswered
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

                  {/* Heading 1 */}
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

                  <p className="font-['Inter'] font-medium text-[16px] leading-[24px] text-[#64748B] text-center mt-1.5">
                    {isUnanswered
                      ? 'No answer was recorded before the timer ended.'
                      : isCorrect
                        ? 'Superb speed! Claim your points.'
                        : "Better luck next time! Keep going, you're doing great."}
                  </p>

                  {/* The Correct Answer Revealed Banner */}
                  {(!isCorrect || isUnanswered) && (
                    <div className="w-full max-w-[871px] min-h-[55px] bg-[rgba(255,241,242,0.7)] border border-[rgba(254,205,211,0.8)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[16px] px-5 py-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-5">
                      <span className="font-['Inter'] font-bold text-[14px] leading-[20px] tracking-[0.7px] uppercase text-[#64748B]">
                        THE CORRECT ANSWER IS
                      </span>

                      <div className="h-[32px] px-4 py-1.5 bg-[#EF4444] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-full flex items-center gap-1.5 shrink-0">
                        <div className="w-1.5 h-1.5 bg-white rounded-[1px] rotate-45 shrink-0" />
                        <span className="font-['Inter'] font-bold text-[14px] leading-[20px] text-white">
                          Option {optionLetters[correctAnswerIdx] || 'A'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-['Inter'] font-extrabold text-[18px] leading-[28px] text-[#FB7185]">
                          :
                        </span>
                        <span className="font-['Inter'] font-bold text-[16px] leading-[24px] text-[#0F172A] break-words">
                          {resolvedCorrectAnswerText}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Performance Metrics */}
                  <div className="w-full max-w-[871px] grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-6">
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

                    <div className="relative bg-[#F0F7FF] border border-[#DDECFC] rounded-[24px] p-5 sm:p-6 flex flex-col items-center justify-center shadow-[0px_8px_24px_-4px_rgba(79,70,229,0.05)]">
                      <div className="w-12 h-12 rounded-full bg-[#DCECFD] flex items-center justify-center mb-3">
                        <Trophy className="w-6 h-6 text-[#0284C7] stroke-[2]" />
                      </div>
                      <span className="font-['Inter'] font-bold text-[12px] leading-[18px] tracking-[0.6px] text-[#47607B] uppercase text-center mb-1">
                        TOTAL SCORE
                      </span>
                      <span className="font-['Inter'] font-extrabold text-[34px] leading-[36px] tracking-[-0.85px] text-[#0284FE] text-center">
                        {(myScore !== undefined && myScore !== null ? myScore : (currentScore || 0)).toLocaleString()} pts
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator Banners */}
                  <div className="w-full max-w-[871px] flex flex-col gap-3 mt-6">
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
                          Total score: <strong className="font-bold text-[18px] text-[#6C47FF]">{(myScore !== undefined && myScore !== null ? myScore : (currentScore || 0)).toLocaleString()} pts</strong>
                        </span>
                      </div>
                    </div>

                    <div className="w-full min-h-[46px] bg-[#F7F5FE] border border-[#ECE7FC] rounded-[16px] px-5 py-2.5 flex items-center justify-center gap-2.5">
                      <Hourglass className="w-4 h-4 text-[#6C47FF] animate-spin shrink-0" />
                      <span className="font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#6C47FF] text-center">
                        Waiting for Host to trigger next action...
                      </span>
                    </div>
                  </div>

                </div>
              )}
            </div>
          ) : (
            /* ======================================================================= */
            /* VIEW B: GRAND CONTAINER CARD (1232px Figma 1:1 Lobby Standings)          */
            /* ======================================================================= */
            <div className="w-full max-w-[1232px] flex flex-col gap-6">

              <div className="w-full bg-[rgba(255,255,255,0.96)] border border-white/80 shadow-[0px_20px_25px_-5px_rgba(168,85,247,0.05),0px_8px_10px_-6px_rgba(168,85,247,0.05)] backdrop-blur-[16px] rounded-[24px] p-3.5 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6 md:gap-8 transition-all">

                {/* 1. Header: View Selector & Live Room Badge */}
                <div className="w-full border-b border-[#F1F5F9] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left: Icon + Title + Live Badge */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[16px] bg-[#EEF2FF] border border-[#E0E7FF] shadow-xs flex items-center justify-center shrink-0">
                      <BarChart2 className="w-5 h-5 text-[#551BF5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-['Inter'] font-bold text-[18px] leading-7 tracking-[-0.45px] text-[#0F172A]">
                          Lobby Standings
                        </h2>
                        <span className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                          <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#059669]">Live</span>
                        </span>
                      </div>
                      <p className="font-['Inter'] text-[12px] leading-4 text-[#64748B] mt-0.5">
                        See how you rank against other players in this live lobby.
                      </p>
                    </div>
                  </div>

                  {/* Right: Room Meta Badge */}
                  <div className="bg-[rgba(250,245,255,0.8)] border border-[#F3E8FF] rounded-[16px] px-3.5 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2.5 sm:gap-3 shrink-0 self-start sm:self-auto shadow-xs">
                    <div className="flex items-center -space-x-2">
                      {effectiveRoster.slice(0, 3).map((p, idx) => (
                        <div
                          key={p.rank || idx}
                          className={`w-6 h-6 rounded-full ring-2 ring-white flex items-center justify-center text-white text-[10px] font-bold overflow-hidden ${idx === 0 ? 'bg-[#FBBF24]' : idx === 1 ? 'bg-[#818CF8]' : 'bg-[#FB923C]'
                            }`}
                        >
                          {(p.avatar || (p.isMe && localStorage.getItem('guest_avatar'))) ? (
                            <Avatar emoji={p.avatar || localStorage.getItem('guest_avatar')} />
                          ) : (
                            (p.username || 'P').charAt(0).toUpperCase()
                          )}
                        </div>
                      ))}
                    </div>
                    <span className="font-['Inter'] font-semibold text-[11px] sm:text-[12px] leading-4 text-[#581C87]">
                      {totalChallengers} {totalChallengers === 1 ? 'Challenger' : 'Challengers'} Battling
                    </span>
                  </div>
                </div>

                {/* 2. Upper Showcase: The Grand 3D Podium (Dynamic Celebratory Showcase) */}
                {effectiveRoster.length > 0 && (
                  <div className="w-full bg-gradient-to-b from-[rgba(250,245,255,0.6)] to-[rgba(255,255,255,0.9)] border border-[rgba(243,232,255,0.9)] rounded-[24px] shadow-xs pt-6 pb-4 px-4 sm:px-8 relative overflow-hidden flex flex-col items-center">

                    {/* Decorative Sparkles & Stars */}
                    <div className="absolute top-6 left-12 text-[#D8B4FE] pointer-events-none select-none text-xs">★</div>
                    <div className="absolute top-10 right-14 text-[#FBBF24] pointer-events-none select-none text-sm">✦</div>
                    <div className="absolute top-14 left-1/4 text-[#818CF8] pointer-events-none select-none text-xs">★</div>
                    <div className="absolute top-12 right-1/4 text-[#FCD34D] pointer-events-none select-none text-xs">★</div>

                    {/* Section Label */}
                    <h3 className="font-['Inter'] font-extrabold text-[16px] leading-6 text-[#1E293B] text-center mb-6 z-10">
                      {effectiveRoster.length === 1 ? 'Leading Champion' : effectiveRoster.length === 2 ? 'Top 2 Players' : 'Top 3 Players'}
                    </h3>

                    {/* 3D Podium Construct */}
                    <div className={`w-full ${effectiveRoster.length === 1
                      ? 'max-w-[220px]'
                      : effectiveRoster.length === 2
                        ? 'max-w-[360px]'
                        : 'max-w-[480px]'
                      } flex items-end justify-center gap-3 sm:gap-4 z-10 relative`}>

                      {/* Rank 2 (Silver) - shown on left when 3+ players */}
                      {secondPlace && effectiveRoster.length > 2 && (
                        <div className="flex-1 flex flex-col items-center">
                          <div className="w-14 h-14 rounded-full bg-[#E8F0FE] shadow-[0px_4px_12px_rgba(184,206,248,0.45)] flex items-center justify-center mb-2 shrink-0">
                            {(secondPlace.avatar || (secondPlace.isMe && localStorage.getItem('guest_avatar'))) ? (
                              <Avatar emoji={secondPlace.avatar || localStorage.getItem('guest_avatar')} />
                            ) : (
                              <Crown className="w-7 h-7 text-[#5C7094]" />
                            )}
                          </div>
                          <span className="font-['Inter'] font-extrabold text-[16px] leading-6 tracking-[-0.4px] text-[#1E293B] truncate max-w-[120px] text-center">
                            {secondPlace.username}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5 mb-2.5">
                            <span className="font-['Inter'] font-black text-[12px] leading-4 text-[#334155]">
                              {(secondPlace.totalScore || 0).toLocaleString()} pts
                            </span>
                            <span className="bg-[rgba(241,245,249,0.9)] border border-[rgba(226,232,240,0.6)] rounded-full px-2 py-0.5 text-[11px] font-semibold text-[#64748B]">
                              {secondPlace.lastTimeTaken || '0.00'}s
                            </span>
                          </div>

                          {/* Pedestal Block 2 */}
                          <div
                            className="w-full h-[144px] rounded-t-[24px] rounded-b-[12px] flex items-start justify-center pt-5 relative shadow-[0px_10px_24px_-4px_rgba(184,206,248,0.6)]"
                            style={{ background: 'linear-gradient(180deg, #D4E2FC 0%, #B8CEF8 100%)' }}
                          >
                            <div className="w-11 h-11 rounded-full bg-white/90 border-2 border-white/60 shadow-sm flex items-center justify-center text-[#334155] font-['Inter'] font-black text-[20px]">
                              2
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rank 1 (Gold - Elevated Center for 3+ or solo champion) */}
                      {firstPlace && (
                        <div className={`flex-1 flex flex-col items-center ${effectiveRoster.length === 1 ? 'mt-0' : '-mt-6'}`}>
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mb-2 shrink-0 shadow-[0px_8px_24px_-2px_rgba(245,158,11,0.55)]"
                            style={{ background: 'radial-gradient(91.92% 91.92% at 35% 35%, #FFE270 0%, #FFA800 100%)' }}
                          >
                            {(firstPlace.avatar || (firstPlace.isMe && localStorage.getItem('guest_avatar'))) ? (
                              <Avatar emoji={firstPlace.avatar || localStorage.getItem('guest_avatar')} />
                            ) : (
                              <Crown className="w-8 h-8 text-[#5C2B04]" />
                            )}
                          </div>
                          <span className="font-['Inter'] font-black text-[18px] leading-7 tracking-[-0.45px] text-[#0F172A] truncate max-w-[130px] text-center">
                            {firstPlace.username || localPlayer || 'You'}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5 mb-2.5">
                            <span className="font-['Inter'] font-black text-[14px] leading-5 text-[#78350F]">
                              {(firstPlace.totalScore !== undefined ? firstPlace.totalScore : (myScore || currentScore || 0)).toLocaleString()} pts
                            </span>
                            <span className="bg-[#FEF3C7] border border-[rgba(253,230,138,0.8)] shadow-xs rounded-full px-2 py-0.5 text-[12px] font-bold text-[#92400E]">
                              {firstPlace.lastTimeTaken || timeTaken || '0.00'}s
                            </span>
                          </div>

                          {/* Pedestal Block 1 */}
                          <div
                            className="w-full h-[208px] rounded-t-[24px] rounded-b-[12px] flex items-start justify-center pt-6 relative shadow-[0px_16px_36px_-4px_rgba(245,158,11,0.45)]"
                            style={{ background: 'linear-gradient(180deg, #FFCE34 0%, #F59E0B 100%)' }}
                          >
                            <div className="w-12 h-12 rounded-full bg-white/95 border-2 border-white/80 shadow-md flex items-center justify-center text-[#78350F] font-['Inter'] font-black text-[24px]">
                              1
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rank 2 (Silver) - placed next to Rank 1 when exactly 2 players */}
                      {secondPlace && effectiveRoster.length === 2 && (
                        <div className="flex-1 flex flex-col items-center">
                          <div className="w-14 h-14 rounded-full bg-[#E8F0FE] shadow-[0px_4px_12px_rgba(184,206,248,0.45)] flex items-center justify-center mb-2 shrink-0">
                            {(secondPlace.avatar || (secondPlace.isMe && localStorage.getItem('guest_avatar'))) ? (
                              <Avatar emoji={secondPlace.avatar || localStorage.getItem('guest_avatar')} />
                            ) : (
                              <Crown className="w-7 h-7 text-[#5C7094]" />
                            )}
                          </div>
                          <span className="font-['Inter'] font-extrabold text-[16px] leading-6 tracking-[-0.4px] text-[#1E293B] truncate max-w-[120px] text-center">
                            {secondPlace.username}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5 mb-2.5">
                            <span className="font-['Inter'] font-black text-[12px] leading-4 text-[#334155]">
                              {(secondPlace.totalScore || 0).toLocaleString()} pts
                            </span>
                            <span className="bg-[rgba(241,245,249,0.9)] border border-[rgba(226,232,240,0.6)] rounded-full px-2 py-0.5 text-[11px] font-semibold text-[#64748B]">
                              {secondPlace.lastTimeTaken || '0.00'}s
                            </span>
                          </div>

                          {/* Pedestal Block 2 */}
                          <div
                            className="w-full h-[144px] rounded-t-[24px] rounded-b-[12px] flex items-start justify-center pt-5 relative shadow-[0px_10px_24px_-4px_rgba(184,206,248,0.6)]"
                            style={{ background: 'linear-gradient(180deg, #D4E2FC 0%, #B8CEF8 100%)' }}
                          >
                            <div className="w-11 h-11 rounded-full bg-white/90 border-2 border-white/60 shadow-sm flex items-center justify-center text-[#334155] font-['Inter'] font-black text-[20px]">
                              2
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rank 3 (Bronze) */}
                      {thirdPlace && (
                        <div className="flex-1 flex flex-col items-center">
                          <div className="w-14 h-14 rounded-full bg-[#FFE3CA] shadow-[0px_4px_12px_rgba(251,146,60,0.4)] flex items-center justify-center mb-2 shrink-0">
                            {(thirdPlace.avatar || (thirdPlace.isMe && localStorage.getItem('guest_avatar'))) ? (
                              <Avatar emoji={thirdPlace.avatar || localStorage.getItem('guest_avatar')} />
                            ) : (
                              <Crown className="w-7 h-7 text-[#833A0B]" />
                            )}
                          </div>
                          <span className="font-['Inter'] font-extrabold text-[16px] leading-6 tracking-[-0.4px] text-[#1E293B] truncate max-w-[120px] text-center">
                            {thirdPlace.username}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5 mb-2.5">
                            <span className="font-['Inter'] font-black text-[12px] leading-4 text-[#334155]">
                              {(thirdPlace.totalScore || 0).toLocaleString()} pts
                            </span>
                            <span className="bg-[rgba(241,245,249,0.9)] border border-[rgba(226,232,240,0.6)] rounded-full px-2 py-0.5 text-[11px] font-semibold text-[#64748B]">
                              {thirdPlace.lastTimeTaken || '0.00'}s
                            </span>
                          </div>

                          {/* Pedestal Block 3 */}
                          <div
                            className="w-full h-[112px] rounded-t-[24px] rounded-b-[12px] flex items-start justify-center pt-4 relative shadow-[0px_10px_24px_-4px_rgba(251,146,60,0.5)]"
                            style={{ background: 'linear-gradient(180deg, #FFC488 0%, #FB923C 100%)' }}
                          >
                            <div className="w-11 h-11 rounded-full bg-white/90 border-2 border-white/60 shadow-sm flex items-center justify-center text-[#7C2D12] font-['Inter'] font-black text-[20px]">
                              3
                            </div>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Base Platform Bar beneath columns */}
                      <div className={`w-full ${effectiveRoster.length === 1
                        ? 'max-w-[180px]'
                        : effectiveRoster.length === 2
                          ? 'max-w-[320px]'
                          : 'max-w-[430px]'
                        } h-3.5 bg-white/95 border border-white/80 rounded-full shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] -mt-1.5 z-20`} />
                    </div>
                )}

                    {/* 3. Lower Section: Full Live Standings Roster */}
                    <div className="w-full flex flex-col gap-3">

                      {/* Roster Header */}
                      <div className="w-full bg-white border border-[#E2E8F0]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[16px] px-3.5 sm:px-5 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className="font-['Inter'] font-extrabold text-[13px] sm:text-[14px] leading-5 text-[#1E293B] whitespace-nowrap">
                            Live Standings
                          </h4>
                          <span className="bg-[#EEF2FF] border border-[#E0E7FF] text-[#551BF5] rounded-full px-2 py-0.5 font-['Inter'] font-bold text-[10px] sm:text-[12px] leading-4 shrink-0 whitespace-nowrap">
                            {totalChallengers} {totalChallengers === 1 ? 'Challenger' : 'Challengers'}
                          </span>
                        </div>
                        <span className="font-['Inter'] font-semibold text-[11px] sm:text-[12px] leading-4 text-[#64748B] whitespace-nowrap">
                          Showing <strong className="font-bold text-[#0F172A]">Top {effectiveRoster.length}</strong> of {totalChallengers}
                        </span>
                      </div>

                      {/* Scrollable Roster Items List */}
                      <div className="w-full flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-0.5 sm:pr-1">
                        {effectiveRoster.map((player) => {
                          const isMe = player.isMe || (player.username || '').toLowerCase() === (localPlayer || '').toLowerCase();
                          const isRank1 = player.rank === 1;
                          const isRank2 = player.rank === 2;
                          const isRank3 = player.rank === 3;

                          let rowClass = 'w-full rounded-[16px] p-2.5 sm:p-3.5 transition-all ';

                          if (isMe) {
                            rowClass += 'bg-[rgba(250,245,255,0.9)] border-2 border-[rgba(85,27,245,0.7)] shadow-[0px_4px_6px_-1px_rgba(168,85,247,0.1)]';
                          } else if (isRank1) {
                            rowClass += 'bg-[rgba(255,251,235,0.7)] border border-[rgba(253,230,138,0.8)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]';
                          } else {
                            rowClass += 'bg-white border border-[#E2E8F0]/90 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]';
                          }

                          return (
                            <div key={player.rank} className={rowClass}>
                              <div className="flex items-center justify-between gap-2 w-full min-w-0">
                                {/* Left: Rank + Avatar + Name Details */}
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  {/* Rank circle badge */}
                                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-['Inter'] font-black text-[11px] sm:text-[12px] shrink-0 ${isMe
                                    ? 'bg-[#551BF5] text-white shadow-xs'
                                    : isRank1
                                      ? 'bg-[#FBBF24] text-[#451A03] shadow-xs'
                                      : 'bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569]'
                                    }`}>
                                    {player.rank}
                                  </div>

                                  {/* Avatar circle (Single avatar ONLY!) */}
                                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-['Inter'] font-bold text-[12px] shrink-0 overflow-hidden ${isMe
                                    ? 'bg-[#551BF5] text-white'
                                    : isRank1
                                      ? 'bg-[#FEF3C7] border border-[#FDE68A] text-[#1E293B]'
                                      : isRank2
                                        ? 'bg-[#EEF2FF] border border-[#E0E7FF] text-[#1E293B]'
                                        : isRank3
                                          ? 'bg-[#FFF7ED] border border-[#FFEDD5] text-[#1E293B]'
                                          : 'bg-[#ECFDF5] border border-[#D1FAE5] text-[#059669]'
                                    }`}>
                                    {(player.avatar || (isMe && localStorage.getItem('guest_avatar'))) ? (
                                      <Avatar emoji={player.avatar || localStorage.getItem('guest_avatar')} />
                                    ) : isRank1 ? '👑' : isRank2 ? '⚡' : isRank3 ? '🔥' : (player.username || 'P').charAt(0).toUpperCase()}
                                  </div>

                                  {/* Name + Badges */}
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`font-['Inter'] font-extrabold text-[13px] sm:text-[14px] leading-tight truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[200px] ${isMe ? 'text-[#1E1B4B]' : 'text-[#0F172A]'
                                        }`}>
                                        {player.username}
                                      </span>

                                      {isMe && (
                                        <span className="bg-[#551BF5] text-white font-['Inter'] font-extrabold text-[9px] leading-3 uppercase px-1.5 py-0.5 rounded-full shrink-0">
                                          YOU
                                        </span>
                                      )}
                                      {isRank1 && (
                                        <span className="bg-[rgba(253,230,138,0.7)] text-[#92400E] font-['Inter'] font-bold text-[9px] leading-3 px-1.5 py-0.5 rounded shrink-0">
                                          1st
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-['Inter'] font-medium text-[10.5px] sm:text-[12px] leading-4 text-[#64748B] truncate">
                                      {player.correctAnswers !== undefined ? player.correctAnswers : 0}{totalQuestions ? `/${totalQuestions}` : ''} correct
                                    </span>
                                  </div>
                                </div>

                                {/* Right: Score + Time badge */}
                                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                  <div className="flex flex-col items-end">
                                    <span className={`font-['Inter'] font-black text-[13px] sm:text-[15px] leading-tight tracking-tight ${isMe ? 'text-[#551BF5]' : 'text-[#0F172A]'
                                      }`}>
                                      {(player.totalScore || 0).toLocaleString()} pts
                                    </span>
                                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#94A3B8]">
                                      {player.streak && player.streak > 1 ? `${player.streak}🔥 streak` : `Rank #${player.rank}`}
                                    </span>
                                  </div>

                                  <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-[12px] font-['Inter'] font-bold shrink-0 ${isMe
                                    ? 'bg-white border border-[#E9D5FF] text-[#551BF5] shadow-2xs'
                                    : isRank1
                                      ? 'bg-[rgba(254,243,199,0.9)] border border-[rgba(253,230,138,0.8)] text-[#92400E]'
                                      : 'bg-[#F1F5F9] text-[#64748B]'
                                    }`}>
                                    {player.lastTimeTaken || '0.00'}s
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    {/* 4. Bottom Persistent User Standing Anchor Bar */}
                    <div
                      className="w-full rounded-[16px] sm:rounded-[20px] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 shadow-[0px_10px_15px_-3px_rgba(147,51,234,0.2)]"
                      style={{ background: 'linear-gradient(90deg, #551BF5 0%, #4F46E5 100%)' }}
                    >
                      {/* Left: Rank Square + Name + Percentile */}
                      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center text-white font-['Inter'] font-black text-[13px] sm:text-[14px] shrink-0">
                          #{myRank}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="font-['Inter'] font-bold text-[13px] sm:text-[14px] leading-5 text-white truncate max-w-[140px] xs:max-w-[180px] sm:max-w-none">
                              {localPlayer || 'You'} (You)
                            </span>
                            <span className="bg-[#34D399] text-[#022C22] font-['Inter'] font-black text-[9px] sm:text-[10px] leading-4 uppercase px-2 py-0.5 rounded-full shrink-0">
                              {myRank === 1 ? '#1 RANK' : `TOP ${Math.max(1, Math.round((myRank / Math.max(totalChallengers, 1)) * 100))}%`}
                            </span>
                          </div>
                          <p className="font-['Inter'] font-medium text-[11px] sm:text-[12px] leading-4 text-[#E9D5FF] mt-0.5 truncate">
                            {totalChallengers <= 1
                              ? 'Currently leading the lobby solo!'
                              : myRank === 1
                                ? `Ahead of ${totalChallengers - 1} ${totalChallengers - 1 === 1 ? 'challenger' : 'challengers'} in this lobby`
                                : `Ahead of ${Math.max(0, totalChallengers - myRank)} ${Math.max(0, totalChallengers - myRank) === 1 ? 'challenger' : 'challengers'}`}
                          </p>
                        </div>
                      </div>

                      {/* Right: Score + View All Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t border-white/10 sm:border-0">
                        <div className="flex flex-col items-start sm:items-end">
                          <span className="font-['Inter'] font-black text-[15px] sm:text-[18px] leading-tight tracking-tight text-white">
                            {myScore.toLocaleString()} pts
                          </span>
                          <span className="font-['Inter'] font-medium text-[10px] sm:text-[11px] leading-3 text-[#E9D5FF]">
                            Time: {timeTaken || '0.00'}s
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate(`/leaderboard/${pin}`)}
                          className="h-8 px-3.5 sm:px-4 rounded-[12px] bg-white text-[#551BF5] font-['Inter'] font-bold text-[11px] sm:text-[12px] leading-4 hover:bg-slate-50 active:scale-95 transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
                        >
                          {totalChallengers <= 1 ? 'Full Standings' : `View All (${totalChallengers})`}
                        </button>
                      </div>
                    </div>

                    {/* Host Control Actions if viewing as Host */}
                    {isHost && (
                      <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-slate-100">
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

              {/* Waiting For Host Synchronizer Notice Banner */}
                <div className="w-full bg-[rgba(250,245,255,0.7)] border border-[rgba(243,232,255,0.9)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[16px] px-5 py-3 flex items-center justify-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#551BF5]/80 animate-spin shrink-0" />
                  <span className="font-['Inter'] font-medium text-[12px] leading-4 text-[#551BF5] text-center">
                    Waiting for Host to trigger next question or end the session...
                  </span>
                </div>

              </div>
          )}

            </main>
      </div>
    </AnimatedPage>
  );
}
