import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Sparkles, Shield, Smartphone, Layers, CheckCircle2, Award, Clock } from 'lucide-react';

const benefits = [
  {
    icon: <Zap className="h-5 w-5 text-yellow-400" />,
    title: 'Lightning Fast',
    desc: 'Real-time WebSocket engine with under 50ms response latency globally.',
  },
  {
    icon: <Sparkles className="h-5 w-5 text-primary" />,
    title: 'Easy to Use',
    desc: 'Intuitive interface allowing hosts to launch quizzes in under 60 seconds.',
  },
  {
    icon: <Layers className="h-5 w-5 text-secondary" />,
    title: 'Modern Interface',
    desc: 'Glassmorphic design system crafted for visual excellence and high engagement.',
  },
  {
    icon: <Smartphone className="h-5 w-5 text-accent" />,
    title: 'Works on Mobile',
    desc: 'Fully responsive on smartphones, tablets, laptops, and smart TVs.',
  },
  {
    icon: <Clock className="h-5 w-5 text-emerald-400" />,
    title: 'No Installation',
    desc: '100% web-based. Zero software downloads or app installations required.',
  },
  {
    icon: <Award className="h-5 w-5 text-yellow-400" />,
    title: 'Instant Results',
    desc: 'Automated evaluation, live podium ranks, and downloadable reports.',
  },
  {
    icon: <Shield className="h-5 w-5 text-primary" />,
    title: 'Secure & Reliable',
    desc: 'Encrypted user data, JWT session validation, and 99.9% uptime SLA.',
  },
  {
    icon: <Sparkles className="h-5 w-5 text-secondary" />,
    title: 'Scalable Architecture',
    desc: 'Easily handles classroom groups of 10 to massive corporate arenas of 1,000+.',
  },
];

export default function WhyChooseSection() {
  return (
    <section id="why-choose" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 scroll-mt-20">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Visual Illustration Glass Graphic */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 relative"
        >
          <div className="glass-panel rounded-3xl p-8 border border-slate-200 dark:border-white/15 relative overflow-hidden bg-gradient-to-br from-purple-50/90 via-white to-sky-50/80 dark:from-primary/10 dark:via-black/80 dark:to-secondary/10 shadow-xl">
            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />

            <span className="text-xs font-black uppercase text-secondary tracking-widest block mb-2">
              Why Professionals Choose Us
            </span>
            <h3 className="font-outfit text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-6">
              Built for Speed, Loved by Champion Hosts
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black">
                  99%
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Student Engagement Rate</h4>
                  <p className="text-[11px] text-slate-600 dark:text-gray-400">Interactive live battles prevent distraction</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary font-black">
                  &lt;1m
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Average Setup Time</h4>
                  <p className="text-[11px] text-slate-600 dark:text-gray-400">Launch a live battle session effortlessly</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black">
                  100%
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Web Browser Compatibility</h4>
                  <p className="text-[11px] text-slate-600 dark:text-gray-400">No app installs needed for players</p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Right Side: Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-7 space-y-6 text-left"
        >
          <div>
            <span className="rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-wider">
              Superior Architecture
            </span>
            <h2 className="font-outfit text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
              Why <span className="text-gradient-primary">QuizForge</span> Beats Traditional Quiz Apps
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
              Designed from the ground up for seamless real-time performance, modern aesthetic appeal, and zero setup friction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="glass-panel glass-panel-hover rounded-2xl p-4 border border-slate-200 dark:border-white/10 flex items-start gap-3.5 bg-white/90 dark:bg-transparent shadow-sm"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="font-outfit text-sm font-extrabold text-slate-900 dark:text-white">
                    {benefit.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed mt-1">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

    </section>
  );
}
