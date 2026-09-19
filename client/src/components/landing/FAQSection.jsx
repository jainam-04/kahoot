import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'How do students join a live quiz game?',
    a: 'Students simply navigate to QuizForge and enter the 6-digit Game PIN provided by the host, or scan the generated QR code on screen. No account creation or app installation is required for players!',
  },
  {
    q: 'Is QuizForge completely free to use?',
    a: 'Yes! QuizForge offers a robust Free Forever plan that includes creating up to 5 custom quizzes, hosting up to 20 live participants, and real-time leaderboards. You can upgrade to Pro anytime for unlimited players.',
  },
  {
    q: 'Can I host unlimited live quizzes?',
    a: 'On our Pro and Enterprise plans, hosts enjoy unlimited quiz creation and unlimited participant hosting with zero restrictions.',
  },
  {
    q: 'Does QuizForge work on mobile devices and tablets?',
    a: 'Absolutely! QuizForge is 100% web-based and fully responsive. Players can join and answer questions seamlessly on any smartphone, tablet, laptop, or desktop browser.',
  },
  {
    q: 'Can schools and educational institutions purchase subscriptions?',
    a: 'Yes! Our Enterprise plan is built for institutions with multi-teacher management, central admin dashboards, LMS integration, and custom invoicing options.',
  },
  {
    q: 'Is payment and user data secure?',
    a: 'Security is our top priority. All user data, credentials, and payment processing are encrypted using enterprise 256-bit SSL protocols and secure JWT authentication.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 scroll-mt-20">
      
      {/* Glow */}
      <div className="absolute top-1/3 right-10 h-72 w-72 rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <span className="rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-wider">
          Got Questions?
        </span>
        <h2 className="font-outfit text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
          Frequently Asked <span className="text-gradient-primary">Questions</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-gray-400">
          Everything you need to know about hosting and playing on QuizForge.
        </p>
      </motion.div>

      {/* Accordion List */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden text-left bg-white/90 dark:bg-transparent shadow-sm"
            >
              <button
                onClick={() => toggleAccordion(idx)}
                className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left font-outfit text-base sm:text-lg font-extrabold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-secondary shrink-0" />
                  <span>{faq.q}</span>
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-400 dark:text-gray-400 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 sm:p-6 pt-0 text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed border-t border-slate-200 dark:border-white/5">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

    </section>
  );
}
