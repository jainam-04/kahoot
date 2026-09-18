import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, ChevronDown, Search, ArrowLeft,
  Sparkles, Users, Zap, Shield, Play
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ThemeBackground from '../components/ThemeBackground';
import { useTheme } from '../context/ThemeContext';

export default function FAQPage() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'gameplay', label: 'Live Gameplay & PIN' },
    { id: 'quizzes', label: 'Creating Quizzes' },
    { id: 'billing', label: 'Plans & Accounts' }
  ];

  const allFaqs = [
    {
      category: 'gameplay',
      q: 'How do players join a live quiz game?',
      a: 'Players simply go to Quizzy (/join) and enter the 6-digit Game PIN displayed on the host screen, or scan the on-screen QR code using their phone camera. No app download or account creation is required!'
    },
    {
      category: 'gameplay',
      q: 'How does the scoring and leaderboard system work?',
      a: 'Scores are calculated using a Kahoot-inspired formula: 1,000 base points for answering correctly, plus up to 1,000 bonus velocity points based on how quickly the answer was submitted before the timer expires. Ties are automatically broken by accuracy, total response time, and join order.'
    },
    {
      category: 'gameplay',
      q: 'Can players join from different networks or phones?',
      a: 'Yes! QuizForge works across any smartphone, tablet, laptop, or desktop browser. For local classroom sessions, the host lobby automatically resolves the host LAN IP. For remote video sessions, hosts can use our built-in tunneling (ngrok/localtunnel) or cloud deployment.'
    },
    {
      category: 'quizzes',
      q: 'What types of questions can I create?',
      a: 'QuizForge supports 4-option multiple-choice questions with configurable countdown timers (from 10 to 120 seconds), custom category tagging, organization branding, and customizable visual backgrounds.'
    },
    {
      category: 'quizzes',
      q: 'Can I customize quiz backgrounds and themes?',
      a: 'Yes! Using our Background Picker, you can choose from curated photography presets, apply custom gradient overlays, adjust blur and brightness, or upload your own wallpaper URLs.'
    },
    {
      category: 'quizzes',
      q: 'Can I export game results and student performance?',
      a: 'Yes! After any live session, hosts can view deep performance analytics and download complete reports in PDF, Excel (.xlsx), and Microsoft Word (.docx) formats.'
    },
    {
      category: 'billing',
      q: 'Is QuizForge free to use?',
      a: 'Yes! QuizForge provides a generous Free Forever tier that lets you create quizzes and host live rooms without any time limits or credit card requirements.'
    },
    {
      category: 'billing',
      q: 'What is your refund policy for paid plans?',
      a: 'We offer a 14-day 100% money-back guarantee for first-time upgrades to Pro or Enterprise plans. If you are not satisfied, email billing@quizzy.com within 14 days for a full refund.'
    },
    {
      category: 'billing',
      q: 'Can I permanently delete my account and data?',
      a: 'Yes! In line with privacy regulations, hosts can permanently delete their account at any time from Dashboard > Host Profile > Delete Account by entering their password. This permanently cascades and purges all created quizzes, hosted rooms, and analytics results.'
    },
    {
      category: 'gameplay',
      q: 'What happens if a player disconnects during a live quiz?',
      a: 'The player can simply re-enter the 6-digit PIN and their exact nickname. Our Socket.IO room manager will reconnect them to their existing player record with their previous score preserved.'
    }
  ];

  const filteredFaqs = allFaqs.filter((f) => {
    const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
    const matchesSearch = f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AnimatedPage>
      <ThemeBackground>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-left">
          
          {/* Back Navigation */}
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
          <div className="space-y-3 mb-10 pb-8 border-b border-black/10 dark:border-white/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs font-bold text-primary">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Knowledge Base & Support</span>
            </div>
            
            <h1 className={`font-outfit text-3xl sm:text-5xl font-extrabold tracking-tight ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              Frequently Asked <span className="text-gradient-primary">Questions</span>
            </h1>

            <p className={`text-sm leading-relaxed max-w-2xl ${
              isLight ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Find instant answers regarding hosting live games, scoring rules, student privacy, and account settings.
            </p>

            {/* Search Input */}
            <div className="pt-4 relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. PIN, scoring, refund, delete)..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all outline-none ${
                  isLight
                    ? 'border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900'
                    : 'border-white/10 bg-white/5 focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 text-white'
                }`}
              />
            </div>

            {/* Category Filter Pills */}
            <div className="pt-3 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-primary text-white shadow-sm'
                      : isLight
                        ? 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        : 'border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion FAQ List */}
          <div className="space-y-3.5">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`rounded-2xl border overflow-hidden transition-all ${
                      isOpen
                        ? isLight
                          ? 'bg-white border-primary/40 shadow-md ring-1 ring-primary/20'
                          : 'glass-panel border-primary/40 shadow-lg ring-1 ring-primary/30'
                        : isLight
                          ? 'bg-white border-gray-200/80 hover:border-gray-300'
                          : 'glass-panel border-white/5 hover:border-white/15'
                    }`}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                      className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer transition-colors"
                    >
                      <span className={`font-outfit font-bold text-sm sm:text-base pr-4 ${
                        isOpen
                          ? 'text-primary'
                          : isLight ? 'text-gray-900' : 'text-white'
                      }`}>
                        {faq.q}
                      </span>
                      <div className={`p-1.5 rounded-lg shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 bg-primary/10 text-primary' : 'text-gray-400'
                      }`}>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className={`px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm leading-relaxed border-t ${
                            isLight ? 'border-gray-100 text-gray-600' : 'border-white/5 text-gray-300'
                          }`}>
                            <p className="pt-3">{faq.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted text-sm">
                No questions found matching "{searchQuery}". Try a different keyword.
              </div>
            )}
          </div>

          {/* Bottom Still Need Help Callout */}
          <div className={`mt-12 p-6 sm:p-8 rounded-2xl border text-center space-y-3 ${
            isLight ? 'bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-100' : 'glass-panel border-white/5'
          }`}>
            <h3 className={`font-outfit font-extrabold text-base sm:text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Still Have a Question?
            </h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              Can't find the answer you're looking for? Our team is available 24/7 to assist educators, hosts, and developers.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <a
                href="mailto:support@quizzy.com"
                className="btn-premium btn-primary-gradient px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer"
              >
                Email Support Team
              </a>
              <Link
                to="/about"
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                  isLight ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                About Platform
              </Link>
            </div>
          </div>

        </div>
      </ThemeBackground>
    </AnimatedPage>
  );
}
