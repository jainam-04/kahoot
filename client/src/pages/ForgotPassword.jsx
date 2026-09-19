import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, KeyRound, Lock, Check, Timer, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import { forgotPassword, verifySecurityAnswer, resetPassword } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

export default function ForgotPassword() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || '';

  const [step, setStep] = useState(1);
  const [userEmail, setUserEmail] = useState(initialEmail);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  // Security attempts and lockout state
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);

  // Forms for each step
  const emailForm = useForm({ defaultValues: { email: initialEmail } });
  const answerForm = useForm({ defaultValues: { answer: '' } });
  const passwordForm = useForm({ defaultValues: { newPassword: '', confirmPassword: '' } });

  // 2-minute Lockout Countdown Timer Effect
  useEffect(() => {
    let interval = null;

    if (isLocked || (lockedUntil && lockedUntil > Date.now()) || remainingAttempts === 0) {
      const now = Date.now();
      const targetTime = (lockedUntil && lockedUntil > now) 
        ? lockedUntil 
        : now + 120000;

      if (!lockedUntil || lockedUntil <= now) {
        setLockedUntil(targetTime);
      }

      const updateCountdown = () => {
        const currentTime = Date.now();
        const diffMs = targetTime - currentTime;
        const seconds = Math.max(0, Math.ceil(diffMs / 1000));

        setLockoutTimeLeft(seconds);
        setIsLocked(seconds > 0);

        if (seconds <= 0) {
          setIsLocked(false);
          setLockedUntil(null);
          setLockoutTimeLeft(0);
          setAttempts(0);
          setRemainingAttempts(maxAttempts);
          if (interval) clearInterval(interval);
        }
      };

      updateCountdown();
      interval = setInterval(updateCountdown, 1000);
    } else {
      setLockoutTimeLeft(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLocked, lockedUntil, remainingAttempts, maxAttempts]);

  const formatLockoutTime = (seconds) => {
    const s = Math.max(0, seconds || 0);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Password strength helper
  const watchNewPassword = passwordForm.watch('newPassword');
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: 'None', color: 'bg-white/10' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1: return { score, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
      case 2: return { score, label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-500' };
      case 3: return { score, label: 'Good', color: 'bg-blue-500', text: 'text-blue-500' };
      case 4: return { score, label: 'Strong', color: 'bg-green-500', text: 'text-green-500' };
      default: return { score: 0, label: 'None', color: 'bg-white/10', text: 'text-gray-500' };
    }
  };
  const strength = getPasswordStrength(watchNewPassword);

  // STEP 1: Handle Email Submit
  const onEmailSubmit = async (data) => {
    setIsLoading(true);
    try {
      const emailVal = data.email.trim().toLowerCase();
      const response = await forgotPassword({ email: emailVal });
      if (response.success && response.securityQuestion) {
        setUserEmail(emailVal);
        setSecurityQuestion(response.securityQuestion);
        
        const newAttempts = response.attempts ?? 0;
        const newMax = response.maxAttempts ?? 5;
        const newRemaining = response.remainingAttempts ?? Math.max(0, newMax - newAttempts);
        const lockedStatus = Boolean(response.isLocked) || newRemaining === 0;
        const lockedTime = response.lockedUntil ? Number(response.lockedUntil) : (lockedStatus ? Date.now() + 120000 : null);

        setAttempts(newAttempts);
        setMaxAttempts(newMax);
        setRemainingAttempts(newRemaining);
        setIsLocked(lockedStatus);
        setLockedUntil(lockedTime);

        setStep(2);
        
        if (lockedStatus || (lockedTime && lockedTime > Date.now())) {
          toast.error('Account is temporarily locked due to maximum failed attempts.');
        } else {
          toast.success('Security question retrieved successfully!');
        }
      } else {
        toast.error(response.message || 'No account found with this email.');
      }
    } catch (error) {
      console.error('[FORGOT PASSWORD ERROR]', error);
      toast.error(error.response?.data?.message || 'Server error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Handle Security Answer Submit
  const onAnswerSubmit = async (data) => {
    if (isLocked || lockoutTimeLeft > 0 || remainingAttempts === 0) {
      toast.error('Account is locked. Please wait for countdown timer to complete.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifySecurityAnswer({ email: userEmail, answer: data.answer });
      if (response.success && response.resetToken) {
        setResetToken(response.resetToken);
        setStep(3);
        setAttempts(0);
        setRemainingAttempts(5);
        setIsLocked(false);
        setLockedUntil(null);
        setLockoutTimeLeft(0);
        toast.success(response.message || 'Security answer verified successfully!');
      }
    } catch (error) {
      console.error('[VERIFY ANSWER ERROR]', error);
      const errData = error.response?.data;
      if (errData) {
        if (errData.isLocked || errData.remainingAttempts === 0) {
          setIsLocked(true);
          const lockedTime = errData.lockedUntil ? Number(errData.lockedUntil) : Date.now() + 120000;
          setLockedUntil(lockedTime);
          setAttempts(5);
          setRemainingAttempts(0);
          toast.error(errData.message || 'Maximum attempts reached. Account temporarily locked for 2 minutes.');
        } else if (errData.remainingAttempts !== undefined) {
          const rem = errData.remainingAttempts;
          const att = errData.attempts ?? (maxAttempts - rem);
          setAttempts(att);
          setRemainingAttempts(rem);

          if (rem === 0) {
            setIsLocked(true);
            setLockedUntil(Date.now() + 120000);
          }
          toast.error(errData.message || `Incorrect security answer. ${rem} attempts remaining.`);
        } else {
          toast.error(errData.message || 'Incorrect security answer.');
        }
      } else if (error.request) {
        toast.error('Server error occurred. Please check your network connection.');
      } else {
        toast.error(error.message || 'Server error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3: Handle Password Reset Submit
  const onPasswordSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await resetPassword({
        email: userEmail,
        resetToken,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });

      if (response.success) {
        setIsResetComplete(true);
        setAttempts(0);
        setRemainingAttempts(5);
        setIsLocked(false);
        setLockedUntil(null);
        setLockoutTimeLeft(0);
        toast.success('Password reset successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        if (response.isExpired) {
          toast.error('Session or reset token expired. Please restart the password recovery process.');
          setStep(1);
        } else {
          toast.error(response.message || 'Password reset failed.');
        }
      }
    } catch (error) {
      console.error('[RESET PASSWORD ERROR]', error);
      const errData = error.response?.data;
      if (errData?.isExpired) {
        toast.error('Session or reset token expired. Please restart the password recovery process.');
        setStep(1);
      } else {
        toast.error(errData?.message || 'Server error occurred. Failed to reset password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="relative flex flex-1 flex-col items-center justify-center min-h-[80vh] px-4 py-8 sm:py-12 sm:px-6 lg:px-8 bg-background">
        
        {/* Glow Spheres */}
        <div className="absolute top-[10%] left-[20%] h-[350px] w-[350px] rounded-full bg-glow-primary pointer-events-none opacity-45"></div>
        <div className="absolute bottom-[10%] right-[20%] h-[400px] w-[400px] rounded-full bg-glow-secondary pointer-events-none opacity-30"></div>

        {/* Container */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          className={`w-full max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 relative overflow-hidden border ${
            isLight ? 'bg-white border-gray-200/80 shadow-xl' : 'glass-panel border-white/15'
          }`}
        >
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

          {/* Success Overlay */}
          {isResetComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="h-16 w-16 rounded-full bg-green-500/20 text-green-500 border border-green-500/30 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
              <h3 className={`font-outfit text-2xl font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                Password Reset Successful!
              </h3>
              <p className={`text-sm max-w-[280px] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Your password has been updated. Redirecting to login page...
              </p>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 border border-primary/20 text-primary mb-4">
                  {step === 1 && <KeyRound className="h-6 w-6" />}
                  {step === 2 && <ShieldCheck className="h-6 w-6" />}
                  {step === 3 && <Lock className="h-6 w-6 text-secondary" />}
                </div>
                <h2 className={`font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {step === 1 && 'Forgot Password'}
                  {step === 2 && 'Security Verification'}
                  {step === 3 && 'Set New Password'}
                </h2>
                <p className={`mt-2 text-xs sm:text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  {step === 1 && 'Enter your email address to start account recovery'}
                  {step === 2 && 'Answer your security question to verify identity'}
                  {step === 3 && 'Choose a new password for your account'}
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-between mb-8 px-4">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
                  step >= 1 
                    ? 'bg-primary text-white shadow-[0_0_12px_rgba(109,40,217,0.5)]' 
                    : isLight ? 'bg-gray-100 text-gray-400' : 'bg-white/10 text-gray-400'
                }`}>
                  1
                </div>
                <div className={`flex-1 h-0.5 mx-2 transition-all ${step >= 2 ? 'bg-primary' : isLight ? 'bg-gray-200' : 'bg-white/10'}`}></div>
                <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
                  step >= 2 
                    ? 'bg-primary text-white shadow-[0_0_12px_rgba(109,40,217,0.5)]' 
                    : isLight ? 'bg-gray-100 text-gray-400' : 'bg-white/10 text-gray-400'
                }`}>
                  2
                </div>
                <div className={`flex-1 h-0.5 mx-2 transition-all ${step >= 3 ? 'bg-secondary' : isLight ? 'bg-gray-200' : 'bg-white/10'}`}></div>
                <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
                  step >= 3 
                    ? 'bg-secondary text-white shadow-[0_0_12px_rgba(236,72,153,0.5)]' 
                    : isLight ? 'bg-gray-100 text-gray-400' : 'bg-white/10 text-gray-400'
                }`}>
                  3
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* STEP 1: EMAIL FORM */}
                {step === 1 && (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className={`text-xs font-semibold uppercase tracking-wider block text-left ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                          <Mail className="h-4.5 w-4.5" />
                        </div>
                        <input
                          type="email"
                          placeholder="name@company.com"
                          {...emailForm.register('email', {
                            required: 'Email address is required',
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Please enter a valid email address',
                            },
                          })}
                          className={`w-full rounded-xl border px-4 py-3 pl-11 text-sm transition-all focus:outline-none focus:ring-1 ${
                            isLight ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          } ${
                            emailForm.formState.errors.email 
                              ? 'border-accent/40 focus:border-accent focus:ring-accent/30' 
                              : 'focus:border-primary focus:ring-primary/30'
                          }`}
                        />
                      </div>
                      {emailForm.formState.errors.email && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-accent text-left">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{emailForm.formState.errors.email.message}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full btn-premium btn-primary-gradient py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-bold shadow-premium-glow cursor-pointer ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Finding account...</span>
                        </div>
                      ) : (
                        <>
                          <span>Continue</span>
                          <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}

                {/* STEP 2: SECURITY QUESTION FORM */}
                {step === 2 && (
                  <motion.form
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={answerForm.handleSubmit(onAnswerSubmit)}
                    className="space-y-6"
                  >
                    {/* Header bar with security question and live counter */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
                      <div className={`flex-1 p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold text-center sm:text-left ${
                        isLight ? 'bg-secondary/10 border-secondary/30 text-gray-900' : 'bg-secondary/10 border-secondary/20 text-secondary'
                      }`}>
                        {securityQuestion || 'What is your security answer?'}
                      </div>
                      
                      {/* Live Attempts Counter Badge - RED when 0 attempts remaining */}
                      <div className={`px-3 py-2 rounded-xl border text-xs font-extrabold font-mono shrink-0 flex items-center justify-center gap-1.5 transition-all ${
                        isLocked || lockoutTimeLeft > 0 || remainingAttempts === 0
                          ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse' 
                          : remainingAttempts === 1 
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse' 
                            : isLight 
                              ? 'bg-primary/10 border-primary/20 text-primary' 
                              : 'bg-primary/20 border-primary/30 text-purple-300'
                      }`}>
                        {isLocked || lockoutTimeLeft > 0 || remainingAttempts === 0 ? (
                          <>
                            <Lock className="h-3.5 w-3.5 text-red-500" />
                            <span>Attempts: 5/5 (0 left)</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Attempts: {attempts}/{maxAttempts} ({remainingAttempts} left)</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Temporary Lockout Box + Visible 2 min Timer */}
                    {(isLocked || lockoutTimeLeft > 0 || remainingAttempts === 0) && (
                      <div className="p-4 rounded-2xl border-2 border-red-500 bg-red-500/15 text-red-400 flex flex-col items-center justify-center text-center space-y-3 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
                        <div className="flex items-center gap-2 font-black text-red-500 text-sm uppercase tracking-wider">
                          <Lock className="h-5 w-5 animate-bounce text-red-500" />
                          <span>Maximum Attempts Reached (0 Remaining)</span>
                        </div>
                        <p className="text-xs text-red-200/90 leading-relaxed font-medium max-w-[320px]">
                          Your account is temporarily locked due to 5 consecutive failed attempts. Verification is disabled.
                        </p>
                        <div className="inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-red-950/90 border border-red-500/60 text-white font-mono shadow-inner">
                          <Timer className="h-5 w-5 text-red-400 animate-spin" />
                          <span className="text-xs text-red-300 uppercase tracking-widest font-semibold">Try again in:</span>
                          <span className="text-red-400 text-xl font-black tracking-wider">{formatLockoutTime(lockoutTimeLeft)}</span>
                        </div>
                      </div>
                    )}

                    {/* Warning Banner at Last Attempt */}
                    {!isLocked && lockoutTimeLeft === 0 && remainingAttempts === 1 && (
                      <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-semibold flex items-start gap-2 text-left">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-400 block mb-0.5">Warning: Final attempt!</span>
                          <span>One more incorrect answer will lock your verification for 2 minutes.</span>
                        </div>
                      </div>
                    )}

                    {/* Answer Input */}
                    <div className="space-y-2">
                      <label className={`text-xs font-semibold uppercase tracking-wider block text-left ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                        Your Answer
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                          <ShieldCheck className="h-4.5 w-4.5" />
                        </div>
                        <input
                          type="text"
                          placeholder={isLocked || lockoutTimeLeft > 0 || remainingAttempts === 0 ? "Verification temporarily locked" : "Type your answer"}
                          disabled={isLocked || lockoutTimeLeft > 0 || remainingAttempts === 0 || isLoading}
                          {...answerForm.register('answer', {
                            required: isLocked || lockoutTimeLeft > 0 || remainingAttempts === 0 ? false : 'Security answer is required',
                          })}
                          className={`w-full rounded-xl border px-4 py-3 pl-11 text-sm transition-all focus:outline-none focus:ring-1 ${
                            isLocked || lockoutTimeLeft > 0 || remainingAttempts === 0
                              ? 'bg-red-500/10 border-red-500/40 text-red-400 placeholder-red-400/50 cursor-not-allowed'
                              : isLight 
                                ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400' 
                                : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          } ${
                            answerForm.formState.errors.answer && !isLocked && remainingAttempts > 0
                              ? 'border-accent/40 focus:border-accent focus:ring-accent/30' 
                              : 'focus:border-primary focus:ring-primary/30'
                          }`}
                        />
                      </div>

                      {answerForm.formState.errors.answer && !isLocked && lockoutTimeLeft === 0 && remainingAttempts > 0 && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-accent text-left">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{answerForm.formState.errors.answer.message}</span>
                        </div>
                      )}

                      {/* Attempts remaining subtext (RED for 0 attempts remaining) */}
                      {(isLocked || lockoutTimeLeft > 0 || remainingAttempts === 0) ? (
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 text-left font-bold">
                          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                          <span>0 attempts remaining. Account locked for 2 minutes.</span>
                        </div>
                      ) : remainingAttempts < 5 && remainingAttempts > 0 ? (
                        <div className={`flex items-center gap-1.5 mt-1.5 text-xs text-left font-medium ${remainingAttempts === 1 ? 'text-amber-400 font-bold' : 'text-amber-400/90'}`}>
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Incorrect answer. {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining.</span>
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || isLocked || lockoutTimeLeft > 0 || remainingAttempts === 0}
                      className={`w-full py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                        isLocked || lockoutTimeLeft > 0 || remainingAttempts === 0
                          ? 'bg-red-950/80 border border-red-500/50 text-red-300 cursor-not-allowed opacity-90'
                          : isLoading
                            ? 'btn-premium btn-secondary-gradient opacity-50 cursor-not-allowed'
                            : 'btn-premium btn-secondary-gradient shadow-secondary-glow'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Verifying answer...</span>
                        </div>
                      ) : isLocked || lockoutTimeLeft > 0 || remainingAttempts === 0 ? (
                        <div className="flex items-center gap-2 font-mono">
                          <Lock className="h-4 w-4 text-red-400" />
                          <span>Verification Locked ({formatLockoutTime(lockoutTimeLeft)})</span>
                        </div>
                      ) : (
                        <>
                          <span>Submit Answer</span>
                          <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}

                {/* STEP 3: RESET PASSWORD FORM */}
                {step === 3 && (
                  <motion.form
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-6"
                  >
                    {/* New Password */}
                    <div className="space-y-2">
                      <label className={`text-xs font-semibold uppercase tracking-wider block text-left ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                        New Password
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                          <Lock className="h-4.5 w-4.5" />
                        </div>
                        <input
                          type="password"
                          placeholder="••••••••"
                          {...passwordForm.register('newPassword', {
                            required: 'New password is required',
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters',
                            },
                          })}
                          className={`w-full rounded-xl border px-4 py-3 pl-11 text-sm transition-all focus:outline-none focus:ring-1 ${
                            isLight ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          } ${
                            passwordForm.formState.errors.newPassword 
                              ? 'border-accent/40 focus:border-accent focus:ring-accent/30' 
                              : 'focus:border-primary focus:ring-primary/30'
                          }`}
                        />
                      </div>

                      {/* Strength indicator */}
                      {watchNewPassword && (
                        <div className="mt-2.5 space-y-1.5 text-left">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-gray-400">Password Strength:</span>
                            <span className={strength.text}>{strength.label}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                            {[1, 2, 3, 4].map((i) => (
                              <div 
                                key={i} 
                                className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                                  strength.score >= i ? strength.color : 'bg-white/5'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {passwordForm.formState.errors.newPassword && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-accent text-left">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{passwordForm.formState.errors.newPassword.message}</span>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className={`text-xs font-semibold uppercase tracking-wider block text-left ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                          <Lock className="h-4.5 w-4.5" />
                        </div>
                        <input
                          type="password"
                          placeholder="••••••••"
                          {...passwordForm.register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (val) => val === watchNewPassword || 'Passwords do not match',
                          })}
                          className={`w-full rounded-xl border px-4 py-3 pl-11 text-sm transition-all focus:outline-none focus:ring-1 ${
                            isLight ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          } ${
                            passwordForm.formState.errors.confirmPassword 
                              ? 'border-accent/40 focus:border-accent focus:ring-accent/30' 
                              : 'focus:border-primary focus:ring-primary/30'
                          }`}
                        />
                      </div>
                      {passwordForm.formState.errors.confirmPassword && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-accent text-left">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{passwordForm.formState.errors.confirmPassword.message}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full btn-premium btn-secondary-gradient py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-bold shadow-secondary-glow cursor-pointer ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Updating password...</span>
                        </div>
                      ) : (
                        <>
                          <span>Reset & Update Password</span>
                          <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Footer Back link */}
              <div className="mt-8 text-center border-t border-white/5 pt-6">
                <Link
                  to="/login"
                  className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors ${
                    isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}

        </motion.div>
      </div>
    </AnimatedPage>
  );
}

