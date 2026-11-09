import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Trophy,
  Zap,
  Timer,
  BarChart3,
  LayoutGrid
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import featuresLaptopCenter from '../../assets/features-laptop-center.png';

const leftFeatures = [
  {
    icon: <Users className="h-6 w-6 text-[#551BF5]" />,
    iconBg: 'bg-[#EDE9FE]',
    title: 'Real-time Multiplayer',
    desc: 'Battle live with unlimited players in synchronized real-time sessions.',
  },
  {
    icon: <Trophy className="h-6 w-6 text-[#F59E0B]" />,
    iconBg: 'bg-[#FFF7EA]',
    title: 'Instant Leaderboards',
    desc: 'Track global & session player rankings in real-time as points accumulate.',
  },
  {
    icon: <Zap className="h-6 w-6 text-[#551BF5]" />,
    iconBg: 'bg-[#F3E8FF]',
    title: 'Live Results',
    desc: 'Get instant feedback on answer accuracy the second each question ends.',
  },
];

const rightFeatures = [
  {
    icon: <Timer className="h-6 w-6 text-[#0284C7]" />,
    iconBg: 'bg-[#E0F2FE]',
    title: 'Question Timer',
    desc: 'Customizable countdown timers per question to keep players focused and fast.',
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-[#059669]" />,
    iconBg: 'bg-[#E8FBF4]',
    title: 'Quiz Analytics',
    desc: 'Deep-dive metrics on accuracy, completion rates, and player performance.',
  },
  {
    icon: <LayoutGrid className="h-6 w-6 text-[#7C3AED]" />,
    iconBg: 'bg-[#EDE9FE]',
    title: 'Host Dashboard',
    desc: 'Full control center to manage quizzes, view battle history, and launch games.',
  },
];

export default function FeaturesSection() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  return (
    <section
      id="features"
      className="w-full relative overflow-hidden transition-colors lg:h-[calc(100vh-81px)] lg:max-h-[calc(100vh-81px)] lg:flex lg:flex-col lg:justify-between py-6 lg:py-5 xl:py-7 scroll-mt-20"
      style={{
        background: isLight
          ? 'linear-gradient(180deg, #FFFFFF 0%, #FAF8FF 40%, #F5F0FF 100%)'
          : 'linear-gradient(180deg, #0D0B1C 0%, #120F26 50%, #090814 100%)',
      }}
    >
      {/* Full-bleed organic corner waves from Figma design */}
      <div className="absolute -left-16 -top-16 w-[520px] h-[480px] rounded-full bg-[#EDE9FE]/70 dark:bg-purple-900/15 blur-3xl pointer-events-none" />
      <div className="absolute right-0 top-0 w-[420px] h-[380px] rounded-full bg-[#F3E8FF]/50 dark:bg-purple-900/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-16 -bottom-16 w-[520px] h-[480px] rounded-full bg-[#EDE9FE]/70 dark:bg-purple-900/15 blur-3xl pointer-events-none" />

      {/* ========================================================
          DESKTOP STAGE (>= 1024px)
          Features 3-column architecture with curved connector lines and dots
          ======================================================== */}
      <div className="hidden lg:flex flex-col justify-between w-full max-w-[1240px] mx-auto px-4 xl:px-6 flex-1 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center w-full max-w-[896px] mx-auto">
          {/* Top Pill Badge */}
          <div className="mb-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EDE9FE] dark:bg-purple-950/60 border border-[#E9D5FF]/70 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <Zap className="w-3.5 h-3.5 fill-[#551BF5] text-[#551BF5]" />
            <span className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#551BF5] dark:text-purple-300">
              CORE FEATURES
            </span>
          </div>

          {/* Heading 2 */}
          <h2 className="mb-2 text-2xl xl:text-[36px] xl:leading-[40px] tracking-[-0.9px] font-semibold text-[#0F0F2D] dark:text-white">
            <span>Everything You Need to </span>
            <span className="font-bold text-[#551BF5]">Engage &amp; Conquer</span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm xl:text-[16px] leading-snug xl:leading-6 text-[#475569] dark:text-gray-300 max-w-[660px] text-center mb-2.5">
            Gubbi comes packed with powerful features for teachers, quizmasters, and trivia hosts.
          </p>

          {/* Centered purple accent bar */}
          <div className="w-12 h-1 bg-[#551BF5] rounded-full" />
        </div>

        {/* Main 3-Column Architecture Container with Connectors and Cards */}
        <div className="relative w-full max-w-[1152px] mx-auto h-[400px] xl:h-[420px] flex items-center justify-between my-auto">
          
          {/* SVG Curved Connector Lines matching Figma coordinates */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-15"
            viewBox="0 0 1152 410"
            fill="none"
          >
            {/* Left Card 1 -> Laptop Screen */}
            <path
              d="M 340 58 C 395 58, 415 140, 455 140"
              stroke="#DDD6FE"
              strokeWidth="1.5"
            />
            {/* Left Card 2 -> Laptop Bezel */}
            <path
              d="M 340 205 L 430 205"
              stroke="#DDD6FE"
              strokeWidth="1.5"
            />
            {/* Left Card 3 -> Laptop Base */}
            <path
              d="M 340 352 C 395 352, 405 290, 435 290"
              stroke="#DDD6FE"
              strokeWidth="1.5"
            />

            {/* Right Card 1 -> Laptop Screen */}
            <path
              d="M 812 58 C 757 58, 737 140, 697 140"
              stroke="#DDD6FE"
              strokeWidth="1.5"
            />
            {/* Right Card 2 -> Laptop Bezel */}
            <path
              d="M 812 205 L 722 205"
              stroke="#DDD6FE"
              strokeWidth="1.5"
            />
            {/* Right Card 3 -> Laptop Base */}
            <path
              d="M 812 352 C 757 352, 747 290, 717 290"
              stroke="#DDD6FE"
              strokeWidth="1.5"
            />
          </svg>

          {/* Left 3 Feature Cards */}
          <div className="w-[340px] h-full flex flex-col justify-between z-20">
            {leftFeatures.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className={`relative rounded-[24px] p-4 xl:p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isLight
                    ? 'bg-white border-[#F3E8FF]/90 shadow-[0px_4px_6px_-1px_rgba(168,85,247,0.05),0px_2px_4px_-2px_rgba(168,85,247,0.05)]'
                    : 'bg-[#151224] border-purple-500/20 shadow-xl'
                }`}
              >
                {/* Purple Connector Dot on Right Edge */}
                <span className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#551BF5] ring-2 ring-white dark:ring-[#151224] z-30 shadow-sm" />

                <div className="flex items-center gap-3.5 xl:gap-4">
                  <div className={`w-12 h-12 xl:w-14 xl:h-14 rounded-2xl ${feat.iconBg} flex items-center justify-center shrink-0 shadow-inner`}>
                    {feat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm xl:text-[16px] font-bold text-[#0F172A] dark:text-white leading-tight">
                      {feat.title}
                    </h3>
                    <p className="text-xs xl:text-[12px] text-[#64748B] dark:text-gray-300 leading-snug mt-1">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Center Column: 3D Laptop with soft circular backdrop */}
          <div className="flex-1 flex items-center justify-center relative z-10 px-4">
            {/* Soft purple circular background glow */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] rounded-full bg-[#EDE9FE]/50 dark:bg-purple-900/15 blur-2xl pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="relative w-full max-w-[440px] flex items-center justify-center"
            >
              <img
                src={featuresLaptopCenter}
                alt="Gubbi Live Quiz Experience"
                className="w-full h-auto object-contain select-none drop-shadow-[0_20px_35px_rgba(85,27,245,0.12)]"
              />
            </motion.div>
          </div>

          {/* Right 3 Feature Cards */}
          <div className="w-[340px] h-full flex flex-col justify-between z-20">
            {rightFeatures.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className={`relative rounded-[24px] p-4 xl:p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isLight
                    ? 'bg-white border-[#F3E8FF]/90 shadow-[0px_4px_6px_-1px_rgba(168,85,247,0.05),0px_2px_4px_-2px_rgba(168,85,247,0.05)]'
                    : 'bg-[#151224] border-purple-500/20 shadow-xl'
                }`}
              >
                {/* Purple Connector Dot on Left Edge */}
                <span className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#551BF5] ring-2 ring-white dark:ring-[#151224] z-30 shadow-sm" />

                <div className="flex items-center gap-3.5 xl:gap-4">
                  <div className={`w-12 h-12 xl:w-14 xl:h-14 rounded-2xl ${feat.iconBg} flex items-center justify-center shrink-0 shadow-inner`}>
                    {feat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm xl:text-[16px] font-bold text-[#0F172A] dark:text-white leading-tight">
                      {feat.title}
                    </h3>
                    <p className="text-xs xl:text-[12px] text-[#64748B] dark:text-gray-300 leading-snug mt-1">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>

      {/* ========================================================
          RESPONSIVE MOBILE VIEW (< 1024px)
          Full-width flow with center preview + cards grid
          ======================================================== */}
      <div className="lg:hidden w-full px-4 sm:px-6 py-10 flex flex-col items-center gap-8 z-10 relative">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-[600px] mx-auto">
          <div className="mb-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EDE9FE] dark:bg-purple-950/60 border border-[#E9D5FF]/80 shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-[#551BF5] text-[#551BF5]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#551BF5] dark:text-purple-300">
              CORE FEATURES
            </span>
          </div>

          <h2 className="mb-2 text-2xl sm:text-3xl font-bold text-[#0F0F2D] dark:text-white">
            <span>Everything You Need to </span>
            <span className="text-[#551BF5]">Engage &amp; Conquer</span>
          </h2>

          <p className="text-sm leading-6 text-[#475569] dark:text-gray-300 mb-3">
            Gubbi comes packed with powerful features for teachers, quizmasters, and trivia hosts.
          </p>

          <div className="w-12 h-1 bg-[#551BF5] rounded-full" />
        </div>

        {/* Centerpiece 3D illustration */}
        <div className="w-full max-w-[440px] rounded-2xl overflow-hidden shadow-lg border border-purple-100/60">
          <img
            src={featuresLaptopCenter}
            alt="Gubbi Dashboard Preview"
            className="w-full h-auto object-cover select-none"
          />
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...leftFeatures, ...rightFeatures].map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className={`rounded-[20px] p-4 border transition-all ${
                isLight
                  ? 'bg-white border-[#F1E8FF] shadow-[0px_4px_16px_rgba(0,0,0,0.03)]'
                  : 'bg-[#151224] border-purple-500/20 shadow-lg'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-xl ${feat.iconBg} flex items-center justify-center shrink-0`}>
                  {feat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-bold text-[#0F172A] dark:text-white leading-tight">
                    {feat.title}
                  </h3>
                  <p className="text-[12px] text-[#64748B] dark:text-gray-300 leading-relaxed mt-1">
                    {feat.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  );
}
