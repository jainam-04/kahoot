import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, Lock, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import { resetPassword } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

export default function ResetPassword() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';
  const navigate = useNavigate();
  const { token } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    }
  });

  const watchPassword = watch('password');

  // Compute password strength metrics matching Register.jsx styling
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: 'None', color: 'bg-white/10' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
      case 2:
        return { score, label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-500' };
      case 3:
        return { score, label: 'Good', color: 'bg-blue-500', text: 'text-blue-500' };
      case 4:
        return { score, label: 'Strong', color: 'bg-green-500', text: 'text-green-500' };
      default:
        return { score: 0, label: 'None', color: 'bg-white/10', text: 'text-gray-500' };
    }
  };

  const strength = getPasswordStrength(watchPassword);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await resetPassword({ token, password: data.password });
      if (response.success) {
        setIsResetComplete(true);
        toast.success('Password updated successfully! 🎉');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        toast.error(response.message || 'Failed to reset password.');
      }
    } catch (error) {
      console.error('[RESET PASSWORD ERROR]', error);
      let errMsg = 'Invalid or expired reset token';
      if (error.response) {
        errMsg = error.response.data?.message || errMsg;
      } else if (error.request) {
        errMsg = 'Connection failed. Please ensure the backend server is running.';
      } else {
        errMsg = error.message || errMsg;
      }
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="relative flex flex-1 flex-col items-center justify-center min-h-[80vh] px-4 py-12 sm:px-6 lg:px-8 bg-background">
        
        {/* Glow Spheres */}
        <div className="absolute top-[10%] left-[20%] h-[350px] w-[350px] rounded-full bg-glow-primary pointer-events-none opacity-45"></div>
        <div className="absolute bottom-[10%] right-[20%] h-[400px] w-[400px] rounded-full bg-glow-secondary pointer-events-none opacity-30"></div>

        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          className={`w-full max-w-md rounded-3xl p-8 sm:p-10 relative overflow-hidden border ${
            isLight ? 'bg-white border-gray-200/80 shadow-xl' : 'glass-panel border-white/15'
          }`}
        >
          {/* Subtle light border decoration at the top */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

          {/* Success Overlay Animation */}
          {isResetComplete && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center ${
                isLight ? 'bg-white/95' : 'bg-[#09090b]/95'
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 10, delay: 0.2 }}
                className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] mb-4"
              >
                <Check className="h-8 w-8 stroke-[3]" />
              </motion.div>
              <h3 className={`font-outfit text-2xl font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                Password Reset Completed!
              </h3>
              <p className={`text-sm max-w-[260px] leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Your credentials have been updated. Redirecting to the entry portal...
              </p>
            </motion.div>
          )}

          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15 border border-secondary/20 text-secondary mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className={`font-outfit text-3xl font-extrabold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Reset Password
            </h2>
            <p className={`mt-2 text-sm font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Create a strong new password for your account
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* New Password Field */}
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
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className={`w-full rounded-xl border px-4 py-3 pl-11 text-sm transition-all focus:outline-none focus:ring-1 ${
                    isLight 
                      ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400' 
                      : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                  } ${
                    errors.password 
                      ? 'border-accent/40 focus:border-accent focus:ring-accent/30' 
                      : 'focus:border-primary focus:ring-primary/30'
                  }`}
                />
              </div>

              {/* Password strength meter */}
              {watchPassword && (
                <div className="mt-2.5 space-y-1.5 text-left">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-gray-500">Security Index:</span>
                    <span className={strength.text}>{strength.label}</span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden flex gap-0.5 ${isLight ? 'bg-gray-200' : 'bg-white/5'}`}>
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                          strength.score >= i ? strength.color : isLight ? 'bg-gray-200' : 'bg-white/5'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {errors.password && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-accent text-left">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className={`text-xs font-semibold uppercase tracking-wider block text-left ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === watchPassword || 'Passwords do not match',
                  })}
                  className={`w-full rounded-xl border px-4 py-3 pl-11 text-sm transition-all focus:outline-none focus:ring-1 ${
                    isLight 
                      ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400' 
                      : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                  } ${
                    errors.confirmPassword 
                      ? 'border-accent/40 focus:border-accent focus:ring-accent/30' 
                      : 'focus:border-primary focus:ring-primary/30'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-accent text-left">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.confirmPassword.message}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
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
                  <span>Updating Password...</span>
                </div>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className={`mt-8 text-center border-t pt-6 ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
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

        </motion.div>
      </div>
    </AnimatedPage>
  );
}
