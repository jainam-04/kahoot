import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Zap, Shield, ArrowRight, X } from 'lucide-react';
import PlanComparisonTable from '../PlanComparisonTable';
import QuickRegisterModal from '../QuickRegisterModal';

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const token = localStorage.getItem('token');

  return (
    <section id="pricing" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 scroll-mt-20">
      
      {/* Background glow spheres */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[550px] w-[550px] rounded-full bg-primary/15 blur-[150px] pointer-events-none" />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <span className="rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-wider">
          Flexible Pricing
        </span>
        <h2 className="font-outfit text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-4 tracking-tight">
          Simple, Transparent <span className="text-gradient-primary">Plans for Everyone</span>
        </h2>
        <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
          Start for free with basic features or upgrade to unlock unlimited live players, advanced analytics, and custom branding.
        </p>

        {/* Monthly / Yearly Toggle Switch */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-2 sm:p-1.5 rounded-2xl sm:rounded-full glass-panel border border-slate-200 dark:border-white/10 bg-slate-100/90 dark:bg-white/5 max-w-xs sm:max-w-none mx-auto shadow-sm">
          <button
            onClick={() => setIsYearly(false)}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl sm:rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              !isYearly ? 'bg-primary text-white shadow-md' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl sm:rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
              isYearly ? 'bg-primary text-white shadow-md' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Yearly Billing</span>
            <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
              Save 20%
            </span>
          </button>
          <button
            onClick={() => setShowPlanDetails(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl sm:rounded-full text-xs font-extrabold text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 transition-all cursor-pointer whitespace-nowrap"
          >
            Plan Details
          </button>
        </div>
      </motion.div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">

        {/* FREE PLAN */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 flex flex-col justify-between relative group text-left bg-white/90 dark:bg-transparent shadow-lg dark:shadow-none"
        >
          <div>
            <div className="flex justify-between items-center gap-2 mb-4">
              <h3 className="font-outfit text-xl font-extrabold text-slate-900 dark:text-white whitespace-nowrap">FREE</h3>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 shrink-0">
                Starter
              </span>
            </div>

            <div className="mb-6">
              <span className="font-outfit text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">₹0</span>
              <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold ml-2">/ forever free</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-gray-400 mb-6 leading-relaxed">
              Perfect for students and casual trivia hosts getting started with live quiz battles.
            </p>

            <div className="space-y-3 border-t border-slate-200 dark:border-white/10 pt-6">
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
                className="btn-premium btn-primary-gradient w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold text-white shadow-premium-glow hover:scale-105 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="btn-premium btn-primary-gradient w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold text-white shadow-premium-glow hover:scale-105 transition-all cursor-pointer"
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
          className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-8 border-2 border-primary/60 flex flex-col justify-between relative group text-left bg-gradient-to-b from-purple-50/90 via-white to-sky-50/80 dark:from-primary/20 dark:via-black/80 dark:to-black shadow-2xl shadow-primary/20 lg:scale-105 z-10"
        >
          {/* Ribbon Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white text-[10px] sm:text-[11px] font-black uppercase px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap z-20">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-yellow-300" />
            <span>Most Popular</span>
          </div>

          <div>
            <div className="flex justify-between items-center gap-2 mb-4 mt-2">
              <h3 className="font-outfit text-xl font-extrabold text-slate-900 dark:text-white whitespace-nowrap">PRO</h3>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 shrink-0">
                Best Value
              </span>
            </div>

            <div className="mb-6">
              <span className="font-outfit text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                {isYearly ? '₹239' : '₹299'}
              </span>
              <span className="text-xs text-slate-600 dark:text-gray-300 font-semibold ml-2">/ month</span>
              {isYearly && <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Billed annually (Save ₹720/yr)</span>}
            </div>

            <p className="text-xs text-slate-600 dark:text-gray-300 mb-6 leading-relaxed">
              Designed for teachers, schools, corporate trainers, and high-frequency quizmasters.
            </p>

            <div className="space-y-3 border-t border-slate-200 dark:border-white/10 pt-6">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>Unlimited quizzes creation</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>Unlimited live participants</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>Advanced performance analytics</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>Question Bank storage</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>Dark & Light mode themes</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>Priority email & chat support</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>Custom logo & branding</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>Export detailed PDF & CSV reports</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Link
              to={token ? "/dashboard" : "/register"}
              className="btn-premium btn-primary-gradient w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold text-white shadow-premium-glow hover:scale-105 transition-all"
            >
              <span>{token ? "Go to Dashboard" : "Upgrade to Pro"}</span>
              <Zap className="h-4 w-4 fill-current text-secondary" />
            </Link>
          </div>
        </motion.div>

        {/* ENTERPRISE PLAN */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 flex flex-col justify-between relative group text-left bg-white/90 dark:bg-transparent shadow-lg dark:shadow-none"
        >
          <div>
            <div className="flex justify-between items-center gap-2 mb-4">
              <h3 className="font-outfit text-xl font-extrabold text-slate-900 dark:text-white whitespace-nowrap">ENTERPRISE</h3>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 shrink-0">
                Custom
              </span>
            </div>

            <div className="mb-6">
              <span className="font-outfit text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Custom</span>
              <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold ml-2">/ tailored plan</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-gray-400 mb-6 leading-relaxed">
              Custom solutions tailored for universities, large educational institutions, and global enterprises.
            </p>

            <div className="space-y-3 border-t border-slate-200 dark:border-white/10 pt-6">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-secondary shrink-0" />
                <span>Everything in Pro Plan</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-secondary shrink-0" />
                <span>Dedicated 24/7 Support manager</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-secondary shrink-0" />
                <span>Institution Admin Dashboard</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-secondary shrink-0" />
                <span>Multi-teacher account management</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-secondary shrink-0" />
                <span>Unlimited team workspace</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-secondary shrink-0" />
                <span>REST API Access & Webhooks</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-gray-200">
                <Check className="h-4 w-4 text-secondary shrink-0" />
                <span>Custom LMS Integrations</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <a
              href="mailto:sales@quizzy.com?subject=Enterprise%20Plan%20Inquiry"
              className="btn-premium btn-secondary-gradient text-white w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold shadow-secondary-glow transition-all"
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
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[var(--card-bg)] backdrop-blur-xl">
                <div>
                  <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-[var(--text-heading)]">
                    Detailed Plan Comparison
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)]">
                    Compare features side-by-side to choose the best plan for your needs.
                  </p>
                </div>
                <button
                  onClick={() => setShowPlanDetails(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5 text-[var(--text-muted)] hover:text-[var(--text-heading)]" />
                </button>
              </div>

              {/* Comparison Table */}
              <div className="p-6">
                <div className="overflow-x-auto scrollbar-thin">
                  <PlanComparisonTable />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 bg-[var(--glass-panel-bg)]">
                <p className="text-center text-xs text-[var(--text-muted)]">
                  Need help choosing? <Link to="/contact" className="text-primary hover:underline">Contact our sales team</Link>
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
