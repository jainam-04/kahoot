import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  Copy,
  KeyRound,
  LogOut,
  Loader2,
  PartyPopper,
  Pencil,
  Share2,
  UserRound,
  Users,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import Avatar from '../components/Avatar';
import Logo from '../components/Logo';
import { connectSocket, emitJoinRoom, emitLeaveRoom } from '../services/socketService';
import { useGame } from '../context/GameContext';
import { getGame, joinGame, leaveGame } from '../services/gameService';
import './WaitingRoom.css';

const avatarOptions = [
  { id: 'dog', name: 'Puppy' },
  { id: 'cat', name: 'Cat' },
  { id: 'mouse', name: 'Mouse' },
  { id: 'hamster', name: 'Hamster' },
  { id: 'rabbit', name: 'Rabbit' },
  { id: 'fox', name: 'Fox' },
  { id: 'bear', name: 'Bear' },
  { id: 'panda', name: 'Panda' },
];

const deduplicatePlayers = (list) => {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.reduce((result, player) => {
    const name = (player?.username || player?.name || '').toString().trim();
    if (!name || name.startsWith('__LEAVE__:') || seen.has(name.toLowerCase())) return result;
    seen.add(name.toLowerCase());
    result.push({
      username: name,
      avatar: player.avatar || '👤',
      score: player.score ?? player.totalScore ?? 0,
    });
    return result;
  }, []);
};

const findPlayer = (players, name) => (
  players?.find((player) => (
    (player.name || player.username || '').toLowerCase() === name.toLowerCase()
  ))
);

