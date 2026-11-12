import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  BarChart2,
  Settings,
  Crown,
  ArrowRight,
  LogOut,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from './Logo';
import { clearAuthSession } from '../utils/auth';

export default function AppSidebar({
  isOpen,
  onClose,
  onOpenProfile,
  onOpenUpgrade,
  onOpenSessions,
  activeNav
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Determine active item based on prop or route pathname
  const isDashboardActive = activeNav ? activeNav === 'dashboard' : currentPath === '/dashboard';
  const isMyQuizzesActive = activeNav ? activeNav === 'my-quizzes' : currentPath.startsWith('/quiz/my');
  const isCreateQuizActive = activeNav
    ? activeNav === 'create-quiz'
    : (currentPath.startsWith('/quiz/create') || currentPath.startsWith('/quiz/edit'));

  // Lock body scroll when mobile sidebar drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = () => {
    clearAuthSession();
    toast.success('Logged out successfully');
    navigate('/login');
    if (onClose) onClose();
  };

  const handleReportsClick = () => {
    if (onClose) onClose();
    if (typeof onOpenSessions === 'function') {
      onOpenSessions();
    } else {
      navigate('/dashboard');
    }
  };

  const handleSettingsClick = () => {
    if (onClose) onClose();
    if (typeof onOpenProfile === 'function') {
      onOpenProfile();
    }
  };

  const handleUpgradeClick = () => {
    if (onClose) onClose();
    if (typeof onOpenUpgrade === 'function') {
      onOpenUpgrade();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <>
      {/* ─── FIXED DESKTOP (230px) & MOBILE DRAWER ASIDE ─── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-[70] w-[230px] bg-[#FDFDFE] border-r border-[#ECEFF5] shadow-[1px_0px_4px_rgba(0,0,0,0.06)] flex flex-col overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col justify-between min-h-full">
          {/* Top Brand & Navigation Area */}
          <div className="px-4 pt-5 pb-3 flex flex-col items-start gap-3">
            {/* Mascot Brand Logo */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-[#F1F5F9]/80">
              <Link to="/dashboard" className="flex items-center gap-2 group" onClick={onClose}>
                <Logo className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
              </Link>
              {/* Close Drawer Button on Mobile */}
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Navigation Menu (Canonical 5 items) */}
            <nav className="w-full flex flex-col gap-1.5 mt-1">
              {/* Dashboard */}
              <Link
                to="/dashboard"
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 transition-colors ${
                  isDashboardActive
                    ? 'rounded-2xl bg-[#6222F5] text-white shadow-[0px_10px_15px_-3px_rgba(98,34,245,0.25),0px_4px_6px_-4px_rgba(98,34,245,0.25)] font-semibold text-[14px]'
                    : 'rounded-xl text-[13.5px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                <LayoutDashboard className={`w-5 h-5 ${isDashboardActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                <span>Dashboard</span>
              </Link>

              {/* My Quizzes */}
              <Link
                to="/quiz/my"
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 transition-colors ${
                  isMyQuizzesActive
                    ? 'rounded-2xl bg-[#6222F5] text-white shadow-[0px_10px_15px_-3px_rgba(98,34,245,0.25),0px_4px_6px_-4px_rgba(98,34,245,0.25)] font-semibold text-[14px]'
                    : 'rounded-xl text-[13.5px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                <BookOpen className={`w-5 h-5 ${isMyQuizzesActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                <span>My Quizzes</span>
              </Link>

              {/* Create Quiz */}
              <Link
                to="/quiz/create"
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 transition-colors ${
                  isCreateQuizActive
                    ? 'rounded-2xl bg-[#6222F5] text-white shadow-[0px_10px_15px_-3px_rgba(98,34,245,0.25),0px_4px_6px_-4px_rgba(98,34,245,0.25)] font-semibold text-[14px]'
                    : 'rounded-xl text-[13.5px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                <PlusCircle className={`w-5 h-5 ${isCreateQuizActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                <span>Create Quiz</span>
              </Link>

              {/* Reports */}
              <button
                type="button"
                onClick={handleReportsClick}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors text-left cursor-pointer"
              >
                <BarChart2 className="w-5 h-5 text-[#94A3B8]" />
                <span>Reports</span>
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={handleSettingsClick}
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
                  Unlock unlimited quizzes & rooms.
                </p>
              </div>
              <button
                type="button"
                onClick={handleUpgradeClick}
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

      {/* ─── BACKDROP FOR MOBILE SIDEBAR DRAWER ─── */}
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close navigation overlay"
          onClick={onClose}
          onTouchEnd={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs lg:hidden cursor-pointer"
        />
      )}
    </>
  );
}

