/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Enable the `xs:` breakpoint already referenced across the codebase
      // (HeroSection.jsx & LiveDemoSection.jsx). Without this, every `xs:`
      // class is dead CSS, so headings/line-breaks/progressive UI never adapt.
      // 480px keeps phones (320–414px) identical to today and only activates
      // the authored enhancements on tablets & up.
      screens: {
        xs: '480px',
      },
      spacing: {
        '4.5': '1.125rem',
      },
      colors: {
        primary: "var(--theme-primary, #7C3AED)",     // Purple (Dynamic)
        secondary: "var(--theme-secondary, #06B6D4)",   // Cyan (Dynamic)
        accent: "var(--theme-accent, #F43F5E)",      // Accent (Rose) (Dynamic)
        success: "#22C55E",     // Success (Green)
        warning: "#FACC15",     // Warning (Yellow)
        background: "var(--background)",   // Background (Dark/Light Mode)
        heading: "var(--text-heading, #0f172a)",
        muted: "var(--text-muted, #64748b)",
        main: "var(--text-main, #1e293b)",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        'gradient-bg': 'gradientBg 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 10s ease-in-out infinite',
        'float-fast': 'floatFast 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        gradientBg: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1.5deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(-2deg)' },
        },
        floatFast: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(3deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 0.35, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        }
      },
      boxShadow: {
        'premium-glow': '0 0 25px rgba(124, 58, 237, 0.3)',
        'secondary-glow': '0 0 25px rgba(6, 182, 212, 0.3)',
        'accent-glow': '0 0 25px rgba(244, 63, 94, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
