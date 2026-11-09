import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  ShieldCheck,
  Headphones,
  MapPin,
  ExternalLink,
  Mail,
  Phone,
  MessageSquare,
  FileText
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const handleNavClick = (hash) => {
    if (location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer
      className="relative w-full overflow-hidden pt-14 sm:pt-20 transition-colors duration-300"
      style={{
        background: isLight
          ? 'linear-gradient(180deg, #FAF8FF 0%, #FAF6FF 50%, rgba(237, 233, 254, 0.6) 100%)'
          : 'linear-gradient(180deg, #0B0E17 0%, #120F26 50%, #0B0914 100%)',
      }}
    >
      {/* Top 4-Column Grid matching Figma specification & previous section structure */}
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
          
          {/* Column 1: Brand Info & Socials (Figma Col 1) */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
              <div className="w-10 h-10 bg-white rounded-xl shadow-[0px_4px_6px_-1px_rgba(168,85,247,0.25),0px_2px_4px_-2px_rgba(168,85,247,0.25)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src="/gubbi-bird.png"
                  alt="Gubbi Logo"
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/gubbi-logo.png';
                  }}
                />
              </div>
              <span className="font-['Inter'] font-extrabold text-[28px] sm:text-[30px] tracking-[-0.75px] text-[#0F172A] dark:text-white">
                Gubbi
              </span>
            </Link>

            {/* Tagline */}
            <h5 className="font-['Inter'] font-semibold text-base text-[#1E293B] dark:text-purple-200 mb-1">
              Game. Quiz. Engage.
            </h5>

            {/* Company Metadata Badge */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#551BF5] dark:text-purple-400 mb-3">
              <span>GUBBI INC.</span>
              <span>•</span>
              <a
                href="https://gubbi.gradezy.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline inline-flex items-center gap-1"
              >
                <span>gubbi.gradezy.in</span>
                <ExternalLink className="w-3 h-3 opacity-75" />
              </a>
            </div>

            {/* Description */}
            <p className="font-['Inter'] text-sm leading-[23px] text-[#64748B] dark:text-slate-300 max-w-[340px] mb-5">
              Interactive multiplayer arena for live classroom trivia, Kahoot-style speed scoring, instant PIN join, and automated participant reports.
            </p>

            {/* Social Icons (Rounded-xl soft buttons matching Figma) */}
            <div className="flex items-center gap-3">
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-xl bg-[rgba(250,245,255,0.8)] dark:bg-purple-950/40 border border-[#F3E8FF] dark:border-purple-800/40 flex items-center justify-center text-[#334155] dark:text-slate-300 hover:text-[#551BF5] dark:hover:text-purple-300 hover:border-[#DDD6FE] hover:bg-white dark:hover:bg-purple-900/40 hover:scale-105 transition-all shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.32a1.63 1.63 0 1 0 0 3.25 1.63 1.63 0 0 0 0-3.25z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-xl bg-[rgba(250,245,255,0.8)] dark:bg-purple-950/40 border border-[#F3E8FF] dark:border-purple-800/40 flex items-center justify-center text-[#334155] dark:text-slate-300 hover:text-[#551BF5] dark:hover:text-purple-300 hover:border-[#DDD6FE] hover:bg-white dark:hover:bg-purple-900/40 hover:scale-105 transition-all shadow-xs"
              >
                <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-xl bg-[rgba(250,245,255,0.8)] dark:bg-purple-950/40 border border-[#F3E8FF] dark:border-purple-800/40 flex items-center justify-center text-[#334155] dark:text-slate-300 hover:text-[#551BF5] dark:hover:text-purple-300 hover:border-[#DDD6FE] hover:bg-white dark:hover:bg-purple-900/40 hover:scale-105 transition-all shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* X (Twitter) */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-10 h-10 rounded-xl bg-[rgba(250,245,255,0.8)] dark:bg-purple-950/40 border border-[#F3E8FF] dark:border-purple-800/40 flex items-center justify-center text-[#334155] dark:text-slate-300 hover:text-[#551BF5] dark:hover:text-purple-300 hover:border-[#DDD6FE] hover:bg-white dark:hover:bg-purple-900/40 hover:scale-105 transition-all shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: EXPLORE PLATFORM (Figma Col 2) */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-5 h-5 text-[#551BF5]" />
              <h4 className="font-['Inter'] font-bold text-base sm:text-lg tracking-[-0.45px] text-[#0F172A] dark:text-white">
                EXPLORE PLATFORM
              </h4>
            </div>

            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-2.5 font-['Inter'] font-medium text-sm text-[#334155] dark:text-slate-300 hover:text-[#551BF5] dark:hover:text-purple-300 transition-colors"
                >
                  <span className="text-xs font-bold text-[#551BF5] transition-transform group-hover:translate-x-1">›</span>
                  <span>About Gubbi</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('#interactive-demo')}
                  className="group inline-flex items-center gap-2.5 font-['Inter'] font-medium text-sm text-[#334155] dark:text-slate-300 hover:text-[#551BF5] dark:hover:text-purple-300 transition-colors cursor-pointer text-left"
                >
                  <span className="text-xs font-bold text-[#551BF5] transition-transform group-hover:translate-x-1">›</span>
                  <span>Play Interactive Demo</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('#how-it-works')}
                  className="group inline-flex items-center gap-2.5 font-['Inter'] font-medium text-sm text-[#334155] dark:text-slate-300 hover:text-[#551BF5] dark:hover:text-purple-300 transition-colors cursor-pointer text-left"
                >
                  <span className="text-xs font-bold text-[#551BF5] transition-transform group-hover:translate-x-1">›</span>
                  <span>How Gubbi Works</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('#pricing')}
                  className="group inline-flex items-center gap-2.5 font-['Inter'] font-medium text-sm text-[#334155] dark:text-slate-300 hover:text-[#551BF5] dark:hover:text-purple-300 transition-colors cursor-pointer text-left"
                >
                  <span className="text-xs font-bold text-[#551BF5] transition-transform group-hover:translate-x-1">›</span>
                  <span>Pricing &amp; Plans</span>
                </button>
              </li>
              <li>
                <Link
                  to="/join"
                  className="group inline-flex items-center gap-2.5 font-['Inter'] font-medium text-sm text-[#334155] dark:text-slate-300 hover:text-[#551BF5] dark:hover:text-purple-300 transition-colors"
                >
                  <span className="text-xs font-bold text-[#551BF5] transition-transform group-hover:translate-x-1">›</span>
                  <span>Join Game with PIN</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: HELP & POLICIES (Figma Col 3) */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-[#551BF5]" />
              <h4 className="font-['Inter'] font-bold text-base sm:text-lg tracking-[-0.45px] text-[#0F172A] dark:text-white">
                HELP &amp; POLICIES
              </h4>
            </div>

            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  to="/faq"
                  className="group inline-flex items-center gap-2.5 font-['Inter'] font-medium text-sm text-[#334155] dark:text-slate-300 hover:text-[#551BF5] dark:hover:text-purple-300 transition-colors"
                >
                  <span className="text-xs font-bold text-[#551BF5] transition-transform group-hover:translate-x-1">›</span>
                  <span>FAQ &amp; Knowledge Base</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="group inline-flex items-center gap-2.5 font-['Inter'] font-medium text-sm text-[#334155] dark:text-slate-300 hover:text-[#551BF5] dark:hover:text-purple-300 transition-colors"
                >
                  <span className="text-xs font-bold text-[#551BF5] transition-transform group-hover:translate-x-1">›</span>
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="group inline-flex items-center gap-2.5 font-['Inter'] font-medium text-sm text-[#334155] dark:text-slate-300 hover:text-[#551BF5] dark:hover:text-purple-300 transition-colors"
                >
                  <span className="text-xs font-bold text-[#551BF5] transition-transform group-hover:translate-x-1">›</span>
                  <span>Terms and Conditions</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/refund"
                  className="group inline-flex items-center gap-2.5 font-['Inter'] font-medium text-sm text-[#334155] dark:text-slate-300 hover:text-[#551BF5] dark:hover:text-purple-300 transition-colors"
                >
                  <span className="text-xs font-bold text-[#551BF5] transition-transform group-hover:translate-x-1">›</span>
                  <span>Refund Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2.5 font-['Inter'] font-medium text-sm text-[#334155] dark:text-slate-300 hover:text-[#551BF5] dark:hover:text-purple-300 transition-colors"
                >
                  <span className="text-xs font-bold text-[#551BF5] transition-transform group-hover:translate-x-1">›</span>
                  <span>Host Login / Register</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: HEAD OFFICE & CONTACT (Figma Col 4) */}
          <div className="lg:col-span-3 flex flex-col items-start w-full">
            <div className="flex items-center gap-2 mb-4">
              <Headphones className="w-5 h-5 text-[#551BF5]" />
              <h4 className="font-['Inter'] font-bold text-base sm:text-lg tracking-[-0.45px] text-[#0F172A] dark:text-white">
                HEAD OFFICE &amp; CONTACT
              </h4>
            </div>

            {/* Pune Head Office Card Box */}
            <div className="w-full rounded-2xl p-3.5 bg-[#EDE9FE]/70 dark:bg-purple-950/40 border border-[#DDD6FE] dark:border-purple-800/40 shadow-xs mb-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#551BF5] dark:text-purple-300 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#551BF5] shrink-0" />
                <span>PUNE (HEAD OFFICE)</span>
                <ExternalLink className="w-3 h-3 text-[#551BF5] opacity-70" />
              </div>
              <p className="text-xs text-[#334155] dark:text-slate-300 font-medium leading-relaxed pl-5">
                305, City Vista, Kharadi, Pune 411014
              </p>
            </div>

            {/* Contact links */}
            <div className="flex flex-col gap-2.5 w-full">
              <a
                href="mailto:info@fouriseindia.com"
                className="inline-flex items-center gap-3 text-sm font-semibold text-[#1E293B] dark:text-slate-200 hover:text-[#551BF5] dark:hover:text-purple-300 transition-colors group"
              >
                <Mail className="w-4 h-4 text-[#551BF5] shrink-0 group-hover:scale-110 transition-transform" />
                <span>info@fouriseindia.com</span>
              </a>
              <a
                href="tel:+919527605805"
                className="inline-flex items-center gap-3 text-sm font-semibold text-[#1E293B] dark:text-slate-200 hover:text-[#551BF5] dark:hover:text-purple-300 transition-colors group"
              >
                <Phone className="w-4 h-4 text-[#551BF5] shrink-0 group-hover:scale-110 transition-transform" />
                <span>+91 95276 05805</span>
              </a>
              <Link
                to="/faq"
                className="inline-flex items-center gap-3 text-sm font-semibold text-[#1E293B] dark:text-slate-200 hover:text-[#551BF5] dark:hover:text-purple-300 transition-colors group"
              >
                <MessageSquare className="w-4 h-4 text-[#551BF5] shrink-0 group-hover:scale-110 transition-transform" />
                <span>Chat with Support</span>
              </Link>
              <a
                href="mailto:info@fouriseindia.com?subject=Gubbi%20Feedback"
                className="inline-flex items-center gap-3 text-sm font-semibold text-[#1E293B] dark:text-slate-200 hover:text-[#551BF5] dark:hover:text-purple-300 transition-colors group"
              >
                <FileText className="w-4 h-4 text-[#551BF5] shrink-0 group-hover:scale-110 transition-transform" />
                <span>Send Feedback</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Layered Soft Wave SVG Transition matching Figma vector specs */}
      <div className="w-full overflow-hidden leading-none relative -mb-1">
        <svg
          className="relative block w-full h-[60px] sm:h-[80px] lg:h-[96px]"
          viewBox="0 0 1440 96"
          preserveAspectRatio="none"
        >
          {/* Back Lavender Wave Vector (opacity 0.55) */}
          <path
            d="M 0,38 C 320,10 680,68 1040,24 C 1220,4 1360,32 1440,36 L 1440,96 L 0,96 Z"
            fill={isLight ? '#EDE9FE' : '#1E1B4B'}
            fillOpacity={isLight ? 0.6 : 0.4}
          />
          {/* Front Solid Royal Purple Wave Vector */}
          <path
            d="M 0,52 C 300,28 660,74 1020,36 C 1200,18 1350,46 1440,44 L 1440,96 L 0,96 Z"
            fill={isLight ? '#551BF5' : '#4314D6'}
          />
        </svg>
      </div>

      {/* Solid Royal Purple Bottom Sub-footer */}
      <div className="w-full bg-[#551BF5] dark:bg-[#4314D6] text-white py-6 px-4 sm:px-8">
        <div className="mx-auto max-w-[1240px] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="font-['Inter'] text-xs sm:text-sm text-white/95 font-normal">
            © 2026 Gubbi Inc. · Gubbi. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs sm:text-sm font-['Inter'] font-medium text-white/90">
            <Link to="/about" className="hover:text-white transition-colors">
              About Gubbi
            </Link>
            <span className="text-white/40">|</span>
            <Link to="/faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
            <span className="text-white/40">|</span>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/40">|</span>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <span className="text-white/40">|</span>
            <Link to="/refund" className="hover:text-white transition-colors">
              Refund Policy
            </Link>
            <span className="text-white/40">|</span>
            <Link to="/" className="hover:text-white transition-colors">
              Gubbi
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
