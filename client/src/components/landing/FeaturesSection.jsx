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
import featuresSectionBg from '../../assets/features-section-bg.jpg';

const leftFeatures = [
  {
    icon: <Users className="h-5 w-5 xl:h-6 xl:w-6 text-[#551BF5]" />,
    iconBg: 'bg-[#EDE9FE]',
    title: 'Real-time Multiplayer',
    desc: 'Battle live with unlimited players in synchronized real-time sessions.',
    topPct: '38.8%',
  },
  {
    icon: <Trophy className="h-5 w-5 xl:h-6 xl:w-6 text-[#F59E0B]" />,
    iconBg: 'bg-[#FFF7EA]',
    title: 'Instant Leaderboards',
    desc: 'Track global & session player rankings in real-time as points accumulate.',
    topPct: '57.8%',
  },
  {
    icon: <Zap className="h-5 w-5 xl:h-6 xl:w-6 text-[#551BF5]" />,
    iconBg: 'bg-[#F3E8FF]',
    title: 'Live Results',
    desc: 'Get instant feedback on answer accuracy the second each question ends.',
    topPct: '76.8%',
  },
];

const rightFeatures = [
  {
    icon: <Timer className="h-5 w-5 xl:h-6 xl:w-6 text-[#0284C7]" />,
    iconBg: 'bg-[#E0F2FE]',
    title: 'Question Timer',
    desc: 'Customizable countdown timers per question to keep players focused and fast.',
    topPct: '38.8%',
  },
  {
    icon: <BarChart3 className="h-5 w-5 xl:h-6 xl:w-6 text-[#059669]" />,
    iconBg: 'bg-[#E8FBF4]',
    title: 'Quiz Analytics',
    desc: 'Deep-dive metrics on accuracy, completion rates, and player performance.',
    topPct: '57.8%',
  },
  {
    icon: <LayoutGrid className="h-5 w-5 xl:h-6 xl:w-6 text-[#7C3AED]" />,
    iconBg: 'bg-[#EDE9FE]',
    title: 'Host Dashboard',
    desc: 'Full control center to manage quizzes, view battle history, and launch games.',
    topPct: '76.8%',
  },
];

