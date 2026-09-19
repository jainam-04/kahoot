import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import QuickRegisterModal from '../QuickRegisterModal';

export default function CTASection() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <section id="cta" className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden glass-panel border border-primary/30 p-8 sm:p-14 text-center bg-gradient-to-b from-purple-100/90 via-white to-sky-100/80 dark:from-primary/20 dark:via-slate-950 dark:to-black shadow-2xl"
      >
        <div className="absolute top-0 right-0 h-64 w-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-secondary animate-pulse" />
            <span>Ready to Transform Your Quizzes?</span>
          </div>

          <h2 className="font-outfit text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Start Hosting Live Quizzes <br className="hidden sm:inline" />
            <span className="text-gradient-primary">in Under 60 Seconds</span>
          </h2>

          <p className="text-xs sm:text-base text-slate-700 dark:text-gray-300 font-medium leading-relaxed">
            Join thousands of educators, hosts, and teams building interactive real-time multiplayer quizzes on Quiz Hub today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="btn-premium btn-primary-gradient px-8 py-4 text-sm sm:text-base font-extrabold text-white rounded-2xl shadow-premium-glow flex items-center justify-center gap-2.5 w-full sm:w-auto hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Get Started for Free</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <Link
              to="/join"
              className="btn-premium btn-secondary-gradient px-8 py-4 text-sm sm:text-base font-extrabold text-white rounded-2xl shadow-secondary-glow flex items-center justify-center gap-2.5 w-full sm:w-auto hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="h-4 w-4 fill-current text-secondary" />
              <span>Join Game with PIN</span>
            </Link>
          </div>
        </div>
      </motion.div>

      <QuickRegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </section>
  );
}
