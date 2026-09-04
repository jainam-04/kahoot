import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Save, HelpCircle, Layout, ArrowLeft, 
  Settings, CheckCircle, Clock, Eye, AlertCircle, FileSpreadsheet, Play,
  Image, Upload, X, ChevronDown, ChevronUp, Palette, Copy,
  LayoutDashboard, LogOut, User, Sun, Moon
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import AnimatedPage from '../components/AnimatedPage';
import Logo from '../components/Logo';
import { createQuiz } from '../services/quizService';
import { createGame } from '../services/gameService';

import BackgroundPicker from '../components/BackgroundPicker';
import { useTheme } from '../context/ThemeContext';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const { themeMode, toggleThemeMode } = useTheme();
  const isLight = themeMode === 'light';

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Advanced customization states
  const [useSameBgForAll, setUseSameBgForAll] = useState(true);
  const [bgModalTarget, setBgModalTarget] = useState(null);

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

  // Sticky toolbar scroll tracking
  const [isScrolled, setIsScrolled] = useState(false);

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
        if (typeof parsed === 'string' && parsed === config) {
          break;
        }
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
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'general knowledge',
      backgroundImage: '',
      questions: [
        {
          questionText: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          timeLimit: 20,
          backgroundImage: ''
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const watchAllFields = watch();

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      reader.onload = (evt) => {
        try {
          const text = evt.target.result;
          const parsed = parseCSV(text);
          if (parsed.length > 0) {
            setValue('questions', parsed);
            toast.success(`Imported ${parsed.length} questions from CSV!`);
          } else {
            toast.error('No valid questions found in CSV file.');
          }
        } catch (err) {
          toast.error('Failed to parse CSV file.');
        }
      };
      reader.readAsText(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const parsed = parseExcelRows(jsonData);
          if (parsed.length > 0) {
            setValue('questions', parsed);
            toast.success(`Imported ${parsed.length} questions from Excel sheet!`);
          } else {
            toast.error('No valid questions found in Excel sheet.');
          }
        } catch (err) {
          console.error(err);
          toast.error('Failed to parse Excel file.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error('Unsupported file format. Please upload CSV or Excel (.xlsx/.xls).');
    }
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const rows = lines.map(line => {
      const cols = [];
      let inQuotes = false;
      let col = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cols.push(col.trim());
          col = '';
        } else {
          col += char;
        }
      }
      cols.push(col.trim());
      return cols.map(c => c.replace(/^["']|["']$/g, '').trim());
    });
    return parseExcelRows(rows);
  };

  const parseExcelRows = (rows) => {
    if (rows.length === 0) return [];
    
    const firstCell = String(rows[0][0] || '').toLowerCase();
    const startIndex = (firstCell.includes('question') || firstCell.includes('title')) ? 1 : 0;
    
    const parsedQuestions = [];
    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (row && row.length >= 6) {
        const questionText = String(row[0] || '').trim();
        const options = [
          String(row[1] || '').trim(),
          String(row[2] || '').trim(),
          String(row[3] || '').trim(),
          String(row[4] || '').trim()
        ];
        
        let correctVal = Number(row[5]);
        if (isNaN(correctVal)) {
          const textVal = String(row[5] || '').toLowerCase().trim();
          const optionIndexMap = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, '1': 0, '2': 1, '3': 2, '4': 3 };
          correctVal = optionIndexMap[textVal] !== undefined ? optionIndexMap[textVal] : 0;
        } else {
          correctVal = (correctVal >= 1 && correctVal <= 4) ? correctVal - 1 : 0;
        }
        
        const timeLimit = Number(row[6] || 20);
        if (questionText && options.every(opt => opt !== '')) {
          parsedQuestions.push({
            questionText,
            options,
            correctAnswer: correctVal,
            timeLimit,
            backgroundImage: ''
          });
        }
      }
    }
    return parsedQuestions;
  };

  const onSubmit = async (data) => {
    // Basic verification
    if (data.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // Convert correctAnswer values to numbers just in case
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

    try {
      const response = await createQuiz(payload);
      if (response.success) {
        toast.success('Quiz created successfully!');
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Failed to save quiz');
      }
    } catch (error) {
      console.error('[CREATE QUIZ ERROR]', error);
      toast.error(error.response?.data?.message || 'Error saving quiz');
    }
  };

  const onInvalid = (errors) => {
    console.warn('Form Validation Errors:', errors);
    if (errors.title) {
      toast.error(`Quiz details: ${errors.title.message || 'Quiz Title is required'}`);
      return;
    }
    if (errors.questions) {
      toast.error('Please complete all question title fields and option answers.');
      return;
    }
    toast.error('Please fill out all required fields.');
  };

  return (
    <AnimatedPage>
      <div className="relative min-h-screen bg-background text-gray-200">
        
        {/* Glow Spheres */}
        <div className="absolute top-[-5%] left-[10%] h-[350px] w-[350px] bg-glow-primary pointer-events-none opacity-40"></div>
        <div className="absolute bottom-[10%] right-[5%] h-[400px] w-[400px] bg-glow-secondary pointer-events-none opacity-30"></div>

        {/* ACTION TOOLBAR (PAGE TITLE & SAVE/LAUNCH ACTIONS) */}
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
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>
              <div>
                <h1 className="font-outfit text-xl sm:text-2xl font-extrabold" style={{ color: 'var(--text-heading)' }}>Create Quiz</h1>
                <p className="text-xs text-gray-400 mt-0.5">Design customized questions and timers.</p>
              </div>
            </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 mt-1 sm:mt-0 w-full sm:w-auto">
                {/* Hidden File Input for Excel/CSV */}
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  id="excel-file-upload"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
                <label
                  htmlFor="excel-file-upload"
                  className="btn-premium w-full sm:w-auto justify-center px-3.5 sm:px-4 py-2 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white shadow-md cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
                >
                  <FileSpreadsheet className="h-4 w-4 shrink-0" />
                  <span>Upload Excel/CSV</span>
                </label>
                
                <button
                  type="button"
                  onClick={handleSubmit(async (data) => {
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
                    toast.loading('Initializing lobby...', { id: 'forge-host' });
                    const response = await createQuiz(payload);
                    if (response.success) {
                      const newQuiz = response.quiz;
                      const gameRes = await createGame(newQuiz._id);
                      if (gameRes.success) {
                        toast.success('Lobby active! PIN initialized', { id: 'forge-host' });
                        navigate(`/host/lobby/${gameRes.game.pin}`);
                      } else {
                        toast.error(gameRes.message || 'Lobby initialization failed', { id: 'forge-host' });
                        navigate('/dashboard');
                      }
                    } else {
                      toast.error(response.message || 'Failed to save quiz', { id: 'forge-host' });
                    }
                  }, onInvalid)}
                  className="btn-premium w-full sm:w-auto justify-center px-3.5 sm:px-5 py-2 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white shadow-md cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', border: 'none' }}
                >
                  <Play className="h-4 w-4 fill-current shrink-0" />
                  <span>Launch Quiz</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmit(onSubmit, onInvalid)}
                  className="btn-premium w-full sm:w-auto justify-center px-3.5 sm:px-5 py-2 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white shadow-md cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
                >
                  <Save className="h-4 w-4 shrink-0" />
                  <span>Save Quiz</span>
                </button>
              </div>
            </div>
          </div>

        {/* MAIN FORM CONTENT */}
        <div className="mx-auto max-w-5xl relative z-10 space-y-6 text-left pt-[calc(var(--page-header-height,68px)+1.5rem)] pb-12 px-4 sm:px-8">
          
        {/* EDITOR LAYOUT */}
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8">
              
              {/* QUIZ INFORMATION METADATA */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <h3 className="font-outfit text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Settings className="h-4.5 w-4.5 text-primary" />
                  Quiz Details
                </h3>

                <div className="grid gap-6 sm:grid-cols-3">
                  
                  {/* Title */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                      Quiz Title
                    </label>
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
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                      Category
                    </label>
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
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Give users an overview of the battle topics..."
                      {...register('description')}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                  </div>

                </div>
              </div>

              {/* ── ADVANCED QUIZ BACKGROUND CUSTOMIZATION ── */}
              <div className="glass-panel rounded-3xl overflow-hidden relative border border-white/5 p-6 sm:p-8 space-y-6">
                <div className="secondary-section-header">
                  <div className="section-title-group">
                    <h3 className="section-title">
                      <Image className="h-4.5 w-4.5 text-primary shrink-0" />
                      <span>Quiz Background Settings</span>
                    </h3>
                    <p className="section-subtitle">Configure global and question-specific visual styling.</p>
                  </div>
                  
                  {/* Mode Toggle Switch */}
                  <div className="section-action-group">
                    <span className="text-xs font-bold text-gray-300 text-left">Same background for all questions</span>
                    <button
                      type="button"
                      onClick={() => setUseSameBgForAll(!useSameBgForAll)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        useSameBgForAll ? 'bg-primary' : 'bg-white/10'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          useSameBgForAll ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
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
                      questionText: watch('questions.0.questionText') || "Enter question text...",
                      options: watch('questions.0.options') || ["", "", "", ""],
                      correctAnswer: watch('questions.0.correctAnswer') || 0
                    }}
                  />
                ) : (
                  <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-3">
                    <Image className="h-10 w-10 text-primary mx-auto opacity-70" />
                    <h4 className="text-sm font-bold text-gray-300 flex items-center gap-1.5">
                    <Palette className="h-4 w-4 text-secondary" />
                    Different Background Mode Active
                  </h4>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      Each question can now have its own unique background setup! Customize them below inside the Questions List using the "Customize Background" option.
                    </p>
                    <div className="pt-2">
                      <BackgroundPicker
                        value={watch('backgroundImage')}
                        onChange={(val) => setValue('backgroundImage', val)}
                        showPreview={false}
                      />
                      <p className="text-[10px] text-gray-500 italic mt-2">
                        *Note: The background customized above will serve as the fallback/default background for any questions without custom backgrounds.
                      </p>
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
                  
                  <div className="flex flex-wrap items-center gap-3 mt-3 sm:mt-0">
                    <button
                      type="button"
                      onClick={() => append({ questionText: '', options: ['', '', '', ''], correctAnswer: 0, timeLimit: 20, backgroundImage: '' })}
                      className="btn-premium btn-secondary-gradient px-4 py-2 flex items-center gap-1.5 text-xs font-bold shadow-secondary-glow cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Blank Question</span>
                    </button>
                  </div>
                </div>

                {/* Spreadsheet Formatting Tip Info Box */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 space-y-1.5">
                  <span className="font-bold text-gray-300 uppercase tracking-wider text-[10px] block">Excel/CSV Format Guidelines:</span>
                  <p>
                    Columns must follow: <code className="text-secondary bg-white/5 px-1.5 py-0.5 rounded font-mono">Question Text, Option 1, Option 2, Option 3, Option 4, Correct Option Index (1-4), Time Limit in Seconds</code>.
                  </p>
                  <p className="text-[10px] text-gray-500">
                    *Tip: Row headers (e.g. "Question Text", "Option 1") will be skipped automatically if present in the first row.
                  </p>
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
                        {/* Header bar */}
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
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                            Question Title / Text
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. What is the output of 2 + 2 in JavaScript?"
                            {...register(`questions.${index}.questionText`, { required: 'Question text is required' })}
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1"
                          />
                        </div>

                        {/* Options Input and Correct Selection */}
                        <div className="space-y-3">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                            Answers Options (Select the correct radio circle)
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

                        {/* Duration Slider */}
                        <div className="space-y-3 border-t border-white/5 pt-5">
                          <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <span>Question Timer Limit</span>
                            <span className="text-secondary font-mono tracking-normal">{watch(`questions.${index}.timeLimit`) || 20} Seconds</span>
                          </div>
                          <div className="flex gap-4 items-center">
                            <input
                              type="range"
                              min="5"
                              max="120"
                              step="5"
                              {...register(`questions.${index}.timeLimit`)}
                              className="flex-1 accent-secondary bg-white/5 rounded-full h-1.5 cursor-pointer"
                            />
                            <div className="flex h-9 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10 font-bold text-xs">
                              {watch(`questions.${index}.timeLimit`)}s
                            </div>
                          </div>
                        </div>

                        {/* Question Background Customization */}
                        {!useSameBgForAll && (
                          <div className="space-y-3 border-t border-white/5 pt-5 text-left font-sans">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                              <span>Question Background</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                              <div className="flex-1">
                                {(() => {
                                  const bgObj = parseBgConfig(watch(`questions.${index}.backgroundImage`));
                                  if (bgObj) {
                                    return (
                                      <div className="flex items-center gap-3">
                                        <div 
                                          className="w-16 h-10 rounded-lg bg-cover bg-center border border-white/10 shrink-0"
                                          style={{ backgroundImage: `url(${bgObj.url})` }}
                                        />
                                        <div>
                                          <span className="text-[10px] text-green-400 font-bold block uppercase tracking-wider">Custom Background Active</span>
                                          <span className="text-xs text-gray-400">Blur: {bgObj.blur}px | Brightness: {bgObj.brightness}%</span>
                                        </div>
                                      </div>
                                    );
                                  }
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
                                  <span className="flex items-center gap-1.5"><Palette className="h-3.5 w-3.5" />Customize Background</span>
                                </button>
                                {watch(`questions.${index}.backgroundImage`) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setValue(`questions.${index}.backgroundImage`, '');
                                      toast.success('Question background reset to default');
                                    }}
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

              {/* Add Question Floating CTA */}
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

      {/* Question Background Customizer Modal */}
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
                  questionText: watch(`questions.${bgModalTarget}.questionText`) || "Enter question text...",
                  options: watch(`questions.${bgModalTarget}.options`) || ["", "", "", ""],
                  correctAnswer: watch(`questions.${bgModalTarget}.correctAnswer`) || 0
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={() => {
                  const globalBg = watch('backgroundImage');
                  setValue(`questions.${bgModalTarget}.backgroundImage`, globalBg);
                  toast.success('Global background copied to this question!');
                }}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><Copy className="h-3.5 w-3.5" />Copy Global Background</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue(`questions.${bgModalTarget}.backgroundImage`, '');
                  toast.success('Question background reset to default');
                }}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><Trash2 className="h-3.5 w-3.5" />Clear Custom Background</span>
              </button>
              <button
                type="button"
                onClick={() => setBgModalTarget(null)}
                className="px-5 py-2.5 rounded-xl bg-primary text-xs font-bold text-white shadow-premium-glow hover:bg-primary-hover transition-all cursor-pointer"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </AnimatedPage>
  );
}
