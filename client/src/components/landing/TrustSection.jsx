import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Zap, Users, BookOpen, Activity } from 'lucide-react';

const stats = [
  {
    icon: <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />,
    value: '4.9 / 5.0',
    label: 'Rated by Students & Teachers',
    subtext: 'Based on 2,500+ reviews',
  },
  {
    icon: <BookOpen className="h-6 w-6 text-primary" />,
    value: '1,000+',
    label: 'Quizzes Created',
    subtext: 'Across schools & tech squads',
  },
  {
    icon: <Users className="h-6 w-6 text-secondary" />,
    value: '5,000+',
    label: 'Active Players',
    subtext: 'Competing in real-time battles',
  },
  {
    icon: <Activity className="h-6 w-6 text-emerald-400" />,
    value: '99.9%',
    label: 'Uptime SLA',
    subtext: 'Ultra-low latency real-time engine',
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-accent" />,
    value: 'Fast & Secure',
    label: 'Enterprise Grade',
    subtext: '256-bit SSL & JWT security',
  },
];

export default function TrustSection() {
  return (
    <section className="relative py-12 border-y border-slate-200 dark:border-white/5 bg-gradient-to-r from-purple-50/50 via-white to-sky-50/50 dark:from-primary/5 dark:via-background dark:to-secondary/5 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header line */}
        <div className="text-center mb-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 dark:text-gray-400">
            Trusted by Educators, Students & Teams Worldwide
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-200 dark:border-white/10 flex flex-col items-center text-center gap-2.5 relative group bg-white/90 dark:bg-transparent shadow-sm"
            >
              <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <h3 className="font-outfit text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </h3>
              <p className="text-xs font-bold text-slate-800 dark:text-gray-200">
                {stat.label}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-gray-400 font-medium">
                {stat.subtext}
              </span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
