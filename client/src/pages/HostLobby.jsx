import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, ShieldAlert, Award, QrCode, ArrowLeft, Loader2, Edit2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import { getGame as fetchGameDetails, startQuestion } from '../services/gameService';
import { connectSocket, getSocket, emitJoinRoom, disconnectSocket } from '../services/socketService';
import tunnelData from '../tunnel.json';

export default function HostLobby() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  // FIXED: guard to prevent double-navigation (socket + API response both used to navigate)
  const hasNavigatedRef = React.useRef(false);
  const [customUrl, setCustomUrl] = useState('');
  const [isEditingIp, setIsEditingIp] = useState(false);
  const [ipInput, setIpInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [hostnameUrl, setHostnameUrl] = useState('');
  const [showTunnelGuide, setShowTunnelGuide] = useState(false);

  // Fetch initial game state (e.g. to get QR Code and quiz title)
  const { 
    data: gameData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['game-lobby', pin],
    queryFn: () => fetchGameDetails(pin),
    refetchOnWindowFocus: false,
  });

  const game = gameData?.game;

  // Sync customUrl when game is loaded
  useEffect(() => {
    const hostname = window.location.hostname;
    const isCustomDomain = hostname === 'quizzy.com' || hostname.endsWith('.quizzy.com');
    const isLocal = hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/) || hostname.endsWith('.local');

    if (isCustomDomain) {
      const activeUrl = `${window.location.origin}/join?pin=${pin}`;
      setCustomUrl(activeUrl);
      setHostnameUrl(activeUrl);
      setIpInput(window.location.host);
    } else if (tunnelData && tunnelData.url) {
      const activeUrl = `${tunnelData.url}/join?pin=${pin}`;
      setCustomUrl(activeUrl);
      setHostnameUrl(activeUrl);
      try {
        const url = new URL(tunnelData.url);
        setIpInput(url.host);
      } catch (e) {
        setIpInput(window.location.host);
      }
    } else if (game?.joinUrl && isLocal) {
      setCustomUrl(game.joinUrl);
      setHostnameUrl(game.hostnameUrl || '');
      // Extract IP:port or hostname from the url
      try {
        const url = new URL(game.joinUrl);
        setIpInput(url.host); // e.g. "192.168.1.43:5173"
      } catch (e) {
        setIpInput(window.location.host);
      }
    } else {
      setCustomUrl(`${window.location.origin}/join?pin=${pin}`);
      setHostnameUrl(`${window.location.hostname}.local:5173/join?pin=${pin}`);
      setIpInput(window.location.host);
    }
  }, [game, pin]);

  // Sync players list when initial game data is loaded
  useEffect(() => {
    if (game?.players) {
      const activePlayers = game.players.map((p) => ({
        username: p.name || p.username,
        avatar: p.avatar || '👤',
        score: p.totalScore || 0
      }));
      setPlayers(activePlayers);
    }
  }, [game]);

  // Direct WhatsApp share handler ensuring "Send message to" contact picker pops up every time
  const handleShareWhatsapp = (e) => {
    if (e) e.preventDefault();
    const shareMessage = `🎮 *Join my Quizzy arena!*\n\n📌 *Game PIN:* ${pin}\n\n🔗 *Direct Join Link:*\n${customUrl}\n\n❓ *How to Join:*\n1️⃣ Click the link above OR visit Quiz Hub\n2️⃣ Enter PIN: *${pin}*\n3️⃣ Enter your Nickname & tap Join!\n4️⃣ Ready up for the live battle! 🚀`;
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    // Identify as host for this pin in local storage
    localStorage.setItem('current_hosted_pin', pin);

    // 1. Connect Socket
    const socket = connectSocket();

    // 2. Join Room as Host (handle reconnects)
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
      const activePlayers = (data.players || []).filter(
        (p) => p.username && !p.username.startsWith('__LEAVE__:')
      );
      setPlayers(activePlayers);
    });

    socket.on('player-joined', ({ playerName }) => {
      if (playerName) {
        if (playerName.startsWith('__LEAVE__:')) {
          const username = playerName.replace('__LEAVE__:', '');
          setPlayers((prev) => prev.filter((p) => p.username !== username));
          toast.error(`${username} left the lobby`);
        } else {
          setPlayers((prev) => {
            if (prev.some((p) => p.username === playerName)) return prev;
            return [...prev, { username: playerName, avatar: '👤', score: 0 }];
          });
          toast.success(`${playerName} joined the battle! ⚔️`);
        }
      }
    });

    socket.on('question_started', (data) => {
      // FIXED: guard against double-navigation — both socket and API call
      // used to navigate; now socket is the sole canonical trigger
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      navigate(`/live/${pin}`, { state: { socketQuestionData: data } });
    });

    return () => {
      // Clean up event listeners on unmount
      socket.off('connect', joinRoom);
      socket.off('player_list');
      socket.off('player-joined');
      socket.off('question_started');
    };
  }, [pin, navigate]);

  const handleStartGame = async () => {
    if (players.length === 0) {
      toast.error('Cannot start the battle without players!');
      return;
    }

    toast.loading('Launching quiz...', { id: 'start-quiz' });
    try {
      const response = await startQuestion(pin);
      if (response.success) {
        toast.success('Battle commenced!');
        // FIXED: Do NOT navigate here — the socket `question_started` event is
        // the canonical navigation trigger (guarded by hasNavigatedRef).
        // If the socket somehow doesn't fire within 2s, fallback navigate here.
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

  if (isLoading) {
    return (
      <AnimatedPage>
        <div className="flex-1 flex items-center justify-center min-h-[70vh] bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-xs text-gray-400">Locking PIN coordinates...</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (error) {
    return (
      <AnimatedPage>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] bg-background text-center px-4">
          <ShieldAlert className="h-12 w-12 text-accent mb-4" />
          <h2 className="font-outfit text-xl font-bold text-white">Lobby Error</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-[280px] leading-relaxed">
            Could not retrieve game lobby details. Verify the PIN is correct.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-premium btn-primary-gradient px-4 py-2.5 text-xs font-bold mt-5">
            Return to Dashboard
          </button>
        </div>
      </AnimatedPage>
    );
  }

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
        } catch (e) {
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
    navigate('/dashboard');
  };

  return (
    <AnimatedPage>
      <div className="relative min-h-screen bg-background text-gray-200 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center overflow-x-hidden">
        
        {/* Glow Spheres */}
        <div className="absolute top-[5%] left-[10%] h-[350px] w-[350px] bg-glow-primary pointer-events-none opacity-45"></div>
        <div className="absolute bottom-[5%] right-[10%] h-[400px] w-[400px] bg-glow-secondary pointer-events-none opacity-30"></div>

        {/* Floating Return Button */}
        <div className="w-full max-w-4xl flex justify-start mb-4 relative z-10">
          <button 
            onClick={handleHostExit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>

        <div className="w-full max-w-4xl relative z-10 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 text-left">
          
          {/* LEFT/CENTER PANELS: PIN & QR CODE */}
          <div className="md:col-span-2 space-y-6">
            
            {/* PIN Card */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
              
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Host Lobby Room
                </span>
                <h2 className="font-outfit text-xl font-extrabold text-white mt-2">{game?.quiz?.title || 'Commencing Battle'}</h2>
                <p className="text-xs text-gray-400 max-w-[280px]">Scan the QR or visit Quizzy and enter the PIN below.</p>
              </div>

              <div className="space-y-1 text-center shrink-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">LOBBY PIN</span>
                <div className="font-outfit text-4xl sm:text-5xl font-black text-secondary tracking-widest animate-pulse">
                  {pin}
                </div>
              </div>
            </div>

            {/* Players Panel */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/5 min-h-[320px] flex flex-col justify-between">
              
              <div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                  <h3 className="font-outfit text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Users className="h-4.5 w-4.5 text-secondary" />
                    Players Joined
                  </h3>
                  <span className="text-xs font-bold text-white bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
                    {players.length} Joined
                  </span>
                </div>

                {players.length === 0 ? (
                  /* Waiting animation illustration */
                  <div className="py-12 text-center space-y-4">
                    <div className="h-10 w-10 border-2 border-dashed border-gray-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-gray-500">Waiting for challengers to join the arena...</p>
                  </div>
                ) : (
                  /* Connected players badge grid */
                  <div className="flex flex-wrap gap-2.5 max-h-[180px] overflow-y-auto pr-1">
                    <AnimatePresence>
                      {players.slice(0, 100).map((player, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center gap-2 hover:border-primary/40 transition-colors"
                        >
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>{player.username}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {players.length > 100 && (
                      <div className="px-3.5 py-2 rounded-xl border border-dashed border-white/10 bg-white/5 text-xs font-bold text-gray-400">
                        + {players.length - 100} more challengers...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* COMMENCE PLAY BUTTON */}
              <button
                onClick={handleStartGame}
                disabled={players.length === 0}
                className={`w-full btn-premium btn-primary-gradient py-3.5 flex items-center justify-center gap-2 text-sm font-bold shadow-premium-glow ${
                  players.length === 0 ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Start Quiz</span>
              </button>

            </div>
          </div>

          {/* RIGHT PANEL: QR CODE DISPLAY */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col justify-center items-center gap-4 text-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Quick Scan</span>
            
            <div className="p-3 bg-white rounded-2xl shadow-premium-glow">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(customUrl)}`} 
                alt={`Lobby Scan QR Code`} 
                className="h-44 w-44 pointer-events-none"
              />
            </div>

            {/* IP/URL Edit & Share Section */}
            <div className="w-full border-t border-white/5 pt-3.5 space-y-3">
              {isEditingIp ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                    placeholder="e.g. 192.168.1.113:5173"
                    className="flex-1 bg-white/5 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary font-mono"
                  />
                  <button
                    onClick={handleSaveIp}
                    className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-colors shrink-0"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                  <span className="text-[10px] text-gray-300 font-mono truncate select-all flex-1 text-left">
                    {customUrl}
                  </span>
                  <button
                    onClick={() => setIsEditingIp(true)}
                    title="Edit IP address if incorrect"
                    className="text-gray-400 hover:text-white transition-colors shrink-0"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyLink}
                  className="py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={handleCopyQRCode}
                  className="py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <QrCode className="h-3.5 w-3.5 text-secondary" />
                  <span>Copy QR</span>
                </button>
              </div>

              {/* WhatsApp Share Button */}
              <button 
                onClick={handleShareWhatsapp}
                className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-[13px] font-bold flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_15px_rgba(37,211,102,0.4)] border border-[#1DA851] hover:-translate-y-0.5 cursor-pointer"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Share via WhatsApp</span>
              </button>
            </div>
            
            <p className="text-[9px] text-gray-500 leading-relaxed max-w-[200px]">
              Point your phone camera to scan the code and instantly connect to the battle lobby.
            </p>
          </div>

        </div>
      </div>
    </AnimatedPage>
  );
}
