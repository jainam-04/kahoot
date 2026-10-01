import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, HelpCircle, ArrowRight, ArrowLeft, CheckCircle, XCircle, AlertCircle, Users, Award, Loader2, Crown, Medal,
  Cpu, Monitor, Keyboard, Mouse, Database, Server, Wifi, Terminal, Code2,
  Atom, FlaskConical, Dna, Orbit, Telescope, Microscope,
  Globe, Compass, Map, Scroll, Landmark, Anchor, History,
  Sparkles, Lightbulb, Gamepad2, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import AnimatedPage from '../components/AnimatedPage';
import { connectSocket, getSocket, emitJoinRoom, disconnectSocket } from '../services/socketService';
import { startQuestion, endGame, getGame, showLeaderboard } from '../services/gameService';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';

const isUnansweredAnswer = (answer) => {
  return answer.answerIndex === -1 || answer.answerIndex === undefined || answer.answerIndex === null;
}

const getTheme = (category, isLight = false) => {
  const cat = String(category || 'general').toLowerCase();
  
  if (isLight) {
    if (cat.includes('science') || cat.includes('biology') || cat.includes('physics') || cat.includes('chemistry') || cat.includes('lab')) {
      return {
        bg: 'bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50',
        glow1: 'bg-purple-300/20',
        glow2: 'bg-fuchsia-300/15',
        accentText: 'text-purple-700',
        badgeBg: 'bg-purple-100 text-purple-700 border border-purple-200',
        cardBorder: 'border-purple-200',
        ambientElements: null
      };
    }

    if (cat.includes('programming') || cat.includes('coding') || cat.includes('tech') || cat.includes('computer') || cat.includes('software') || cat.includes('hardware')) {
      return {
        bg: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50',
        glow1: 'bg-emerald-300/20',
        glow2: 'bg-teal-300/15',
        accentText: 'text-emerald-700 font-mono',
        badgeBg: 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono',
        cardBorder: 'border-emerald-200',
        ambientElements: null
      };
    }

    if (cat.includes('geography') || cat.includes('history') || cat.includes('social') || cat.includes('civics') || cat.includes('world')) {
      return {
        bg: 'bg-gradient-to-br from-sky-50 via-blue-50 to-amber-50',
        glow1: 'bg-blue-300/20',
        glow2: 'bg-amber-300/15',
        accentText: 'text-amber-800',
        badgeBg: 'bg-amber-100 text-amber-800 border border-amber-200',
        cardBorder: 'border-amber-200',
        ambientElements: null
      };
    }

    return {
      bg: 'bg-gradient-to-br from-slate-50 via-indigo-50/60 to-purple-50/60',
      glow1: 'bg-indigo-300/20',
      glow2: 'bg-violet-300/15',
      accentText: 'text-primary',
      badgeBg: 'bg-primary/10 text-primary border border-primary/20',
      cardBorder: 'border-slate-200',
      ambientElements: null
    };
  }

  if (cat.includes('science') || cat.includes('biology') || cat.includes('physics') || cat.includes('chemistry') || cat.includes('lab')) {
    return {
      bg: 'bg-[#0b0716] bg-gradient-to-br from-[#120b24] via-[#1b1036] to-[#0d071b]',
      glow1: 'bg-purple-600/25',
      glow2: 'bg-fuchsia-600/15',
      accentText: 'text-fuchsia-400',
      badgeBg: 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20',
      cardBorder: 'border-fuchsia-500/20',
      ambientElements: null
    };
  }
  
  if (cat.includes('programming') || cat.includes('coding') || cat.includes('tech') || cat.includes('computer') || cat.includes('software') || cat.includes('hardware')) {
    return {
      bg: 'bg-[#030a08] bg-gradient-to-br from-[#051410] via-[#0b261f] to-[#040e0b]',
      glow1: 'bg-emerald-600/20',
      glow2: 'bg-teal-600/15',
      accentText: 'text-emerald-400 font-mono',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono',
      cardBorder: 'border-emerald-500/20',
      ambientElements: null
    };
  }

  if (cat.includes('geography') || cat.includes('history') || cat.includes('social') || cat.includes('civics') || cat.includes('world')) {
    return {
      bg: 'bg-[#040c14] bg-gradient-to-br from-[#071626] via-[#0d2745] to-[#05111d]',
      glow1: 'bg-blue-600/20',
      glow2: 'bg-amber-600/10',
      accentText: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      cardBorder: 'border-amber-500/20',
      ambientElements: null
    };
  }

  return {
    bg: 'bg-[#06070d] bg-gradient-to-br from-[#0d0f1a] via-[#16182c] to-[#090a11]',
    glow1: 'bg-indigo-600/25',
    glow2: 'bg-violet-600/15',
    accentText: 'text-primary',
    badgeBg: 'bg-primary/10 text-primary',
    cardBorder: 'border-white/10 focus-within:border-primary/50',
    ambientElements: null
  };
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
      darkOverlay: true,
      textColor: '#ffffff',
      textBold: true,
      letterStyle: 'colored',
      optionColor: '#7c3aed',
      optionTextColor: '#ffffff'
    };
  }
  try {
    // FIXED: use recursive unwrap loop to handle double-serialized JSON strings
    // (matches the same logic in LiveQuiz.jsx and WaitingRoom.jsx)
    let config = bgStr;
    while (typeof config === 'string' && (config.trim().startsWith('{') || config.trim().startsWith('"'))) {
      const parsed = JSON.parse(config);
      if (typeof parsed === 'string' && parsed === config) break; // prevent infinite loop
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
        darkOverlay: config.darkOverlay !== undefined ? !!config.darkOverlay : true,
        textColor: config.textColor || '#ffffff',
        textBold: config.textBold !== undefined ? !!config.textBold : true,
        letterStyle: config.letterStyle || 'colored',
        optionColor: config.optionColor || '#7c3aed',
        optionTextColor: config.optionTextColor || '#ffffff'
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
    darkOverlay: true,
    textColor: '#ffffff',
    textBold: true,
    letterStyle: 'colored',
    optionColor: '#7c3aed',
    optionTextColor: '#ffffff'
  };
};

