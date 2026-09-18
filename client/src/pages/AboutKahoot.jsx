import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Gamepad2, Trophy, Users, Zap, Sparkles, ArrowLeft,
  CheckCircle2, Globe, Shield, Heart, HelpCircle, Play
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
      title: 'Game-Based Learning',
      desc: 'Transforms traditional multiple-choice questions into heart-racing competitions where speed, accuracy, and streak multipliers turn learning into play.'
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: 'Frictionless Joining',
      desc: 'Participants join in seconds by entering a 6-digit room PIN or scanning an on-screen QR code from any smartphone, tablet, or browser—no login or app install needed.'
    },
    {
      icon: <Trophy className="h-6 w-6 text-amber-500" />,
      title: 'Live Dynamic Leaderboards',
      desc: 'Instant post-question standings with velocity bonuses, tie-breakers, fastest solver highlights, and an electric final podium finish.'
    },
    {
      icon: <Globe className="h-6 w-6 text-emerald-400" />,
      title: 'Local & Remote Flexibility',
      desc: 'Runs effortlessly in classroom projector setups, auditorium seminars, corporate all-hands, or remote video conferences with LAN auto-detection and tunneling.'
    }
  ];

  const comparisons = [
    { feature: 'Multiplayer Participation', detail: 'Real-time WebSocket room synchronization using 6-digit Game PINs.' },
    { feature: 'Kahoot-Style Scoring', detail: 'Base points for correct answers plus velocity-weighted time bonuses.' },
    { feature: 'Host Control Suite', detail: 'Host controls question progression, displays answer distributions, and reviews leaderboards.' },
    { feature: 'Instant Reports & Exports', detail: 'Detailed student analytics downloadable in PDF, Excel, and Word documents.' },
    { feature: 'Built-in QR Scanner', detail: 'Camera scanner decodes game PINs instantly without manual typing.' },
    { feature: 'Theme Customization', detail: 'Custom category styling, wallpaper presets, blur, brightness, and ambient lighting.' }
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

          {/* Header */}
          <div className="space-y-3 mb-12 pb-8 border-b border-black/10 dark:border-white/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs font-bold text-primary">
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>The Kahoot Phenomenon & QuizForge</span>
            </div>
            
            <h1 className={`font-outfit text-3xl sm:text-5xl font-extrabold tracking-tight ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              About Kahoot & <span className="text-gradient-primary">QuizForge</span>
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed max-w-2xl ${
              isLight ? 'text-gray-600' : 'text-gray-400'
            }`}>
              How the revolutionary concept of gamified classroom trivia inspired our full-stack real-time multiplayer arena.
            </p>
          </div>

          {/* Story & Philosophy */}
          <div className="space-y-8 text-sm leading-relaxed">
            <section className={`p-6 sm:p-8 rounded-2xl border ${
              isLight ? 'bg-white border-gray-200 shadow-sm text-gray-700' : 'glass-panel border-white/5 text-gray-300'
            }`}>
              <h2 className={`font-outfit text-xl sm:text-2xl font-black mb-4 flex items-center gap-2.5 ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}>
                <Sparkles className="h-5 w-5 text-primary shrink-0" />
                What Makes Kahoot-Style Trivia Legendary?
              </h2>
              <div className="space-y-4 text-xs sm:text-sm">
                <p>
                  <strong>Kahoot!</strong> pioneered an educational revolution in 2013 by reimagining the quiz not as an anxious evaluation tool, but as a celebratory, shared game show. It replaced silent paper quizzes with high-energy music, colorful geometric shapes, rapid countdown timers, and an arena where every student actively participates at the exact same moment.
                </p>
                <p>
                  Research consistently shows that gamified learning stimulates dopamine release, enhances cognitive retention, and prompts <em>active recall</em>—transforming passive listeners into eager participants who lean forward to beat the buzzer.
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

            {/* How QuizForge Implements It */}
            <section className={`p-6 sm:p-8 rounded-2xl border space-y-5 ${
              isLight ? 'bg-white border-gray-200 shadow-sm' : 'glass-panel border-white/5'
            }`}>
              <h2 className={`font-outfit text-xl sm:text-2xl font-black ${isLight ? 'text-gray-900' : 'text-white'}`}>
                How QuizForge Brings Kahoot to Life
              </h2>
              <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Built with the modern MERN stack (MongoDB, Express, React 19, Node.js) and Socket.IO, QuizForge delivers sub-second response times, LAN classroom auto-discovery, and comprehensive post-match analytics:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {comparisons.map((c, i) => (
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

            {/* CTA */}
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
                  className="btn-premium btn-primary-gradient px-5 py-2.5 text-xs font-black text-white rounded-xl shadow-md"
                >
                  Get Started for Free
                </Link>
                <Link
                  to="/join"
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
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
