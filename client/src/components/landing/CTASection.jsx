import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play, Check, Zap, Laptop } from 'lucide-react';
import QuickRegisterModal from '../QuickRegisterModal';

export default function CTASection() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <section 
      id="cta" 
      className="relative w-full py-10 sm:py-16 lg:py-20 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF8FF 50%, #FFFFFF 100%)'
      }}
    >
      <div className="relative mx-auto max-w-[1280px] px-3 sm:px-6 lg:px-8">
        {/* Ambient soft purple and cyan glow blooms */}
        <div
          className="absolute -top-16 -left-16 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'rgba(243, 232, 255, 0.45)',
            filter: 'blur(64px)',
          }}
        />
        <div
          className="absolute -bottom-16 -right-16 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'rgba(239, 246, 255, 0.7)',
            filter: 'blur(64px)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[24px] sm:rounded-[32px] p-5 sm:p-10 lg:p-14 overflow-hidden border border-[#F3E8FF] shadow-[0px_20px_25px_-5px_rgba(168,85,247,0.05),0px_8px_10px_-6px_rgba(168,85,247,0.05)]"
          style={{
            background: 'radial-gradient(91.8% 185.29% at 85% 30%, #F0E9FF 0%, #F8F5FF 50%, #FFFFFF 100%)',
          }}
        >
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-12">
          {/* Left Column Content */}
          <div className="flex-1 max-w-xl flex flex-col items-center lg:items-start text-center lg:text-left gap-3 sm:gap-4 w-full">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5 bg-[#F3E8FF]/60 border border-[#E9D5FF]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              <Sparkles className="w-3.5 h-3.5 text-[#551BF5]" />
              <span className="font-['Inter'] font-black text-[11px] sm:text-xs uppercase tracking-[0.6px] text-[#551BF5]">
                Ready to Transform Your Quizzes?
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-['Inter'] font-extrabold text-2xl sm:text-3xl lg:text-[44px] leading-tight sm:leading-[1.1] lg:leading-[44px] tracking-[-0.8px] sm:tracking-[-1.1px] text-[#0F172A] pt-0.5 sm:pt-1">
              Start Hosting Live Quizzes <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#551BF5] via-[#6366F1] to-[#2563EB] bg-clip-text text-transparent">
                in Under 60 Seconds
              </span>
            </h2>

            {/* Subtitle */}
            <p className="font-['Inter'] text-xs sm:text-base leading-5 sm:leading-6 text-[#475569] max-w-[500px]">
              Join thousands of educators, trivia hosts, and training teams creating unforgettable multiplayer quiz sessions with zero setup friction.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-1 sm:pt-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="group inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-6 sm:px-7 rounded-[14px] sm:rounded-[16px] bg-[#551BF5] hover:bg-[#4714d6] text-white font-['Inter'] font-bold text-sm sm:text-base shadow-[0px_10px_15px_-3px_rgba(168,85,247,0.25),0px_4px_6px_-4px_rgba(168,85,247,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-full sm:w-auto"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <Link
                to="/join"
                className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-5 sm:px-6 rounded-[14px] sm:rounded-[16px] bg-white hover:bg-slate-50 border border-[#E2E8F0]/90 text-[#1E293B] font-['Inter'] font-semibold text-sm sm:text-base shadow-[0px_1px_2px_rgba(0,0,0,0.05)] tracking-[0.4px] transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                <Play className="w-4 h-4 fill-[#551BF5] text-[#551BF5]" />
                <span>Join Game with PIN</span>
              </Link>
            </div>
          </div>

          {/* Right Column Illustration */}
          <div className="flex-1 flex items-center justify-center lg:justify-end w-full">
            <motion.img
              src="/cta-device.png"
              alt="Gubbi Live Quiz 3D Laptop with Timer and Trophy"
              className="w-full max-w-[260px] sm:max-w-[360px] lg:max-w-[488px] h-auto object-contain select-none drop-shadow-xl"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            />
          </div>
        </div>

        {/* Full-width Capsule Pill Bar */}
        <div className="relative z-10 mt-6 sm:mt-8 lg:mt-12 w-full rounded-[20px] md:rounded-full bg-white/80 border border-[#F3E8FF] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-[12px] px-4 sm:px-8 py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-around gap-2.5 sm:gap-4 md:gap-6">
          {/* Feature 1 */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/90 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#059669] stroke-[2.5]" />
            </div>
            <span className="font-['Inter'] font-semibold text-xs sm:text-sm text-[#1E293B] whitespace-nowrap">
              Free forever starter tier
            </span>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-[#F1F5F9]" />

          {/* Feature 2 */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EDE9FE] border border-[#E9D5FF]/80 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#551BF5] fill-[#551BF5]" />
            </div>
            <span className="font-['Inter'] font-semibold text-xs sm:text-sm text-[#1E293B] whitespace-nowrap">
              Instant 1-click room setup
            </span>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-[#F1F5F9]" />

          {/* Feature 3 */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EFF6FF] border border-[#BFDBFE]/90 flex items-center justify-center shrink-0">
              <Laptop className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0284C7] stroke-[2]" />
            </div>
            <span className="font-['Inter'] font-semibold text-xs sm:text-sm text-[#1E293B] whitespace-nowrap">
              Works on any device or browser
            </span>
          </div>
        </div>
      </motion.div>
      </div>

      <QuickRegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </section>
  );
}
