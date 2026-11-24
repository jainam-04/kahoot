import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit2,
  Lightbulb,
  Loader2,
  LockKeyhole,
  Menu,
  Play,
  QrCode,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Users,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import AppSidebar from '../components/AppSidebar';
import { getGame as fetchGameDetails, startQuestion } from '../services/gameService';
import { connectSocket, getSocket, emitJoinRoom } from '../services/socketService';
import { getStoredUser } from '../utils/auth';
import tunnelData from '../tunnel.json';
import hostLobbyRocket from '../assets/host-lobby-rocket.png';
import './HostLobby.css';

// Canonical Avatar Themes matching reference design palette
// Host and challenger avatars use consistent reference-style pastel themes.
const getAvatarTheme = (player, idx = 0) => {
  if (player?.isHost || player?.username?.toLowerCase() === 'vidi') {
    return { bg: '#6222f5', text: '#ffffff' };
  }
  const CHALLENGER_THEMES = [
    { bg: '#e0f2fe', text: '#0369a1' }, // sky blue
    { bg: '#fef3c7', text: '#b45309' }, // warm amber (Tanmay)
    { bg: '#fce7f3', text: '#be185d' }, // soft pink (Priya)
    { bg: '#dcfce7', text: '#15803d' }, // mint green (Aarav)
    { bg: '#e0e7ff', text: '#4338ca' }, // soft indigo (Rohan)
    { bg: '#f3e8ff', text: '#7e22ce' }, // soft lavender (Sarah K.)
    { bg: '#e0f2fe', text: '#0369a1' }, // light blue (Alex T.)
    { bg: '#fce7f3', text: '#be185d' }, // soft pink (Chloe L.)
    { bg: '#fef3c7', text: '#b45309' }, // warm amber (Ben P.)
    { bg: '#dcfce7', text: '#15803d' }, // mint green (Emily R.)
    { bg: '#e0e7ff', text: '#4338ca' }, // soft indigo (Sophia M.)
  ];
  const offset = idx > 0 ? (idx - 1) % CHALLENGER_THEMES.length : 0;
  return CHALLENGER_THEMES[offset];
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
        avatar: p.avatar || name.charAt(0).toUpperCase() || '👤',
        initial: (name.charAt(0) || 'P').toUpperCase(),
        joinedLabel: p.joinedLabel || 'Connected just now',
        score: p.score ?? p.totalScore ?? 0,
        joinedAt: p.joinedAt || null
      });
    }
  }
  return result;
};

