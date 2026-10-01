import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, PlusCircle, LayoutDashboard, LogOut, LogIn, User, 
  Sun, Moon, Menu, X, ArrowRight, ChevronDown, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Logo from './Logo';
import DeleteAccountModal from './DeleteAccountModal';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const { themeMode, toggleThemeMode } = useTheme();
  const isLight = themeMode === 'light';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const headerRef = React.useRef(null);
  const profileDropdownRef = useRef(null);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Measure dynamic header height and update CSS custom property --main-header-height
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--main-header-height', `${height}px`);
      }
    };

    updateHeaderHeight();
    const observer = new ResizeObserver(updateHeaderHeight);
    if (headerRef.current) {
      observer.observe(headerRef.current);
    }
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, [mobileMenuOpen, token, location.pathname]);

  // Monitor scroll position for active section highlighting & navbar blur depth
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['hero', 'features', 'pricing', 'how-it-works', 'faq'];
      const scrollPos = window.scrollY + 100;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMobile = () => setMobileMenuOpen(false);

  const navLinks = [
    { label: 'Home', hash: '#hero' },
    { label: 'Play Demo', hash: '#interactive-demo', highlight: true },
    { label: 'Features', hash: '#features' },
    { label: 'Pricing', hash: '#pricing' },
    { label: 'FAQs', hash: '#faq' },
  ];

  const handleNavClick = (hash) => {
    closeMobile();
    if (location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header 
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 w-full border-b backdrop-blur-xl shadow-md transition-all duration-300"
      style={{
        backgroundColor: isLight ? 'rgba(240, 249, 255, 0.94)' : 'rgba(10, 10, 15, 0.96)',
        borderColor: isLight ? 'rgba(186, 230, 253, 0.8)' : 'rgba(255, 255, 255, 0.10)'
      }}
    >
      <div className="w-full flex h-16 items-center justify-between px-3 sm:px-5 lg:px-6">
        
        {/* Brand Logo - Leftmost */}
        <Link to="/" className="flex items-center transition-transform active:scale-95 shrink-0 min-w-0" onClick={closeMobile}>
            <Logo className="h-[70px] w-[70px] shrink-0" />
          </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {token ? (
            <>
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-1.5 text-sm font-bold transition-all relative py-1 px-3 rounded-xl ${
                  location.pathname === '/dashboard' 
                    ? 'text-primary bg-primary/10 border border-primary/25 shadow-sm' 
                    : isLight ? 'text-slate-700 hover:text-sky-700 hover:bg-sky-50' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-primary" />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/quiz/my" 
                className={`flex items-center gap-1.5 text-sm font-bold transition-all relative py-1 px-3 rounded-xl ${
                  location.pathname === '/quiz/my' 
                    ? 'text-secondary bg-secondary/10 border border-secondary/25 shadow-sm' 
                    : isLight ? 'text-slate-700 hover:text-secondary hover:bg-sky-50' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen className="h-4 w-4 text-secondary" />
                <span>My Quizzes</span>
              </Link>
              <Link 
                to="/quiz/create" 
                className={`flex items-center gap-1.5 text-sm font-bold transition-all relative py-1 px-3 rounded-xl ${
                  location.pathname === '/quiz/create' 
                    ? 'text-accent bg-accent/10 border border-accent/25 shadow-sm' 
                    : isLight ? 'text-slate-700 hover:text-accent hover:bg-sky-50' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <PlusCircle className="h-4 w-4 text-accent" />
                <span>Create Quiz</span>
              </Link>
            </>
          ) : (
            navLinks.map((link) => {
              const secId = link.hash.replace('#', '');
              const isActive = activeSection === secId;

              if (link.highlight) {
                return (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.hash)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-black text-primary hover:bg-primary/25 transition-all cursor-pointer shadow-sm hover:scale-105"
                  >
                    <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                    <span>{link.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.hash)}
                  className={`text-sm font-extrabold transition-all cursor-pointer relative py-1 ${
                    isActive ? 'text-sky-600' : isLight ? 'text-slate-700 hover:text-sky-600' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-primary to-secondary" />
                  )}
                </button>
              );
            })
          )}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleThemeMode}
            className="rounded-xl p-1.5 sm:p-2.5 border transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center"
            style={{
              background: isLight ? 'rgba(224, 242, 254, 0.7)' : 'rgba(255,255,255,0.05)',
              borderColor: isLight ? 'rgba(186, 230, 253, 0.9)' : 'rgba(255,255,255,0.10)',
              color: isLight ? '#0284c7' : '#d1d5db',
            }}
            aria-label="Toggle Theme"
          >
            {isLight ? (
              <Moon className="h-4 w-4" style={{ color: '#0284c7' }} />
            ) : (
              <Sun className="h-4 w-4 text-yellow-400" />
            )}
          </button>

          {token ? (
            <>
              {/* Profile Badge & Account Menu Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 rounded-xl px-2 py-1 sm:px-2.5 sm:py-1.5 border transition-all cursor-pointer hover:border-primary/50 select-none active:scale-95"
                  style={{
                    background: isLight ? 'rgba(224, 242, 254, 0.7)' : 'rgba(255,255,255,0.05)',
                    borderColor: isLight ? 'rgba(186, 230, 253, 0.9)' : 'rgba(255,255,255,0.10)',
                  }}
                  title="Host Profile & Settings"
                >
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px] shrink-0 border border-primary/30">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold truncate max-w-[60px] sm:max-w-[120px]" style={{ color: 'var(--text-main)' }}>
                    {user?.name || 'Host'}
                  </span>
                  <ChevronDown className={`h-3 w-3 text-muted transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
                </button>

                {/* Account Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border p-2 z-50 text-left backdrop-blur-xl ${
                        isLight ? 'bg-white/95 border-gray-200 text-gray-900' : 'bg-[#12121a]/95 border-white/10 text-white'
                      }`}
                    >
                      {/* Host Profile Header */}
                      <div className={`p-2.5 rounded-xl border mb-2 ${
                        isLight ? 'bg-sky-50/70 border-sky-100' : 'bg-white/5 border-white/5'
                      }`}>
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-extrabold text-xs text-white shrink-0">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="overflow-hidden min-w-0">
                            <h4 className="font-outfit font-bold text-xs truncate">{user?.name || 'Host Account'}</h4>
                            <p className="text-[10px] text-muted truncate">{user?.email || 'Logged In Host'}</p>
                            <span className="inline-block text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-primary/15 text-primary mt-0.5">
                              Quiz Moderator
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="space-y-0.5">
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            isLight ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/5 text-gray-300'
                          }`}
                        >
                          <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                          <span>Dashboard Overview</span>
                        </Link>
                        <Link
                          to="/quiz/my"
                          onClick={() => setProfileDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            isLight ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/5 text-gray-300'
                          }`}
                        >
                          <BookOpen className="h-3.5 w-3.5 text-secondary" />
                          <span>My Quizzes</span>
                        </Link>
                        <Link
                          to="/quiz/create"
                          onClick={() => setProfileDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            isLight ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/5 text-gray-300'
                          }`}
                        >
                          <PlusCircle className="h-3.5 w-3.5 text-accent" />
                          <span>Create New Quiz</span>
                        </Link>
                      </div>

                      {/* Danger Zone: Delete Account & Logout */}
                      <div className={`mt-1.5 pt-1.5 border-t space-y-1 ${
                        isLight ? 'border-gray-100' : 'border-white/5'
                      }`}>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setIsDeleteModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          <span>Delete Account</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden md:flex btn-premium items-center gap-2 px-3.5 py-1.5 text-xs rounded-xl text-white cursor-pointer shadow-sm hover:scale-105 transition-all"
                style={{ fontWeight: 900, backgroundColor: '#dc2626', border: '1px solid #dc2626' }}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span style={{ fontWeight: 900 }}>Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl border text-sm font-extrabold transition-all ${
                    isLight 
                      ? 'border-purple-200 text-purple-950 hover:bg-purple-50' 
                      : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-premium btn-primary-gradient px-5 py-2 text-sm font-extrabold text-white rounded-xl shadow-premium-glow flex items-center gap-1.5 hover:scale-105 transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Mobile Quick Get Started Button */}
              <Link
                to="/register"
                className="md:hidden btn-premium btn-primary-gradient px-3 py-1.5 text-xs font-extrabold text-white rounded-xl shadow-sm flex items-center gap-1"
              >
                <span>Get Started</span>
              </Link>
            </>
          )}

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden flex items-center justify-center p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ml-0.5"
            style={{
              background: isLight ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.05)',
              borderColor: isLight ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.10)',
              color: 'var(--text-main)',
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Quick Sub-Navbar when Logged In */}
      {token && (
        <div 
          className="md:hidden border-t px-2 py-1.5 flex items-center justify-around gap-1 overflow-x-auto text-xs font-extrabold"
          style={{
            backgroundColor: isLight ? 'rgba(245, 243, 255, 0.95)' : 'rgba(15, 15, 25, 0.95)',
            borderColor: isLight ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255, 255, 255, 0.08)'
          }}
        >
          <Link
            to="/dashboard"
            onClick={closeMobile}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              location.pathname === '/dashboard'
                ? 'bg-primary text-white shadow-sm'
                : isLight ? 'text-gray-700 hover:bg-purple-100/50' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/quiz/my"
            onClick={closeMobile}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              location.pathname === '/quiz/my'
                ? 'bg-secondary text-white shadow-sm'
                : isLight ? 'text-gray-700 hover:bg-cyan-100/50' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>My Quizzes</span>
          </Link>

          <Link
            to="/quiz/create"
            onClick={closeMobile}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              location.pathname === '/quiz/create'
                ? 'bg-accent text-white shadow-sm'
                : isLight ? 'text-gray-700 hover:bg-pink-100/50' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create Quiz</span>
          </Link>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200 shadow-2xl"
          style={{
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(10, 10, 18, 0.98)',
            borderColor: isLight ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.10)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {token ? (
            <>
              <div 
                className="flex items-center justify-between px-3.5 py-3 mb-3 rounded-xl border"
                style={{
                  background: isLight ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.04)',
                  borderColor: isLight ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.08)'
                }}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-black block truncate" style={{ color: 'var(--text-heading)' }}>
                      {user?.name}
                    </span>
                    <span className="text-[10px] text-gray-400 block truncate">
                      {user?.email || 'Logged In Host'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-secondary/15 text-secondary border border-secondary/20">
                  Host
                </span>
              </div>

              <Link
                to="/dashboard"
                onClick={closeMobile}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-primary/10"
                style={{ color: 'var(--text-main)' }}
              >
                <LayoutDashboard className="h-4 w-4 text-primary" />
                Dashboard Overview
              </Link>
              <Link
                to="/quiz/my"
                onClick={closeMobile}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-secondary/10"
                style={{ color: 'var(--text-main)' }}
              >
                <BookOpen className="h-4 w-4 text-secondary" />
                My Quizzes
              </Link>
              <Link
                to="/quiz/create"
                onClick={closeMobile}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-accent/10"
                style={{ color: 'var(--text-main)' }}
              >
                <PlusCircle className="h-4 w-4 text-accent" />
                Create New Quiz
              </Link>

              <div className="pt-3 border-t mt-2 space-y-2" style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}>
                <button
                  type="button"
                  onClick={() => {
                    closeMobile();
                    setIsDeleteModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span>Delete Host Account</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-black text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer shadow-md"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.hash)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-extrabold transition-colors cursor-pointer flex items-center justify-between ${
                    link.highlight ? 'bg-primary/10 border border-primary/25 text-primary' : ''
                  }`}
                  style={link.highlight ? {} : { color: 'var(--text-main)' }}
                >
                  <span>{link.label}</span>
                  {link.highlight && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/30">
                      30s Quiz
                    </span>
                  )}
                </button>
              ))}

              <div className="flex flex-col gap-2.5 pt-3 border-t" style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}>
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className={`w-full text-center py-3 rounded-xl border text-sm font-extrabold ${
                    isLight 
                      ? 'border-purple-300 text-purple-950 hover:bg-purple-50' 
                      : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className="btn-premium btn-primary-gradient w-full text-center py-3 text-sm font-extrabold text-white rounded-xl shadow-premium-glow flex items-center justify-center gap-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => {
          setIsDeleteModalOpen(false);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.success('Your account and all associated quizzes have been permanently deleted.');
          navigate('/login');
        }}
      />
    </header>
  );
}
