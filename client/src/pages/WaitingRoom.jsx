import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Loader2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import { connectSocket, emitJoinRoom, emitLeaveRoom } from '../services/socketService';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { getGame, leaveGame } from '../services/gameService';

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
    // Recursively parse string if it's double serialized or nested JSON
    while (typeof config === 'string' && (config.trim().startsWith('{') || config.trim().startsWith('"'))) {
      const parsed = JSON.parse(config);
      if (typeof parsed === 'string' && parsed === config) {
        break; // Prevent infinite loop
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

// Helper to deduplicate player list case-insensitively
const deduplicatePlayers = (list) => {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const result = [];
  for (const p of list) {
    const name = (p?.username || p?.name || '').toString().trim();
    if (!name || name.startsWith('__LEAVE__:')) continue;
    const lower = name.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push({
        username: name,
        avatar: p.avatar || '👤',
        score: p.score ?? p.totalScore ?? 0
      });
    }
  }
  return result;
};

export default function WaitingRoom() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { playerName, setPin, setPlayerName } = useGame();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light' || (!themeMode && !document.documentElement.classList.contains('dark')) || document.documentElement.classList.contains('light');
  const [players, setPlayers] = useState([]);
  const [isLeaving, setIsLeaving] = useState(false);
  const [bgImage, setBgImage] = useState(localStorage.getItem('last_bg_image') || '');
  const quizStartedRef = useRef(false);

  // Fetch quiz background image and players list on mount
  useEffect(() => {
    getGame(pin).then(res => {
      if (res.success) {
        // game.backgroundImage is cached directly on GameSession for reliability
        const bg = res.game?.backgroundImage || res.game?.quiz?.backgroundImage || '';
        console.log('[WAITING ROOM] Fetched background length:', bg.length, 'preview:', bg.substring(0, 80));
        setBgImage(bg);
        localStorage.setItem('quiz_global_bg_image', bg);
        localStorage.setItem('last_bg_image', bg);

        if (res.game?.players) {
          setPlayers(deduplicatePlayers(res.game.players));
        }
      }
    }).catch(() => {});
  }, [pin]);

  // Fallback if player refresh and context gets cleared
  const localPlayerName = playerName || localStorage.getItem('guest_playerName') || 'Player';
  const knownPlayersRef = useRef(new Set());

  const handleLeaveLobby = async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    try {
      emitLeaveRoom(pin, localPlayerName);
      await leaveGame(pin, localPlayerName).catch(() => {});
    } finally {
      localStorage.removeItem('guest_pin');
      localStorage.removeItem('guest_playerName');
      localStorage.removeItem('guest_avatar');
      toast('Left the quiz lobby', { icon: '👋' });
      navigate('/join');
    }
  };

  const handleChangeName = async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    try {
      emitLeaveRoom(pin, localPlayerName);
      await leaveGame(pin, localPlayerName).catch(() => {});
    } finally {
      // Clear previous name so the user can enter a new one, but PRESERVE the PIN
      localStorage.removeItem('guest_playerName');
      localStorage.setItem('guest_pin', pin);
      toast('Enter your new name to join', { icon: '✏️' });
      navigate(`/join?pin=${pin}`, { state: { pin } });
    }
  };

  useEffect(() => {
    if (!playerName && !localStorage.getItem('guest_playerName')) {
      toast.error('Session expired. Please join the lobby again.');
      navigate('/join');
      return;
    }

    // Persist to localStorage for fallback reload support
    if (playerName) {
      localStorage.setItem('guest_pin', pin);
      localStorage.setItem('guest_playerName', playerName);
    }

    // 1. Establish Socket Connection
    const socket = connectSocket();

    // 2. Register Player inside Socket Room (handle reconnects)
    const joinRoom = () => {
      emitJoinRoom(pin, localPlayerName);
    };
    
    socket.on('connect', joinRoom);
    if (socket.connected) {
      joinRoom();
    }

    // 3. Listen to state updates
    socket.on('player_list', (data) => {
      console.log('[SOCKET CLIENT] Received player list:', data.players);
      const activePlayers = deduplicatePlayers(data.players);
      activePlayers.forEach((p) => knownPlayersRef.current.add(p.username.toLowerCase()));
      setPlayers(activePlayers);
    });

    const handlePlayerLeft = (data) => {
      const username = (data?.username || data?.playerName || '').toString().trim();
      if (username) {
        const u = username.toLowerCase();
        knownPlayersRef.current.delete(u);
        setPlayers((prev) => prev.filter((p) => p.username.toLowerCase() !== u));
      }
    };

    socket.on('player_left', handlePlayerLeft);

    // Listen to player-joined socket event (emitted by backend socket.on('player-join'))
    socket.on('player-joined', ({ playerName }) => {
      if (playerName) {
        if (playerName.startsWith('__LEAVE__:')) {
          const username = playerName.replace('__LEAVE__:', '').trim();
          knownPlayersRef.current.delete(username.toLowerCase());
          setPlayers((prev) => prev.filter((p) => p.username.toLowerCase() !== username.toLowerCase()));
        } else {
          const trimmed = playerName.toString().trim();
          setPlayers((prev) => deduplicatePlayers([...prev, { username: trimmed, avatar: '👤', score: 0 }]));
          if (trimmed.toLowerCase() !== localPlayerName.toLowerCase() && !knownPlayersRef.current.has(trimmed.toLowerCase())) {
            knownPlayersRef.current.add(trimmed.toLowerCase());
            toast(`${trimmed} entered the quiz`, { id: `join-${trimmed}`, icon: '👋', duration: 2500 });
          }
        }
      }
    });

    socket.on('question_started', (data) => {
      console.log('[SOCKET CLIENT] Battle started! Redirecting...', data);
      quizStartedRef.current = true;
      // Store the global background before navigating
      const globalBg = localStorage.getItem('quiz_global_bg_image') || '';
      const questionBg = data?.question?.backgroundImage || '';
      const resolvedBg = questionBg || globalBg;
      localStorage.setItem('last_bg_image', resolvedBg);
      // Pass full socket data so LiveQuiz gets background immediately without extra API call
      navigate(`/live/${pin}`, { state: { socketQuestionData: data } });
    });

    const handleHostEnded = (data) => {
      if (data?.reason === 'host_left') {
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

    // Clean up socket listeners on unmount (do NOT emit leave so player is never deleted during game start)
    return () => {
      socket.off('connect', joinRoom);
      socket.off('player_list');
      socket.off('player_left', handlePlayerLeft);
      socket.off('player-joined');
      socket.off('question_started');
      socket.off('quiz_ended', handleQuizEnded);
      socket.off('show-final-result', handleQuizEnded);
      socket.off('show_final_result', handleQuizEnded);
      socket.off('room_closed', handleHostEnded);
      socket.off('host_left', handleHostEnded);
    };
  }, [pin, localPlayerName, playerName, navigate]);

  const bgConfig = parseBgConfig(bgImage);

  return (
    <AnimatedPage>
      <div className={`relative min-h-screen p-6 sm:p-8 flex flex-col items-center justify-center overflow-hidden ${
        isLight ? 'text-slate-900' : 'text-gray-200'
      }`}>
        
        {/* Customized Background Layer */}
        {bgConfig.url ? (
          <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-700">
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
          <div className="absolute inset-0 bg-background z-0 pointer-events-none" />
        )}
        
        {/* Glow Spheres */}
        <div className="absolute top-[10%] left-[10%] h-[350px] w-[350px] bg-glow-primary pointer-events-none opacity-45"></div>
        <div className="absolute bottom-[10%] right-[10%] h-[400px] w-[400px] bg-glow-secondary pointer-events-none opacity-30"></div>

        {/* Waiting card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          className={`w-full max-w-xl rounded-3xl p-8 sm:p-10 border text-center relative overflow-hidden ${
            isLight
              ? 'bg-white/95 border-slate-200 shadow-xl text-slate-900'
              : 'glass-panel border-white/5 text-white'
          }`}
        >
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

          {/* Quick Leave Lobby Button */}
          <button
            type="button"
            onClick={handleLeaveLobby}
            disabled={isLeaving}
            className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isLight
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
            }`}
            title="Leave Quiz Lobby"
          >
            {isLeaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
            <span>Leave Lobby</span>
          </button>

          {/* Large Loading animation */}
          <div className="mb-8 relative flex items-center justify-center">
            <div className={`h-20 w-20 rounded-full flex items-center justify-center relative border ${
              isLight ? 'bg-primary/10 border-primary/20' : 'bg-primary/5 border-primary/20'
            }`}>
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            {/* Pulsing ring */}
            <div className="absolute h-28 w-28 rounded-full border border-secondary/15 animate-ping opacity-25 pointer-events-none"></div>
          </div>

          <h2 className={`font-outfit text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Waiting for Host...</h2>
          <p className={`text-sm mt-2 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            Stay tuned. The host will commence the quiz battle shortly.
          </p>

          {/* Lobby PIN details */}
          <div className={`mt-6 inline-flex flex-col items-center px-6 py-2.5 rounded-2xl border font-bold ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-800'
              : 'bg-white/5 border-white/10 text-gray-300'
          }`}>
            <span className={`text-[10px] uppercase tracking-widest block mb-0.5 ${
              isLight ? 'text-slate-500' : 'text-gray-500'
            }`}>Arena PIN</span>
            <span className="font-outfit text-2xl tracking-widest text-secondary font-black">{pin}</span>
          </div>

          {/* Current Player Identification */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Joined as <strong className={isLight ? 'text-slate-900 font-extrabold' : 'text-white font-bold'}>{localPlayerName}</strong>
            </span>
            <button
              type="button"
              onClick={handleChangeName}
              disabled={isLeaving}
              className={`text-xs font-bold underline transition-colors ${
                isLight ? 'text-rose-600 hover:text-rose-800' : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              (Change Name)
            </button>
          </div>

          {/* Players joined section */}
          <div className={`mt-10 pt-8 border-t text-left ${
            isLight ? 'border-slate-100' : 'border-white/5'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-outfit text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? 'text-slate-700' : 'text-gray-500'
              }`}>
                <Users className="h-4 w-4 text-primary" />
                Challengers in Arena
              </h3>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-900'
                  : 'text-white bg-white/5 border-white/10'
              }`}>
                {players.length} Ready
              </span>
            </div>

            {players.length === 0 ? (
              <p className={`text-xs italic text-center py-4 ${
                isLight ? 'text-slate-500' : 'text-gray-500'
              }`}>Synchronizing player logs...</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
                {players.slice(0, 50).map((p, idx) => (
                  <div 
                    key={idx} 
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${
                      p.username.toLowerCase() === localPlayerName.toLowerCase()
                        ? (isLight ? 'bg-secondary/15 border-secondary/40 text-secondary font-black' : 'bg-secondary/10 border-secondary/25 text-secondary font-bold')
                        : (isLight ? 'bg-slate-100 border-slate-200 text-slate-900 font-bold' : 'bg-white/5 border-white/10 text-gray-300')
                    }`}
                  >
                    <div className={`h-1.5 w-1.5 rounded-full ${p.username.toLowerCase() === localPlayerName.toLowerCase() ? 'bg-secondary' : (isLight ? 'bg-emerald-500' : 'bg-gray-500')}`}></div>
                    <span>{p.username}</span>
                  </div>
                ))}
                {players.length > 50 && (
                  <div className={`px-3 py-1.5 rounded-lg border border-dashed text-xs font-semibold ${
                    isLight ? 'border-slate-300 bg-slate-50 text-slate-600' : 'border-white/10 bg-white/5 text-gray-400'
                  }`}>
                    + {players.length - 50} more challengers...
                  </div>
                )}
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatedPage>
  );
}
