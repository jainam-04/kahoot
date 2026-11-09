import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, ArrowRight, Star, 
  Layers, Users, GraduationCap, Target 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPlatformStats } from '../../services/infoService';

export default function HeroSection() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: getPlatformStats,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const stats = statsData || {
    totalQuizzes: 0,
    totalGames: 0,
    totalPlayers: 0,
    totalClassrooms: 0,
    accuracy: 95
  };

  const formatStatValue = (val, isPercentage = false, defaultText = '0') => {
    if (isLoading) {
      return <span className="inline-block animate-pulse opacity-70">...</span>;
    }
    if (val === null || val === undefined || val === 0) return defaultText;

    if (isPercentage) {
      const num = Number(val);
      return `${isNaN(num) ? val : num}%`;
    }

    const num = Number(val);
    if (isNaN(num)) return val;

    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M+`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k+`;
    }
    return `${num.toLocaleString()}+`;
  };

  const displayTotalQuizzes = (stats.totalQuizzes || stats.totalGames) 
    ? formatStatValue(stats.totalQuizzes || stats.totalGames, false, '134+') 
    : '134+';
  const displayTotalPlayers = stats.totalPlayers 
    ? formatStatValue(stats.totalPlayers, false, '1.5k+') 
    : '1.5k+';
  const displayClassrooms = stats.totalClassrooms 
    ? formatStatValue(stats.totalClassrooms, false, '126+') 
    : '126+';
  const displayAccuracy = stats.accuracy 
    ? formatStatValue(stats.accuracy, true, '95%') 
    : '95%';

  return (
    <section 
      id="hero" 
      className="relative pt-4 sm:pt-6 lg:pt-8 pb-8 sm:pb-12 lg:pb-16 overflow-hidden px-4 sm:px-8 min-h-0 lg:min-h-[680px] flex flex-col justify-between"
      style={{
        background: 'linear-gradient(180deg, #FAF7FE 0%, #FAF8FF 100%)'
      }}
    >
      {/* Background device showcase graphic integrated directly into desktop hero background */}
      <div 
        className="hidden lg:block absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
      >
        <img 
          src="/hero-background-2x.png" 
          alt="Platform Interface Showcase" 
          className="absolute right-0 bottom-0 h-full w-auto max-w-none object-contain object-right-bottom" 
        />
      </div>

      {/* Ambient soft glow elements */}
      <div className="absolute top-[5%] left-[5%] w-[420px] h-[420px] rounded-full bg-purple-200/35 filter blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[25%] right-[12%] w-[480px] h-[480px] rounded-full bg-indigo-200/25 filter blur-[140px] pointer-events-none z-0" />

      {/* Main Container 1351px matching Figma */}
      <div className="max-w-[1351px] mx-auto w-full relative z-10 flex-1 flex flex-col justify-between">

        {/* Top Hero Row */}
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-between pt-2 sm:pt-4">
          
          {/* Left Content Column (592px in Figma) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[592px] text-left space-y-4 sm:space-y-5"
          >
            {/* Heading 1 */}
            <h1 className="font-['Inter'] font-bold text-3xl sm:text-4xl lg:text-[48px] xl:text-[54px] lg:leading-[50px] xl:leading-[54px] tracking-[-1.35px] text-[#1E1B4B]">
              Create, Host & Play <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#551BF5] via-[#483ED5] to-[#2563EB]">
                Interactive Quizzes
              </span> <br />
              in Real-Time
            </h1>

            {/* Subtitle */}
            <p className="font-['Inter'] font-normal text-sm sm:text-base lg:text-[18px] leading-[26px] sm:leading-[28px] text-[#475569] max-w-[576px]">
              Create engaging quizzes, invite players instantly, compete live, track performance, and make learning fun.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-2 filter drop-shadow-[0px_2px_13px_rgba(0,0,0,0.1)]">
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-3.5">
                {/* Button 1: Create Quiz */}
                <Link
                  to="/quiz/create"
                  className="h-11 sm:h-12 px-4 sm:px-7 rounded-[16px] text-white font-['Inter'] font-bold text-xs sm:text-base tracking-[0.4px] flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0px_10px_22px_-4px_rgba(85,27,245,0.4),inset_0px_1px_0px_rgba(255,255,255,0.35)] shrink-0"
                  style={{ background: 'linear-gradient(105.23deg, #551BF5 0%, #6C38FF 50%, #7A42F8 100%)' }}
                >
                  <span>Create Quiz</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {/* Button 2: Join Game */}
                <Link
                  to="/join"
                  className="h-11 sm:h-12 px-4 sm:px-6 rounded-[16px] bg-white border border-[#E9D5FF] text-[#1E1B4B] font-['Inter'] font-semibold text-xs sm:text-base tracking-[0.4px] flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-purple-50/50 hover:border-[#D8B4FE] hover:scale-105 active:scale-95 transition-all shadow-[0px_1px_2px_rgba(0,0,0,0.05)] shrink-0"
                >
                  <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-[#551BF5] text-[#551BF5]" />
                  <span>Join Game</span>
                </Link>
              </div>

              {/* Button 3: Try Demo */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('interactive-demo');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="h-11 sm:h-12 px-5 sm:px-6 rounded-[16px] bg-white/90 border border-[#E2E8F0] backdrop-blur-[12px] text-[#334155] font-['Inter'] font-semibold text-xs sm:text-base tracking-[0.4px] flex items-center justify-center gap-2 hover:bg-white hover:border-[#CBD5E1] hover:scale-105 active:scale-95 transition-all shadow-[0px_1px_2px_rgba(0,0,0,0.05)] cursor-pointer"
              >
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-[#F59E0B] text-[#F59E0B]" />
                <span>Try Demo</span>
              </button>
            </div>
          </motion.div>

          {/* Mobile/Tablet Preview of Showcase Graphic (Stacked on < lg screens) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:hidden w-full flex items-center justify-center py-4 mt-2 sm:mt-4"
          >
            <img 
              src="/hero-mobile-device.png" 
              alt="Interactive Quiz Platform Interface" 
              className="w-full max-w-[480px] sm:max-w-[560px] object-contain drop-shadow-[0_15px_35px_rgba(85,27,245,0.14)] select-none pointer-events-none" 
            />
          </motion.div>
        </div>

        {/* Bottom Stats Bar: 4 Rounded Cards Matching Figma */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-[1287px] mx-auto mt-6 sm:mt-8 bg-white/95 border border-[rgba(243,232,255,0.9)] shadow-[0px_1px_29px_rgba(0,0,0,0.08),0px_20px_25px_-5px_rgba(168,85,247,0.1),0px_8px_10px_-6px_rgba(168,85,247,0.08)] rounded-[24px] sm:rounded-[32px] p-2.5 sm:p-4 backdrop-blur-[12px]"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-0 items-center">
            {/* Stat 1: Total Quizzes Hosted */}
            <div className="flex items-center gap-2.5 sm:gap-4 px-1.5 sm:px-4 lg:px-5 py-2">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] shadow-[inset_0px_2px_4px_1px_rgba(0,0,0,0.05)] flex items-center justify-center text-[#3B1FB2] shrink-0">
                <Layers className="h-5 w-5 sm:h-7 sm:w-7 text-[#3B1FB2]" />
              </div>
              <div className="text-left">
                <span className="font-['Inter'] font-extrabold text-lg sm:text-2xl lg:text-[30px] leading-tight sm:leading-9 text-[#0D0B26] tracking-[-0.75px] block">
                  {displayTotalQuizzes}
                </span>
                <span className="font-['Inter'] font-medium text-[11px] sm:text-[14px] leading-tight sm:leading-5 text-[#64748B] block mt-0.5">
                  Total Quizzes Hosted
                </span>
              </div>
            </div>

            {/* Stat 2: Active Battle Players */}
            <div className="flex items-center gap-2.5 sm:gap-4 px-1.5 sm:px-4 lg:px-5 py-2 lg:border-l lg:border-[#F1F5F9]">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] shadow-[inset_0px_2px_4px_1px_rgba(0,0,0,0.05)] flex items-center justify-center text-[#3B1FB2] shrink-0">
                <Users className="h-5 w-5 sm:h-7 sm:w-7 text-[#3B1FB2]" />
              </div>
              <div className="text-left">
                <span className="font-['Inter'] font-extrabold text-lg sm:text-2xl lg:text-[30px] leading-tight sm:leading-9 text-[#0D0B26] tracking-[-0.75px] block">
                  {displayTotalPlayers}
                </span>
                <span className="font-['Inter'] font-medium text-[11px] sm:text-[14px] leading-tight sm:leading-5 text-[#64748B] block mt-0.5">
                  Active Battle Players
                </span>
              </div>
            </div>

            {/* Stat 3: Classrooms Connected */}
            <div className="flex items-center gap-2.5 sm:gap-4 px-1.5 sm:px-4 lg:px-5 py-2 lg:border-l lg:border-[#F1F5F9]">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] shadow-[inset_0px_2px_4px_1px_rgba(0,0,0,0.05)] flex items-center justify-center text-[#3B1FB2] shrink-0">
                <GraduationCap className="h-5 w-5 sm:h-7 sm:w-7 text-[#3B1FB2]" />
              </div>
              <div className="text-left">
                <span className="font-['Inter'] font-extrabold text-lg sm:text-2xl lg:text-[30px] leading-tight sm:leading-9 text-[#0D0B26] tracking-[-0.75px] block">
                  {displayClassrooms}
                </span>
                <span className="font-['Inter'] font-medium text-[11px] sm:text-[14px] leading-tight sm:leading-5 text-[#64748B] block mt-0.5">
                  Classrooms Connected
                </span>
              </div>
            </div>

            {/* Stat 4: Response Accuracy */}
            <div className="flex items-center gap-2.5 sm:gap-4 px-1.5 sm:px-4 lg:px-5 py-2 lg:border-l lg:border-[#F1F5F9]">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] shadow-[inset_0px_2px_4px_1px_rgba(0,0,0,0.05)] flex items-center justify-center text-[#3B1FB2] shrink-0">
                <Target className="h-5 w-5 sm:h-7 sm:w-7 text-[#3B1FB2]" />
              </div>
              <div className="text-left">
                <span className="font-['Inter'] font-extrabold text-lg sm:text-2xl lg:text-[30px] leading-tight sm:leading-9 text-[#0D0B26] tracking-[-0.75px] block">
                  {displayAccuracy}
                </span>
                <span className="font-['Inter'] font-medium text-[11px] sm:text-[14px] leading-tight sm:leading-5 text-[#64748B] block mt-0.5">
                  Response Accuracy
                </span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Gentle Bottom Lavender Landscape Wave (visible on mobile / small screens) */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 h-16 pointer-events-none overflow-hidden z-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#F3E8FF" fillOpacity="0.6" />
          <path d="M0,85L80,80C160,75,320,64,480,69.3C640,75,800,96,960,96C1120,96,1280,75,1360,64L1440,53L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#EDE9FE" fillOpacity="0.8" />
        </svg>
      </div>
    </section>
  );
}
