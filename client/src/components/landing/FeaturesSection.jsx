import React, { useState, useRef, useEffect, useCallback } from 'react';
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

// Fallback initial connectors so there is never a blank flash before layout measurements
const defaultConnectors = [
  { id: 'left-0', x1: 340, y1: 58, x2: 450, y2: 140, pathD: 'M 340 58 C 400 58, 430 140, 450 140' },
  { id: 'left-1', x1: 340, y1: 205, x2: 445, y2: 205, pathD: 'M 340 205 L 445 205' },
  { id: 'left-2', x1: 340, y1: 352, x2: 460, y2: 285, pathD: 'M 340 352 C 400 352, 435 285, 460 285' },
  { id: 'right-0', x1: 812, y1: 58, x2: 702, y2: 140, pathD: 'M 812 58 C 752 58, 722 140, 702 140' },
  { id: 'right-1', x1: 812, y1: 205, x2: 707, y2: 205, pathD: 'M 812 205 L 707 205' },
  { id: 'right-2', x1: 812, y1: 352, x2: 692, y2: 285, pathD: 'M 812 352 C 752 352, 717 285, 692 285' },
];

export default function FeaturesSection() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const stageRef = useRef(null);
  const laptopRef = useRef(null);
  const leftCardRefs = useRef([]);
  const rightCardRefs = useRef([]);

  const [connectors, setConnectors] = useState(defaultConnectors);

  const updateConnectors = useCallback(() => {
    if (!stageRef.current || !laptopRef.current) return;
    const stageRect = stageRef.current.getBoundingClientRect();
    const laptopRect = laptopRef.current.getBoundingClientRect();

    if (stageRect.width === 0 || stageRect.height === 0 || laptopRect.width === 0) return;

    const list = [];

    // Precise attachment points on the 3D laptop illustration:
    // Left side:
    // Top: screen top-left corner
    // Middle: screen left bezel
    // Bottom: laptop keyboard/base left
    const leftTargets = [
      {
        x: laptopRect.left + laptopRect.width * 0.17 - stageRect.left,
        y: laptopRect.top + laptopRect.height * 0.34 - stageRect.top,
      },
      {
        x: laptopRect.left + laptopRect.width * 0.155 - stageRect.left,
        y: laptopRect.top + laptopRect.height * 0.49 - stageRect.top,
      },
      {
        x: laptopRect.left + laptopRect.width * 0.20 - stageRect.left,
        y: laptopRect.top + laptopRect.height * 0.69 - stageRect.top,
      },
    ];

    // Right side:
    // Top: screen top-right corner
    // Middle: screen right bezel
    // Bottom: laptop keyboard/base right
    const rightTargets = [
      {
        x: laptopRect.left + laptopRect.width * 0.83 - stageRect.left,
        y: laptopRect.top + laptopRect.height * 0.34 - stageRect.top,
      },
      {
        x: laptopRect.left + laptopRect.width * 0.845 - stageRect.left,
        y: laptopRect.top + laptopRect.height * 0.49 - stageRect.top,
      },
      {
        x: laptopRect.left + laptopRect.width * 0.80 - stageRect.left,
        y: laptopRect.top + laptopRect.height * 0.69 - stageRect.top,
      },
    ];

    // Measure left cards and build cubic Bézier paths starting exactly at the right border
    leftCardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const cardRect = el.getBoundingClientRect();
      const x1 = cardRect.right - stageRect.left;
      const y1 = cardRect.top + cardRect.height / 2 - stageRect.top;
      const target = leftTargets[idx];
      if (!target) return;
      const x2 = target.x;
      const y2 = target.y;

      const dx = x2 - x1;
      const cp1x = x1 + dx * 0.55;
      const cp1y = y1;
      const cp2x = x1 + dx * 0.85;
      const cp2y = y2;
      const pathD = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

      list.push({
        id: `left-${idx}`,
        x1,
        y1,
        x2,
        y2,
        pathD,
      });
    });

    // Measure right cards and build cubic Bézier paths starting exactly at the left border
    rightCardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const cardRect = el.getBoundingClientRect();
      const x1 = cardRect.left - stageRect.left;
      const y1 = cardRect.top + cardRect.height / 2 - stageRect.top;
      const target = rightTargets[idx];
      if (!target) return;
      const x2 = target.x;
      const y2 = target.y;

      const dx = x1 - x2;
      const cp1x = x1 - dx * 0.55;
      const cp1y = y1;
      const cp2x = x1 - dx * 0.85;
      const cp2y = y2;
      const pathD = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

      list.push({
        id: `right-${idx}`,
        x1,
        y1,
        x2,
        y2,
        pathD,
      });
    });

    if (list.length === 6) {
      setConnectors(list);
    }
  }, []);

  useEffect(() => {
    updateConnectors();
    const t1 = setTimeout(updateConnectors, 50);
    const t2 = setTimeout(updateConnectors, 200);

    const handleResize = () => {
      window.requestAnimationFrame(updateConnectors);
    };

    window.addEventListener('resize', handleResize);

    let observer;
    if (typeof ResizeObserver !== 'undefined' && stageRef.current) {
      observer = new ResizeObserver(() => {
        window.requestAnimationFrame(updateConnectors);
      });
      observer.observe(stageRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, [updateConnectors]);

  return (
    <section
      id="features"
      className="w-full relative overflow-hidden transition-colors lg:h-[calc(100vh-81px)] lg:max-h-[calc(100vh-81px)] lg:flex lg:flex-col lg:justify-between py-6 lg:py-5 xl:py-7 scroll-mt-20"
      style={{
        background: isLight
          ? '#FAF8FF'
          : 'linear-gradient(180deg, #0B0914 0%, #120F26 50%, #0B0914 100%)',
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
        <div
          ref={stageRef}
          className="relative w-full max-w-[1152px] mx-auto h-[400px] xl:h-[420px] flex items-center justify-between my-auto"
        >
          
          {/* Dynamic SVG Connector Lines & Unified Anchored Dots */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
          >
            {connectors.map((c) => (
              <g key={c.id}>
                {/* Curved connector line touching card dot and laptop directly */}
                <path
                  d={c.pathD}
                  fill="none"
                  stroke={isLight ? '#DDD6FE' : 'rgba(167, 139, 250, 0.5)'}
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                {/* Endpoint pulse dot at laptop bezel/screen */}
                <circle
                  cx={c.x2}
                  cy={c.y2}
                  r={3}
                  fill={isLight ? '#A78BFA' : '#C084FC'}
                  opacity={0.85}
                />
                {/* Purple Connector Dot on card edge - sharing (x1, y1) with 0px gap */}
                <circle
                  cx={c.x1}
                  cy={c.y1}
                  r={6}
                  fill="#551BF5"
                  stroke={isLight ? '#FFFFFF' : '#151224'}
                  strokeWidth="2.5"
                />
              </g>
            ))}
          </svg>

          {/* Left 3 Feature Cards */}
          <div className="w-[320px] xl:w-[340px] h-full flex flex-col justify-between z-10">
            {leftFeatures.map((feat, idx) => (
              <motion.div
                key={feat.title}
                ref={(el) => (leftCardRefs.current[idx] = el)}
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
              className="relative w-full max-w-[420px] xl:max-w-[450px] flex items-center justify-center"
            >
              <img
                ref={laptopRef}
                src={featuresLaptopCenter}
                alt="Gubbi Live Quiz Experience"
                onLoad={updateConnectors}
                className="w-full h-auto object-contain select-none drop-shadow-[0_20px_35px_rgba(85,27,245,0.12)]"
              />
            </motion.div>
          </div>

          {/* Right 3 Feature Cards */}
          <div className="w-[320px] xl:w-[340px] h-full flex flex-col justify-between z-10">
            {rightFeatures.map((feat, idx) => (
              <motion.div
                key={feat.title}
                ref={(el) => (rightCardRefs.current[idx] = el)}
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
