import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, PlusCircle, HelpCircle, BarChart2,
  Settings, LogOut, Crown, ArrowRight, ArrowLeft, Search, Bell,
  ChevronDown, Plus, Play, Pencil, Trash2, Copy, RotateCw,
  Layers, FileEdit, Send, Clock, Users, X, MoreVertical,
  Rocket, Globe, Code, Calculator, FileText, Check, ShieldCheck,
  Menu
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import Logo from '../components/Logo';
import HostProfileModal from '../components/HostProfileModal';
import PlanComparisonTable from '../components/PlanComparisonTable';
import AppSidebar from '../components/AppSidebar';
import { getMyQuizzes, deleteQuiz, updateQuizStatus, createQuiz } from '../services/quizService';
import { getMyResults } from '../services/resultService';
import { createGame } from '../services/gameService';
import { clearAuthSession, getStoredUser } from '../utils/auth';

export default function MyQuizzes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [user, setUser] = useState(() => getStoredUser());
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'upgrade' | null
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'drafts' | 'published'
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [openCardMenuId, setOpenCardMenuId] = useState(null);

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
      if (!event.target.closest('.card-options-menu')) {
        setOpenCardMenuId(null);
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
      setOpenCardMenuId(null);
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

  // Fetch Quizzes Query
  const { 
    data: quizzesData,
    isLoading: isQuizzesLoading,
    isRefetching,
    refetch: refetchQuizzes
  } = useQuery({
    queryKey: ['my-quizzes-full'],
    queryFn: getMyQuizzes,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 15000,
  });

  // Fetch Game Session Results (for real-time plays count)
  const {
    data: resultsData
  } = useQuery({
    queryKey: ['my-results'],
    queryFn: getMyResults,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 15000,
  });

  // Host Game Mutation
  const hostGameMutation = useMutation({
    mutationFn: createGame,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Lobby initialized! PIN is live.');
        navigate(`/host/lobby/${data.game.pin}`);
      } else {
        toast.error(data.message || 'Lobby creation failed');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error creating lobby session');
    }
  });

  // Delete Quiz Mutation
  const deleteQuizMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      toast.success('Quiz deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['my-quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['my-quizzes-full'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error deleting quiz');
    }
  });

  // Publish / Status Toggle Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateQuizStatus(id, status),
    onSuccess: (res, vars) => {
      const isPublished = vars.status === 'published';
      toast.success(isPublished ? 'Quiz published! Ready to host live. 🚀' : 'Moved to drafts. 📝');
      queryClient.invalidateQueries({ queryKey: ['my-quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['my-quizzes-full'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update quiz status');
    }
  });

  const handleHostGame = (quiz) => {
    if (quiz.status === 'draft' || quiz.isDraft) {
      toast.error('This quiz is currently a Draft. Please publish it before hosting!', { icon: '⚠️' });
      return;
    }
    toast.loading('Initializing lobby...', { id: 'lobby-init' });
    hostGameMutation.mutate(quiz._id, {
      onSettled: () => toast.dismiss('lobby-init')
    });
  };

  const handlePublish = (quiz) => {
    statusMutation.mutate({ id: quiz._id, status: 'published' });
  };

  const handleUnpublish = (quiz) => {
    statusMutation.mutate({ id: quiz._id, status: 'draft' });
  };

  const handleDeleteQuiz = (quiz) => {
    if (window.confirm(`Are you sure you want to delete "${quiz.title}"? This cannot be undone.`)) {
      toast.loading('Deleting quiz...', { id: 'quiz-del' });
      deleteQuizMutation.mutate(quiz._id, {
        onSettled: () => toast.dismiss('quiz-del')
      });
    }
  };

  const handleDuplicateQuiz = async (quiz) => {
    toast.loading('Duplicating quiz...', { id: 'dup-quiz' });
    try {
      const res = await createQuiz({
        title: `${quiz.title} (Copy)`,
        category: quiz.category || 'general knowledge',
        description: quiz.description || '',
        organizationName: quiz.organizationName || '',
        questions: quiz.questions || [],
        backgroundImage: quiz.backgroundImage || '',
        status: 'draft',
        isDraft: true
      });
      if (res.success) {
        toast.success('Duplicated as a new draft! 📝', { id: 'dup-quiz' });
        queryClient.invalidateQueries({ queryKey: ['my-quizzes'] });
        queryClient.invalidateQueries({ queryKey: ['my-quizzes-full'] });
      } else {
        toast.error(res.message || 'Failed to duplicate quiz', { id: 'dup-quiz' });
      }
    } catch (err) {
      toast.error('Error duplicating quiz', { id: 'dup-quiz' });
    }
  };

  // Map play counts by quiz ID and title from live results
  const playCountMap = {};
  (resultsData?.results || []).forEach(res => {
    const rawId = res.quizId?._id || res.quizId || res.quiz?._id;
    const idStr = rawId ? String(rawId) : null;
    const titleKey = res.quizTitle ? `title:${String(res.quizTitle).trim().toLowerCase()}` : null;
    const count = (Array.isArray(res.players) && res.players.length > 0) ? res.players.length : 1;
    if (idStr) {
      playCountMap[idStr] = (playCountMap[idStr] || 0) + count;
    }
    if (titleKey) {
      playCountMap[titleKey] = (playCountMap[titleKey] || 0) + count;
    }
  });

  const rawQuizzes = quizzesData?.quizzes || [];
  // Sort newest first
  const allQuizzes = [...rawQuizzes].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime() || 0;
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime() || 0;
    return timeB - timeA;
  });

  // Calculate Draft vs Published counts
  const draftsCount = allQuizzes.filter(q => q.status === 'draft' || q.isDraft === true).length;
  const publishedCount = allQuizzes.filter(q => q.status !== 'draft' && q.isDraft !== true).length;
  const totalCount = allQuizzes.length;

  // Filter based on active tab and search query
  const filteredQuizzes = allQuizzes.filter(quiz => {
    const isDraft = quiz.status === 'draft' || quiz.isDraft === true;
    if (activeTab === 'drafts' && !isDraft) return false;
    if (activeTab === 'published' && isDraft) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = quiz.title?.toLowerCase().includes(q);
      const matchCat = quiz.category?.toLowerCase().includes(q);
      const matchDesc = quiz.description?.toLowerCase().includes(q);
      return matchTitle || matchCat || matchDesc;
    }
    return true;
  });

  const userName = user?.name || user?.username || 'Mohsin';
  const userInitial = (userName.charAt(0) || 'M').toUpperCase();

  // Pick category icon based on name
  const getSubjectIcon = (category = '', title = '') => {
    const txt = `${category} ${title}`.toLowerCase();
    if (txt.includes('space') || txt.includes('rocket') || txt.includes('solar') || txt.includes('sci')) {
      return Rocket;
    }
    if (txt.includes('geo') || txt.includes('world') || txt.includes('capital') || txt.includes('flag') || txt.includes('country')) {
      return Globe;
    }
    if (txt.includes('code') || txt.includes('prog') || txt.includes('web') || txt.includes('js') || txt.includes('react')) {
      return Code;
    }
    if (txt.includes('math') || txt.includes('num') || txt.includes('calc')) {
      return Calculator;
    }
    return BookOpen;
  };

  // Helper for friendly edited time ago
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'recently';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <AnimatedPage>
      <div className="relative min-h-screen bg-[#FDFDFE] text-[#1E293B] font-['Inter',sans-serif] selection:bg-[#6222F5]/20 selection:text-[#6222F5] overflow-x-hidden">
        
        {/* ─── 1. LEFT SIDEBAR (230px, Fixed Desktop, Drawer Mobile) ─── */}
        <AppSidebar
          isOpen={isMobileNavOpen}
          onClose={() => {
            setIsMobileNavOpen(false);
            setIsProfileDropdownOpen(false);
            setIsNotificationsOpen(false);
            setOpenCardMenuId(null);
          }}
          onOpenProfile={() => setActiveModal('profile')}
          onOpenUpgrade={() => setActiveModal('upgrade')}
          onOpenSessions={() => navigate('/dashboard')}
          activeNav="my-quizzes"
        />

        {/* ========================================================================= */}
        {/* MAIN CONTENT WRAPPER (TopHeader + My Quizzes Body) */}
        {/* ========================================================================= */}
        <div className="lg:pl-[230px] flex flex-col min-h-screen">
          
          {/* TOP HEADER (Clean, Mobile Friendly, Notification Removed) */}
          <header className="sticky top-0 z-30 h-14 sm:h-[70px] bg-white/90 backdrop-blur-md border-b border-[#EEF0F6] px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
            {/* Left Hamburger + Mobile Brand Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button 
                type="button"
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  setIsNotificationsOpen(false);
                  setOpenCardMenuId(null);
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
          {/* MAIN CONTENT BODY (Matching Figma: Title & Action, Overview Banner, Tabs & Cards) */}
          {/* ========================================================================= */}
          <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-[1121px] w-full mx-auto">
            
            {/* Title & Action Bar */}
            <div className="flex items-center justify-between gap-3 text-left">
              {/* Left: Back Button & Page Heading */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E6E4EE] shadow-2xs flex items-center justify-center hover:bg-slate-50 transition-all cursor-pointer shrink-0"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#374151] stroke-[2]" />
                </button>
                <div className="min-w-0">
                  <h1 className="font-extrabold text-xl sm:text-[30px] sm:leading-[36px] text-[#161427] tracking-tight truncate">
                    My Quizzes
                  </h1>
                  <p className="font-medium text-xs sm:text-[14px] leading-tight sm:leading-[20px] text-[#6B7280] mt-0.5 truncate">
                    Manage and launch your multiplayer rooms.
                  </p>
                </div>
              </div>

              {/* Right: Primary Action Button */}
              <Link
                to="/quiz/create"
                className="px-3.5 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#6222F5] hover:bg-[#5015E0] text-white font-bold text-xs sm:text-[14px] shadow-[0px_10px_15px_-3px_rgba(98,34,245,0.3)] flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Quiz</span>
              </Link>
            </div>

            {/* Section - Overview Banner (Side-by-side on both mobile & desktop) */}
            <section className="w-full rounded-2xl sm:rounded-[32px] bg-gradient-to-r from-[#F3F0FE] via-[#EDE7FE] to-[#F4EEFD] border border-[#E8E1FB] p-4 sm:px-8 sm:py-6 shadow-[0px_2px_15px_rgba(0,0,0,0.04)] relative overflow-hidden flex items-center justify-between gap-4 text-left">
              
              {/* Subtle Decorative Wave Shape */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none opacity-30 select-none" 
                preserveAspectRatio="none" 
                viewBox="0 0 1000 170" 
                fill="none"
              >
                <path d="M0,90 C300,140 550,50 800,110 C900,130 950,80 1000,95 L1000,170 L0,170 Z" fill="#DDD6FE" />
              </svg>

              {/* Left Side: Document Icon & Collection Count */}
              <div className="flex items-center gap-3 sm:gap-5 z-10 min-w-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#DFD6FB] shadow-[inset_0px_2px_4px_rgba(0,0,0,0.05)] flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-[#6222F5] stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-[14px] font-medium text-[#6B7280] block truncate">Your quiz collection</span>
                  <span className="text-xl sm:text-[30px] font-extrabold text-[#161427] tracking-tight leading-tight block mt-0.5">
                    {totalCount} {totalCount === 1 ? 'quiz' : 'quizzes'}
                  </span>
                </div>
              </div>

              {/* Right Side: Decorative 3D Checklist & Game Controller Vector Graphics */}
              <div className="relative w-24 h-20 sm:w-56 sm:h-32 flex items-center justify-end shrink-0 z-10 scale-75 sm:scale-100 origin-right">
                {/* Floating Sparkles */}
                <span className="absolute top-1 left-2 sm:top-2 sm:left-6 text-[#8B5CF6] text-xs sm:text-sm select-none">✦</span>
                <span className="absolute bottom-2 left-0 sm:bottom-4 sm:left-4 text-[#8B5CF6] text-xs sm:text-base select-none">✦</span>

                {/* 3D Clipboard Graphic */}
                <div className="w-16 h-20 sm:w-20 sm:h-24 bg-white border-2 border-[#8B5CF6]/50 rounded-xl sm:rounded-2xl shadow-md transform rotate-[18deg] flex flex-col justify-between p-2 pt-2.5 relative">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-[#8B5CF6] border border-white rounded-full" />
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#EDE9FE] border border-[#6222F5] flex items-center justify-center text-[5px] text-[#6222F5] font-black">✓</div>
                      <div className="h-1 w-7 sm:w-9 bg-[#E2DCFD] rounded-full" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#EDE9FE] border border-[#6222F5] flex items-center justify-center text-[5px] text-[#6222F5] font-black">✓</div>
                      <div className="h-1 w-6 sm:w-8 bg-[#E2DCFD] rounded-full" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#EDE9FE] border border-[#6222F5] flex items-center justify-center text-[5px] text-[#6222F5] font-black">✓</div>
                      <div className="h-1 w-5 sm:w-7 bg-[#E2DCFD] rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Purple Game Controller Overlay */}
                <div className="absolute right-0 bottom-0 sm:right-2 sm:bottom-1 w-16 h-11 sm:w-20 sm:h-14 bg-[#6222F5] rounded-xl sm:rounded-2xl shadow-lg transform rotate-[8deg] flex items-center justify-center border-2 border-[#5015E0]">
                  <div className="flex items-center justify-between w-full px-2 sm:px-2.5">
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[#EDE9FE] rounded-xs flex items-center justify-center text-[6px] sm:text-[7px] text-[#6222F5] font-black">+</div>
                    <div className="flex items-center gap-1">
                      <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#C4B5FD]" />
                      <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#C4B5FD]" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Filter, Search & Status Bar */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4 pt-1">
              
              {/* Search within quizzes */}
              <div className="relative w-full md:max-w-[384px] h-[40px] sm:h-[42px]">
                <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search my quizzes..."
                  className="w-full h-full bg-white border border-[#E6E4EE] rounded-full shadow-[0px_1px_2px_rgba(0,0,0,0.05)] pl-10 sm:pl-11 pr-4 text-xs sm:text-[14px] text-[#1E293B] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6222F5] transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Pill Tabs & Refresh */}
              <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-none w-full md:w-auto">
                
                {/* Button - All */}
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`
                    px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-[14px] flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer
                    ${activeTab === 'all'
                      ? 'bg-[#6222F5] text-white font-bold shadow-[0px_4px_6px_-1px_rgba(98,34,245,0.25)]'
                      : 'bg-white border border-[#E6E4EE] text-[#374151] font-semibold hover:bg-slate-50 shadow-2xs'
                    }
                  `}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All ({totalCount})</span>
                </button>

                {/* Button - Drafts */}
                <button
                  type="button"
                  onClick={() => setActiveTab('drafts')}
                  className={`
                    px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-[14px] flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer
                    ${activeTab === 'drafts'
                      ? 'bg-[#6222F5] text-white font-bold shadow-[0px_4px_6px_-1px_rgba(98,34,245,0.25)]'
                      : 'bg-white border border-[#E6E4EE] text-[#374151] font-semibold hover:bg-slate-50 shadow-2xs'
                    }
                  `}
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Drafts ({draftsCount})</span>
                </button>

                {/* Button - Published */}
                <button
                  type="button"
                  onClick={() => setActiveTab('published')}
                  className={`
                    px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-[14px] flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer
                    ${activeTab === 'published'
                      ? 'bg-[#6222F5] text-white font-bold shadow-[0px_4px_6px_-1px_rgba(98,34,245,0.25)]'
                      : 'bg-white border border-[#E6E4EE] text-[#374151] font-semibold hover:bg-slate-50 shadow-2xs'
                    }
                  `}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Published ({publishedCount})</span>
                </button>

                {/* Refresh Button */}
                <button
                  type="button"
                  onClick={() => refetchQuizzes()}
                  className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-xl sm:rounded-2xl bg-white border border-[#E6E4EE] shadow-2xs flex items-center justify-center text-[#4B5563] hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                  title="Refresh quiz list"
                >
                  <RotateCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefetching ? 'animate-spin text-[#6222F5]' : ''}`} />
                </button>

              </div>
            </div>

            {/* ========================================================================= */}
            {/* QUIZ CARDS LIST (Horizontal Card Items matching Figma 1:1) */}
            {/* ========================================================================= */}
            <div className="flex flex-col gap-4 text-left">
              {filteredQuizzes.length === 0 ? (
                <div className="rounded-[28px] bg-white border border-[#ECEAF3] p-12 text-center space-y-4 shadow-sm">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">
                      {activeTab === 'drafts' ? 'No draft quizzes found' : 
                       activeTab === 'published' ? 'No published quizzes found' : 'No quizzes found'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                      {searchQuery 
                        ? `No quizzes matched "${searchQuery}". Clear your search to view all.`
                        : activeTab === 'drafts' 
                        ? 'Create a new quiz and click "Save as Draft" to work on it later.'
                        : 'Create your first multiplayer battle set to host live.'
                      }
                    </p>
                  </div>
                  <div>
                    <Link
                      to="/quiz/create"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6222F5] hover:bg-[#5015E0] text-white font-semibold text-sm shadow-md transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create a Quiz</span>
                    </Link>
                  </div>
                </div>
              ) : (
                filteredQuizzes.map((quiz) => {
                  const isDraft = quiz.status === 'draft' || quiz.isDraft === true;
                  const IconComp = getSubjectIcon(quiz.category, quiz.title);
                  const questionsCount = quiz.questions?.length || 0;
                  const estimatedMinutes = Math.max(3, Math.ceil(questionsCount * 0.8));
                  const idStr = String(quiz._id || '');
                  const titleKey = `title:${String(quiz.title || '').trim().toLowerCase()}`;
                  const plays = (typeof quiz.playsCount === 'number' && quiz.playsCount > 0)
                    ? quiz.playsCount
                    : (playCountMap[idStr] || playCountMap[titleKey] || 0);
                  const isMenuOpen = openCardMenuId === quiz._id;

                  return (
                    <article
                      key={quiz._id}
                      className="relative rounded-[22px] sm:rounded-[28px] bg-white border border-[#ECEAF3] p-3.5 sm:px-6 sm:py-5 shadow-[0px_4px_20px_-2px_rgba(99,58,240,0.05),0px_2px_6px_-1px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 md:gap-5 transition-all hover:shadow-md hover:border-purple-200"
                    >
                      {/* Left: Subject Icon + Title & Meta Information */}
                      <div className="flex items-start sm:items-center gap-3 sm:gap-5 flex-1 min-w-0 w-full md:w-auto">
                        {/* Subject Icon Box */}
                        <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-2xl bg-[#F4F0FF] flex items-center justify-center text-[#6222F5] shrink-0 mt-0.5 sm:mt-0">
                          <IconComp className="w-5 h-5 sm:w-8 sm:h-8 stroke-[2]" />
                        </div>

                        {/* Quiz Information & Status */}
                        <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0">
                          <h3 className="font-extrabold text-[15px] sm:text-[18px] leading-snug sm:leading-[28px] text-[#161427] truncate pr-20 sm:pr-24 md:pr-0">
                            {quiz.title}
                          </h3>

                          {/* Meta Row */}
                          <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] sm:text-[12px] font-semibold text-[#6B7280] flex-wrap pt-0.5">
                            <span className="inline-flex items-center gap-1 shrink-0">
                              <BookOpen className="w-3.5 h-3.5 text-[#94A3B8]" />
                              <span className="hidden sm:inline">{questionsCount} Questions</span>
                              <span className="sm:hidden">{questionsCount} Qs</span>
                            </span>
                            <span className="text-[#D1D5DB]">•</span>
                            <span className="inline-flex items-center gap-1 shrink-0">
                              <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                              <span>{estimatedMinutes} mins</span>
                            </span>
                            <span className="text-[#D1D5DB]">•</span>
                            
                            {/* Published Shows Plays; Draft Shows Edited Time */}
                            {!isDraft ? (
                              <span className="inline-flex items-center gap-1 text-[#6222F5] font-bold shrink-0">
                                <Users className="w-3.5 h-3.5 stroke-[2]" />
                                <span>{plays} Plays</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#6B7280] shrink-0">
                                <span>Edited {formatTimeAgo(quiz.updatedAt || quiz.createdAt)}</span>
                              </span>
                            )}
                          </div>

                          {/* State Tag */}
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className={`w-2 h-2 rounded-full ${isDraft ? 'bg-[#FBBF24]' : 'bg-[#10B981]'}`} />
                            <span className={`text-[11.5px] sm:text-[12px] font-medium ${isDraft ? 'text-[#D97706]' : 'text-[#6B7280]'}`}>
                              {isDraft ? 'Draft in progress' : 'Ready to host'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Badge & Action Buttons */}
                      <div className="flex flex-col items-end gap-3 w-full md:w-auto shrink-0 pt-1 md:pt-0">
                        
                        {/* Top: Status Badge & 3-Dots More Options */}
                        <div className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 md:static flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                          {/* Badge */}
                          {isDraft ? (
                            <span className="bg-[#FEF6E8] text-[#F59E0B] font-bold text-[11px] sm:text-[12px] rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 tracking-wide">
                              Draft
                            </span>
                          ) : (
                            <span className="bg-[#EBFBF3] text-[#10B981] font-bold text-[11px] sm:text-[12px] rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 tracking-wide">
                              Published
                            </span>
                          )}

                          {/* More Options Dropdown */}
                          <div className="relative card-options-menu">
                            <button
                              type="button"
                              onClick={() => setOpenCardMenuId(isMenuOpen ? null : quiz._id)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Quiz options"
                            >
                              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-0 mt-1 w-44 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                                {isDraft ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenCardMenuId(null);
                                      handlePublish(quiz);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Publish Quiz</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenCardMenuId(null);
                                      handleUnpublish(quiz);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                                  >
                                    <FileEdit className="w-3.5 h-3.5" />
                                    <span>Move to Drafts</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenCardMenuId(null);
                                    handleDuplicateQuiz(quiz);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Duplicate Quiz</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenCardMenuId(null);
                                    navigate(`/quiz/edit/${quiz._id}`);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Edit Questions</span>
                                </button>

                                <div className="my-1 border-t border-slate-100" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenCardMenuId(null);
                                    handleDeleteQuiz(quiz);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  <span>Delete Quiz</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Actions Row */}
                        <div className="w-full md:w-auto flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100/90 md:border-0 md:pt-0 shrink-0">
                          {/* If Published: Edit icon + "▶ Host Room" */}
                          {!isDraft ? (
                            <>
                              <button
                                type="button"
                                onClick={() => navigate(`/quiz/edit/${quiz._id}`)}
                                className="w-[38px] h-[38px] rounded-xl border border-[#E6E4EE] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#6222F5] hover:bg-slate-50 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer shrink-0"
                                title="Edit Quiz"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleHostGame(quiz)}
                                className="h-[40px] px-5 rounded-xl bg-[#6222F5] hover:bg-[#5015E0] text-white font-bold text-[14px] shadow-[0px_4px_6px_-1px_rgba(98,34,245,0.25),0px_2px_4px_-2px_rgba(98,34,245,0.25)] flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>Host Room</span>
                              </button>
                            </>
                          ) : (
                            /* If Draft: "Publish" pill + "✏️ Edit Quiz" */
                            <>
                              <button
                                type="button"
                                onClick={() => handlePublish(quiz)}
                                className="h-[38px] px-5 rounded-full border border-[#E6E4EE] bg-white hover:bg-purple-50 hover:border-purple-300 text-[#374151] hover:text-[#6222F5] font-bold text-[14px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-all cursor-pointer whitespace-nowrap"
                              >
                                Publish
                              </button>

                              <button
                                type="button"
                                onClick={() => navigate(`/quiz/edit/${quiz._id}`)}
                                className="h-[40px] px-5 rounded-xl bg-[#F3EFFF] hover:bg-[#EAE4FF] border border-[#E5DBFD] text-[#6222F5] font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                              >
                                <Pencil className="w-4 h-4" />
                                <span>Edit Quiz</span>
                              </button>
                            </>
                          )}
                        </div>

                      </div>
                    </article>
                  );
                })
              )}
            </div>

          </main>
        </div>

        {/* ========================================================================= */}
        {/* MODALS */}
        {/* ========================================================================= */}
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

      </div>
    </AnimatedPage>
  );
}
