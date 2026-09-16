import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Sparkles, AlertCircle, Loader2, QrCode, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';
import AnimatedPage from '../components/AnimatedPage';
import { joinGame } from '../services/gameService';
import Avatar from '../components/Avatar';
import { useGame } from '../context/GameContext';

export default function JoinGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlPin = searchParams.get('pin') || '';
  const endedMessage = location.state?.endedMessage;
  const { setPin, setPlayerName } = useGame();
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState('dog');
  const qrCodeRef = useRef(null);

  const avatars = ['dog', 'cat', 'mouse', 'hamster', 'rabbit', 'fox', 'bear', 'panda', 'koala', 'tiger', 'lion', 'cow'];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pin: urlPin,
      fullName: '',
      mobileNumber: '',
      nickname: '',
    }
  });

  // Keep PIN value in sync if URL query parameter changes
  useEffect(() => {
    if (urlPin) {
      setValue('pin', urlPin);
    }
  }, [urlPin, setValue]);

  // QR Code Scanner mounting
  useEffect(() => {
    if (!isScanning) return;

    let html5QrCode = new Html5Qrcode('qr-reader');
    qrCodeRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0
      },
      (decodedText) => {
        try {
          console.log('[QR SCANNER SUCCESS] Decoded text:', decodedText);
          let pinVal = '';
          
          // Case 1: Decoded text is a full URL with search parameter (e.g. ?pin=589231)
          if (decodedText.includes('?')) {
            const urlQuery = decodedText.split('?')[1];
            const urlParams = new URLSearchParams(urlQuery);
            pinVal = urlParams.get('pin');
          }
          
          // Case 2: Decoded text is raw 6 digits
          if (!pinVal && /^\d{6}$/.test(decodedText.trim())) {
            pinVal = decodedText.trim();
          }

          if (pinVal) {
            setValue('pin', pinVal);
            toast.success(`PIN ${pinVal} scanned!`);
            setIsScanning(false);
          } else {
            toast.error('No valid game PIN found in QR Code.');
          }
        } catch (err) {
          toast.error('Failed to parse QR scan.');
        }
      },
      (errorMessage) => {
        // Silently catch scan frames without success matches
      }
    ).catch((err) => {
      console.error('[QR START ERROR]', err);
      setScanError(err.message || 'Camera access blocked or unsupported.');
    });

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((err) => console.log('Clean scanner error:', err));
      }
    };
  }, [isScanning, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const displayPlayerName = data.nickname || data.fullName;
      const response = await joinGame(data.pin, displayPlayerName, selectedAvatar, data.fullName, data.mobileNumber, data.nickname);
      if (response.success) {
        // Update global game contexts
        setPin(data.pin);
        setPlayerName(displayPlayerName);
        // Assuming we might want to store avatar in context later, for now we just pass it to backend

        toast.success(`Welcome to the lobby, ${displayPlayerName}!`);
        
        // Navigate to the Waiting Room page
        setTimeout(() => {
          navigate(`/waiting/${data.pin}`);
        }, 800);
      } else {
        toast.error(response.message || 'Lobby join failed. Check the PIN.');
      }
    } catch (error) {
      console.error('[JOIN LOBBY ERROR]', error);
      const errMsg = error.response?.data?.message || (error.message?.includes('Network Error') || !error.response ? 'Cannot connect to server. Ensure your phone and PC are on the same Wi-Fi network.' : 'Could not join lobby. Check your PIN!');
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="relative flex flex-1 flex-col items-center justify-center min-h-[80vh] px-4 py-8 sm:py-12 bg-background">
        
        {/* Glow Spheres */}
        <div className="absolute top-[10%] left-[20%] h-[350px] w-[350px] rounded-full bg-glow-primary pointer-events-none opacity-45"></div>
        <div className="absolute bottom-[10%] right-[20%] h-[400px] w-[400px] rounded-full bg-glow-secondary pointer-events-none opacity-30"></div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          className="w-full max-w-md glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-secondary/40 to-transparent"></div>

          {/* Header */}
          <div className="text-center mb-8">
            {endedMessage && (
              <div className="mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold flex items-center justify-center gap-2.5 shadow-lg">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                <span>{endedMessage}</span>
              </div>
            )}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15 border border-secondary/20 text-secondary mb-4">
              <Play className="h-6 w-6 fill-current" />
            </div>
            <h2 className="font-outfit text-3xl font-extrabold tracking-tight text-white">
              Join the Battle
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Enter the Game PIN or scan QR code to enter the arena.
            </p>
          </div>

          {/* Input Fields */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* PIN WITH SCANNER TOGGLE */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block text-left">
                  Lobby Game PIN
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setScanError(null);
                    setIsScanning(!isScanning);
                  }}
                  className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>{isScanning ? 'Close Scanner' : 'Scan QR Code'}</span>
                </button>
              </div>

              {/* QR Camera Reader Display */}
              {isScanning && (
                <div className="space-y-2 mt-2 border border-white/10 rounded-2xl overflow-hidden p-2 bg-black/40 relative">
                  {scanError ? (
                    <div className="p-4 text-center space-y-3">
                      <AlertCircle className="h-8 w-8 text-accent mx-auto" />
                      <p className="text-xs text-gray-300 font-bold">
                        Camera Access Error
                      </p>
                      <p className="text-[10px] text-gray-400 leading-relaxed max-w-[240px] mx-auto">
                        In-app camera scanning requires a secure connection (HTTPS) or localhost.
                      </p>
                      <div className="text-[10px] text-primary bg-primary/10 border border-primary/20 rounded-xl p-2.5 max-w-[240px] mx-auto font-medium flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                        <span>Tip: Scan the host's QR code using your phone's native Camera app instead!</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div id="qr-reader" className="w-full rounded-xl overflow-hidden font-sans text-xs text-gray-400 relative">
                        <div className="absolute inset-x-0 h-0.5 bg-secondary/80 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-[scan_2s_ease-in-out_infinite] z-20 pointer-events-none"></div>
                      </div>
                      <p className="text-[10px] text-gray-500 text-center">Center the QR code in the scanning box.</p>
                    </>
                  )}
                </div>
              )}

              <input
                type="text"
                placeholder="e.g. 589231"
                maxLength="6"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                }}
                {...register('pin', {
                  required: 'Lobby Game PIN is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Lobby PIN must be a 6-digit number',
                  },
                })}
                className={`w-full rounded-xl bg-white/5 border px-4 py-3 text-center text-lg font-black tracking-widest text-secondary placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-secondary/35 focus:border-secondary ${
                  errors.pin ? 'border-accent/40' : 'border-white/10'
                }`}
              />
              {errors.pin && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-accent text-left">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.pin.message}</span>
                </div>
              )}
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block text-left">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                maxLength="50"
                {...register('fullName', {
                  required: 'Full Name is required',
                  minLength: {
                    value: 2,
                    message: 'Full Name must be at least 2 characters',
                  }
                })}
                className={`w-full rounded-xl bg-white/5 border px-4 py-3 text-center text-sm font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/35 focus:border-primary ${
                  errors.fullName ? 'border-accent/40' : 'border-white/10'
                }`}
              />
              {errors.fullName && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-accent text-left">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.fullName.message}</span>
                </div>
              )}
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block text-left">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 1234567890"
                maxLength="15"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                }}
                {...register('mobileNumber', {
                  required: 'Mobile Number is required',
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: 'Please enter a valid mobile number (10-15 digits)',
                  }
                })}
                className={`w-full rounded-xl bg-white/5 border px-4 py-3 text-center text-sm font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/35 focus:border-primary ${
                  errors.mobileNumber ? 'border-accent/40' : 'border-white/10'
                }`}
              />
              {errors.mobileNumber && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-accent text-left">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.mobileNumber.message}</span>
                </div>
              )}
            </div>

            {/* Nickname (Optional) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block text-left">
                Choose Nickname (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. CyberKnight"
                maxLength="10"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
                }}
                {...register('nickname', {
                  maxLength: {
                    value: 10,
                    message: 'Nickname cannot exceed 10 characters',
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9]*$/,
                    message: 'Nickname can only contain letters and numbers',
                  }
                })}
                className={`w-full rounded-xl bg-white/5 border px-4 py-3 text-center text-sm font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/35 focus:border-primary ${
                  errors.nickname ? 'border-accent/40' : 'border-white/10'
                }`}
              />
              {errors.nickname && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-accent text-left">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.nickname.message}</span>
                </div>
              )}
            </div>

            {/* Avatar Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block text-left">
                Choose Avatar
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                {avatars.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`relative text-3xl h-14 w-full rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      selectedAvatar === avatar
                        ? 'bg-gradient-to-br from-[#864CBF] to-[#46178F] border-2 border-white scale-110 shadow-[0_0_20px_rgba(134,76,191,0.6)] z-10'
                        : 'bg-white/5 border border-white/10 hover:bg-white/20 hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    <Avatar emoji={avatar} className="w-10 h-10 object-contain drop-shadow-md" />
                    {selectedAvatar === avatar && (
                      <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 shadow-lg ring-2 ring-white dark:ring-gray-900 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full btn-premium btn-secondary-gradient py-3.5 flex items-center justify-center gap-2 text-sm font-bold shadow-secondary-glow ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Join Lobby Room</span>
                </>
              )}
            </button>
          </form>

        </motion.div>
      </div>
    </AnimatedPage>
  );
}
