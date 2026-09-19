import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Gamepad2, Trophy, Zap, ArrowRight } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Join or Create a Quiz',
    icon: <PlusCircle className="h-6 w-6 text-primary" />,
    desc: 'Host your own customized battle room or join instantly with a 6-digit Game PIN.',
    badge: 'Step 1',
    color: 'from-primary/20 to-primary/5',
  },
  {
    step: '02',
    title: 'Answer Questions',
    icon: <Gamepad2 className="h-6 w-6 text-secondary" />,
    desc: 'Respond in real-time on any device before the countdown timer runs out.',
    badge: 'Step 2',
    color: 'from-secondary/20 to-secondary/5',
  },
  {
    step: '03',
    title: 'Earn Points',
    icon: <Zap className="h-6 w-6 text-amber-400" />,
    desc: 'Rack up higher points for accuracy, answer speed, and answer streaks.',
    badge: 'Step 3',
    color: 'from-amber-500/20 to-amber-500/5',
  },
  {
    step: '04',
    title: 'Compete on Leaderboard',
    icon: <Trophy className="h-6 w-6 text-emerald-400" />,
    desc: 'Watch real-time rank changes and celebrate podium champions on the live screen.',
    badge: 'Step 4',
    color: 'from-emerald-500/20 to-emerald-500/5',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20 scroll-mt-20">
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[700px] rounded-full bg-primary/10 blur-[140px] pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 sm:mb-16"
      >
        <span className="rounded-full bg-secondary/10 border border-secondary/20 px-4 py-1.5 text-xs font-bold text-secondary uppercase tracking-wider">
          4-Step Process
        </span>
        <h2 className="font-outfit text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-4 tracking-tight">
          How <span className="text-gradient-primary">Quiz Hub</span> Works
        </h2>
        <p className="mt-3 text-xs sm:text-base text-slate-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
          From lobby countdown to live podium glory — join multiplayer quiz battles in seconds.
        </p>
      </motion.div>

      {/* 4-Step Horizontal Timeline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
        {steps.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-200 dark:border-white/10 flex flex-col justify-between relative group text-left h-full bg-white/90 dark:bg-transparent shadow-sm"
          >
            <div>
              {/* Step Badge & Number */}
              <div className="flex items-center justify-between mb-5">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="font-outfit text-2xl font-black text-slate-300 dark:text-white/30 group-hover:text-primary transition-colors">
                  {item.step}
                </span>
              </div>

              <span className="text-[10px] font-extrabold uppercase text-primary bg-primary/10 px-2.5 py-0.5 rounded-full inline-block mb-3 border border-primary/20">
                {item.badge}
              </span>

              <h3 className="font-outfit text-lg font-extrabold text-slate-900 dark:text-white mb-2 leading-snug">
                {item.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </div>

            {/* Subtle arrow indicator for steps 1-3 on desktop */}
            {idx < steps.length - 1 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-300 dark:text-white/20 group-hover:text-primary transition-colors">
                <ArrowRight className="h-5 w-5" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

    </section>
  );
}
