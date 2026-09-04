import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Save, HelpCircle, Layout, ArrowLeft, 
  Settings, CheckCircle, Clock, Eye, AlertCircle, Play,
  Image, X, Palette, Copy, Edit3, Loader2,
  LayoutDashboard, LogOut, User, Sun, Moon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import AnimatedPage from '../components/AnimatedPage';
import Logo from '../components/Logo';
import BackgroundPicker from '../components/BackgroundPicker';
import { useTheme } from '../context/ThemeContext';
import { getQuizById, updateQuiz } from '../services/quizService';

export default function EditQuiz() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { themeMode, toggleThemeMode } = useTheme();
  const isLight = themeMode === 'light';

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const [useSameBgForAll, setUseSameBgForAll] = useState(true);
  const [bgModalTarget, setBgModalTarget] = useState(null);
  const [formReady, setFormReady] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const pageHeaderRef = useRef(null);

  // Measure dynamic page header height and update CSS property --page-header-height
  useEffect(() => {
    const updatePageHeaderHeight = () => {
      if (pageHeaderRef.current) {
        document.documentElement.style.setProperty('--page-header-height', `${pageHeaderRef.current.offsetHeight}px`);
      }
    };
    updatePageHeaderHeight();
    const observer = new ResizeObserver(updatePageHeaderHeight);
    if (pageHeaderRef.current) {
      observer.observe(pageHeaderRef.current);
    }
    window.addEventListener('resize', updatePageHeaderHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePageHeaderHeight);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to parse background config
  const parseBgConfig = (bgStr) => {
    if (!bgStr) return null;
    try {
      let config = bgStr;
      while (typeof config === 'string' && (config.trim().startsWith('{') || config.trim().startsWith('"'))) {
        const parsed = JSON.parse(config);
        if (typeof parsed === 'string' && parsed === config) break;
        config = parsed;
      }
      return (config && typeof config === 'object' && config.url) ? config : null;
    } catch (e) {
      return null;
    }
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'general knowledge',
      backgroundImage: '',
      questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, timeLimit: 20, backgroundImage: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });
  const watchAllFields = watch();

  // Fetch the existing quiz
  const { data, isLoading, isError } = useQuery({
    queryKey: ['quiz-edit', id],
    queryFn: () => getQuizById(id),
    enabled: !!id,
  });

  // Pre-fill the form once data is loaded
  useEffect(() => {
    if (data?.quiz) {
      const q = data.quiz;
      // Detect per-question backgrounds
      const hasPerQBg = q.questions?.some(qst => qst.backgroundImage && qst.backgroundImage !== '');
      setUseSameBgForAll(!hasPerQBg);

      reset({
        title: q.title || '',
        description: q.description || '',
        category: q.category || 'general knowledge',
        backgroundImage: q.backgroundImage || '',
        questions: (q.questions || []).map(qst => ({
          questionText: qst.questionText || '',
          options: qst.options?.length === 4 ? qst.options : ['', '', '', ''],
          correctAnswer: qst.correctAnswer ?? 0,
          timeLimit: qst.timeLimit || 20,
          backgroundImage: qst.backgroundImage || '',
        }))
      });
      setFormReady(true);
    }
  }, [data, reset]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateQuiz,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Quiz updated successfully! ✅');
        navigate('/quiz/my');
      } else {
        toast.error(res.message || 'Failed to update quiz');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error updating quiz');
    }
  });

  const onSubmit = async (data) => {
    if (data.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }
    const payload = {
      ...data,
      backgroundImage: data.backgroundImage || '',
      questions: data.questions.map(q => ({
        ...q,
        correctAnswer: Number(q.correctAnswer),
        timeLimit: Number(q.timeLimit),
        backgroundImage: useSameBgForAll ? '' : (q.backgroundImage || '')
      }))
    };
    updateMutation.mutate({ id, data: payload });
  };

  const onInvalid = (errs) => {
    if (errs.title) { toast.error(`Quiz details: ${errs.title.message || 'Quiz Title is required'}`); return; }
    if (errs.questions) { toast.error('Please complete all question fields.'); return; }
    toast.error('Please fill out all required fields.');
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-gray-400 text-sm font-semibold">Loading quiz...</p>
      </div>
    </div>
  );

  if (isError || (!isLoading && !data?.quiz)) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-center p-6">
      <div className="space-y-4">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Quiz Not Found</h2>
        <p className="text-gray-400 text-sm">The quiz you're trying to edit doesn't exist or you don't have permission.</p>
        <button onClick={() => navigate('/quiz/my')} className="btn-premium btn-primary-gradient px-6 py-2.5 text-sm font-bold">
          Back to My Quizzes
        </button>
      </div>
    </div>
  );

  return (
    <AnimatedPage>
      <div className="relative min-h-screen bg-background text-gray-200">

        {/* Glow Spheres */}
        <div className="absolute top-[-5%] left-[10%] h-[350px] w-[350px] bg-glow-primary pointer-events-none opacity-40"></div>
        <div className="absolute bottom-[10%] right-[5%] h-[400px] w-[400px] bg-glow-secondary pointer-events-none opacity-30"></div>

        {/* ACTION TOOLBAR (PAGE TITLE & SAVE ACTIONS) */}
        <div 
          ref={pageHeaderRef}
          className="fixed top-[var(--main-header-height,64px)] left-0 right-0 z-40 w-full border-b backdrop-blur-xl shadow-md transition-all duration-300 py-3 sm:py-3.5"
          style={{
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(10, 10, 15, 0.98)',
            borderColor: isLight ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.10)'
          }}
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 sm:gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/quiz/my')}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>
              <div>
                <h1 className="font-outfit text-xl sm:text-2xl font-extrabold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                  <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                  <span>Edit Quiz</span>
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Editing: <span className="text-primary font-semibold">{watch('title') || '...'}</span>
                </p>
              </div>
            </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 mt-1 sm:mt-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit, onInvalid)}
                  disabled={updateMutation.isPending}
                  className="btn-premium w-full sm:w-auto justify-center px-4 sm:px-5 py-2 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white shadow-md cursor-pointer disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
                >
                  {updateMutation.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    : <Save className="h-4 w-4 shrink-0" />
                  }
                  <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>

        {/* MAIN FORM CONTENT */}
        <div className="mx-auto max-w-5xl relative z-10 space-y-6 text-left pt-[calc(var(--page-header-height,68px)+1.5rem)] pb-12 px-4 sm:px-8">

          {/* EDITOR FORM */}
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8">

            {/* Quiz Details */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
              <h3 className="font-outfit text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-primary" />
                Quiz Details
              </h3>

              <div className="grid gap-6 sm:grid-cols-3">
                {/* Title */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Quiz Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Science Bowl Finals"
                    {...register('title', { required: 'Quiz title is required' })}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  />
                  {errors.title && (
                    <span className="flex items-center gap-1.5 text-xs text-accent mt-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.title.message}
                    </span>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Category</label>
                  <select
                    {...register('category')}
                    className="w-full rounded-xl bg-[#111115] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
                  >
                    <option value="general knowledge">General Knowledge</option>
                    <option value="science">Science</option>
                    <option value="technology">Technology</option>
                    <option value="programming">Programming</option>
                    <option value="geography">Geography</option>
                    <option value="history">History</option>
                    <option value="space">Space & Astronomy</option>
                    <option value="gaming">Gaming & Esports</option>
                    <option value="education">Education & Literature</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="nature">Nature & Environment</option>
                    <option value="sports">Sports & Fitness</option>
                    <option value="music">Music & Arts</option>
                    <option value="food">Food & Culinary</option>
                    <option value="movies">Movies & Entertainment</option>
                    <option value="birds">Wildlife & Birds</option>
                    <option value="business">Business & Finance</option>
                  </select>
                </div>

                {/* Description */}
                <div className="sm:col-span-3 space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Give users an overview of the battle topics..."
                    {...register('description')}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Background Settings */}
            <div className="glass-panel rounded-3xl overflow-hidden relative border border-white/5 p-6 sm:p-8 space-y-6">
              <div className="secondary-section-header">
                <div className="section-title-group">
                  <h3 className="section-title">
                    <Image className="h-4.5 w-4.5 text-primary shrink-0" />
                    <span>Quiz Background Settings</span>
                  </h3>
                  <p className="section-subtitle">Configure global and question-specific visual styling.</p>
                </div>
                {/* Mode Toggle */}
                <div className="section-action-group">
                  <span className="text-xs font-bold text-gray-300">Same background for all questions</span>
                  <button
                    type="button"
                    onClick={() => setUseSameBgForAll(!useSameBgForAll)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${useSameBgForAll ? 'bg-primary' : 'bg-white/10'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${useSameBgForAll ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {useSameBgForAll ? (
                <BackgroundPicker
                  value={watch('backgroundImage')}
                  onChange={(val) => setValue('backgroundImage', val)}
                  previewData={{
                    category: watch('category'),
                    timeLimit: watch('questions.0.timeLimit') || 20,
                    questionText: watch('questions.0.questionText') || 'Enter question text...',
                    options: watch('questions.0.options') || ['', '', '', ''],
                    correctAnswer: watch('questions.0.correctAnswer') || 0
                  }}
                />
              ) : (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-3">
                  <Image className="h-10 w-10 text-primary mx-auto opacity-70" />
                  <h4 className="text-sm font-bold text-gray-300 flex items-center gap-1.5 justify-center">
                    <Palette className="h-4 w-4 text-secondary" />
                    Different Background Mode Active
                  </h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Each question can now have its own unique background setup! Customize them below inside the Questions List.
                  </p>
                  <div className="pt-2">
                    <BackgroundPicker
                      value={watch('backgroundImage')}
                      onChange={(val) => setValue('backgroundImage', val)}
                      showPreview={false}
                    />
                  </div>
                </div>
              )}
            </div>


            {/* QUESTIONS BUILDER LIST */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h3 className="font-outfit text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="h-4.5 w-4.5 text-secondary" />
                  Questions List ({fields.length})
                </h3>
                <button
                  type="button"
                  onClick={() => append({ questionText: '', options: ['', '', '', ''], correctAnswer: 0, timeLimit: 20, backgroundImage: '' })}
                  className="btn-premium btn-secondary-gradient px-4 py-2 flex items-center gap-1.5 text-xs font-bold shadow-secondary-glow cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Blank Question</span>
                </button>
              </div>

              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, height: 0, y: -20 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: 20 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 14 }}
                      className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/5 relative overflow-hidden"
                    >
                      {/* Question Header */}
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-xs font-bold text-gray-400">QUESTION {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>

                      {/* Question Text */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Question Title / Text</label>
                        <input
                          type="text"
                          placeholder="e.g. What is the output of 2 + 2 in JavaScript?"
                          {...register(`questions.${index}.questionText`, { required: 'Question text is required' })}
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1"
                        />
                      </div>

                      {/* Options */}
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                          Answer Options (Select the correct radio circle)
                        </label>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {[0, 1, 2, 3].map((optIdx) => {
                            const isSelected = Number(watchAllFields.questions?.[index]?.correctAnswer) === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={`border rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all ${
                                  isSelected
                                    ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(124,58,237,0.15)]'
                                    : 'border-white/10 bg-white/5 hover:border-white/20 focus-within:border-primary/50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  value={optIdx}
                                  {...register(`questions.${index}.correctAnswer`)}
                                  className="h-4.5 w-4.5 border-white/10 bg-white/5 text-primary focus:ring-primary/30"
                                />
                                <input
                                  type="text"
                                  placeholder={`Option ${['A', 'B', 'C', 'D'][optIdx]}`}
                                  {...register(`questions.${index}.options.${optIdx}`, { required: 'This option is required' })}
                                  className="flex-1 bg-transparent border-none p-0 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-0"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Limit */}
                      <div className="space-y-3 border-t border-white/5 pt-5">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <span>Question Timer Limit</span>
                          <span className="text-secondary font-mono tracking-normal">{watch(`questions.${index}.timeLimit`) || 20} Seconds</span>
                        </div>
                        <div className="flex gap-4 items-center">
                          <input
                            type="range" min="5" max="120" step="5"
                            {...register(`questions.${index}.timeLimit`)}
                            className="flex-1 accent-secondary bg-white/5 rounded-full h-1.5 cursor-pointer"
                          />
                          <div className="flex h-9 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10 font-bold text-xs">
                            {watch(`questions.${index}.timeLimit`)}s
                          </div>
                        </div>
                      </div>

                      {/* Per-question Background */}
                      {!useSameBgForAll && (
                        <div className="space-y-3 border-t border-white/5 pt-5 text-left font-sans">
                          <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <span>Question Background</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                            <div className="flex-1">
                              {(() => {
                                const bgObj = parseBgConfig(watch(`questions.${index}.backgroundImage`));
                                if (bgObj) return (
                                  <div className="flex items-center gap-3">
                                    <div className="w-16 h-10 rounded-lg bg-cover bg-center border border-white/10 shrink-0" style={{ backgroundImage: `url(${bgObj.url})` }} />
                                    <div>
                                      <span className="text-[10px] text-green-400 font-bold block uppercase tracking-wider">Custom Background Active</span>
                                      <span className="text-xs text-gray-400">Blur: {bgObj.blur}px | Brightness: {bgObj.brightness}%</span>
                                    </div>
                                  </div>
                                );
                                return (
                                  <div className="text-left">
                                    <span className="text-xs text-gray-400 block font-bold">Using Global Fallback</span>
                                    <span className="text-[10px] text-gray-500">This question will inherit the global quiz background.</span>
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setBgModalTarget(index)}
                                className="btn-premium px-3.5 py-2 flex items-center gap-1.5 text-xs font-bold text-white shadow-md cursor-pointer"
                                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none' }}
                              >
                                <Palette className="h-3.5 w-3.5" /> Customize Background
                              </button>
                              {watch(`questions.${index}.backgroundImage`) && (
                                <button
                                  type="button"
                                  onClick={() => { setValue(`questions.${index}.backgroundImage`, ''); toast.success('Question background reset'); }}
                                  className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                                  title="Reset to global"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Add Question CTA */}
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => append({ questionText: '', options: ['', '', '', ''], correctAnswer: 0, timeLimit: 20, backgroundImage: '' })}
                className="btn-premium btn-secondary-gradient px-6 py-3.5 flex items-center gap-2 text-xs font-bold shadow-secondary-glow cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>Add Another Question</span>
              </button>
            </div>

          </form>
        </div>

      {/* Per-Question Background Modal */}
      {bgModalTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-5xl rounded-3xl p-6 sm:p-8 border border-white/10 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setBgModalTarget(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-left">
              <h2 className="font-outfit text-2xl font-extrabold text-white">Customize Question {bgModalTarget + 1} Background</h2>
              <p className="text-xs text-gray-400 mt-1">Set different visual filters, overlays, gradients or custom image for this question.</p>
            </div>

            <div className="border-t border-white/5 pt-6">
              <BackgroundPicker
                value={watch(`questions.${bgModalTarget}.backgroundImage`)}
                onChange={(val) => setValue(`questions.${bgModalTarget}.backgroundImage`, val)}
                previewData={{
                  category: watch('category'),
                  timeLimit: watch(`questions.${bgModalTarget}.timeLimit`) || 20,
                  questionText: watch(`questions.${bgModalTarget}.questionText`) || 'Enter question text...',
                  options: watch(`questions.${bgModalTarget}.options`) || ['', '', '', ''],
                  correctAnswer: watch(`questions.${bgModalTarget}.correctAnswer`) || 0
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={() => { setValue(`questions.${bgModalTarget}.backgroundImage`, watch('backgroundImage')); toast.success('Global background copied!'); }}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><Copy className="h-3.5 w-3.5" />Copy Global Background</span>
              </button>
              <button
                type="button"
                onClick={() => { setValue(`questions.${bgModalTarget}.backgroundImage`, ''); toast.success('Question background reset'); }}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><Trash2 className="h-3.5 w-3.5" />Clear Custom Background</span>
              </button>
              <button
                type="button"
                onClick={() => setBgModalTarget(null)}
                className="px-5 py-2.5 rounded-xl bg-primary text-xs font-bold text-white shadow-premium-glow hover:bg-primary-hover transition-all cursor-pointer"
              >
                Apply &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AnimatedPage>
  );
}