export default function HostLobby() {
  const { pin: routePin } = useParams();
  const pin = routePin || '';
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [user, setUser] = useState(() => getStoredUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const [isPlayersModalOpen, setIsPlayersModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalSortOrder, setModalSortOrder] = useState('latest'); // 'latest' | 'alpha'

  const hasNavigatedRef = React.useRef(false);
  const [customUrl, setCustomUrl] = useState('');
  const [isEditingIp, setIsEditingIp] = useState(false);
  const [ipInput, setIpInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch initial game state (e.g. to get QR Code and quiz title)
  const {
    data: gameData,
    isLoading: isQueryLoading,
  } = useQuery({
    queryKey: ['game-lobby', pin],
    queryFn: () => fetchGameDetails(pin),
    refetchOnWindowFocus: false,
    retry: 1
  });

  const game = gameData?.game;
  const userName = user?.name || user?.username || 'Host';
  const userInitial = (userName.charAt(0) || 'H').toUpperCase();
  const hostName = game?.host?.name || user?.name || user?.username || '';

  // Profile synchronization
  useEffect(() => {
    const handleProfileSync = (event) => {
      setUser(event && 'detail' in event ? event.detail : getStoredUser());
    };

    window.addEventListener('user-profile-updated', handleProfileSync);
    window.addEventListener('storage', handleProfileSync);
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileSync);
      window.removeEventListener('storage', handleProfileSync);
    };
  }, []);

  // Sync customUrl when game is loaded
  useEffect(() => {
    const hostname = window.location.hostname;
    const isCustomDomain = hostname === 'gubbi.live' || hostname === 'gubbi.com' || hostname.endsWith('.gubbi.com') || hostname.endsWith('.gubbi.live');
    const isLocal = hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/) || hostname.endsWith('.local');

    if (isCustomDomain) {
      const activeUrl = `${window.location.origin}/join?pin=${pin}`;
      setCustomUrl(activeUrl);
      setIpInput(window.location.host);
    } else if (tunnelData && tunnelData.url) {
      const activeUrl = `${tunnelData.url}/join?pin=${pin}`;
      setCustomUrl(activeUrl);
      try {
        const url = new URL(tunnelData.url);
        setIpInput(url.host);
      } catch {
        setIpInput(window.location.host);
      }
    } else if (game?.joinUrl && isLocal) {
      setCustomUrl(game.joinUrl);
      try {
        const url = new URL(game.joinUrl);
        setIpInput(url.host);
      } catch {
        setIpInput(window.location.host);
      }
    } else {
      setCustomUrl(`${window.location.origin}/join?pin=${pin}`);
      setIpInput(window.location.host);
    }
  }, [game, pin]);

  // Sync players list when initial game data is loaded
  useEffect(() => {
    if (game?.players && game.players.length > 0) {
      setPlayers(deduplicatePlayers(game.players));
    }
  }, [game]);

  // Direct WhatsApp share handler
  const handleShareWhatsapp = (e) => {
    if (e) e.preventDefault();
    const shareMessage = `🎮 *Join my Gubbi arena!*\n\n📌 *Game PIN:* ${pin}\n\n🔗 *Direct Join Link:*\n${customUrl}\n\n❓ *How to Join:*\n1️⃣ Click the link above OR visit Gubbi\n2️⃣ Enter PIN: *${pin}*\n3️⃣ Enter your Nickname & tap Join!\n4️⃣ Ready up for the live battle! 🚀`;
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    // Identify as host for this pin in local storage
    localStorage.setItem('current_hosted_pin', pin);

    // 1. Connect Socket
    const socket = connectSocket();

    // 2. Join Room as Host
    const joinRoom = () => {
      emitJoinRoom(pin, 'Host');
    };

    socket.on('connect', joinRoom);
    if (socket.connected) {
      joinRoom();
    }

    // 3. Listen to player updates
    socket.on('player_list', (data) => {
      console.log('[SOCKET] Received player list:', data.players);
      setPlayers((currentPlayers) => {
        const joinedAtByName = new Map(
          currentPlayers.map((player) => [player.username.toLowerCase(), player.joinedAt])
        );
        const updated = deduplicatePlayers(data.players).map((player) => ({
          ...player,
          joinedAt: player.joinedAt || joinedAtByName.get(player.username.toLowerCase()) || null
        }));
        return updated;
      });
    });

    const handlePlayerLeft = (data) => {
      const username = (data?.username || data?.playerName || '').toString().trim();
      if (username) {
        setPlayers((prev) => prev.filter((p) => p.username.toLowerCase() !== username.toLowerCase()));
      }
    };

    socket.on('player_left', handlePlayerLeft);

    socket.on('player-joined', ({ playerName }) => {
      if (playerName) {
        if (playerName.startsWith('__LEAVE__:')) {
          const username = playerName.replace('__LEAVE__:', '').trim();
          setPlayers((prev) => prev.filter((p) => p.username.toLowerCase() !== username.toLowerCase()));
        } else {
          const trimmed = playerName.toString().trim();
          setPlayers((prev) => {
            const existing = prev.find((player) => player.username.toLowerCase() === trimmed.toLowerCase());
            if (existing) {
              return prev.map((player) => (
                player === existing
                  ? { ...player, joinedAt: player.joinedAt || new Date().toISOString() }
                  : player
              ));
            }
            return deduplicatePlayers([
              ...prev,
              { username: trimmed, avatar: trimmed.charAt(0), initial: trimmed.charAt(0).toUpperCase(), joinedLabel: 'Connected just now', score: 0, joinedAt: new Date().toISOString() }
            ]);
          });
          toast.success(`${trimmed} joined the battle! ⚔️`, { id: `join-${trimmed}`, duration: 2500 });
        }
      }
    });

    socket.on('question_started', (data) => {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      navigate(`/live/${pin}`, { state: { socketQuestionData: data } });
    });

    return () => {
      socket.off('connect', joinRoom);
      socket.off('player_list');
      socket.off('player_left', handlePlayerLeft);
      socket.off('player-joined');
      socket.off('question_started');
    };
  }, [pin, navigate]);

  const handleStartGame = async () => {
    toast.loading('Launching quiz...', { id: 'start-quiz' });
    try {
      const response = await startQuestion(pin);
      if (response.success) {
        toast.success('Battle commenced!');
        setTimeout(() => {
          if (!hasNavigatedRef.current) {
            hasNavigatedRef.current = true;
            const socketQuestionData = {
              question: response.question,
              questionNumber: response.question.questionNumber,
              totalQuestions: response.question.totalQuestions,
              timeLeft: response.question.timeLimit,
              quizBackgroundImage: response.quizBackgroundImage || ''
            };
            navigate(`/live/${pin}`, { state: { socketQuestionData } });
          }
        }, 2000);
      } else {
        toast.error(response.message || 'Failed to start quiz');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error commencing battle');
    } finally {
      toast.dismiss('start-quiz');
    }
  };

  const handleSaveIp = () => {
    const trimmed = ipInput.trim();
    if (!trimmed) {
      toast.error('IP/Host cannot be empty');
      return;
    }

    let newUrl;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const base = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
      if (base.includes('/join')) {
        try {
          const parsed = new URL(base);
          newUrl = `${parsed.origin}/join?pin=${pin}`;
        } catch {
          newUrl = base;
        }
      } else {
        newUrl = `${base}/join?pin=${pin}`;
      }
    } else {
      newUrl = `http://${trimmed}/join?pin=${pin}`;
    }

    setCustomUrl(newUrl);
    setIsEditingIp(false);
    toast.success('Join URL updated!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customUrl);
    setCopiedLink(true);
    toast.success('Join link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyQRCode = async () => {
    try {
      const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(customUrl)}`);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      toast.success('QR Code copied as image! Paste it into WhatsApp.');
    } catch (err) {
      console.error(err);
      toast.error('Could not copy QR image directly. Share the link instead!');
    }
  };

  const handleHostExit = () => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('host-end-quiz', { pin });
    }
    localStorage.removeItem('current_hosted_pin');
    toast('Quiz session ended', { icon: '🚪' });
    navigate('/quiz/my');
  };

  const activeChallengers = players;

  // The roster of actual players who joined to battle (strictly excluding the host)
  const fullPlayerRoster = useMemo(() => {
    const hostAliases = [
      hostName,
      userName,
      user?.name,
      user?.username,
      'host'
    ].filter(Boolean).map(s => s.trim().toLowerCase());

    return activeChallengers.filter((player) => {
      const pName = (player.username || player.name || '').trim().toLowerCase();
      return !hostAliases.includes(pName) && !player.isHost;
    });
  }, [hostName, userName, user, activeChallengers]);

  const totalParticipantCount = fullPlayerRoster.length; // e.g. 34
  const visibleRoster = showAllPlayers ? fullPlayerRoster : fullPlayerRoster.slice(0, 3);
  const remainingLobbyCount = Math.max(0, totalParticipantCount - 3);

  // Top Avatar Strip: up to 6 avatars
  const avatarStripList = fullPlayerRoster.slice(0, 6);
  const additionalAvatarCount = Math.max(0, totalParticipantCount - 6);

  // Filtered Roster for Modal Search & Sort
  const filteredModalRoster = useMemo(() => {
    let result = [...fullPlayerRoster];
    if (modalSearchQuery.trim()) {
      const q = modalSearchQuery.toLowerCase();
      result = result.filter(p => p.username.toLowerCase().includes(q));
    }
    if (modalSortOrder === 'alpha') {
      result.sort((a, b) => a.username.localeCompare(b.username));
    }
    return result;
  }, [fullPlayerRoster, modalSearchQuery, modalSortOrder]);

  const isLoading = isQueryLoading;

  if (isLoading) {
    return (
      <AnimatedPage>
        <div className="flex-1 flex items-center justify-center min-h-[70vh] bg-[#fdfdfe]">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#6222F5] mx-auto" />
            <p className="text-xs text-gray-400 font-medium tracking-wide">Connecting to battle lobby...</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="host-lobby-shell">
        <AppSidebar
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          onOpenProfile={() => navigate('/dashboard')}
          onOpenUpgrade={() => navigate('/dashboard')}
          onOpenSessions={() => navigate('/dashboard')}
          activeNav="my-quizzes"
        />

        <div className="host-lobby-main">
          {/* ─── TOP HEADER ─── */}
          <header className="host-lobby-header">
            <div className="host-lobby-mobile-brand">
              <button
                type="button"
                className="host-lobby-menu-button"
                aria-label="Open navigation menu"
                onClick={() => setIsMobileNavOpen(true)}
              >
                <Menu />
              </button>
              <span className="host-lobby-mobile-title">Gubbi</span>
            </div>

            <label className="host-lobby-search">
              <Search aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search quizzes, topics, or participants..."
                aria-label="Search quizzes, topics, or participants"
              />
              {searchQuery && (
                <button type="button" aria-label="Clear search" onClick={() => setSearchQuery('')}>
                  <X />
                </button>
              )}
            </label>

            <div className="host-lobby-header-actions">
              <div className="host-lobby-popover-wrap">
                <button
                  type="button"
                  className="host-lobby-notification-button"
                  aria-label="Notifications"
                  aria-expanded={isNotificationsOpen}
                  onClick={() => {
                    setIsNotificationsOpen((open) => !open);
                    setIsProfileDropdownOpen(false);
                  }}
                >
                  <Bell />
                  <span className="host-lobby-notification-dot" />
                </button>
                {isNotificationsOpen && (
                  <div className="host-lobby-popover">
                    <strong>Notifications</strong>
                    <span>You&apos;re all caught up.</span>
                  </div>
                )}
              </div>

              <div className="host-lobby-popover-wrap">
                <button
                  type="button"
                  className="host-lobby-profile-button"
                  aria-expanded={isProfileDropdownOpen}
                  onClick={() => {
                    setIsProfileDropdownOpen((open) => !open);
                    setIsNotificationsOpen(false);
                  }}
                >
                  <span className="host-lobby-profile-avatar">{userInitial}</span>
                  <span className="host-lobby-profile-name">{userName}</span>
                  <ChevronDown aria-hidden="true" />
                </button>
                {isProfileDropdownOpen && (
                  <div className="host-lobby-popover">
                    <strong>{userName}</strong>
                    <span>{user?.email || 'Host account'}</span>
                    <button type="button" onClick={() => navigate('/dashboard')}>Account settings</button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ─── MAIN CONTENT STAGE ─── */}
          <main className="host-lobby-content">
            <div className="host-lobby-stage">

              {/* Sub-Header: Exit Return Pill & Live Status Pill */}
              <div className="host-lobby-page-nav">
                <button
                  onClick={handleHostExit}
                  className="host-lobby-exit-button"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Exit Lobby &amp; Return to My Quizzes</span>
                </button>

                <span className="host-lobby-live-status">
                  <span />
                  LIVE LOBBY ACTIVE
                </span>
              </div>

              {/* 2-Column Responsive Grid */}
              <div className="host-lobby-grid">

                {/* ─── LEFT/CENTER COLUMN: Quiz Info & Players Joined ─── */}
                <div className="host-lobby-primary">

                  {/* CARD 1: Quiz Information Card */}
                  <div className="host-lobby-pin-card">
                    <div className="host-lobby-quiz-details">
                      <div className="host-lobby-rocket-circle">
                        <img className="host-lobby-rocket-image" src={hostLobbyRocket} alt="Rocket" />
                      </div>
                      <div className="host-lobby-quiz-text">
                        <span className="host-lobby-eyebrow">HOST LOBBY ROOM</span>
                        <h2>{game?.quiz?.title || 'Quiz Lobby'}</h2>
                        <p>Scan the QR or visit gubbi and enter the PIN below.</p>
                      </div>
                    </div>

                    <div className="host-lobby-pin-block">
                      <span>LOBBY PIN</span>
                      <div>{pin}</div>
                    </div>
                  </div>

                  {/* CARD 2: Players Joined Card */}
                  <div className="host-lobby-players-card">
                    <div className="host-lobby-player-panel-content">

                      {/* Section Heading */}
                      <div className="host-lobby-players-heading">
                        <div className="host-lobby-players-title">
                          <span className="host-lobby-players-icon-wrap">
                            <Users />
                          </span>
                          <div>
                            <h3>PLAYERS JOINED</h3>
                            <p>Real-time battle participants</p>
                          </div>
                        </div>
                        <span 
                          onClick={() => setIsPlayersModalOpen(true)} 
                          className="host-lobby-player-count cursor-pointer hover:bg-[#ebdfff] transition-colors"
                        >
                          {totalParticipantCount} Joined
                        </span>
                      </div>

                      {/* Live Lobby Avatars Sub-Heading */}
                      <div className="host-lobby-avatar-section">
                        <div className="host-lobby-avatar-label">
                          <span>LIVE LOBBY AVATARS</span>
                          <span className="host-lobby-ready-label">
                            <i />
                            {totalParticipantCount} ready
                          </span>
                        </div>

                        {/* Circular Avatar Strip with Green Online Dots */}
                        <div className="host-lobby-avatar-strip">
                          {avatarStripList.map((player, idx) => {
                            const palette = getAvatarTheme(player, idx);
                            const letter = player.initial || player.username?.charAt(0)?.toUpperCase() || 'P';
                            return (
                              <span
                                key={`chip-${player.username}-${idx}`}
                                className="host-lobby-avatar-chip"
                                style={{ backgroundColor: palette.bg, color: palette.text }}
                                title={player.username}
                                onClick={() => setIsPlayersModalOpen(true)}
                              >
                                <span>{letter}</span>
                                <i className="host-lobby-online-dot" />
                              </span>
                            );
                          })}

                          {additionalAvatarCount > 0 && (
                            <span 
                              className="host-lobby-avatar-more cursor-pointer"
                              onClick={() => setIsPlayersModalOpen(true)}
                            >
                              +{additionalAvatarCount} more
                            </span>
                          )}

                          {totalParticipantCount === 0 && (
                            <span className="text-xs text-slate-400 font-medium italic">
                              No players connected yet
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Players List */}
                      <div className="host-lobby-player-list">
                        {totalParticipantCount === 0 ? (
                          <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400">
                            <Users className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                            <p className="text-sm font-semibold text-slate-600">Waiting for players to join...</p>
                            <p className="text-xs text-slate-400 mt-0.5">Players can scan the QR code or enter PIN <span className="font-bold text-[#6320EE] font-mono">{pin}</span></p>
                          </div>
                        ) : (
                          <AnimatePresence initial={false}>
                            {visibleRoster.map((player, idx) => {
                              const isHost = Boolean(player.isHost);
                              const palette = getAvatarTheme(player, idx);
                              const letter = player.initial || player.username?.charAt(0)?.toUpperCase() || 'P';

                              return (
                                <motion.div
                                  key={`row-${player.username}-${idx}`}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -6 }}
                                  className="host-lobby-player cursor-pointer hover:bg-[#faf9fe] rounded-lg px-2"
                                  onClick={() => setIsPlayersModalOpen(true)}
                                >
                                  <span
                                    className="host-lobby-player-avatar"
                                    style={{ backgroundColor: palette.bg, color: palette.text }}
                                  >
                                    {letter}
                                  </span>

                                  <span className="host-lobby-player-details">
                                    <span className="host-lobby-player-name">
                                      <span className="host-lobby-name-text">{player.username}</span>
                                      {isHost && <span className="host-lobby-host-badge">HOST</span>}
                                    </span>
                                    <span className="host-lobby-player-joined">
                                      {player.joinedLabel || 'Connected just now'}
                                    </span>
                                  </span>

                                  <span className="host-lobby-player-online">
                                    <i />
                                    Online
                                  </span>
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        )}
                      </div>

                      {/* Footer Roster Toggle Row */}
                      {totalParticipantCount > 3 && (
                        <div className="host-lobby-roster-footer">
                          <span 
                            onClick={() => setIsPlayersModalOpen(true)} 
                            className="host-lobby-more-lobby-text cursor-pointer hover:underline"
                          >
                            +{remainingLobbyCount} more players in lobby
                          </span>
                          <button
                            type="button"
                            className="host-lobby-view-all-button"
                            onClick={() => setIsPlayersModalOpen(true)}
                            aria-expanded={isPlayersModalOpen}
                          >
                            <span>View All</span>
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Prominent Start Quiz Action Button */}
                    <div className="host-lobby-start-divider">
                      <button
                        onClick={handleStartGame}
                        className="host-lobby-start-button"
                      >
                        <Play className="h-4 w-4 fill-white" />
                        <span>Start Quiz</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ─── RIGHT COLUMN: Quick Scan / QR Code Card ─── */}
                <div className="host-lobby-qr-card">
                  {/* Header */}
                  <div className="host-lobby-qr-heading">
                    <span className="host-lobby-qr-icon-wrap">
                      <QrCode />
                    </span>
                    <strong>QUICK SCAN</strong>
                    <small className="host-lobby-live-badge">
                      <i />
                      Live Session
                    </small>
                  </div>

                  {/* QR Code Frame with 4 Purple Corner Brackets */}
                  <div className="host-lobby-qr-frame">
                    <div className="host-lobby-qr-corner host-lobby-qr-tl" />
                    <div className="host-lobby-qr-corner host-lobby-qr-tr" />
                    <div className="host-lobby-qr-corner host-lobby-qr-bl" />
                    <div className="host-lobby-qr-corner host-lobby-qr-br" />
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(customUrl)}`}
                      alt="Lobby scan QR code"
                      className="host-lobby-qr-image"
                    />
                  </div>

                  {/* Join URL Display & Edit */}
                  <div className="host-lobby-qr-actions">
                    {isEditingIp ? (
                      <div className="host-lobby-url-edit">
                        <input
                          type="text"
                          value={ipInput}
                          onChange={(e) => setIpInput(e.target.value)}
                          placeholder="e.g. 192.168.1.113:5173"
                          aria-label="Lobby join address"
                        />
                        <button
                          onClick={handleSaveIp}
                          className="host-lobby-save-url"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="host-lobby-url">
                        <LockKeyhole className="h-3.5 w-3.5 text-[#6222F5] shrink-0" aria-hidden="true" />
                        <span className="host-lobby-url-text" title={customUrl}>
                          {customUrl}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={handleCopyLink}
                            title="Copy link"
                            aria-label="Copy link"
                          >
                            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => setIsEditingIp(true)}
                            title="Edit IP address if incorrect"
                            aria-label="Edit lobby address"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Dual Action Buttons (Copy Link & Copy QR) */}
                    <div className="host-lobby-copy-actions">
                      <button
                        onClick={handleCopyLink}
                        className="host-lobby-secondary-button"
                      >
                        {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                      </button>
                      <button
                        onClick={handleCopyQRCode}
                        className="host-lobby-secondary-button"
                      >
                        <QrCode className="h-3.5 w-3.5 text-[#6222F5]" />
                        <span>Copy QR</span>
                      </button>
                    </div>

                    {/* WhatsApp Share Button */}
                    <button
                      onClick={handleShareWhatsapp}
                      className="host-lobby-whatsapp-button"
                    >
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span>Share via WhatsApp</span>
                    </button>
                  </div>

                  {/* Instructional Tip Box */}
                  <div className="host-lobby-qr-tip">
                    <Lightbulb className="host-lobby-tip-icon" />
                    <p>Point your phone camera to scan the code and instantly connect to the battle lobby.</p>
                  </div>
                </div>

              </div>
            </div>
          </main>
        </div>

        {/* ─── EXACT "PLAYERS IN LOBBY" MODAL (MATCHING REFERENCE SCREENSHOT) ─── */}
        <AnimatePresence>
          {isPlayersModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="host-lobby-modal-backdrop"
              onClick={() => setIsPlayersModalOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.2 }}
                className="host-lobby-modal-container"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="host-lobby-modal-header">
                  <div className="host-lobby-modal-header-left">
                    <div className="host-lobby-modal-icon-wrap">
                      <Users className="w-5 h-5 text-[#6222F5]" />
                    </div>
                    <div>
                      <div className="host-lobby-modal-title-row">
                        <h2>Players in Lobby</h2>
                        <span className="host-lobby-modal-joined-badge">
                          {totalParticipantCount} Joined
                        </span>
                      </div>
                      <p className="host-lobby-modal-subtitle">
                        {game?.quiz?.title || 'Blockbusters & Pop Culture Quiz'} • Waiting for host to launch
                      </p>
                    </div>
                  </div>

                  <div className="host-lobby-modal-header-right">
                    <span className="host-lobby-modal-all-ready-badge">
                      <i />
                      All {totalParticipantCount} Ready
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPlayersModalOpen(false)}
                      className="host-lobby-modal-close-btn"
                      aria-label="Close modal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Modal 2-Column Body */}
                <div className="host-lobby-modal-body">
                  {/* LEFT PANEL: Player Information */}
                  <div className="host-lobby-modal-left-col">
                    {/* Search Input */}
                    <div className="host-lobby-modal-search">
                      <Search className="w-4 h-4 text-[#94A3B8] shrink-0" />
                      <input
                        type="text"
                        value={modalSearchQuery}
                        onChange={(e) => setModalSearchQuery(e.target.value)}
                        placeholder="Search players by name..."
                      />
                      {modalSearchQuery && (
                        <button type="button" onClick={() => setModalSearchQuery('')}>
                          <X className="w-3.5 h-3.5 text-[#94A3B8]" />
                        </button>
                      )}
                    </div>

                    {/* Live Avatar Stream */}
                    <div className="host-lobby-modal-stream-section">
                      <div className="host-lobby-modal-stream-label">
                        <span>LIVE AVATAR STREAM</span>
                        <span>{totalParticipantCount} Online</span>
                      </div>
                      <div className="host-lobby-modal-avatar-strip">
                        {avatarStripList.map((player, idx) => {
                          const palette = getAvatarTheme(player, idx);
                          const letter = player.initial || player.username?.charAt(0)?.toUpperCase() || 'P';
                          return (
                            <span
                              key={`modal-chip-${player.username}-${idx}`}
                              className="host-lobby-avatar-chip"
                              style={{ backgroundColor: palette.bg, color: palette.text }}
                              title={player.username}
                            >
                              <span>{letter}</span>
                              <i className="host-lobby-online-dot" />
                            </span>
                          );
                        })}
                        {additionalAvatarCount > 0 && (
                          <span className="host-lobby-avatar-more">
                            +{additionalAvatarCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Room PIN & Game Mode Information Box */}
                    <div className="host-lobby-modal-info-box">
                      <div className="host-lobby-modal-info-row">
                        <span>Room PIN</span>
                        <span className="host-lobby-modal-pin">{pin}</span>
                      </div>
                      <div className="host-lobby-modal-info-row">
                        <span>Game Mode</span>
                        <span className="host-lobby-modal-mode">Multiplayer Live</span>
                      </div>
                    </div>

                    {/* Bottom Status & Start Quiz Action */}
                    <div className="host-lobby-modal-action-section">
                      <div className="host-lobby-modal-ready-note">
                        <i />
                        <span>{totalParticipantCount} players locked and ready to compete</span>
                      </div>
                      <button
                        onClick={handleStartGame}
                        className="host-lobby-modal-start-btn"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Start Quiz</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* RIGHT PANEL: Joined Roster */}
                  <div className="host-lobby-modal-right-col">
                    {/* Header Row */}
                    <div className="host-lobby-modal-roster-header">
                      <h3>
                        JOINED ROSTER <span>({filteredModalRoster.length} participants)</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setModalSortOrder(prev => prev === 'latest' ? 'alpha' : 'latest')}
                        className="host-lobby-modal-sort-btn"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Sort: {modalSortOrder === 'latest' ? 'Latest' : 'A-Z'}</span>
                      </button>
                    </div>

                    {/* 2-Column Cards Grid with Smooth Vertical Scroll */}
                    <div className="host-lobby-modal-roster-grid">
                      {filteredModalRoster.length === 0 ? (
                        <div className="col-span-2 py-8 flex flex-col items-center justify-center text-center text-slate-400">
                          <Users className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                          <p className="text-sm font-semibold text-slate-600">No players connected yet</p>
                          <p className="text-xs text-slate-400 mt-0.5">Players who join via PIN {pin} will appear here.</p>
                        </div>
                      ) : (
                        filteredModalRoster.map((player, idx) => {
                          const isHost = Boolean(player.isHost);
                          const palette = getAvatarTheme(player, idx);
                          const letter = player.initial || player.username?.charAt(0)?.toUpperCase() || 'P';

                          return (
                            <div
                              key={`modal-card-${player.username}-${idx}`}
                              className="host-lobby-modal-player-card"
                            >
                              <div className="host-lobby-modal-card-left">
                                <span
                                  className="host-lobby-modal-card-avatar"
                                  style={{ backgroundColor: palette.bg, color: palette.text }}
                                >
                                  {letter}
                                  <i className="host-lobby-online-dot" />
                                </span>
                                <div className="host-lobby-modal-card-details">
                                  <div className="host-lobby-modal-card-name-row">
                                    <span className="host-lobby-modal-player-name">{player.username}</span>
                                    {isHost && (
                                      <span className="host-lobby-modal-card-host-badge">
                                        ★ HOST
                                      </span>
                                    )}
                                  </div>
                                  <span className="host-lobby-modal-card-status-text">
                                    {player.joinedLabel || 'Connected just now'}
                                  </span>
                                </div>
                              </div>

                              <span className="host-lobby-modal-ready-badge">
                                <i />
                                Ready
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
}
