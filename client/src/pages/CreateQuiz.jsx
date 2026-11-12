import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, PlusCircle, Settings, BarChart2,
  LogOut, Crown, ArrowRight, ArrowLeft, Search, Bell, ChevronDown,
  Plus, Play, Trash2, Copy, Clock, X, Check, Sparkles,
  FileSpreadsheet, Save, Image, Upload, Sliders, HelpCircle,
  CheckCircle2, Building2, Grid, Monitor, Smartphone, Menu,
  Palette, User, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import Logo from '../components/Logo';
import HostProfileModal from '../components/HostProfileModal';
import PlanComparisonTable from '../components/PlanComparisonTable';
import AIQuizAssistantModal from '../components/AIQuizAssistantModal';
import BackgroundPicker from '../components/BackgroundPicker';
import { createQuiz } from '../services/quizService';
import { createGame } from '../services/gameService';
import { clearAuthSession, getStoredUser } from '../utils/auth';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [user, setUser] = useState(() => getStoredUser());
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'upgrade' | null
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showPexelsModal, setShowPexelsModal] = useState(false);
  const [bgModalTarget, setBgModalTarget] = useState(null);

  // Active question index in question editor
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Live preview device state
  const [previewDevice, setPreviewDevice] = useState('mobile'); // 'mobile' | 'desktop'

  // Advanced Background Settings state
  const [useSameBgForAll, setUseSameBgForAll] = useState(true);
  const [activeBgTab, setActiveBgTab] = useState('upload'); // 'upload' | 'pexels'
  const [bgDragActive, setBgDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  // Sync stored user profile across storage and custom events
  useEffect(() => {
    const handleProfileSync = (e) => {
      if (e && 'detail' in e) {
        setUser(e.detail);
      } else {
        setUser(getStoredUser());
      }
    };
    window.addEventListener('user-profile-updated', handleProfileSync);
    window.addEventListener('storage', handleProfileSync);
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileSync);
      window.removeEventListener('storage', handleProfileSync);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

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

  const serializeBgConfig = (cfg) => {
    if (!cfg || !cfg.url) return '';
    return JSON.stringify({
      url: cfg.url,
      blur: Number(cfg.blur) || 0,
      brightness: Number(cfg.brightness) ?? 100,
      overlayOpacity: Number(cfg.overlayOpacity) ?? 30,
      fit: cfg.fit || 'cover',
      position: cfg.position || 'center',
      gradient: cfg.gradient || 'none',
      lightOverlay: cfg.lightOverlay !== undefined ? Boolean(cfg.lightOverlay) : true
    });
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      organizationName: '',
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
  const currentQuestions = watch('questions') || [];
  const currentCategory = watch('category');
  const currentRawBg = watch('backgroundImage');

  // Active question safe reference
  const safeActiveIndex = Math.min(Math.max(0, activeQuestionIndex), Math.max(0, fields.length - 1));
  const activeQuestion = currentQuestions[safeActiveIndex] || {
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    timeLimit: 20,
    backgroundImage: ''
  };

  // Active Background Config
  const [bgSettings, setBgSettings] = useState({
    url: '',
    blur: 0,
    brightness: 100,
    overlayOpacity: 30,
    fit: 'cover',
    position: 'center',
    gradient: 'none',
    lightOverlay: true
  });

  // Sync parsed bg on initial load or reset
  useEffect(() => {
    const parsed = parseBgConfig(currentRawBg);
    if (parsed) {
      setBgSettings(prev => ({
        ...prev,
        url: parsed.url || '',
        blur: parsed.blur ?? 0,
        brightness: parsed.brightness ?? 100,
        overlayOpacity: parsed.overlayOpacity ?? 30,
        fit: parsed.fit || 'cover',
        position: parsed.position || 'center',
        gradient: parsed.gradient || 'none',
        lightOverlay: parsed.lightOverlay ?? true
      }));
    }
  }, [currentRawBg]);

  const updateBgSettings = (updates) => {
    const next = { ...bgSettings, ...updates };
    setBgSettings(next);
    setValue('backgroundImage', serializeBgConfig(next), { shouldDirty: true });
  };

  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      updateBgSettings({ url: dataUrl });
      toast.success('Custom background uploaded!');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setBgDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddAIQuestions = (aiQuestions) => {
    const isFirstQuestionEmpty = currentQuestions.length === 1 &&
      !currentQuestions[0].questionText?.trim() &&
      currentQuestions[0].options.every(opt => !opt?.trim());

    if (isFirstQuestionEmpty) {
      setValue('questions', aiQuestions);
      setActiveQuestionIndex(0);
    } else {
      aiQuestions.forEach(q => append(q));
      setActiveQuestionIndex(currentQuestions.length);
    }
  };

  const handleReplaceWithAIQuiz = (result) => {
    if (result.title) setValue('title', result.title);
    if (result.category) setValue('category', result.category);
    if (result.questions && result.questions.length > 0) {
      setValue('questions', result.questions);
      setActiveQuestionIndex(0);
    }
  };

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
            setActiveQuestionIndex(0);
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
      reader.onload = async (evt) => {
        try {
          const XLSX = await import('xlsx');
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const parsed = parseExcelRows(jsonData);
          if (parsed.length > 0) {
            setValue('questions', parsed);
            setActiveQuestionIndex(0);
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

  const onSubmit = async (data, targetStatus = 'published', launchImmediate = false) => {
    if (data.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    const isDraft = targetStatus === 'draft';
    const payload = {
      ...data,
      status: targetStatus,
      isDraft,
      backgroundImage: data.backgroundImage || '',
      questions: data.questions.map(q => ({
        ...q,
        correctAnswer: Number(q.correctAnswer),
        timeLimit: Number(q.timeLimit),
        backgroundImage: useSameBgForAll ? '' : (q.backgroundImage || '')
      }))
    };

    try {
      if (launchImmediate) {
        toast.loading('Initializing live lobby...', { id: 'launch-host' });
        const response = await createQuiz(payload);
        if (response.success) {
          queryClient.invalidateQueries({ queryKey: ['my-quizzes'] });
          queryClient.invalidateQueries({ queryKey: ['my-quizzes-full'] });
          const newQuiz = response.quiz;
          const gameRes = await createGame(newQuiz._id);
          if (gameRes.success) {
            toast.success('Live room active! PIN initialized', { id: 'launch-host' });
            navigate(`/host/lobby/${gameRes.game.pin}`);
          } else {
            toast.error(gameRes.message || 'Lobby launch failed', { id: 'launch-host' });
            navigate('/quiz/my');
          }
        } else {
          toast.error(response.message || 'Failed to save quiz', { id: 'launch-host' });
        }
      } else {
        toast.loading(isDraft ? 'Saving draft...' : 'Publishing quiz...', { id: 'save-quiz' });
        const response = await createQuiz(payload);
        if (response.success) {
          queryClient.invalidateQueries({ queryKey: ['my-quizzes'] });
          queryClient.invalidateQueries({ queryKey: ['my-quizzes-full'] });
          toast.success(isDraft ? 'Quiz saved as draft! 📝' : 'Quiz published successfully! 🚀', { id: 'save-quiz' });
          navigate('/quiz/my');
        } else {
          toast.error(response.message || 'Failed to save quiz', { id: 'save-quiz' });
        }
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
      toast.error('Please complete all question prompts and option answers.');
      return;
    }
    toast.error('Please fill out all required fields.');
  };

  // Add Question helper
  const handleAddQuestion = () => {
    append({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      timeLimit: 20,
      backgroundImage: ''
    });
    setActiveQuestionIndex(fields.length);
  };

  // Duplicate active question
  const handleDuplicateActiveQuestion = () => {
    if (!activeQuestion) return;
    append({
      questionText: activeQuestion.questionText ? `${activeQuestion.questionText} (Copy)` : '',
      options: [...(activeQuestion.options || ['', '', '', ''])],
      correctAnswer: activeQuestion.correctAnswer || 0,
      timeLimit: activeQuestion.timeLimit || 20,
      backgroundImage: activeQuestion.backgroundImage || ''
    });
    setActiveQuestionIndex(fields.length);
    toast.success(`Duplicated Question ${safeActiveIndex + 1}`);
  };

  // Delete active question
  const handleDeleteActiveQuestion = () => {
    if (fields.length <= 1) {
      toast.error('A quiz must contain at least 1 question.');
      return;
    }
    remove(safeActiveIndex);
    setActiveQuestionIndex(Math.max(0, safeActiveIndex - 1));
    toast.success('Question removed');
  };

  // Categories list
  const CATEGORIES = [
    { value: 'general knowledge', label: 'General Knowledge' },
    { value: 'science', label: 'Science' },
    { value: 'technology', label: 'Technology' },
    { value: 'programming', label: 'Programming' },
    { value: 'geography', label: 'Geography' },
    { value: 'history', label: 'History' },
    { value: 'space', label: 'Space & Astronomy' },
    { value: 'gaming', label: 'Gaming & Esports' },
    { value: 'education', label: 'Education & Literature' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'nature', label: 'Nature & Environment' },
    { value: 'sports', label: 'Sports & Fitness' },
    { value: 'music', label: 'Music & Arts' },
    { value: 'food', label: 'Food & Culinary' },
    { value: 'movies', label: 'Movies & Entertainment' },
    { value: 'birds', label: 'Wildlife & Birds' },
    { value: 'business', label: 'Business & Finance' }
  ];

  return (
    <AnimatedPage>
      <div className="relative min-h-screen bg-[#FDFDFE] text-[#1E293B] font-['Inter',sans-serif] selection:bg-[#6222F5]/20 selection:text-[#6222F5]">

        {/* ─── 1. LEFT SIDEBAR (230px, Fixed Desktop, Drawer Mobile) ─── */}
        <aside
          className={`fixed top-0 bottom-0 left-0 z-50 w-[230px] bg-[#FDFDFE] border-r border-[#ECEFF5] shadow-[1px_0px_4px_rgba(0,0,0,0.06)] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
            isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Top Brand & Navigation Area */}
          <div className="px-4 pt-5 pb-4 flex flex-col items-start gap-4 flex-1 overflow-y-auto">
            {/* Mascot Brand Logo */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-[#F1F5F9]/80">
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <Logo className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
              </Link>
              {/* Close Drawer Button on Mobile */}
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Navigation Menu */}
            <nav className="w-full flex flex-col gap-2 mt-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
              >
                <LayoutDashboard className="w-5 h-5 text-[#94A3B8]" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/quiz/my"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
              >
                <BookOpen className="w-5 h-5 text-[#94A3B8]" />
                <span>My Quizzes</span>
              </Link>

              {/* Active: Create Quiz */}
              <Link
                to="/quiz/create"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-[#6222F5] text-white shadow-[0px_10px_15px_-3px_rgba(98,34,245,0.25),0px_4px_6px_-4px_rgba(98,34,245,0.25)] font-semibold text-[14px]"
              >
                <PlusCircle className="w-5 h-5 text-white" />
                <span>Create Quiz</span>
              </Link>

              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
              >
                <BarChart2 className="w-5 h-5 text-[#94A3B8]" />
                <span>Reports</span>
              </Link>

              <button
                type="button"
                onClick={() => setActiveModal('profile')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors text-left"
              >
                <Settings className="w-5 h-5 text-[#94A3B8]" />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* Bottom Pinned Controls (Upgrade Promo & Logout) */}
          <div className="px-4 pb-5 pt-2 flex flex-col gap-3">
            {/* Promo Card */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-[#FAF7FF] via-[#F4EEFF] to-[#EDE5FF] border border-[#E9DCFF] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-left flex flex-col gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E9D5FF]/60 shadow-sm flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#0F172A] tracking-tight">Upgrade to Gubbi Pro</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                  Unlock unlimited quizzes & multiplayer rooms.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('upgrade')}
                className="w-full py-2 px-3 rounded-xl bg-[#6C38FF] hover:bg-[#5b2bd9] text-white font-semibold text-[12px] shadow-[0px_4px_16px_rgba(108,56,255,0.28)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Upgrade Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] font-semibold text-[13.5px] hover:bg-[#FEE2E2] transition-colors cursor-pointer justify-center"
            >
              <LogOut className="w-4 h-4 text-[#EF4444]" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar drawer */}
        {isMobileNavOpen && (
          <div
            onClick={() => setIsMobileNavOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ─── 2. MAIN CONTENT AREA (Offset by 230px on Desktop) ─── */}
        <div className="lg:pl-[230px] flex flex-col min-h-screen">

          {/* ─── TOP HEADER (74px Glassmorphism Bar) ─── */}
          <header className="sticky top-0 z-30 h-[74px] bg-white/80 backdrop-blur-md border-b border-[#EEF0F6] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            {/* Left Hamburger (Mobile) + Global Search Input */}
            <div className="flex items-center gap-3 flex-1 max-w-[620px]">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search quizzes, topics, or participants..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#FAF9FD] border border-[#E9EAF2] text-[13.5px] font-medium text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#6222F5] focus:ring-2 focus:ring-[#6222F5]/10 transition-all"
                />
              </div>
            </div>

            {/* Right Controls: Notifications & Profile Pill */}
            <div className="flex items-center gap-3">
              {/* Notifications Button */}
              <div className="relative" ref={notifDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative w-10 h-10 rounded-full border border-[#E7E9F2] bg-white hover:bg-[#F8FAFC] flex items-center justify-center text-[#475569] transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 text-[#475569]" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] border-2 border-white ring-1 ring-red-400" />
                </button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[#EEF0F6] shadow-xl p-4 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                      <h4 className="text-sm font-bold text-[#0F172A]">Notifications</h4>
                      <span className="text-[11px] font-medium text-[#6222F5] cursor-pointer">Mark all read</span>
                    </div>
                    <div className="py-3 flex flex-col gap-2.5">
                      <div className="p-2.5 rounded-xl bg-[#FAF5FF] border border-[#F3E8FF] flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#9333EA] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-[#1E293B]">Design Mode Ready</p>
                          <p className="text-[11px] text-[#64748B]">You are creating a new quiz! Use the AI Assistant to generate questions in seconds.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Pill */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-[#E7E9F2] bg-white hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#6C38FF] text-white font-semibold text-xs flex items-center justify-center shadow-xs">
                    {user?.name ? user.name[0]?.toUpperCase() : 'M'}
                  </div>
                  <span className="text-[13.5px] font-semibold text-[#1E293B] max-w-[100px] truncate hidden sm:inline">
                    {user?.name || 'Mohsin'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#EEF0F6] shadow-xl p-2 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-[#F1F5F9]">
                      <p className="text-xs font-bold text-[#0F172A] truncate">{user?.name || 'Mohsin'}</p>
                      <p className="text-[11px] text-[#64748B] truncate">{user?.email || 'mohsin@example.com'}</p>
                    </div>
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveModal('profile');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#94A3B8]" />
                        <span>Profile & Stats</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveModal('upgrade');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#6C38FF] hover:bg-[#FAF5FF] transition-colors"
                      >
                        <Crown className="w-4 h-4 text-[#F59E0B]" />
                        <span>Subscription Plans</span>
                      </button>
                    </div>
                    <div className="pt-1 border-t border-[#F1F5F9]">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-[#EF4444]" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ─── FORM & PAGE BODY ─── */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1340px] w-full mx-auto space-y-6">

            {/* ─── PAGE TITLE & ACTION TOOLBAR ─── */}
            <div className="rounded-2xl bg-white border border-[#E2E8F0]/90 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
              {/* Left branding & back button */}
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => navigate('/quiz/my')}
                  className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-all cursor-pointer shrink-0"
                  aria-label="Go Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">Create Quiz</h1>
                  <p className="text-xs text-[#64748B] mt-0.5">Design customized questions and timers.</p>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {/* 1. AI Assistant */}
                <button
                  type="button"
                  onClick={() => setShowAIModal(true)}
                  className="px-3.5 sm:px-4 py-2.5 rounded-2xl text-white font-bold text-xs shadow-[0px_10px_25px_-3px_rgba(108,40,254,0.35)] flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'linear-gradient(90deg, #6C28FE 0%, #4F46E5 50%, #D946EF 100%)' }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>AI Assistant</span>
                </button>

                {/* 2. Import CSV */}
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  ref={excelInputRef}
                  onChange={handleExcelUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => excelInputRef.current?.click()}
                  className="px-3.5 sm:px-4 py-2.5 rounded-2xl bg-[#F8F9FE] border border-[#E9D5FF]/80 text-[#6C28FE] font-bold text-xs hover:bg-[#F1F3FE] shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Import CSV</span>
                </button>

                {/* 3. Save Draft */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit((data) => onSubmit(data, 'draft', false), onInvalid)}
                  className="px-3.5 sm:px-4 py-2.5 rounded-2xl bg-white border border-[#E9D5FF] text-[#6C28FE] font-bold text-xs shadow-[0px_8px_30px_rgba(108,40,254,0.06)] hover:bg-[#FAF5FF] flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Save className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Save Draft</span>
                </button>

                {/* 4. Publish & Launch */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit((data) => onSubmit(data, 'published', true), onInvalid)}
                  className="px-4 sm:px-5 py-2.5 rounded-2xl text-white font-bold text-xs shadow-[0px_10px_25px_-3px_rgba(108,40,254,0.35)] flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'linear-gradient(90deg, #6C28FE 0%, #4F46E5 50%, #6640E8 100%)' }}
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Publish & Launch</span>
                </button>
              </div>
            </div>

            {/* ─── UPPER SECTION: 3-PANEL ROW (Quiz Details, Background Settings, Live Preview) ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* ─ COLUMN 1: QUIZ DETAILS PANEL (lg:col-span-3) ─ */}
              <div className="lg:col-span-3 rounded-2xl bg-white border border-[#E2E8F0]/90 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-5 text-left flex flex-col gap-5">
                {/* Panel Header */}
                <div className="flex items-center gap-2.5 pb-1">
                  <div className="w-8 h-8 rounded-xl bg-[#F0F9FF] flex items-center justify-center shrink-0">
                    <Sliders className="w-4 h-4 text-[#0284C7]" />
                  </div>
                  <h2 className="text-[16px] font-bold text-[#0F172A] tracking-tight">Quiz Details</h2>
                </div>

                {/* Form Fields */}
                <div className="flex flex-col gap-4">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#1E293B] block">
                      Quiz Title <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Search className="hidden" />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <BookOpen className="w-4 h-4 text-[#9333EA]" />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter quiz title"
                        {...register('title', { required: 'Quiz title is required' })}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FCFCFF] border border-[#E9D5FF]/90 text-xs font-normal text-[#1E293B] placeholder-[#C084FC]/90 focus:outline-none focus:border-[#6222F5] focus:ring-1 focus:ring-[#6222F5]/30"
                      />
                    </div>
                    {errors.title && (
                      <p className="text-[11px] text-red-500 font-medium mt-0.5">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Category Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#1E293B] block">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Grid className="w-4 h-4 text-[#9333EA]" />
                      </div>
                      <select
                        {...register('category')}
                        className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#FCFCFF] border border-[#E9D5FF]/90 text-xs font-normal text-[#1E293B] focus:outline-none focus:border-[#6222F5] focus:ring-1 focus:ring-[#6222F5]/30 appearance-none cursor-pointer"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#1E293B] block">
                      Description (Optional)
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        placeholder="Describe your quiz (optional)"
                        {...register('description')}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FCFCFF] border border-[#E9D5FF]/90 text-xs font-normal text-[#1E293B] placeholder-[#C084FC]/90 focus:outline-none focus:border-[#6222F5] focus:ring-1 focus:ring-[#6222F5]/30 resize-none"
                      />
                      <div className="absolute left-3.5 top-3 pointer-events-none">
                        <HelpCircle className="w-4 h-4 text-[#9333EA]" />
                      </div>
                    </div>
                  </div>

                  {/* School / College / Organization */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#1E293B] block">
                      School / College / Organization (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Building2 className="w-4 h-4 text-[#9333EA]" />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter school or organization name"
                        {...register('organizationName')}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FCFCFF] border border-[#E9D5FF]/90 text-xs font-normal text-[#1E293B] placeholder-[#C084FC]/90 focus:outline-none focus:border-[#6222F5] focus:ring-1 focus:ring-[#6222F5]/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ─ COLUMN 2: QUIZ BACKGROUND SETTINGS (lg:col-span-5) ─ */}
              <div className="lg:col-span-5 rounded-2xl bg-white border border-[#E2E8F0]/90 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-5 text-left flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center gap-2.5 pb-1">
                  <div className="w-8 h-8 rounded-xl bg-[#F0F9FF] flex items-center justify-center shrink-0">
                    <Image className="w-4 h-4 text-[#0284C7]" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold text-[#0F172A] tracking-tight">Quiz Background Settings</h2>
                    <p className="text-[11px] font-medium text-[#64748B]">Configure global and question-specific visual styling.</p>
                  </div>
                </div>

                {/* Master Toggle Pill: Same background for all questions */}
                <div className="flex items-center justify-between px-3.5 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0]/80">
                  <span className="text-[11px] font-semibold text-[#334155]">Same background for all questions</span>
                  <button
                    type="button"
                    onClick={() => setUseSameBgForAll(!useSameBgForAll)}
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      useSameBgForAll ? 'bg-[#7C3AED]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        useSameBgForAll ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Tab Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveBgTab('upload')}
                    className={`py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeBgTab === 'upload'
                        ? 'bg-[#7C3AED] text-white shadow-xs'
                        : 'bg-white border border-[#E9D5FF] text-[#334155] hover:bg-[#FAF5FF]'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Background</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPexelsModal(true)}
                    className="py-2 px-3 rounded-xl font-semibold text-xs bg-white border border-[#E9D5FF] text-[#334155] hover:bg-[#FAF5FF] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#9333EA]" />
                    <span>Pexels Library</span>
                  </button>
                </div>

                {/* Drag and Drop Dropzone */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => handleImageFile(e.target.files[0])}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => { e.preventDefault(); setBgDragActive(true); }}
                  onDragLeave={() => setBgDragActive(false)}
                  onDrop={handleDrop}
                  className={`rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center transition-all min-h-[135px] ${
                    bgDragActive
                      ? 'border-[#7C3AED] bg-[#FAF5FF]'
                      : 'border-[#E9D5FF] bg-[#FCFBFE]'
                  }`}
                >
                  {bgSettings.url ? (
                    <div className="w-full flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-14 h-12 rounded-xl bg-cover bg-center border border-[#E2E8F0] shadow-xs shrink-0"
                          style={{ backgroundImage: `url(${bgSettings.url})` }}
                        />
                        <div className="text-left">
                          <span className="text-[11px] font-bold text-[#1E293B] block">Custom Image Loaded</span>
                          <span className="text-[10px] text-[#64748B]">Ready for live quiz presentation</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FAF5FF] border border-[#E9D5FF] text-[#7C3AED] font-semibold text-[11px] hover:bg-[#F3E8FF] cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBgSettings({ url: '' })}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="w-9 h-9 rounded-full bg-[#FAF5FF] flex items-center justify-center mx-auto text-[#7C3AED]">
                        <Image className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1E293B]">Drag and drop your image here</p>
                        <p className="text-[10px] text-[#94A3B8]">Supports JPG, PNG, or WebP formats</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 px-3.5 py-1.5 rounded-lg bg-[#7C3AED] text-white font-semibold text-[11px] hover:bg-[#6D28D9] shadow-xs cursor-pointer transition-colors"
                      >
                        Choose File
                      </button>
                    </div>
                  )}
                </div>

                {/* Sliders & Dropdown Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Left Column: Sliders */}
                  <div className="flex flex-col gap-3">
                    {/* Blur Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px] font-semibold text-[#334155]">
                        <span>Blur Intensity</span>
                        <span className="text-[#7C3AED] font-bold">{bgSettings.blur} px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={bgSettings.blur}
                        onChange={(e) => updateBgSettings({ blur: Number(e.target.value) })}
                        className="w-full h-1.5 bg-[#E2E8F0] rounded-full accent-[#7C3AED] cursor-pointer"
                      />
                    </div>

                    {/* Brightness Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px] font-semibold text-[#334155]">
                        <span>Brightness</span>
                        <span className="text-[#7C3AED] font-bold">{bgSettings.brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        step="5"
                        value={bgSettings.brightness}
                        onChange={(e) => updateBgSettings({ brightness: Number(e.target.value) })}
                        className="w-full h-1.5 bg-[#E2E8F0] rounded-full accent-[#7C3AED] cursor-pointer"
                      />
                    </div>

                    {/* Overlay Opacity Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px] font-semibold text-[#334155]">
                        <span>Overlay Opacity</span>
                        <span className="text-[#7C3AED] font-bold">{bgSettings.overlayOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={bgSettings.overlayOpacity}
                        onChange={(e) => updateBgSettings({ overlayOpacity: Number(e.target.value) })}
                        className="w-full h-1.5 bg-[#E2E8F0] rounded-full accent-[#7C3AED] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Right Column: Dropdowns & Toggles */}
                  <div className="flex flex-col gap-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      {/* FIT */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider block">FIT</label>
                        <select
                          value={bgSettings.fit}
                          onChange={(e) => updateBgSettings({ fit: e.target.value })}
                          className="w-full py-1.5 px-2 rounded-lg bg-white border border-[#E2E8F0] text-[11px] font-medium text-[#1E293B] focus:outline-none focus:border-[#7C3AED]"
                        >
                          <option value="cover">Cover (Default)</option>
                          <option value="contain">Contain</option>
                          <option value="fill">Fill</option>
                        </select>
                      </div>

                      {/* POSITION */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider block">POSITION</label>
                        <select
                          value={bgSettings.position}
                          onChange={(e) => updateBgSettings({ position: e.target.value })}
                          className="w-full py-1.5 px-2 rounded-lg bg-white border border-[#E2E8F0] text-[11px] font-medium text-[#1E293B] focus:outline-none focus:border-[#7C3AED]"
                        >
                          <option value="center">Center</option>
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 items-end">
                      {/* GRADIENT */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider block">GRADIENT</label>
                        <select
                          value={bgSettings.gradient}
                          onChange={(e) => updateBgSettings({ gradient: e.target.value })}
                          className="w-full py-1.5 px-2 rounded-lg bg-white border border-[#E2E8F0] text-[11px] font-medium text-[#1E293B] focus:outline-none focus:border-[#7C3AED]"
                        >
                          <option value="none">No Gradient</option>
                          <option value="subtle">Subtle Dark</option>
                          <option value="vibrant">Vibrant Dark</option>
                          <option value="purple">Purple Vignette</option>
                        </select>
                      </div>

                      {/* Light Overlay toggle card */}
                      <button
                        type="button"
                        onClick={() => updateBgSettings({ lightOverlay: !bgSettings.lightOverlay })}
                        className={`py-1.5 px-2 rounded-lg border flex items-center justify-between text-[10px] font-semibold cursor-pointer transition-colors ${
                          bgSettings.lightOverlay
                            ? 'bg-[#FAF5FF] border-[#E9D5FF] text-[#6D28D9]'
                            : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#475569]'
                        }`}
                      >
                        <span>Light Overlay</span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center text-white ${
                          bgSettings.lightOverlay ? 'bg-[#7C3AED]' : 'border border-[#CBD5E1] bg-white'
                        }`}>
                          {bgSettings.lightOverlay && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─ COLUMN 3: LIVE QUIZ PREVIEW PANEL (lg:col-span-4) ─ */}
              <div className="lg:col-span-4 rounded-2xl bg-white border border-[#E2E8F0]/90 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-5 text-left flex flex-col gap-3">
                {/* Header & Device Switcher */}
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-bold text-[#0F172A] tracking-tight">Live Quiz Preview</h2>
                  <div className="flex items-center bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        previewDevice === 'mobile'
                          ? 'bg-[#7C3AED] text-white shadow-xs'
                          : 'text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Mobile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        previewDevice === 'desktop'
                          ? 'bg-[#7C3AED] text-white shadow-xs'
                          : 'text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                      <span>Desktop</span>
                    </button>
                  </div>
                </div>

                {/* Mockup Preview Window */}
                <div className="relative rounded-xl border border-[#E2E8F0]/80 p-3.5 overflow-hidden min-h-[310px] flex flex-col justify-between shadow-inner bg-gradient-to-br from-[#F5F3FF] via-[#F0F4FF] to-[#EEF2FF]">
                  {/* Optional Background image layer */}
                  {bgSettings.url && (
                    <div
                      className="absolute inset-0 pointer-events-none transition-all duration-300"
                      style={{
                        backgroundImage: `url(${bgSettings.url})`,
                        backgroundSize: bgSettings.fit,
                        backgroundPosition: bgSettings.position,
                        filter: `blur(${bgSettings.blur}px) brightness(${bgSettings.brightness}%)`,
                        opacity: 1
                      }}
                    />
                  )}

                  {/* Gradient / Overlay Layer */}
                  {bgSettings.lightOverlay && (
                    <div
                      className="absolute inset-0 bg-white pointer-events-none transition-opacity"
                      style={{ opacity: bgSettings.overlayOpacity / 100 }}
                    />
                  )}

                  {/* Ambient subtle glow lights */}
                  <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#E9D5FF]/40 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#BAE6FD]/40 rounded-full blur-2xl pointer-events-none" />

                  {/* Top Question Card */}
                  <div className="relative z-10 rounded-xl bg-white/95 backdrop-blur-xs border border-[#F1F5F9] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF5FF] border border-[#F3E8FF] text-[9.5px] font-bold text-[#9333EA] uppercase tracking-wider">
                        {currentCategory || 'WEB DEVELOPMENT'}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-medium text-[#94A3B8]">
                        <Clock className="w-3 h-3 text-[#94A3B8]" />
                        <span>00:{String(activeQuestion.timeLimit || 20).padStart(2, '0')}</span>
                      </div>
                    </div>

                    <h3 className="text-[13px] font-extrabold text-[#1E293B] leading-tight line-clamp-3">
                      {activeQuestion.questionText || 'What does HTML stand for, powering structure across all web browsers?'}
                    </h3>
                  </div>

                  {/* 4 Colored Answer Option Pills */}
                  <div className="relative z-10 flex flex-col gap-1.5 mt-2">
                    {/* Option 1: Red / Coral */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-left">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[#EF4444] text-[10px] font-bold">▲</span>
                        <span className="text-[11px] font-semibold text-[#1E293B] truncate">
                          {activeQuestion.options?.[0] || 'HyperText Markup Language'}
                        </span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        Number(activeQuestion.correctAnswer) === 0
                          ? 'border-[#FB7185] bg-[#FB7185]'
                          : 'border-[#FB7185] bg-white'
                      }`}>
                        {Number(activeQuestion.correctAnswer) === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* Option 2: Blue */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-left">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[#3B82F6] text-[10px] font-bold">◆</span>
                        <span className="text-[11px] font-semibold text-[#1E293B] truncate">
                          {activeQuestion.options?.[1] || 'High Tech Markup Language'}
                        </span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        Number(activeQuestion.correctAnswer) === 1
                          ? 'border-[#38BDF8] bg-[#38BDF8]'
                          : 'border-[#38BDF8] bg-white'
                      }`}>
                        {Number(activeQuestion.correctAnswer) === 1 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* Option 3: Amber / Yellow */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-left">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[#F59E0B] text-[10px] font-bold">●</span>
                        <span className="text-[11px] font-semibold text-[#1E293B] truncate">
                          {activeQuestion.options?.[2] || 'Hyperlink Text Management'}
                        </span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        Number(activeQuestion.correctAnswer) === 2
                          ? 'border-[#FBBF24] bg-[#FBBF24]'
                          : 'border-[#FBBF24] bg-white'
                      }`}>
                        {Number(activeQuestion.correctAnswer) === 2 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* Option 4: Green / Emerald */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-left">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[#10B981] text-[10px] font-bold">■</span>
                        <span className="text-[11px] font-semibold text-[#1E293B] truncate">
                          {activeQuestion.options?.[3] || 'Home Tool Markup Language'}
                        </span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        Number(activeQuestion.correctAnswer) === 3
                          ? 'border-[#34D399] bg-[#34D399]'
                          : 'border-[#34D399] bg-white'
                      }`}>
                        {Number(activeQuestion.correctAnswer) === 3 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ─── LOWER SECTION: QUESTIONS LIST SIDEBAR & QUESTION EDITOR MAIN AREA ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* ─ LEFT SUB-PANEL: QUESTIONS LIST SIDEBAR (lg:col-span-4) ─ */}
              <div className="lg:col-span-4 rounded-2xl bg-white border border-[#E2E8F0]/90 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-5 text-left flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center gap-2.5 pb-1">
                  <div className="w-8 h-8 rounded-xl bg-[#F0F9FF] flex items-center justify-center shrink-0">
                    <Grid className="w-4 h-4 text-[#0284C7]" />
                  </div>
                  <h2 className="text-[14px] font-bold text-[#0F172A] tracking-tight">
                    Questions List ({fields.length})
                  </h2>
                </div>

                {/* Draggable/Selectable Questions List */}
                <div className="flex flex-col gap-2 max-h-[290px] overflow-y-auto pr-1">
                  {fields.map((field, idx) => {
                    const isActive = idx === safeActiveIndex;
                    const previewText = currentQuestions[idx]?.questionText?.trim();

                    return (
                      <div
                        key={field.id}
                        onClick={() => setActiveQuestionIndex(idx)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#F3EFFF] border-[#E9D5FF]/90 shadow-xs'
                            : 'bg-white border-[#E2E8F0] hover:bg-[#FAF9FD]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Grip Icon */}
                          <div className="flex flex-col gap-0.5 text-[#C084FC]">
                            <div className="flex gap-0.5">
                              <span className="w-1 h-1 rounded-full bg-[#C084FC]" />
                              <span className="w-1 h-1 rounded-full bg-[#C084FC]" />
                            </div>
                            <div className="flex gap-0.5">
                              <span className="w-1 h-1 rounded-full bg-[#C084FC]" />
                              <span className="w-1 h-1 rounded-full bg-[#C084FC]" />
                            </div>
                            <div className="flex gap-0.5">
                              <span className="w-1 h-1 rounded-full bg-[#C084FC]" />
                              <span className="w-1 h-1 rounded-full bg-[#C084FC]" />
                            </div>
                          </div>
                          <div className="truncate">
                            <span className={`text-xs font-bold block ${isActive ? 'text-[#6D28D9]' : 'text-[#334155]'}`}>
                              Question {idx + 1}
                            </span>
                            {previewText && (
                              <span className="text-[10px] text-[#94A3B8] truncate block max-w-[170px]">
                                {previewText}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Active check / question timer info */}
                        <span className="text-[10px] font-semibold text-[#94A3B8] px-2 py-0.5 rounded bg-white/70">
                          {currentQuestions[idx]?.timeLimit || 20}s
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Add Another Question Button */}
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FAF5FF]/50 border border-dashed border-[#D8B4FE] text-[#7E22CE] font-bold text-xs hover:bg-[#FAF5FF] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#7E22CE]" />
                  <span>+ Add Another Question</span>
                </button>
              </div>

              {/* ─ RIGHT SUB-PANEL: QUESTION EDITOR MAIN AREA (lg:col-span-8) ─ */}
              <div className="lg:col-span-8 rounded-2xl bg-white border border-[#E2E8F0]/90 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-5 sm:p-6 text-left flex flex-col gap-5">
                {/* Header row: Question title, type selector pill & clone/delete actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5 text-[#94A3B8]">
                      <div className="flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-[#94A3B8]" />
                        <span className="w-1 h-1 rounded-full bg-[#94A3B8]" />
                      </div>
                      <div className="flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-[#94A3B8]" />
                        <span className="w-1 h-1 rounded-full bg-[#94A3B8]" />
                      </div>
                      <div className="flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-[#94A3B8]" />
                        <span className="w-1 h-1 rounded-full bg-[#94A3B8]" />
                      </div>
                    </div>
                    <h2 className="text-[16px] font-bold text-[#0F172A] tracking-tight">
                      Question {safeActiveIndex + 1}
                    </h2>

                    {/* Question Type Pill */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5FF]/80 border border-[#E9D5FF] text-[12px] font-semibold text-[#6D28D9]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                      <span>Multiple Choice</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#9333EA] ml-0.5" />
                    </div>
                  </div>

                  {/* Actions: Duplicate & Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDuplicateActiveQuestion}
                      className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                      title="Duplicate Question"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteActiveQuestion}
                      disabled={fields.length <= 1}
                      className="p-2 rounded-xl bg-[#FFF1F2] border border-[#FFE4E6] text-[#F43F5E] hover:bg-[#FEE2E2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Title / Prompt Input */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#1E293B] block">
                    Question Title / Text <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <HelpCircle className="w-4 h-4 text-[#9333EA]" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. What is the capital of France?"
                      {...register(`questions.${safeActiveIndex}.questionText`, { required: 'Question prompt is required' })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FCFCFF] border border-[#E9D5FF]/90 text-xs text-[#1E293B] placeholder-[#C084FC] focus:outline-none focus:border-[#6222F5] focus:ring-1 focus:ring-[#6222F5]/30 font-medium"
                    />
                  </div>
                </div>

                {/* Answer Options Section (2x2 Grid) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[12px] font-bold text-[#1E293B]">Answer Options</h3>
                    <span className="text-[11px] text-[#64748B]">(Select the correct option circle)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((optIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][optIdx];
                      const isCorrect = Number(watch(`questions.${safeActiveIndex}.correctAnswer`)) === optIdx;

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                            isCorrect
                              ? 'bg-[#F3EFFF] border-[#7C3AED] shadow-[0px_0px_10px_rgba(124,58,237,0.12)]'
                              : 'bg-[#FCFCFF] border-[#E9D5FF]/80 focus-within:border-[#7C3AED]'
                          }`}
                        >
                          {/* Letter Badge */}
                          <div className="w-7 h-7 rounded-lg bg-[#F3E8FF]/70 text-[#6D28D9] font-bold text-xs flex items-center justify-center shrink-0">
                            {letter}
                          </div>

                          {/* Option Text Input */}
                          <input
                            type="text"
                            placeholder={`Option ${letter}`}
                            {...register(`questions.${safeActiveIndex}.options.${optIdx}`, { required: 'Option is required' })}
                            className="flex-1 bg-transparent border-none text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none font-medium"
                          />

                          {/* Radio Selector to Mark Correct */}
                          <button
                            type="button"
                            onClick={() => setValue(`questions.${safeActiveIndex}.correctAnswer`, optIdx, { shouldDirty: true })}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                              isCorrect
                                ? 'border-[#7C3AED] bg-[#7C3AED] text-white'
                                : 'border-[#CBD5E1] bg-white hover:border-[#7C3AED]'
                            }`}
                            title={`Mark Option ${letter} as correct`}
                          >
                            {isCorrect && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Question Timer Limit Slider */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B] shrink-0">
                    <Clock className="w-4 h-4 text-[#7E22CE]" />
                    <span>Question Timer Limit</span>
                  </div>

                  <div className="flex items-center gap-3 flex-1 max-w-[500px]">
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      {...register(`questions.${safeActiveIndex}.timeLimit`)}
                      className="w-full h-1.5 bg-[#E2E8F0] rounded-full accent-[#7C3AED] cursor-pointer"
                    />
                    <div className="px-3 py-1 rounded-lg bg-[#FAF5FF] border border-[#E9D5FF] text-[#6D28D9] font-bold text-xs shrink-0">
                      {watch(`questions.${safeActiveIndex}.timeLimit`) || 20}s
                    </div>
                  </div>
                </div>

                {/* Question-Specific Background Customizer (when useSameBgForAll is false) */}
                {!useSameBgForAll && (
                  <div className="pt-3 border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF5FF]/50 p-3 rounded-xl border border-[#E9D5FF]/60">
                    <div>
                      <span className="text-xs font-bold text-[#1E293B] block">Unique Question Background</span>
                      <span className="text-[11px] text-[#64748B]">
                        {watch(`questions.${safeActiveIndex}.backgroundImage`)
                          ? 'Custom background active for this question'
                          : 'Currently using global background fallback'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBgModalTarget(safeActiveIndex)}
                        className="px-3 py-1.5 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span>Customize Background</span>
                      </button>
                      {watch(`questions.${safeActiveIndex}.backgroundImage`) && (
                        <button
                          type="button"
                          onClick={() => {
                            setValue(`questions.${safeActiveIndex}.backgroundImage`, '');
                            toast.success('Reset to global fallback');
                          }}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer"
                          title="Reset to default"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </main>
        </div>

        {/* ─── MODALS ─── */}

        {/* 1. AI QUIZ ASSISTANT MODAL */}
        <AIQuizAssistantModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onAddQuestions={handleAddAIQuestions}
          onReplaceQuiz={handleReplaceWithAIQuiz}
        />

        {/* 2. PEXELS / PRESET LIBRARY MODAL */}
        {showPexelsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] overflow-y-auto space-y-5 text-left relative">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                    <span>Pexels & High-Resolution Background Library</span>
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Browse curated 4K & HD background photos to enhance your live interactive quizzes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPexelsModal(false)}
                  className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* BackgroundPicker component embedded for full Pexels presets & search */}
              <BackgroundPicker
                value={watch('backgroundImage')}
                onChange={(val) => {
                  setValue('backgroundImage', val, { shouldDirty: true });
                  setShowPexelsModal(false);
                  toast.success('Background selected from library! ✨');
                }}
                showPreview={false}
              />
            </div>
          </div>
        )}

        {/* 3. QUESTION BACKGROUND CUSTOMIZER MODAL */}
        {bgModalTarget !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] overflow-y-auto space-y-5 text-left relative">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A]">
                    Customize Question {bgModalTarget + 1} Background
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Set a distinct visual background, filter or image specifically for this question.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBgModalTarget(null)}
                  className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <BackgroundPicker
                value={watch(`questions.${bgModalTarget}.backgroundImage`)}
                onChange={(val) => setValue(`questions.${bgModalTarget}.backgroundImage`, val, { shouldDirty: true })}
                showPreview={false}
              />

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => {
                    setValue(`questions.${bgModalTarget}.backgroundImage`, watch('backgroundImage'), { shouldDirty: true });
                    toast.success('Copied global background to question!');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  Copy Global Background
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue(`questions.${bgModalTarget}.backgroundImage`, '', { shouldDirty: true });
                    toast.success('Reset to global fallback');
                  }}
                  className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-100 cursor-pointer"
                >
                  Clear Custom Background
                </button>
                <button
                  type="button"
                  onClick={() => setBgModalTarget(null)}
                  className="px-5 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] shadow-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. HOST PROFILE MODAL */}
        <HostProfileModal
          isOpen={activeModal === 'profile'}
          onClose={() => setActiveModal(null)}
          user={user}
        />

        {/* 5. PLAN COMPARISON MODAL */}
        <PlanComparisonTable
          isOpen={activeModal === 'upgrade'}
          onClose={() => setActiveModal(null)}
        />

      </div>
    </AnimatedPage>
  );
}
