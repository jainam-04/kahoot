import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, BookOpen, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createQuiz } from '../../services/quizService';
import { createGame } from '../../services/gameService';
import { useTheme } from '../../context/ThemeContext';
import { ALL_CURATED_QUIZZES, FEATURED_PRESET_QUIZZES } from '../../data/curatedQuizzes';

export default function ReadyQuizzesSection() {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [activeCategory, setActiveCategory] = useState('All');
  const [hostingId, setHostingId] = useState(null);

  const categories = ['All', 'Science', 'General Knowledge', 'Programming', 'Mathematics'];

  // On Home screen: Show 4 featured quizzes when 'All' is selected, or 2-3 for specific category
  const filteredQuizzes = activeCategory === 'All'
    ? FEATURED_PRESET_QUIZZES
    : ALL_CURATED_QUIZZES.filter(q => q.category.toLowerCase() === activeCategory.toLowerCase());

  // Action: Launch / Host Quiz
  const handleUseQuiz = async (quiz) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in or register to host a live quiz!');
      navigate('/login');
      return;
    }

    setHostingId(quiz._id);
    toast.loading('Initializing live quiz lobby...', { id: 'use-quiz' });

    try {
      let targetQuizId = quiz._id;

      // If it's a predefined preset, clone into the host's account first
      if (quiz.isPreset) {
        const createRes = await createQuiz({
          title: quiz.title,
          category: quiz.category,
          description: quiz.description,
          questions: quiz.questions
        });
        if (createRes.success && createRes.quiz) {
          targetQuizId = createRes.quiz._id;
        } else {
          toast.error('Failed to clone ready quiz', { id: 'use-quiz' });
          setHostingId(null);
          return;
        }
      }

      // Initialize game session lobby
      const gameRes = await createGame(targetQuizId);
      if (gameRes.success && gameRes.game) {
        toast.success(`Quiz Lobby Active! PIN: ${gameRes.game.pin}`, { id: 'use-quiz' });
        navigate(`/host/lobby/${gameRes.game.pin}`);
      } else {
        toast.error(gameRes.message || 'Failed to launch game lobby', { id: 'use-quiz' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error starting quiz lobby', { id: 'use-quiz' });
    } finally {
      setHostingId(null);
    }
  };

  return (
    <section id="ready-quizzes" className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
            <span>Featured Ready Library</span>
          </div>

          <h2 className={`font-outfit text-3xl sm:text-4xl md:text-5xl font-black tracking-tight ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>
            Ready-to-Use <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600">Quizzes</span>
          </h2>

          <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Pick from our curated library with 10 questions per quiz. Host live multiplayer games instantly without typing questions from scratch!
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25 scale-105'
                    : isLight
                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-purple-50 hover:text-purple-700 shadow-sm'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Quiz Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredQuizzes.map((quiz, index) => {
              const IconComponent = quiz.icon || Sparkles;
              const isHosting = hostingId === quiz._id;

              return (
                <motion.div
                  key={quiz._id || index}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className={`rounded-3xl border p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${
                    isLight
                      ? 'bg-white border-gray-200/80 hover:border-purple-300 hover:shadow-xl'
                      : 'bg-gradient-to-b from-[#13111c] to-[#0d0c14] border-white/10 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-950/30'
                  }`}
                >
                  {/* Top Badge & Category */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${quiz.gradient} flex items-center justify-center text-white shadow-md`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border ${
                        quiz.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : quiz.difficulty === 'Hard'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}>
                        {quiz.difficulty || 'Medium'}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-500 block mb-1">
                        {quiz.category}
                      </span>
                      <h3 className={`font-outfit text-base font-bold line-clamp-2 ${
                        isLight ? 'text-gray-900 group-hover:text-purple-700' : 'text-white group-hover:text-purple-300'
                      }`}>
                        {quiz.title}
                      </h3>
                      <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${
                        isLight ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {quiz.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Metadata & Action Button */}
                  <div className="pt-5 mt-4 border-t space-y-3" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center justify-between text-xs font-semibold text-muted">
                      <span className="flex items-center gap-1.5 font-bold">
                        <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                        <span>{quiz.questionsCount} Qs</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-bold">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>~5 mins</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUseQuiz(quiz)}
                      disabled={isHosting}
                      className="w-full btn-premium py-2.5 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isHosting ? (
                        <span>Launching Lobby...</span>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Use Quiz & Host</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
