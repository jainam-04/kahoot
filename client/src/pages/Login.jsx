import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, Sparkles, Trophy, CheckCircle2, Play, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import Logo from '../components/Logo';
import DemoModal from '../components/DemoModal';
import { login } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [activeTabOption, setActiveTabOption] = useState(1);
  const [mockScore, setMockScore] = useState(4850);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired')) {
      toast.error('Session expired or database reconnected. Please sign in again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMockScore((prev) => (prev > 6000 ? 4850 : prev + 150));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const hostForm = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const onHostSubmit = async (data) => {
    setIsLoading(true);
    setIsSuccess(false);
    try {
      const response = await login({
        email: data.email ? data.email.trim() : '',
        password: data.password,
      });

      if (response.success) {
        setIsSuccess(true);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        toast.success(`Welcome back, ${response.user.name || 'Host'}!`);

        setTimeout(() => {
          navigate('/dashboard', {
            state: { welcomeMsg: `Welcome back, ${response.user.name || 'Host'}!` },
            replace: true,
          });
        }, 800);
      } else {
        triggerShake();
        toast.error(response.message || 'Login failed. Please check credentials.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('[LOGIN ERROR]', error);
      triggerShake();
      let errMsg = 'Invalid email or password';
      if (error.response) {
        errMsg = error.response.data?.message || errMsg;
      } else if (error.request) {
        errMsg = 'Connection failed. Please ensure backend server is running.';
      } else {
        errMsg = error.message || errMsg;
      }
      toast.error(errMsg);
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="relative min-h-[85vh] flex items-center justify-center px-3 py-6 sm:py-12 lg:px-8 bg-background overflow-hidden w-full">
        
        {/* Glow Spheres */}
        <div className="absolute top-[10%] left-[15%] h-[300px] sm:h-[400px] w-[300px] sm:w-[400px] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[15%] h-[350px] sm:h-[450px] w-[350px] sm:w-[450px] rounded-full bg-secondary/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-6xl mx-auto">
          
          {/* Split Screen Grid on Desktop (6 col / 6 col), Priority Form Stack on Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: Visual Branding & Live Preview Animation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 space-y-4 sm:space-y-6 flex flex-col justify-center text-left"
            >
              {/* Brand Header */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Logo className="h-9 w-9 sm:h-12 sm:w-12 shrink-0" />
                <div>
                  <h1 className="font-outfit text-xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#386BFF] to-[#7B2CFF]">
                    Quizy
                  </h1>
                  <p className="text-[11px] sm:text-sm font-semibold text-primary">
                    Interactive Real-Time Quiz Platform
                  </p>
                </div>
              </div>

              {/* Desktop Visual Preview Card */}
              <div className="hidden lg:block glass-panel rounded-3xl p-6 border border-white/15 relative overflow-hidden bg-gradient-to-b from-slate-900/80 to-black/90 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-green-500 inline-block" />
                    <span className="text-xs font-mono font-bold text-gray-400 ml-2">LIVE ARENA PREVIEW</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black">
                    <Trophy className="h-3.5 w-3.5" />
                    <span>{mockScore.toLocaleString()} pts</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[10px] font-black uppercase text-secondary tracking-widest bg-secondary/10 px-2 py-0.5 rounded">
                    Live Question
                  </span>
                  <p className="font-outfit text-sm font-extrabold text-white">
                    What primary colors mix together to make Green?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setActiveTabOption(0)}
                    className={`p-3 rounded-xl border text-xs font-extrabold flex items-center justify-between cursor-pointer transition-all ${
                      activeTabOption === 0 ? 'bg-red-600 border-red-400 text-white' : 'bg-red-500/20 border-red-500/30 text-gray-300'
                    }`}
                  >
                    <span>▲ Red & Blue</span>
                  </div>

                  <div
                    onClick={() => setActiveTabOption(1)}
                    className={`p-3 rounded-xl border text-xs font-extrabold flex items-center justify-between cursor-pointer transition-all ${
                      activeTabOption === 1 ? 'bg-emerald-600 border-emerald-300 text-white shadow-lg' : 'bg-blue-500/20 border-blue-500/30 text-gray-300'
                    }`}
                  >
                    <span>◆ Yellow & Blue</span>
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-gray-400">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
                    <span>1,420 Players Online Now</span>
                  </div>
                  <span className="text-emerald-400 font-extrabold">98.4% Uptime</span>
                </div>
              </div>

              {/* Try Demo Compact Callout Card */}
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-panel border border-primary/30 bg-primary/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse text-yellow-400" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-outfit text-xs sm:text-sm font-extrabold text-white truncate">
                      Want to test Quiz Hub first?
                    </h4>
                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                      Try our interactive 30s mini quiz demo!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-extrabold shadow-md flex items-center gap-1 shrink-0 cursor-pointer transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                  <span>Try Demo</span>
                </button>
              </div>

            </motion.div>

            {/* RIGHT COLUMN: Modern Form Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: 1,
                x: shake ? [-8, 8, -6, 6, -3, 3, 0] : 0,
              }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 w-full max-w-md mx-auto"
            >
              <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-9 relative overflow-hidden shadow-2xl border border-white/15">
                
                {/* Gradient bar top */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

                {/* Header */}
                <div className="text-center mb-5 sm:mb-6">
                  <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/15 border border-primary/20 text-primary mb-2.5">
                    <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h2 className={`font-outfit text-xl sm:text-3xl font-black tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    Welcome Back
                  </h2>
                  <p className={`mt-1 text-xs sm:text-sm font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    Log in as a host to manage live quizzes
                  </p>
                </div>

                {/* SUCCESS STATE */}
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-6 text-center space-y-3"
                  >
                    <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="h-8 w-8 animate-bounce" />
                    </div>
                    <h3 className="font-outfit text-lg font-black text-white">
                      Authentication Successful!
                    </h3>
                    <p className="text-xs text-emerald-400 font-bold">
                      Redirecting to dashboard...
                    </p>
                  </motion.div>
                ) : (
                  /* HOST LOGIN FORM */
                  <form onSubmit={hostForm.handleSubmit(onHostSubmit)} className="space-y-4 sm:space-y-5">
                    
                    {/* Email / Username Field */}
                    <div className="space-y-1 text-left">
                      <label className={`text-[11px] sm:text-xs font-extrabold uppercase tracking-wider block ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                        Email Address or Username
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          placeholder="host@quizhub.com"
                          {...hostForm.register('email', {
                            required: 'Email address is required',
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Please enter a valid email address',
                            },
                          })}
                          className={`w-full rounded-xl border px-3.5 py-2.5 sm:py-3 pl-10 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
                            isLight
                              ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-primary/30 focus:border-primary'
                              : 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-primary/40 focus:border-primary'
                          } ${
                            hostForm.formState.errors.email
                              ? 'border-accent/60 focus:ring-accent/30 focus:border-accent'
                              : ''
                          }`}
                        />
                      </div>
                      {hostForm.formState.errors.email && (
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-accent font-bold">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{hostForm.formState.errors.email.message}</span>
                        </div>
                      )}
                    </div>

                    {/* Password Field with Toggle */}
                    <div className="space-y-1 text-left">
                      <div className="flex justify-between items-center">
                        <label className={`text-[11px] sm:text-xs font-extrabold uppercase tracking-wider block ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => navigate('/forgot-password', { state: { email: hostForm.getValues('email') } })}
                          className="text-[11px] sm:text-xs font-bold text-secondary hover:underline cursor-pointer bg-transparent border-0 p-0"
                        >
                          Forgot password?
                        </button>
                      </div>

                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...hostForm.register('password', {
                            required: 'Password is required',
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters',
                            },
                          })}
                          className={`w-full rounded-xl border px-3.5 py-2.5 sm:py-3 pl-10 pr-10 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
                            isLight
                              ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-primary/30 focus:border-primary'
                              : 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-primary/40 focus:border-primary'
                          } ${
                            hostForm.formState.errors.password
                              ? 'border-accent/60 focus:ring-accent/30 focus:border-accent'
                              : ''
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {hostForm.formState.errors.password && (
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-accent font-bold">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{hostForm.formState.errors.password.message}</span>
                        </div>
                      )}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center text-left">
                      <input
                        id="rememberMe"
                        type="checkbox"
                        {...hostForm.register('rememberMe')}
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/30 cursor-pointer"
                      />
                      <label
                        htmlFor="rememberMe"
                        className={`ml-2 text-[11px] sm:text-xs font-bold uppercase tracking-wide cursor-pointer select-none ${isLight ? 'text-gray-700' : 'text-gray-300'}`}
                      >
                        Remember my session
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full btn-premium btn-primary-gradient py-3 sm:py-3.5 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold text-white rounded-xl shadow-premium-glow cursor-pointer transition-all ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Authenticating...</span>
                        </div>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4" />
                          <span>Sign In as Host</span>
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </button>

                  </form>
                )}

                {/* Footer link */}
                <div className="mt-5 text-center border-t border-white/10 pt-4">
                  <p className={`text-xs font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    New to Quiz Hub?{' '}
                    <Link to="/register" className="font-extrabold text-secondary hover:underline">
                      Create an account
                    </Link>
                  </p>
                </div>

              </div>
            </motion.div>

          </div>
        </div>

        {/* Demo Modal */}
        <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />

      </div>
    </AnimatedPage>
  );
}
