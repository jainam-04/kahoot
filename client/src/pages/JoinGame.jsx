import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Gamepad2, User, Phone, Tag, Smile, QrCode, ArrowRight, 
  Check, Loader2, AlertCircle, Camera, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';
import AnimatedPage from '../components/AnimatedPage';
import { joinGame } from '../services/gameService';
import Avatar from '../components/Avatar';
import { useGame } from '../context/GameContext';
import joinBattleBg from '../assets/join-battle-bg.jpg';

export default function JoinGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlPin = searchParams.get('pin') || location.state?.pin || '';
  const initialPin = urlPin || localStorage.getItem('guest_pin') || '';
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
      pin: initialPin,
      fullName: '',
      mobileNumber: localStorage.getItem('guest_mobileNumber') || '',
      nickname: '',
    }
  });

  // Keep PIN value in sync if URL query parameter, navigation state, or storage changes
  useEffect(() => {
    const pinToSet = urlPin || location.state?.pin || localStorage.getItem('guest_pin') || '';
    if (pinToSet) {
      setValue('pin', pinToSet);
    }
  }, [urlPin, location.state, setValue]);

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
      () => {
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
      const cleanFullName = (data.fullName || '').toString().replace(/[^a-zA-Z\s]/g, '').trim();
      const cleanNickname = (data.nickname || '').toString().trim();
      const displayPlayerName = cleanNickname || cleanFullName;
      const cleanPin = (data.pin || '').toString().trim();
      const cleanMobile = (data.mobileNumber || '').toString().trim();

      const previousPlayerName = localStorage.getItem('guest_playerName');
      const previousPin = localStorage.getItem('guest_pin');
      const shouldReplacePrevious = (previousPin === cleanPin) && previousPlayerName && (previousPlayerName.trim().toLowerCase() !== displayPlayerName.toLowerCase());

      const response = await joinGame(
        cleanPin, 
        displayPlayerName, 
        selectedAvatar, 
        cleanFullName, 
        cleanMobile, 
        cleanNickname,
        shouldReplacePrevious ? previousPlayerName.trim() : undefined
      );
      if (response.success) {
        // Update global game contexts & immediately persist to localStorage
        setPin(cleanPin);
        setPlayerName(displayPlayerName);
        localStorage.setItem('guest_pin', cleanPin);
        localStorage.setItem('guest_playerName', displayPlayerName);
        localStorage.setItem('guest_avatar', selectedAvatar);
        if (cleanMobile) {
          localStorage.setItem('guest_mobileNumber', cleanMobile);
        }
        // Clear any old host flags if joining as student
        localStorage.removeItem('current_hosted_pin');

        toast.success(`Welcome to the lobby, ${displayPlayerName}!`);
        
        // Navigate to the Waiting Room page
        setTimeout(() => {
          navigate(`/waiting/${cleanPin}`);
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
      {/* 
        =============================================================================
        DESKTOP - 6 JOIN THE BATTLE SECTION (Matching Figma 1:1)
        =============================================================================
      */}
      <div 
        className="relative min-h-[calc(100vh-var(--main-header-height,64px))] w-full overflow-hidden flex items-center justify-center px-4 py-8 sm:py-10 lg:px-12 bg-cover bg-center lg:bg-left-center bg-no-repeat"
        style={{
          backgroundImage: `url(${joinBattleBg})`,
          backgroundColor: '#F5F1FD',
        }}
      >
        {/* Soft background tint overlay for ultra-crisp legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/40 pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1240px] mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_480px] gap-8 lg:gap-14 items-center">
            
            {/* ===================================================================== */}
            {/* LEFT COLUMN: HEADING BLOCK ("Join The Battle" + Pill Subtitle)        */}
            {/* ===================================================================== */}
            <section className="flex flex-col items-start gap-4 text-left lg:pb-14">
              {endedMessage && (
                <div className="mb-2 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-bold flex items-center gap-2.5 shadow-sm">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <span>{endedMessage}</span>
                </div>
              )}

              {/* Heading 1: "Join The" + Gradient "Battle" */}
              <div className="space-y-0.5">
                <h1 className="font-['Inter'] text-4xl sm:text-5xl lg:text-[60px] font-extrabold leading-[1.02] tracking-[-1.5px] text-[#020617]">
                  <span>Join The</span>
                  <span className="block mt-1 font-black bg-gradient-to-r from-[#6C28FE] via-[#4D1AE0] to-[#2A56F6] bg-clip-text text-transparent">
                    Battle
                  </span>
                </h1>
              </div>

              {/* Pill Subtitle matching Figma 1:1 */}
              <div className="inline-flex items-center px-5 py-2.5 rounded-[16px] bg-white/80 border border-white/90 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md">
                <span className="font-['Inter'] font-semibold text-xs sm:text-[14px] leading-5 text-[#1E293B]">
                  Enter your game PIN to join the live quiz lobby
                </span>
              </div>
            </section>

            {/* ===================================================================== */}
            {/* RIGHT COLUMN: THE WHITE FORM CARD (Matching Figma 1:1)               */}
            {/* ===================================================================== */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 85, damping: 16 }}
              className="w-full max-w-[480px] mx-auto rounded-[26px] bg-white p-4 sm:p-5 md:p-6 shadow-[0px_10px_35px_-5px_rgba(124,58,237,0.1),0px_0px_0px_1px_rgba(235,230,254,0.8)] border border-[#ECE6FE] relative z-10"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5 sm:space-y-3">
                
                {/* ── Input Field 1: LOBBY GAME PIN ── */}
                <div className="space-y-1 text-left">
                  <label className="block font-['Inter'] font-extrabold text-[9.5px] leading-[14px] tracking-[0.475px] uppercase text-[#334155]">
                    LOBBY GAME PIN
                  </label>
                  <div className={`h-[40px] bg-white border rounded-[12px] px-2.5 flex items-center gap-2 shadow-[0px_2px_6px_rgba(139,92,246,0.03)] focus-within:border-[#9333EA] focus-within:ring-2 focus-within:ring-[#9333EA]/15 transition-all ${
                    errors.pin ? 'border-red-400' : 'border-[#E5DEFF]'
                  }`}>
                    <div className="w-4 h-4 flex items-center justify-center text-[#9333EA] shrink-0">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <span className="text-[#CBD5E1] text-[14px] font-light select-none">|</span>
                    <input
                      type="text"
                      placeholder="Enter Game PIN"
                      maxLength="6"
                      inputMode="numeric"
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
                      className="w-full h-full bg-transparent text-[13px] font-semibold text-[#1E293B] placeholder:text-[#D8B4FE] focus:outline-none font-['Inter'] tracking-wide"
                    />
                  </div>
                  {errors.pin && (
                    <div className="flex items-center gap-1 text-[10.5px] text-red-500 font-bold mt-0.5">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.pin.message}</span>
                    </div>
                  )}
                </div>

                {/* ── Input Field 2: FULL NAME ── */}
                <div className="space-y-1 text-left">
                  <label className="block font-['Inter'] font-extrabold text-[9.5px] leading-[14px] tracking-[0.475px] uppercase text-[#334155]">
                    FULL NAME
                  </label>
                  <div className={`h-[40px] bg-white border rounded-[12px] px-2.5 flex items-center gap-2 shadow-[0px_2px_6px_rgba(139,92,246,0.03)] focus-within:border-[#9333EA] focus-within:ring-2 focus-within:ring-[#9333EA]/15 transition-all ${
                    errors.fullName ? 'border-red-400' : 'border-[#E5DEFF]'
                  }`}>
                    <div className="w-4 h-4 flex items-center justify-center text-[#9333EA] shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-[#CBD5E1] text-[14px] font-light select-none">|</span>
                    <input
                      type="text"
                      placeholder="Enter Full Name"
                      maxLength="50"
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      }}
                      {...register('fullName', {
                        required: 'Full Name is required',
                        minLength: {
                          value: 2,
                          message: 'Full Name must be at least 2 characters',
                        },
                        pattern: {
                          value: /^[a-zA-Z\s]+$/,
                          message: 'Letters and spaces only',
                        },
                        validate: (val) => {
                          const trimmed = (val || '').trim();
                          if (!trimmed) return 'Full Name is required';
                          if (trimmed.length < 2) return 'At least 2 characters required';
                          return true;
                        },
                        onChange: (e) => {
                          const sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                          e.target.value = sanitized;
                          setValue('fullName', sanitized, { shouldValidate: true });
                        }
                      })}
                      className="w-full h-full bg-transparent text-[13px] font-semibold text-[#1E293B] placeholder:text-[#D8B4FE] focus:outline-none font-['Inter']"
                    />
                  </div>
                  {errors.fullName && (
                    <div className="flex items-center gap-1 text-[10.5px] text-red-500 font-bold mt-0.5">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.fullName.message}</span>
                    </div>
                  )}
                </div>

                {/* ── Input Field 3: MOBILE NUMBER ── */}
                <div className="space-y-1 text-left">
                  <label className="block font-['Inter'] font-extrabold text-[9.5px] leading-[14px] tracking-[0.475px] uppercase text-[#334155]">
                    MOBILE NUMBER
                  </label>
                  <div className={`h-[40px] bg-white border rounded-[12px] px-2.5 flex items-center gap-2 shadow-[0px_2px_6px_rgba(139,92,246,0.03)] focus-within:border-[#9333EA] focus-within:ring-2 focus-within:ring-[#9333EA]/15 transition-all ${
                    errors.mobileNumber ? 'border-red-400' : 'border-[#E5DEFF]'
                  }`}>
                    <div className="w-4 h-4 flex items-center justify-center text-[#9333EA] shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-[#CBD5E1] text-[14px] font-light select-none">|</span>
                    <input
                      type="tel"
                      placeholder="Enter Mobile Number"
                      maxLength="10"
                      inputMode="numeric"
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                      }}
                      {...register('mobileNumber', {
                        required: 'Mobile Number is required',
                        pattern: {
                          value: /^[6-9][0-9]{9}$/,
                          message: 'Must be 10 digits starting with 6, 7, 8, or 9',
                        }
                      })}
                      className="w-full h-full bg-transparent text-[13px] font-semibold text-[#1E293B] placeholder:text-[#D8B4FE] focus:outline-none font-['Inter'] tracking-wide"
                    />
                  </div>
                  {errors.mobileNumber && (
                    <div className="flex items-center gap-1 text-[10.5px] text-red-500 font-bold mt-0.5">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.mobileNumber.message}</span>
                    </div>
                  )}
                </div>

                {/* ── Input Field 4: CHOOSE NICKNAME (OPTIONAL) ── */}
                <div className="space-y-1 text-left">
                  <label className="block font-['Inter'] font-extrabold text-[9.5px] leading-[14px] tracking-[0.475px] uppercase text-[#334155]">
                    CHOOSE NICKNAME (OPTIONAL)
                  </label>
                  <div className={`h-[40px] bg-white border rounded-[12px] px-2.5 flex items-center gap-2 shadow-[0px_2px_6px_rgba(139,92,246,0.03)] focus-within:border-[#9333EA] focus-within:ring-2 focus-within:ring-[#9333EA]/15 transition-all ${
                    errors.nickname ? 'border-red-400' : 'border-[#E5DEFF]'
                  }`}>
                    <div className="w-4 h-4 flex items-center justify-center text-[#9333EA] shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <span className="text-[#CBD5E1] text-[14px] font-light select-none">|</span>
                    <input
                      type="text"
                      placeholder="Enter Nickname"
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
                          message: 'Letters and numbers only',
                        }
                      })}
                      className="w-full h-full bg-transparent text-[13px] font-semibold text-[#1E293B] placeholder:text-[#D8B4FE] focus:outline-none font-['Inter']"
                    />
                  </div>
                  {errors.nickname && (
                    <div className="flex items-center gap-1 text-[10.5px] text-red-500 font-bold mt-0.5">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.nickname.message}</span>
                    </div>
                  )}
                </div>

                {/* ── Avatar Selection Header & Grid ── */}
                <div className="space-y-1.5 pt-0.5 text-left">
                  <div className="flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-[#9333EA]" />
                    <span className="font-['Inter'] font-extrabold text-[9.5px] leading-[14px] tracking-[0.475px] uppercase text-[#334155]">
                      CHOOSE AVATAR
                    </span>
                  </div>

                  <div className="p-2 sm:p-2.5 rounded-[20px] bg-[#FAF8FF] border border-[#EDE9FE] shadow-[inset_0px_2px_4px_rgba(139,92,246,0.03)]">
                    <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                      {avatars.map((avatar) => (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => setSelectedAvatar(avatar)}
                          className={`relative h-10 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
                            selectedAvatar === avatar
                              ? 'bg-gradient-to-br from-[#7A38FF] to-[#4F46E5] text-white shadow-[0_4px_12px_rgba(108,40,254,0.35)] scale-105 ring-2 ring-white z-10'
                              : 'bg-white hover:bg-white/90 border border-[#E9E4F5] hover:border-[#D8B4FE]'
                          }`}
                        >
                          <Avatar emoji={avatar} className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-xs" />
                          {selectedAvatar === avatar && (
                            <div className="absolute -top-1 -right-1 bg-white text-[#7A38FF] rounded-full p-0.5 shadow-sm ring-1 ring-[#7A38FF]/30 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── QR Scanner Camera Box (Expandable when toggled) ── */}
                {isScanning && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 animate-in fade-in duration-200">
                    {scanError ? (
                      <div className="space-y-1.5 text-center">
                        <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
                        <p className="text-xs font-bold text-slate-800">Camera Access Error</p>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Camera access requires HTTPS or localhost. Scan the QR code using your phone's native camera.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div id="qr-reader" className="w-full rounded-xl overflow-hidden text-xs text-slate-400 relative" />
                        <p className="text-[11px] text-slate-500">Center the game QR code in the scanning box.</p>
                      </>
                    )}
                  </div>
                )}

                {/* ── Action Buttons matching Figma 1:1 ── */}
                <div className="pt-2 space-y-2.5">
                  {/* Secondary Pill Button: Scan QR Code */}
                  <button
                    type="button"
                    onClick={() => {
                      setScanError(null);
                      setIsScanning(!isScanning);
                    }}
                    className="w-full h-[46px] sm:h-[48px] rounded-full bg-white border border-[#E2E8F0]/90 shadow-[0px_4px_14px_rgba(0,0,0,0.04)] flex items-center justify-center gap-2 text-[#1E293B] font-['Inter'] font-bold text-[14px] hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <QrCode className="w-4 h-4 text-[#0F172A]" />
                    <span>{isScanning ? 'Close Scanner' : 'Scan QR Code'}</span>
                  </button>

                  {/* Primary Pill CTA: Join Lobby Room */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full h-[50px] sm:h-[52px] rounded-full bg-gradient-to-r from-[#7A38FF] via-[#6C28FE] to-[#4F46E5] shadow-[0px_12px_30px_-5px_rgba(108,40,254,0.45)] flex items-center justify-center gap-2 text-white font-['Inter'] font-extrabold text-[15px] hover:opacity-95 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer ${
                      isLoading ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Join Lobby Room</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>

          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
