import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Gamepad2, User, Phone, Tag, Smile, QrCode, ArrowRight, 
  Check, Loader2, AlertCircle 
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

  // Exact 8 avatars matching the Figma design reference (4 columns x 2 rows)
  const avatars = ['dog', 'cat', 'mouse', 'hamster', 'rabbit', 'fox', 'bear', 'panda'];

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
          
          if (decodedText.includes('?')) {
            const urlQuery = decodedText.split('?')[1];
            const urlParams = new URLSearchParams(urlQuery);
            pinVal = urlParams.get('pin');
          }
          
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
        } catch {
          toast.error('Failed to parse QR scan.');
        }
      },
      () => {
        // Silently catch scan frames without match
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
        setPin(cleanPin);
        setPlayerName(displayPlayerName);
        localStorage.setItem('guest_pin', cleanPin);
        localStorage.setItem('guest_playerName', displayPlayerName);
        localStorage.setItem('guest_avatar', selectedAvatar);
        if (cleanMobile) {
          localStorage.setItem('guest_mobileNumber', cleanMobile);
        }
        if (cleanFullName) {
          localStorage.setItem('guest_fullName', cleanFullName);
        }
        if (cleanNickname) {
          localStorage.setItem('guest_nickname', cleanNickname);
        }
        localStorage.removeItem('current_hosted_pin');

        toast.success(`Welcome to the lobby, ${displayPlayerName}!`);
        
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
        DESKTOP - 6: JOIN THE BATTLE ARENA (Matching Figma 1:1)
        =============================================================================
      */}
      <div 
        className="join-game-background relative min-h-[calc(100dvh-var(--main-header-height,64px))] lg:min-h-[calc(max(100vh-var(--main-header-height,80px),760px))] w-full flex items-start justify-center px-2.5 sm:px-3 py-3 sm:py-6 lg:py-0 bg-cover bg-bottom bg-no-repeat overflow-x-hidden"
        style={{
          backgroundImage: `url(${joinBattleBg})`,
          backgroundColor: '#F7F4FD',
        }}
      >
        <div className="relative z-10 w-full max-w-[1351px] mx-auto px-0.5 sm:px-6 lg:pl-12 xl:pl-[96px] 2xl:pl-[111px] lg:pr-8 xl:pr-[128px] 2xl:pr-[158px] pt-2 sm:pt-6 lg:pt-[32px] pb-8 sm:pb-12 overflow-x-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_481px] gap-4 sm:gap-6 lg:gap-[25px] items-start">
            
            {/* ===================================================================== */}
            {/* LEFT COLUMN: "Join the BATTLE!" Heading + Pill Subtitle (Figma 1:1)   */}
            {/* Positioned comfortably in the open sky safely above the boy's head    */}
            {/* ===================================================================== */}
            <section className="flex flex-col items-center lg:items-start text-center lg:text-left pt-1 lg:pt-0 z-10 w-full max-w-full">
              {endedMessage && (
                <div className="mb-3 p-2.5 sm:p-3 max-w-full rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-bold flex items-center justify-center text-center gap-2 shadow-sm">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="break-words">{endedMessage}</span>
                </div>
              )}

              {/* Exact Figma Heading Block: width: 576px, gap: 16px */}
              <div className="flex flex-col items-center lg:items-start gap-2.5 sm:gap-4 w-full max-w-[576px]">
                {/* Heading 1: gap: 6px */}
                <div className="flex flex-col items-center lg:items-start gap-0.5 sm:gap-1.5 w-full">
                  <h1 className="font-['Inter'] font-extrabold text-[30px] sm:text-[48px] lg:text-[60px] leading-none tracking-[-0.75px] sm:tracking-[-1.5px] text-[#020617] m-0 p-0">
                    Join the
                  </h1>
                  <div 
                    className="font-['Inter'] font-black text-[30px] sm:text-[48px] lg:text-[60px] leading-none tracking-[-0.75px] sm:tracking-[-1.5px] bg-clip-text text-transparent select-none m-0 p-0"
                    style={{
                      backgroundImage: 'linear-gradient(95.95deg, #6C28FE 0%, #4D1AE0 50%, #2A56F6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    BATTLE!
                  </div>
                </div>

                {/* Responsive Pill Subtitle: wraps cleanly on small phone screens */}
                <div 
                  className="inline-flex items-center justify-center max-w-full px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-[14px] sm:rounded-[16px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] select-none text-center"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                  }}
                >
                  <span className="font-['Inter'] font-semibold text-[11.5px] sm:text-[14px] leading-snug sm:leading-5 text-[#1E293B] text-center xl:whitespace-nowrap">
                    Enter the Game PIN or Scan QR code to enter the arena
                  </span>
                </div>
              </div>
            </section>

            {/* ===================================================================== */}
            {/* RIGHT COLUMN: THE WHITE CARD (Matching Figma 1:1)                     */}
            {/* ===================================================================== */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 90, damping: 16 }}
              className="w-full max-w-[481px] mx-auto rounded-[22px] sm:rounded-[26px] bg-white p-3 sm:p-5 shadow-[0px_10px_35px_-5px_rgba(124,58,237,0.1),0px_0px_0px_1px_rgba(235,230,254,0.8)] border border-[#ECE6FE] relative z-10"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5 sm:space-y-3">
                
                {/* ── Input Field 1: LOBBY GAME PIN ── */}
                <div className="space-y-1 text-left">
                  <label className="block font-['Inter'] font-extrabold text-[9.5px] leading-[14px] tracking-[0.475px] uppercase text-[#334155]">
                    LOBBY GAME PIN
                  </label>
                  <div className={`h-[42px] bg-white border rounded-[12px] px-3 flex items-center gap-2.5 shadow-[0px_2px_6px_rgba(139,92,246,0.03)] focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-[#8B5CF6]/15 transition-all ${
                    errors.pin ? 'border-red-400' : 'border-[#E5DEFF]'
                  }`}>
                    <div className="w-4 h-4 flex items-center justify-center text-[#8B5CF6] shrink-0">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <span className="text-[#CBD5E1] text-[13px] font-light select-none">|</span>
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
                      className="min-w-0 w-full h-full bg-transparent text-[13px] font-semibold text-[#1E293B] placeholder:text-[#C4B5FD] focus:outline-none font-['Inter'] tracking-wide"
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
                  <div className={`h-[42px] bg-white border rounded-[12px] px-3 flex items-center gap-2.5 shadow-[0px_2px_6px_rgba(139,92,246,0.03)] focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-[#8B5CF6]/15 transition-all ${
                    errors.fullName ? 'border-red-400' : 'border-[#E5DEFF]'
                  }`}>
                    <div className="w-4 h-4 flex items-center justify-center text-[#8B5CF6] shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-[#CBD5E1] text-[13px] font-light select-none">|</span>
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
                      className="min-w-0 w-full h-full bg-transparent text-[13px] font-semibold text-[#1E293B] placeholder:text-[#C4B5FD] focus:outline-none font-['Inter']"
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
                  <div className={`h-[42px] bg-white border rounded-[12px] px-3 flex items-center gap-2.5 shadow-[0px_2px_6px_rgba(139,92,246,0.03)] focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-[#8B5CF6]/15 transition-all ${
                    errors.mobileNumber ? 'border-red-400' : 'border-[#E5DEFF]'
                  }`}>
                    <div className="w-4 h-4 flex items-center justify-center text-[#8B5CF6] shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-[#CBD5E1] text-[13px] font-light select-none">|</span>
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
                      className="min-w-0 w-full h-full bg-transparent text-[13px] font-semibold text-[#1E293B] placeholder:text-[#C4B5FD] focus:outline-none font-['Inter'] tracking-wide"
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
                  <div className={`h-[42px] bg-white border rounded-[12px] px-3 flex items-center gap-2.5 shadow-[0px_2px_6px_rgba(139,92,246,0.03)] focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-[#8B5CF6]/15 transition-all ${
                    errors.nickname ? 'border-red-400' : 'border-[#E5DEFF]'
                  }`}>
                    <div className="w-4 h-4 flex items-center justify-center text-[#8B5CF6] shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <span className="text-[#CBD5E1] text-[13px] font-light select-none">|</span>
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
                      className="min-w-0 w-full h-full bg-transparent text-[13px] font-semibold text-[#1E293B] placeholder:text-[#C4B5FD] focus:outline-none font-['Inter']"
                    />
                  </div>
                  {errors.nickname && (
                    <div className="flex items-center gap-1 text-[10.5px] text-red-500 font-bold mt-0.5">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.nickname.message}</span>
                    </div>
                  )}
                </div>

                {/* ── Avatar Selection: 4 Columns x 2 Rows matching Figma ── */}
                <div className="space-y-1.5 pt-0.5 text-left">
                  <div className="flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span className="font-['Inter'] font-extrabold text-[9.5px] leading-[14px] tracking-[0.475px] uppercase text-[#334155]">
                      CHOOSE AVATAR
                    </span>
                  </div>

                  {/* 4x2 Avatar Grid */}
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
                    {avatars.map((avatar) => {
                      const isSelected = selectedAvatar === avatar;
                      return (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => setSelectedAvatar(avatar)}
                          className={`relative h-[48px] sm:h-[58px] rounded-2xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'bg-purple-50/50 border-2 border-[#8B5CF6] shadow-sm scale-[1.02]'
                              : 'bg-[#F8FAFC]/90 border border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <Avatar emoji={avatar} className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow-xs" />
                          {isSelected && (
                            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#7A38FF] text-white rounded-full shadow-xs ring-1 ring-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Expandable QR Scanner Camera ── */}
                {isScanning && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 animate-in fade-in duration-200">
                    {scanError ? (
                      <div className="space-y-1 text-center">
                        <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
                        <p className="text-xs font-bold text-slate-800">Camera Access Error</p>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Camera requires HTTPS or localhost. Scan the QR code with your phone's native camera.
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
                    className="w-full h-[46px] sm:h-[48px] rounded-full bg-white border border-slate-200 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center gap-2 text-slate-800 font-['Inter'] font-bold text-[14px] hover:bg-slate-50 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <QrCode className="w-4 h-4 text-[#0F172A]" />
                    <span>{isScanning ? 'Close Scanner' : 'Scan QR Code'}</span>
                  </button>

                  {/* Primary Pill CTA: Join Lobby Room */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full h-[50px] sm:h-[52px] rounded-full bg-gradient-to-r from-[#6C28FE] to-[#4F46E5] shadow-[0px_10px_25px_-3px_rgba(108,40,254,0.4)] flex items-center justify-center gap-2 text-white font-['Inter'] font-extrabold text-[15px] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer ${
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
