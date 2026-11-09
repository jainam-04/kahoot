import React, { useState, useRef } from 'react';
import { Zap, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/* ==========================================================
   Custom Illustration Components matching Figma Vector Specs
   ========================================================== */

// Card 01: Join or Create a Quiz
function StepOneIllustration() {
  return (
    <div className="relative w-full h-[144px] flex items-center justify-center select-none pointer-events-none">
      {/* Soft background blob */}
      <div className="absolute w-28 h-28 rounded-full bg-gradient-to-b from-[#F3E8FF] to-[#EDE9FE] opacity-80" />

      {/* Mini Window with users */}
      <div className="relative z-10 w-[112px] h-[66px] bg-white rounded-xl border border-[#F3E8FF] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
        {/* Window Header Bar */}
        <div className="h-[14px] bg-[#551BF5] px-2 flex items-center gap-1 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
        </div>

        {/* Window Interior with 3 Avatars */}
        <div className="flex-1 bg-[#FAF8FF] relative flex items-center justify-center">
          {/* Avatar Left */}
          <div className="w-6 h-6 rounded-full bg-[#D8B4FE] border-2 border-white shadow-sm flex items-center justify-center text-white -mr-1.5 z-0">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          {/* Avatar Center (Main) */}
          <div className="w-7 h-7 rounded-full bg-[#551BF5] border-2 border-white shadow-sm flex items-center justify-center text-white z-10">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          {/* Avatar Right */}
          <div className="w-6 h-6 rounded-full bg-[#C084FC] border-2 border-white shadow-sm flex items-center justify-center text-white -ml-1.5 z-0">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Floating Plus badge */}
      <div className="absolute z-20 right-[56px] bottom-6 w-7 h-7 rounded-full bg-[#551BF5] border-2 border-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.15)] flex items-center justify-center text-white font-bold text-sm leading-none">
        +
      </div>
    </div>
  );
}

