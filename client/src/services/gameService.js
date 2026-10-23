import API from './api';

export const createGame = async (quizId) => {
  const response = await API.post('/game/create', { quizId });
  return response.data;
};

export const joinGame = async (pin, playerName, avatar, fullName, mobileNumber, nickname, previousPlayerName) => {
  const response = await API.post('/game/join', { pin, playerName, avatar, fullName, mobileNumber, nickname, previousPlayerName });
  return response.data;
};

export const leaveGame = async (pin, playerName) => {
  const response = await API.post('/game/leave', { pin, playerName });
  return response.data;
};

export const startQuestion = async (pin) => {
  const response = await API.post('/game/startquestion', { pin });
  return response.data;
};

export const submitAnswer = async (pin, playerName, answerIndex) => {
  const response = await API.post('/game/answer', { pin, playerName, answerIndex });
  return response.data;
};

export const getLeaderboard = async (pin) => {
  const response = await API.get(`/game/${pin}/leaderboard`);
  return response.data;
};

export const endGame = async (pin) => {
  const response = await API.post('/game/end', { pin });
  return response.data;
};

export const getGame = async (pin) => {
  const response = await API.get(`/game/${pin}?t=${Date.now()}`);
  return response.data;
};

export const endQuestion = async (pin) => {
  const response = await API.post('/game/endquestion', { pin });
  return response.data;
};

export const showLeaderboard = async (pin) => {
  const response = await API.post('/game/showleaderboard', { pin });
  return response.data;
};
