import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, PlusCircle, HelpCircle, BarChart2, BarChart3,
  Settings, LogOut, Crown, ArrowRight, Search, Bell, ChevronDown, Zap,
  Gamepad2, Coins, Users, Play, Copy, Plus, X, Clock, Trophy, UserCheck,
  Pencil, ChevronRight, Sparkles, FlaskConical, Compass, Code, Calculator,
  Menu, Check, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import Logo from '../components/Logo';
import HostProfileModal from '../components/HostProfileModal';
import DeleteAccountModal from '../components/DeleteAccountModal';
import PlanComparisonTable from '../components/PlanComparisonTable';
import { getMyQuizzes, createQuiz, deleteQuiz } from '../services/quizService';
import { getMyResults } from '../services/resultService';
import { createGame } from '../services/gameService';
import { clearAuthSession, getStoredUser } from '../utils/auth';
import { ALL_CURATED_QUIZZES, FEATURED_PRESET_QUIZZES } from '../data/curatedQuizzes';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => getStoredUser());
  const [activeModal, setActiveModal] = useState(null); // 'sessions' | 'students' | 'profile' | 'upgrade' | 'delete' | null
  const [activePresetCategory, setActivePresetCategory] = useState('All');
  const [hostingPresetId, setHostingPresetId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const profileDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  // Sync stored user profile across window events and storage changes
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

  // Display Welcome Popup Toast when arriving directly from Sign In or Registration
  useEffect(() => {
    if (location.state?.welcomeMsg) {
      toast.success(location.state.welcomeMsg, { id: 'welcome-toast', duration: 4000 });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Clear any lingering guest credentials
  useEffect(() => {
    localStorage.removeItem('guest_playerName');
    localStorage.removeItem('guest_pin');
  }, []);

  // Close dropdowns when clicking outside
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
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Lock background scrolling and dismiss dropdowns when mobile sidebar is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = 'hidden';
      setIsProfileDropdownOpen(false);
      setIsNotificationsOpen(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileNavOpen]);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const { 
    data: quizzesData,
    isLoading: isQuizzesLoading,
    refetch: refetchQuizzes
  } = useQuery({
    queryKey: ['my-quizzes'],
    queryFn: getMyQuizzes,
  });

  const {
    data: resultsData,
    isLoading: isResultsLoading
  } = useQuery({
    queryKey: ['my-results'],
    queryFn: getMyResults,
  });

  // Host Game Mutation
  const hostGameMutation = useMutation({
    mutationFn: createGame,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Lobby initialized!');
        navigate(`/host/lobby/${data.game.pin}`);
      } else {
        toast.error(data.message || 'Failed to initialize game lobby');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error creating game session');
    }
  });

  // Calculate Metrics & Sort Quizzes Newest First
  const rawQuizzes = quizzesData?.quizzes || [];
  const userQuizzes = [...rawQuizzes].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime() || (a._id ? parseInt(a._id.substring(0, 8), 16) * 1000 : 0);
    const timeB = new Date(b.createdAt || 0).getTime() || (b._id ? parseInt(b._id.substring(0, 8), 16) * 1000 : 0);
    return timeB - timeA;
  });
  const totalQuizzes = userQuizzes.length;
  const hostedSessions = resultsData?.results || [];
  const totalGamesHosted = hostedSessions.length;

  // Process Student Data Across Sessions
  const studentMap = {};
  hostedSessions.forEach(res => {
    (res.players || []).forEach(p => {
      const pName = p.name || p.username || 'Student';
      if (!studentMap[pName]) {
        studentMap[pName] = { name: pName, totalScore: 0, sessionsCount: 0, avatar: p.avatar };
      }
      studentMap[pName].totalScore += (p.score !== undefined ? p.score : (p.totalScore || 0));
      studentMap[pName].sessionsCount += 1;
    });
  });
  const studentList = Object.values(studentMap).sort((a, b) => b.totalScore - a.totalScore);
  const totalStudents = studentList.length || hostedSessions.reduce((sum, res) => sum + (res.players?.length || 0), 0);
  const totalPlays = hostedSessions.reduce((sum, res) => sum + (res.players?.length || 0), 0);

  const handleHostGame = (quizId) => {
    toast.loading('Creating game lobby...', { id: 'host-game' });
    hostGameMutation.mutate(quizId, {
      onSettled: () => toast.dismiss('host-game')
    });
  };

  // Launch Predefined Ready Quiz directly from Dashboard
  const handleHostPreset = async (quiz) => {
    setHostingPresetId(quiz._id);
    toast.loading('Initializing live quiz lobby...', { id: 'host-preset' });
    try {
      const createRes = await createQuiz({
        title: quiz.title,
        category: quiz.category,
        description: quiz.description,
        questions: quiz.questions
      });

      if (createRes.success && createRes.quiz) {
        refetchQuizzes();
        const gameRes = await createGame(createRes.quiz._id);
        if (gameRes.success && gameRes.game) {
          toast.success(`Quiz Lobby Active! PIN: ${gameRes.game.pin}`, { id: 'host-preset' });
          navigate(`/host/lobby/${gameRes.game.pin}`);
        } else {
          toast.error(gameRes.message || 'Failed to initialize lobby', { id: 'host-preset' });
        }
      } else {
        toast.error('Failed to clone ready quiz', { id: 'host-preset' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error starting game session', { id: 'host-preset' });
    } finally {
      setHostingPresetId(null);
    }
  };

  // Clone preset to customize questions
  const handleCloneAndEditPreset = async (quiz) => {
    toast.loading('Cloning quiz for editing...', { id: 'clone-preset' });
    try {
      const createRes = await createQuiz({
        title: `${quiz.title} (Copy)`,
        category: quiz.category,
        description: quiz.description,
        questions: quiz.questions
      });
      if (createRes.success && createRes.quiz) {
        toast.success('Quiz ready for customization!', { id: 'clone-preset' });
        navigate(`/quiz/edit/${createRes.quiz._id}`);
      } else {
        toast.error('Failed to duplicate quiz', { id: 'clone-preset' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error duplicating quiz', { id: 'clone-preset' });
    }
  };

  const presetCategories = ['All', 'Science', 'General Knowledge', 'Programming', 'Mathematics'];
  const basePresets = activePresetCategory === 'All'
    ? FEATURED_PRESET_QUIZZES
    : ALL_CURATED_QUIZZES.filter(q => q.category.toLowerCase() === activePresetCategory.toLowerCase());

  // Filter with active search query
  const displayPresets = searchQuery.trim()
    ? basePresets.filter(q => 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : basePresets;

  const filteredUserQuizzes = searchQuery.trim()
    ? userQuizzes.filter(q => 
        q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : userQuizzes;

  const userName = user?.name || user?.username || 'Mohsin';
  const userInitial = (userName.charAt(0) || 'M').toUpperCase();

  // Helper for Category configuration in Ready Quizzes Grid
  const getCategoryConfig = (category = '') => {
    const cat = category.toLowerCase();
    if (cat.includes('sci')) {
      return {
        name: 'SCIENCE',
        icon: FlaskConical,
        iconBg: 'bg-[#059669]',
        textColor: 'text-[#7E22CE]',
        defaultDifficulty: 'MEDIUM',
        diffBg: 'bg-[#FFFBEB]',
        diffBorder: 'border-[rgba(253,230,138,0.8)]',
        diffText: 'text-[#D97706]'
      };
    }
    if (cat.includes('general') || cat.includes('geo')) {
      return {
        name: 'GENERAL KNOWLEDGE',
        icon: Compass,
        iconBg: 'bg-[#2563EB]',
        textColor: 'text-[#1D4ED8]',
        defaultDifficulty: 'EASY',
        diffBg: 'bg-[#ECFDF5]',
        diffBorder: 'border-[rgba(167,243,208,0.8)]',
        diffText: 'text-[#059669]'
      };
    }
    if (cat.includes('prog')) {
      return {
        name: 'PROGRAMMING',
        icon: Code,
        iconBg: 'bg-[#9333EA]',
        textColor: 'text-[#7E22CE]',
        defaultDifficulty: 'MEDIUM',
        diffBg: 'bg-[#FFFBEB]',
        diffBorder: 'border-[rgba(253,230,138,0.8)]',
        diffText: 'text-[#D97706]'
      };
    }
    return {
      name: 'MATHEMATICS',
      icon: Calculator,
      iconBg: 'bg-[#F97316]',
      textColor: 'text-[#7E22CE]',
      defaultDifficulty: 'EASY',
      diffBg: 'bg-[#ECFDF5]',
      diffBorder: 'border-[rgba(167,243,208,0.8)]',
      diffText: 'text-[#059669]'
    };
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-[#FFFFFF] text-[#0F172A] flex relative font-['Inter',sans-serif] selection:bg-[#6222F5]/20">
        
        {/* MOBILE BACKDROP OVERLAY */}
        {isMobileNavOpen && (
          <div 
            role="button"
            tabIndex={0}
            aria-label="Close navigation overlay"
            onClick={() => {
              setIsMobileNavOpen(false);
              setIsProfileDropdownOpen(false);
              setIsNotificationsOpen(false);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              setIsMobileNavOpen(false);
              setIsProfileDropdownOpen(false);
              setIsNotificationsOpen(false);
            }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs lg:hidden cursor-pointer"
          />
        )}

        {/* ========================================================================= */}
        {/* ASIDE - LEFTSIDEBAR (Exact Figma Design: 230px, #FDFDFE, #ECEFF5 Border) */}
        {/* ========================================================================= */}
        <aside 
          className={`fixed top-0 bottom-0 left-0 z-[70] w-[230px] bg-[#FDFDFE] border-r border-[#ECEFF5] shadow-[1px_0px_4px_rgba(0,0,0,0.06)] flex flex-col overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${
            isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col justify-between min-h-full">
            {/* Top Brand & Navigation Area */}
            <div className="px-4 pt-5 pb-3 flex flex-col items-start gap-3">
              {/* Mascot Brand Logo */}
              <div className="w-full flex items-center justify-between pb-3 border-b border-[#F1F5F9]/80">
                <Link to="/dashboard" className="flex items-center gap-2 group" onClick={() => setIsMobileNavOpen(false)}>
                  <Logo className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
                </Link>
                {/* Close Drawer Button on Mobile */}
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Navigation Menu */}
              <nav className="w-full flex flex-col gap-1.5 mt-1">
                {/* Link - Dashboard (Active) */}
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-[#6222F5] text-white shadow-[0px_10px_15px_-3px_rgba(98,34,245,0.25),0px_4px_6px_-4px_rgba(98,34,245,0.25)] font-semibold text-[14px]"
                >
                  <LayoutDashboard className="w-5 h-5 text-white" />
                  <span>Dashboard</span>
                </Link>

                {/* Link - My Quizzes */}
                <Link
                  to="/quiz/my"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-[#94A3B8]" />
                  <span>My Quizzes</span>
                </Link>

                {/* Link - Create Quiz */}
                <Link
                  to="/quiz/create"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
                >
                  <PlusCircle className="w-5 h-5 text-[#94A3B8]" />
                  <span>Create Quiz</span>
                </Link>

                {/* Link - Question Bank */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    setActivePresetCategory('All');
                    const el = document.getElementById('predefined-quizzes-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors text-left cursor-pointer"
                >
                  <HelpCircle className="w-5 h-5 text-[#94A3B8]" />
                  <span>Question Bank</span>
                </button>

                {/* Link - Reports */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    setActiveModal('sessions');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors text-left cursor-pointer"
                >
                  <BarChart2 className="w-5 h-5 text-[#94A3B8]" />
                  <span>Reports</span>
                </button>

                {/* Link - Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    setActiveModal('profile');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-5 h-5 text-[#94A3B8]" />
                  <span>Settings</span>
                </button>
              </nav>
            </div>

            {/* Bottom Pinned Controls (Upgrade Promo & Logout) */}
            <div className="px-4 pb-5 pt-2 flex flex-col gap-3 mt-auto shrink-0">
              {/* Promo Card */}
              <div className="rounded-2xl p-3.5 bg-gradient-to-br from-[#FAF7FF] via-[#F4EEFF] to-[#EDE5FF] border border-[#E9DCFF] shadow-xs text-left flex flex-col gap-2">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E9D5FF]/60 shadow-xs flex items-center justify-center">
                  <Crown className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[#0F172A] tracking-tight">Upgrade to Gubbi Pro</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                    Unlock unlimited quizzes &amp; rooms.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    setActiveModal('upgrade');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#6C38FF] hover:bg-[#5b2bd9] text-white font-semibold text-[11.5px] shadow-[0px_4px_16px_rgba(108,56,255,0.28)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Upgrade Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] font-semibold text-[13px] hover:bg-[#FEE2E2] transition-colors cursor-pointer justify-center"
              >
                <LogOut className="w-4 h-4 text-[#EF4444]" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* MAIN CONTENT WRAPPER (TopHeader + DashboardBody) */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-[230px] bg-[#FFFFFF]">
          
          {/* TOP HEADER (Clean, Mobile Friendly, Notification Removed) */}
          <header className="sticky top-0 z-30 h-14 sm:h-[70px] bg-white/90 backdrop-blur-md border-b border-[#EEF0F6] px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
            {/* Left Hamburger + Mobile Brand Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button 
                type="button"
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  setIsNotificationsOpen(false);
                  setIsMobileNavOpen(true);
                }}
                className="lg:hidden p-1.5 sm:p-2 rounded-xl border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="lg:hidden flex items-center">
                <Logo className="h-7 sm:h-8 w-auto object-contain" />
              </div>
            </div>

            {/* Desktop Global Search Bar (Hidden on phone screens to prevent squishing) */}
            <div className="hidden sm:block flex-1 max-w-[540px] mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search quizzes, topics, or participants..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-[#FAF9FD] border border-[#E9EAF2] text-xs font-medium text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#6222F5] focus:ring-1 focus:ring-[#6222F5]/20"
                />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Top Right Controls: User Profile Pill ONLY */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-3 sm:py-1 rounded-full border border-[#E7E9F2] bg-white hover:bg-[#F8FAFC] transition-colors cursor-pointer select-none"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#6C38FF] text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                    {userInitial}
                  </div>
                  <span className="text-xs font-semibold text-[#1E293B] max-w-[90px] truncate hidden sm:inline">
                    {userName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] hidden sm:inline" />
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-[#EEF0F6] shadow-xl p-2 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-[#F1F5F9]">
                      <p className="text-xs font-bold text-[#0F172A] truncate">{userName}</p>
                      <p className="text-[11px] text-[#64748B] truncate">{user?.email || 'host@gubbi.io'}</p>
                    </div>
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveModal('profile');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-[#94A3B8]" />
                        <span>Account Settings</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveModal('upgrade');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#6C38FF] hover:bg-[#FAF5FF] transition-colors cursor-pointer"
                      >
                        <Crown className="w-4 h-4 text-[#F59E0B]" />
                        <span>Upgrade to Pro</span>
                      </button>
                      <div className="my-1 border-t border-[#F1F5F9]" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-[#EF4444]" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ========================================================================= */}
          {/* MAIN - DASHBOARD BODY */}
          {/* ========================================================================= */}
          <main className="flex-1 p-5 sm:p-8 space-y-6 max-w-[1440px] w-full mx-auto">
            
            {/* Section - Welcome Banner */}
            <div className="text-left space-y-1">
              <h1 className="text-[26px] font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
                <span>👋</span>
                <span>Welcome back, {userName}</span>
              </h1>
              <p className="text-[13.5px] text-[#64748B]">
                Host instant quizzes, create custom trivia, and track performance.
              </p>
            </div>

            {/* Section - StatCardsRow (4 Cards with Drop Shadow & Watermarks) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              
              {/* Metric 1: Total Quizzes */}
              <div className="bg-white border border-[#EEF0F6] rounded-[24px] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] relative overflow-hidden flex items-center justify-between min-h-[120px] transition-all hover:shadow-md">
                <div className="flex items-center gap-4 z-10 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C2BD9] to-[#8B5CF6] flex items-center justify-center shadow-md shrink-0">
                    <Zap className="w-7 h-7 text-white fill-white" />
                  </div>
                  <div>
                    <span className="text-[14px] font-bold text-[#334155] block">Total Quizzes</span>
                    <span className="text-[30px] font-bold text-[#0F172A] leading-tight block">{totalQuizzes}</span>
                    <span className="text-[12px] font-medium text-[#94A3B8] block">Created so far</span>
                  </div>
                </div>

                {/* Lavender Document Watermark */}
                <svg 
                  className="absolute -right-3 -bottom-3 w-24 h-24 text-[#DDD6FE] opacity-40 pointer-events-none transform rotate-[27deg] select-none" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#DDD6FE" fillOpacity="0.4" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
              </div>

              {/* Metric 2: Sessions Hosted */}
              <div 
                onClick={() => setActiveModal('sessions')}
                className="bg-white border border-[#EEF0F6] rounded-[24px] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] relative overflow-hidden flex items-center justify-between min-h-[120px] transition-all hover:shadow-md cursor-pointer group"
                title="View hosted sessions history"
              >
                <div className="flex items-center gap-4 z-10 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0284C7] to-[#0EA5E9] flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                    <Gamepad2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <span className="text-[14px] font-bold text-[#334155] block">Sessions Hosted</span>
                    <span className="text-[30px] font-bold text-[#0F172A] leading-tight block">{totalGamesHosted}</span>
                    <span className="text-[12px] font-medium text-[#94A3B8] block">Live games run</span>
                  </div>
                </div>

                {/* Soft Pastel Blue Gamepad Watermark */}
                <svg 
                  className="absolute -right-3 -bottom-3 w-24 h-24 text-[#BAE6FD] opacity-50 pointer-events-none transform rotate-[27deg] select-none" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                >
                  <rect x="2" y="6" width="20" height="12" rx="6" fill="#BAE6FD" fillOpacity="0.35" />
                  <path d="M6 12h4m-2-2v4m7-2h.01m3-2h.01" />
                </svg>
              </div>

              {/* Metric 3: Total Students */}
              <div 
                onClick={() => setActiveModal('students')}
                className="bg-white border border-[#EEF0F6] rounded-[24px] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] relative overflow-hidden flex items-center justify-between min-h-[120px] transition-all hover:shadow-md cursor-pointer group"
                title="View student engagement roster"
              >
                <div className="flex items-center gap-4 z-10 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#059669] to-[#10B981] flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                    <Coins className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <span className="text-[14px] font-bold text-[#334155] block">Total Students</span>
                    <span className="text-[30px] font-bold text-[#0F172A] leading-tight block">{totalStudents}</span>
                    <span className="text-[12px] font-medium text-[#94A3B8] block">Participants joined</span>
                  </div>
                </div>

                {/* Soft Pastel Green Users Watermark */}
                <svg 
                  className="absolute -right-2 -bottom-2 w-24 h-24 text-[#A7F3D0] opacity-50 pointer-events-none select-none" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>

              {/* Metric 4: Total Plays */}
              <div className="bg-white border border-[#EEF0F6] rounded-[24px] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] relative overflow-hidden flex items-center justify-between min-h-[120px] transition-all hover:shadow-md">
                <div className="flex items-center gap-4 z-10 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#06B6D4] to-[#22D3EE] flex items-center justify-center shadow-md shrink-0">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <span className="text-[14px] font-bold text-[#334155] block">Total Plays</span>
                    <span className="text-[30px] font-bold text-[#0F172A] leading-tight block">{totalPlays}</span>
                    <span className="text-[12px] font-medium text-[#94A3B8] block">Across all quizzes</span>
                  </div>
                </div>

                {/* Soft Pastel Cyan Bar Chart Watermark */}
                <svg 
                  className="absolute -right-2 -bottom-2 w-24 h-24 text-[#BAE6FD] opacity-50 pointer-events-none select-none" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <rect x="3" y="12" width="4" height="8" rx="1" />
                  <rect x="10" y="8" width="4" height="12" rx="1" />
                  <rect x="17" y="4" width="4" height="16" rx="1" />
                </svg>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* PREDEFINED READY-TO-USE QUIZZES SECTION (Figma Large Card with Tabs) */}
            {/* ========================================================================= */}
            <section 
              id="predefined-quizzes-section"
              className="bg-white border border-[#EEF0F6] rounded-[24px] p-6 sm:p-8 shadow-[0px_2px_15px_rgba(0,0,0,0.06)] space-y-5 text-left"
            >
              {/* Header with View All Button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#6C38FF] fill-[#6C38FF]" />
                    <h2 className="text-[17px] font-bold text-[#0F172A] tracking-tight">
                      Ready-to-Use Predefined Quizzes
                    </h2>
                  </div>
                  <p className="text-[13px] text-[#64748B] mt-0.5">
                    Host instant 10-question trivia games live, or clone them directly to customize.
                  </p>
                </div>

                <Link
                  to="/quiz/my"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[rgba(250,245,255,0.8)] border border-[#E9D5FF] text-[12.5px] font-semibold text-[#6C38FF] hover:bg-[#F3E8FF] transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Filter Category Tabs (Horizontal Scroll) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {presetCategories.map((cat) => {
                  const isActive = activePresetCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActivePresetCategory(cat)}
                      className={`
                        px-4 py-2 rounded-full text-[14px] flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer
                        ${isActive
                          ? 'bg-[#551BF5] text-white font-semibold shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                          : 'bg-white border border-[#E2E8F0] text-[#334155] font-medium hover:bg-slate-50'
                        }
                      `}
                    >
                      {cat === 'All' && <LayoutDashboard className="w-3.5 h-3.5" />}
                      {cat === 'Science' && <FlaskConical className="w-3.5 h-3.5" />}
                      {cat === 'General Knowledge' && <Compass className="w-3.5 h-3.5" />}
                      {cat === 'Programming' && <Code className="w-3.5 h-3.5" />}
                      {cat === 'Mathematics' && <Calculator className="w-3.5 h-3.5" />}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>

              {/* 4 Ready-to-Use Quiz Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-1">
                {displayPresets.map((quiz, idx) => {
                  const cfg = getCategoryConfig(quiz.category);
                  const IconComp = cfg.icon;
                  const isHosting = hostingPresetId === quiz._id;
                  const diff = quiz.difficulty?.toUpperCase() || cfg.defaultDifficulty;
                  const isEasy = diff === 'EASY';

                  return (
                    <div
                      key={quiz._id || idx}
                      className="bg-white border border-[#ECEFF5] rounded-[16px] p-5 shadow-[0px_2px_14px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="space-y-3">
                        {/* Header Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg ${cfg.iconBg} text-white flex items-center justify-center shrink-0`}>
                              <IconComp className="w-4 h-4 stroke-[2]" />
                            </div>
                            <span className={`text-[11.5px] font-bold ${cfg.textColor} tracking-wider uppercase`}>
                              {cfg.name}
                            </span>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${
                            isEasy 
                              ? 'bg-[#ECFDF5] border-[rgba(167,243,208,0.8)] text-[#059669]'
                              : 'bg-[#FFFBEB] border-[rgba(253,230,138,0.8)] text-[#D97706]'
                          }`}>
                            {diff}
                          </span>
                        </div>

                        {/* Title & Desc */}
                        <div>
                          <h3 className="font-bold text-[14.5px] text-[#0F172A] leading-[20px] line-clamp-2 h-[40px]">
                            {quiz.title}
                          </h3>
                        </div>
                      </div>

                      {/* Card Footer: Meta Info & Actions */}
                      <div className="mt-4 pt-3 border-t border-[#F1F5F9] space-y-3">
                        <div className="flex items-center gap-4 text-[12px] font-medium text-[#64748B]">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{quiz.questionsCount || 10} Qs</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>~5 mins</span>
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleHostPreset(quiz)}
                            disabled={isHosting}
                            className="flex-1 h-[35px] px-3 bg-[#6C38FF] hover:bg-[#5827e8] disabled:opacity-60 text-white font-semibold text-[12.5px] rounded-full shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>{isHosting ? 'Starting...' : 'Host Live'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCloneAndEditPreset(quiz)}
                            className="w-9 h-9 rounded-full border border-[#E2E8F0] hover:bg-slate-50 flex items-center justify-center text-[#64748B] hover:text-[#6C38FF] transition-colors cursor-pointer"
                            title="Duplicate & customize quiz"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ========================================================================= */}
            {/* EMPTY STATE / CUSTOM QUIZ BANNER (Exact Figma 3D Illustration) */}
            {/* ========================================================================= */}
            {userQuizzes.length === 0 ? (
              <section className="bg-gradient-to-r from-[#EDE9FE] via-[#F4F1FD] to-[#E9E4FE] border border-[#DDD6FE]/70 rounded-[24px] p-6 sm:p-8 lg:px-12 shadow-[0px_2px_15px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12 text-left">
                
                {/* Subtle Wavy Shape in Background */}
                <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-30 select-none" 
                  preserveAspectRatio="none" 
                  viewBox="0 0 1000 140" 
                  fill="none"
                >
                  <path d="M0,70 C300,120 500,20 800,80 C900,100 950,50 1000,60 L1000,140 L0,140 Z" fill="#DDD6FE" />
                </svg>

                {/* Left Illustration: Clipboard & Gamepad */}
                <div className="relative w-36 h-28 flex items-center justify-center shrink-0 z-10">
                  {/* Floating Sparkles */}
                  <span className="absolute top-0 left-2 text-[#6C38FF] text-base leading-none select-none">✦</span>
                  <span className="absolute top-2 right-1 text-[#C084FC] text-xs leading-none select-none">✦</span>
                  <span className="absolute bottom-2 left-0 text-[#A78BFA] text-xs leading-none select-none">✦</span>

                  {/* Clipboard Graphic */}
                  <div className="w-24 h-24 bg-white border-2 border-[#D8B4FE] rounded-2xl shadow-md transform -rotate-6 flex flex-col justify-between p-2.5 pt-3.5 relative">
                    {/* Clip Header at Top */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-2.5 bg-[#C084FC] border border-white rounded-full shadow-sm" />

                    {/* Checklist Items */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[7px] text-[#6C38FF] font-black">✓</div>
                        <div className="h-1.5 w-12 bg-[#F3E8FF] rounded-full" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[7px] text-[#6C38FF] font-black">✓</div>
                        <div className="h-1.5 w-10 bg-[#F3E8FF] rounded-full" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[7px] text-[#6C38FF] font-black">✓</div>
                        <div className="h-1.5 w-11 bg-[#F3E8FF] rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Purple Gamepad Overlay */}
                  <div className="absolute -right-1 -bottom-1 w-12 h-12 bg-[#6C38FF] rounded-2xl shadow-xl transform rotate-12 flex items-center justify-center z-20">
                    <Gamepad2 className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Vertical Divider (Desktop) */}
                <div className="hidden md:block w-[1px] h-16 bg-[#E9D5FF] shrink-0 z-10" />

                {/* Right Content & Action */}
                <div className="flex-1 z-10 space-y-3 text-center md:text-left">
                  <div>
                    <h3 className="text-[20px] font-bold text-[#0F172A] tracking-tight leading-snug">
                      No Custom Quizzes Yet
                    </h3>
                    <p className="text-[13px] text-[#475569] mt-1 max-w-[560px]">
                      Create a brand new quiz from scratch or pick any ready-to-use quiz above to customize.
                    </p>
                  </div>

                  <div>
                    <Link
                      to="/quiz/create"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6C38FF] hover:bg-[#5827e8] text-white font-semibold text-[13.5px] rounded-full shadow-[0px_4px_16px_rgba(108,56,255,0.28)] transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                      <span>Create Quiz</span>
                    </Link>
                  </div>
                </div>
              </section>
            ) : (
              /* If User Already Has Custom Quizzes, Show Custom Quizzes Grid + Create Quiz Header */
              <section className="bg-white border border-[#EEF0F6] rounded-[24px] p-6 sm:p-8 shadow-[0px_2px_15px_rgba(0,0,0,0.06)] space-y-5 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-[18px] font-bold text-[#0F172A]">
                      My Custom Quizzes ({totalQuizzes})
                    </h3>
                    <p className="text-[13px] text-[#64748B] mt-0.5">
                      Battle sets created, duplicated, or customized by you.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/quiz/create"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6C38FF] hover:bg-[#5827e8] text-white text-[12.5px] font-semibold shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Quiz</span>
                    </Link>

                    <Link
                      to="/quiz/my"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[#475569] text-[12.5px] font-medium transition-all"
                    >
                      <span>Manage All</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredUserQuizzes.slice(0, 6).map((quiz) => (
                    <div
                      key={quiz._id}
                      className="p-5 rounded-2xl border border-slate-200/90 hover:border-purple-300 bg-white hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 uppercase tracking-wider">
                            {quiz.category || 'General'}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            {quiz.questions?.length || 0} Questions
                          </span>
                        </div>
                        <h4 className="font-bold text-[15px] text-slate-900 line-clamp-1 group-hover:text-purple-700 transition-colors">
                          {quiz.title}
                        </h4>
                        <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">
                          {quiz.description || 'Custom interactive trivia set created by host.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleHostGame(quiz._id)}
                          className="flex-1 py-2 px-3 rounded-full bg-[#6C38FF] hover:bg-[#5827e8] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Host Game</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/quiz/edit/${quiz._id}`)}
                          className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-purple-600 transition-colors"
                          title="Edit Quiz"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </main>
        </div>

        {/* ========================================================================= */}
        {/* MODALS */}
        {/* ========================================================================= */}

        {/* 1. SESSIONS HOSTED HISTORY MODAL */}
        {activeModal === 'sessions' && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="relative my-auto rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 bg-white text-slate-900">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-sky-100 text-sky-600 rounded-xl">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-slate-900">Hosted Sessions History</h3>
                    <p className="text-xs text-slate-500">Total live games executed: {totalGamesHosted}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-3">
                {hostedSessions.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <Clock className="h-10 w-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No hosted sessions found yet.</p>
                    <p className="text-xs text-slate-500">Launch a battle lobby to start hosting quiz sessions!</p>
                  </div>
                ) : (
                  hostedSessions.map((session, idx) => (
                    <div 
                      key={session._id || session.id || idx}
                      className="p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200 bg-slate-50/70 hover:border-purple-300 transition-all text-left"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-base text-slate-900">
                          {session.quizTitle || session.quiz?.title || 'Quiz Session'}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(session.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 text-purple-600 font-semibold">
                            <Users className="h-3.5 w-3.5" />
                            {session.players?.length || 0} Players
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveModal(null);
                          navigate(`/results/${session._id || session.id}`);
                        }}
                        className="px-4 py-2 bg-[#6C38FF] hover:bg-[#5827e8] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>View Analytics</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. TOTAL STUDENTS ROSTER MODAL */}
        {activeModal === 'students' && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="relative my-auto rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 bg-white text-slate-900">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-slate-900">Student Engagement Roster</h3>
                    <p className="text-xs text-slate-500">Unique connected students: {studentList.length}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-2.5">
                {studentList.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <UserCheck className="h-10 w-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No student records found yet.</p>
                    <p className="text-xs text-slate-500">Host a quiz session and let students join via 6-digit game PIN!</p>
                  </div>
                ) : (
                  studentList.map((st, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-xl flex items-center justify-between gap-3 border border-slate-200 bg-slate-50/60 hover:border-emerald-300 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          idx === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                          idx === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {idx === 0 ? <Trophy className="h-4 w-4 text-amber-500" /> : `#${idx + 1}`}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                            <span>{st.name}</span>
                            {idx === 0 && <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">Top Student</span>}
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            Participated in {st.sessionsCount} session{st.sessionsCount > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-emerald-600 text-sm">{st.totalScore} pts</div>
                        <span className="text-[9px] text-slate-400">Cumulative Score</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. PRO UPGRADE MODAL */}
        {activeModal === 'upgrade' && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="relative my-auto rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 bg-white text-slate-900 text-left">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-white to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl shadow-sm">
                    <Crown className="h-5 w-5 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Upgrade to Gubbi Pro</h3>
                    <p className="text-xs text-slate-500">Unlock unlimited multiplayer rooms, export reports, and custom trivia sets.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pro Plan Card */}
                  <div className="p-5 rounded-2xl border-2 border-purple-500 bg-purple-50/30 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                        Educator Pro
                      </span>
                      <h4 className="text-2xl font-black text-slate-900 mt-2">₹499 <span className="text-xs font-normal text-slate-500">/ month</span></h4>
                      <p className="text-xs text-slate-600 mt-1">Built for classroom teachers, coaching institutes, and active event hosts.</p>
                      
                      <ul className="mt-4 space-y-2 text-xs text-slate-700">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Unlimited quiz creation</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Unlimited live multiplayer participants</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> PDF &amp; Excel performance export</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Priority email support</li>
                      </ul>
                    </div>

                    <a 
                      href="mailto:info@fouriseindia.com?subject=Gubbi%20Pro%20Upgrade%20Inquiry"
                      className="w-full py-2.5 rounded-xl bg-[#6C38FF] hover:bg-[#5827e8] text-white text-xs font-bold text-center shadow-md transition-all block"
                    >
                      Contact for Pro Access
                    </a>
                  </div>

                  {/* Plan Comparison Table Section */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full">
                        Feature Overview
                      </span>
                      <div className="mt-3 overflow-x-auto text-xs">
                        <PlanComparisonTable />
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 text-center">
                      Need custom institutional pricing? Email <span className="font-semibold text-purple-600">info@fouriseindia.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. HOST PROFILE SETTINGS MODAL */}
        {activeModal === 'profile' && (
          <HostProfileModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            onUpdated={(updatedUser) => {
              setUser(updatedUser);
              setActiveModal(null);
            }}
          />
        )}

        {/* 5. DELETE ACCOUNT MODAL */}
        {activeModal === 'delete' && (
          <DeleteAccountModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
          />
        )}

      </div>
    </AnimatedPage>
  );
}