// Card 02: Answer Questions
function StepTwoIllustration() {
  return (
    <div className="relative w-full h-[144px] flex items-center justify-center select-none pointer-events-none">
      {/* Soft background blob */}
      <div className="absolute w-28 h-28 rounded-full bg-gradient-to-b from-[#F3E8FF] to-[#EDE9FE] opacity-80" />

      {/* Mini Window with question options */}
      <div className="relative z-10 w-[112px] h-[78px] bg-white rounded-xl border border-[#F3E8FF] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
        {/* Window Header Bar */}
        <div className="h-[14px] bg-[#551BF5] px-2 flex items-center gap-1 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
        </div>

        {/* Window Body */}
        <div className="flex-1 bg-[#FAF8FF] p-2.5 flex flex-col gap-2">
          {/* Question line placeholder */}
          <div className="w-[72px] h-1.5 bg-[#E9D5FF] rounded-full" />

          {/* Option 1: Selected Radio */}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-[#551BF5] bg-white flex items-center justify-center shrink-0">
              <div className="w-1 h-1 rounded-full bg-[#551BF5]" />
            </div>
            <div className="w-[67px] h-1.5 bg-[#E2E8F0] rounded-full" />
          </div>

          {/* Option 2: Unselected Radio */}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border border-[#CBD5E1] bg-white shrink-0" />
            <div className="w-[60px] h-1.5 bg-[#E2E8F0] rounded-full" />
          </div>
        </div>
      </div>

      {/* Floating Purple Cursor Pointer */}
      <div className="absolute z-20 right-[56px] bottom-5 drop-shadow-md">
        <svg className="w-6 h-6 -rotate-12" viewBox="0 0 24 24" fill="none">
          <path
            d="M5.5 3.5l12 6.5-6.5 2-2 6.5-3.5-15z"
            fill="#551BF5"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// Card 03: Earn Points
function StepThreeIllustration() {
  return (
    <div className="relative w-full h-[144px] flex items-center justify-center select-none pointer-events-none">
      {/* Soft background blob */}
      <div className="absolute w-28 h-28 rounded-full bg-gradient-to-b from-[#F3E8FF] to-[#EDE9FE] opacity-80" />

      {/* Trophy with handles & star */}
      <div className="relative z-10 drop-shadow-[0px_8px_10px_rgba(0,0,0,0.08)]">
        <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none">
          {/* Trophy Handles */}
          <path
            d="M18 28c-5 0-8 4-8 9s3 9 8 9M62 28c5 0 8 4 8 9s-3 9-8 9"
            stroke="#F59E0B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Trophy Cup Body */}
          <path
            d="M22 22h36v16c0 10-8 18-18 18s-18-8-18-18V22z"
            fill="url(#trophy-grad)"
          />
          {/* Star on Trophy */}
          <path
            d="M40 31l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L40 31z"
            fill="#FFFBEB"
          />
          {/* Trophy Stem */}
          <path d="M37 56h6v8h-6z" fill="#D97706" />
          {/* Trophy Base */}
          <path d="M28 64h24v5c0 1-1 2-2 2H30c-1 0-2-1-2-2v-5z" fill="#F59E0B" />
          <defs>
            <linearGradient id="trophy-grad" x1="22" y1="22" x2="58" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FBBF24" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Score Star Tokens at bottom-right */}
      <div className="absolute z-20 right-[58px] bottom-5 flex items-center">
        {/* Token 1 */}
        <div className="w-6 h-6 rounded-full bg-[#7C3AED] border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] -mr-2 z-0 font-bold">
          ★
        </div>
        {/* Token 2 */}
        <div className="w-7 h-7 rounded-full bg-[#551BF5] border-2 border-white shadow-lg flex items-center justify-center text-white text-xs z-10 font-bold">
          ★
        </div>
      </div>
    </div>
  );
}

// Card 04: Compete on Leaderboard
function StepFourIllustration() {
  return (
    <div className="relative w-full h-[144px] flex items-center justify-center select-none pointer-events-none">
      {/* Soft background blob */}
      <div className="absolute w-28 h-28 rounded-full bg-gradient-to-b from-[#F3E8FF] to-[#EDE9FE] opacity-80" />

      {/* Podium with Crown */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Golden Crown */}
        <div className="relative z-20 -mb-2 drop-shadow-md">
          <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
            <path
              d="M4 19l2.5-10 5.5 5.5 4-9 4 9 5.5-5.5L24 19H4z"
              fill="#F59E0B"
              stroke="#D97706"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <circle cx="6.5" cy="9" r="1.5" fill="#FCD34D" />
            <circle cx="12" cy="14.5" r="1.5" fill="#FCD34D" />
            <circle cx="16" cy="5.5" r="1.5" fill="#FCD34D" />
            <circle cx="20" cy="14.5" r="1.5" fill="#FCD34D" />
            <circle cx="23.5" cy="9" r="1.5" fill="#FCD34D" />
          </svg>
        </div>

        {/* 3 Pillars */}
        <div className="flex items-end shadow-md rounded-xl overflow-hidden border border-[#E9D5FF]/60">
          {/* Pillar 2 (Left) */}
          <div className="w-8 h-10 bg-[#A5B4FC] flex items-center justify-center text-white font-black text-xs shadow-inner">
            2
          </div>
          {/* Pillar 1 (Center) */}
          <div className="w-10 h-14 bg-[#551BF5] flex items-center justify-center text-white font-black text-sm shadow-inner z-10">
            1
          </div>
          {/* Pillar 3 (Right) */}
          <div className="w-8 h-8 bg-[#C7D2FE] flex items-center justify-center text-white font-black text-xs shadow-inner">
            3
          </div>
        </div>
      </div>
    </div>
  );
}

const stepsData = [
  {
    step: '01',
    title: 'Join or Create a Quiz',
    desc: 'Host your own customized battle room or join instantly with a 6-digit Game PIN.',
    illustration: <StepOneIllustration />,
  },
  {
    step: '02',
    title: 'Answer Questions',
    desc: 'Respond in real-time on any device before the countdown timer runs out.',
    illustration: <StepTwoIllustration />,
  },
  {
    step: '03',
    title: 'Earn Points',
    desc: 'Rack up higher points for accuracy, answer speed, and consecutive answer streaks.',
    illustration: <StepThreeIllustration />,
  },
  {
    step: '04',
    title: 'Compete on Leaderboard',
    desc: 'Watch real-time rank changes and celebrate podium champions on the live screen.',
    illustration: <StepFourIllustration />,
  },
];

export default function HowItWorksSection() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    const card = el.firstElementChild;
    if (!card) return;
    const cardWidth = card.getBoundingClientRect().width;
    const gap = 16;
    const index = Math.round(el.scrollLeft / (cardWidth + gap));
    const clamped = Math.max(0, Math.min(stepsData.length - 1, index));
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
    const nextIndex = Math.min(stepsData.length - 1, activeIndex + 1);
    scrollToIndex(nextIndex);
  };

  return (
    <section
      id="how-it-works"
      className="py-12 sm:py-20 relative overflow-hidden transition-colors"
      style={{
        background: isLight ? '#FAF8FF' : '#0B0914',
      }}
    >
      {/* Ambient soft backdrop glow matching Figma specs */}
      <div
        className="absolute w-[900px] h-[500px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full blur-[64px]"
        style={{
          background: isLight ? 'rgba(243, 232, 255, 0.45)' : 'rgba(85, 27, 245, 0.12)',
        }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center gap-[29px]">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-[768px] mx-auto">
          {/* Pill Badge: ⚡ 4-STEP PROCESS */}
          <div className="mb-5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#EDE9FE] dark:bg-purple-950/40 border border-[#E9D5FF]/80 dark:border-purple-500/30 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <Zap className="w-3.5 h-3.5 fill-[#551BF5] text-[#551BF5]" />
            <span className="text-[12px] font-black uppercase tracking-[0.6px] text-[#551BF5] dark:text-purple-300">
              4-STEP PROCESS
            </span>
          </div>

          {/* Heading 2: How Gubbi Works */}
          <h2 className="mb-4 text-3xl sm:text-4xl md:text-[48px] md:leading-[48px] tracking-[-1.2px] font-medium text-[#0D0B26] dark:text-white">
            <span>How </span>
            <span className="font-bold text-[#551BF5]">Gubbi</span>
            <span> Works</span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base leading-6 text-[#475569] dark:text-gray-300 max-w-[672px] text-center">
            From lobby countdown to live podium glory — join multiplayer quiz battles in seconds.
          </p>
        </div>

        {/* 4 Cards Track: Horizontal Swipeable Carousel on Mobile (< lg), 4-Column Grid on Desktop (lg:) */}
        <div className="relative w-full max-w-[1216px]">
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="w-full flex lg:grid lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-none px-4 sm:px-6 lg:px-0 py-3 -my-3 after:content-[''] after:w-2 after:shrink-0 lg:after:hidden filter drop-shadow-[0px_2px_8px_rgba(0,0,0,0.13)]"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {stepsData.map((item, idx) => (
              <div
                key={item.step}
                className={`relative w-[84vw] max-w-[310px] sm:w-[320px] lg:w-full shrink-0 lg:shrink snap-center lg:snap-align-none rounded-[24px] p-5 flex flex-col justify-between border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isLight
                    ? 'bg-white border-[#F3E8FF]/70 shadow-[0px_10px_15px_-3px_rgba(168,85,247,0.05),0px_4px_6px_-4px_rgba(168,85,247,0.05)]'
                    : 'bg-[#151224] border-purple-500/20 shadow-xl'
                }`}
              >
                {/* Card Container */}
                <div className="flex flex-col gap-1">
                  {/* Step Pill Badge */}
                  <div className="flex items-center">
                    <div className="px-3 py-0.5 rounded-full bg-[#EDE9FE] dark:bg-purple-950/60 inline-flex items-center justify-center">
                      <span className="text-[12px] font-extrabold leading-4 text-[#551BF5] dark:text-purple-300">
                        {item.step}
                      </span>
                    </div>
                  </div>

                  {/* Illustration Area */}
                  {item.illustration}

                  {/* Heading 3 - Title */}
                  <h3 className="text-[18px] leading-[25px] font-bold text-[#0F172A] dark:text-white mt-1">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[12px] leading-5 text-[#64748B] dark:text-gray-300 min-h-[40px] mt-1">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Accent Pill Bar (48px x 4px) */}
                <div className="pt-4 flex justify-center">
                  <div className="w-12 h-1 bg-[#551BF5] rounded-full" />
                </div>

                {/* Connector Arrow Bubble between cards (1 -> 2, 2 -> 3, 3 -> 4) for Desktop */}
                {idx < 3 && (
                  <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[#551BF5] shadow-[0_0_0_4px_#FFFFFF,0_4px_6px_-1px_rgba(168,85,247,0.3)] dark:shadow-[0_0_0_4px_#151224,0_4px_6px_-1px_rgba(168,85,247,0.3)] items-center justify-center text-white">
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Carousel Controls: Arrows + Dots (< lg) */}
          <div className="flex lg:hidden items-center justify-between w-full max-w-[280px] mx-auto mt-4 px-2">
            {/* Prev Button */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              aria-label="Previous step"
              className="w-9 h-9 rounded-full bg-white dark:bg-[#181528] border border-[#E9D5FF] dark:border-purple-800/40 text-[#551BF5] dark:text-purple-300 flex items-center justify-center shadow-xs transition-all active:scale-95 disabled:opacity-25 disabled:pointer-events-none cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/40"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2">
              {stepsData.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`Step ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    activeIndex === idx
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
              disabled={activeIndex === stepsData.length - 1}
              aria-label="Next step"
              className="w-9 h-9 rounded-full bg-white dark:bg-[#181528] border border-[#E9D5FF] dark:border-purple-800/40 text-[#551BF5] dark:text-purple-300 flex items-center justify-center shadow-xs transition-all active:scale-95 disabled:opacity-25 disabled:pointer-events-none cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/40"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
