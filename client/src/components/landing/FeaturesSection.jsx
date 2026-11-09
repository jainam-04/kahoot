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
    icon: <Users className="h-5 w-5 text-[#551BF5]" />,
    iconBg: 'bg-[#EDE9FE]',
    title: 'Real-time Multiplayer',
    desc: 'Battle live with unlimited players in synchronized real-time sessions.',
  },
  {
    icon: <Trophy className="h-5 w-5 text-[#D97706]" />,
    iconBg: 'bg-[#FEF3C7]',
    title: 'Instant Leaderboards',
    desc: 'Track global & session player rankings in real-time as points accumulate.',
  },
  {
    icon: <Zap className="h-5 w-5 text-[#551BF5]" />,
    iconBg: 'bg-[#EDE9FE]',
    title: 'Live Results',
    desc: 'Get instant feedback on answer accuracy the second each question ends.',
  },
];

const rightFeatures = [
  {
    icon: <Timer className="h-5 w-5 text-[#0284C7]" />,
    iconBg: 'bg-[#E0F2FE]',
    title: 'Question Timer',
    desc: 'Customizable countdown timers per question to keep players focused and fast.',
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-[#16A34A]" />,
    iconBg: 'bg-[#DCFCE7]',
    title: 'Quiz Analytics',
    desc: 'Deep-dive metrics on accuracy, completion rates, and player performance.',
  },
  {
    icon: <LayoutGrid className="h-5 w-5 text-[#551BF5]" />,
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
      className="w-full relative overflow-hidden transition-colors lg:h-[calc(100vh-81px)] lg:max-h-[calc(100vh-81px)] lg:flex lg:flex-col lg:justify-between py-6 lg:py-4 xl:py-6 scroll-mt-20"
      style={{
        background: isLight
          ? 'radial-gradient(120% 90% at 50% 40%, #F5F0FF 0%, #FAF8FF 45%, #FFFFFF 100%)'
          : 'radial-gradient(120% 90% at 50% 40%, #16122E 0%, #0D0B1C 55%, #080711 100%)',
      }}
    >
      {/* Ambient background glows for open, borderless atmosphere */}
      <div className="absolute -left-32 top-1/4 w-[460px] h-[460px] rounded-full bg-purple-200/40 dark:bg-purple-900/15 blur-[120px] pointer-events-none" />
      <div className="absolute -right-32 bottom-1/4 w-[460px] h-[460px] rounded-full bg-indigo-200/40 dark:bg-indigo-900/15 blur-[120px] pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[420px] rounded-full bg-purple-300/25 dark:bg-purple-600/10 blur-[100px] pointer-events-none" />

      {/* ========================================================
          OPEN FULL-WIDTH DESKTOP STAGE (>= 1024px)
          Seamless 3-column composition without boxed edges
          ======================================================== */}
      <div className="hidden lg:flex flex-col justify-between w-full max-w-[1400px] mx-auto px-6 xl:px-12 flex-1 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center w-full max-w-[800px] mx-auto pt-2">
          {/* Pill Badge */}
          <div className="mb-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EDE9FE] dark:bg-purple-950/60 border border-[#E9D5FF]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <Zap className="w-3.5 h-3.5 fill-[#551BF5] text-[#551BF5]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#551BF5] dark:text-purple-300">
              CORE FEATURES
            </span>
          </div>

          {/* Heading 2 */}
          <h2 className="mb-1.5 text-2xl xl:text-[34px] xl:leading-[40px] tracking-[-0.9px] font-bold text-[#0F0F2D] dark:text-white">
            <span>Everything You Need to </span>
            <span className="text-[#551BF5]">Engage &amp; Conquer</span>
          </h2>

          {/* Subtitle */}
          <p className="text-[13px] xl:text-[14.5px] leading-snug text-[#475569] dark:text-gray-300 max-w-[620px] text-center mb-2">
            Gubbi comes packed with powerful features for teachers, quizmasters, and trivia hosts.
          </p>

          {/* Purple Accent Bar */}
          <div className="w-12 h-1 bg-[#551BF5] rounded-full" />
        </div>

        {/* 3-Column Open Stage: Left Cards | Center 3D Laptop | Right Cards */}
        <div className="grid grid-cols-12 items-center gap-4 xl:gap-8 flex-1 py-2">
          
          {/* Left Column (3 Cards) */}
          <div className="col-span-4 flex flex-col justify-center gap-3.5 xl:gap-4 z-20">
            {leftFeatures.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className={`rounded-[20px] p-3.5 xl:p-4 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isLight
                    ? 'bg-white/95 border-[#F1E8FF] shadow-[0px_4px_22px_rgba(85,27,245,0.06)]'
                    : 'bg-[#151224]/95 border-purple-500/20 shadow-xl'
                }`}
              >
                <div className="flex items-center gap-3 xl:gap-3.5">
                  <div className={`w-9 h-9 xl:w-10 xl:h-10 rounded-xl ${feat.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                    {feat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] xl:text-[14.5px] font-bold text-[#0F172A] dark:text-white leading-tight">
                      {feat.title}
                    </h3>
                    <p className="text-[11px] xl:text-[12px] text-[#64748B] dark:text-gray-300 leading-snug mt-0.5">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Center Column: 3D Laptop with soft circular aura */}
          <div className="col-span-4 flex items-center justify-center relative z-10 px-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="relative w-full flex items-center justify-center"
            >
              <img
                src={featuresLaptopCenter}
                alt="Gubbi Live Quiz Experience"
                className="w-full max-w-[440px] xl:max-w-[490px] h-auto object-contain select-none drop-shadow-[0_16px_36px_rgba(85,27,245,0.14)]"
              />
            </motion.div>
          </div>

          {/* Right Column (3 Cards) */}
          <div className="col-span-4 flex flex-col justify-center gap-3.5 xl:gap-4 z-20">
            {rightFeatures.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className={`rounded-[20px] p-3.5 xl:p-4 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isLight
                    ? 'bg-white/95 border-[#F1E8FF] shadow-[0px_4px_22px_rgba(85,27,245,0.06)]'
                    : 'bg-[#151224]/95 border-purple-500/20 shadow-xl'
                }`}
              >
                <div className="flex items-center gap-3 xl:gap-3.5">
                  <div className={`w-9 h-9 xl:w-10 xl:h-10 rounded-xl ${feat.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                    {feat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] xl:text-[14.5px] font-bold text-[#0F172A] dark:text-white leading-tight">
                      {feat.title}
                    </h3>
                    <p className="text-[11px] xl:text-[12px] text-[#64748B] dark:text-gray-300 leading-snug mt-0.5">
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
