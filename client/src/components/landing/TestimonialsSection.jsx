import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    name: 'Aarav Sharma',
    role: 'Physics Educator & School Lead',
    avatar: 'A',
    rating: 5,
    text: 'QuizForge completely revolutionized my classroom quizzes. The live real-time leaderboard keeps every student 100% engaged and excited to participate every week!',
  },
  {
    name: 'Priya Patel',
    role: 'Corporate L&D Trainer',
    avatar: 'P',
    rating: 5,
    text: 'We host weekly trivia battles for 300+ remote employees across continents. QuizForge handles real-time synchronization flawlessly without a single hitch.',
  },
  {
    name: 'Rohan Mehta',
    role: 'Computer Science Student',
    avatar: 'R',
    rating: 5,
    text: 'Best Kahoot alternative hands down! Joining with a PIN or QR code takes literally 3 seconds. The live countdown timer and podium results make it super competitive.',
  },
  {
    name: 'Sneha Reddy',
    role: 'University Quiz Club President',
    avatar: 'S',
    rating: 5,
    text: 'Creating custom quizzes with question timers and image questions is effortless. The dark glassmorphism interface looks so slick on projector screens!',
  },
  {
    name: 'Karan Verma',
    role: 'EdTech Event Organizer',
    avatar: 'K',
    rating: 5,
    text: 'We ran a national trivia tournament with 1,000+ simultaneous participants. The PDF analytics reports allowed us to distribute rankings instantly after the event.',
  },
  {
    name: 'Ananya Iyer',
    role: 'High School Teacher',
    avatar: 'A',
    rating: 5,
    text: 'The host control dashboard is incredibly intuitive. My students request QuizForge battles at the end of every lecture now!',
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  return (
    <section id="testimonials" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 scroll-mt-20">
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/10 blur-[130px] pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <span className="rounded-full bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">
          Community Feedback
        </span>
        <h2 className="font-outfit text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
          Loved by <span className="text-gradient-primary">Teachers & Champion Players</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-gray-400 max-w-xl mx-auto">
          See why thousands of educators, corporate squads, and trivia lovers choose QuizForge.
        </p>
      </motion.div>

      {/* Testimonials Carousel Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {reviews.map((review, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className={`glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col justify-between border relative group text-left bg-white/90 dark:bg-transparent shadow-sm ${
              idx === currentIndex ? 'border-primary/50 shadow-xl shadow-primary/10' : 'border-slate-200 dark:border-white/10'
            }`}
          >
            <Quote className="absolute top-6 right-6 h-8 w-8 text-slate-300 dark:text-white/5 group-hover:text-primary/20 transition-colors" />

            <div>
              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed italic mb-6">
                "{review.text}"
              </p>
            </div>

            {/* Author Profile */}
            <div className="flex items-center gap-3 border-t border-slate-200 dark:border-white/10 pt-4">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-outfit font-black text-base text-white shadow-md">
                {review.avatar}
              </div>
              <div>
                <h4 className="font-outfit text-sm font-extrabold text-slate-900 dark:text-white">
                  {review.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 font-semibold">
                  {review.role}
                </p>
              </div>
            </div>

          </motion.div>
        ))}
      </div>

    </section>
  );
}
