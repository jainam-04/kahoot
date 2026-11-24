import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import DemoModal from '../components/DemoModal';
import { login } from '../services/authService';
import { setAuthSession } from '../utils/auth';

import loginBackground from '../assets/gubbi-login-bg.png';

export default function Login() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired')) {
      toast.error('Session expired or database reconnected. Please sign in again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

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
        setAuthSession(response.token, response.user);
        
        toast.success(`Welcome back, ${response.user.name || 'Host'}!`);

        setTimeout(() => {
          if (response.user?.role === 'superadmin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', {
              state: { welcomeMsg: `Welcome back, ${response.user.name || 'Host'}!` },
              replace: true,
            });
          }
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
      <div
        className="relative min-h-[calc(100vh-var(--main-header-height,64px))] min-h-[calc(100dvh-var(--main-header-height,64px))] min-h-[calc(100svh-var(--main-header-height,64px))] w-full flex items-center justify-center lg:justify-end overflow-x-hidden overflow-y-auto bg-cover bg-center bg-no-repeat px-4 py-6 sm:px-10 sm:py-8 lg:px-16"
        style={{
          backgroundImage: `url(${loginBackground})`,
        }}
      >
        {/* Soft background overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-white/20 pointer-events-none" />

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{
            opacity: 1,
            x: shake ? [-8, 8, -5, 5, 0] : 0,
          }}
          transition={{ duration: 0.45 }}
          className="relative z-10 w-full max-w-[410px] mx-auto lg:mx-0"
        >
          <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_20px_60px_rgba(79,50,150,0.18)] backdrop-blur-xl sm:p-9">
            {/* Heading */}
            <div className="mb-6 sm:mb-7 text-center">
              <h1 className="font-outfit text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827]">
                Sign <span className="text-[#6935EE]">in</span>
              </h1>

              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium text-[#64748b]">
                Welcome back! Continue your learning journey
              </p>
            </div>

            {/* Success State */}
            {isSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
                <h3 className="text-xl font-bold text-gray-900">
                  Authentication Successful!
                </h3>
                <p className="text-sm text-emerald-600">
                  Redirecting...
                </p>
              </div>
            ) : (
              <form
                onSubmit={hostForm.handleSubmit(onHostSubmit)}
                className="space-y-4"
              >
                {/* Email */}
                <div>
                  <label className="sr-only" htmlFor="login-email">
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3.5 sm:left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9333EA]" />

                    <input
                      id="login-email"
                      type="email"
                      autoComplete="username"
                      placeholder="Enter your email"
                      {...hostForm.register('email', {
                        required: 'Email address is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Please enter a valid email address',
                        },
                      })}
                      className="h-11 sm:h-12 w-full rounded-xl border border-[#E9D5FF] bg-[#FAF9FF] pl-10 sm:pl-11 pr-4 text-base sm:text-sm text-[#1e293b] placeholder:text-[#94A3B8] outline-none transition-all focus:border-[#9333EA] focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  {hostForm.formState.errors.email && (
                    <p className="mt-1 text-xs font-semibold text-red-500">
                      {hostForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="sr-only" htmlFor="login-password">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-3.5 sm:left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9333EA]" />

                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      {...hostForm.register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      className="h-11 sm:h-12 w-full rounded-xl border border-[#E9D5FF] bg-[#FAF9FF] pl-10 sm:pl-11 pr-11 sm:pr-12 text-base sm:text-sm text-[#1e293b] placeholder:text-[#94A3B8] outline-none transition-all focus:border-[#9333EA] focus:ring-2 focus:ring-purple-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#A855F7] p-1 cursor-pointer transition-colors hover:text-[#9333EA]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {hostForm.formState.errors.password && (
                    <p className="mt-1 text-xs font-semibold text-red-500">
                      {hostForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me / Forgot Password */}
                <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs">
                  <label className="flex items-center gap-1.5 sm:gap-2 text-[#64748b] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...hostForm.register('rememberMe')}
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded accent-[#6935EE] cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      navigate('/forgot-password', {
                        state: {
                          email: hostForm.getValues('email'),
                        },
                      })
                    }
                    className="font-semibold text-[#9333EA] hover:underline whitespace-nowrap cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A52CEB] to-[#5145EA] text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(109,40,217,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="my-4 sm:my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E5E7EB]" />
              <span className="text-[11px] font-semibold text-[#94A3B8]">
                OR
              </span>
              <div className="h-px flex-1 bg-[#E5E7EB]" />
            </div>

            {/* Signup Link */}
            <p className="text-center text-xs font-semibold text-[#475569]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-extrabold text-[#9333EA] hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </AnimatedPage>
  );
}
