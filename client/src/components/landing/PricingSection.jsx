import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Zap, Shield, ArrowRight, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import PlanComparisonTable from '../PlanComparisonTable';
import QuickRegisterModal from '../QuickRegisterModal';

export default function PricingSection() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [isYearly, setIsYearly] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const token = localStorage.getItem('token');

  return (
    <section id="pricing" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 scroll-mt-20">
      
      {/* Background ambient glow sphere */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[550px] w-[550px] rounded-full pointer-events-none z-0"
        style={{
          background: isLight
            ? 'rgba(243, 232, 255, 0.45)'
            : 'rgba(85, 27, 245, 0.12)',
          filter: 'blur(100px)',
        }}
      />

      {/* Section Header matching Brand System */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10 relative z-10 flex flex-col items-center"
      >
        {/* Pill Badge */}
        <div className="mb-3.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EDE9FE] dark:bg-purple-950/60 border border-[#E9D5FF]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <Zap className="w-3.5 h-3.5 fill-[#551BF5] text-[#551BF5]" />
          <span className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#551BF5] dark:text-purple-300">
            FLEXIBLE PRICING
          </span>
        </div>

        {/* Heading 2 */}
        <h2 className="text-3xl sm:text-4xl md:text-[40px] md:leading-[46px] font-bold tracking-[-1px] text-[#0F0F2D] dark:text-white">
          <span>Simple, Transparent </span>
          <span className="text-[#551BF5]">Plans for Everyone</span>
        </h2>

        {/* Subtitle */}
        <p className="mt-3 text-sm sm:text-base text-[#475569] dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
          Start for free with basic features or upgrade to unlock unlimited live players, advanced analytics, and custom branding.
        </p>

        {/* Signature Purple Accent Bar */}
        <div className="w-12 h-1 bg-[#551BF5] rounded-full mt-3.5" />

        {/* Monthly / Yearly Toggle Capsule */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2.5 p-1.5 rounded-2xl sm:rounded-full bg-white/80 dark:bg-white/5 border border-[#E9D5FF]/70 dark:border-purple-500/20 shadow-sm backdrop-blur-md max-w-xs sm:max-w-none mx-auto">
          <button
            type="button"
            onClick={() => setIsYearly(false)}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl sm:rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              !isYearly
                ? 'bg-[#551BF5] text-white shadow-md'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setIsYearly(true)}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
              isYearly
                ? 'bg-[#551BF5] text-white shadow-md'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Yearly Billing</span>
            <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0">
              Save 20%
            </span>
          </button>
          <button
            type="button"
            onClick={() => setShowPlanDetails(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl sm:rounded-full text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 transition-all cursor-pointer whitespace-nowrap"
          >
            Plan Details
          </button>
        </div>
      </motion.div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto relative z-10">

        {/* FREE PLAN */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className={`rounded-[24px] p-6 sm:p-8 border flex flex-col justify-between relative group text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
            isLight
              ? 'bg-white border-[#F1E8FF] shadow-[0px_4px_22px_rgba(85,27,245,0.05)]'
              : 'bg-[#151224] border-purple-500/20 shadow-xl'
          }`}
        >
          <div>
            <div className="flex justify-between items-center gap-2 mb-4">
              <h3 className="text-xl font-bold text-[#0F0F2D] dark:text-white whitespace-nowrap">FREE</h3>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#EDE9FE] text-[#551BF5] border border-[#E9D5FF]/70 shrink-0">
                Starter
              </span>
            </div>

            <div className="mb-6">
              <span className="text-4xl sm:text-5xl font-black text-[#0F0F2D] dark:text-white">₹0</span>
              <span className="text-xs text-[#64748B] dark:text-gray-400 font-semibold ml-2">/ forever free</span>
            </div>

            <p className="text-xs text-[#64748B] dark:text-gray-300 mb-6 leading-relaxed">
              Perfect for students and casual trivia hosts getting started with live quiz battles.
            </p>

            <div className="space-y-3 border-t border-[#F1E8FF] dark:border-purple-500/20 pt-6">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Create up to 5 quizzes</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Up to 20 live participants</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Basic real-time leaderboard</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Basic score analytics</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            {token ? (
              <Link
                to="/dashboard"
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#551BF5] hover:bg-[#4914DB] shadow-[0px_4px_14px_rgba(85,27,245,0.25)] transition-all cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#551BF5] hover:bg-[#4914DB] shadow-[0px_4px_14px_rgba(85,27,245,0.25)] transition-all cursor-pointer"
              >
                <span>Start Free</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* PRO PLAN (MOST POPULAR) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-[24px] p-6 sm:p-8 border-2 border-[#551BF5] flex flex-col justify-between relative group text-left bg-gradient-to-b from-purple-50/80 via-white to-purple-50/40 dark:from-purple-950/30 dark:via-[#151224] dark:to-[#151224] shadow-[0px_8px_30px_rgba(85,27,245,0.15)] lg:scale-105 z-10"
        >
          {/* Ribbon Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#551BF5] to-[#7C3AED] text-white text-[11px] font-black uppercase px-4 py-1 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap z-20">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-yellow-300" />
            <span>Most Popular</span>
          </div>

          <div>
            <div className="flex justify-between items-center gap-2 mb-4 mt-2">
              <h3 className="text-xl font-bold text-[#0F0F2D] dark:text-white whitespace-nowrap">PRO</h3>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#EDE9FE] text-[#551BF5] border border-[#E9D5FF]/70 shrink-0">
                Best Value
              </span>
            </div>

            <div className="mb-6">
              <span className="text-4xl sm:text-5xl font-black text-[#0F0F2D] dark:text-white">
                {isYearly ? '₹239' : '₹299'}
              </span>
              <span className="text-xs text-[#64748B] dark:text-gray-300 font-semibold ml-2">/ month</span>
              {isYearly && <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Billed annually (Save ₹720/yr)</span>}
            </div>

            <p className="text-xs text-[#64748B] dark:text-gray-300 mb-6 leading-relaxed">
              Designed for teachers, schools, corporate trainers, and high-frequency quizmasters.
            </p>

            <div className="space-y-3 border-t border-[#F1E8FF] dark:border-purple-500/20 pt-6">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-[#551BF5] shrink-0" />
                <span>Unlimited quizzes creation</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-[#551BF5] shrink-0" />
                <span>Unlimited live participants</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-[#551BF5] shrink-0" />
                <span>Advanced performance analytics</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-[#551BF5] shrink-0" />
                <span>Question Bank storage</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-[#551BF5] shrink-0" />
                <span>Dark & Light mode themes</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-[#551BF5] shrink-0" />
                <span>Priority email & chat support</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-[#551BF5] shrink-0" />
                <span>Custom logo & branding</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-[#551BF5] shrink-0" />
                <span>Export detailed PDF & CSV reports</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Link
              to={token ? "/dashboard" : "/register"}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#551BF5] hover:bg-[#4914DB] shadow-[0px_4px_16px_rgba(85,27,245,0.35)] transition-all cursor-pointer"
            >
              <span>{token ? "Go to Dashboard" : "Upgrade to Pro"}</span>
              <Zap className="h-4 w-4 fill-current text-yellow-300" />
            </Link>
          </div>
        </motion.div>

        {/* ENTERPRISE PLAN */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={`rounded-[24px] p-6 sm:p-8 border flex flex-col justify-between relative group text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
            isLight
              ? 'bg-white border-[#F1E8FF] shadow-[0px_4px_22px_rgba(85,27,245,0.05)]'
              : 'bg-[#151224] border-purple-500/20 shadow-xl'
          }`}
        >
          <div>
            <div className="flex justify-between items-center gap-2 mb-4">
              <h3 className="text-xl font-bold text-[#0F0F2D] dark:text-white whitespace-nowrap">ENTERPRISE</h3>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 shrink-0">
                Custom
              </span>
            </div>

            <div className="mb-6">
              <span className="text-3xl sm:text-4xl font-black text-[#0F0F2D] dark:text-white">Custom</span>
              <span className="text-xs text-[#64748B] dark:text-gray-400 font-semibold ml-2">/ tailored plan</span>
            </div>

            <p className="text-xs text-[#64748B] dark:text-gray-400 mb-6 leading-relaxed">
              Custom solutions tailored for universities, large educational institutions, and global enterprises.
            </p>

            <div className="space-y-3 border-t border-[#F1E8FF] dark:border-purple-500/20 pt-6">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-[#551BF5] shrink-0" />
                <span>Everything in Pro Plan</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-[#551BF5] shrink-0" />
                <span>Dedicated 24/7 Support manager</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-[#551BF5] shrink-0" />
                <span>Institution Admin Dashboard</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-[#551BF5] shrink-0" />
                <span>Multi-teacher account management</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-[#551BF5] shrink-0" />
                <span>Unlimited team workspace</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-[#551BF5] shrink-0" />
                <span>REST API Access & Webhooks</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-[#551BF5] shrink-0" />
                <span>Custom LMS Integrations</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <a
              href="mailto:sales@gubbi.com?subject=Enterprise%20Plan%20Inquiry"
              className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#0F0F2D] dark:bg-white dark:text-[#0F0F2D] hover:opacity-90 shadow-md transition-all"
            >
              <span>Contact Sales</span>
              <Shield className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

      </div>

      {/* Plan Details Modal */}
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
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-purple-100 dark:border-white/10 shadow-2xl bg-white dark:bg-[#151224]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-purple-100 dark:border-white/10 bg-white dark:bg-[#151224] backdrop-blur-xl">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0F0F2D] dark:text-white">
                    Detailed Plan Comparison
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-[#64748B] dark:text-gray-400">
                    Compare features side-by-side to choose the best plan for your needs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlanDetails(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white" />
                </button>
              </div>

              {/* Comparison Table */}
              <div className="p-6">
                <div className="overflow-x-auto scrollbar-thin">
                  <PlanComparisonTable />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-purple-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                <p className="text-center text-xs text-[#64748B] dark:text-gray-400">
                  Need help choosing? <Link to="/contact" className="text-[#551BF5] font-semibold hover:underline">Contact our sales team</Link>
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
