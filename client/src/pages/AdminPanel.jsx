import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users as FiUsers,
  Layers as FiLayers,
  PlayCircle as FiPlayCircle,
  Award as FiAward,
  DollarSign as FiDollarSign,
  HelpCircle as FiHelpCircle,
  TrendingUp as FiTrendingUp,
  Search as FiSearch,
  RefreshCw as FiRefreshCw,
  Plus as FiPlus,
  Edit2 as FiEdit2,
  Trash2 as FiTrash2,
  Check as FiCheck,
  X as FiX,
  Activity as FiActivity,
  Shield as FiShield,
  Calendar as FiCalendar,
  BookOpen as FiBookOpen,
  Grid as FiGrid,
  List as FiList,
  Clock as FiClock,
  Sun,
  Moon,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const API_BASE = '/api/admin';

export default function AdminPanel() {
  const { themeMode, toggleThemeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data states directly from Mongo
  const [overviewStats, setOverviewStats] = useState(null);
  const [hostsData, setHostsData] = useState({ data: [], total: 0, page: 1, pages: 1 });
  const [quizzesData, setQuizzesData] = useState({ data: [], total: 0, page: 1, pages: 1 });
  const [sessionsData, setSessionsData] = useState({ data: [], total: 0, page: 1, pages: 1 });
  const [resultsData, setResultsData] = useState({ data: [], total: 0, page: 1, pages: 1 });
  const [plans, setPlans] = useState([]);
  const [faqs, setFaqs] = useState([]);

  // Filters & Search
  const [hostSearch, setHostSearch] = useState('');
  const [quizSearch, setQuizSearch] = useState('');
  const [sessionStatus, setSessionStatus] = useState('');
  const [hostsPage, setHostsPage] = useState(1);
  const [quizzesPage, setQuizzesPage] = useState(1);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [resultsPage, setResultsPage] = useState(1);

  // Modal states
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '', price: 0, billingCycle: 'monthly', description: '', features: '', buttonText: 'Get Started'
  });

  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({
    question: '', answer: '', category: 'General'
  });

  // Fetch Overview Stats
  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/stats`);
      const json = await res.json();
      if (json.success) {
        setOverviewStats(json.data);
      } else {
        toast.error('Failed to load overview stats');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error connecting to MongoDB backend');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Hosts
  const fetchHosts = async (page = 1, search = '') => {
    try {
      const res = await fetch(`${API_BASE}/hosts?page=${page}&limit=15&search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success) {
        setHostsData(json);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Quizzes
  const fetchQuizzes = async (page = 1, search = '') => {
    try {
      const res = await fetch(`${API_BASE}/quizzes?page=${page}&limit=15&search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success) {
        setQuizzesData(json);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Sessions
  const fetchSessions = async (page = 1, status = '') => {
    try {
      const res = await fetch(`${API_BASE}/sessions?page=${page}&limit=15&status=${encodeURIComponent(status)}`);
      const json = await res.json();
      if (json.success) {
        setSessionsData(json);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Results
  const fetchResults = async (page = 1) => {
    try {
      const res = await fetch(`${API_BASE}/results?page=${page}&limit=15`);
      const json = await res.json();
      if (json.success) {
        setResultsData(json);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Plans
  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_BASE}/plans`);
      const json = await res.json();
      if (json.success) {
        setPlans(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch FAQs
  const fetchFaqs = async () => {
    try {
      const res = await fetch(`${API_BASE}/faqs`);
      const json = await res.json();
      if (json.success) {
        setFaqs(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'hosts') fetchHosts(hostsPage, hostSearch);
    if (activeTab === 'quizzes') fetchQuizzes(quizzesPage, quizSearch);
    if (activeTab === 'sessions') fetchSessions(sessionsPage, sessionStatus);
    if (activeTab === 'results') fetchResults(resultsPage);
    if (activeTab === 'plans') fetchPlans();
    if (activeTab === 'faqs') fetchFaqs();
  }, [activeTab, hostsPage, hostSearch, quizzesPage, quizSearch, sessionsPage, sessionStatus, resultsPage]);

  // Plan Form Actions
  const handleSavePlan = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...planForm,
        price: Number(planForm.price),
        features: typeof planForm.features === 'string'
          ? planForm.features.split('\n').filter(f => f.trim() !== '')
          : planForm.features
      };

      const url = editingPlan ? `${API_BASE}/plans/${editingPlan._id}` : `${API_BASE}/plans`;
      const method = editingPlan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        toast.success(editingPlan ? 'Plan updated!' : 'Plan created successfully!');
        setPlanModalOpen(false);
        fetchPlans();
      } else {
        toast.error(json.message || 'Error saving plan');
      }
    } catch (err) {
      toast.error('Network error saving plan');
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      const res = await fetch(`${API_BASE}/plans/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Plan deleted');
        fetchPlans();
      }
    } catch (err) {
      toast.error('Failed to delete plan');
    }
  };

  // FAQ Form Actions
  const handleSaveFaq = async (e) => {
    e.preventDefault();
    try {
      const url = editingFaq ? `${API_BASE}/faqs/${editingFaq._id}` : `${API_BASE}/faqs`;
      const method = editingFaq ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqForm)
      });
      const json = await res.json();
      if (json.success) {
        toast.success(editingFaq ? 'FAQ updated!' : 'FAQ created!');
        setFaqModalOpen(false);
        fetchFaqs();
      } else {
        toast.error(json.message || 'Error saving FAQ');
      }
    } catch (err) {
      toast.error('Network error saving FAQ');
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      const res = await fetch(`${API_BASE}/faqs/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('FAQ deleted');
        fetchFaqs();
      }
    } catch (err) {
      toast.error('Failed to delete FAQ');
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: FiGrid },
    { id: 'hosts', label: 'Hosts & Users', icon: FiUsers, badge: overviewStats?.totalUsers },
    { id: 'quizzes', label: 'Quizzes', icon: FiLayers, badge: overviewStats?.totalQuizzes },
    { id: 'sessions', label: 'Game Sessions', icon: FiPlayCircle, badge: overviewStats?.totalSessions },
    { id: 'results', label: 'Results & History', icon: FiAward, badge: overviewStats?.totalResults },
    { id: 'plans', label: 'Subscription Plans', icon: FiDollarSign, badge: plans.length },
    { id: 'faqs', label: 'FAQ Management', icon: FiHelpCircle, badge: faqs.length },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans flex flex-col ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Super Admin Top Header */}
      <header className={`px-6 py-4 border-b flex items-center justify-between sticky top-0 z-30 shadow-md backdrop-blur-xl transition-colors duration-300 ${
        isLight ? 'bg-white/90 border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}>
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className={`p-2 rounded-xl border transition-all ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Return to Main Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
              <FiShield className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${
                isLight ? 'text-slate-900' : 'bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-violet-300'
              }`}>
                QuizForge Super Admin
              </h1>
              <p className={`text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected to MongoDB Atlas: <code className={`px-1.5 py-0.5 rounded ${
                  isLight ? 'bg-violet-100 text-violet-800 font-semibold' : 'bg-slate-800 text-violet-400'
                }`}>quizdb</code>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleThemeMode}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border font-medium text-xs transition-all active:scale-95 ${
              isLight
                ? 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100 shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          >
            {isLight ? (
              <>
                <Moon className="w-4 h-4 text-violet-600" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Mode</span>
              </>
            )}
          </button>

          {/* Refresh Stats Button */}
          <button
            onClick={() => { fetchOverview(); toast.success('Refreshed real database stats!'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition border ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/60'
            }`}
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        {/* Sidebar Navigation */}
        <aside className={`w-full md:w-64 border rounded-2xl p-3 flex flex-row md:flex-col gap-1.5 overflow-x-auto shrink-0 self-start shadow-sm transition-colors duration-300 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25 font-semibold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isLight
                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 border rounded-2xl p-6 shadow-xl transition-colors duration-300 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/60 border-slate-800 text-slate-100'
        }`}>
          {loading && !overviewStats ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <FiRefreshCw className="w-8 h-8 animate-spin text-violet-500" />
              <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Reading real database values from MongoDB Atlas...
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && overviewStats && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div>
                    <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>System Overview</h2>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Live database metrics from MongoDB cluster0.lu9xsuj.mongodb.net (<code className="text-violet-500 font-semibold">quizdb</code>)
                    </p>
                  </div>

                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard isLight={isLight} title="Registered Hosts" value={overviewStats.totalUsers} subtitle="Users with accounts" icon={FiUsers} color="from-violet-500 to-purple-600" />
                    <StatCard isLight={isLight} title="Created Quizzes" value={overviewStats.totalQuizzes} subtitle="Across all categories" icon={FiLayers} color="from-blue-500 to-indigo-600" />
                    <StatCard isLight={isLight} title="Hosted Game Sessions" value={overviewStats.totalSessions} subtitle="Live & completed lobbies" icon={FiPlayCircle} color="from-emerald-500 to-teal-600" />
                    <StatCard isLight={isLight} title="Game Participants" value={overviewStats.totalParticipants} subtitle="Across 132 result records" icon={FiAward} color="from-amber-500 to-orange-600" />
                  </div>

                  {/* Secondary Insights Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Category Breakdown */}
                    <div className={`border rounded-xl p-5 space-y-4 ${
                      isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <h3 className={`text-base font-semibold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <FiBookOpen className="text-violet-500" /> Quiz Category Breakdown
                      </h3>
                      <div className="space-y-3">
                        {overviewStats.categoryStats.map((cat) => {
                          const percentage = Math.round((cat.count / overviewStats.totalQuizzes) * 100) || 0;
                          return (
                            <div key={cat._id} className="space-y-1">
                              <div className="flex justify-between text-xs font-medium">
                                <span className={`capitalize ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{cat._id || 'general'}</span>
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{cat.count} quizzes ({percentage}%)</span>
                              </div>
                              <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                                <div className="bg-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Game Sessions Status */}
                    <div className={`border rounded-xl p-5 space-y-4 ${
                      isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <h3 className={`text-base font-semibold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <FiActivity className="text-emerald-500" /> Game Session Status Distribution
                      </h3>
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        {overviewStats.sessionStatusStats.map((st) => (
                          <div key={st._id} className={`border rounded-lg p-3 text-center ${
                            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-850 border-slate-800'
                          }`}>
                            <span className={`inline-block w-2.5 h-2.5 rounded-full mb-2 ${
                              st._id === 'finished' ? 'bg-emerald-500' : st._id === 'active' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'
                            }`} />
                            <p className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{st.count}</p>
                            <p className={`text-xs capitalize ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{st._id}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Tables */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                    {/* Recent Hosts */}
                    <div className={`border rounded-xl p-5 space-y-4 ${
                      isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <h3 className={`text-base font-semibold flex items-center justify-between ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <span>Recent Registered Hosts</span>
                        <button onClick={() => setActiveTab('hosts')} className="text-xs text-violet-600 dark:text-violet-400 hover:underline">
                          View All ({overviewStats.totalUsers})
                        </button>
                      </h3>
                      <div className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800'}`}>
                        {overviewStats.recentHosts.map((h) => (
                          <div key={h._id} className="py-2.5 flex items-center justify-between">
                            <div>
                              <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{h.name}</p>
                              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{h.email}</p>
                            </div>
                            <span className={`text-xs font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                              {new Date(h.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className={`border rounded-xl p-5 space-y-4 ${
                      isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <h3 className={`text-base font-semibold flex items-center justify-between ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <span>Recent Game Lobbies</span>
                        <button onClick={() => setActiveTab('sessions')} className="text-xs text-violet-600 dark:text-violet-400 hover:underline">
                          View All ({overviewStats.totalSessions})
                        </button>
                      </h3>
                      <div className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800'}`}>
                        {overviewStats.recentSessions.map((s) => (
                          <div key={s._id} className="py-2.5 flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded border ${
                                  isLight ? 'bg-violet-100 text-violet-700 border-violet-200' : 'bg-violet-950/60 text-violet-400 border-violet-800/40'
                                }`}>PIN: {s.pin}</span>
                                <span className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{s.quizId?.title || 'Quiz'}</span>
                              </div>
                              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Host: {s.hostId?.name || 'Unknown'}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                              s.status === 'finished'
                                ? isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                                : isLight ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                            }`}>
                              {s.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: HOSTS & USERS */}
              {activeTab === 'hosts' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Registered Hosts & Users</h2>
                      <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Total {hostsData.total} hosts registered in MongoDB <code className="text-violet-500 font-semibold">users</code> collection
                      </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
                      <input
                        type="text"
                        placeholder="Search name or email..."
                        value={hostSearch}
                        onChange={(e) => { setHostSearch(e.target.value); setHostsPage(1); }}
                        className={`w-full border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-violet-500 ${
                          isLight ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`overflow-x-auto border rounded-xl ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
                  }`}>
                    <table className="w-full text-left text-sm">
                      <thead className={`text-xs font-semibold uppercase border-b ${
                        isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800/80 text-slate-400 border-slate-800'
                      }`}>
                        <tr>
                          <th className="px-4 py-3">Host Name</th>
                          <th className="px-4 py-3">Email Address</th>
                          <th className="px-4 py-3">Quizzes Created</th>
                          <th className="px-4 py-3">Sessions Hosted</th>
                          <th className="px-4 py-3">Registered Date</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
                        {hostsData.data.map((user) => (
                          <tr key={user._id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                            <td className={`px-4 py-3 font-medium flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-xs text-violet-600 dark:text-violet-300 font-bold">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              {user.name}
                            </td>
                            <td className={`px-4 py-3 font-mono text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{user.email}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                                isLight ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-violet-950/60 text-violet-300 border-violet-800/40'
                              }`}>
                                {user.quizCount} quizzes
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                                isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40'
                              }`}>
                                {user.sessionCount} sessions
                              </span>
                            </td>
                            <td className={`px-4 py-3 text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                        {hostsData.data.length === 0 && (
                          <tr><td colSpan="5" className={`text-center py-8 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>No hosts found matching your search.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <Pagination isLight={isLight} current={hostsPage} totalPages={hostsData.pages} onPageChange={setHostsPage} />
                </motion.div>
              )}

              {/* TAB 3: QUIZZES */}
              {activeTab === 'quizzes' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>All Quizzes</h2>
                      <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Total {quizzesData.total} quizzes stored in MongoDB <code className="text-violet-500 font-semibold">quizzes</code> collection
                      </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search quiz title..."
                        value={quizSearch}
                        onChange={(e) => { setQuizSearch(e.target.value); setQuizzesPage(1); }}
                        className={`w-full border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-violet-500 ${
                          isLight ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`overflow-x-auto border rounded-xl ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
                  }`}>
                    <table className="w-full text-left text-sm">
                      <thead className={`text-xs font-semibold uppercase border-b ${
                        isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800/80 text-slate-400 border-slate-800'
                      }`}>
                        <tr>
                          <th className="px-4 py-3">Quiz Title</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Questions Count</th>
                          <th className="px-4 py-3">Created By (Host)</th>
                          <th className="px-4 py-3">Created Date</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
                        {quizzesData.data.map((quiz) => (
                          <tr key={quiz._id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                            <td className={`px-4 py-3 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{quiz.title}</td>
                            <td className="px-4 py-3">
                              <span className={`capitalize text-xs border px-2 py-0.5 rounded ${
                                isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}>
                                {quiz.category || 'general'}
                              </span>
                            </td>
                            <td className={`px-4 py-3 font-mono text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                              {quiz.questionsCount} questions
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-xs">
                                <p className={`font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{quiz.createdBy?.name || 'Unknown'}</p>
                                <p className={`font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{quiz.createdBy?.email}</p>
                              </div>
                            </td>
                            <td className={`px-4 py-3 text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              {new Date(quiz.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Pagination isLight={isLight} current={quizzesPage} totalPages={quizzesData.pages} onPageChange={setQuizzesPage} />
                </motion.div>
              )}

              {/* TAB 4: GAME SESSIONS */}
              {activeTab === 'sessions' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Game Sessions</h2>
                      <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Total {sessionsData.total} live & completed lobbies from MongoDB <code className="text-violet-500 font-semibold">gamesessions</code> collection
                      </p>
                    </div>

                    <select
                      value={sessionStatus}
                      onChange={(e) => { setSessionStatus(e.target.value); setSessionsPage(1); }}
                      className={`border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-violet-500 ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                      }`}
                    >
                      <option value="">All Statuses</option>
                      <option value="finished">Finished</option>
                      <option value="active">Active</option>
                      <option value="waiting">Waiting</option>
                    </select>
                  </div>

                  <div className={`overflow-x-auto border rounded-xl ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
                  }`}>
                    <table className="w-full text-left text-sm">
                      <thead className={`text-xs font-semibold uppercase border-b ${
                        isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800/80 text-slate-400 border-slate-800'
                      }`}>
                        <tr>
                          <th className="px-4 py-3">PIN Code</th>
                          <th className="px-4 py-3">Quiz Title</th>
                          <th className="px-4 py-3">Host</th>
                          <th className="px-4 py-3">Players Count</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Hosted At</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
                        {sessionsData.data.map((sess) => (
                          <tr key={sess._id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                            <td className="px-4 py-3 font-mono font-bold text-violet-600 dark:text-violet-400">{sess.pin}</td>
                            <td className={`px-4 py-3 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{sess.quizTitle}</td>
                            <td className="px-4 py-3 text-xs">
                              <p className={`font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{sess.hostName}</p>
                              <p className={`font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{sess.hostEmail}</p>
                            </td>
                            <td className={`px-4 py-3 font-mono text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{sess.playersCount} players</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                                sess.status === 'finished'
                                  ? isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                                  : sess.status === 'active'
                                  ? isLight ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' : 'bg-amber-950/80 text-amber-300 border border-amber-800/40 animate-pulse'
                                  : isLight ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-blue-950/80 text-blue-300 border border-blue-800/40'
                              }`}>
                                {sess.status}
                              </span>
                            </td>
                            <td className={`px-4 py-3 text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              {new Date(sess.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Pagination isLight={isLight} current={sessionsPage} totalPages={sessionsData.pages} onPageChange={setSessionsPage} />
                </motion.div>
              )}

              {/* TAB 5: RESULTS & HISTORY */}
              {activeTab === 'results' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div>
                    <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Game Results & Match History</h2>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Total {resultsData.total} finalized match results from MongoDB <code className="text-violet-500 font-semibold">results</code> collection
                    </p>
                  </div>

                  <div className={`overflow-x-auto border rounded-xl ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
                  }`}>
                    <table className="w-full text-left text-sm">
                      <thead className={`text-xs font-semibold uppercase border-b ${
                        isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800/80 text-slate-400 border-slate-800'
                      }`}>
                        <tr>
                          <th className="px-4 py-3">Quiz Title</th>
                          <th className="px-4 py-3">Host</th>
                          <th className="px-4 py-3">Winner</th>
                          <th className="px-4 py-3">Participants</th>
                          <th className="px-4 py-3">Questions</th>
                          <th className="px-4 py-3">Played Date</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
                        {resultsData.data.map((res) => (
                          <tr key={res._id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                            <td className={`px-4 py-3 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{res.quizTitle}</td>
                            <td className={`px-4 py-3 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{res.hostName}</td>
                            <td className="px-4 py-3 font-semibold text-amber-500 flex items-center gap-1.5">
                              <FiAward className="w-4 h-4 text-amber-500" />
                              {res.winner}
                            </td>
                            <td className={`px-4 py-3 font-mono text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{res.playersCount} players</td>
                            <td className={`px-4 py-3 text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{res.totalQuestions} Qs</td>
                            <td className={`px-4 py-3 text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              {new Date(res.playedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Pagination isLight={isLight} current={resultsPage} totalPages={resultsData.pages} onPageChange={setResultsPage} />
                </motion.div>
              )}

              {/* TAB 6: SUBSCRIPTION PLANS */}
              {activeTab === 'plans' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Subscription Plans</h2>
                      <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Manage real plan offerings stored directly in MongoDB <code className="text-violet-500 font-semibold">plans</code> collection
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingPlan(null);
                        setPlanForm({ name: '', price: 0, billingCycle: 'monthly', description: '', features: '', buttonText: 'Get Started' });
                        setPlanModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:brightness-110 shadow-lg shadow-violet-600/20"
                    >
                      <FiPlus className="w-4 h-4" /> Add Plan
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((p) => (
                      <div key={p._id} className={`border rounded-xl p-5 space-y-4 flex flex-col justify-between ${
                        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
                      }`}>
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>{p.name}</h3>
                            <div className="flex items-center gap-1">
                              <button onClick={() => {
                                setEditingPlan(p);
                                setPlanForm({
                                  name: p.name,
                                  price: p.price,
                                  billingCycle: p.billingCycle || 'monthly',
                                  description: p.description || '',
                                  features: Array.isArray(p.features) ? p.features.join('\n') : p.features || '',
                                  buttonText: p.buttonText || 'Get Started'
                                });
                                setPlanModalOpen(true);
                              }} className={`p-1.5 rounded-lg transition ${
                                isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                              }`}><FiEdit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeletePlan(p._id)} className="p-1.5 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"><FiTrash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mt-2">${p.price} <span className={`text-xs font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>/{p.billingCycle}</span></p>
                          <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{p.description}</p>

                          <ul className={`mt-4 space-y-2 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            {p.features?.map((f, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <FiCheck className="text-emerald-500 shrink-0" /> {f}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className={`pt-3 border-t text-xs font-mono ${isLight ? 'border-slate-100 text-slate-400' : 'border-slate-800 text-slate-500'}`}>
                          ID: {p._id}
                        </div>
                      </div>
                    ))}
                    {plans.length === 0 && (
                      <div className={`col-span-3 text-center py-12 border rounded-xl ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                      }`}>
                        <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          No custom plans configured yet. Click "Add Plan" to create your first pricing plan in <code className="text-violet-600 font-semibold">plans</code> collection!
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 7: FAQS MANAGEMENT */}
              {activeTab === 'faqs' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>FAQ Management</h2>
                      <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Manage real FAQs stored directly in MongoDB <code className="text-violet-500 font-semibold">faqs</code> collection
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingFaq(null);
                        setFaqForm({ question: '', answer: '', category: 'General' });
                        setFaqModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:brightness-110 shadow-lg shadow-violet-600/20"
                    >
                      <FiPlus className="w-4 h-4" /> Add FAQ
                    </button>
                  </div>

                  <div className="space-y-3">
                    {faqs.map((f) => (
                      <div key={f._id} className={`border rounded-xl p-4 flex justify-between items-start gap-4 ${
                        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
                      }`}>
                        <div className="space-y-1">
                          <span className={`text-xs border px-2 py-0.5 rounded font-medium ${
                            isLight ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-slate-800 text-violet-300 border-slate-700'
                          }`}>{f.category}</span>
                          <h3 className={`font-semibold text-base mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{f.question}</h3>
                          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{f.answer}</p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => {
                            setEditingFaq(f);
                            setFaqForm({ question: f.question, answer: f.answer, category: f.category || 'General' });
                            setFaqModalOpen(true);
                          }} className={`p-1.5 rounded-lg transition ${
                            isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}><FiEdit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteFaq(f._id)} className="p-1.5 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"><FiTrash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                    {faqs.length === 0 && (
                      <div className={`text-center py-12 border rounded-xl ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                      }`}>
                        <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          No FAQs stored in database yet. Click "Add FAQ" to publish your first FAQ into <code className="text-violet-600 font-semibold">faqs</code> collection!
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* PLAN MODAL */}
      {planModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex justify-between items-center">
              <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {editingPlan ? 'Edit Plan' : 'Create Subscription Plan'}
              </h3>
              <button onClick={() => setPlanModalOpen(false)} className={isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}>
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3 text-sm">
              <div>
                <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Plan Name</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                  placeholder="e.g. Pro Host"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Price ($)</label>
                  <input
                    type="number"
                    required
                    value={planForm.price}
                    onChange={e => setPlanForm({ ...planForm, price: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Billing Cycle</label>
                  <select
                    value={planForm.billingCycle}
                    onChange={e => setPlanForm({ ...planForm, billingCycle: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Description</label>
                <input
                  type="text"
                  value={planForm.description}
                  onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Features (One per line)</label>
                <textarea
                  rows="3"
                  value={planForm.features}
                  onChange={e => setPlanForm({ ...planForm, features: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                  placeholder="Unlimited quizzes&#10;Up to 500 live players&#10;Custom branding"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className={`px-4 py-2 rounded-lg ${isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 font-medium">
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {faqModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex justify-between items-center">
              <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {editingFaq ? 'Edit FAQ' : 'Add FAQ'}
              </h3>
              <button onClick={() => setFaqModalOpen(false)} className={isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}>
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3 text-sm">
              <div>
                <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Category</label>
                <input
                  type="text"
                  value={faqForm.category}
                  onChange={e => setFaqForm({ ...faqForm, category: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                  placeholder="e.g. Hosting, Pricing"
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Question</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                  placeholder="Enter FAQ question"
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Answer</label>
                <textarea
                  rows="3"
                  required
                  value={faqForm.answer}
                  onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                  placeholder="Enter detailed answer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  className={`px-4 py-2 rounded-lg ${isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 font-medium">
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponents
function StatCard({ isLight, title, value, subtitle, icon: Icon, color }) {
  return (
    <div className={`border rounded-2xl p-5 space-y-3 relative overflow-hidden group transition ${
      isLight
        ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{title}</span>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${color} flex items-center justify-center text-white shadow-md`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className={`text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{value}</p>
        <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>
      </div>
    </div>
  );
}

function Pagination({ isLight, current, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className={`flex items-center justify-between pt-4 text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
      <span>Page {current} of {totalPages}</span>
      <div className="flex items-center gap-2">
        <button
          disabled={current === 1}
          onClick={() => onPageChange(current - 1)}
          className={`px-3 py-1.5 rounded-lg border font-medium disabled:opacity-40 disabled:cursor-not-allowed ${
            isLight
              ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
          }`}
        >
          Previous
        </button>
        <button
          disabled={current === totalPages}
          onClick={() => onPageChange(current + 1)}
          className={`px-3 py-1.5 rounded-lg border font-medium disabled:opacity-40 disabled:cursor-not-allowed ${
            isLight
              ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
