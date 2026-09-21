import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Mail, Lock, UserPlus, ArrowRight, ShieldCheck,
  Check, Sparkles, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from './Logo';
import { register as registerUser } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

export default function QuickRegisterModal({ isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      securityQuestion: 'What is your favourite colour?',
      securityAnswer: '',
    },
  });

  const watchPassword = watch('password');

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: 'None', color: 'bg-white/10', text: 'text-gray-500' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1: return { score, label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
      case 2: return { score, label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-400' };
      case 3: return { score, label: 'Good', color: 'bg-blue-500', text: 'text-blue-400' };
      case 4: return { score, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
      default: return { score: 0, label: 'None', color: 'bg-white/10', text: 'text-gray-500' };
    }
  };

  const strength = getPasswordStrength(watchPassword);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await registerUser({
        name: data.name ? data.name.trim() : '',
        email: data.email ? data.email.trim() : '',
        password: data.password,
        securityQuestion: data.securityQuestion,
        securityAnswer: data.securityAnswer ? data.securityAnswer.trim().toLowerCase() : '',
      });

      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        toast.success(`Welcome to Quiz Hub, ${response.user.name || 'User'}!`);

        if (onClose) onClose();
        if (onSuccess) {
          onSuccess(response.user);
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(response.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('[QUICK REGISTER ERROR]', error);
      let errMsg = 'Email already exists or invalid data';
      if (error.response) {
        errMsg = error.response.data?.message || errMsg;
      }
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative w-full max-w-lg rounded-3xl border overflow-hidden shadow-2xl my-auto ${isLight
              ? 'bg-white border-purple-100 text-gray-900'
              : 'bg-[#0e0e14] border-white/10 text-white'
            }`}
        >
          {/* Top Gradient Ribbon */}
          <div className="h-1.5 w-full bg-gradient-to-r from-secondary via-primary to-accent" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-5 sm:p-8 space-y-6">

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Logo className="h-8 w-8 shrink-0" />
                <span className="font-outfit text-xl font-extrabold tracking-tight">
                  Quiz<span className="text-secondary">Forge</span>
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Host Account
                </span>
              </div>
              <h2 className="font-outfit text-2xl sm:text-3xl font-black tracking-tight">
                Create Host Account
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
                Sign up to create quizzes, host live multiplayer battles & track performance instantly.
              </p>
            </div>

            {/* Account Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-2">

              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider block text-gray-400">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Smith"
                      {...register('name', { required: 'Name is required' })}
                      className="w-full rounded-xl border bg-white/5 border-white/10 px-3 py-2.5 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                    />
                  </div>
                  {errors.name && <span className="text-[10px] text-accent font-bold">{errors.name.message}</span>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider block text-gray-400">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="host@quiz.com"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+$/, message: 'Valid email required' }
                      })}
                      className="w-full rounded-xl border bg-white/5 border-white/10 px-3 py-2.5 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                    />
                  </div>
                  {errors.email && <span className="text-[10px] text-accent font-bold">{errors.email.message}</span>}
                </div>

              </div>

              {/* Row 2: Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase tracking-wider block text-gray-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                    className="w-full rounded-xl border bg-white/5 border-white/10 px-3 py-2.5 pl-9 pr-8 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {watchPassword && (
                  <div className="flex justify-between items-center text-[9px] font-bold mt-1">
                    <span className="text-gray-500 uppercase">Strength:</span>
                    <span className={strength.text}>{strength.label}</span>
                  </div>
                )}
                {errors.password && <span className="text-[10px] text-accent font-bold">{errors.password.message}</span>}
              </div>

              {/* Row 3: Security Question & Security Answer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Security Question */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider block text-gray-400">
                    Security Question
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    <select
                      {...register('securityQuestion', { required: 'Question required' })}
                      className="w-full rounded-xl border bg-[#151520] border-white/10 px-3 py-2.5 pl-9 text-xs text-white focus:outline-none focus:border-secondary"
                    >
                      <option value="What is your favourite colour?">What is your favourite colour?</option>
                      <option value="What was your first school?">What was your first school?</option>
                      <option value="What is your favourite food?">What is your favourite food?</option>
                      <option value="What is your childhood nickname?">What is your childhood nickname?</option>
                    </select>
                  </div>
                </div>

                {/* Security Answer */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider block text-gray-400">
                    Security Answer
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Your answer"
                      {...register('securityAnswer', { required: 'Answer required' })}
                      className="w-full rounded-xl border bg-white/5 border-white/10 px-3 py-2.5 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                    />
                  </div>
                  {errors.securityAnswer && <span className="text-[10px] text-accent font-bold">{errors.securityAnswer.message}</span>}
                </div>

              </div>

              {/* Perks Highlights Footer */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>5 Free Quizzes</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>20 Live Players</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>Real-time Leaderboard</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-premium btn-secondary-gradient py-3.5 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold text-white rounded-2xl shadow-secondary-glow cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating Free Host Account...</span>
                  </div>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Create Host Account</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>

            </form>

            {/* Bottom text */}
            <div className="text-center pt-1 border-t border-white/10">
              <p className="text-xs text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                    navigate('/login');
                  }}
                  className="font-extrabold text-primary hover:underline cursor-pointer"
                >
                  Sign In Here
                </button>
              </p>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

