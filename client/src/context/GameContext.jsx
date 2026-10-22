import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [pin, setPinState] = useState(() => localStorage.getItem('guest_pin') || '');
  const [playerName, setPlayerNameState] = useState(() => localStorage.getItem('guest_playerName') || '');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [qrCode, setQrCode] = useState('');
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [lastResult, setLastResult] = useState(null);

  const setPin = (val) => {
    const clean = (val || '').toString().trim();
    setPinState(clean);
    if (clean) {
      localStorage.setItem('guest_pin', clean);
    }
  };

  const setPlayerName = (val) => {
    const clean = (val || '').toString().trim();
    setPlayerNameState(clean);
    if (clean) {
      localStorage.setItem('guest_playerName', clean);
    }
  };

  const resetGame = () => {
    setPinState('');
    setPlayerNameState('');
    localStorage.removeItem('guest_pin');
    localStorage.removeItem('guest_playerName');
    setCurrentQuestion(null);
    setScore(0);
    setLeaderboard([]);
    setGameStatus('waiting');
    setQrCode('');
    setQuestionNumber(0);
    setTotalQuestions(0);
    setLastResult(null);
  };

  return (
    <GameContext.Provider
      value={{
        pin,
        setPin,
        playerName,
        setPlayerName,
        currentQuestion,
        setCurrentQuestion,
        score,
        setScore,
        leaderboard,
        setLeaderboard,
        gameStatus,
        setGameStatus,
        qrCode,
        setQrCode,
        questionNumber,
        setQuestionNumber,
        totalQuestions,
        setTotalQuestions,
        lastResult,
        setLastResult,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
