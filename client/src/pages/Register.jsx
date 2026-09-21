import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Lock, UserPlus, ArrowRight, ShieldCheck, 
  Check, Eye, EyeOff, Sparkles, PlusCircle, LayoutDashboard, CheckCircle2, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import Logo from '../components/Logo';
import { register as registerUser } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

export default function Register() {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      case 1:
        return { score, label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
      case 2:
        return { score, label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-400' };
      case 3:
        return { score, label: 'Good', color: 'bg-blue-500', text: 'text-blue-400' };
      case 4:
        return { score, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
      default:
        return { score: 0, label: 'None', color: 'bg-white/10', text: 'text-gray-500' };
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
        setRegisteredUser(response.user);
        setIsRegistered(true);
        toast.success(`Welcome to Quiz Hub, ${response.user.name || 'User'}!`);
      } else {
        toast.error(response.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('[REGISTER ERROR]', error);
      let errMsg = 'Email already exists or invalid data';
      if (error.response) {
        errMsg = error.response.data?.message || errMsg;
      }
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="relative min-h-[85vh] flex items-center justify-center px-3 py-6 sm:py-10 lg:px-8 bg-background overflow-hidden w-full">
        
        {/* Glow Spheres */}
        <div className="absolute top-[15%] left-[20%] h-[400px] w-[400px] rounded-full bg-primary/20 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[15%] right-[20%] h-[450px] w-[450px] rounded-full bg-secondary/15 blur-[150px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl mx-auto space-y-6">
          
          {/* Header Branding */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Logo className="h-10 w-10 shrink-0" />
              <span className="font-outfit text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#386BFF] to-[#7B2CFF]">
                Quizy
              </span>
            </div>
            <h1 className={`font-outfit text-3xl sm:text-5xl font-black tracking-tight ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              Create Your <span className="text-gradient-primary">Host Account</span>
            </h1>
            <p className={`text-xs sm:text-base max-w-xl mx-auto ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Get instant access to create quizzes, host live multiplayer trivia & track live leaderboards.
            </p>
          </div>

          {/* Main Card Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column: Form Content */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border h-full flex flex-col justify-between ${
                  isLight ? 'bg-white border-gray-200/80 shadow-lg' : 'glass-panel border-white/15'
                }`}
              >
                {/* Top Accent Line */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-secondary via-primary to-accent" />

                {/* ACCOUNT FORM */}
                {!isRegistered && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className={`border-b pb-4 ${isLight ? 'border-gray-100' : 'border-white/10'}`}>
                      <h2 className={`font-outfit text-xl sm:text-2xl font-black ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        Host Information
                      </h2>
                      <p className={`text-xs mt-0.5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        Enter your details to create quizzes and manage live game sessions.
                      </p>
                    </div>

                    {/* Row 1: Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1 text-left">
                        <label className={`text-[11px] font-extrabold uppercase tracking-wider block ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                          Your Name / Nickname
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="e.g. Alex Smith"
                            {...register('name', { required: 'Name is required' })}
                            className={`w-full rounded-xl border px-3 py-2.5 pl-9 text-xs transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 ${
                              isLight 
                                ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400' 
                                : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                            }`}
                          />
                        </div>
                        {errors.name && <span className="text-[10px] text-accent font-bold">{errors.name.message}</span>}
                      </div>

                      <div className="space-y-1 text-left">
                        <label className={`text-[11px] font-extrabold uppercase tracking-wider block ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                          <input
                            type="email"
                            placeholder="host@quiz.com"
                            {...register('email', { 
                              required: 'Email is required',
                              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Valid email required' }
                            })}
                            className={`w-full rounded-xl border px-3 py-2.5 pl-9 text-xs transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 ${
                              isLight 
                                ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400' 
                                : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                            }`}
                          />
                        </div>
                        {errors.email && <span className="text-[10px] text-accent font-bold">{errors.email.message}</span>}
                      </div>
                    </div>

                    {/* Row 2: Password & Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1 text-left">
                        <label className={`text-[11px] font-extrabold uppercase tracking-wider block ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                            className={`w-full rounded-xl border px-3 py-2.5 pl-9 pr-8 text-xs transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 ${
                              isLight 
                                ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400' 
                                : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-2.5 top-3 ${isLight ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}`}
                          >
                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        {watchPassword && (
                          <div className="flex justify-between items-center text-[9px] font-bold mt-1">
                            <span className="text-gray-500 uppercase">Index:</span>
                            <span className={strength.text}>{strength.label}</span>
                          </div>
                        )}
                        {errors.password && <span className="text-[10px] text-accent font-bold">{errors.password.message}</span>}
                      </div>

                      <div className="space-y-1 text-left">
                        <label className={`text-[11px] font-extrabold uppercase tracking-wider block ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...register('confirmPassword', {
                              required: 'Confirm password required',
                              validate: (val) => val === watchPassword || 'Passwords do not match',
                            })}
                            className={`w-full rounded-xl border px-3 py-2.5 pl-9 pr-8 text-xs transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 ${
                              isLight 
                                ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400' 
                                : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={`absolute right-2.5 top-3 ${isLight ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}`}
                          >
                            {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        {errors.confirmPassword && <span className="text-[10px] text-accent font-bold">{errors.confirmPassword.message}</span>}
                      </div>
                    </div>

                    {/* Row 3: Security Question & Security Answer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1 text-left">
                        <label className={`text-[11px] font-extrabold uppercase tracking-wider block ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                          Security Question
                        </label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                          <select
                            {...register('securityQuestion', { required: 'Question required' })}
                            className={`w-full rounded-xl border px-3 py-2.5 pl-9 text-xs focus:outline-none focus:border-secondary ${
                              isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-[#151520] border-white/10 text-white'
                            }`}
                          >
                            <option value="What is your favourite colour?">What is your favourite colour?</option>
                            <option value="What was your first school?">What was your first school?</option>
                            <option value="What is your favourite food?">What is your favourite food?</option>
                            <option value="What is your childhood nickname?">What is your childhood nickname?</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className={`text-[11px] font-extrabold uppercase tracking-wider block ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                          Security Answer
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Your answer"
                            {...register('securityAnswer', { required: 'Answer required' })}
                            className={`w-full rounded-xl border px-3 py-2.5 pl-9 text-xs transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 ${
                              isLight 
                                ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400' 
                                : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                            }`}
                          />
                        </div>
                        {errors.securityAnswer && <span className="text-[10px] text-accent font-bold">{errors.securityAnswer.message}</span>}
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-premium btn-secondary-gradient py-3.5 px-6 flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold text-white rounded-xl shadow-secondary-glow cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Creating Host Account...</span>
                          </div>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            <span>Create Free Host Account</span>
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </button>
                    </div>

                    <p className={`text-[11px] text-center pt-2 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                      By registering, you agree to our{' '}
                      <Link to="/terms" className="text-secondary hover:underline font-bold">Terms & Conditions</Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-primary hover:underline font-bold">Privacy Policy</Link>.
                    </p>

                  </form>
                )}

                {/* SUCCESS CELEBRATION */}
                {isRegistered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 space-y-6"
                  >
                    <div className="h-20 w-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-bounce">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div>
                      <h2 className={`font-outfit text-3xl font-black ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        Welcome Aboard, {registeredUser?.name || 'User'}!
                      </h2>
                      <p className="text-xs sm:text-sm text-emerald-500 font-bold mt-1">
                        Your free Quiz Hub host account has been created successfully.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
                      <button
                        type="button"
                        onClick={() => navigate('/quiz/create')}
                        className="btn-premium btn-primary-gradient p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-white shadow-premium-glow hover:scale-105 transition-all cursor-pointer"
                      >
                        <PlusCircle className="h-6 w-6" />
                        <span className="font-extrabold text-sm">Create First Quiz</span>
                        <span className="text-[10px] text-gray-100 opacity-90">Design questions & custom background</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="btn-premium btn-secondary-gradient p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-white shadow-secondary-glow hover:scale-105 transition-all cursor-pointer"
                      >
                        <LayoutDashboard className="h-6 w-6" />
                        <span className="font-extrabold text-sm">Go to Dashboard</span>
                        <span className="text-[10px] text-gray-100 opacity-90">View hosted games & performance</span>
                      </button>
                    </div>
                  </motion.div>
                )}

              </motion.div>
            </div>

            {/* Right Column: Free Plan Benefits & Trust Highlights */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              <div className={`rounded-3xl p-6 border space-y-5 text-left h-full ${
                isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'glass-panel border-white/10'
              }`}>
                <div className={`flex items-center gap-2 border-b pb-3 ${isLight ? 'border-gray-100' : 'border-white/10'}`}>
                  <Sparkles className="h-5 w-5 text-secondary animate-pulse" />
                  <h3 className={`font-outfit text-base font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    Host Account Includes
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>5 Active Quizzes</h4>
                      <p className={`text-[11px] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Build and host up to 5 fully functional quizzes.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>20 Live Players / Battle</h4>
                      <p className={`text-[11px] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Host multiplayer quiz games simultaneously.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Real-Time Leaderboard</h4>
                      <p className={`text-[11px] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Instant live scores & performance calculation.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Excel / CSV Question Import</h4>
                      <p className={`text-[11px] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Upload questions in seconds from spreadsheets.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Custom Question Backgrounds</h4>
                      <p className={`text-[11px] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Set blur, brightness, gradients or custom graphics.</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 mt-4 ${
                  isLight ? 'bg-purple-50/70 border-purple-200/80' : 'bg-primary/10 border-primary/20'
                }`}>
                  <div className="flex items-center gap-2 text-xs font-extrabold text-primary">
                    <Zap className="h-4 w-4" />
                    <span>No Credit Card Required</span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                    Get started completely free forever. Upgrade to Pro anytime for unlimited players.
                  </p>
                </div>
              </div>

              {/* Login option footer */}
              <div className={`rounded-2xl p-4 border text-center ${
                isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'glass-panel border-white/10'
              }`}>
                <p className={`text-xs font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  Already have a host account?{' '}
                  <Link to="/login" className="font-extrabold text-secondary hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </AnimatedPage>
  );
}

