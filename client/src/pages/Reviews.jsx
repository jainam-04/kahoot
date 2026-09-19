import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Quote, MessageSquare } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ThemeBackground from '../components/ThemeBackground';
import { useTheme } from '../context/ThemeContext';

const reviews = [
  {
    name: 'Aarav Sharma',
    role: 'Educator',
    rating: 5,
    text: 'Quizzy transformed my classroom sessions. The real-time multiplayer mode keeps every student engaged and excited to participate.',
  },
  {
    name: 'Priya Patel',
    role: 'Corporate Trainer',
    rating: 5,
    text: 'I use Quizzy for team-building trivia nights. The live leaderboard adds a competitive spark that everyone loves.',
  },
  {
    name: 'Rohan Mehta',
    role: 'Student',
    rating: 4,
    text: 'Joining a game with a code is super quick. The instant results and leaderboard make every quiz feel like a real competition.',
  },
  {
    name: 'Sneha Reddy',
    role: 'Quiz Host',
    rating: 5,
    text: 'Creating custom quizzes is effortless. The interface is clean, responsive, and the animations make it feel premium.',
  },
  {
    name: 'Karan Verma',
    role: 'Event Organizer',
    rating: 5,
    text: 'We hosted a 200-player trivia event and Quizzy handled it flawlessly. Secure auth and smooth gameplay throughout.',
  },
  {
    name: 'Ananya Iyer',
    role: 'Teacher',
    rating: 4,
    text: 'The waiting room and host controls are intuitive. My students ask for quiz battles every week now!',
  },
];

export default function Reviews() {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  return (
    <AnimatedPage>
      <ThemeBackground>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-left">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/10 dark:border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isLight
                    ? 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm'
                    : 'border-white/10 text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white'
                }`}
                aria-label="Back"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>
              <div>
                <h1 className={`font-outfit text-3xl sm:text-4xl font-extrabold tracking-tight ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>
                  Community <span className="text-gradient-primary">Reviews</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  See what educators, corporate trainers, and quiz hosts say about Quizzy.
                </p>
              </div>
            </div>

            <Link
              to="/"
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                isLight ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              Back to Home
            </Link>
          </div>

          {/* REVIEWS GRID */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`rounded-2xl p-6 flex flex-col justify-between gap-4 border transition-all relative overflow-hidden ${
                  isLight
                    ? 'bg-white border-gray-200/80 shadow-sm hover:border-primary/40 hover:shadow-md'
                    : 'glass-panel border-white/5 hover:border-primary/30 shadow-md'
                }`}
              >
                <Quote className={`absolute top-5 right-5 h-8 w-8 pointer-events-none ${
                  isLight ? 'text-primary/10' : 'text-white/5'
                }`} />
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-extrabold text-sm text-white shadow-sm">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        {review.name}
                      </h4>
                      <span className="text-[10px] font-semibold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">
                        {review.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : isLight ? 'text-gray-300' : 'text-gray-600'}`}
                      />
                    ))}
                  </div>

                  <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                    "{review.text}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* EMPTY STATE FALLBACK */}
          {reviews.length === 0 && (
            <div className={`rounded-3xl p-16 text-center space-y-4 max-w-lg mx-auto border ${
              isLight ? 'bg-white border-gray-200 shadow-sm' : 'glass-panel border-white/5'
            }`}>
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className={`font-outfit text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                No Reviews Yet
              </h3>
              <p className="text-xs text-muted max-w-[280px] mx-auto leading-relaxed">
                Be the first to share your experience with Quizzy!
              </p>
              <Link to="/dashboard" className="inline-flex btn-premium btn-primary-gradient px-4 py-2.5 text-xs font-bold text-white">
                Back to Dashboard
              </Link>
            </div>
          )}

        </div>
      </ThemeBackground>
    </AnimatedPage>
  );
}