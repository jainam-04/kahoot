import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, ShieldCheck, Lock, Eye, EyeOff, Check,
  AlertCircle, ArrowLeft, KeyRound, Crown, Trash2,
  Calendar, Sparkles, Building2, Phone, AlertTriangle,
  Loader2, Settings as SettingsIcon, CheckCircle2, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import AppSidebar from '../components/AppSidebar';
import TopHeader from '../components/TopHeader';
import PlanComparisonTable from '../components/PlanComparisonTable';
import { updateProfile, deleteAccount, getProfile } from '../services/authService';
import { getStoredUser, clearAuthSession } from '../utils/auth';
import { useScrollLock } from '../utils/scrollLock';

export default function Settings() {
  const navigate = useNavigate();

  // User state
  const [user, setUser] = useState(() => getStoredUser());
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'plan' | 'danger'
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [securityQuestion, setSecurityQuestion] = useState(user?.securityQuestion || 'What is your favourite colour?');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Delete Account Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Upgrade Modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Lock background scroll when modal is active
  useScrollLock(Boolean(showDeleteModal || showUpgradeModal));

  // Sync profile when window event triggers
  useEffect(() => {
    const handleProfileSync = (e) => {
      const updated = e && e.detail ? e.detail : getStoredUser();
      setUser(updated);
      setName(updated.name || '');
      setEmail(updated.email || '');
    };
    window.addEventListener('user-profile-updated', handleProfileSync);
    window.addEventListener('storage', handleProfileSync);
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileSync);
      window.removeEventListener('storage', handleProfileSync);
    };
  }, []);

  // Fetch latest profile from backend on mount
  useEffect(() => {
    let isMounted = true;
    getProfile()
      .then((res) => {
        if (isMounted && res.success && res.user) {
          const merged = { ...getStoredUser(), ...res.user };
          setUser(merged);
          setName(merged.name || '');
          setEmail(merged.email || '');
          localStorage.setItem('user', JSON.stringify(merged));
        }
      })
      .catch(() => {
        // Fall back to local storage
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setProfileError('Please enter your full name.');
      return;
    }
    if (trimmedName.length < 2) {
      setProfileError('Name must be at least 2 characters long.');
      return;
    }
    if (!trimmedEmail) {
      setProfileError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setProfileError('Please enter a valid email address.');
      return;
    }

    setIsSavingProfile(true);

    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail,
      };

      if (securityQuestion && securityAnswer.trim()) {
        payload.securityQuestion = securityQuestion.trim();
        payload.securityAnswer = securityAnswer.trim();
      }

      const res = await updateProfile(payload);

      if (res.success && res.user) {
        const existingStored = getStoredUser();
        const updatedUserData = {
          ...existingStored,
          ...res.user
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setUser(updatedUserData);
        window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: updatedUserData }));
        toast.success('Profile details updated successfully!');
        setSecurityAnswer('');
      } else {
        setProfileError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile.';
      setProfileError(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsSavingPassword(true);

    try {
      const payload = {
        name: user.name || name,
        email: user.email || email,
        currentPassword,
        newPassword
      };

      const res = await updateProfile(payload);

      if (res.success) {
        toast.success('Password updated successfully! Please use your new password next time.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.message || 'Failed to update password.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update password.';
      setPasswordError(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    setDeleteError('');

    if (!deleteConfirmPassword) {
      setDeleteError('Please enter your password to confirm account deletion.');
      return;
    }

    setIsDeletingAccount(true);

    try {
      const res = await deleteAccount({ password: deleteConfirmPassword });
      if (res.success) {
        clearAuthSession();
        toast.success('Your account has been deleted successfully.');
        navigate('/');
      } else {
        setDeleteError(res.message || 'Failed to delete account.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete account.';
      setDeleteError(msg);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const displayInitial = (name.trim() || user?.name || 'H').charAt(0).toUpperCase();
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Active Host';

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security & Password', icon: KeyRound },
    { id: 'plan', label: 'Subscription & Limits', icon: Crown },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-[#FAF8FF] flex flex-col text-slate-800 transition-colors font-['Inter',sans-serif] overflow-x-clip selection:bg-purple-100 selection:text-purple-900">
        
        {/* Fixed Desktop Sidebar & Mobile Drawer */}
        <AppSidebar
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          onOpenUpgrade={() => setShowUpgradeModal(true)}
        />

        {/* Main Content Area */}
        <div className="lg:pl-[230px] flex flex-col min-h-screen">
          
          {/* Top Header */}
          <TopHeader
            onOpenMobileNav={() => setIsMobileNavOpen(true)}
            onOpenUpgrade={() => setShowUpgradeModal(true)}
            user={user}
          />

          {/* Main Body */}
          <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-[1121px] w-full mx-auto">
            
            {/* Title & Action Bar */}
            <div className="rounded-[16px] bg-white border border-[#E2E8F0]/90 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-10 h-10 rounded-[12px] bg-white border border-[#E2E8F0] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-all cursor-pointer shrink-0"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-5 h-5 text-[#475569]" />
                </button>
                <div className="min-w-0">
                  <h1 className="font-extrabold text-xl sm:text-[24px] sm:leading-[28px] text-[#0F172A] tracking-tight truncate font-['Inter',sans-serif]">
                    Account Settings
                  </h1>
                  <p className="font-medium text-xs sm:text-[13px] text-[#64748B] mt-0.5 truncate font-['Inter',sans-serif]">
                    Manage your personal profile, credentials, and preferences.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF5FF] border border-[#E9D5FF] text-[#6C38FF] text-xs font-bold shrink-0 self-start sm:self-auto">
                <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
                <span>Host Account • Active</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                const isDanger = tab.id === 'danger';
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-[13px] flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? isDanger
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-[#6222F5] text-white shadow-[0px_10px_15px_-3px_rgba(98,34,245,0.25)]'
                        : isDanger
                        ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
                        : 'bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Profile Information */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 sm:space-y-6 text-left"
              >
                {/* Host Identity Card */}
                <div className="rounded-2xl bg-white border border-[#E2E8F0]/90 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#6C28FE] via-[#7C3AED] to-[#4F46E5] flex items-center justify-center font-black text-2xl sm:text-3xl text-white shadow-[0px_10px_20px_-5px_rgba(108,40,254,0.35)] ring-4 ring-[#EDE9FE]">
                        {displayInitial}
                      </div>
                      <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-[#7C3AED] text-white shadow-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base sm:text-lg text-[#0F172A]">
                          {name.trim() || 'Host User'}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF5FF] border border-[#E9D5FF] text-[#7C3AED] text-[10px] font-black uppercase">
                          Host
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                        {email || 'host@quizarena.com'}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-[#64748B]">
                        <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>Member since: {memberSince}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('plan')}
                    className="px-4 py-2 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] hover:bg-[#F3E8FF] text-[#7C3AED] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Manage Plan</span>
                  </button>
                </div>

                {/* Edit Form */}
                <div className="rounded-2xl bg-white border border-[#E2E8F0]/90 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
                  <h3 className="font-bold text-base text-[#0F172A] mb-1">Personal Details</h3>
                  <p className="text-xs text-[#64748B] mb-5">
                    Update your public host profile name, email, and security recovery question.
                  </p>

                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wide">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#7C3AED] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            const sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                            setName(sanitized);
                            if (profileError) setProfileError('');
                          }}
                          placeholder="e.g. Vidisha Gawas"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FCFCFF] border border-[#E9D5FF]/90 shadow-[inset_0px_2px_6px_rgba(0,0,0,0.05),0px_1px_2px_rgba(0,0,0,0.02)] text-xs sm:text-sm font-medium text-[#1E293B] placeholder-[#C084FC]/80 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/20 transition-all"
                          required
                          maxLength={50}
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wide">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#7C3AED] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (profileError) setProfileError('');
                          }}
                          placeholder="e.g. host@example.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FCFCFF] border border-[#E9D5FF]/90 shadow-[inset_0px_2px_6px_rgba(0,0,0,0.05),0px_1px_2px_rgba(0,0,0,0.02)] text-xs sm:text-sm font-medium text-[#1E293B] placeholder-[#C084FC]/80 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Security Recovery Question */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wide">
                          Security Question (Recovery)
                        </label>
                        <select
                          value={securityQuestion}
                          onChange={(e) => setSecurityQuestion(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FCFCFF] border border-[#E9D5FF]/90 text-xs sm:text-sm font-medium text-[#1E293B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/20 cursor-pointer"
                        >
                          <option value="What is your favourite colour?">What is your favourite colour?</option>
                          <option value="What was your first pet's name?">What was your first pet's name?</option>
                          <option value="What elementary school did you attend?">What elementary school did you attend?</option>
                          <option value="What city were you born in?">What city were you born in?</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wide">
                          Security Answer
                        </label>
                        <input
                          type="text"
                          value={securityAnswer}
                          onChange={(e) => setSecurityAnswer(e.target.value)}
                          placeholder="Update security answer (optional)"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FCFCFF] border border-[#E9D5FF]/90 shadow-[inset_0px_2px_6px_rgba(0,0,0,0.05),0px_1px_2px_rgba(0,0,0,0.02)] text-xs sm:text-sm font-medium text-[#1E293B] placeholder-[#C084FC]/80 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Error display */}
                    {profileError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{profileError}</span>
                      </div>
                    )}

                    {/* Save Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingProfile || !name.trim() || !email.trim()}
                        className="h-[42px] px-6 rounded-[16px] text-white font-bold text-xs shadow-[0px_10px_25px_-3px_rgba(108,40,254,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] font-['Plus_Jakarta_Sans',sans-serif] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(90deg, #6C28FE 0%, #4F46E5 50%, #6640E8 100%)' }}
                      >
                        {isSavingProfile ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 shrink-0" />
                            <span>Save Profile</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Tab 2: Security & Password */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 sm:space-y-6 text-left"
              >
                <div className="rounded-2xl bg-white border border-[#E2E8F0]/90 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-[#F1F5F9]">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] flex items-center justify-center shrink-0">
                      <KeyRound className="w-4 h-4 text-[#7C3AED]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#0F172A]">Change Password</h3>
                      <p className="text-xs text-[#64748B]">Update your password to keep your host account safe.</p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-4">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wide">
                        Current Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#7C3AED] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            if (passwordError) setPasswordError('');
                          }}
                          placeholder="Enter your existing password"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FCFCFF] border border-[#E9D5FF]/90 shadow-[inset_0px_2px_6px_rgba(0,0,0,0.05),0px_1px_2px_rgba(0,0,0,0.02)] text-xs sm:text-sm font-medium text-[#1E293B] placeholder-[#C084FC]/80 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/20 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B] p-1 cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New & Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wide">
                          New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-[#7C3AED] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              if (passwordError) setPasswordError('');
                            }}
                            placeholder="At least 6 characters"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FCFCFF] border border-[#E9D5FF]/90 shadow-[inset_0px_2px_6px_rgba(0,0,0,0.05),0px_1px_2px_rgba(0,0,0,0.02)] text-xs sm:text-sm font-medium text-[#1E293B] placeholder-[#C084FC]/80 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/20 transition-all"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B] p-1 cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wide">
                          Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-[#7C3AED] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (passwordError) setPasswordError('');
                            }}
                            placeholder="Repeat new password"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FCFCFF] border border-[#E9D5FF]/90 shadow-[inset_0px_2px_6px_rgba(0,0,0,0.05),0px_1px_2px_rgba(0,0,0,0.02)] text-xs sm:text-sm font-medium text-[#1E293B] placeholder-[#C084FC]/80 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/20 transition-all"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B] p-1 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Error display */}
                    {passwordError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                        className="h-[42px] px-6 rounded-[16px] text-white font-bold text-xs shadow-[0px_10px_25px_-3px_rgba(108,40,254,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] font-['Plus_Jakarta_Sans',sans-serif] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(90deg, #6C28FE 0%, #4F46E5 50%, #6640E8 100%)' }}
                      >
                        {isSavingPassword ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 shrink-0" />
                            <span>Update Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Tab 3: Subscription & Limits */}
            {activeTab === 'plan' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 sm:space-y-6 text-left"
              >
                {/* Current Membership Header */}
                <div className="rounded-2xl p-5 bg-gradient-to-br from-[#FAF7FF] via-[#F4EEFF] to-[#EDE5FF] border border-[#E9DCFF] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#E9D5FF]/60 shadow-xs flex items-center justify-center shrink-0">
                      <Crown className="w-6 h-6 text-[#F59E0B]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-lg text-[#0F172A]">Gubbi Free Host</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase">
                          Current Tier
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Create unlimited quizzes with standard 30-player multiplayer rooms.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(true)}
                    className="h-[42px] px-6 rounded-[16px] text-white font-bold text-xs shadow-[0px_10px_25px_-3px_rgba(108,40,254,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] font-['Plus_Jakarta_Sans',sans-serif] shrink-0"
                    style={{ background: 'linear-gradient(90deg, #6C28FE 0%, #4F46E5 50%, #D946EF 100%)' }}
                  >
                    <Crown className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Upgrade to Gubbi Pro</span>
                  </button>
                </div>

                {/* Features & Quota Comparison Table */}
                <div className="rounded-2xl bg-white border border-[#E2E8F0]/90 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
                  <h3 className="font-bold text-base text-[#0F172A] mb-1">Plan Comparison & Quota</h3>
                  <p className="text-xs text-[#64748B] mb-4">
                    Explore available features between the Free Host and Pro subscription tiers.
                  </p>
                  <PlanComparisonTable />
                </div>
              </motion.div>
            )}

            {/* Tab 4: Danger Zone */}
            {activeTab === 'danger' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-left"
              >
                <div className="rounded-2xl bg-red-50/50 border border-red-200 p-4 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2.5 text-red-600">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <h3 className="font-bold text-base">Permanently Delete Account</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-red-700/80 leading-relaxed">
                    Once you delete your host account, all of your created quizzes, live multiplayer history, question drafts, and player performance reports will be permanently deleted. This action cannot be reversed.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteModal(true);
                        setDeleteError('');
                        setDeleteConfirmPassword('');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete My Account</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </main>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-200 text-left space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Are you absolutely sure?</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Please confirm your password to permanently delete your host account and wipe all quiz data.
                  </p>
                </div>

                <form onSubmit={handleDeleteAccountSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showDeletePassword ? 'text' : 'password'}
                        value={deleteConfirmPassword}
                        onChange={(e) => {
                          setDeleteConfirmPassword(e.target.value);
                          if (deleteError) setDeleteError('');
                        }}
                        placeholder="Enter your current password"
                        className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showDeletePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {deleteError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{deleteError}</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      disabled={isDeletingAccount}
                      onClick={() => setShowDeleteModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isDeletingAccount || !deleteConfirmPassword}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isDeletingAccount ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Confirm Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Upgrade Plan Modal */}
        <AnimatePresence>
          {showUpgradeModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-purple-200 text-left space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] flex items-center justify-center">
                      <Crown className="w-5 h-5 text-[#F59E0B]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900">Upgrade to Gubbi Pro</h3>
                      <p className="text-xs text-slate-500">Unlock unlimited multiplayer rooms & AI generation.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <CheckCircle2 className="w-5 h-5 hidden" />
                    ✕
                  </button>
                </div>
                <PlanComparisonTable />
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      toast.success('Thank you for your interest! Pro upgrade billing is launching soon.', { id: 'pro-toast' });
                      setShowUpgradeModal(false);
                    }}
                    className="h-[42px] px-6 rounded-[16px] text-white font-bold text-xs shadow-[0px_10px_25px_-3px_rgba(108,40,254,0.35)] flex items-center justify-center gap-2 cursor-pointer font-['Plus_Jakarta_Sans',sans-serif]"
                    style={{ background: 'linear-gradient(90deg, #6C28FE 0%, #4F46E5 50%, #D946EF 100%)' }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Get Pro Access</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AnimatedPage>
  );
}
