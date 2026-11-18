import signupBg from "../assets/signup-bg.png";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Lock, UserPlus, ArrowRight, ShieldCheck, 
  Check, Eye, EyeOff, PlusCircle, LayoutDashboard, CheckCircle2, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import { register as registerUser } from '../services/authService';
import { setAuthSession } from '../utils/auth';
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user?.role === 'superadmin' || user?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate]);

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
        setAuthSession(response.token, response.user);
        setRegisteredUser(response.user);
        setIsRegistered(true);
        toast.success(`Welcome to Gubbi, ${response.user.name || 'User'}!`);
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div
        className="relative min-h-[calc(100vh-var(--main-header-height,64px))] w-full overflow-hidden flex items-center justify-center px-2.5 py-4 sm:py-8 lg:px-8 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${signupBg})`,
          backgroundAttachment: 'scroll',
        }}
      >
        <div className="relative z-10 w-full max-w-[1180px] mx-auto px-1 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-4 sm:gap-6 lg:gap-8 items-center">
            
            {/* ===================================================================== */}
            {/* HERO / BRANDING SECTION (With Gubbi Mascot Clipart & Badges)           */}
            {/* ===================================================================== */}
            <section className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2.5 sm:gap-3.5 px-2 pb-1 lg:pb-6">
              
              {/* Mascot & Title Row */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 w-full">
                {/* Gubbi Bird Mascot Clipart Container */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl bg-white/95 border border-purple-200/90 shadow-[0_8px_20px_rgba(101,53,255,0.15)] p-2 sm:p-2.5 flex items-center justify-center backdrop-blur-md transition-transform hover:scale-105">
                    <img 
                      src="/gubbi-bird.png" 
                      alt="Gubbi Bird Mascot" 
                      className="w-full h-full object-contain filter drop-shadow-md select-none"
                      onError={(e) => {
                        e.currentTarget.src = '/gubbi-logo-transparent.png';
                      }}
                    />
                  </div>
                  {/* Playful Floating Sparkle Badge */}
                  <span className="absolute -top-1.5 -right-1.5 text-base sm:text-lg select-none animate-bounce">
                    ✨
                  </span>
                </div>

                {/* Heading & Badge */}
                <div className="flex flex-col items-center sm:items-start">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EDE9FE] text-[#6535ff] text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1 shadow-2xs">
                    ✦ Free Host Registration
                  </span>
                  <h1 className="font-outfit text-2xl sm:text-3xl lg:text-[40px] font-black leading-tight sm:leading-[1.08] tracking-tight text-[#11152d]">
                    <span>Create Your </span>
                    <span className="text-[#6535ff]">Host Account</span>
                  </h1>
                </div>
              </div>

              {/* Subtitle */}
              <p className="max-w-md text-xs sm:text-sm font-semibold leading-relaxed text-[#59627a] px-1 sm:px-0">
                Get instant access to create quizzes, host live multiplayer trivia &amp; track live leaderboards.
              </p>

              {/* Trust Badges */}
              <div className="flex items-center gap-2 flex-wrap pt-0.5 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] font-bold text-[#4B5563] bg-white/80 px-2.5 py-0.5 sm:py-1 rounded-full border border-purple-100 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>100% Free Forever</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] font-bold text-[#4B5563] bg-white/80 px-2.5 py-0.5 sm:py-1 rounded-full border border-purple-100 shadow-2xs">
                  <Zap className="w-3 h-3 text-[#6535ff] shrink-0" />
                  <span>Instant Live Hosting</span>
                </span>
              </div>
            </section>

            {/* ===================================================================== */}
            {/* REGISTRATION CARD (Mobile-Friendly & High-Density)                     */}
            {/* ===================================================================== */}
            <div className="rounded-[22px] sm:rounded-[28px] bg-white p-3.5 sm:p-5 lg:p-6 shadow-[0_20px_60px_rgba(70,49,135,0.12)] border border-[#ECEAF3]">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(180px,1fr)] gap-4 sm:gap-5 lg:gap-6 items-stretch">
            
                {/* Left Column: Form Content */}
                <div className="lg:col-span-1 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative h-full"
                  >
                    {/* ACCOUNT FORM */}
                    {!isRegistered && (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5 sm:space-y-3">
                        <div className="flex items-center gap-2 pb-0.5">
                          <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-[#f4efff] text-[#6535ff]">
                            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </span>
                          <h2 className="font-outfit text-base sm:text-lg lg:text-xl font-black tracking-tight text-[#151a31]">
                            Create Your Host Account
                          </h2>
                        </div>

                        {/* Row 1: Name & Email */}
                        <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
                          <div className="space-y-0.5 text-left">
                            <label className="sr-only">
                              Your Name / Nickname
                            </label>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8b5cf6]">
                                <User className="h-4 w-4" />
                              </div>
                              <input
                                type="text"
                                placeholder="Enter your name"
                                aria-label="Your name"
                                {...register('name', { required: 'Name is required' })}
                                className="w-full rounded-xl border border-[#dfe5ef] bg-white px-3 py-2 sm:py-2.5 pl-9 text-xs sm:text-sm font-medium text-[#27324b] placeholder:text-[#8b9ab3] transition-all focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]/30"
                              />
                            </div>
                            {errors.name && <span className="text-[10px] text-accent font-bold">{errors.name.message}</span>}
                          </div>

                          <div className="space-y-0.5 text-left">
                            <label className="sr-only">
                              Email Address
                            </label>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8b5cf6]">
                                <Mail className="h-4 w-4" />
                              </div>
                              <input
                                type="email"
                                placeholder="Enter your email"
                                aria-label="Email address"
                                {...register('email', { 
                                  required: 'Email is required',
                                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Valid email required' }
                                })}
                                className="w-full rounded-xl border border-[#dfe5ef] bg-white px-3 py-2 sm:py-2.5 pl-9 text-xs sm:text-sm font-medium text-[#27324b] placeholder:text-[#8b9ab3] transition-all focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]/30"
                              />
                            </div>
                            {errors.email && <span className="text-[10px] text-accent font-bold">{errors.email.message}</span>}
                          </div>
                        </div>

                        {/* Row 2: Password & Confirm Password */}
                        <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
                          <div className="space-y-0.5 text-left">
                            <label className="sr-only">
                              Password
                            </label>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8b5cf6]">
                                <Lock className="h-4 w-4" />
                              </div>
                              <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Choose password (min 6)"
                                aria-label="Password"
                                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                                className="w-full rounded-xl border border-[#dfe5ef] bg-white px-3 py-2 sm:py-2.5 pl-9 pr-9 text-xs sm:text-sm font-medium text-[#27324b] placeholder:text-[#8b9ab3] transition-all focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]/30"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-[#8b9ab3] transition-colors hover:text-[#6535ff]"
                              >
                                {showPassword ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                              </button>
                            </div>
                            {watchPassword && (
                              <div className="flex justify-between items-center text-[9px] font-bold mt-0.5">
                                <span className="text-gray-500 uppercase">Strength:</span>
                                <span className={strength.text}>{strength.label}</span>
                              </div>
                            )}
                            {errors.password && <span className="text-[10px] text-accent font-bold">{errors.password.message}</span>}
                          </div>

                          <div className="space-y-0.5 text-left">
                            <label className="sr-only">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8b5cf6]">
                                <Lock className="h-4 w-4" />
                              </div>
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm password"
                                aria-label="Confirm password"
                                {...register('confirmPassword', {
                                  required: 'Confirm password required',
                                  validate: (val) => val === watchPassword || 'Passwords do not match',
                                })}
                                className="w-full rounded-xl border border-[#dfe5ef] bg-white px-3 py-2 sm:py-2.5 pl-9 pr-9 text-xs sm:text-sm font-medium text-[#27324b] placeholder:text-[#8b9ab3] transition-all focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]/30"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-[#8b9ab3] transition-colors hover:text-[#6535ff]"
                              >
                                {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                              </button>
                            </div>
                            {errors.confirmPassword && <span className="text-[10px] text-accent font-bold">{errors.confirmPassword.message}</span>}
                          </div>
                        </div>

                        {/* Row 3: Security Question & Security Answer */}
                        <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
                          <div className="space-y-0.5 text-left">
                            <label className="sr-only">
                              Security Question
                            </label>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8b5cf6]">
                                <ShieldCheck className="h-4 w-4" />
                              </div>
                              <select
                                aria-label="Security question"
                                {...register('securityQuestion', { required: 'Question required' })}
                                className="w-full rounded-xl border border-[#dfe5ef] bg-white px-3 py-2 sm:py-2.5 pl-9 text-xs sm:text-sm font-medium text-[#27324b] focus:outline-none focus:border-[#8b5cf6] truncate"
                              >
                                <option value="What is your favourite colour?">What is your favourite colour?</option>
                                <option value="What was your first school?">What was your first school?</option>
                                <option value="What is your favourite food?">What is your favourite food?</option>
                                <option value="What is your childhood nickname?">What is your childhood nickname?</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-0.5 text-left">
                            <label className="sr-only">
                              Security Answer
                            </label>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8b5cf6]">
                                <Lock className="h-4 w-4" />
                              </div>
                              <input
                                type="text"
                                placeholder="Security answer"
                                aria-label="Security answer"
                                {...register('securityAnswer', { required: 'Answer required' })}
                                className="w-full rounded-xl border border-[#dfe5ef] bg-white px-3 py-2 sm:py-2.5 pl-9 text-xs sm:text-sm font-medium text-[#27324b] placeholder:text-[#8b9ab3] transition-all focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]/30"
                              />
                            </div>
                            {errors.securityAnswer && <span className="text-[10px] text-accent font-bold">{errors.securityAnswer.message}</span>}
                          </div>
                        </div>

                        {/* Terms agreement */}
                        <div className="flex items-start gap-1.5 pt-0.5 text-[10px] leading-tight text-[#526078]">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#6535ff] text-white">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                          <p>
                            By registering, you agree to our{' '}
                            <Link to="/terms" className="font-bold text-[#6535ff] hover:underline">Terms</Link>
                            {' '}&amp;{' '}
                            <Link to="/privacy" className="font-bold text-[#6535ff] hover:underline">Privacy</Link>.
                          </p>
                        </div>

                        {/* Submit CTA */}
                        <div className="pt-0.5">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4f13ee] to-[#7729ff] px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(99,45,255,0.3)] cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all"
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Creating Host Account...</span>
                              </div>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4" />
                                <span>Create Account</span>
                                <ArrowRight className="h-4 w-4 ml-0.5" />
                              </>
                            )}
                          </button>
                        </div>

                      </form>
                    )}

                    {/* SUCCESS CELEBRATION */}
                    {isRegistered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6 space-y-5"
                      >
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-bounce">
                          <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
                        </div>
                        <div>
                          <h2 className={`font-outfit text-2xl sm:text-3xl font-black ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            Welcome Aboard, {registeredUser?.name || 'User'}!
                          </h2>
                          <p className="text-xs sm:text-sm text-emerald-500 font-bold mt-1">
                            Your free Gubbi host account has been created successfully.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
                          <button
                            type="button"
                            onClick={() => navigate('/quiz/create')}
                            className="btn-premium btn-primary-gradient p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-white shadow-premium-glow hover:scale-105 transition-all cursor-pointer"
                          >
                            <PlusCircle className="h-5 w-5" />
                            <span className="font-extrabold text-xs sm:text-sm">Create First Quiz</span>
                            <span className="text-[9.5px] text-gray-100 opacity-90">Design questions & custom background</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="btn-premium btn-secondary-gradient p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-white shadow-secondary-glow hover:scale-105 transition-all cursor-pointer"
                          >
                            <LayoutDashboard className="h-5 w-5" />
                            <span className="font-extrabold text-xs sm:text-sm">Go to Dashboard</span>
                            <span className="text-[9.5px] text-gray-100 opacity-90">View hosted games & performance</span>
                          </button>
                        </div>
                      </motion.div>
                    )}

                  </motion.div>
                </div>

                {/* Right Column: Free Plan Benefits & Trust Highlights */}
                <div className="lg:col-span-1 w-full flex flex-col justify-between space-y-2.5 pt-2 lg:pt-0">
                  <div className="h-full space-y-2.5 sm:space-y-3 rounded-2xl border border-[#edf0f5] bg-[#fbfcfe] p-3 sm:p-4 text-left">
                    <div className="flex items-center border-b border-[#e9edf4] pb-2">
                      <h3 className="font-outfit text-xs sm:text-sm font-extrabold text-[#151a31]">
                        Host Account Includes
                      </h3>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 rounded-md bg-emerald-100 p-1 text-emerald-600 shrink-0">
                          <Check className="h-3 w-3" />
                        </div>
                        <div>
                          <h4 className="text-[10px] sm:text-[11px] font-bold text-[#202941]">5 Active Quizzes</h4>
                          <p className="text-[9.5px] leading-snug text-[#637089]">Build and host up to 5 fully functional quizzes.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 rounded-md bg-emerald-100 p-1 text-emerald-600 shrink-0">
                          <Check className="h-3 w-3" />
                        </div>
                        <div>
                          <h4 className="text-[10px] sm:text-[11px] font-bold text-[#202941]">20 Live Players / Battle</h4>
                          <p className="text-[9.5px] leading-snug text-[#637089]">Host multiplayer games simultaneously.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 rounded-md bg-emerald-100 p-1 text-emerald-600 shrink-0">
                          <Check className="h-3 w-3" />
                        </div>
                        <div>
                          <h4 className="text-[10px] sm:text-[11px] font-bold text-[#202941]">Real-Time Leaderboard</h4>
                          <p className="text-[9.5px] leading-snug text-[#637089]">Instant live scores &amp; rank calculations.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 rounded-md bg-emerald-100 p-1 text-emerald-600 shrink-0">
                          <Check className="h-3 w-3" />
                        </div>
                        <div>
                          <h4 className="text-[10px] sm:text-[11px] font-bold text-[#202941]">Excel / CSV Import</h4>
                          <p className="text-[9.5px] leading-snug text-[#637089]">Upload questions quickly from spreadsheets.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1 rounded-xl border border-[#eee2ff] bg-[#f8f3ff] p-2.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#6535ff]">
                        <Zap className="h-3.5 w-3.5 shrink-0" />
                        <span>No Credit Card Required</span>
                      </div>
                      <p className="text-[9.5px] leading-relaxed text-[#536079]">
                        Get started completely free forever. Upgrade to Pro anytime.
                      </p>
                    </div>
                  </div>

                  {/* Login option footer */}
                  <div className="pt-0.5 text-center">
                    <p className="text-[10.5px] font-medium text-[#59627a]">
                      Already have a host account?{' '}
                      <Link to="/login" className="font-extrabold text-[#6535ff] hover:underline">
                        Sign In
                      </Link>
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </AnimatedPage>
  );
}
