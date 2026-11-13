import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart2,
  BarChart3,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  ArrowRight,
  LogOut,
  X,
  Settings,
  LayoutGrid,
  Calendar,
  Film,
  Globe,
  FlaskConical,
  Sparkles,
  Code,
  Users,
  PlayCircle,
  HelpCircle,
  Check,
  Clock,
  Menu,
  Trophy,
  ExternalLink,
  BookOpen,
  Gamepad2,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import Logo from '../components/Logo';
import HostProfileModal from '../components/HostProfileModal';
import PlanComparisonTable from '../components/PlanComparisonTable';
import AppSidebar from '../components/AppSidebar';
import { getMyQuizzes } from '../services/quizService';
import { getMyResults } from '../services/resultService';
import { clearAuthSession, getStoredUser } from '../utils/auth';

// ── Canonical Demo Benchmark Reports from Figma Spec ─────────────────────────
const BENCHMARK_REPORTS = [
  {
    id: 'rep-bench-1',
    title: 'Blockbusters & Pop Culture Quiz',
    category: 'Pop Culture',
    questionsCount: 10,
    sessionsCount: 12,
    participantsCount: 320,
    avgScore: 82,
    date: '2026-01-20T12:00:00Z',
    iconType: 'film',
    isReal: false
  },
  {
    id: 'rep-bench-2',
    title: 'World Capitals and Geography Challenge',
    category: 'Geography',
    questionsCount: 15,
    sessionsCount: 10,
    participantsCount: 280,
    avgScore: 74,
    date: '2026-01-18T12:00:00Z',
    iconType: 'globe',
    isReal: false
  },
  {
    id: 'rep-bench-3',
    title: 'General Science & Nature Challenge',
    category: 'Science',
    questionsCount: 10,
    sessionsCount: 8,
    participantsCount: 210,
    avgScore: 78,
    date: '2026-01-15T12:00:00Z',
    iconType: 'flask',
    isReal: false
  },
  {
    id: 'rep-bench-4',
    title: 'Solar System & Planetary Trivia',
    category: 'Science',
    questionsCount: 12,
    sessionsCount: 9,
    participantsCount: 190,
    avgScore: 69,
    date: '2026-01-12T12:00:00Z',
    iconType: 'sparkles',
    isReal: false
  },
  {
    id: 'rep-bench-5',
    title: 'Modern React and JavaScript Fundamentals',
    category: 'Technology',
    questionsCount: 15,
    sessionsCount: 9,
    participantsCount: 240,
    avgScore: 71,
    date: '2026-01-10T12:00:00Z',
    iconType: 'code',
    isReal: false
  }
];

