import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Trash2, Search, Filter, Plus, ArrowLeft, 
  HelpCircle, Calendar, ArrowRight, ShieldCheck,
  BarChart3, Trophy, Users, Pencil
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import ReportsModal from '../components/ReportsModal';
import { getMyQuizzes, deleteQuiz } from '../services/quizService';
import { getMyResults } from '../services/resultService';
import { createGame } from '../services/gameService';

import { useTheme } from '../context/ThemeContext';

export default function MyQuizzes() {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openReportMenuId, setOpenReportMenuId] = useState(null);

  // Query to fetch quizzes
  const { 
    data, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['my-quizzes-full'],
    queryFn: getMyQuizzes,
  });

  const { 
    data: resultsData, 
    isLoading: isResultsLoading 
  } = useQuery({
    queryKey: ['my-results'],
    queryFn: getMyResults,
  });

  // Launch Host Game Mutation
  const hostGameMutation = useMutation({
    mutationFn: createGame,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Lobby created! PIN active');
        navigate(`/host/lobby/${data.game.pin}`);
      } else {
        toast.error(data.message || 'Lobby creation failed');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error creating lobby session');
    }
  });

  // Delete Quiz Mutation
  const deleteQuizMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Quiz deleted successfully');
        refetch();
      } else {
        toast.error(data.message || 'Failed to delete quiz');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error deleting quiz');
    }
  });

  const handleHostGame = (quizId) => {
    toast.loading('Initializing lobby...', { id: 'lobby-init' });
    hostGameMutation.mutate(quizId, {
      onSettled: () => toast.dismiss('lobby-init')
    });
  };

  const handleDeleteQuiz = (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      toast.loading('Deleting quiz...', { id: 'quiz-delete' });
      deleteQuizMutation.mutate(quizId, {
        onSettled: () => toast.dismiss('quiz-delete')
      });
    }
  };

  // Filter quizzes based on search query and category selector
  const quizzes = data?.quizzes || [];
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                            quiz.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Unique categories list
  const categories = ['all', ...new Set(quizzes.map(q => q.category).filter(Boolean))];

  return (
    <AnimatedPage>
      <div className={`relative min-h-screen p-4 sm:p-6 md:p-8 overflow-x-hidden ${
        isLight ? 'bg-slate-50 text-gray-800' : 'bg-background text-gray-200'
      }`}>
        
        {/* Glow Spheres */}
        <div className="absolute top-[-5%] left-[10%] h-[350px] w-[350px] bg-glow-primary pointer-events-none opacity-40"></div>
        <div className="absolute bottom-[10%] right-[5%] h-[400px] w-[400px] bg-glow-secondary pointer-events-none opacity-30"></div>

        <div className="mx-auto max-w-7xl relative z-10 space-y-6 text-left">
          
          {/* Header */}
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 ${
            isLight ? 'border-gray-200' : 'border-white/5'
          }`}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/dashboard')}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isLight ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
                aria-label="Back"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>
              <div>
                <h1 className={`font-outfit text-3xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  My Quizzes
                </h1>
                <p className={`text-xs mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  Manage and launch your multiplayer rooms.
                </p>
              </div>
            </div>

            <Link
              to="/quiz/create"
              className="btn-premium btn-primary-gradient px-5 py-2.5 flex items-center gap-1.5 text-xs font-bold shadow-premium-glow text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Create a Quiz</span>
            </Link>
          </div>

          {/* FILTERING CONTROLS */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Box */}
            <div className="relative w-full sm:max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Search className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                placeholder="Search quizzes by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 pl-11 text-sm transition-all focus:outline-none focus:border-primary ${
                  isLight 
                    ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm' 
                    : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                }`}
              />
            </div>

            {/* Category Dropdown */}
            {categories.length > 1 && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary uppercase font-semibold tracking-wider cursor-pointer ${
                    isLight 
                      ? 'bg-white border-gray-200 text-gray-900 shadow-sm' 
                      : 'bg-[#111115] border-white/10 text-white'
                  }`}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* QUIZZES CARD GRID */}
          {isLoading || isResultsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 skeleton-loading rounded-2xl"></div>
              ))}
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className={`rounded-3xl p-16 text-center space-y-4 max-w-lg mx-auto border ${
              isLight ? 'bg-white border-gray-200 shadow-sm' : 'glass-panel border-white/5'
            }`}>
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className={`font-outfit text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                No Quizzes Found
              </h3>
              <p className={`text-xs max-w-[280px] mx-auto leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                {searchQuery || selectedCategory !== 'all' 
                  ? "We couldn't find any quizzes matching your search keyword or selected category filter."
                  : "You haven't created any quizzes yet. Click 'Create a Quiz' to start creating your first multiplayer room."}
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    isLight ? 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700' : 'btn-premium btn-glass'
                  }`}
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filteredQuizzes.map((quiz) => (
                  <motion.div
                    key={quiz._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[220px] border transition-all group relative ${
                      isLight 
                        ? 'bg-white border-gray-200/80 shadow-sm hover:shadow-md hover:border-primary/40' 
                        : 'glass-panel border-white/5 hover:border-primary/25'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      {/* Badge / Header bar */}
                      <div className="flex justify-between items-center gap-2 mb-2">
                        <span className="text-[9px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {quiz.category || 'General'}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-semibold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                            {quiz.questions?.length || 0} Questions
                          </span>
                          
                          {/* Edit Button */}
                          <button
                            onClick={() => navigate(`/quiz/edit/${quiz._id}`)}
                            className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                              isLight ? 'border-primary/30 text-primary hover:bg-primary/10' : 'border-primary/20 text-primary/70 hover:text-primary hover:bg-primary/10'
                            }`}
                            title="Edit Quiz"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteQuiz(quiz._id)}
                            className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                              isLight ? 'border-red-500/30 text-red-500 hover:bg-red-500/10' : 'border-red-500/10 text-red-500/70 hover:text-red-400 hover:bg-red-500/10'
                            }`}
                            title="Delete Quiz"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="px-1 pt-3">
                        <h3
                          className={`font-outfit text-base group-hover:text-primary transition-colors line-clamp-2 leading-snug font-black ${
                            isLight ? 'text-gray-900' : 'text-white'
                          }`}
                          style={{ letterSpacing: '-0.02em' }}
                        >
                          {quiz.title}
                        </h3>
                        <p className={`text-xs font-semibold mt-1.5 line-clamp-2 leading-relaxed ${
                          isLight ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {quiz.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>

                    {/* Launch + Reports buttons */}
                    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-5 pt-4 border-t ${
                      isLight ? 'border-gray-100' : 'border-white/5'
                    }`}>
                      <button
                        onClick={() => handleHostGame(quiz._id)}
                        className="flex-1 w-full sm:w-auto btn-premium btn-primary-gradient py-2 px-4 flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-premium-glow text-white"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Launch Lobby</span>
                      </button>

                      {(() => {
                        // Match by plain string quizId OR populated quizId._id
                        const quizResults = (resultsData?.results || []).filter(res => {
                          const rid = res.quizId?._id || res.quizId;
                          return rid === quiz._id || rid?.toString() === quiz._id?.toString();
                        });

                        const hasResults = quizResults.length > 0;

                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!hasResults) return;
                              setOpenReportMenuId(quiz._id);
                            }}
                            className={`w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl border transition-all text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                              hasResults
                                ? 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 cursor-pointer'
                                : 'bg-white/2 border-white/5 text-gray-600 cursor-default'
                            }`}
                            title={hasResults ? `View reports (${quizResults.length} session${quizResults.length > 1 ? 's' : ''})` : 'No reports yet — launch a lobby first'}
                          >
                            <BarChart3 className={`h-3.5 w-3.5 ${hasResults ? 'text-secondary animate-pulse' : 'text-gray-600'}`} />
                            <span>{hasResults ? `Reports (${quizResults.length})` : 'No Reports'}</span>
                          </button>
                        );
                      })()}
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

        </div>
      </div>

      <ReportsModal
        isOpen={!!openReportMenuId}
        onClose={() => setOpenReportMenuId(null)}
        quiz={data?.quizzes?.find(q => q._id === openReportMenuId)}
        results={(resultsData?.results || []).filter(res => {
          const rid = res.quizId?._id || res.quizId;
          return rid === openReportMenuId || rid?.toString() === openReportMenuId?.toString();
        })}
        isLoading={isResultsLoading}
      />
    </AnimatedPage>
  );
}