export default function WaitingRoom() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { playerName: contextPlayerName } = useGame();
  const localPlayerName = contextPlayerName || localStorage.getItem('guest_playerName') || 'Player';
  const [players, setPlayers] = useState([]);
  const [game, setGame] = useState(null);
  const [playerProfile, setPlayerProfile] = useState({});
  const [selectedAvatar, setSelectedAvatar] = useState(() => localStorage.getItem('guest_avatar') || 'dog');
  const [isLeaving, setIsLeaving] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [copied, setCopied] = useState(false);
  const knownPlayersRef = useRef(new Set());
  const avatarOptionsRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pin]);

  useEffect(() => {
    getGame(pin).then((response) => {
      if (!response.success) {
        toast.error(response.message || 'Could not load this lobby.');
        return;
      }

      const currentGame = response.game;
      const background = currentGame?.backgroundImage || currentGame?.quiz?.backgroundImage || '';
      localStorage.setItem('quiz_global_bg_image', background);
      localStorage.setItem('last_bg_image', background);
      setGame(currentGame);
      setPlayers(deduplicatePlayers(currentGame?.players));

      const currentPlayer = findPlayer(currentGame?.players, localPlayerName);
      if (currentPlayer) {
        setPlayerProfile(currentPlayer);
        const savedAvatar = currentPlayer.avatar || localStorage.getItem('guest_avatar') || 'dog';
        setSelectedAvatar(savedAvatar);
        localStorage.setItem('guest_avatar', savedAvatar);
      }
    }).catch((error) => {
      toast.error(error.response?.data?.message || 'Could not load lobby details.');
    });
  }, [pin, localPlayerName]);

  useEffect(() => {
    if (!contextPlayerName && !localStorage.getItem('guest_playerName')) {
      toast.error('Session expired. Please join the lobby again.');
      navigate('/join');
      return undefined;
    }

    if (contextPlayerName) {
      localStorage.setItem('guest_pin', pin);
      localStorage.setItem('guest_playerName', contextPlayerName);
    }

    const socket = connectSocket();
    const joinRoom = () => emitJoinRoom(pin, localPlayerName);
    socket.on('connect', joinRoom);
    if (socket.connected) joinRoom();

    socket.on('player_list', (data) => {
      const activePlayers = deduplicatePlayers(data.players);
      activePlayers.forEach((player) => knownPlayersRef.current.add(player.username.toLowerCase()));
      setPlayers(activePlayers);
    });

    const handlePlayerLeft = (data) => {
      const name = (data?.username || data?.playerName || '').toString().trim().toLowerCase();
      if (!name) return;
      knownPlayersRef.current.delete(name);
      setPlayers((previous) => previous.filter((player) => player.username.toLowerCase() !== name));
    };
    socket.on('player_left', handlePlayerLeft);

    socket.on('player-joined', ({ playerName: joinedName }) => {
      if (!joinedName) return;
      if (joinedName.startsWith('__LEAVE__:')) {
        const name = joinedName.replace('__LEAVE__:', '').trim().toLowerCase();
        knownPlayersRef.current.delete(name);
        setPlayers((previous) => previous.filter((player) => player.username.toLowerCase() !== name));
        return;
      }

      const name = joinedName.toString().trim();
      setPlayers((previous) => deduplicatePlayers([...previous, { username: name, avatar: '👤' }]));
      if (name.toLowerCase() !== localPlayerName.toLowerCase() && !knownPlayersRef.current.has(name.toLowerCase())) {
        knownPlayersRef.current.add(name.toLowerCase());
        toast(`${name} entered the quiz`, { id: `join-${name}`, icon: '👋', duration: 2500 });
      }
    });

    const handleQuestionStarted = (data) => {
      const globalBackground = localStorage.getItem('quiz_global_bg_image') || '';
      const resolvedBackground = data?.question?.backgroundImage || globalBackground;
      localStorage.setItem('last_bg_image', resolvedBackground);
      navigate(`/live/${pin}`, { state: { socketQuestionData: data } });
    };
    socket.on('question_started', handleQuestionStarted);

    const handleQuizEnded = (data) => {
      navigate(`/final-result/${pin}`, { state: { finalData: data } });
    };
    socket.on('quiz_ended', handleQuizEnded);
    socket.on('show-final-result', handleQuizEnded);
    socket.on('show_final_result', handleQuizEnded);

    const handleHostEnded = (data) => {
      if (data?.reason !== 'host_left') return;
      const message = 'Host ended the quiz';
      toast.error(message, { id: 'host-ended-toast', duration: 5000 });
      localStorage.removeItem('guest_pin');
      localStorage.removeItem('guest_playerName');
      navigate('/join', { state: { endedMessage: message } });
    };
    socket.on('room_closed', handleHostEnded);
    socket.on('host_left', handleHostEnded);

    return () => {
      socket.off('connect', joinRoom);
      socket.off('player_list');
      socket.off('player_left', handlePlayerLeft);
      socket.off('player-joined');
      socket.off('question_started', handleQuestionStarted);
      socket.off('quiz_ended', handleQuizEnded);
      socket.off('show-final-result', handleQuizEnded);
      socket.off('show_final_result', handleQuizEnded);
      socket.off('room_closed', handleHostEnded);
      socket.off('host_left', handleHostEnded);
    };
  }, [pin, localPlayerName, contextPlayerName, navigate]);

  const handleLeaveLobby = () => {
    if (isLeaving) return;
    setIsLeaving(true);

    try {
      emitLeaveRoom(pin, localPlayerName);
    } catch (error) {
      console.error('Socket leave error:', error);
    }
    leaveGame(pin, localPlayerName).catch((error) => {
      console.error('Lobby leave request failed:', error);
    });

    localStorage.removeItem('guest_pin');
    localStorage.removeItem('guest_playerName');
    localStorage.removeItem('guest_avatar');
    toast('Left the quiz lobby', { icon: '👋' });
    navigate('/join');
  };

  const handleChangeName = () => {
    if (isLeaving) return;
    setIsLeaving(true);
    try {
      emitLeaveRoom(pin, localPlayerName);
    } catch (error) {
      console.error('Socket leave error:', error);
    }
    leaveGame(pin, localPlayerName).catch((error) => {
      console.error('Lobby leave request failed:', error);
    });

    localStorage.removeItem('guest_playerName');
    localStorage.setItem('guest_pin', pin);
    toast('Enter your new name to join', { icon: '✏️' });
    navigate(`/join?pin=${pin}`, { state: { pin } });
  };

  const handleCopyPin = async () => {
    try {
      await navigator.clipboard.writeText(pin);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      toast.success('Arena PIN copied!');
    } catch {
      toast.error('Could not copy the PIN. Please copy it manually.');
    }
  };

  const handleShare = async () => {
    const joinUrl = `${window.location.origin}/join?pin=${encodeURIComponent(pin)}`;
    const shareData = {
      title: 'Join my Gubbi Quiz Arena',
      text: `Join my Gubbi Quiz Arena! Use PIN ${pin}.`,
      url: joinUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${joinUrl}`);
        toast.success('Invite link copied. Share it with your friends!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Could not share the invite. Please try copying the PIN instead.');
      }
    }
  };

  const handleAvatarChange = async (avatar) => {
    if (avatar === selectedAvatar || isSavingAvatar || isLeaving) return;
    const previousAvatar = selectedAvatar;
    setIsSavingAvatar(true);
    try {
      const leaveResponse = await leaveGame(pin, localPlayerName);
      if (!leaveResponse.success) {
        throw new Error(leaveResponse.message || 'Could not update your mascot.');
      }

      const joinResponse = await joinGame(
        pin,
        localPlayerName,
        avatar,
        playerProfile.fullName || localPlayerName,
        playerProfile.mobileNumber || localStorage.getItem('guest_mobileNumber') || '',
        playerProfile.nickname || localPlayerName
      );
      if (!joinResponse.success) {
        throw new Error(joinResponse.message || 'Could not save your mascot.');
      }

      const refreshed = await getGame(pin);
      const savedPlayer = findPlayer(refreshed.game?.players, localPlayerName);
      if (!savedPlayer || savedPlayer.avatar !== avatar) {
        throw new Error('Your mascot could not be confirmed. Please try again.');
      }

      setPlayers(deduplicatePlayers(refreshed.game.players));
      setPlayerProfile(savedPlayer);
      setSelectedAvatar(avatar);
      localStorage.setItem('guest_avatar', avatar);
      toast.success('Mascot updated!');
    } catch (error) {
      try {
        await joinGame(
          pin,
          localPlayerName,
          previousAvatar,
          playerProfile.fullName || localPlayerName,
          playerProfile.mobileNumber || localStorage.getItem('guest_mobileNumber') || '',
          playerProfile.nickname || localPlayerName
        );
      } catch (restoreError) {
        console.error('Could not restore lobby membership after mascot update failed:', restoreError);
        toast.error('Could not update your mascot or restore your lobby session. Please rejoin the lobby.');
      }
      toast.error(error.response?.data?.message || error.message || 'Could not update your mascot.');
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const currentQuestion = Number.isFinite(Number(game?.currentQuestion))
    ? Number(game.currentQuestion)
    : Number(game?.currentQuestionIndex ?? -1) + 1;
  const roundNumber = Math.max(1, currentQuestion + 1);
  const visiblePlayers = players.slice(0, 12);
  const additionalPlayers = Math.max(0, players.length - visiblePlayers.length);
  const selectedAvatarName = avatarOptions.find((avatar) => avatar.id === selectedAvatar)?.name || 'Puppy';

  return (
    <AnimatedPage>
      <div className="waiting-room-page">
        <header className="waiting-room-header">
          <Logo size="xs" className="waiting-room-logo" />
          <button
            type="button"
            className="waiting-leave-button"
            onClick={handleLeaveLobby}
            disabled={isLeaving}
          >
            {isLeaving ? <Loader2 aria-hidden="true" className="waiting-spin" /> : <LogOut aria-hidden="true" />}
            <span>Leave Lobby</span>
          </button>
        </header>

        <main className="waiting-room-content">
          <motion.section
            className="waiting-status-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            aria-labelledby="waiting-status-title"
          >
            <span className="waiting-eyebrow"><span className="waiting-eyebrow-dot" /> QUIZ ARENA</span>
            <h1 id="waiting-status-title">Waiting for <span>Host...</span></h1>
            <p>Please hold on while the host prepares the quiz session. The game battle begins automatically once launched!</p>
            <div className="waiting-status-meta">
              <span className="waiting-live-pill"><span /> Lobby Live</span>
              <span className="waiting-round"><span /> Round {roundNumber} Starting Soon</span>
            </div>
          </motion.section>

          <div className="waiting-room-columns">
            <div className="waiting-left-column">
              <section className="waiting-card arena-pin-card" aria-labelledby="arena-pin-heading">
                <div className="waiting-card-heading">
                  <h2 id="arena-pin-heading"><span className="waiting-heading-icon"><KeyRound aria-hidden="true" /></span> Arena PIN</h2>
                  <span className="waiting-subtle-label">Live Room Access Code</span>
                </div>
                <div className="waiting-pin-row">
                  <span className="waiting-pin-label">PIN</span>
                  <strong className="waiting-pin-value">{pin}</strong>
                  <button type="button" className="waiting-copy-button" onClick={handleCopyPin}>
                    {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                  <button type="button" className="waiting-share-button" onClick={handleShare} aria-label="Share invite link">
                    <Share2 aria-hidden="true" />
                  </button>
                </div>
                <div className="waiting-invite-row">
                  <span><span className="waiting-green-dot" /> Share this 6-digit PIN with classmates or friends to join</span>
                  <button type="button" onClick={handleShare}>Tap to invite <span aria-hidden="true">›</span></button>
                </div>
              </section>

              <section className="waiting-card player-profile-card" aria-labelledby="player-profile-heading">
                <div className="waiting-player-row">
                  <div className="waiting-player-avatar">
                    <span className="waiting-player-initial">{localPlayerName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="waiting-player-identity">
                    <span>JOINED AS</span>
                    <strong>{localPlayerName} <em>(You)</em></strong>
                  </div>
                  <button
                    type="button"
                    className="waiting-change-name-button"
                    onClick={handleChangeName}
                    disabled={isLeaving}
                  >
                    <Pencil aria-hidden="true" /> Change Nickname
                  </button>
                </div>
                <div className="waiting-avatar-heading">
                  <h2 id="player-profile-heading">Choose your 3D mascot avatar:</h2>
                  <span>{selectedAvatarName} Selected</span>
                  <button
                    type="button"
                    className="waiting-avatar-change"
                    onClick={() => avatarOptionsRef.current?.querySelector('button:not(:disabled)')?.focus()}
                    aria-label="Change mascot avatar"
                  >
                    Change
                  </button>
                </div>
                <div className="waiting-avatar-outer-frame">
                  <div className="waiting-avatar-frame">
                    <div ref={avatarOptionsRef} className="waiting-avatar-grid" aria-label="Choose your mascot avatar">
                      {avatarOptions.map((avatar) => {
                        const isSelected = selectedAvatar === avatar.id;
                        return (
                          <button
                            key={avatar.id}
                            type="button"
                            className={`waiting-avatar-option${isSelected ? ' is-selected' : ''}`}
                            onClick={() => handleAvatarChange(avatar.id)}
                            disabled={isSavingAvatar || isLeaving}
                            aria-label={`Choose ${avatar.name}${isSelected ? ', selected' : ''}`}
                            aria-pressed={isSelected}
                          >
                            <Avatar emoji={avatar.id} />
                            {isSelected && <span className="waiting-avatar-check"><Check aria-hidden="true" /></span>}
                          </button>
                        );
                      })}
                      {isSavingAvatar && <span className="waiting-avatar-saving" role="status">Saving mascot…</span>}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <section className="waiting-card challengers-card" aria-labelledby="challengers-heading">
              <div className="waiting-card-heading challengers-heading">
                <div>
                  <h2 id="challengers-heading"><span className="waiting-heading-icon"><Users aria-hidden="true" /></span> Challengers in Arena</h2>
                  <span className="waiting-subtle-label">Real-time room participants</span>
                </div>
                <span className="waiting-joined-pill"><span /> {players.length} Joined</span>
              </div>

              <div className="waiting-participant-grid" aria-live="polite">
                {visiblePlayers.length === 0 ? (
                  <p className="waiting-empty-participants">Waiting for challengers to join…</p>
                ) : visiblePlayers.map((player) => {
                  const isCurrentPlayer = player.username.toLowerCase() === localPlayerName.toLowerCase();
                  return (
                    <div className="waiting-participant" key={player.username}>
                      <div className={`waiting-participant-avatar${isCurrentPlayer ? ' is-current-player' : ''}`}>
                        <span className="waiting-participant-initial">{player.username.charAt(0).toUpperCase()}</span>
                        <span className="waiting-online-dot" aria-label="Online" />
                      </div>
                      <span className={isCurrentPlayer ? 'is-current-player-name' : ''}>
                        {player.username}
                      </span>
                      {isCurrentPlayer && <small>You</small>}
                    </div>
                  );
                })}
              </div>

              <div className="waiting-more-challengers">
                <span><UserRound aria-hidden="true" /> {additionalPlayers > 0
                  ? `+ ${additionalPlayers} more challenger${additionalPlayers === 1 ? '' : 's'} in lobby`
                  : 'Invite friends to join the lobby'}</span>
                <div aria-hidden="true" className="waiting-mini-avatars">
                  {visiblePlayers.slice(0, additionalPlayers > 0 ? 3 : 4).map((player) => (
                    <span key={player.username}>
                      <span className="waiting-mini-avatar-initial">{player.username.charAt(0).toUpperCase()}</span>
                    </span>
                  ))}
                  {additionalPlayers > 0 && (
                    <span className="waiting-mini-more">+{additionalPlayers}</span>
                  )}
                </div>
              </div>

              <div className="waiting-tips-grid">
                <div className="waiting-tip-card">
                  <Share2 aria-hidden="true" />
                  <strong>Invite Friends</strong>
                  <span>Share PIN</span>
                </div>
                <div className="waiting-tip-card">
                  <Zap aria-hidden="true" />
                  <strong>Get Ready</strong>
                  <span>Starts auto</span>
                </div>
                <div className="waiting-tip-card">
                  <PartyPopper aria-hidden="true" />
                  <strong>Have Fun</strong>
                  <span>Climb ranks</span>
                </div>
              </div>

              <button
                type="button"
                className="waiting-bottom-leave-button"
                onClick={handleLeaveLobby}
                disabled={isLeaving}
              >
                {isLeaving ? <Loader2 aria-hidden="true" className="waiting-spin" /> : <LogOut aria-hidden="true" />}
                <span>Leave Lobby</span>
              </button>
            </section>
          </div>
        </main>
      </div>
    </AnimatedPage>
  );
}