export default function FeaturesSection() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  return (
    <section
      id="features"
      className="w-full relative overflow-hidden transition-colors scroll-mt-20 py-8 lg:py-4 xl:py-6"
      style={{
        background: isLight
          ? '#FAF8FF'
          : 'linear-gradient(180deg, #0B0914 0%, #120F26 50%, #0B0914 100%)',
      }}
    >
      {/* ========================================================
          DESKTOP STAGE (>= 1024px)
          Seamless full-bleed 1024x576 aspect architecture
          Matching Figma design and reference image with 100% precision
          ======================================================== */}
      <div className="hidden lg:block w-full max-w-[1100px] xl:max-w-[1180px] 2xl:max-w-[1240px] mx-auto px-4 relative">
        <div className="relative w-full aspect-[1024/576] max-h-[calc(100vh-100px)] mx-auto overflow-visible">
          
          {/* Background Illustration with 3D Laptop, Pedestal, Arch & Waves */}
          <img
            src={featuresSectionBg}
            alt="Gubbi Features Interface"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
          />

          {/* Section Header centered in top area */}
          <div className="absolute top-[2.5%] left-1/2 -translate-x-1/2 flex flex-col items-center text-center w-full max-w-[760px] px-4 z-30 pointer-events-auto">
            {/* Top Pill Badge */}
            <div className="mb-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] dark:bg-purple-950/60 border border-[#E9D5FF]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              <Zap className="w-3.5 h-3.5 fill-[#551BF5] text-[#551BF5]" />
              <span className="text-[11px] xl:text-[12px] font-bold uppercase tracking-[0.6px] text-[#551BF5] dark:text-purple-300">
                CORE FEATURES
              </span>
            </div>

            {/* Heading 2 */}
            <h2 className="mb-1 text-2xl xl:text-[32px] 2xl:text-[36px] xl:leading-[38px] tracking-[-0.9px] font-semibold text-[#0F0F2D] dark:text-white">
              <span>Everything You Need to </span>
              <span className="font-bold text-[#551BF5]">Engage &amp; Conquer</span>
            </h2>

            {/* Subtitle */}
            <p className="text-xs xl:text-sm text-[#475569] dark:text-gray-300 max-w-[620px] text-center mb-1.5">
              Gubbi comes packed with powerful features for teachers, quizmasters, and trivia hosts.
            </p>

            {/* Centered purple accent bar */}
            <div className="w-12 h-1 bg-[#551BF5] rounded-full" />
          </div>

          {/* SVG Curved Connector Lines & Unified Anchored Dots */}
          <svg
            viewBox="0 0 1024 576"
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
          >
            {/* Left Card 1 -> Laptop Screen Top Left */}
            <path
              d="M 280 268 C 320 268, 340 275, 365 275"
              fill="none"
              stroke="#DDD6FE"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="280" cy="268" r="6" fill="#551BF5" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="365" cy="275" r="3.5" fill="#A78BFA" opacity="0.9" />

            {/* Left Card 2 -> Laptop Middle Left Bezel */}
            <path
              d="M 283 376 C 315 376, 340 365, 366 360"
              fill="none"
              stroke="#DDD6FE"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="283" cy="376" r="6" fill="#551BF5" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="366" cy="360" r="3.5" fill="#A78BFA" opacity="0.9" />

            {/* Left Card 3 -> Laptop Bottom Left Base */}
            <path
              d="M 284 484 C 325 484, 350 455, 378 448"
              fill="none"
              stroke="#DDD6FE"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="284" cy="484" r="6" fill="#551BF5" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="378" cy="448" r="3.5" fill="#A78BFA" opacity="0.9" />

            {/* Right Card 1 -> Laptop Screen Top Right */}
            <path
              d="M 733 261 C 693 261, 670 275, 645 275"
              fill="none"
              stroke="#DDD6FE"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="733" cy="261" r="6" fill="#551BF5" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="645" cy="275" r="3.5" fill="#A78BFA" opacity="0.9" />

            {/* Right Card 2 -> Laptop Middle Right Bezel */}
            <path
              d="M 733 367 C 700 367, 675 365, 651 360"
              fill="none"
              stroke="#DDD6FE"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="733" cy="367" r="6" fill="#551BF5" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="651" cy="360" r="3.5" fill="#A78BFA" opacity="0.9" />

            {/* Right Card 3 -> Laptop Bottom Right Base */}
            <path
              d="M 733 468 C 695 468, 670 455, 650 448"
              fill="none"
              stroke="#DDD6FE"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="733" cy="468" r="6" fill="#551BF5" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="650" cy="448" r="3.5" fill="#A78BFA" opacity="0.9" />
          </svg>

          {/* Left 3 Feature Cards */}
          {leftFeatures.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              style={{ top: feat.topPct, left: '2.34%', width: '25%' }}
              className={`absolute rounded-[16px] xl:rounded-[20px] p-2.5 xl:p-3.5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl z-30 ${
                isLight
                  ? 'bg-white/95 backdrop-blur-xs border-[#F3E8FF]/90 shadow-[0px_4px_12px_rgba(168,85,247,0.06)]'
                  : 'bg-[#151224]/95 border-purple-500/20 shadow-xl'
              }`}
            >
              <div className="flex items-center gap-2.5 xl:gap-3">
                <div className={`w-9 h-9 xl:w-11 xl:h-11 rounded-xl xl:rounded-2xl ${feat.iconBg} flex items-center justify-center shrink-0 shadow-inner`}>
                  {feat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs xl:text-sm font-bold text-[#0F172A] dark:text-white leading-tight truncate">
                    {feat.title}
                  </h3>
                  <p className="text-[10px] xl:text-[11px] text-[#64748B] dark:text-gray-300 leading-snug mt-0.5 line-clamp-2">
                    {feat.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Right 3 Feature Cards */}
          {rightFeatures.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              style={{ top: feat.topPct, left: '71.58%', width: '25%' }}
              className={`absolute rounded-[16px] xl:rounded-[20px] p-2.5 xl:p-3.5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl z-30 ${
                isLight
                  ? 'bg-white/95 backdrop-blur-xs border-[#F3E8FF]/90 shadow-[0px_4px_12px_rgba(168,85,247,0.06)]'
                  : 'bg-[#151224]/95 border-purple-500/20 shadow-xl'
              }`}
            >
              <div className="flex items-center gap-2.5 xl:gap-3">
                <div className={`w-9 h-9 xl:w-11 xl:h-11 rounded-xl xl:rounded-2xl ${feat.iconBg} flex items-center justify-center shrink-0 shadow-inner`}>
                  {feat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs xl:text-sm font-bold text-[#0F172A] dark:text-white leading-tight truncate">
                    {feat.title}
                  </h3>
                  <p className="text-[10px] xl:text-[11px] text-[#64748B] dark:text-gray-300 leading-snug mt-0.5 line-clamp-2">
                    {feat.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

        </div>
      </div>

      {/* ========================================================
          RESPONSIVE MOBILE VIEW (< 1024px)
          Full-width vertical stack with preview and card grid
          ======================================================== */}
      <div className="lg:hidden w-full px-4 sm:px-6 py-6 flex flex-col items-center gap-6 z-10 relative">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-[600px] mx-auto">
          <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] dark:bg-purple-950/60 border border-[#E9D5FF]/80 shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-[#551BF5] text-[#551BF5]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#551BF5] dark:text-purple-300">
              CORE FEATURES
            </span>
          </div>

          <h2 className="mb-2 text-2xl sm:text-3xl font-bold text-[#0F0F2D] dark:text-white">
            <span>Everything You Need to </span>
            <span className="text-[#551BF5]">Engage &amp; Conquer</span>
          </h2>

          <p className="text-sm leading-6 text-[#475569] dark:text-gray-300 mb-2">
            Gubbi comes packed with powerful features for teachers, quizmasters, and trivia hosts.
          </p>

          <div className="w-12 h-1 bg-[#551BF5] rounded-full" />
        </div>

        {/* Centerpiece 3D illustration */}
        <div className="w-full max-w-[480px] rounded-2xl overflow-hidden shadow-lg border border-purple-100/60">
          <img
            src={featuresSectionBg}
            alt="Gubbi Dashboard Preview"
            className="w-full h-auto object-cover select-none"
          />
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[...leftFeatures, ...rightFeatures].map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className={`rounded-[18px] p-3.5 border transition-all ${
                isLight
                  ? 'bg-white border-[#F1E8FF] shadow-[0px_4px_16px_rgba(0,0,0,0.03)]'
                  : 'bg-[#151224] border-purple-500/20 shadow-lg'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${feat.iconBg} flex items-center justify-center shrink-0`}>
                  {feat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight">
                    {feat.title}
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-gray-300 leading-relaxed mt-0.5">
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
