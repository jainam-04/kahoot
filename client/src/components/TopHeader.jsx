import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  X,
  ChevronDown,
  Settings,
  Crown,
  LogOut,
  Menu
} from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from './Logo';
import { getStoredUser, clearAuthSession } from '../utils/auth';

/**
 * TopHeader - Unified canonical top content bar matching Figma specifications.
 * - Exact height: 74px
 * - Background: rgba(255, 255, 255, 0.8) with backdrop-filter: blur(12px)
 * - Border bottom: 1px solid #EEF0F6
 * - Search input: 580px max-width, 46px height, rounded-full pill, font Inter 700 13.5px
 * - User Profile Pill: 42px height, 32px #6C38FF avatar circle with white initial, name #1E293B, chevron #94A3B8
 * - Fixed/sticky top-0 so it never scrolls away when scrolling down the page
 */
export default function TopHeader({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search quizzes, topics, or participants...',
  onOpenMobileNav,
  onOpenProfile,
  onOpenUpgrade,
  user: initialUser
}) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => initialUser || getStoredUser());
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const profileDropdownRef = useRef(null);

  // Sync prop changes
  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser);
    }
  }, [initialUser]);

  // Sync stored user profile across storage and custom events
  useEffect(() => {
    const handleProfileSync = (e) => {
      if (e?.detail) {
        setCurrentUser(e.detail);
      } else {
        setCurrentUser(getStoredUser());
      }
    };
    window.addEventListener('user-profile-updated', handleProfileSync);
    window.addEventListener('storage', handleProfileSync);
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileSync);
      window.removeEventListener('storage', handleProfileSync);
    };
  }, []);

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const displayName = currentUser?.name || currentUser?.username || 'Mohsin';
  const displayEmail = currentUser?.email || 'host@gubbi.io';
  const userInitial = displayName.charAt(0).toUpperCase() || 'M';

  return (
    <header className="sticky top-0 z-40 w-full h-[74px] max-h-[74px] bg-white/80 backdrop-blur-[12px] border-b border-[#EEF0F6] px-4 sm:px-8 flex items-center justify-between gap-3 sm:gap-4 shrink-0 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Mobile Drawer Hamburger Button + Logo (< lg) */}
      <div className="flex items-center gap-2.5 sm:gap-3 lg:hidden shrink-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="p-1.5 sm:p-2 rounded-xl border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Logo size="sm" imgClassName="h-[44px] sm:h-12 w-auto object-contain" />
      </div>

      {/* Center: Global Search Input Container (580px max-width, 46px height pill) */}
      <div className="flex-1 max-w-[580px] min-w-0">
        <div className="relative w-full h-[46px] flex items-center">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-[46px] pl-11 pr-10 rounded-full bg-[#FAF9FD] border border-[#E9EAF2] font-['Inter'] text-[13.5px] leading-[16px] font-normal text-[#1E293B] placeholder-[#94A3B8] placeholder:font-['Inter'] placeholder:font-normal placeholder:text-[13.5px] placeholder:leading-[16px] focus:outline-none focus:border-[#6C38FF] focus:ring-1 focus:ring-[#6C38FF]/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange && onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B] p-1 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Top Right Controls (User Profile) */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* User Profile Pill (42px height, 32px avatar #6C38FF, name #1E293B, chevron #94A3B8) */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileDropdownOpen(prev => !prev);
              setIsNotificationsOpen(false);
            }}
            className="h-[42px] p-1 pr-3 rounded-full border border-[#E7E9F2] bg-white hover:bg-[#F8FAFC] transition-colors flex items-center gap-2 cursor-pointer shadow-2xs select-none"
            aria-label="User Profile"
          >
            <div className="w-8 h-8 rounded-full bg-[#6C38FF] text-white font-semibold text-[13px] flex items-center justify-center shrink-0">
              {userInitial}
            </div>
            <span className="text-[13.5px] font-semibold text-[#1E293B] max-w-[100px] truncate hidden sm:inline">
              {displayName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#EEF0F6] shadow-xl p-2 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[#F1F5F9]">
                <p className="text-xs font-bold text-[#0F172A] truncate">{displayName}</p>
                <p className="text-[11px] text-[#64748B] truncate">{displayEmail}</p>
              </div>
              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[#94A3B8]" />
                  <span>Account Settings</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    if (onOpenUpgrade) onOpenUpgrade();
                    else navigate('/dashboard');
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
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
