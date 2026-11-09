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
import featuresStageBg from '../../assets/features-laptop.jpg';

const leftFeatures = [
  {
    icon: <Users className="h-5 w-5 text-[#551BF5]" />,
    iconBg: 'bg-[#EDE9FE]',
    title: 'Real-time Multiplayer',
    desc: 'Battle live with unlimited players in synchronized real-time sessions.',
    top: '36.5%',
  },
  {
    icon: <Trophy className="h-5 w-5 text-[#D97706]" />,
    iconBg: 'bg-[#FEF3C7]',
    title: 'Instant Leaderboards',
    desc: 'Track global & session player rankings in real-time as points accumulate.',
    top: '56.4%',
  },
  {
    icon: <Zap className="h-5 w-5 text-[#551BF5]" />,
    iconBg: 'bg-[#EDE9FE]',
    title: 'Live Results',
    desc: 'Get instant feedback on answer accuracy the second each question ends.',
    top: '76.4%',
  },
];

const rightFeatures = [
  {
    icon: <Timer className="h-5 w-5 text-[#0284C7]" />,
    iconBg: 'bg-[#E0F2FE]',
    title: 'Question Timer',
    desc: 'Customizable countdown timers per question to keep players focused and fast.',
    top: '36.5%',
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-[#16A34A]" />,
    iconBg: 'bg-[#DCFCE7]',
    title: 'Quiz Analytics',
    desc: 'Deep-dive metrics on accuracy, completion rates, and player performance.',
    top: '56.4%',
  },
  {
    icon: <LayoutGrid className="h-5 w-5 text-[#551BF5]" />,
    iconBg: 'bg-[#EDE9FE]',
    title: 'Host Dashboard',
    desc: 'Full control center to manage quizzes, view battle history, and launch games.',
    top: '76.4%',
  },
];

export default function FeaturesSection() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  return (
    <section
      id="features"
      className="w-full relative overflow-hidden transition-colors lg:h-[calc(100vh-81px)] lg:max-h-[calc(100vh-81px)] lg:flex lg:flex-col lg:items-center lg:justify-center scroll-mt-20"
      style={{
        background: isLight ? '#F8F6FF' : '#0B0914',
      }}
    >
      {/* ========================================================
          FULL-SCREEN DESKTOP STAGE (>= 1024px)
          Crisp, full-color original graphic with zero blur or masks
          Constrained to 100vh - 81px so it fits 100% in one view
          ======================================================== */}
      <div
        className="hidden lg:block relative mx-auto select-none aspect-[1024/576]"
        style={{
          width: 'min(100%, calc((100vh - 81px) * 1024 / 576))',
          maxHeight: 'calc(100vh - 81px)',
          maxWidth: '1440px',
        }}
      >
        
        {/* Full-width crisp stage illustration (unblurred, unmasked) */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            backgroundImage: `url(${featuresStageBg})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />

        {/* Subtle dark mode tint overlay */}
        {!isLight && (
          <div className="absolute inset-0 bg-[#0C0A18]/80 pointer-events-none z-5" />
        )}

        {/* Section Header matching reference image */}
        <div className="absolute top-[4%] xl:top-[5%] left-1/2 -translate-x-1/2 flex flex-col items-center text-center w-full max-w-[800px] z-20 px-4">
          {/* Pill Badge */}
          <div className="mb-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 xl:px-3.5 xl:py-1 rounded-full bg-[#EDE9FE] dark:bg-purple-950/60 border border-[#E9D5FF]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <Zap className="w-3 h-3 fill-[#551BF5] text-[#551BF5]" />
            <span className="text-[10px] xl:text-[11px] font-bold uppercase tracking-[0.6px] text-[#551BF5] dark:text-purple-300">
              CORE FEATURES
            </span>
          </div>

          {/* Heading 2 */}
          <h2 className="mb-1 text-xl lg:text-2xl xl:text-[32px] xl:leading-[38px] tracking-[-0.8px] font-bold text-[#0F0F2D] dark:text-white">
            <span>Everything You Need to </span>
            <span className="text-[#551BF5]">Engage &amp; Conquer</span>
          </h2>

          {/* Subtitle */}
          <p className="text-[11.5px] xl:text-[13.5px] leading-snug xl:leading-5 text-[#475569] dark:text-gray-300 max-w-[580px] text-center mb-1.5">
            Gubbi comes packed with powerful features for teachers, quizmasters, and trivia hosts.
          </p>

          {/* Purple Accent Bar */}
          <div className="w-10 xl:w-12 h-1 bg-[#551BF5] rounded-full" />
        </div>

        {/* SVG Curved Connectors matching reference image */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-15"
          viewBox="0 0 1024 576"
          fill="none"
        >
          {/* Left Card 1 -> Laptop Screen */}
          <path
            d="M 282.5 252 C 320 252, 335 285, 360 285"
            stroke="#DDD6FE"
            strokeWidth="1.5"
          />
          <circle cx="282.5" cy="252" r="3.5" fill="#551BF5" />

          {/* Left Card 2 -> Laptop Bezel */}
          <path
            d="M 285.8 367 C 320 367, 345 367, 370 367"
            stroke="#DDD6FE"
            strokeWidth="1.5"
          />
          <circle cx="285.8" cy="367" r="3.5" fill="#551BF5" />

          {/* Left Card 3 -> Laptop Base */}
          <path
            d="M 286.3 477 C 325 477, 340 435, 368 435"
            stroke="#DDD6FE"
            strokeWidth="1.5"
          />
          <circle cx="286.3" cy="477" r="3.5" fill="#551BF5" />

          {/* Right Card 1 -> Laptop Screen */}
          <path
            d="M 737.5 250 C 700 250, 685 285, 660 285"
            stroke="#DDD6FE"
            strokeWidth="1.5"
          />
          <circle cx="737.5" cy="250" r="3.5" fill="#551BF5" />

          {/* Right Card 2 -> Laptop Bezel */}
          <path
            d="M 738.2 357 C 700 357, 680 357, 655 357"
            stroke="#DDD6FE"
            strokeWidth="1.5"
          />
          <circle cx="738.2" cy="357" r="3.5" fill="#551BF5" />

          {/* Right Card 3 -> Laptop Base */}
          <path
            d="M 738.0 459 C 700 459, 685 435, 658 435"
            stroke="#DDD6FE"
            strokeWidth="1.5"
          />
          <circle cx="738.0" cy="459" r="3.5" fill="#551BF5" />
        </svg>

        {/* Left Column (3 Cards) */}
        {leftFeatures.map((feat, idx) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            style={{ top: feat.top }}
            className={`absolute left-[2.6%] w-[25%] rounded-[16px] xl:rounded-[20px] p-2.5 xl:p-3.5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl z-20 ${
              isLight
                ? 'bg-white border-[#F1E8FF] shadow-[0px_4px_22px_rgba(85,27,245,0.06)]'
                : 'bg-[#151224] border-purple-500/20 shadow-xl'
            }`}
          >
            <div className="flex items-center gap-2.5 xl:gap-3">
              <div className={`w-8 h-8 xl:w-10 xl:h-10 rounded-xl ${feat.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                {feat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[12px] xl:text-[14px] font-bold text-[#0F172A] dark:text-white leading-tight">
                  {feat.title}
                </h3>
                <p className="text-[10px] xl:text-[11.5px] text-[#64748B] dark:text-gray-300 leading-snug mt-0.5">
                  {feat.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Right Column (3 Cards) */}
        {rightFeatures.map((feat, idx) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            style={{ top: feat.top }}
            className={`absolute right-[2.6%] w-[25%] rounded-[16px] xl:rounded-[20px] p-2.5 xl:p-3.5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl z-20 ${
              isLight
                ? 'bg-white border-[#F1E8FF] shadow-[0px_4px_22px_rgba(85,27,245,0.06)]'
                : 'bg-[#151224] border-purple-500/20 shadow-xl'
            }`}
          >
            <div className="flex items-center gap-2.5 xl:gap-3">
              <div className={`w-8 h-8 xl:w-10 xl:h-10 rounded-xl ${feat.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                {feat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[12px] xl:text-[14px] font-bold text-[#0F172A] dark:text-white leading-tight">
                  {feat.title}
                </h3>
                <p className="text-[10px] xl:text-[11.5px] text-[#64748B] dark:text-gray-300 leading-snug mt-0.5">
                  {feat.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

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
            src={featuresStageBg}
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