export default function Reports() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => getStoredUser());
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'upgrade' | 'viewSample' | null
  const [selectedSampleReport, setSelectedSampleReport] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [headerSearch, setHeaderSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('30days'); // '7days' | '30days' | '90days' | 'all'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Mobile drawer & dropdown controls
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

  const profileDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const dateDropdownRef = useRef(null);

  // Sync user profile across windows & events
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

  // Dismiss dropdowns on outside click or touch
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setIsCategoryOpen(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target)) {
        setIsDateFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Lock body scroll when mobile navigation drawer is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = 'hidden';
      setIsProfileDropdownOpen(false);
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

  // Queries for real user data
  const { data: quizzesData } = useQuery({
    queryKey: ['my-quizzes'],
    queryFn: getMyQuizzes,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 15000,
  });

  const { data: resultsData } = useQuery({
    queryKey: ['my-results'],
    queryFn: getMyResults,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 15000,
  });

  const rawQuizzes = quizzesData?.quizzes || [];
  const realSessions = resultsData?.results || [];

  // Compute Combined Reports List
  const allReports = useMemo(() => {
    // Transform real completed game sessions
    const realReportRows = realSessions.map((s, idx) => {
      const players = s.players || [];
      const totalScore = players.reduce((sum, p) => sum + (p.totalScore || 0), 0);
      const avgScore = players.length ? Math.round(totalScore / players.length) : 0;
      // Convert to a percentage if totalQuestions is known
      const totalQ = s.totalQuestions || s.quizId?.questions?.length || 10;
      const avgPercent = totalQ > 0 ? Math.min(100, Math.round((avgScore / (totalQ * 100)) * 100)) : 75;

      const category = s.quizId?.category || 'General Knowledge';
      let iconType = 'film';
      if (/geo|map|capital/i.test(category)) iconType = 'globe';
      else if (/science|nature|chem|phys/i.test(category)) iconType = 'flask';
      else if (/space|solar|planet/i.test(category)) iconType = 'sparkles';
      else if (/code|react|tech|prog/i.test(category)) iconType = 'code';

      return {
        id: s._id || `real-${idx}`,
        title: s.quizTitle || s.quizId?.title || 'Quiz Session',
        category: category,
        questionsCount: totalQ,
        sessionsCount: 1,
        participantsCount: players.length,
        avgScore: avgPercent || 75,
        date: s.playedAt || s.createdAt || new Date().toISOString(),
        iconType,
        isReal: true,
        sessionId: s._id
      };
    });

    if (realReportRows.length > 0) {
      return realReportRows;
    }
    // If no real sessions have been played yet, display the canonical Figma benchmark set
    return BENCHMARK_REPORTS;
  }, [realSessions]);

  // Metric Computations (Matching 4 Stat Metric Cards)
  const totalQuizzesMetric = rawQuizzes.length || 12;
  const totalSessionsMetric = realSessions.length || 48;
  const totalParticipantsMetric = useMemo(() => {
    if (realSessions.length > 0) {
      return realSessions.reduce((sum, s) => sum + (s.players?.length || 0), 0);
    }
    return 1240;
  }, [realSessions]);

  const averageScoreMetric = useMemo(() => {
    if (allReports.length > 0) {
      const sum = allReports.reduce((acc, r) => acc + r.avgScore, 0);
      return Math.round(sum / allReports.length);
    }
    return 76;
  }, [allReports]);

  // Filter & Search Logic
  const filteredReports = useMemo(() => {
    const q = (searchQuery || headerSearch).trim().toLowerCase();

    return allReports
      .filter((rep) => {
        // Search Filter
        if (q) {
          const matchTitle = rep.title.toLowerCase().includes(q);
          const matchCat = rep.category.toLowerCase().includes(q);
          const matchPart = String(rep.participantsCount).includes(q);
          if (!matchTitle && !matchCat && !matchPart) return false;
        }

        // Category Filter
        if (selectedCategory !== 'All') {
          if (rep.category.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        // Date Range Filter
        if (selectedDateRange !== 'all') {
          const repTime = new Date(rep.date).getTime();
          const now = Date.now();
          const daysDiff = (now - repTime) / (1000 * 60 * 60 * 24);

          if (selectedDateRange === '7days' && daysDiff > 7) return false;
          if (selectedDateRange === '30days' && daysDiff > 30) return false;
          if (selectedDateRange === '90days' && daysDiff > 90) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [allReports, searchQuery, headerSearch, selectedCategory, selectedDateRange, sortOrder]);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / itemsPerPage));
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage, itemsPerPage]);

  // Adjust page if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, headerSearch, selectedCategory, selectedDateRange]);

  const userInitial = (user?.name || user?.fullName || 'Mohsin').charAt(0).toUpperCase();
  const userName = user?.name || user?.fullName || 'Mohsin';

  // Helper for row icon rendering
  const renderRowIcon = (type) => {
    switch (type) {
      case 'globe':
        return <Globe className="w-5 h-5 text-[#2563EB]" />;
      case 'flask':
        return <FlaskConical className="w-5 h-5 text-[#6320EE]" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-[#6320EE]" />;
      case 'code':
        return <Code className="w-5 h-5 text-[#6320EE]" />;
      case 'film':
      default:
        return <Film className="w-5 h-5 text-[#6320EE]" />;
    }
  };

  // Helper for Category Badges
  const getCategoryBadgeClass = (category) => {
    const c = category.toLowerCase();
    if (c.includes('pop')) return 'bg-[rgba(243,232,255,0.7)] text-[#7E22CE]';
    if (c.includes('geography')) return 'bg-[#F0F9FF] text-[#0369A1]';
    if (c.includes('science')) return 'bg-[#FFFBEB] text-[#B45309]';
    if (c.includes('tech')) return 'bg-[#F0F9FF] text-[#0369A1]';
    return 'bg-[#FAF5FF] text-[#6320EE]';
  };

  // Helper for date formatting
  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Jan 20, 2026';
    }
  };

  const handleViewReport = (report) => {
    if (report.isReal && report.sessionId) {
      navigate(`/results/${report.sessionId}`);
    } else {
      setSelectedSampleReport(report);
      setActiveModal('viewSample');
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-[#FDFDFE] flex flex-col font-['Inter',sans-serif] text-slate-800 antialiased selection:bg-[#6320EE]/20 selection:text-[#6320EE]">
        {/* ─── APP SIDEBAR (Canonical Component) ─── */}
        <AppSidebar
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          onOpenProfile={() => setActiveModal('profile')}
          onOpenUpgrade={() => setActiveModal('upgrade')}
          activeNav="reports"
        />

        {/* ─── MAIN CONTENT WRAPPER (Shifted by 230px on desktop) ─── */}
        <div className="flex-1 flex flex-col lg:pl-[230px] w-full min-w-0 transition-all">
          
          {/* ========================================================================= */}
          {/* TOP HEADER (74px height, exact Figma specifications) */}
          {/* ========================================================================= */}
          <header className="sticky top-0 z-30 h-[74px] max-h-[74px] px-4 sm:px-8 bg-white/80 backdrop-blur-md border-b border-[#EEF0F6] flex items-center justify-between gap-4">
            
            {/* Left: Mobile Drawer Hamburger Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Center: Global Search Input Container (580px max-width, pill) */}
            <div className="hidden sm:flex flex-1 max-w-[580px] mx-auto items-center">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Search quizzes, topics, or participants..."
                  className="w-full h-[46px] pl-11 pr-10 rounded-full bg-[#FAF9FD] border border-[#E9EAF2] text-[13.5px] font-bold text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#6320EE] focus:ring-2 focus:ring-[#6320EE]/15 transition-all"
                />
                {headerSearch && (
                  <button
                    type="button"
                    onClick={() => setHeaderSearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B] p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Top Right Controls: User Profile Pill ONLY */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* User Profile Pill */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="h-[42px] pl-1 pr-3 py-1 rounded-full bg-white border border-[#E7E9F2] shadow-2xs hover:bg-[#FAF9FD] transition-colors flex items-center gap-2 cursor-pointer select-none"
                  aria-label="User Profile"
                >
                  {/* Purple Circle Avatar (32px x 32px) */}
                  <div className="w-8 h-8 rounded-full bg-[#6C38FF] text-white font-semibold text-[13px] flex items-center justify-center shrink-0 shadow-2xs">
                    {userInitial}
                  </div>
                  <span className="text-[13.5px] font-semibold text-[#1E293B] max-w-[80px] truncate hidden sm:inline">
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
          {/* MAIN BODY CONTENT (Exact Figma spacing, max-width: 1280px) */}
          {/* ========================================================================= */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1280px] w-full mx-auto text-left">
            
            {/* ── SECTION 1: HERO BANNER (Responsive on mobile) ── */}
            <section className="min-h-[110px] sm:min-h-[146px] p-4 sm:p-6 sm:px-8 rounded-[20px] sm:rounded-[24px] bg-gradient-to-r from-[#F2EDFF] via-[#F4EFFF] to-[#EDE5FF] border border-[#F3E8FF]/70 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
              
              {/* Left Side: White Icon Tile + Title & Subtitle */}
              <div className="flex items-center gap-3.5 sm:gap-5 z-10">
                {/* Responsive Tile with Purple Icon */}
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white shadow-xs flex items-center justify-center shrink-0 border border-white">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-[#6320EE]" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] tracking-tight leading-tight">
                    My Reports
                  </h1>
                  <p className="text-xs sm:text-sm font-medium text-[#64748B] mt-0.5">
                    View and analyze performance reports for your quizzes.
                  </p>
                </div>
              </div>

              {/* Right Side: 3D Illustrated Analytics Graphic */}
              <div className="hidden md:flex items-center justify-center shrink-0 pr-2 z-10 select-none">
                <svg
                  width="120"
                  height="96"
                  viewBox="0 0 120 96"
                  fill="none"
                  className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)] drop-shadow-[0_4px_6px_rgba(0,0,0,0.07)]"
                >
                  {/* Floating Background Glow & Shadow */}
                  <ellipse cx="60" cy="78" rx="42" ry="7" fill="#C4B5FD" fillOpacity="0.35" />

                  {/* Clipboard Base (Purple) */}
                  <rect x="25" y="14" width="62" height="66" rx="12" fill="#6320EE" />
                  
                  {/* Inner White Page */}
                  <rect x="29" y="18" width="54" height="58" rx="9" fill="#FFFFFF" />

                  {/* Clipboard Top Clip */}
                  <rect x="44" y="10" width="24" height="9" rx="4" fill="#8B5CF6" />
                  <rect x="52" y="12" width="8" height="3" rx="1.5" fill="#FFFFFF" />

                  {/* 4 Rising Bar Chart Columns */}
                  <rect x="36" y="52" width="8" height="18" rx="3" fill="#DDD6FE" />
                  <rect x="46" y="42" width="8" height="28" rx="3" fill="#A78BFA" />
                  <rect x="56" y="32" width="8" height="38" rx="3" fill="#7C3AED" />
                  <rect x="66" y="46" width="8" height="24" rx="3" fill="#6320EE" />

                  {/* 3D Circular Donut Chart at Bottom Right */}
                  <g transform="translate(74, 52)">
                    <circle cx="16" cy="16" r="14" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2.5" />
                    <path d="M16,2 A14,14 0 0,1 30,16 L16,16 Z" fill="#6320EE" />
                    <path d="M30,16 A14,14 0 0,1 16,30 L16,16 Z" fill="#EC4899" />
                    <circle cx="16" cy="16" r="6" fill="#FFFFFF" />
                  </g>

                  {/* Sparkle Star Elements */}
                  <path d="M92 18 L94 22 L98 24 L94 26 L92 30 L90 26 L86 24 L90 22 Z" fill="#C084FC" />
                  <path d="M16 38 L17.5 41 L20 42 L17.5 43 L16 46 L14.5 43 L12 42 L14.5 41 Z" fill="#A855F7" fillOpacity="0.6" />
                </svg>
              </div>
            </section>

            {/* ── SECTION 2: STAT METRIC CARDS (4 Cards, 92px height) ── */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
              
              {/* Card 1: Total Quizzes */}
              <div className="h-[76px] sm:h-[92px] p-3 sm:p-5 rounded-2xl bg-white border border-[#F1F5F9] shadow-[0px_4px_20px_-2px_rgba(99,32,238,0.06),0px_2px_6px_-1px_rgba(0,0,0,0.03)] flex items-center gap-2.5 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FAF5FF] flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#6320EE]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10.5px] sm:text-xs font-semibold text-[#64748B] tracking-[0.2px] truncate">Total Quizzes</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] leading-none mt-0.5 sm:mt-1">{totalQuizzesMetric}</p>
                </div>
              </div>

              {/* Card 2: Total Sessions */}
              <div className="h-[76px] sm:h-[92px] p-3 sm:p-5 rounded-2xl bg-white border border-[#F1F5F9] shadow-[0px_4px_20px_-2px_rgba(99,32,238,0.06),0px_2px_6px_-1px_rgba(0,0,0,0.03)] flex items-center gap-2.5 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F0F9FF] flex items-center justify-center shrink-0">
                  <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#0EA5E9]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10.5px] sm:text-xs font-semibold text-[#64748B] tracking-[0.2px] truncate">Total Sessions</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] leading-none mt-0.5 sm:mt-1">{totalSessionsMetric}</p>
                </div>
              </div>

              {/* Card 3: Total Participants */}
              <div className="h-[76px] sm:h-[92px] p-3 sm:p-5 rounded-2xl bg-white border border-[#F1F5F9] shadow-[0px_4px_20px_-2px_rgba(99,32,238,0.06),0px_2px_6px_-1px_rgba(0,0,0,0.03)] flex items-center gap-2.5 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#ECFDF5] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#0E834C]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10.5px] sm:text-xs font-semibold text-[#64748B] tracking-[0.2px] truncate">Total Participants</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] leading-none mt-0.5 sm:mt-1">
                    {totalParticipantsMetric.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Card 4: Average Score */}
              <div className="h-[76px] sm:h-[92px] p-3 sm:p-5 rounded-2xl bg-white border border-[#F1F5F9] shadow-[0px_4px_20px_-2px_rgba(99,32,238,0.06),0px_2px_6px_-1px_rgba(0,0,0,0.03)] flex items-center gap-2.5 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFFBEB] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#F59E0B]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10.5px] sm:text-xs font-semibold text-[#64748B] tracking-[0.2px] truncate">Average Score</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] leading-none mt-0.5 sm:mt-1">{averageScoreMetric}%</p>
                </div>
              </div>
            </section>

            {/* ── SECTION 3: FILTER CONTROLS ── */}
            <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              
              {/* Left: Search Table Input */}
              <div className="relative w-full sm:w-[320px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your reports..."
                  className="w-full h-[42px] pl-10 pr-9 rounded-2xl bg-white border border-[#E2E8F0]/90 shadow-2xs text-sm font-normal text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#6320EE] focus:ring-2 focus:ring-[#6320EE]/15 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B] p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Right: Dropdowns (Category & Date Filter) */}
              <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3">
                
                {/* Category Dropdown */}
                <div className="relative w-full sm:w-auto" ref={categoryDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryOpen(!isCategoryOpen);
                      setIsDateFilterOpen(false);
                    }}
                    className="w-full sm:w-auto h-[42px] px-3 sm:px-4 rounded-2xl bg-white border border-[#E2E8F0]/90 shadow-2xs flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-[#334155] hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                      <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9333EA] shrink-0" />
                      <span className="truncate">{selectedCategory === 'All' ? 'All Categories' : selectedCategory}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8] shrink-0 transition-transform duration-150 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isCategoryOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-[#EEF0F6] shadow-xl p-1.5 z-40 text-left animate-in fade-in zoom-in-95 duration-150">
                      {['All', 'Pop Culture', 'Geography', 'Science', 'Technology', 'General Knowledge'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsCategoryOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                            selectedCategory === cat
                              ? 'bg-[#FAF5FF] text-[#6320EE]'
                              : 'text-[#475569] hover:bg-slate-50'
                          }`}
                        >
                          <span>{cat === 'All' ? 'All Categories' : cat}</span>
                          {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-[#6320EE]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Filter Dropdown */}
                <div className="relative w-full sm:w-auto" ref={dateDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDateFilterOpen(!isDateFilterOpen);
                      setIsCategoryOpen(false);
                    }}
                    className="w-full sm:w-auto h-[42px] px-3 sm:px-4 rounded-2xl bg-white border border-[#E2E8F0]/90 shadow-2xs flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-[#334155] hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9333EA] shrink-0" />
                      <span className="truncate">
                        {selectedDateRange === '7days'
                          ? 'Last 7 Days'
                          : selectedDateRange === '30days'
                          ? 'Last 30 Days'
                          : selectedDateRange === '90days'
                          ? 'Last 90 Days'
                          : 'All Time'}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8] shrink-0 transition-transform duration-150 ${isDateFilterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDateFilterOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-[#EEF0F6] shadow-xl p-1.5 z-40 text-left animate-in fade-in zoom-in-95 duration-150">
                      {[
                        { key: '7days', label: 'Last 7 Days' },
                        { key: '30days', label: 'Last 30 Days' },
                        { key: '90days', label: 'Last 90 Days' },
                        { key: 'all', label: 'All Time' }
                      ].map((d) => (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => {
                            setSelectedDateRange(d.key);
                            setIsDateFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                            selectedDateRange === d.key
                              ? 'bg-[#FAF5FF] text-[#6320EE]'
                              : 'text-[#475569] hover:bg-slate-50'
                          }`}
                        >
                          <span>{d.label}</span>
                          {selectedDateRange === d.key && <Check className="w-3.5 h-3.5 text-[#6320EE]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ── SECTION 4: REPORTS TABLE (Desktop) & CARDS (Mobile) ── */}
            <section className="rounded-[20px] sm:rounded-[24px] bg-white border border-[#F1F5F9] shadow-[0px_4px_20px_-2px_rgba(99,32,238,0.06),0px_2px_6px_-1px_rgba(0,0,0,0.03)] p-3 sm:p-7 flex flex-col gap-4">
              
              {/* DESKTOP TABLE VIEW (Visible on tablet & desktop) */}
              <div className="hidden md:block w-full overflow-x-auto">
                <table className="w-full min-w-[960px] text-left border-collapse">
                  
                  {/* Table Header Row */}
                  <thead>
                    <tr className="border-b border-[#6C38FF] text-[#1E1B4B]">
                      <th className="py-3.5 px-3 text-left font-bold text-sm w-[28%]">Quiz Title</th>
                      <th className="py-3.5 px-3 text-center font-bold text-sm w-[13%]">Category</th>
                      <th className="py-3.5 px-3 text-center font-bold text-sm w-[9%]">Questions</th>
                      <th className="py-3.5 px-3 text-center font-bold text-sm w-[9%]">Sessions</th>
                      <th className="py-3.5 px-3 text-center font-bold text-sm w-[11%]">Participants</th>
                      <th className="py-3.5 px-3 text-center font-bold text-sm w-[10%]">Avg. Score</th>
                      <th 
                        className="py-3.5 px-3 text-center font-bold text-sm w-[10%] cursor-pointer hover:text-[#6C38FF] transition-colors select-none"
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        title="Click to reverse date sort"
                      >
                        <span className="inline-flex items-center gap-1 justify-center">
                          <span>Date</span>
                          <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>
                        </span>
                      </th>
                      <th className="py-3.5 px-3 text-right font-bold text-sm w-[10%] pr-4">Report</th>
                    </tr>
                  </thead>

                  {/* Table Body Rows */}
                  <tbody className="divide-y divide-[#F1F5F9]/80">
                    {paginatedReports.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          <BarChart2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-slate-700">No reports matched your filters.</p>
                          <p className="text-xs text-slate-400 mt-0.5">Try clearing your search query or choosing another category.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedReports.map((report) => (
                        <tr
                          key={report.id}
                          className="hover:bg-[#FAF9FD]/70 transition-colors group"
                        >
                          {/* Quiz Title & Icon */}
                          <td className="py-4 px-3 align-middle">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-2xl bg-[#FAF5FF] flex items-center justify-center shrink-0 border border-[#F3E8FF]/60 shadow-2xs">
                                {renderRowIcon(report.iconType)}
                              </div>
                              <span className="font-bold text-sm text-[#1E1B4B] leading-snug line-clamp-2 max-w-[240px]">
                                {report.title}
                              </span>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-4 px-3 text-center align-middle">
                            <span className={`inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-semibold ${getCategoryBadgeClass(report.category)}`}>
                              {report.category}
                            </span>
                          </td>

                          {/* Questions Count */}
                          <td className="py-4 px-3 text-center align-middle text-sm font-medium text-[#334155]">
                            {report.questionsCount}
                          </td>

                          {/* Sessions Count */}
                          <td className="py-4 px-3 text-center align-middle text-sm font-medium text-[#334155]">
                            {report.sessionsCount}
                          </td>

                          {/* Participants Count */}
                          <td className="py-4 px-3 text-center align-middle text-sm font-medium text-[#334155]">
                            {report.participantsCount}
                          </td>

                          {/* Avg. Score Pill */}
                          <td className="py-4 px-3 text-center align-middle">
                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${
                              report.avgScore >= 75
                                ? 'bg-[#ECFDF5] text-[#059669]'
                                : 'bg-[#FFFBEB] text-[#D97706]'
                            }`}>
                              {report.avgScore}%
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-3 text-center align-middle text-sm font-medium text-[#475569]">
                            {formatDate(report.date)}
                          </td>

                          {/* Report Button */}
                          <td className="py-4 px-3 text-right align-middle pr-4">
                            <button
                              type="button"
                              onClick={() => handleViewReport(report)}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FAF5FF] hover:bg-[#F3E8FF] text-[#6320EE] text-xs font-bold transition-all shadow-2xs cursor-pointer ml-auto"
                            >
                              <BarChart2 className="w-3.5 h-3.5 text-[#6320EE]" />
                              <span>View Report</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW (Visible Only on Mobile < md) */}
              <div className="md:hidden flex flex-col gap-3">
                {paginatedReports.length === 0 ? (
                  <div className="py-10 text-center text-slate-500">
                    <BarChart2 className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No reports matched your filters.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try clearing your search query or choosing another category.</p>
                  </div>
                ) : (
                  paginatedReports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-white border border-[#EEF0F6] rounded-2xl p-4 shadow-xs space-y-3 transition-all hover:shadow-md"
                    >
                      {/* Top Row: Icon + Title + Category Pill */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#FAF5FF] flex items-center justify-center shrink-0 border border-[#F3E8FF]/60 shadow-2xs">
                            {renderRowIcon(report.iconType)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-[#1E1B4B] leading-tight line-clamp-2">
                              {report.title}
                            </h3>
                            <span className="text-[11px] font-medium text-[#94A3B8] mt-0.5 block">
                              {formatDate(report.date)}
                            </span>
                          </div>
                        </div>

                        <span className={`shrink-0 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${getCategoryBadgeClass(report.category)}`}>
                          {report.category}
                        </span>
                      </div>

                      {/* Stats Strip (4 columns: Questions, Sessions, Players, Avg. Score) */}
                      <div className="grid grid-cols-4 gap-1.5 py-2 px-2 rounded-xl bg-[#FAF9FD] border border-[#F1F5F9] text-center">
                        <div>
                          <span className="text-[10px] font-medium text-[#94A3B8] block">Questions</span>
                          <span className="text-xs font-bold text-[#1E293B] block mt-0.5">{report.questionsCount}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-medium text-[#94A3B8] block">Sessions</span>
                          <span className="text-xs font-bold text-[#1E293B] block mt-0.5">{report.sessionsCount}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-medium text-[#94A3B8] block">Players</span>
                          <span className="text-xs font-bold text-[#1E293B] block mt-0.5">{report.participantsCount}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-medium text-[#94A3B8] block">Avg. Score</span>
                          <span className={`text-xs font-bold block mt-0.5 ${
                            report.avgScore >= 75
                              ? 'text-[#059669]'
                              : 'text-[#D97706]'
                          }`}>
                            {report.avgScore}%
                          </span>
                        </div>
                      </div>

                      {/* Action Row: View Report Button */}
                      <button
                        type="button"
                        onClick={() => handleViewReport(report)}
                        className="w-full h-[38px] rounded-xl bg-[#6320EE] hover:bg-[#5217cc] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>View Detailed Report</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Table Footer / Pagination */}
              <div className="pt-3 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <span className="text-[#64748B] font-medium text-sm">
                  Showing {filteredReports.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–
                  {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length} reports
                </span>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="w-9 h-9 rounded-xl border border-[#E2E8F0]/80 flex items-center justify-center text-[#64748B] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentPage === page
                          ? 'bg-[#6320EE] text-white shadow-xs'
                          : 'border border-[#E2E8F0]/80 text-[#334155] hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="w-9 h-9 rounded-xl border border-[#E2E8F0]/80 flex items-center justify-center text-[#64748B] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>

        {/* ─── MODALS ─── */}
        {/* Profile Settings Modal */}
        {activeModal === 'profile' && (
          <HostProfileModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            onUpdated={(updated) => setUser(updated)}
          />
        )}

        {/* Upgrade Plan Modal */}
        {activeModal === 'upgrade' && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-xs animate-fade-in">
            <div className="relative my-auto rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 bg-white text-slate-900 text-left">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-white to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl shadow-xs">
                    <Crown className="h-5 w-5 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Upgrade to Gubbi Pro</h3>
                    <p className="text-xs text-slate-500">Unlock unlimited multiplayer rooms, export reports, and custom trivia sets.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pro Plan Card */}
                  <div className="p-5 rounded-2xl border-2 border-[#6C38FF] bg-purple-50/30 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                        Educator Pro
                      </span>
                      <h4 className="text-2xl font-black text-slate-900 mt-2">
                        ₹499 <span className="text-xs font-normal text-slate-500">/ month</span>
                      </h4>
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
                      className="w-full py-2.5 rounded-xl bg-[#6C38FF] hover:bg-[#5827e8] text-white text-xs font-bold text-center shadow-md transition-all block cursor-pointer"
                    >
                      Contact Sales &amp; Upgrade
                    </a>
                  </div>

                  {/* Free Plan Recap */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        Free Community
                      </span>
                      <h4 className="text-2xl font-black text-slate-900 mt-2">₹0 <span className="text-xs font-normal text-slate-500">/ forever</span></h4>
                      <p className="text-xs text-slate-500 mt-1">Perfect for casual trivia, weekend hangouts, and testing questions.</p>
                      
                      <ul className="mt-4 space-y-2 text-xs text-slate-600">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-slate-400 shrink-0" /> Up to 5 custom quizzes</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-slate-400 shrink-0" /> Up to 20 live players per room</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-slate-400 shrink-0" /> Basic web summaries</li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold text-center transition-all cursor-pointer"
                    >
                      Keep Current Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sample Report Modal Preview */}
        {activeModal === 'viewSample' && selectedSampleReport && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-xs animate-fade-in">
            <div className="relative my-auto rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 bg-white text-slate-900 text-left">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-[#FAF9FD]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF5FF] flex items-center justify-center shrink-0 border border-[#F3E8FF]">
                    {renderRowIcon(selectedSampleReport.iconType)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#1E1B4B]">{selectedSampleReport.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getCategoryBadgeClass(selectedSampleReport.category)}`}>
                        {selectedSampleReport.category}
                      </span>
                      <span className="text-[11px] text-[#64748B]">{formatDate(selectedSampleReport.date)}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Stats 4-Grid */}
                <div className="grid grid-cols-4 gap-2 text-center p-3.5 rounded-2xl bg-[#FAF9FD] border border-[#EEF0F6]">
                  <div>
                    <p className="text-[10px] font-semibold text-[#64748B]">Questions</p>
                    <p className="text-base font-extrabold text-[#1E1B4B] mt-0.5">{selectedSampleReport.questionsCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[#64748B]">Sessions</p>
                    <p className="text-base font-extrabold text-[#1E1B4B] mt-0.5">{selectedSampleReport.sessionsCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[#64748B]">Players</p>
                    <p className="text-base font-extrabold text-[#1E1B4B] mt-0.5">{selectedSampleReport.participantsCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[#64748B]">Avg. Score</p>
                    <p className="text-base font-extrabold text-[#059669] mt-0.5">{selectedSampleReport.avgScore}%</p>
                  </div>
                </div>

                {/* Simulated Leaderboard Highlights */}
                <div>
                  <h4 className="text-xs font-bold text-[#1E1B4B] mb-2">Simulated Match Highlights</h4>
                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-slate-800">1st Place: Alex M.</span>
                      </div>
                      <span className="font-extrabold text-[#6320EE]">9,420 pts</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-sky-500" />
                        <span className="font-bold text-slate-800">Fastest Solver: Jordan K.</span>
                      </div>
                      <span className="text-slate-500">1.42s</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      navigate('/dashboard');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#6320EE] hover:bg-[#5216d1] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Host a Battle Lobby
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}

