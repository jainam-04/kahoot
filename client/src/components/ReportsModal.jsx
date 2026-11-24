import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Users, Calendar, X, Clock, Award, ChevronRight, BarChart3, Loader2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useScrollLock } from '../utils/scrollLock';

export default function ReportsModal({ isOpen, onClose, quiz, results = [], isLoading = false }) {
  const navigate = useNavigate();
  const { themeMode } = useTheme();

  // Lock background scroll when modal is open
  useScrollLock(isOpen);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const SkeletonCard = () => (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/40 animate-pulse space-y-4 text-left">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-1/6" />
      </div>
      <div className="h-10 bg-slate-200 dark:bg-gray-700 rounded w-full" />
      <div className="space-y-2 mt-2">
        <div className="h-7 bg-slate-100 dark:bg-gray-800/60 rounded" />
        <div className="h-7 bg-slate-100 dark:bg-gray-800/60 rounded" />
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal card container */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reports-modal-title"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl dark:shadow-black/50 overflow-hidden z-10 flex flex-col max-h-[85vh] transition-colors duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-gray-800 shrink-0 text-left bg-slate-50/55 dark:bg-[#111827]">
            <div>
              <h3 id="reports-modal-title" className="font-outfit text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Battle Reports
              </h3>
              {quiz && (
                <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 mt-1 truncate max-w-[400px]">
                  Quiz: <span className="text-[#6320EE] dark:text-purple-400 font-bold">{quiz.title}</span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Close reports modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-5 scrollbar-thin">
            {isLoading ? (
              <>
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                  <span>Loading reports...</span>
                </div>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-gray-800/80 border border-indigo-100/50 dark:border-gray-700/50 flex items-center justify-center shadow-sm text-indigo-500">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-outfit text-lg font-bold text-slate-800 dark:text-white">
                  No Battle Reports Yet
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 max-w-[320px] leading-relaxed">
                  Complete a multiplayer quiz to generate your first report.
                </p>
              </div>
            ) : (
              results.map((res) => {
                // Sort players by score
                const sortedPlayers = [...(res.players || [])].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
                const totalPlayers = res.players?.length || 0;
                const formattedDate = new Date(res.playedAt || res.createdAt || Date.now()).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const formattedTime = new Date(res.playedAt || res.createdAt || Date.now()).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                const winnerName = res.winner || sortedPlayers[0]?.fullName || sortedPlayers[0]?.name || 'No winner registered';

                return (
                  <div
                    key={res._id}
                    className="relative p-5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#1F2937]/50 shadow-xs hover:shadow-md dark:shadow-black/10 hover:border-purple-300 dark:hover:border-purple-500/40 transition-all duration-300 flex flex-col gap-4 group"
                  >
                    {/* Header row: Date, Time & Players Count */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-slate-100 dark:border-gray-700/50 pb-3">
                      <div className="flex items-center flex-wrap gap-2 text-slate-700 dark:text-slate-200 text-left">
                        <Calendar className="h-4 w-4 text-[#6320EE] dark:text-purple-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{formattedDate}</span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-600 font-semibold">•</span>
                        <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold">{formattedTime}</span>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EEF2FF] dark:bg-purple-500/10 border border-[#E0E7FF] dark:border-purple-500/20 text-[#4F46E5] dark:text-purple-300 text-[10px] font-black uppercase tracking-wider self-start sm:self-auto">
                        <Users className="h-3 w-3" />
                        <span>{totalPlayers} Players</span>
                      </div>
                    </div>

                    {/* Winner Row */}
                    <div className="flex items-center gap-2 bg-[#ECFDF5] dark:bg-green-500/10 border border-[#A7F3D0]/70 dark:border-green-500/20 px-3.5 py-2.5 rounded-xl text-left">
                      <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold">Winner:</span>
                      <span className="text-xs text-[#059669] dark:text-green-400 font-bold truncate">
                        {winnerName}
                      </span>
                    </div>

                    {/* Player Standings Leaderboard */}
                    {sortedPlayers.length > 0 ? (
                      <div className="space-y-2 text-left">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-[#6320EE] dark:text-purple-400" />
                          <span>Leaderboard Standings</span>
                        </p>

                        {/* Scrollable Player Standings List */}
                        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-gray-800">
                          {sortedPlayers.map((player, idx) => {
                            const pName = player.fullName || player.name || `Player ${idx + 1}`;
                            const isWinner = pName === winnerName || player.name === res.winner || player.fullName === res.winner || idx === 0;
                            const rank = idx + 1;
                            let rankColor = "text-slate-500 dark:text-slate-400";
                            let rankIcon = `#${rank}`;
                            let bgClass = "bg-white dark:bg-[#111827]/40 border-slate-100 dark:border-gray-800/40";

                            if (rank === 1) {
                              rankColor = "text-amber-500 font-bold";
                              rankIcon = <Trophy className="h-4 w-4 text-yellow-500 inline-block" />;
                              bgClass = "bg-[#FFFBEB] dark:bg-amber-500/10 border-[#FDE68A] dark:border-amber-500/20";
                            } else if (rank === 2) {
                              rankColor = "text-slate-400 font-bold";
                              rankIcon = <Trophy className="h-4 w-4 text-slate-400 inline-block" />;
                              bgClass = "bg-[#F8FAFC] dark:bg-slate-400/10 border-[#E2E8F0] dark:border-slate-400/20";
                            } else if (rank === 3) {
                              rankColor = "text-amber-700 font-bold";
                              rankIcon = <Trophy className="h-4 w-4 text-amber-700 inline-block" />;
                              bgClass = "bg-[#FFF7ED] dark:bg-amber-700/10 border-[#FED7AA] dark:border-amber-700/20";
                            } else if (isWinner) {
                              bgClass = "bg-[#ECFDF5] dark:bg-green-500/10 border-[#A7F3D0] dark:border-green-500/20";
                            }

                            return (
                              <div
                                key={idx}
                                className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-xl border ${bgClass} transition-all`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`w-5 flex items-center justify-center ${rankColor}`}>{rankIcon}</span>
                                  <span className={`font-semibold truncate ${isWinner ? 'text-[#059669] dark:text-green-400 font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {pName} {isWinner && <Trophy className="inline h-3.5 w-3.5 text-yellow-500 ml-1" />}
                                  </span>
                                </div>
                                <span className="font-bold text-[#6320EE] dark:text-purple-400 shrink-0">{player.totalScore || 0} pts</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 italic text-left">No players logged in this battle session.</span>
                    )}

                    {/* View report card button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        const targetId = (res.sessionId && typeof res.sessionId === 'object')
                          ? (res.sessionId._id || res.sessionId.id)
                          : (res.sessionId || res._id);
                        navigate(`/results/${targetId}`);
                      }}
                      className="w-full mt-1.5 py-2.5 px-4 rounded-xl bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#EDE9FE] text-[#6320EE] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-[#6320EE]"
                    >
                      <span>View Full Analytics Report</span>
                      <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
