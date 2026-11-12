import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, PlusCircle, LayoutDashboard, LogOut, LogIn, User, 
  Sun, Moon, Menu, X, ArrowRight, ChevronDown, Trash2, Edit3, UserCheck, Settings 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Logo from './Logo';
import DeleteAccountModal from './DeleteAccountModal';
import HostProfileModal from './HostProfileModal';
import AppSidebar from './AppSidebar';
import { useTheme } from '../context/ThemeContext';
import { clearAuthSession, getStoredUser, getStoredToken } from '../utils/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
  const { themeMode, toggleThemeMode } = useTheme();
  const isLight = themeMode === 'light';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const headerRef = React.useRef(null);
  const profileDropdownRef = useRef(null);

  // Synchronize user profile across window events and storage changes
  useEffect(() => {
    const handleProfileSync = (e) => {
      if (e && 'detail' in e) {
        setUser(e.detail);
        setToken(getStoredToken());
      } else {
        setUser(getStoredUser());
        setToken(getStoredToken());
      }
    };
    window.addEventListener('user-profile-updated', handleProfileSync);
    window.addEventListener('storage', handleProfileSync);
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileSync);
      window.removeEventListener('storage', handleProfileSync);
    };
  }, []);

  // Re-sync user and token whenever location changes (e.g. login -> dashboard)
  useEffect(() => {
    setUser(getStoredUser());
    setToken(getStoredToken());
    setProfileDropdownOpen(false);
  }, [location.pathname]);

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
    clearAuthSession();
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
    navigate('/login');
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const closeMobile = () => setMobileMenuOpen(false);

  const navLinks = [
    { label: 'Home', hash: '#hero' },
    { label: 'Play Demo', hash: '#interactive-demo' },
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
      className="fixed top-0 left-0 right-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300"
      style={{
        backgroundColor: isLight ? 'rgba(255, 255, 255, 0.90)' : 'rgba(10, 10, 15, 0.96)',
        borderColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.10)'
      }}
    >
      <div className="max-w-[1351px] mx-auto w-full flex h-20 items-center justify-between px-4 sm:px-8">
        
        {/* Brand Logo - Leftmost */}
        <Link to="/" className="flex items-center transition-transform active:scale-95 shrink-0" onClick={closeMobile}>
          <Logo className="shrink-0" size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
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
              const isHomeActive = secId === 'hero' && (!activeSection || activeSection === 'hero');
              const isActive = isHomeActive || activeSection === secId;

              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleNavClick(link.hash)}
                  className={`font-['Inter'] text-[14px] leading-5 transition-colors cursor-pointer relative py-1 flex flex-col items-center ${
                    isActive 
                      ? 'text-[#551BF5] font-semibold' 
                      : isLight 
                        ? 'text-[#475569] hover:text-[#551BF5] font-medium' 
                        : 'text-gray-300 hover:text-white font-medium'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#551BF5]" />
                  )}
                </button>
              );
            })
          )}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Theme Toggle Button (displayed when logged in; landing page desktop uses clean Figma design) */}
          {token && (
            <button
              onClick={toggleThemeMode}
              className="rounded-xl p-1.5 sm:p-2.5 border transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center"
              style={{
                background: isLight ? 'rgba(237, 233, 254, 0.7)' : 'rgba(255,255,255,0.05)',
                borderColor: isLight ? 'rgba(221, 214, 254, 0.9)' : 'rgba(255,255,255,0.10)',
                color: isLight ? '#551BF5' : '#d1d5db',
              }}
              aria-label="Toggle Theme"
            >
              {isLight ? (
                <Moon className="h-4 w-4" style={{ color: '#551BF5' }} />
              ) : (
                <Sun className="h-4 w-4 text-yellow-400" />
              )}
            </button>
          )}

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
                      className={`absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl shadow-2xl border p-2 z-50 text-left backdrop-blur-xl ${
                        isLight ? 'bg-white/95 border-gray-200 text-gray-900' : 'bg-[#12121a]/95 border-white/10 text-white'
                      }`}
                    >
                      {/* Host Account Summary Card */}
                      <div
                        className={`w-full text-left p-2.5 rounded-xl border mb-2 select-none ${
                          isLight 
                            ? 'bg-sky-50/70 border-sky-100' 
                            : 'bg-white/5 border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-extrabold text-xs text-white shrink-0 shadow-sm">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="overflow-hidden min-w-0">
                            <h4 className="font-outfit font-bold text-xs truncate text-foreground">{user?.name || 'Host Account'}</h4>
                            <p className="text-[10px] text-muted truncate">{user?.email || 'Logged In Host'}</p>
                            <span className="inline-block text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-primary/15 text-primary mt-0.5">
                              Quiz Moderator
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setIsProfileModalOpen(true);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                            isLight ? 'hover:bg-purple-50 text-purple-700' : 'hover:bg-purple-950/30 text-purple-300'
                          }`}
                        >
                          <Edit3 className="h-3.5 w-3.5 text-primary" />
                          <span>Edit Host Profile</span>
                        </button>
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
              <div className="hidden md:flex items-center gap-4">
                <Link
                  to="/login"
                  className="px-3 py-2 text-[14px] font-['Inter'] font-semibold text-[#334155] hover:text-[#551BF5] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-get-started px-5 py-2.5 rounded-full text-[14px] font-['Inter'] font-semibold !text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex items-center gap-1.5 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  style={{ 
                    background: 'linear-gradient(106.05deg, #6C38FF 0%, #551BF5 100%)',
                    color: '#ffffff'
                  }}
                >
                  <span className="!text-white font-semibold" style={{ color: '#ffffff' }}>Get Started</span>
                  <ArrowRight className="h-4 w-4 !text-white" style={{ color: '#ffffff' }} />
                </Link>
              </div>

              {/* Mobile Quick Get Started Button */}
              <Link
                to="/register"
                className="btn-get-started md:hidden px-4 py-2 text-xs font-['Inter'] font-bold !text-white rounded-full shadow-sm flex items-center gap-1"
                style={{ 
                  background: 'linear-gradient(106.05deg, #6C38FF 0%, #551BF5 100%)',
                  color: '#ffffff'
                }}
              >
                <span className="!text-white font-bold" style={{ color: '#ffffff' }}>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5 !text-white" style={{ color: '#ffffff' }} />
              </Link>
            </>
          )}

          {/* Mobile Hamburger Button */}
          {token ? (
            <button
              className="md:hidden flex items-center justify-center p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ml-0.5"
              style={{
                background: isLight ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.05)',
                borderColor: isLight ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.10)',
                color: 'var(--text-main)',
              }}
              onClick={() => {
                setProfileDropdownOpen(false);
                setIsMobileSidebarOpen(true);
              }}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          ) : (
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
          )}
        </div>
      </div>

      {/* Universal Logged-In Mobile App Sidebar */}
      {token && (
        <AppSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenUpgrade={() => navigate('/dashboard')}
          onOpenSessions={() => navigate('/dashboard')}
        />
      )}

      {/* Mobile Menu Dropdown (Only for public guests when logged out) */}
      {!token && mobileMenuOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200 shadow-2xl"
          style={{
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(10, 10, 18, 0.98)',
            borderColor: isLight ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.10)',
            backdropFilter: 'blur(20px)'
          }}
        >
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
              className="btn-premium btn-primary-gradient w-full text-center py-3 rounded-xl text-sm font-extrabold text-white shadow-premium-glow flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}


      {/* Host Profile Edit Modal */}
      <HostProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onUpdated={(updatedUser) => {
          setUser(updatedUser);
        }}
      />

      {/* Account Deletion Confirmation Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => {
          setIsDeleteModalOpen(false);
          clearAuthSession();
          setUser(null);
          setToken(null);
          toast.success('Your account and all associated quizzes have been permanently deleted.');
          navigate('/login');
        }}
      />
    </header>
  );
}