export default function AnswerResult() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { playerName } = useGame();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';
  const localPlayer = playerName || localStorage.getItem('guest_playerName');
  const optionLetters = ['A', 'B', 'C', 'D'];

  // Retrieved stats from local storage
  const [isHost, setIsHost] = useState(() => {
    const hostToken = localStorage.getItem('token');
    const hostedPin = localStorage.getItem('current_hosted_pin');
    const guestName = localStorage.getItem('guest_playerName');
    return !!hostToken && (hostedPin === pin || !guestName);
  });
  const [isCorrect, setIsCorrect] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [correctAnswerIdx, setCorrectAnswerIdx] = useState(0);
  const [timeTaken, setTimeTaken] = useState('0.00');
  const [answerStats, setAnswerStats] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLastQuestion, setIsLastQuestion] = useState(() => localStorage.getItem('last_isLastQuestion') === 'true');
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState('general');
  const [bgImage, setBgImage] = useState(localStorage.getItem('last_bg_image') || '');
  const [mobileTab, setMobileTab] = useState('feedback'); // 'feedback' or 'standings'
  const confettiFiredRef = useRef(false);

  const myLeaderboardEntry = leaderboard.find(p => p.username?.toLowerCase() === localPlayer?.toLowerCase());

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

    if (savedIsCorrect !== null) {
      setIsCorrect(savedIsCorrect === 'true');
      setPointsEarned(Number(savedPoints || 0));
      setCurrentScore(Number(savedScore || 0));
      setCorrectAnswerIdx(Number(savedCorrectIdx || 0));
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
    setCategory(localStorage.getItem('last_category') || 'general');

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
          setCategory(game.quiz?.category || 'general');
          const currentIdx = game.currentQuestion - 1;
          const currentQuestion = game.quiz?.questions?.[currentIdx];
          const globalBg = game.quiz?.backgroundImage || '';
          const currentBg = currentQuestion?.backgroundImage || globalBg;
          setBgImage(currentBg);
          localStorage.setItem('quiz_global_bg_image', globalBg);
          localStorage.setItem('last_bg_image', currentBg);
          setIsLastQuestion(game.currentQuestion === game.quiz?.questions?.length);
          if (currentQuestion) {
            setCorrectAnswerIdx(Number(currentQuestion.correctAnswer || 0));
            
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
                
                // Robust Fallback: If DB sync missed the answer, trust localStorage
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

    // Fallback: Play Confetti on Correct answer if not already fired
    if (!isUserHost && localStorage.getItem('last_isCorrect') === 'true' && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    // 2. Connect Socket and Listen for transition (handle reconnects)
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

  const [isShowingLeaderboard, setIsShowingLeaderboard] = useState(false);

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
        // Commences game end sequences
        const response = await endGame(pin);
        if (response.success) {
          navigate(`/final-result/${pin}`);
        } else {
          toast.error(response.message || 'Error ending quiz');
        }
      } else {
        // Advancing to next question
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

  const optionColors = [
    'bg-gradient-to-r from-red-500 to-rose-600 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.35)]',
    'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.35)]',
    'bg-gradient-to-r from-amber-500 to-yellow-600 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.35)]',
    'bg-gradient-to-r from-emerald-500 to-green-600 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
  ];

  const theme = getTheme(category, isLight);
  const bgConfig = parseBgConfig(bgImage);
  const isUnanswered = !hasSubmittedAnswer;

  const firstPlace = leaderboard.find(p => p.rank === 1);
  const secondPlace = leaderboard.find(p => p.rank === 2);
  const thirdPlace = leaderboard.find(p => p.rank === 3);
  const runnersUp = leaderboard.filter(p => p.rank > 3);

  return (
    <AnimatedPage>
      <div className="relative min-h-screen text-gray-200 p-4 sm:p-6 flex flex-col items-center justify-center transition-all duration-700 overflow-x-hidden overflow-y-auto">
        
        {/* Customized Background Layer */}
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
          <div className={`absolute inset-0 ${theme.bg} z-0 pointer-events-none`} />
        )}
        
        {/* Ambient Grid overlay */}
        <div className="absolute inset-0 ambient-grid opacity-25 pointer-events-none"></div>

        {/* Glow Spheres */}
        <div className={`absolute top-[10%] left-[10%] h-[350px] w-[350px] rounded-full ${theme.glow1} pointer-events-none filter blur-[100px]`}></div>
        <div className={`absolute bottom-[10%] right-[10%] h-[400px] w-[400px] rounded-full ${theme.glow2} pointer-events-none filter blur-[120px]`}></div>

        {/* Dynamic theme ambient effects */}
        {theme.ambientElements}

        {/* Top Header Bar for Host */}
        {isHost && (
          <div className="w-full max-w-4xl flex justify-between items-center mb-6 relative z-10 border-b border-white/5 pb-4">
            <button 
              onClick={handleHostExit}
              className="btn-premium btn-glass flex items-center gap-1.5 px-3.5 py-2 text-xs font-black uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </button>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Presenter Screen</span>
          </div>
        )}

        {/* Mobile Tab Switcher */}
        <div className="w-full max-w-4xl relative z-10 flex md:hidden gap-1 bg-white/5 border border-white/10 rounded-2xl p-1 mb-4">
          <button
            type="button"
            onClick={() => setMobileTab('feedback')}
            className={`flex-1 min-w-0 px-2 py-2.5 text-[11px] leading-tight font-black uppercase tracking-wider rounded-xl transition-all ${
              mobileTab === 'feedback'
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-premium-glow'
                : 'text-gray-200 hover:text-white bg-transparent'
            }`}
          >
            {isHost ? 'Answer Breakdown' : 'My Result'}
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('standings')}
            className={`flex-1 min-w-0 px-2 py-2.5 text-[11px] leading-tight font-black uppercase tracking-wider rounded-xl transition-all ${
              mobileTab === 'standings'
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-premium-glow'
                : 'text-gray-200 hover:text-white bg-transparent'
            }`}
          >
            Lobby Standings
          </button>
        </div>

        <div className="w-full max-w-4xl relative z-10 grid gap-6 md:gap-8 md:grid-cols-5 text-left">
          
          {/* LEFT/CENTER AREA: INDIVIDUAL SCORE OR HOST STATISTICS */}
          <div className={`md:col-span-3 min-w-0 space-y-6 md:block ${mobileTab === 'feedback' ? 'block' : 'hidden'}`}>
            {isHost ? (
              /* HOST SCREEN: ANSWER STATS CHART */
              <div className={`glass-panel rounded-3xl p-5 sm:p-8 border ${theme.cardBorder} space-y-6`}>
                <div className="border-b border-white/5 pb-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${theme.badgeBg}`}>
                    Question Standings
                  </span>
                  <h2 className="font-outfit text-xl font-extrabold text-white mt-2">Answer Breakdown</h2>
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
                          <span className={`${isCorrectOption ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                            {optionLabels[idx]} {isCorrectOption && <CheckCircle className="inline h-3.5 w-3.5 text-green-400 ml-1" />}
                          </span>
                          <span className="text-white font-bold">{count} Responses</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10 flex">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              isCorrectOption 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 ring-1 ring-white/50 shadow-[0_0_10px_rgba(34,197,94,0.5)]' 
                                : 'bg-gradient-to-r from-white/10 to-white/20'
                            }`} 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Host Control Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <button
                    onClick={handleShowLeaderboard}
                    disabled={isShowingLeaderboard || isLoading}
                    className="flex-1 btn-premium btn-primary-gradient py-3 flex items-center justify-center gap-2 text-xs font-bold shadow-premium-glow cursor-pointer"
                  >
                    {isShowingLeaderboard ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trophy className="h-3.5 w-3.5" />
                        <span>Show Leaderboard Arena</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={isLoading || isShowingLeaderboard}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg hover:shadow-purple-500/25 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-purple-400/30"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span className="text-white font-extrabold">{isLastQuestion ? 'Show Final Standings' : 'Next Question Directly'}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-white" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* PLAYER SCREEN: CORRECT / INCORRECT FEEDBACK */
              <motion.div
                initial={{ x: 0 }}
                animate={!isCorrect ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className={`glass-panel rounded-3xl p-5 sm:p-8 border text-center space-y-5 sm:space-y-6 relative overflow-hidden w-full ${
                  isUnanswered
                    ? 'border-orange-500/20 shadow-[0_8px_32px_0_rgba(249,115,22,0.15)] bg-orange-500/5'
                    : isCorrect
                      ? 'border-green-500/20 shadow-[0_8px_32px_0_rgba(34,197,94,0.15)] bg-green-500/5'
                      : 'border-red-500/20 shadow-[0_8px_32px_0_rgba(244,63,94,0.15)] bg-red-500/5'
                }`}
              >
                {/* Header Icon */}
                <div className="flex justify-center">
                  {isUnanswered ? (
                    <div className="h-16 w-16 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-[0_0_24px_rgba(249,115,22,0.35)]">
                      <AlertCircle className="h-9 w-9 stroke-[2.5]" />
                    </div>
                  ) : isCorrect ? (
                    <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center text-white shadow-premium-glow">
                      <CheckCircle className="h-9 w-9 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-accent-glow">
                      <XCircle className="h-9 w-9 stroke-[2.5]" />
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <h3 className={`font-outfit text-2xl sm:text-3xl font-black break-words ${isUnanswered ? 'text-orange-400' : isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isUnanswered ? 'Answer Not Submitted' : isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-gray-200">
                    {isUnanswered ? 'No answer was recorded before the timer ended.' : isCorrect ? 'Superb speed! Claim your points.' : `The correct answer was Option ${optionLetters[correctAnswerIdx]}`}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                  {/* Time taken */}
                  <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-[9px] text-gray-300 uppercase tracking-widest font-extrabold">SOLVE TIME</span>
                    <span className="font-outfit text-sm font-black text-secondary mt-1">{timeTaken}s</span>
                  </div>

                  {/* Points gained */}
                  <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-[9px] text-gray-300 uppercase tracking-widest font-extrabold">POINTS RECEIVED</span>
                    <span className={`font-outfit text-sm font-black mt-1 ${isUnanswered ? 'text-orange-400' : isCorrect ? 'text-green-400' : 'text-gray-400'}`}>
                      {isUnanswered ? '+0' : isCorrect ? `+${pointsEarned}` : '+0'}
                    </span>
                  </div>

                  {/* Total Standings */}
                  <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-[9px] text-gray-300 uppercase tracking-widest font-extrabold">TOTAL SCORE</span>
                    <span className="font-outfit text-sm font-black text-primary mt-1">{currentScore} pts</span>
                  </div>
                </div>

                {/* Overall Rank badge */}
                {myLeaderboardEntry && (
                  <div className="text-[11px] sm:text-xs text-gray-300 font-bold bg-white/5 border border-white/10 px-3 sm:px-4 py-2.5 rounded-xl inline-block mt-1">
                    Lobby rank: <span className="text-secondary font-black">#{myLeaderboardEntry.rank}</span> &bull; Total score: <span className="text-primary font-black">{myLeaderboardEntry.totalScore !== undefined ? myLeaderboardEntry.totalScore : currentScore} pts</span>
                  </div>
                )}

                {/* Bottom status */}
                 <p className="text-xs font-extrabold text-gray-400 animate-pulse border-t border-white/5 pt-4 sm:pt-5 mt-1">
                   Waiting for Host to trigger next action...
                 </p>
              </motion.div>
            )}
          </div>

          {/* RIGHT PANEL: PODIUM LEADERBOARD STANDINGS */}
          <div className={`glass-panel rounded-3xl p-5 sm:p-8 border ${theme.cardBorder} space-y-4 flex flex-col md:col-span-2 min-w-0 overflow-hidden md:flex ${mobileTab === 'standings' ? 'flex' : 'hidden'}`}>
            <h3 className="font-outfit text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-4">
              <Trophy className="h-4 w-4 text-primary" />
              Lobby Standings
            </h3>

            {leaderboard.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center py-8">No score values logged.</p>
            ) : (
              <div className="flex-1 flex flex-col justify-between space-y-4 min-h-[300px]">
                
                {/* Visual Podium */}
                <div className="flex items-end justify-center gap-2 h-40 mt-2 select-none shrink-0">
                  {/* 2nd Place */}
                  {secondPlace ? (
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-gray-300 truncate w-full text-center">{secondPlace.username}</span>
                      <span className="text-[8px] text-gray-400 font-semibold">{secondPlace.totalScore || 0} pts ({secondPlace.lastTimeTaken || '0.00'}s)</span>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 50 }}
                        transition={{ type: 'spring', stiffness: 50, delay: 0.2 }}
                        className="w-full bg-gradient-to-t from-white/5 to-white/15 border border-white/10 rounded-t-xl flex items-center justify-center mt-1"
                      >
                        <Medal className="h-4 w-4 text-slate-400" />
                      </motion.div>
                    </div>
                  ) : <div className="flex-1" />}

                  {/* 1st Place */}
                  {firstPlace ? (
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <Crown className="h-3 w-3 text-warning animate-bounce mb-0.5" />
                      <span className="text-[11px] font-extrabold text-white truncate w-full text-center">{firstPlace.username}</span>
                      <span className="text-[8px] text-warning font-bold">{firstPlace.totalScore || 0} pts ({firstPlace.lastTimeTaken || '0.00'}s)</span>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 80 }}
                        transition={{ type: 'spring', stiffness: 50 }}
                        className="w-full bg-gradient-to-t from-primary/10 to-primary/30 border border-primary/20 rounded-t-xl flex items-center justify-center mt-1"
                      >
                        <Crown className="h-5 w-5 text-yellow-400" />
                      </motion.div>
                    </div>
                  ) : <div className="flex-1" />}

                  {/* 3rd Place */}
                  {thirdPlace ? (
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-gray-300 truncate w-full text-center">{thirdPlace.username}</span>
                      <span className="text-[8px] text-gray-400 font-semibold">{thirdPlace.totalScore || 0} pts ({thirdPlace.lastTimeTaken || '0.00'}s)</span>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 35 }}
                        transition={{ type: 'spring', stiffness: 50, delay: 0.3 }}
                        className="w-full bg-gradient-to-t from-white/5 to-white/10 border border-white/10 rounded-t-xl flex items-center justify-center mt-1"
                      >
                        <Medal className="h-4 w-4 text-amber-700" />
                      </motion.div>
                    </div>
                  ) : <div className="flex-1" />}
                </div>

                {/* Runners Up List */}
                <div className="space-y-1.5 overflow-y-auto max-h-[150px] border-t border-white/5 pt-3 flex-1">
                  {leaderboard.slice(3).map((player, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2 rounded-lg border text-[10px] font-semibold flex items-center justify-between ${
                        player.username?.toLowerCase() === localPlayer?.toLowerCase()
                          ? 'bg-secondary/15 border-secondary/30 text-secondary' 
                          : 'bg-white/5 border-white/10 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-gray-500 font-bold">#{player.rank}</span>
                        <span className="font-bold truncate">{player.username}</span>
                      </div>
                      <span className="font-outfit font-black shrink-0">{player.totalScore || 0} pts ({player.lastTimeTaken || '0.00'}s)</span>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </AnimatedPage>
  );
}
