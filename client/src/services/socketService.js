import { io } from 'socket.io-client';

const getSocketUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/api$/, '').replace(/\/$/, '');
    }
    if (typeof window !== 'undefined' && window.location) {
        const { protocol, hostname } = window.location;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
            return `${protocol}//${hostname}:5000`;
        }
    }
    return 'http://localhost:5000';
};

const socket = io(getSocketUrl(), {
    autoConnect: false,
    transports: ['websocket', 'polling']
});

export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

export const getSocket = () => socket;

export const emitJoinRoom = (pin, roleOrName = 'Host') => {
    const normalizedRole = String(roleOrName || '').toLowerCase();

    if (normalizedRole === 'host') {
        socket.emit('host-join', { pin: `room_${pin}`, rawPin: pin });
    } else {
        socket.emit('player-join', { pin: `room_${pin}`, rawPin: pin, playerName: roleOrName });
    }
};

export const joinRoom = (pin) => {
    emitJoinRoom(pin, 'Host');
};

export const playerJoinRoom = (pin, playerName) => {
    emitJoinRoom(pin, playerName);
};

export const emitLeaveRoom = (pin, playerName) => {
    const rawPin = pin ? pin.toString().replace(/^room_/, '') : '';
    socket.emit('player-leave', { pin: `room_${rawPin}`, rawPin, playerName });
    socket.emit('player-join', { pin: `room_${rawPin}`, rawPin, playerName: `__LEAVE__:${playerName}` });
};

export const onPlayerJoined = (callback) => {
    socket.on('player-joined', callback);
};

export const onShowQuestion = (callback) => {
    socket.on('show-question', callback);
};

export const onPlayerAnswered = (callback) => {
    socket.on('player-answered', callback);
};

export const onShowLeaderboard = (callback) => {
    socket.on('show-leaderboard', callback);
};

export const onShowFinalResult = (callback) => {
    socket.on('show-final-result', callback);
};

export const emitNextQuestion = (pin) => {
    socket.emit('next-question', { pin });
};

export const removeListener = (event) => {
    socket.off(event);
};

export default socket;