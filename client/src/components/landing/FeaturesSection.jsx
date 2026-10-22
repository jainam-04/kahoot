import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Trophy, Timer, Zap, BarChart3, LayoutDashboard } from 'lucide-react';

const coreFeatures = [
  {
    icon: <Radio className="h-5 w-5 text-primary" />,
    title: 'Real-time Multiplayer',
    desc: 'Battle live with unlimited players in synchronized real-time WebSocket sessions.',
    badge: 'Live Sync',
  },
  {
    icon: <Trophy className="h-5 w-5 text-yellow-400" />,
    title: 'Instant Leaderboards',
    desc: 'Track global & session player rankings in real-time as points accumulate.',
    badge: 'Real-Time',
  },
  {
    icon: <Timer className="h-5 w-5 text-accent" />,
    title: 'Question Timer',
    desc: 'Customizable countdown timers per question to keep players focused and fast.',
    badge: 'Configurable',
  },
  {
    icon: <Zap className="h-5 w-5 text-secondary" />,
    title: 'Live Results',
    desc: 'Get instant feedback on answer accuracy the second each question ends.',
    badge: 'Instant',
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-emerald-400" />,
    title: 'Quiz Analytics',
    desc: 'Deep-dive metrics on accuracy, completion rates, and player performance.',
    badge: 'Analytics',
  },
  {
    icon: <LayoutDashboard className="h-5 w-5 text-primary" />,
    title: 'Host Dashboard',
    desc: 'Full control center to manage quizzes, view battle history, and launch games.',
    badge: 'Host Control',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-12 scroll-mt-20">
      
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 sm:mb-16"
      >
        <span className="rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-wider">
          Core Features
        </span>
        <h2 className="font-outfit text-2xl sm:text-5xl font-black mt-3 sm:mt-4 tracking-tight" style={{ color: 'var(--text-heading)' }}>
          Everything You Need to <span className="text-gradient-primary">Engage & Conquer</span>
        </h2>
        <p className="mt-2 sm:mt-4 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Gubbi comes packed with core features for teachers, quizmasters, and trivia hosts.
        </p>
      </motion.div>

      {/* Grid of 6 Cards */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {coreFeatures.map((feat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="glass-panel glass-panel-hover rounded-2xl p-5 sm:p-6 flex flex-col justify-between border relative group overflow-hidden"
            style={{ borderColor: 'var(--glass-panel-border)' }}
          >
            {/* Top gradient glow line on hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/40 group-hover:scale-105 transition-all">
                  {feat.icon}
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10" style={{ color: 'var(--text-muted)' }}>
                  {feat.badge}
                </span>
              </div>

              <h3 className="font-outfit text-base sm:text-lg font-extrabold group-hover:text-primary transition-colors" style={{ color: 'var(--text-heading)' }}>
                {feat.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {feat.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
}
