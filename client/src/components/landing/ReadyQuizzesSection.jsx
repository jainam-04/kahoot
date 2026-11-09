import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  LayoutGrid,
  FlaskConical,
  BookOpen,
  Code,
  Calculator,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createQuiz } from '../../services/quizService';
import { createGame } from '../../services/gameService';
import { useTheme } from '../../context/ThemeContext';
import { ALL_CURATED_QUIZZES, FEATURED_PRESET_QUIZZES } from '../../data/curatedQuizzes';

import scienceImg from '../../assets/quizzes/science.jpg';
import gkImg from '../../assets/quizzes/gk.jpg';
import programmingImg from '../../assets/quizzes/programming.jpg';
import mathImg from '../../assets/quizzes/math.jpg';

export default function ReadyQuizzesSection() {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [activeCategory, setActiveCategory] = useState('All');
  const [hostingId, setHostingId] = useState(null);

  const categoryPills = [
    { name: 'All', icon: LayoutGrid, iconColor: '#FFFFFF' },
    { name: 'Science', icon: FlaskConical, iconColor: '#10B981' },
    { name: 'General Knowledge', icon: BookOpen, iconColor: '#2563EB' },
    { name: 'Programming', icon: Code, iconColor: '#551BF5' },
    { name: 'Mathematics', icon: Calculator, iconColor: '#F59E0B' },
  ];

  // Show the top 4 curated featured presets on 'All', or filter by category
  const filteredQuizzes = activeCategory === 'All'
    ? FEATURED_PRESET_QUIZZES
    : ALL_CURATED_QUIZZES.filter(q => q.category.toLowerCase() === activeCategory.toLowerCase());

  // Determine metadata, illustration banner, and category styling
  const getQuizMeta = (quiz) => {
    const cat = (quiz.category || '').toLowerCase();
    if (cat.includes('science')) {
      return {
        image: scienceImg,
        bgColor: '#E6FAF7',
        categoryIcon: FlaskConical,
        categoryLabel: 'SCIENCE',
      };
    }
    if (cat.includes('general') || cat.includes('knowledge') || cat.includes('history') || cat.includes('pop')) {
      return {
        image: gkImg,
        bgColor: '#FFF7EA',
        categoryIcon: BookOpen,
        categoryLabel: 'GENERAL KNOWLEDGE',
      };
    }
    if (cat.includes('program') || cat.includes('code') || cat.includes('tech') || cat.includes('web')) {
      return {
        image: programmingImg,
        bgColor: '#F2EDFE',
        categoryIcon: Code,
        categoryLabel: 'PROGRAMMING',
      };
    }
    return {
      image: mathImg,
      bgColor: '#EBF5FE',
      categoryIcon: Calculator,
      categoryLabel: 'MATHEMATICS',
    };
  };

  const getDifficultyBadge = (difficulty) => {
    const diff = (difficulty || 'Medium').toLowerCase();
    if (diff === 'easy') {
      return {
        label: 'EASY',
        className: 'bg-[#E8FBF4] text-[#0D9488] border-[#A7F3D0]',
      };
    }
    if (diff === 'hard') {
      return {
        label: 'HARD',
        className: 'bg-[#FDF2F8] text-[#DB2777] border-[#FBCFE8]',
      };
    }
    return {
      label: 'MEDIUM',
      className: 'bg-[#FFF3EB] text-[#D95D1E] border-[#FED7AA]',
    };
  };

  // Launch live multiplayer session lobby
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

      // Clone preset quiz into host account if required
      if (quiz.isPreset) {
        const createRes = await createQuiz({
          title: quiz.title,
          category: quiz.category,
          description: quiz.description,
          questions: quiz.questions,
        });
        if (createRes.success && createRes.quiz) {
          targetQuizId = createRes.quiz._id;
        } else {
          toast.error('Failed to clone ready quiz', { id: 'use-quiz' });
          setHostingId(null);
          return;
        }
      }

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
    <section
      id="ready-quizzes"
      className="py-16 md:py-24 relative overflow-hidden transition-colors"
      style={{
        background: isLight
          ? 'linear-gradient(180deg, #FFFFFF 0%, #FAF8FF 25%, #F4EEFE 55%, #FFFFFF 100%)'
          : 'linear-gradient(180deg, #0B0914 0%, #16122E 45%, #0B0914 100%)',
      }}
    >
      <div className="max-w-[1351px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center gap-10">
        
        {/* Section Header matching Figma reference */}
        <div className="flex flex-col items-center text-center w-full max-w-[960px] mx-auto gap-4">
          <h2 className="flex flex-wrap items-center justify-center gap-2 text-3xl sm:text-4xl md:text-[48px] md:leading-[48px] tracking-[-1.2px] font-semibold text-[#0D0B26] dark:text-white">
            <span>Ready to Use</span>
            <span className="font-bold text-[#551BF5]">Quizzes</span>
          </h2>

          <p className="text-sm sm:text-base leading-6 text-[#475569] dark:text-gray-300 max-w-[672px] text-center">
            Pick from our curated library with 10 questions per quiz. Host live multiplayer games instantly without typing questions from scratch!
          </p>

          {/* Capsule Container Bar with category filter pills */}
          <div className="mt-2 w-full flex justify-center">
            <div className="p-1.5 sm:p-2 inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-white/70 dark:bg-[#181528]/80 border border-[#E9D5FF]/70 dark:border-purple-500/20 shadow-[0px_1px_12px_rgba(0,0,0,0.12)] backdrop-blur-md max-w-full overflow-x-auto no-scrollbar">
              {categoryPills.map((pill) => {
                const Icon = pill.icon;
                const isSelected = activeCategory === pill.name;

                return (
                  <button
                    key={pill.name}
                    type="button"
                    onClick={() => setActiveCategory(pill.name)}
                    className={`h-9 sm:h-10 px-4 sm:px-5 rounded-full flex items-center gap-2 text-xs sm:text-sm transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#551BF5] text-white font-bold shadow-[0px_4px_6px_-1px_rgba(168,85,247,0.25),0px_2px_4px_-2px_rgba(168,85,247,0.25)] scale-[1.02]'
                        : 'bg-white/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 text-[#334155] dark:text-slate-200 font-semibold hover:bg-white dark:hover:bg-white/20'
                    }`}
                  >
                    <Icon
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors"
                      style={{ color: isSelected ? '#FFFFFF' : pill.iconColor }}
                    />
                    <span>{pill.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4 Curated Quiz Cards Grid matching reference */}
        <div className="w-full max-w-[1243px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 filter drop-shadow-[0px_1px_7px_rgba(0,0,0,0.13)]">
          <AnimatePresence mode="popLayout">
            {filteredQuizzes.map((quiz, index) => {
              const meta = getQuizMeta(quiz);
              const badge = getDifficultyBadge(quiz.difficulty);
              const CategoryIcon = meta.categoryIcon;
              const isHosting = hostingId === quiz._id;

              return (
                <motion.article
                  key={quiz._id || index}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className={`w-full rounded-[24px] overflow-hidden flex flex-col justify-between border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isLight
                      ? 'bg-white border-[#F3E8FF]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                      : 'bg-[#151224] border-purple-500/20 shadow-lg'
                  }`}
                >
                  {/* Top: Artwork Banner & Content */}
                  <div className="flex flex-col">
                    {/* Artwork Banner with 144px height */}
                    <div
                      className="relative w-full h-[144px] flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: meta.bgColor }}
                    >
                      <img
                        src={meta.image}
                        alt={quiz.title}
                        className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105"
                      />
                      {/* Difficulty Badge top right */}
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.25px] border shadow-sm ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 flex flex-col gap-2">
                      {/* Category Label */}
                      <div className="flex items-center gap-1.5">
                        <CategoryIcon className="w-3.5 h-3.5 text-[#551BF5] shrink-0" />
                        <span className="text-[12px] font-black uppercase tracking-[0.6px] text-[#551BF5]">
                          {meta.categoryLabel}
                        </span>
                      </div>

                      {/* Heading 3 - Title */}
                      <h3
                        className="text-[16px] leading-[22px] font-bold text-[#0F172A] dark:text-white truncate"
                        title={quiz.title}
                      >
                        {quiz.title}
                      </h3>

                      {/* Description */}
                      <p className="text-[14px] leading-[20px] text-[#64748B] dark:text-gray-300 line-clamp-2 h-[40px]">
                        {quiz.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Meta Specs row & Action Button */}
                  <div className="px-5 pb-5 pt-0 flex flex-col gap-3">
                    {/* Meta Specs row */}
                    <div className="pt-2.5 pb-2.5 border-t border-[#F1F5F9] dark:border-white/10 flex items-center justify-between text-[12px] font-semibold text-[#334155] dark:text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#551BF5] shrink-0" />
                        <span>{quiz.questionsCount || 10} Qs</span>
                      </div>

                      <span className="text-[#E2E8F0] dark:text-gray-600 font-normal">|</span>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#551BF5] shrink-0" />
                        <span>~5 mins</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => handleUseQuiz(quiz)}
                      disabled={isHosting}
                      className="w-full h-10 px-4 rounded-xl text-[14px] font-bold text-white bg-[#551BF5] hover:bg-[#4715d4] active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isHosting ? (
                        <span>Launching Lobby...</span>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white text-white" />
                          <span>Use Quiz & Host</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
