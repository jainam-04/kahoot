import React, { useState, useRef } from 'react';
import {
  Play,
  LayoutGrid,
  FlaskConical,
  BookOpen,
  Code,
  Calculator,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createQuiz } from '../../services/quizService';
import { createGame } from '../../services/gameService';
import { useTheme } from '../../context/ThemeContext';
import { ALL_CURATED_QUIZZES, FEATURED_PRESET_QUIZZES } from '../../data/curatedQuizzes';

import scienceImg from '../../assets/quizzes/science.jpg';
import spaceImg from '../../assets/quizzes/space.jpg';
import biologyImg from '../../assets/quizzes/biology.jpg';
import gkImg from '../../assets/quizzes/gk.jpg';
import programmingImg from '../../assets/quizzes/programming.jpg';
import mathImg from '../../assets/quizzes/math.jpg';

export default function ReadyQuizzesSection() {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [activeCategory, setActiveCategory] = useState('All');
  const [hostingId, setHostingId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);

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

  // Carousel touch/scroll synchronization
  const handleScroll = () => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    const card = el.firstElementChild;
    if (!card) return;
    const cardWidth = card.getBoundingClientRect().width;
    const gap = 16;
    const index = Math.round(el.scrollLeft / (cardWidth + gap));
    const clamped = Math.max(0, Math.min(filteredQuizzes.length - 1, index));
    if (clamped !== activeIndex) {
      setActiveIndex(clamped);
    }
  };

  const scrollToIndex = (index) => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    const cards = el.children;
    if (cards && cards[index]) {
      cards[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      setActiveIndex(index);
    }
  };

  const handlePrev = () => {
    const nextIndex = Math.max(0, activeIndex - 1);
    scrollToIndex(nextIndex);
  };

  const handleNext = () => {
    const nextIndex = Math.min(filteredQuizzes.length - 1, activeIndex + 1);
    scrollToIndex(nextIndex);
  };

  const handleCategoryClick = (categoryName, e) => {
    setActiveCategory(categoryName);
    setActiveIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  // Determine metadata, illustration banner, and category styling
  const getQuizMeta = (quiz) => {
    if (quiz.image) {
      return {
        image: quiz.image,
        bgColor: quiz.bgColor || '#FFFFFF',
        categoryIcon: quiz.icon || FlaskConical,
        categoryLabel: (quiz.category || 'SCIENCE').toUpperCase(),
      };
    }

    const title = (quiz.title || '').toLowerCase();
    const cat = (quiz.category || '').toLowerCase();

    // Space & Astronomy Specific Quiz
    if (title.includes('space') || title.includes('solar') || quiz._id === 'preset_sci_02') {
      return {
        image: spaceImg,
        bgColor: '#E6FAF7',
        categoryIcon: FlaskConical,
        categoryLabel: 'SCIENCE',
      };
    }

    // Human Biology & Health Science Quiz
    if (title.includes('biology') || title.includes('health') || title.includes('anatomy') || quiz._id === 'preset_sci_03') {
      return {
        image: biologyImg,
        bgColor: '#E6FAF7',
        categoryIcon: FlaskConical,
        categoryLabel: 'SCIENCE',
      };
    }

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
          ? 'linear-gradient(180deg, #FAF8FF 0%, #FAF5FF 25%, #F4EEFE 55%, #FAF8FF 100%)'
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

          {/* Category Filter Pills: Standalone pills on mobile (< sm), Centered capsule on desktop (sm:) */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-full sm:w-auto overflow-x-auto scrollbar-none py-2 px-4 sm:px-0">
              <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-2 sm:p-1.5 sm:rounded-full sm:bg-white/85 sm:dark:bg-[#181528]/85 sm:border sm:border-[#E9D5FF]/80 sm:dark:border-purple-500/20 sm:shadow-[0px_2px_12px_rgba(85,27,245,0.08)] sm:backdrop-blur-md min-w-max">
                {categoryPills.map((pill) => {
                  const Icon = pill.icon;
                  const isSelected = activeCategory === pill.name;

                  return (
                    <button
                      key={pill.name}
                      type="button"
                      onClick={(e) => handleCategoryClick(pill.name, e)}
                      className={`h-9 sm:h-10 px-4 sm:px-5 rounded-full flex items-center gap-2 text-xs sm:text-sm transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap select-none ${
                        isSelected
                          ? 'bg-[#551BF5] text-white font-bold shadow-[0px_4px_6px_-1px_rgba(168,85,247,0.25),0px_2px_4px_-2px_rgba(168,85,247,0.25)] scale-[1.02]'
                          : 'bg-white dark:bg-[#181528] border border-[#E9D5FF] dark:border-purple-800/40 text-[#334155] dark:text-slate-200 font-semibold shadow-xs hover:border-[#551BF5]/40 hover:bg-white'
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
        </div>

        {/* Carousel / Cards Grid matching reference */}
        <div className="relative w-full max-w-[1243px]">
          {/* Scrollable Carousel Track on Mobile/Tablet (< lg), Grid on Desktop (lg:) */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="w-full flex lg:grid lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-none px-4 sm:px-6 lg:px-0 py-3 -my-3 after:content-[''] after:w-2 after:shrink-0 lg:after:hidden"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {filteredQuizzes.map((quiz, index) => {
              const meta = getQuizMeta(quiz);
              const badge = getDifficultyBadge(quiz.difficulty);
              const CategoryIcon = meta.categoryIcon;
              const isHosting = hostingId === quiz._id;

              return (
                <article
                  key={quiz._id || index}
                  className={`w-[84vw] max-w-[310px] sm:w-[320px] lg:w-full shrink-0 lg:shrink snap-center lg:snap-align-none rounded-[24px] overflow-hidden flex flex-col justify-between border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isLight
                    ? 'bg-white border-[#F3E8FF]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                    : 'bg-[#151224] border-purple-500/20 shadow-lg'
                    }`}
                >
                  {/* Top: Artwork Banner & Content */}
                  <div className="flex flex-col">
                    {/* Artwork Banner with 144px height */}
                    <div
                      className="relative w-full h-[144px] flex items-center justify-center overflow-hidden border-b border-[#F1F5F9]/80"
                      style={{ backgroundColor: meta.bgColor }}
                    >
                      <img
                        src={meta.image}
                        alt={quiz.title}
                        className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105"
                      />
                      {/* Difficulty Badge top right */}
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.25px] border shadow-xs ${badge.className}`}
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
                </article>
              );
            })}
          </div>

          {/* Mobile Carousel Controls: Arrows + Pagination Dots (< lg) */}
          {filteredQuizzes.length > 1 && (
            <div className="flex lg:hidden items-center justify-between w-full max-w-[280px] mx-auto mt-4 px-2">
              {/* Prev Button */}
              <button
                type="button"
                onClick={handlePrev}
                disabled={activeIndex === 0}
                aria-label="Previous quiz card"
                className="w-9 h-9 rounded-full bg-white dark:bg-[#181528] border border-[#E9D5FF] dark:border-purple-800/40 text-[#551BF5] dark:text-purple-300 flex items-center justify-center shadow-xs transition-all active:scale-95 disabled:opacity-25 disabled:pointer-events-none cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Pagination Dots */}
              <div className="flex items-center gap-2">
                {filteredQuizzes.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToIndex(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${activeIndex === idx
                      ? 'w-6 h-2 bg-[#551BF5]'
                      : 'w-2 h-2 bg-purple-200 dark:bg-purple-900/60 hover:bg-purple-300'
                      }`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                disabled={activeIndex === filteredQuizzes.length - 1}
                aria-label="Next quiz card"
                className="w-9 h-9 rounded-full bg-white dark:bg-[#181528] border border-[#E9D5FF] dark:border-purple-800/40 text-[#551BF5] dark:text-purple-300 flex items-center justify-center shadow-xs transition-all active:scale-95 disabled:opacity-25 disabled:pointer-events-none cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/40"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
