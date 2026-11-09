import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, RotateCcw, CheckCircle2, XCircle, ArrowRight, Flame, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

// 4 Geometric Shape SVGs matching Figma vectors
function ShapeIcon({ type }) {
  if (type === 'triangle') {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="#EF4444">
        <polygon points="12 4, 21 20, 3 20" />
      </svg>
    );
  }
  if (type === 'diamond') {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="#2563EB">
        <polygon points="12 2, 22 12, 12 22, 2 12" />
      </svg>
    );
  }
  if (type === 'circle') {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="#F59E0B">
        <circle cx="12" cy="12" r="8.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="#10B981">
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
    </svg>
  );
}

const sampleQuestions = [
  {
    id: 1,
    questionText: 'What does HTML stand for, powering structure across all web browsers?',
    highlightedQuestion: (
      <>
        What does <span className="text-[#551BF5]">HTML</span> stand for, powering structure across{' '}
        <span className="text-[#551BF5]">all web browsers</span>?
      </>
    ),
    category: 'WEB DEVELOPMENT',
    options: [
      { id: 'A', text: 'HyperText Markup Language', type: 'triangle', isCorrect: true },
      { id: 'B', text: 'High Tech Markup Language', type: 'diamond', isCorrect: false },
      { id: 'C', text: 'Hyperlink Text Management Language', type: 'circle', isCorrect: false },
      { id: 'D', text: 'Home Tool Markup Language', type: 'square', isCorrect: false },
    ],
  },
  {
    id: 2,
    questionText: 'Which planet is known as the Red Planet in our Solar System?',
    highlightedQuestion: (
      <>
        Which planet is known as the <span className="text-[#551BF5]">Red Planet</span> in our{' '}
        <span className="text-[#551BF5]">Solar System</span>?
      </>
    ),
    category: 'ASTRONOMY',
    options: [
      { id: 'A', text: 'Venus', type: 'triangle', isCorrect: false },
      { id: 'B', text: 'Mars', type: 'diamond', isCorrect: true },
      { id: 'C', text: 'Jupiter', type: 'circle', isCorrect: false },
      { id: 'D', text: 'Saturn', type: 'square', isCorrect: false },
    ],
  },
  {
    id: 3,
    questionText: 'What primary colors mix together to make Green?',
    highlightedQuestion: (
      <>
        What primary colors mix together to make <span className="text-[#551BF5]">Green</span>?
      </>
    ),
    category: 'GENERAL KNOWLEDGE',
    options: [
      { id: 'A', text: 'Red & Blue', type: 'triangle', isCorrect: false },
      { id: 'B', text: 'Yellow & Blue', type: 'diamond', isCorrect: true },
      { id: 'C', text: 'Yellow & Red', type: 'circle', isCorrect: false },
      { id: 'D', text: 'Purple & Green', type: 'square', isCorrect: false },
    ],
  },
];

// 4 Option Styles extracted directly from Figma CSS specification
const optionConfig = [
  // Option 1: Red Triangle
  {
    bg: 'bg-[rgba(255,241,242,0.7)]',
    border: 'border-[rgba(254,205,211,0.9)]',
    hover: 'hover:bg-[rgba(255,241,242,0.95)] hover:border-[#FDA4AF]',
    radioBorder: 'border-[rgba(251,113,133,0.9)]',
    radioDot: 'bg-[#F43F5E]',
  },
  // Option 2: Royal Blue Diamond
  {
    bg: 'bg-[rgba(239,246,255,0.7)]',
    border: 'border-[rgba(191,219,254,0.9)]',
    hover: 'hover:bg-[rgba(239,246,255,0.95)] hover:border-[#93C5FD]',
    radioBorder: 'border-[rgba(96,165,250,0.9)]',
    radioDot: 'bg-[#3B82F6]',
  },
  // Option 3: Amber Circle
  {
    bg: 'bg-[rgba(255,251,235,0.7)]',
    border: 'border-[rgba(253,230,138,0.9)]',
    hover: 'hover:bg-[rgba(255,251,235,0.95)] hover:border-[#FCD34D]',
    radioBorder: 'border-[rgba(251,191,36,0.9)]',
    radioDot: 'bg-[#F59E0B]',
  },
  // Option 4: Emerald Rounded Square
  {
    bg: 'bg-[rgba(236,253,245,0.7)]',
    border: 'border-[rgba(167,243,208,0.9)]',
    hover: 'hover:bg-[rgba(236,253,245,0.95)] hover:border-[#6EE7B7]',
    radioBorder: 'border-[rgba(52,211,153,0.9)]',
    radioDot: 'bg-[#10B981]',
  },
];

