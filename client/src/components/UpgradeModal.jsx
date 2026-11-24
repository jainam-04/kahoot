import React, { useEffect } from 'react';
import { Crown, X, Check, Mail, Sparkles } from 'lucide-react';
import PlanComparisonTable from './PlanComparisonTable';

export default function UpgradeModal({ isOpen, onClose }) {
  // Prevent background body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div 
        className="relative my-auto w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 bg-white text-slate-900 text-left overflow-hidden isolate"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 shrink-0 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50/95 via-white to-purple-50/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="p-2 sm:p-2.5 bg-amber-100 text-amber-600 rounded-xl shadow-xs shrink-0">
              <Crown className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-500 text-amber-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                Upgrade to Gubbi Pro
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-tight truncate sm:whitespace-normal">
                Unlock unlimited multiplayer rooms, export reports, and custom trivia sets.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 items-stretch">
            {/* Pro Plan Card */}
            <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#7C3AED] bg-gradient-to-b from-purple-50/60 to-white flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6D28D9] bg-purple-100 px-2.5 py-0.5 rounded-full inline-block">
                    Educator Pro
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Most Popular
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">₹499</span>
                  <span className="text-xs font-semibold text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  Built for classroom teachers, coaching institutes, and active event hosts.
                </p>
                
                <ul className="mt-3.5 sm:mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                    <span>Unlimited quiz creation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                    <span>Unlimited live multiplayer participants</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                    <span>PDF &amp; Excel performance export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                    <span>Priority email support</span>
                  </li>
                </ul>
              </div>

              <a 
                href="mailto:info@fouriseindia.com?subject=Gubbi%20Pro%20Upgrade%20Inquiry"
                className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#6C28FE] to-[#4D1AE0] hover:brightness-105 active:scale-[0.99] text-white text-xs sm:text-sm font-bold text-center shadow-[0_4px_12px_rgba(108,40,254,0.3)] transition-all flex items-center justify-center gap-1.5"
              >
                <Mail className="w-4 h-4 text-white" />
                <span>Contact for Pro Access</span>
              </a>
            </div>

            {/* Plan Comparison Table Section */}
            <div className="p-3.5 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-3 sm:space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full inline-block">
                    Feature Overview
                  </span>
                  <span className="text-[10px] text-slate-400 sm:hidden">
                    Swipe table →
                  </span>
                </div>

                <div className="overflow-x-auto -mx-1 px-1 pb-1">
                  <PlanComparisonTable />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 text-center pt-2 border-t border-slate-200/60 leading-tight">
                Need custom institutional pricing? Email{' '}
                <a 
                  href="mailto:info@fouriseindia.com?subject=Custom%20Institutional%20Pricing%20Inquiry"
                  className="font-bold text-[#6C28FE] hover:underline"
                >
                  info@fouriseindia.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
