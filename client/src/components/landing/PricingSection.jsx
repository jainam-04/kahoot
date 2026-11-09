import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import PlanComparisonTable from '../PlanComparisonTable';
import QuickRegisterModal from '../QuickRegisterModal';

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0" fill="none" stroke="#551BF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
    </svg>
  );
}

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [activeCardIndex, setActiveCardIndex] = useState(1);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const carouselRef = useRef(null);
  const token = localStorage.getItem('token');

  const plans = ['free', 'pro', 'enterprise'];

  const scrollToCard = (index, smooth = true) => {
    setActiveCardIndex(index);
    setSelectedPlan(plans[index]);
    if (carouselRef.current) {
      const cardEl = carouselRef.current.children[index];
      if (cardEl) {
        const container = carouselRef.current;
        const targetScroll = cardEl.offsetLeft - (container.clientWidth - cardEl.offsetWidth) / 2;
        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  };

  const handleCarouselScroll = () => {
    if (!carouselRef.current || window.innerWidth >= 1024) return;
    const container = carouselRef.current;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i];
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    if (closestIndex !== activeCardIndex) {
      setActiveCardIndex(closestIndex);
      setSelectedPlan(plans[closestIndex]);
    }
  };

  useEffect(() => {
    if (window.innerWidth < 1024 && carouselRef.current) {
      const timer = setTimeout(() => {
        scrollToCard(1, false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const isFreeSelected = selectedPlan === 'free';
  const isProSelected = selectedPlan === 'pro';
  const isEnterpriseSelected = selectedPlan === 'enterprise';

  return (
    <section 
      id="pricing" 
      className="relative w-full py-12 sm:py-16 lg:py-20 border-t border-[#F1F5F9] scroll-mt-20 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(245, 243, 255, 0.5) 0%, #FFFFFF 50%, #FFFFFF 100%)'
      }}
    >
      <div className="max-w-[1349px] mx-auto px-4 sm:px-8 w-full flex flex-col items-center">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center max-w-[672px] space-y-4"
        >
          {/* Badge: PRICING PLANS */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[rgba(250,245,255,0.8)] border border-[rgba(233,213,255,0.8)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <span className="font-['Inter'] font-semibold text-xs leading-4 tracking-[0.6px] uppercase text-[#551BF5]">
              Pricing Plans
            </span>
          </div>

          {/* Heading 2 */}
          <h2 className="font-['Inter'] font-medium text-3xl sm:text-4xl lg:text-[48px] lg:leading-[48px] tracking-[-1.2px] text-[#0D0B26]">
            Simple, transparent pricing
          </h2>

          {/* Subtitle */}
          <p className="font-['Inter'] font-normal text-sm sm:text-base leading-6 text-[#475569] max-w-[624px]">
            Everything you need to host engaging quizzes. No surprise fees, cancel or change anytime.
          </p>

          {/* Sleek Minimal Billing Toggle */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center p-1.5 rounded-full bg-[#FAF8FF] border border-[#F3E8FF] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              {/* Monthly Button */}
              <button
                type="button"
                onClick={() => setIsYearly(false)}
                className={`px-5 py-2 rounded-full font-['Inter'] text-xs transition-all cursor-pointer ${
                  !isYearly
                    ? 'bg-[#551BF5] text-white font-bold shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                    : 'text-[#475569] font-semibold hover:text-[#0D0B26]'
                }`}
              >
                Monthly
              </button>

              {/* Yearly Button */}
              <button
                type="button"
                onClick={() => setIsYearly(true)}
                className={`px-5 py-2 rounded-full font-['Inter'] text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  isYearly
                    ? 'bg-[#551BF5] text-white font-bold shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                    : 'text-[#475569] font-semibold hover:text-[#0D0B26]'
                }`}
              >
                <span>Yearly</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isYearly ? 'bg-white/20 text-white' : 'bg-[#F3E8FF] text-[#551BF5]'
                  }`}
                >
                  Save 20%
                </span>
              </button>
            </div>

            {/* Plan Details comparison modal trigger */}
            <button
              type="button"
              onClick={() => setShowPlanDetails(true)}
              className="text-xs font-['Inter'] font-semibold text-[#551BF5] hover:underline cursor-pointer py-1 px-2"
            >
              Compare features &rarr;
            </button>
          </div>
        </motion.div>

        {/* 3 Minimal Monochromatic Pricing Cards */}
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="w-full max-w-[1152px] flex lg:grid lg:grid-cols-3 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-none gap-4 sm:gap-6 lg:gap-8 items-stretch mt-8 sm:mt-14 px-6 sm:px-8 lg:px-0 py-6 -mx-4 sm:-mx-8 lg:mx-0 scroll-smooth"
        >
          
          {/* Card 1: Free (Starter) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            onClick={() => {
              setSelectedPlan('free');
              scrollToCard(0);
            }}
            className={`w-[84vw] max-w-[340px] shrink-0 snap-center lg:w-auto rounded-[24px] bg-white p-6 sm:p-8 flex flex-col justify-between text-left transition-all duration-300 cursor-pointer relative ${
              isFreeSelected
                ? 'border-2 border-[#551BF5] shadow-[0px_20px_25px_-5px_rgba(168,85,247,0.1),0px_8px_10px_-6px_rgba(168,85,247,0.1)] lg:-translate-y-2 z-10'
                : 'border border-[rgba(243,232,255,0.8)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:border-[#D8B4FE] hover:shadow-md'
            }`}
          >
            {isFreeSelected && (
              <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#551BF5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <span className="font-['Inter'] font-bold text-[10px] leading-4 tracking-[0.5px] uppercase text-white whitespace-nowrap">
                  Selected
                </span>
              </div>
            )}

            <div className="space-y-4">
              {/* Category Tag */}
              <span className={`font-['Inter'] font-bold text-xs leading-4 tracking-[0.6px] uppercase block transition-colors ${
                isFreeSelected ? 'text-[#551BF5]' : 'text-[#64748B]'
              }`}>
                Starter
              </span>

              {/* Plan Name */}
              <h3 className="font-['Inter'] font-bold text-[20px] leading-7 text-[#0D0B26]">
                Free
              </h3>

              {/* Description */}
              <p className="font-['Inter'] font-normal text-xs leading-5 text-[#64748B] min-h-[40px]">
                Essential tools for casual quiz hosting, students, and family trivia nights.
              </p>

              {/* Price Row */}
              <div className="pt-2 pb-6 border-b border-[#F3E8FF] flex items-baseline gap-1">
                <span className="font-['Inter'] font-extrabold text-[36px] leading-10 tracking-[-0.9px] text-[#0D0B26]">
                  ₹0
                </span>
                <span className="font-['Inter'] font-medium text-xs leading-4 text-[#64748B]">
                  / forever free
                </span>
              </div>

              {/* Features List */}
              <div className="pt-2 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="font-['Inter'] font-normal text-xs leading-4 text-[#475569]">
                    Up to 5 active quizzes
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="font-['Inter'] font-normal text-xs leading-4 text-[#475569]">
                    Up to 20 live participants
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="font-['Inter'] font-normal text-xs leading-4 text-[#475569]">
                    Real-time leaderboard
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="font-['Inter'] font-normal text-xs leading-4 text-[#475569]">
                    Basic accuracy summary
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8 mt-auto">
              {token ? (
                <Link
                  to="/dashboard"
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full h-[42px] rounded-[16px] font-['Inter'] font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                    isFreeSelected
                      ? 'bg-[#551BF5] hover:opacity-95 text-white shadow-[0px_4px_6px_-1px_rgba(168,85,247,0.25)] hover:scale-[1.01] active:scale-[0.99]'
                      : 'border border-[#E9D5FF] bg-white hover:bg-purple-50/50 text-[#551BF5]'
                  }`}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRegisterModal(true);
                  }}
                  className={`w-full h-[42px] rounded-[16px] font-['Inter'] font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                    isFreeSelected
                      ? 'bg-[#551BF5] hover:opacity-95 text-white shadow-[0px_4px_6px_-1px_rgba(168,85,247,0.25)] hover:scale-[1.01] active:scale-[0.99]'
                      : 'border border-[#E9D5FF] bg-white hover:bg-purple-50/50 text-[#551BF5]'
                  }`}
                >
                  Get Started Free
                </button>
              )}
            </div>
          </motion.div>

          {/* Card 2: Pro (Educator & Host) — Featured / Most Popular */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onClick={() => {
              setSelectedPlan('pro');
              scrollToCard(1);
            }}
            className={`w-[84vw] max-w-[340px] shrink-0 snap-center lg:w-auto rounded-[24px] bg-white p-6 sm:p-8 flex flex-col justify-between text-left transition-all duration-300 cursor-pointer relative ${
              isProSelected
                ? 'border-2 border-[#551BF5] shadow-[0px_20px_25px_-5px_rgba(168,85,247,0.1),0px_8px_10px_-6px_rgba(168,85,247,0.1)] lg:-translate-y-2 z-10'
                : 'border border-[rgba(243,232,255,0.8)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:border-[#D8B4FE] hover:shadow-md'
            }`}
          >
            {/* Top Minimal Tag */}
            <div className={`absolute -top-[12px] left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors ${
              isProSelected ? 'bg-[#551BF5] text-white' : 'bg-[#F3E8FF] text-[#551BF5]'
            }`}>
              <span className="font-['Inter'] font-bold text-[10px] leading-4 tracking-[0.5px] uppercase whitespace-nowrap">
                Most Popular
              </span>
            </div>

            <div className="space-y-4">
              {/* Category Tag */}
              <span className={`font-['Inter'] font-bold text-xs leading-4 tracking-[0.6px] uppercase block transition-colors ${
                isProSelected ? 'text-[#551BF5]' : 'text-[#64748B]'
              }`}>
                Educator & Host
              </span>

              {/* Plan Name */}
              <h3 className="font-['Inter'] font-bold text-[20px] leading-7 text-[#0D0B26]">
                Pro
              </h3>

              {/* Description */}
              <p className="font-['Inter'] font-normal text-xs leading-5 text-[#64748B] min-h-[40px]">
                Ideal for teachers, schools, trainers, and high-frequency quizmasters.
              </p>

              {/* Price Row */}
              <div className="pt-2 pb-6 border-b border-[#F3E8FF] flex items-baseline gap-1">
                <span className="font-['Inter'] font-extrabold text-[36px] leading-10 tracking-[-0.9px] text-[#0D0B26]">
                  {isYearly ? '₹239' : '₹299'}
                </span>
                <span className="font-['Inter'] font-medium text-xs leading-4 text-[#64748B]">
                  / month
                </span>
                {isYearly && (
                  <span className="ml-2 font-['Inter'] text-[10px] text-[#551BF5] font-bold">
                    (billed annually)
                  </span>
                )}
              </div>

              {/* Features List */}
              <div className="pt-2 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="font-['Inter'] font-semibold text-xs leading-4 text-[#334155]">
                    Unlimited quizzes creation
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="font-['Inter'] font-semibold text-xs leading-4 text-[#334155]">
                    Unlimited live participants
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="font-['Inter'] font-normal text-xs leading-4 text-[#334155]">
                    Advanced analytics & reports
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="font-['Inter'] font-normal text-xs leading-4 text-[#334155]">
                    Question Bank storage
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="font-['Inter'] font-normal text-xs leading-4 text-[#334155]">
                    Custom branding & themes
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="font-['Inter'] font-normal text-xs leading-4 text-[#334155]">
                    Priority email support
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8 mt-auto">
              <Link
                to={token ? "/dashboard" : "/register"}
                onClick={(e) => e.stopPropagation()}
                className={`w-full h-[42px] rounded-[16px] font-['Inter'] font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                  isProSelected
                    ? 'bg-[#551BF5] hover:opacity-95 text-white shadow-[0px_4px_6px_-1px_rgba(168,85,247,0.25)] hover:scale-[1.01] active:scale-[0.99]'
                    : 'border border-[#E9D5FF] bg-white hover:bg-purple-50/50 text-[#551BF5]'
                }`}
              >
                Upgrade to Pro
              </Link>
            </div>
          </motion.div>

          {/* Card 3: Enterprise (Organization) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            onClick={() => {
              setSelectedPlan('enterprise');
              scrollToCard(2);
            }}
            className={`w-[84vw] max-w-[340px] shrink-0 snap-center lg:w-auto rounded-[24px] bg-white p-6 sm:p-8 flex flex-col justify-between text-left transition-all duration-300 cursor-pointer relative ${
              isEnterpriseSelected
                ? 'border-2 border-[#551BF5] shadow-[0px_20px_25px_-5px_rgba(168,85,247,0.1),0px_8px_10px_-6px_rgba(168,85,247,0.1)] lg:-translate-y-2 z-10'
                : 'border border-[rgba(243,232,255,0.8)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:border-[#D8B4FE] hover:shadow-md'
            }`}
          >
            {isEnterpriseSelected && (
              <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#551BF5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <span className="font-['Inter'] font-bold text-[10px] leading-4 tracking-[0.5px] uppercase text-white whitespace-nowrap">
                  Selected
                </span>
              </div>
            )}

            <div className="space-y-4">
              {/* Category Tag */}
              <span className={`font-['Inter'] font-bold text-xs leading-4 tracking-[0.6px] uppercase block transition-colors ${
                isEnterpriseSelected ? 'text-[#551BF5]' : 'text-[#64748B]'
              }`}>
                Organization
              </span>

              {/* Plan Name */}
              <h3 className="font-['Inter'] font-bold text-[20px] leading-7 text-[#0D0B26]">
                Enterprise
              </h3>

              {/* Description */}
              <p className="font-['Inter'] font-normal text-xs leading-5 text-[#64748B] min-h-[40px]">
                Tailored infrastructure for universities, institutions, and enterprises.
              </p>

              {/* Price Row */}
              <div className="pt-2 pb-6 border-b border-[#F3E8FF] flex items-baseline gap-1">
                <span className="font-['Inter'] font-extrabold text-[36px] leading-10 tracking-[-0.9px] text-[#0D0B26]">
                  Custom
                </span>
                <span className="font-['Inter'] font-medium text-xs leading-4 text-[#64748B]">
                  / tailored plan
                </span>
              </div>

              {/* Features List */}
              <div className="pt-2 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="font-['Inter'] font-normal text-xs leading-4 text-[#475569]">
                    Everything in Pro Plan
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="font-['Inter'] font-normal text-xs leading-4 text-[#475569]">
                    Multi-teacher account management
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="font-['Inter'] font-normal text-xs leading-4 text-[#475569]">
                    REST API access & webhooks
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="font-['Inter'] font-normal text-xs leading-4 text-[#475569]">
                    Dedicated success manager & SLA
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8 mt-auto">
              <a
                href="mailto:info@fouriseindia.com?subject=Enterprise%20Plan%20Inquiry"
                onClick={(e) => e.stopPropagation()}
                className={`w-full h-[42px] rounded-[16px] font-['Inter'] font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                  isEnterpriseSelected
                    ? 'bg-[#551BF5] hover:opacity-95 text-white shadow-[0px_4px_6px_-1px_rgba(168,85,247,0.25)] hover:scale-[1.01] active:scale-[0.99]'
                    : 'border border-[#E9D5FF] bg-white hover:bg-purple-50/50 text-[#551BF5]'
                }`}
              >
                Contact Sales
              </a>
            </div>
          </motion.div>

        </div>

        {/* Mobile Carousel Indicators & Navigation Controls */}
        <div className="flex lg:hidden items-center justify-center gap-3.5 mt-1 select-none">
          <button
            type="button"
            onClick={() => scrollToCard(Math.max(0, activeCardIndex - 1))}
            disabled={activeCardIndex === 0}
            aria-label="Previous Plan"
            className="w-9 h-9 rounded-full border border-[#E9D5FF] bg-white shadow-xs flex items-center justify-center text-[#551BF5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition-all hover:bg-purple-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {plans.map((p, i) => (
              <button
                key={p}
                type="button"
                onClick={() => scrollToCard(i)}
                aria-label={`Go to ${p} plan`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeCardIndex === i
                    ? 'w-7 h-2 bg-[#551BF5] shadow-xs'
                    : 'w-2 h-2 bg-purple-200 hover:bg-purple-300'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollToCard(Math.min(plans.length - 1, activeCardIndex + 1))}
            disabled={activeCardIndex === plans.length - 1}
            aria-label="Next Plan"
            className="w-9 h-9 rounded-full border border-[#E9D5FF] bg-white shadow-xs flex items-center justify-center text-[#551BF5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition-all hover:bg-purple-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Detailed Plan Comparison Modal */}
      <AnimatePresence>
        {showPlanDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPlanDetails(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-slate-200 shadow-2xl text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
                <div>
                  <h2 className="font-['Inter'] text-2xl font-bold text-[#0D0B26]">
                    Detailed Plan Comparison
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
                    Compare features side-by-side to choose the best plan for your needs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlanDetails(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5 text-[#64748B]" />
                </button>
              </div>

              {/* Comparison Table */}
              <div className="p-6">
                <div className="overflow-x-auto scrollbar-thin">
                  <PlanComparisonTable />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-[#FAF8FF]">
                <p className="text-center text-xs text-[#64748B]">
                  Need help choosing? <a href="mailto:sales@gubbi.com" className="text-[#551BF5] font-semibold hover:underline">Contact our sales team</a>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <QuickRegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </section>
  );
}
