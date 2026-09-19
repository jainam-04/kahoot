import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Gamepad2, Trophy, Users, Zap, Sparkles, ArrowLeft,
  CheckCircle2, Globe, Shield, Heart, HelpCircle, Play,
  FileSpreadsheet, Camera, BarChart3, Layers, Clock, Award
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ThemeBackground from '../components/ThemeBackground';
import { useTheme } from '../context/ThemeContext';

export default function AboutKahoot() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const pillars = [
    {
      icon: <Zap className="h-6 w-6 text-yellow-400" />,
      title: 'Real-Time Interactive Gameplay',
      desc: 'Transforms standard multiple-choice questions into heart-racing live competitions where accuracy, speed, and streak multipliers ignite energy in any room.'
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: 'Frictionless 6-Digit PIN Join',
      desc: 'Participants join in seconds by entering a 6-digit room PIN or scanning an on-screen QR code from any smartphone, tablet, or browser—no login or app install needed.'
    },
    {
      icon: <Trophy className="h-6 w-6 text-amber-500" />,
      title: 'Live Velocity Scoring & Podium',
      desc: 'Dynamic post-question standings with speed bonuses, tie-breakers, fastest answer highlights, and an electric final 3-tier podium celebration.'
    },
    {
      icon: <Globe className="h-6 w-6 text-emerald-400" />,
      title: 'Classroom LAN & Remote Hosting',
      desc: 'Operates smoothly in school projector setups, corporate seminars, auditoriums, or remote video meetings with local IPv4 auto-detection and cloud support.'
    }
  ];

  const features = [
    { 
      feature: 'Real-Time Multiplayer Sync', 
      detail: 'Ultra low-latency WebSocket communication ensures all participants receive questions and submit answers in perfect synchronization.' 
    },
    { 
      feature: 'Speed-Weighted Scoring', 
      detail: '1,000 base points for correctness plus up to 1,000 velocity bonus points based on millisecond-level response times.' 
    },
    { 
      feature: 'Comprehensive Host Controls', 
      detail: 'Hosts control countdown timers, reveal answer distributions, inspect question analytics, and manage live lobbies.' 
    },
    { 
      feature: 'Multi-Format Report Exports', 
      detail: 'Download complete session results, student scores, and accuracy breakdowns instantly in PDF, Excel (.xlsx), and Word (.docx).' 
    },
    { 
      feature: 'Client-Side QR Scanner', 
      detail: 'Built-in camera scanner decodes room PINs directly in the browser with 100% privacy and zero video streaming to servers.' 
    },
    { 
      feature: 'Custom Backgrounds & Themes', 
      detail: 'Choose from curated high-definition photography presets, custom gradient overlays, and adjustable ambient lighting.' 
    }
  ];

  return (
    <AnimatedPage>
      <ThemeBackground>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-left">
          
          {/* Back to Home Button */}
          <div className="mb-8">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isLight
                  ? 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm'
                  : 'border-white/10 text-gray-300 bg-white/5 hover:bg-white/10'
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Hero Header */}
          <div className="space-y-3 mb-12 pb-8 border-b border-black/10 dark:border-white/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs font-bold text-primary">
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>Interactive Multiplayer Arena</span>
            </div>
            
            <h1 className={`font-outfit text-3xl sm:text-5xl font-extrabold tracking-tight ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary">Quizy</span>
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed max-w-2xl ${
              isLight ? 'text-gray-600' : 'text-gray-400'
            }`}>
              The modern real-time live trivia platform designed to make learning, testing, and team competition thrilling, intuitive, and accessible on any device.
            </p>
          </div>

          {/* Story & What is Quizy */}
          <div className="space-y-8 text-sm leading-relaxed">
            <section className={`p-6 sm:p-8 rounded-2xl border ${
              isLight ? 'bg-white border-gray-200 shadow-sm text-gray-700' : 'glass-panel border-white/5 text-gray-300'
            }`}>
              <h2 className={`font-outfit text-xl sm:text-2xl font-black mb-4 flex items-center gap-2.5 ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}>
                <Sparkles className="h-5 w-5 text-primary shrink-0" />
                What is Quizy?
              </h2>
              <div className="space-y-4 text-xs sm:text-sm">
                <p>
                  <strong>Quizy</strong> is a full-stack, real-time multiplayer quiz application designed for educators, corporate trainers, event organizers, and trivia enthusiasts. It replaces static paper tests and monotonous presentations with dynamic, synchronized live game sessions where every participant actively competes.
                </p>
                <p>
                  With Quizy, hosts can create rich custom quizzes, set configurable countdown timers, choose gorgeous visual wallpaper themes, and launch games instantly using simple 6-digit PINs. Participants join seamlessly from any smartphone, tablet, or laptop browser without needing to download apps or create accounts.
                </p>
              </div>
            </section>

            {/* Core Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {pillars.map((p, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-5 sm:p-6 rounded-2xl border ${
                    isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'glass-panel border-white/5'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 w-fit mb-3.5">
                    {p.icon}
                  </div>
                  <h3 className={`font-outfit font-bold text-base mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {p.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    {p.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* What Makes Quizy Powerful */}
            <section className={`p-6 sm:p-8 rounded-2xl border space-y-5 ${
              isLight ? 'bg-white border-gray-200 shadow-sm' : 'glass-panel border-white/5'
            }`}>
              <h2 className={`font-outfit text-xl sm:text-2xl font-black ${isLight ? 'text-gray-900' : 'text-white'}`}>
                What Makes Quizy Powerful
              </h2>
              <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Engineered with React 19, Node.js, Express, MongoDB, and Socket.IO, Quizy provides high responsiveness, classroom LAN adaptability, and enterprise-grade security:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {features.map((c, i) => (
                  <div key={i} className={`p-3.5 rounded-xl border text-xs ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-800' : 'bg-white/5 border-white/10 text-gray-300'
                  }`}>
                    <div className="font-bold text-primary mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{c.feature}</span>
                    </div>
                    <p className="text-[11px] opacity-90">{c.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Call to Action Banner */}
            <div className={`p-6 rounded-2xl border text-center space-y-4 ${
              isLight
                ? 'bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-200'
                : 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20'
            }`}>
              <h3 className={`font-outfit font-extrabold text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>
                Ready to Host Your First Live Battle?
              </h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                Create an account in seconds, build your 4-option question set, and launch a game PIN for your students or colleagues.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/register"
                  className="btn-premium btn-primary-gradient px-5 py-2.5 text-xs font-black text-white rounded-xl shadow-md cursor-pointer hover:scale-105 transition-all"
                >
                  Get Started for Free
                </Link>
                <Link
                  to="/join"
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    isLight ? 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100' : 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  Join a Game with PIN
                </Link>
              </div>
            </div>

          </div>

        </div>
      </ThemeBackground>
    </AnimatedPage>
  );
}
