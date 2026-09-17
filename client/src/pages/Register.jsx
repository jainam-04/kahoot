import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, UserPlus, ArrowRight, ShieldCheck, AlertCircle, 
  Check, Briefcase, Eye, EyeOff, GraduationCap, Play, Award, Sparkles, 
  PlusCircle, LayoutDashboard, CheckCircle2, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import Logo from '../components/Logo';
import { register as registerUser } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Teacher');

  const roles = [
    {
      id: 'Teacher',
      title: 'Educator / Teacher',
      desc: 'Create interactive classroom quizzes, track student scores & export reports.',
      icon: GraduationCap,
      defaultDesig: 'Professor',
      badge: 'Popular for Education'
    },
    {
      id: 'Quiz Host',
      title: 'Quiz Host / Trivia Master',
      desc: 'Host live streaming trivia battles, custom background themes & live leaderboards.',
      icon: Play,
      defaultDesig: 'Quiz Host',
      badge: 'Live Gaming'
    },
    {
      id: 'Manager',
      title: 'Corporate / Team Lead',
      desc: 'Engage employees, run interactive training sessions & monitor team metrics.',
      icon: Briefcase,
      defaultDesig: 'Manager',
      badge: 'Enterprise'
    },
    {
      id: 'Student',
      title: 'Student / Player',
      desc: 'Join live matches, create revision flashcards & track personal high scores.',
      icon: Award,
      defaultDesig: 'Student',
      badge: 'Casual & Learning'
    },
  ];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      designation: 'Professor',
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

  const handleRoleSelect = (roleObj) => {
    setSelectedRole(roleObj.id);
    setValue('designation', roleObj.defaultDesig);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await registerUser({
        name: data.name ? data.name.trim() : '',
        designation: data.designation || selectedRole,
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
          
          {/* Header Branding & Step Indicator */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Logo className="h-10 w-10 shrink-0" />
              <span className="font-outfit text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#386BFF] to-[#7B2CFF]">
                Quizzy
              </span>
            </div>
            <h1 className="font-outfit text-3xl sm:text-5xl font-black text-white tracking-tight">
              Create Your <span className="text-gradient-primary">Free Account</span>
            </h1>
            <p className="text-xs sm:text-base text-gray-400 max-w-xl mx-auto">
              Get instant access to host live multiplayer trivia, build custom quizzes & track participant insights.
            </p>

            {/* Stepper Tabs */}
            {!isRegistered && (
              <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-white/5 border border-white/10 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    step === 1 ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                  <span>Select Role</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    step === 2 ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                  <span>Account Setup</span>
                </button>
              </div>
            )}
          </div>

          {/* Main Card Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column: Form & Step Content */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-white/15 h-full flex flex-col justify-between"
              >
                {/* Top Accent Line */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-secondary via-primary to-accent" />

                {/* STEP 1: ROLE SELECTION */}
                {step === 1 && !isRegistered && (
                  <div className="space-y-6">
                    <div className="border-b border-white/10 pb-4">
                      <h2 className="font-outfit text-xl sm:text-2xl font-black text-white">
                        How do you plan to use Quiz Hub?
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Select a primary role to customize your experience (you can change this anytime).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {roles.map((r) => {
                        const Icon = r.icon;
                        const isSelected = selectedRole === r.id;
                        return (
                          <div
                            key={r.id}
                            onClick={() => handleRoleSelect(r)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                              isSelected
                                ? 'border-secondary bg-secondary/15 text-white shadow-xl ring-2 ring-secondary/50 scale-[1.02]'
                                : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-secondary text-white' : 'bg-white/10 text-gray-400'}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-gray-300">
                                {r.badge}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-outfit text-sm font-extrabold text-white">{r.title}</h3>
                              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{r.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="btn-premium btn-primary-gradient px-6 py-3.5 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-extrabold text-white shadow-premium-glow cursor-pointer hover:scale-105 transition-all"
                      >
                        <span>Continue to Account Info</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: ACCOUNT FORM */}
                {step === 2 && !isRegistered && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <div>
                        <h2 className="font-outfit text-xl sm:text-2xl font-black text-white">
                          Fill Your Details
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Creating account as: <span className="font-bold text-secondary">{selectedRole}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs text-primary font-bold hover:underline cursor-pointer"
                      >
                        Change Role
                      </button>
                    </div>

                    {/* Row 1: Name & Designation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider block text-gray-300">
                          Your Name / Nickname
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="e.g. Prof. Alex"
                            {...register('name', { required: 'Name is required' })}
                            className="w-full rounded-xl border bg-white/5 border-white/10 px-3 py-2.5 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40"
                          />
                        </div>
                        {errors.name && <span className="text-[10px] text-accent font-bold">{errors.name.message}</span>}
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider block text-gray-300">
                          Designation / Role
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="e.g. Professor / Host"
                            {...register('designation', { required: 'Designation is required' })}
                            className="w-full rounded-xl border bg-white/5 border-white/10 px-3 py-2.5 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Email & Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider block text-gray-300">
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
                            className="w-full rounded-xl border bg-white/5 border-white/10 px-3 py-2.5 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40"
                          />
                        </div>
                        {errors.email && <span className="text-[10px] text-accent font-bold">{errors.email.message}</span>}
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider block text-gray-300">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                            className="w-full rounded-xl border bg-white/5 border-white/10 px-3 py-2.5 pl-9 pr-8 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40"
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
                            <span className="text-gray-500 uppercase">Index:</span>
                            <span className={strength.text}>{strength.label}</span>
                          </div>
                        )}
                        {errors.password && <span className="text-[10px] text-accent font-bold">{errors.password.message}</span>}
                      </div>
                    </div>

                    {/* Row 3: Confirm Password & Security Question */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider block text-gray-300">
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
                            className="w-full rounded-xl border bg-white/5 border-white/10 px-3 py-2.5 pl-9 pr-8 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2.5 top-3 text-gray-400 hover:text-white"
                          >
                            {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        {errors.confirmPassword && <span className="text-[10px] text-accent font-bold">{errors.confirmPassword.message}</span>}
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider block text-gray-300">
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
                    </div>

                    {/* Security Answer */}
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider block text-gray-300">
                        Security Answer
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Your answer"
                          {...register('securityAnswer', { required: 'Answer required' })}
                          className="w-full rounded-xl border bg-white/5 border-white/10 px-3 py-2.5 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40"
                        />
                      </div>
                      {errors.securityAnswer && <span className="text-[10px] text-accent font-bold">{errors.securityAnswer.message}</span>}
                    </div>

                    <div className="pt-2 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs text-gray-400 hover:text-white font-bold cursor-pointer"
                      >
                        ← Back to Roles
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-premium btn-secondary-gradient py-3.5 px-6 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-white rounded-xl shadow-secondary-glow cursor-pointer hover:scale-105 transition-all"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Creating...</span>
                          </div>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            <span>Complete Account Registration</span>
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                )}

                {/* STEP 3: SUCCESS CELEBRATION */}
                {isRegistered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 space-y-6"
                  >
                    <div className="h-20 w-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-bounce">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div>
                      <h2 className="font-outfit text-3xl font-black text-white">Welcome Aboard, {registeredUser?.name || 'User'}!</h2>
                      <p className="text-xs sm:text-sm text-emerald-400 font-bold mt-1">
                        Your free Quiz Hub account has been initialized successfully.
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
                        <span className="text-[10px] text-gray-200 opacity-80">Design questions & custom background</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="btn-premium btn-secondary-gradient p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-white shadow-secondary-glow hover:scale-105 transition-all cursor-pointer"
                      >
                        <LayoutDashboard className="h-6 w-6" />
                        <span className="font-extrabold text-sm">Go to Dashboard</span>
                        <span className="text-[10px] text-gray-200 opacity-80">View hosted games & performance</span>
                      </button>
                    </div>
                  </motion.div>
                )}

              </motion.div>
            </div>

            {/* Right Column: Free Plan Benefits & Trust Highlights */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-5 text-left h-full">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <Sparkles className="h-5 w-5 text-secondary animate-pulse" />
                  <h3 className="font-outfit text-base font-extrabold text-white">
                    Free Account Includes
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">5 Active Quizzes</h4>
                      <p className="text-gray-400 text-[11px]">Build and host up to 5 fully functional quizzes.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">20 Live Players / Battle</h4>
                      <p className="text-gray-400 text-[11px]">Host multiplayer quiz games simultaneously.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Real-Time Leaderboard</h4>
                      <p className="text-gray-400 text-[11px]">Instant live scores & performance calculation.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Excel / CSV Question Import</h4>
                      <p className="text-gray-400 text-[11px]">Upload questions in seconds from spreadsheets.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Custom Question Backgrounds</h4>
                      <p className="text-gray-400 text-[11px]">Set blur, brightness, gradients or custom graphics.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-primary">
                    <Zap className="h-4 w-4" />
                    <span>No Credit Card Required</span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    Get started completely free forever. Upgrade to Pro anytime for unlimited players.
                  </p>
                </div>
              </div>

              {/* Login option footer */}
              <div className="glass-panel rounded-2xl p-4 border border-white/10 text-center">
                <p className="text-xs text-gray-400 font-medium">
                  Already registered?{' '}
                  <Link to="/login" className="font-extrabold text-secondary hover:underline">
                    Sign In to Quiz Hub
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
