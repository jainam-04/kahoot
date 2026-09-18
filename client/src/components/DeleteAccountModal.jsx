import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, Lock, Eye, EyeOff, X, Loader2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { deleteAccount } from '../services/authService';

export default function DeleteAccountModal({ isOpen, onClose, onSuccess }) {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset states on open/close
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setShowPassword(false);
      setErrorMsg('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Please enter your password to confirm deletion.');
      return;
    }

    setIsDeleting(true);
    setErrorMsg('');

    try {
      const res = await deleteAccount({ password });
      if (res.success) {
        toast.success('Account and all associated quizzes deleted successfully.');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setErrorMsg(res.message || 'Failed to delete account.');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Incorrect password or server error.';
      setErrorMsg(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        {/* Modal Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isDeleting ? onClose : undefined}
          className="absolute inset-0"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`relative z-10 w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden ${
            isLight
              ? 'bg-white border-red-200 text-gray-900'
              : 'bg-[#14121a] border-red-500/30 text-white'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? 'bg-red-50/70 border-red-100' : 'bg-red-950/20 border-red-500/20'
          }`}>
            <div className="flex items-center gap-2.5 text-red-500">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <ShieldAlert className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="font-outfit font-extrabold text-base sm:text-lg text-red-500">
                Delete Account
              </h3>
            </div>
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                isLight ? 'text-gray-400 hover:text-gray-700 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleDelete} className="p-6 space-y-4">
            {/* Warning Box */}
            <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
              isLight
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-red-950/30 border-red-500/30 text-red-200'
            }`}>
              <div className="flex items-center gap-2 font-bold text-red-500 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>This action is permanent and irreversible</span>
              </div>
              <p>
                Deleting your account will permanently remove:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] opacity-90">
                <li>Your profile and login credentials</li>
                <li>All quizzes created under your account</li>
                <li>All hosted game sessions and room histories</li>
                <li>All participant leaderboards and analytics records</li>
              </ul>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 text-left">
              <label className={`block text-xs font-bold uppercase tracking-wider ${
                isLight ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Confirm your password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  disabled={isDeleting}
                  placeholder="Enter current password to confirm"
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl text-sm border transition-all outline-none ${
                    errorMsg
                      ? 'border-red-500 ring-2 ring-red-500/20'
                      : isLight
                        ? 'border-gray-300 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'border-white/10 bg-white/5 focus:bg-white/10 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold flex items-center gap-2"
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={onClose}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isLight
                    ? 'border border-gray-200 text-gray-700 hover:bg-gray-100'
                    : 'border border-white/10 text-gray-300 hover:bg-white/5'
                }`}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isDeleting || !password.trim()}
                className="btn-premium flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-600/30 cursor-pointer"
                style={{ backgroundColor: '#dc2626', border: '1px solid #b91c1c' }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
