import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, PlusCircle, LogOut, User, 
  Sun, Moon, Menu, X, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from './Logo';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeMode, toggleThemeMode } = useTheme();
  const isLight = themeMode === 'light';
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
    setMobileOpen(false);
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5 text-primary shrink-0" />,
    },
    {
      label: 'My Quizzes',
      path: '/quiz/my',
      icon: <BookOpen className="h-5 w-5 text-secondary shrink-0" />,
    },
    {
      label: 'Create Quiz',
      path: '/quiz/create',
      icon: <PlusCircle className="h-5 w-5 text-accent shrink-0" />,
    },
  ];

  return (
    <>
      {/* MOBILE TOP TRIGGER BAR (< md) */}
      <header 
        className="md:hidden sticky top-0 z-40 w-full border-b backdrop-blur-xl px-4 py-3 flex items-center justify-between shadow-md"
        style={{
          backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 10, 15, 0.95)',
          borderColor: isLight ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.10)'
        }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="font-outfit text-base font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#386BFF] to-[#7B2CFF]">
            Quizy
          </span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          style={{
            background: isLight ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.05)',
            borderColor: isLight ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.10)',
            color: 'var(--text-main)'
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        />
      )}

      {/* SIDEBAR PANEL (DESKTOP FIXED & MOBILE DRAWER) */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-64 flex flex-col justify-between border-r shadow-2xl backdrop-blur-2xl transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          backgroundColor: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(10, 10, 16, 0.98)',
          borderColor: isLight ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* TOP: LOGO HEADER */}
        <div>
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: isLight ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.08)' }}>
            <Link to="/" className="flex items-center gap-3 transition-transform active:scale-95" onClick={() => setMobileOpen(false)}>
              <Logo className="h-9 w-9 shrink-0" />
              <span className="font-outfit text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#386BFF] to-[#7B2CFF]">
                Quizy
              </span>
            </Link>

            <button 
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* MAIN NAVIGATION LINKS */}
          <nav className="p-4 space-y-2">
            <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider" style={{ color: isLight ? '#6b7280' : '#9ca3af' }}>
              Main Menu
            </div>

            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold transition-all cursor-pointer shadow-sm"
                  style={{
                    backgroundColor: isActive 
                      ? (isLight ? 'rgba(124, 58, 237, 0.12)' : 'rgba(124, 58, 237, 0.22)')
                      : 'transparent',
                    border: isActive 
                      ? (isLight ? '1px solid rgba(124, 58, 237, 0.28)' : '1px solid rgba(167, 139, 250, 0.35)')
                      : '1px solid transparent',
                    color: isActive 
                      ? (isLight ? '#6d28d9' : '#c084fc')
                      : (isLight ? '#1f2937' : '#e5e7eb'),
                  }}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="font-extrabold">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM: THEME TOGGLE, USER BADGE & LOGOUT */}
        <div className="p-4 border-t space-y-3" style={{ borderColor: isLight ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.08)' }}>
          
          {/* THEME TOGGLE BUTTON */}
          <button
            onClick={toggleThemeMode}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer"
            style={{
              background: isLight ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.04)',
              borderColor: isLight ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.10)',
              color: 'var(--text-main)'
            }}
          >
            <span className="flex items-center gap-2">
              {isLight ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-primary" />}
              <span>{isLight ? 'Light Mode' : 'Dark Mode'}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase"
              style={{
                background: isLight ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.10)',
                color: isLight ? '#6d28d9' : '#d1d5db'
              }}
            >
              Toggle
            </span>
          </button>

          {/* USER PROFILE CARD */}
          <div 
            className="flex items-center justify-between p-3 rounded-xl border"
            style={{
              background: isLight ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.04)',
              borderColor: isLight ? 'rgba(139,92,246,0.14)' : 'rgba(255,255,255,0.08)'
            }}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm shrink-0 border border-primary/30">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden text-left">
                <span className="text-xs font-black block truncate" style={{ color: 'var(--text-heading)' }}>
                  {user?.name || user?.username || 'User Account'}
                </span>
                <span className="text-[10px] text-gray-400 block truncate">
                  {user?.email || 'Host Account'}
                </span>
              </div>
            </div>
            <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-secondary/20 text-secondary border border-secondary/30 shrink-0">
              Host
            </span>
          </div>

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="w-full btn-premium flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black text-white rounded-xl cursor-pointer shadow-md transition-all hover:scale-[1.02]"
            style={{ backgroundColor: '#dc2626', border: '1px solid #b91c1c' }}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
}
