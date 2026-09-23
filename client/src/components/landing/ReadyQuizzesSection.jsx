import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Sparkles, BookOpen, Clock, Award, Shield, Check, 
  HelpCircle, ChevronRight, Zap, Flame, Globe, Cpu, Hash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listQuizzes, createQuiz } from '../../services/quizService';
import { createGame } from '../../services/gameService';
import { useTheme } from '../../context/ThemeContext';

export default function ReadyQuizzesSection() {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [activeCategory, setActiveCategory] = useState('All');
  const [dbQuizzes, setDbQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hostingId, setHostingId] = useState(null);

  // High-quality predefined sample quizzes ready for instant host/use
  const predefinedQuizzes = [
    {
      _id: 'preset_science_01',
      isPreset: true,
      title: 'General Science & Nature Master Challenge',
      description: 'Test your knowledge on physics, chemistry, biology, and the natural cosmos with 10 engaging trivia questions.',
      category: 'science',
      difficulty: 'Medium',
      questionsCount: 10,
      timeLimit: 20,
      gradient: 'from-emerald-500 to-teal-600',
      icon: Flame,
      questions: [
        { questionText: 'What is the chemical symbol for Gold?', options: ['Gd', 'Au', 'Ag', 'Go'], correctAnswer: 1, timeLimit: 20 },
        { questionText: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 1, timeLimit: 20 },
        { questionText: 'What power house organelle generates ATP in cells?', options: ['Ribosome', 'Mitochondria', 'Nucleus', 'Golgi apparatus'], correctAnswer: 1, timeLimit: 20 },
        { questionText: 'What gas do plants absorb during photosynthesis?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Helium'], correctAnswer: 1, timeLimit: 20 },
        { questionText: 'What is the speed of light in vacuum approximately?', options: ['300,000 km/s', '150,000 km/s', '1,000,000 km/s', '50,000 km/s'], correctAnswer: 0, timeLimit: 20 }
      ]
    },
    {
      _id: 'preset_gk_02',
      isPreset: true,
      title: 'World Geography & Cultural Trivia',
      description: 'Explore world capitals, oceans, landmark monuments, and global geography in this fast-paced quiz arena.',
      category: 'general knowledge',
      difficulty: 'Easy',
      questionsCount: 10,
      timeLimit: 20,
      gradient: 'from-blue-500 to-indigo-600',
      icon: Globe,
      questions: [
        { questionText: 'Which is the largest ocean on Earth?', options: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'], correctAnswer: 2, timeLimit: 20 },
        { questionText: 'What is the capital city of Japan?', options: ['Kyoto', 'Tokyo', 'Osaka', 'Hiroshima'], correctAnswer: 1, timeLimit: 20 },
        { questionText: 'Which country has the longest coastline in the world?', options: ['Russia', 'Australia', 'Canada', 'USA'], correctAnswer: 2, timeLimit: 20 },
        { questionText: 'What is the smallest continent by land area?', options: ['Europe', 'Antarctica', 'Australia', 'South America'], correctAnswer: 2, timeLimit: 20 }
      ]
    },
    {
      _id: 'preset_tech_03',
      isPreset: true,
      title: 'Full-Stack Web Dev & Tech Quiz',
      description: 'Challenge your team on JavaScript ES6+, React, Node.js, REST APIs, and database fundamentals.',
      category: 'programming',
      difficulty: 'Hard',
      questionsCount: 8,
      timeLimit: 25,
      gradient: 'from-purple-500 to-indigo-600',
      icon: Cpu,
      questions: [
        { questionText: 'Which keyword creates an unassignable constant variable in JS?', options: ['var', 'let', 'const', 'static'], correctAnswer: 2, timeLimit: 20 },
        { questionText: 'What does API stand for in software engineering?', options: ['Application Programming Interface', 'Automated Program Integration', 'Applied Protocol Interface', 'App Processing Instruction'], correctAnswer: 0, timeLimit: 20 },
        { questionText: 'Which database type is MongoDB classified under?', options: ['Relational SQL', 'Document NoSQL', 'Graph Database', 'Key-Value Memory'], correctAnswer: 1, timeLimit: 20 }
      ]
    },
    {
      _id: 'preset_math_04',
      isPreset: true,
      title: 'Mental Math & Logical Aptitude Blitz',
      description: 'Sharpen analytical thinking with mental arithmetic, pattern recognition, and logical speed questions.',
      category: 'mathematics',
      difficulty: 'Medium',
      questionsCount: 10,
      timeLimit: 15,
      gradient: 'from-amber-500 to-orange-600',
      icon: Hash,
      questions: [
        { questionText: 'What is the square root of 144?', options: ['10', '11', '12', '14'], correctAnswer: 2, timeLimit: 15 },
        { questionText: 'Solve: 7 x 8 - 12 = ?', options: ['44', '56', '42', '48'], correctAnswer: 0, timeLimit: 15 },
        { questionText: 'What prime number immediately follows 19?', options: ['21', '23', '25', '29'], correctAnswer: 1, timeLimit: 15 }
      ]
    }
  ];

  useEffect(() => {
    const fetchPublicQuizzes = async () => {
      try {
        const data = await listQuizzes();
        if (data.success && data.quizzes && data.quizzes.length > 0) {
          const formatted = data.quizzes.map(q => ({
            _id: q._id,
            isPreset: false,
            title: q.title,
            description: q.description || 'Predefined community quiz hosted live on QuizForge.',
            category: q.category || 'general knowledge',
            difficulty: 'Medium',
            questionsCount: q.questions ? q.questions.length : (q.questionsCount || 10),
            gradient: 'from-violet-600 to-pink-600',
            icon: Sparkles
          }));
          setDbQuizzes(formatted);
        }
      } catch (err) {
        console.warn('Using predefined ready quizzes fallback');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicQuizzes();
  }, []);

  // Merge database quizzes with predefined quizzes
  const allQuizzes = [...dbQuizzes, ...predefinedQuizzes];

  const categories = ['All', 'Science', 'General Knowledge', 'Programming', 'Mathematics'];

  const filteredQuizzes = activeCategory === 'All'
    ? allQuizzes
    : allQuizzes.filter(q => q.category.toLowerCase().includes(activeCategory.toLowerCase()));

  // Action: Launch / Host Quiz
  const handleUseQuiz = async (quiz) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in or register to host a live quiz!');
      navigate('/login');
      return;
    }

    setHostingId(quiz._id);
    toast.loading('Initializing live quiz lobby...', { id: 'use-quiz' });

    try {
      let targetQuizId = quiz._id;

      // If it's a predefined preset, save a copy under host's account first
      if (quiz.isPreset) {
        const createRes = await createQuiz({
          title: quiz.title,
          category: quiz.category,
          description: quiz.description,
          questions: quiz.questions
        });
        if (createRes.success && createRes.quiz) {
          targetQuizId = createRes.quiz._id;
        } else {
          toast.error('Failed to clone ready quiz', { id: 'use-quiz' });
          setHostingId(null);
          return;
        }
      }

      // Initialize game session
      const gameRes = await createGame(targetQuizId);
      if (gameRes.success && gameRes.game) {
        toast.success(`Quiz Lobby Active! PIN: ${gameRes.game.pin}`, { id: 'use-quiz' });
        navigate(`/host/lobby/${gameRes.game.pin}`);
      } else {
        toast.error(gameRes.message || 'Failed to launch game lobby', { id: 'use-quiz' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error starting quiz lobby', { id: 'use-quiz' });
    } finally {
      setHostingId(null);
    }
  };

  return (
    <section id="ready-quizzes" className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
            <span>Instant Play Library</span>
          </div>

          <h2 className={`font-outfit text-3xl sm:text-4xl md:text-5xl font-black tracking-tight ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>
            Ready-to-Use <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600">Quizzes</span>
          </h2>

          <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Pick from our curated library of pre-made trivia & assessment quizzes. Host live games instantly without typing questions from scratch!
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25 scale-105'
                    : isLight
                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-purple-50 hover:text-purple-700 shadow-sm'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Quiz Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredQuizzes.map((quiz, index) => {
            const IconComponent = quiz.icon || Sparkles;
            const isHosting = hostingId === quiz._id;

            return (
              <motion.div
                key={quiz._id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className={`rounded-3xl border p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 ${
                  isLight
                    ? 'bg-white border-gray-200/80 hover:border-purple-300 hover:shadow-xl'
                    : 'bg-gradient-to-b from-[#13111c] to-[#0d0c14] border-white/10 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-950/30'
                }`}
              >
                {/* Top Badge & Category */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${quiz.gradient} flex items-center justify-center text-white shadow-md`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border ${
                      quiz.difficulty === 'Easy'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : quiz.difficulty === 'Hard'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}>
                      {quiz.difficulty || 'Medium'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-500 block mb-1">
                      {quiz.category}
                    </span>
                    <h3 className={`font-outfit text-base font-bold line-clamp-2 ${
                      isLight ? 'text-gray-900 group-hover:text-purple-700' : 'text-white group-hover:text-purple-300'
                    }`}>
                      {quiz.title}
                    </h3>
                    <p className={`text-xs mt-2 line-clamp-3 leading-relaxed ${
                      isLight ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {quiz.description}
                    </p>
                  </div>
                </div>

                {/* Footer Metadata & Action Button */}
                <div className="pt-5 mt-4 border-t space-y-3" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between text-xs font-semibold text-muted">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                      <span>{quiz.questionsCount} Qs</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>~5 mins</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUseQuiz(quiz)}
                    disabled={isHosting}
                    className="w-full btn-premium py-2.5 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isHosting ? (
                      <span>Launching Lobby...</span>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Use Quiz & Host</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
