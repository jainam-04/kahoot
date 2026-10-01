import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Logo({ className = '', iconOnly = false, showText = true, size = 'md', ...props }) {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  return (
    <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`} {...props}>
      {/* Dynamic Vector Q-Brandmark Icon */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 sm:h-9 sm:w-9 aspect-square shrink-0 transition-transform duration-200 hover:scale-105"
        >
          <defs>
            <linearGradient id="quizyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D9FF" />
              <stop offset="45%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>
            <filter id="quizyGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7c3aed" floodOpacity={isLight ? "0.2" : "0.45"} />
            </filter>
          </defs>

          {/* Icon Badge */}
          <rect
            x="2"
            y="2"
            width="40"
            height="40"
            rx="12"
            fill="url(#quizyGrad)"
            filter="url(#quizyGlow)"
          />

          {/* Outer Ring of Q */}
          <circle
            cx="21"
            cy="19"
            r="9"
            stroke="#ffffff"
            strokeWidth="3.8"
            fill="none"
          />

          {/* Q Tail Slash */}
          <path
            d="M26.5 24.5L33 32"
            stroke="#ffffff"
            strokeWidth="3.8"
            strokeLinecap="round"
          />

          {/* Sparkle Dot */}
          <circle
            cx="14.5"
            cy="13.5"
            r="1.8"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* Theme-Adaptive "Quizy" Brand Wordmark */}
      {!iconOnly && showText && (
        <span
          className={`font-outfit font-black tracking-tight text-xl sm:text-2xl transition-all duration-300 ${
            isLight
              ? 'bg-clip-text text-transparent bg-gradient-to-r from-[#0369a1] via-[#3730a3] to-[#6b21a8] drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]'
              : 'bg-clip-text text-transparent bg-gradient-to-r from-[#00D9FF] via-[#60a5fa] to-[#c084fc] drop-shadow-[0_0_12px_rgba(0,217,255,0.3)]'
          }`}
        >
          Quizy
        </span>
      )}
    </div>
  );
}
