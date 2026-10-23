import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, ShieldCheck, Calendar, Lock, Eye, EyeOff, 
  X, Check, Loader2, Sparkles, KeyRound, AlertCircle, Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { updateProfile } from '../services/authService';

export default function HostProfileModal({ isOpen, onClose, onUpdated }) {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(storedUser);
        setName(storedUser.name || '');
        setEmail(storedUser.email || '');
      } catch {
        // Fallback
      }
      setShowPasswordSection(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage('');
      setIsSaving(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (trimmedName.length < 2) {
      setErrorMessage('Name must be at least 2 characters long.');
      return;
    }
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (showPasswordSection && (currentPassword || newPassword || confirmPassword)) {
      if (!currentPassword) {
        setErrorMessage('Please enter your current password.');
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('New password and confirmation do not match.');
        return;
      }
    }

    setIsSaving(true);

    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail,
      };

      if (showPasswordSection && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await updateProfile(payload);

      if (res.success && res.user) {
        // Update local storage user profile
        const existingStored = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUserData = {
          ...existingStored,
          ...res.user
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setCurrentUser(updatedUserData);

        // Dispatch window event so all other components refresh immediately
        window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: updatedUserData }));

        toast.success('Host profile updated successfully!', { id: 'profile-update-toast' });
        
        if (onUpdated) {
          onUpdated(updatedUserData);
        }
        onClose();
      } else {
        setErrorMessage(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update profile. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  const displayInitial = (name.trim() || currentUser?.name || 'H').charAt(0).toUpperCase();
  const memberSince = currentUser?.createdAt 
    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Active Host';

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
          {/* Modal Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSaving ? onClose : undefined}
            className="fixed inset-0"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 w-full max-w-lg my-auto flex flex-col rounded-3xl shadow-2xl border overflow-hidden ${
              isLight
                ? 'bg-white border-purple-200 text-gray-900 shadow-purple-500/10'
                : 'bg-[#12121a] border-purple-500/30 text-white shadow-black/80'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
              isLight ? 'bg-purple-50/80 border-purple-100' : 'bg-purple-950/25 border-purple-500/20'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-primary/30">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-outfit font-extrabold text-base sm:text-lg text-foreground leading-tight">
                    Host Profile
                  </h3>
                  <p className="text-[11px] text-muted font-medium">
                    Edit your host name, email, and security settings
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={onClose}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  isLight ? 'text-gray-400 hover:text-gray-700 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(88vh-100px)] text-left">
              
              {/* Host Profile Banner / Live Avatar Preview */}
              <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
                isLight 
                  ? 'bg-gradient-to-r from-purple-50 via-indigo-50/50 to-pink-50 border-purple-100' 
                  : 'bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-pink-950/20 border-white/10'
              }`}>
                <div className="relative shrink-0">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary via-purple-600 to-secondary flex items-center justify-center font-extrabold text-2xl text-white shadow-lg shadow-primary/25 ring-4 ring-primary/20 transition-all">
                    {displayInitial}
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-primary text-white shadow">
                    <Sparkles className="h-3 w-3" />
                  </div>
                </div>

                <div className="overflow-hidden flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-outfit font-extrabold text-sm sm:text-base truncate">
                      {name.trim() || 'Host Name'}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 shrink-0">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      Host
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate mt-0.5">
                    {email.trim() || 'host@quizarena.com'}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Member: {memberSince}
                    </span>
                    <span>•</span>
                    <span className="text-primary font-bold">Quiz Moderator</span>
                  </div>
                </div>
              </div>

              {/* Name & Email Fields */}
              <div className="space-y-4">
                {/* Full Name Input */}
                <div className="space-y-1.5">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${
                    isLight ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        const sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        setName(sanitized);
                        if (errorMessage) setErrorMessage('');
                      }}
                      disabled={isSaving}
                      placeholder="e.g. Vidisha Gawas"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all outline-none font-medium ${
                        isLight
                          ? 'border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900'
                          : 'border-white/10 bg-white/5 focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 text-white'
                      }`}
                      required
                      maxLength={50}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${
                    isLight ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      disabled={isSaving}
                      placeholder="e.g. host@example.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all outline-none font-medium ${
                        isLight
                          ? 'border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900'
                          : 'border-white/10 bg-white/5 focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 text-white'
                      }`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Optional Password Section Toggle */}
              <div className="pt-2 border-t" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    showPasswordSection
                      ? (isLight ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-primary/20 border-primary/40 text-primary')
                      : (isLight ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700' : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300')
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    <span>Change Password (Optional)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase bg-black/10">
                    {showPasswordSection ? 'Hide' : 'Expand'}
                  </span>
                </button>

                {/* Password Fields */}
                <AnimatePresence>
                  {showPasswordSection && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-3 pt-3"
                    >
                      {/* Current Password */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                          Current Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                            <Lock className="h-3.5 w-3.5" />
                          </div>
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            disabled={isSaving}
                            placeholder="Enter current password"
                            className={`w-full pl-9 pr-9 py-2 rounded-xl text-xs border outline-none ${
                              isLight ? 'bg-gray-50 border-gray-200 focus:bg-white text-gray-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-foreground"
                          >
                            {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className={`block text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                            New Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                              <Lock className="h-3.5 w-3.5" />
                            </div>
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              disabled={isSaving}
                              placeholder="Min 6 characters"
                              className={`w-full pl-9 pr-9 py-2 rounded-xl text-xs border outline-none ${
                                isLight ? 'bg-gray-50 border-gray-200 focus:bg-white text-gray-900' : 'bg-white/5 border-white/10 text-white'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-foreground"
                            >
                              {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-1">
                          <label className={`block text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                              <Lock className="h-3.5 w-3.5" />
                            </div>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              disabled={isSaving}
                              placeholder="Repeat new password"
                              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none ${
                                isLight ? 'bg-gray-50 border-gray-200 focus:bg-white text-gray-900' : 'bg-white/5 border-white/10 text-white'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error Message Box */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={onClose}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isLight
                      ? 'border border-gray-200 text-gray-700 hover:bg-gray-100'
                      : 'border border-white/10 text-gray-300 hover:bg-white/5'
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || !name.trim() || !email.trim()}
                  className="btn-premium btn-primary-gradient flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