export default function LiveDemoSection({ isModal = false, onCloseModal = null }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [earnedPts, setEarnedPts] = useState(0);
  const [showIntermediateLeaderboard, setShowIntermediateLeaderboard] = useState(false);
  
  // 30-Second Countdown Timer
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const currentQ = sampleQuestions[currentQIndex];

  const startDemoTimer = () => {
    if (!hasStarted && !isCompleted) {
      setHasStarted(true);
      setIsTimerRunning(true);
    }
  };

  // Auto-start timer if in modal or hash is interactive-demo
  useEffect(() => {
    if ((isModal || window.location.hash === '#interactive-demo') && !hasStarted) {
      startDemoTimer();
    }
  }, [isModal, hasStarted]);

  // Timer Effect
  useEffect(() => {
    if (!isTimerRunning || isCompleted || selectedOption !== null || isTimedOut) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, currentQIndex, selectedOption, isTimedOut, isCompleted]);

  const handleTimeOut = () => {
    setIsTimedOut(true);
    setIsTimerRunning(false);
    setStreak(0);
    setEarnedPts(0);
  };

  const handleSelectOption = (index) => {
    if (selectedOption !== null || isTimedOut || isCompleted) return;

    if (!hasStarted) {
      setHasStarted(true);
    }
    setIsTimerRunning(false);
    setSelectedOption(index);

    const opt = currentQ.options[index];

    if (opt.isCorrect) {
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.65 },
          colors: ['#551BF5', '#6C38FF', '#3B82F6', '#10B981', '#F59E0B', '#FFFFFF'],
        });
      } catch (e) {
        console.error('Confetti error:', e);
      }

      const speedBonus = Math.round((timeLeft / 30) * 500);
      const basePoints = 500;
      const streakBonus = streak * 50;
      const addedPts = basePoints + speedBonus + streakBonus;

      setEarnedPts(addedPts);
      setScore((prev) => prev + addedPts);
      setCorrectCount((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
      setEarnedPts(0);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsTimedOut(false);
    setTimeLeft(30);
    setShowIntermediateLeaderboard(false);

    if (currentQIndex < sampleQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setHasStarted(true);
      setIsTimerRunning(true);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestartDemo = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsTimedOut(false);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setIsCompleted(false);
    setShowIntermediateLeaderboard(false);
    setEarnedPts(0);
    setTimeLeft(30);
    setHasStarted(true);
    setIsTimerRunning(true);
  };

  // Benchmark bot competitors
  const benchmarkPlayers = [
    { name: 'QuizNinja_99', score: 2100, correct: '2/3', isUser: false },
    { name: 'SpeedDemon', score: 1400, correct: '2/3', isUser: false },
  ];

  const userPlayer = {
    name: 'You (Demo Player)',
    score: score,
    correct: `${correctCount}/${sampleQuestions.length}`,
    isUser: true,
  };

  const sortedLeaderboard = [...benchmarkPlayers, userPlayer].sort((a, b) => b.score - a.score);
  const userRankIndex = sortedLeaderboard.findIndex((p) => p.isUser);

  const cardContent = (
    <div
      className="w-full max-w-[975px] mx-auto rounded-[20px] sm:rounded-[32px] p-4 sm:p-8 lg:p-12 relative overflow-hidden transition-all text-left"
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(243, 232, 255, 0.9)',
        boxShadow:
          '0px -3px 60px rgba(85, 27, 245, 0.15), 0px 10px 25px -5px rgba(0, 0, 0, 0.08), 0px 0px 0px 1px rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Top Card Status / Info Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pb-4 sm:pb-8 gap-3 sm:gap-4 border-b border-[#F1F5F9]/80 sm:border-none">
        {/* Row 1 on Mobile: PIN Pill (Left) & Question Counter (Right) */}
        <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
          <div
            className="px-3.5 sm:px-4 py-1.5 rounded-full flex items-center justify-center shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
            style={{
              background: '#ECFEFF',
              border: '1px solid rgba(165, 243, 252, 0.9)',
            }}
          >
            <span className="font-['Inter'] font-bold text-xs sm:text-sm tracking-[0.35px] text-[#0284C7]">
              PIN: 849-204
            </span>
          </div>

          {!isCompleted && (
            <span className="font-['Inter'] font-bold text-xs sm:text-sm tracking-[0.35px] text-[#64748B]">
              Q{currentQIndex + 1}/{sampleQuestions.length}
            </span>
          )}
        </div>

        {/* Row 2 on Mobile: Timer, Score, Streak (Left) & Reset Button (Right) */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Timer Pill */}
            {!isCompleted && (
              <div
                className={`px-3 sm:px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-all ${
                  timeLeft <= 5 && hasStarted ? 'animate-pulse' : ''
                }`}
                style={{
                  background: timeLeft <= 5 && hasStarted ? 'rgba(254, 226, 226, 0.8)' : 'rgba(236, 254, 255, 0.8)',
                  border: timeLeft <= 5 && hasStarted ? '1px solid rgba(252, 165, 165, 0.9)' : '1px solid rgba(165, 243, 252, 0.9)',
                }}
              >
                <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${timeLeft <= 5 && hasStarted ? 'text-red-500' : 'text-[#0891B2]'}`} />
                <span
                  className={`font-['Inter'] font-semibold text-xs sm:text-sm ${
                    timeLeft <= 5 && hasStarted ? 'text-red-600 font-bold' : 'text-[#0E7490]'
                  }`}
                >
                  {!hasStarted ? '30s' : `${timeLeft}s`}
                </span>
              </div>
            )}

            {/* Score Pill */}
            <div
              className="px-3 sm:px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
              style={{
                background: 'rgba(255, 251, 235, 0.8)',
                border: '1px solid rgba(253, 230, 138, 0.9)',
              }}
            >
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F59E0B]" />
              <span className="font-['Inter'] font-semibold text-xs sm:text-sm text-[#B45309]">
                {score.toLocaleString()} pts
              </span>
            </div>

            {/* Streak Indicator */}
            {streak > 1 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 font-['Inter'] font-bold text-xs animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-current text-orange-500" />
                <span>{streak}x</span>
              </div>
            )}
          </div>

          {/* Reset Button */}
          <button
            onClick={handleRestartDemo}
            type="button"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[rgba(226,232,240,0.9)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
            title="Restart Demo"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Main View: Question vs Intermediate Leaderboard vs Final Results */}
      {!isCompleted ? (
        showIntermediateLeaderboard ? (
          /* INTERMEDIATE LEADERBOARD */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 text-center py-2"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-[#F1F5F9] pb-4 gap-2">
              <div className="text-center sm:text-left">
                <span className="text-xs font-['Inter'] font-extrabold uppercase text-[#551BF5] tracking-wider bg-[#FAF5FF] border border-[#F3E8FF] px-3 py-1 rounded-full">
                  Live Leaderboard Arena
                </span>
                <h3 className="font-['Inter'] text-lg sm:text-2xl font-bold text-[#0F172A] mt-2">
                  Standings After Question {currentQIndex + 1}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[#B45309] font-['Inter'] font-bold text-xs sm:text-sm">
                <Trophy className="h-4 w-4 text-[#F59E0B]" />
                <span>Current Score: {score.toLocaleString()} pts</span>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="max-w-md mx-auto rounded-2xl bg-white border border-[#F1F5F9] shadow-[0px_1px_3px_rgba(0,0,0,0.05)] overflow-hidden divide-y divide-[#F1F5F9] text-left text-xs">
              {sortedLeaderboard.map((player, idx) => {
                const rankNum = idx + 1;
                const isUser = player.isUser;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 flex items-center justify-between transition-all ${
                      isUser ? 'bg-[#FAF7FE] border-l-4 border-[#551BF5] font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          rankNum === 1
                            ? 'bg-amber-400 text-white'
                            : rankNum === 2
                            ? 'bg-slate-300 text-slate-800'
                            : 'bg-amber-700 text-white'
                        }`}
                      >
                        {rankNum}
                      </span>
                      <div>
                        <span className={`font-['Inter'] text-sm block ${isUser ? 'text-[#0F172A] font-bold' : 'text-[#334155]'}`}>
                          {player.name}
                        </span>
                        <span className="text-[11px] text-[#64748B] font-medium">
                          {player.correct} Correct
                        </span>
                      </div>
                    </div>
                    <span className={`font-['Inter'] font-bold text-sm ${isUser ? 'text-[#551BF5]' : 'text-[#64748B]'}`}>
                      {player.score.toLocaleString()} pts
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Actions inside intermediate screen */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowIntermediateLeaderboard(false)}
                className="h-11 px-5 rounded-[14px] bg-white border border-[#E2E8F0] text-[#334155] font-['Inter'] font-semibold text-sm hover:bg-slate-50 transition-all cursor-pointer w-full sm:w-auto"
              >
                Back to Question Result
              </button>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="h-11 px-6 rounded-[14px] text-white font-['Inter'] font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0px_10px_22px_-4px_rgba(85,27,245,0.4)] cursor-pointer w-full sm:w-auto"
                style={{ background: 'linear-gradient(105.23deg, #551BF5 0%, #6C38FF 50%, #7A42F8 100%)' }}
              >
                <span>{currentQIndex < sampleQuestions.length - 1 ? 'Next Question' : 'Show Final Standings'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* ACTIVE QUESTION CARD & OPTIONS */
          <div className="space-y-4 sm:space-y-6">
            {/* Inner Question Card */}
            <div className="w-full rounded-[18px] sm:rounded-[24px] bg-white border border-[#F1F5F9] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-4 sm:p-10 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="px-2.5 sm:px-3 py-1 rounded-[8px] bg-[#FAF5FF] border border-[#F3E8FF] inline-flex items-center shrink-0">
                  <span className="font-['Inter'] font-extrabold text-[11px] sm:text-[12px] leading-4 tracking-[0.6px] uppercase text-[#551BF5] whitespace-nowrap">
                    {currentQ.category}
                  </span>
                </div>

                <span className="font-['Inter'] font-medium text-xs sm:text-sm text-[#94A3B8] whitespace-nowrap">
                  Question {currentQIndex + 1} of {sampleQuestions.length}
                </span>
              </div>

              <h3 className="font-['Inter'] font-extrabold text-lg sm:text-2xl lg:text-[30px] lg:leading-[36px] tracking-[-0.5px] sm:tracking-[-0.75px] text-[#0F172A] leading-snug">
                {currentQ.highlightedQuestion || currentQ.questionText}
              </h3>
            </div>

            {/* 2x2 Answer Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isRevealed = selectedOption !== null || isTimedOut;
                const cfg = optionConfig[idx] || optionConfig[0];

                let buttonClass = `${cfg.bg} ${cfg.border} shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[14px] sm:rounded-[16px] px-4 sm:px-5 py-3 sm:py-4 min-h-[56px] sm:min-h-[64px] flex items-center justify-between transition-all cursor-pointer`;

                if (!isRevealed) {
                  buttonClass += ` ${cfg.hover} hover:scale-[1.01] active:scale-[0.99]`;
                } else {
                  if (opt.isCorrect) {
                    buttonClass =
                      'bg-[#ECFDF5] border-2 border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.2)] rounded-[16px] px-5 py-4 min-h-[64px] flex items-center justify-between transition-all';
                  } else if (isSelected && !opt.isCorrect) {
                    buttonClass =
                      'bg-[#FFF1F2] border-2 border-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.2)] rounded-[16px] px-5 py-4 min-h-[64px] flex items-center justify-between transition-all';
                  } else {
                    buttonClass += ' opacity-50 cursor-not-allowed';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isRevealed}
                    onClick={() => handleSelectOption(idx)}
                    className={buttonClass}
                  >
                    {/* Left: Shape Icon + Option Text */}
                    <div className="flex items-center gap-3.5 overflow-hidden text-left pr-2">
                      <div className="w-7 h-7 flex items-center justify-center shrink-0">
                        <ShapeIcon type={opt.type} />
                      </div>
                      <span className="font-['Inter'] font-bold text-sm sm:text-base leading-6 text-[#0F172A] truncate">
                        {opt.text}
                      </span>
                    </div>

                    {/* Right: Radio Selection Circle / Result Icon */}
                    <div className="shrink-0 pl-2">
                      {isRevealed && opt.isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-[#10B981] animate-bounce" />
                      ) : isRevealed && isSelected && !opt.isCorrect ? (
                        <XCircle className="w-6 h-6 text-[#EF4444]" />
                      ) : (
                        <div
                          className={`w-6 h-6 rounded-full bg-white/60 border-2 ${cfg.radioBorder} flex items-center justify-center transition-all`}
                        >
                          {isSelected && <div className={`w-3 h-3 rounded-full ${cfg.radioDot}`} />}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback Banner & Action Buttons */}
            <AnimatePresence>
              {(selectedOption !== null || isTimedOut) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 p-3.5 sm:p-5 rounded-[18px] sm:rounded-[20px] bg-white border border-[#F1F5F9] shadow-[0px_4px_16px_rgba(85,27,245,0.06)] text-left overflow-hidden w-full"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {isTimedOut ? (
                      <div className="h-10 w-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
                        <Clock className="h-5 w-5" />
                      </div>
                    ) : currentQ.options[selectedOption].isCorrect ? (
                      <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-600 shrink-0">
                        <XCircle className="h-5 w-5" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="font-['Inter'] font-extrabold text-sm sm:text-base text-[#0F172A] leading-snug">
                        {isTimedOut
                          ? '⏰ Time is up! 30 seconds elapsed.'
                          : currentQ.options[selectedOption].isCorrect
                          ? `🎉 Correct! Earned +${earnedPts} pts!`
                          : `✕ Incorrect! Correct: ${currentQ.options.find((o) => o.isCorrect).text}`}
                      </p>
                      <p className="font-['Inter'] text-xs text-[#64748B] mt-0.5">
                        {streak > 1 ? `🔥 ${streak}x Answer Streak Active!` : 'Choose an action below to proceed.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => setShowIntermediateLeaderboard(true)}
                      className="h-10 px-2.5 sm:px-4 rounded-[12px] bg-amber-50 hover:bg-amber-100 active:scale-95 border border-amber-200 text-[#B45309] font-['Inter'] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap"
                    >
                      <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#F59E0B] shrink-0" />
                      <span>Leaderboard</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="h-10 px-3 sm:px-5 rounded-[12px] text-white font-['Inter'] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-95 active:scale-95 shadow-[0px_4px_10px_rgba(85,27,245,0.3)] transition-all whitespace-nowrap"
                      style={{ background: 'linear-gradient(105.23deg, #551BF5 0%, #6C38FF 50%, #7A42F8 100%)' }}
                    >
                      <span>{currentQIndex < sampleQuestions.length - 1 ? 'Next Question' : 'Final Results'}</span>
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      ) : (
        /* FINAL LEADERBOARD & RESULT SCREEN */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6 text-center py-4"
        >
          {/* Victory Trophy Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 relative z-10">
              <Trophy className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
          </div>

          <div>
            <span className="text-xs font-['Inter'] font-extrabold uppercase text-[#551BF5] tracking-widest bg-[#FAF5FF] border border-[#F3E8FF] px-3.5 py-1 rounded-full">
              Demo Gameplay Complete
            </span>
            <h3 className="font-['Inter'] text-2xl sm:text-4xl font-extrabold text-[#0F172A] mt-2.5">
              {userRankIndex === 0 ? '🏆 1st Place Podium Champion!' : userRankIndex === 1 ? '🥈 2nd Place Winner!' : '🥉 3rd Place Finish!'}
            </h3>
            <p className="font-['Inter'] text-sm sm:text-base text-[#475569] mt-1.5">
              Final Calculated Score:{' '}
              <span className="text-[#551BF5] font-extrabold">{score.toLocaleString()} pts</span> ({correctCount}/{sampleQuestions.length} Correct)
            </p>
          </div>

          {/* Final Standings Table */}
          <div className="max-w-md mx-auto rounded-2xl bg-white border border-[#F1F5F9] shadow-[0px_1px_3px_rgba(0,0,0,0.05)] overflow-hidden divide-y divide-[#F1F5F9] text-left text-xs">
            {sortedLeaderboard.map((player, idx) => {
              const rankNum = idx + 1;
              const isUser = player.isUser;

              return (
                <div
                  key={idx}
                  className={`p-3.5 flex items-center justify-between transition-all ${
                    isUser ? 'bg-[#FAF7FE] border-l-4 border-[#551BF5] font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        rankNum === 1
                          ? 'bg-amber-400 text-white'
                          : rankNum === 2
                          ? 'bg-slate-300 text-slate-800'
                          : 'bg-amber-700 text-white'
                      }`}
                    >
                      {rankNum}
                    </span>
                    <div>
                      <span className={`font-['Inter'] text-sm block ${isUser ? 'text-[#0F172A] font-bold' : 'text-[#334155]'}`}>
                        {player.name}
                      </span>
                      <span className="text-[11px] text-[#64748B] font-medium">
                        {player.correct} Correct
                      </span>
                    </div>
                  </div>
                  <span className={`font-['Inter'] font-bold text-sm ${isUser ? 'text-[#551BF5]' : 'text-[#64748B]'}`}>
                    {player.score.toLocaleString()} pts
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRestartDemo}
              className="h-11 px-5 rounded-[14px] bg-white border border-[#E2E8F0] text-[#334155] font-['Inter'] font-semibold text-sm hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Replay Demo</span>
            </button>

            <Link
              to="/register"
              onClick={() => {
                if (onCloseModal) onCloseModal();
              }}
              className="h-11 px-6 rounded-[14px] text-white font-['Inter'] font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0px_10px_22px_-4px_rgba(85,27,245,0.4)] w-full sm:w-auto"
              style={{ background: 'linear-gradient(105.23deg, #551BF5 0%, #6C38FF 50%, #7A42F8 100%)' }}
            >
              <span>Create Your First Quiz</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );

  if (isModal) {
    return cardContent;
  }

  return (
    <section
      id="interactive-demo"
      className="relative w-full bg-[#FAF8FF] py-14 sm:py-20 overflow-hidden scroll-mt-20"
    >
      {/* Ambient soft gradient glowing backdrops directly from Figma CSS */}
      <div
        className="absolute h-[384px] left-[25%] right-[37.5%] -top-[48px] rounded-full pointer-events-none filter blur-[64px]"
        style={{ background: 'rgba(243, 232, 255, 0.6)' }}
      />
      <div
        className="absolute w-[384px] h-[384px] -right-[40px] top-[30%] rounded-full pointer-events-none filter blur-[64px]"
        style={{ background: 'rgba(239, 246, 255, 0.7)' }}
      />
      <div
        className="absolute w-[320px] h-[320px] -left-[40px] -bottom-[40px] rounded-full pointer-events-none filter blur-[64px]"
        style={{ background: 'rgba(236, 254, 255, 0.7)' }}
      />

      {/* Main Container 1024px */}
      <div className="max-w-[1024px] mx-auto w-full px-4 sm:px-6 relative z-10 space-y-8 sm:space-y-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-[576px] mx-auto space-y-3 sm:space-y-4"
        >
          <h2 className="font-['Inter'] font-semibold text-3xl sm:text-4xl lg:text-[48px] lg:leading-[48px] tracking-[-1.2px] text-[#0F172A]">
            Interactive Product <span className="text-[#551BF5]">Demo</span>
          </h2>
          <p className="font-['Inter'] font-normal text-sm sm:text-base leading-6 text-[#475569]">
            Test drive our real-time interactive quiz experience! Pick an answer fast before the 30-second timer runs out.
          </p>
        </motion.div>

        {/* Demo Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onViewportEnter={startDemoTimer}
        >
          {cardContent}
        </motion.div>
      </div>
    </section>
  );
}
