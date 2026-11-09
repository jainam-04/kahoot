import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layers, LayoutGrid, Headphones, Mail, MessageCircle, FileText } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

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
    <footer className="relative w-full overflow-hidden pt-6 sm:pt-12 lg:pt-20 bg-gradient-to-b from-[#FFFFFF] via-[#FAF8FF] to-[#EDE9FE]/50 text-left transition-colors duration-300">
      {/* Top Section Content Grid */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10">
        
        {/* Mobile Compact Brand Header (Only visible on mobile screens < lg) */}
        <div className="lg:hidden flex items-center justify-between gap-3 mb-4 pb-3 border-b border-purple-100/70">
          <Link to="/" className="inline-flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white shadow-[0px_4px_6px_-1px_rgba(168,85,247,0.25),0px_2px_4px_-2px_rgba(168,85,247,0.25)] flex items-center justify-center p-1 border border-purple-100 group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/gubbi-bird.png"
                alt="Gubbi"
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/gubbi-logo.png';
                }}
              />
            </div>
            <div>
              <span className="font-['Inter'] font-extrabold text-xl leading-none tracking-[-0.5px] text-[#0F172A] block">
                Gubbi
              </span>
              <span className="font-['Inter'] font-semibold text-[11px] text-[#64748B] block mt-0.5">
                Game. Quiz. Engage.
              </span>
            </div>
          </Link>

          {/* Social Icons for Mobile */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-8 h-8 rounded-lg bg-[#FAF5FF]/90 border border-[#F3E8FF] flex items-center justify-center text-[#334155] hover:text-[#551BF5] transition-all shadow-xs"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.65 1.65 0 1 0-.02-3.3 1.65 1.65 0 0 0 .02 3.3m1.39 9.74V10.13H5.07v8.37h2.78z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-lg bg-[#FAF5FF]/90 border border-[#F3E8FF] flex items-center justify-center text-[#334155] hover:text-[#551BF5] transition-all shadow-xs"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
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
              className="w-8 h-8 rounded-lg bg-[#FAF5FF]/90 border border-[#F3E8FF] flex items-center justify-center text-[#334155] hover:text-[#551BF5] transition-all shadow-xs"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* X (Twitter) */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="w-8 h-8 rounded-lg bg-[#FAF5FF]/90 border border-[#F3E8FF] flex items-center justify-center text-[#334155] hover:text-[#551BF5] transition-all shadow-xs"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Content Columns: 2 Columns on Mobile, 4 Columns on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-4 sm:gap-6 lg:gap-8 items-start">
          
          {/* Column 1: Brand Info (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-4 flex-col items-start">
            {/* Logo Row */}
            <Link to="/" className="inline-flex items-center gap-3 mb-3 group">
              <div className="w-9 h-9 rounded-xl bg-white shadow-[0px_4px_6px_-1px_rgba(168,85,247,0.25),0px_2px_4px_-2px_rgba(168,85,247,0.25)] flex items-center justify-center p-1 border border-purple-100 group-hover:scale-105 transition-transform shrink-0">
                <img
                  src="/gubbi-bird.png"
                  alt="Gubbi"
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/gubbi-logo.png';
                  }}
                />
              </div>
              <span className="font-['Inter'] font-extrabold text-[30px] leading-9 tracking-[-0.75px] text-[#0F172A]">
                Gubbi
              </span>
            </Link>

            {/* Tagline */}
            <p className="font-['Inter'] font-semibold text-base leading-6 text-[#1E293B] mb-2.5">
              Game. Quiz. Engage.
            </p>

            {/* Description */}
            <p className="font-['Inter'] text-sm leading-[23px] text-[#64748B] max-w-[342px] mb-6">
              An interactive live quiz platform for educators, trivia hosts, and teams to create engaging multiplayer quiz experiences in seconds.
            </p>

            {/* Social Icons matching image */}
            <div className="flex items-center gap-3">
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-xl bg-[#FAF5FF]/80 border border-[#F3E8FF] flex items-center justify-center text-[#334155] hover:text-[#551BF5] hover:border-[#D8B4FE] hover:bg-[#F3E8FF] transition-all hover:-translate-y-0.5 cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.65 1.65 0 1 0-.02-3.3 1.65 1.65 0 0 0 .02 3.3m1.39 9.74V10.13H5.07v8.37h2.78z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-xl bg-[#FAF5FF]/80 border border-[#F3E8FF] flex items-center justify-center text-[#334155] hover:text-[#551BF5] hover:border-[#D8B4FE] hover:bg-[#F3E8FF] transition-all hover:-translate-y-0.5 cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
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
                className="w-10 h-10 rounded-xl bg-[#FAF5FF]/80 border border-[#F3E8FF] flex items-center justify-center text-[#334155] hover:text-[#551BF5] hover:border-[#D8B4FE] hover:bg-[#F3E8FF] transition-all hover:-translate-y-0.5 cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* X (Twitter) */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="w-10 h-10 rounded-xl bg-[#FAF5FF]/80 border border-[#F3E8FF] flex items-center justify-center text-[#334155] hover:text-[#551BF5] hover:border-[#D8B4FE] hover:bg-[#F3E8FF] transition-all hover:-translate-y-0.5 cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Platform (col-span-1 on mobile, col-span-2 on desktop) */}
          <div className="col-span-1 lg:col-span-2 lg:col-start-6 flex flex-col items-start">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-5">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#551BF5]" />
              <h4 className="font-['Inter'] font-bold text-sm sm:text-lg leading-tight tracking-[-0.45px] text-[#0F172A]">
                Platform
              </h4>
            </div>

            <ul className="flex flex-col gap-1.5 sm:gap-3.5">
              <li>
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-1.5 sm:gap-2.5 font-['Inter'] font-medium text-xs sm:text-sm text-[#334155] hover:text-[#551BF5] transition-colors"
                >
                  <span className="text-[#551BF5] font-bold text-xs transition-transform group-hover:translate-x-0.5">›</span>
                  <span>Create a Quiz</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/join"
                  className="group inline-flex items-center gap-1.5 sm:gap-2.5 font-['Inter'] font-medium text-xs sm:text-sm text-[#334155] hover:text-[#551BF5] transition-colors"
                >
                  <span className="text-[#551BF5] font-bold text-xs transition-transform group-hover:translate-x-0.5">›</span>
                  <span>Join with Game PIN</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('#interactive-demo')}
                  className="group inline-flex items-center gap-1.5 sm:gap-2.5 font-['Inter'] font-medium text-xs sm:text-sm text-[#334155] hover:text-[#551BF5] transition-colors cursor-pointer text-left"
                >
                  <span className="text-[#551BF5] font-bold text-xs transition-transform group-hover:translate-x-0.5">›</span>
                  <span>Live Multiplayer</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('#interactive-demo')}
                  className="group inline-flex items-center gap-1.5 sm:gap-2.5 font-['Inter'] font-medium text-xs sm:text-sm text-[#334155] hover:text-[#551BF5] transition-colors cursor-pointer text-left"
                >
                  <span className="text-[#551BF5] font-bold text-xs transition-transform group-hover:translate-x-0.5">›</span>
                  <span>Leaderboards</span>
                </button>
              </li>
              <li>
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-1.5 sm:gap-2.5 font-['Inter'] font-medium text-xs sm:text-sm text-[#334155] hover:text-[#551BF5] transition-colors"
                >
                  <span className="text-[#551BF5] font-bold text-xs transition-transform group-hover:translate-x-0.5">›</span>
                  <span>Host Controls</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources (col-span-1 on mobile, col-span-2 on desktop) */}
          <div className="col-span-1 lg:col-span-2 flex flex-col items-start">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-5">
              <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-[#551BF5]" />
              <h4 className="font-['Inter'] font-bold text-sm sm:text-lg leading-tight tracking-[-0.45px] text-[#0F172A]">
                Resources
              </h4>
            </div>

            <ul className="flex flex-col gap-1.5 sm:gap-3.5">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('#how-it-works')}
                  className="group inline-flex items-center gap-1.5 sm:gap-2.5 font-['Inter'] font-medium text-xs sm:text-sm text-[#334155] hover:text-[#551BF5] transition-colors cursor-pointer text-left"
                >
                  <span className="text-[#551BF5] font-bold text-xs transition-transform group-hover:translate-x-0.5">›</span>
                  <span>How It Works</span>
                </button>
              </li>
              <li>
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-1.5 sm:gap-2.5 font-['Inter'] font-medium text-xs sm:text-sm text-[#334155] hover:text-[#551BF5] transition-colors"
                >
                  <span className="text-[#551BF5] font-bold text-xs transition-transform group-hover:translate-x-0.5">›</span>
                  <span>Use Cases</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-1.5 sm:gap-2.5 font-['Inter'] font-medium text-xs sm:text-sm text-[#334155] hover:text-[#551BF5] transition-colors"
                >
                  <span className="text-[#551BF5] font-bold text-xs transition-transform group-hover:translate-x-0.5">›</span>
                  <span>Tips for Hosts</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="group inline-flex items-center gap-1.5 sm:gap-2.5 font-['Inter'] font-medium text-xs sm:text-sm text-[#334155] hover:text-[#551BF5] transition-colors"
                >
                  <span className="text-[#551BF5] font-bold text-xs transition-transform group-hover:translate-x-0.5">›</span>
                  <span>Help Center</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('#faq')}
                  className="group inline-flex items-center gap-1.5 sm:gap-2.5 font-['Inter'] font-medium text-xs sm:text-sm text-[#334155] hover:text-[#551BF5] transition-colors cursor-pointer text-left"
                >
                  <span className="text-[#551BF5] font-bold text-xs transition-transform group-hover:translate-x-0.5">›</span>
                  <span>FAQs</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Support & Contact (col-span-2 on mobile, col-span-3 on desktop) */}
          <div className="col-span-2 lg:col-span-3 flex flex-col items-start pt-3 sm:pt-4 lg:pt-0 border-t border-purple-100/60 lg:border-t-0 w-full">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-5">
              <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-[#551BF5]" />
              <h4 className="font-['Inter'] font-bold text-sm sm:text-lg leading-tight tracking-[-0.45px] text-[#0F172A]">
                Support & Contact
              </h4>
            </div>

            <div className="flex flex-wrap sm:flex-col gap-x-4 gap-y-1 sm:gap-3.5 w-full">
              <a
                href="mailto:info@fouriseindia.com"
                className="inline-flex items-center gap-2 py-0.5 font-['Inter'] font-semibold text-xs sm:text-sm text-[#1E293B] hover:text-[#551BF5] transition-colors group"
              >
                <Mail className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#551BF5] shrink-0 group-hover:scale-110 transition-transform" />
                <span>info@fouriseindia.com</span>
              </a>

              <a
                href="mailto:info@fouriseindia.com?subject=Chat%20with%20Support%20-%20Gubbi"
                className="inline-flex items-center gap-2 py-0.5 font-['Inter'] font-semibold text-xs sm:text-sm text-[#1E293B] hover:text-[#551BF5] transition-colors group"
              >
                <MessageCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#551BF5] shrink-0 group-hover:scale-110 transition-transform" />
                <span>Chat with Support</span>
              </a>

              <a
                href="mailto:info@fouriseindia.com?subject=Feedback%20for%20Gubbi"
                className="inline-flex items-center gap-2 py-0.5 font-['Inter'] font-semibold text-xs sm:text-sm text-[#1E293B] hover:text-[#551BF5] transition-colors group"
              >
                <FileText className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#551BF5] shrink-0 group-hover:scale-110 transition-transform" />
                <span>Send Feedback</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Wave and Royal Purple Bar */}
      <div className="relative w-full mt-4 sm:mt-12 lg:mt-20 overflow-hidden">
        {/* Layered Wave SVG Transition matching IMAGE_1 */}
        <div className="w-full overflow-hidden leading-none -mb-1">
          <svg
            className="relative block w-full h-[28px] sm:h-[64px] lg:h-[108px]"
            viewBox="0 0 1440 108"
            preserveAspectRatio="none"
          >
            {/* Back soft lavender wave (Vector 1: #EDE9FE at 0.5 opacity) */}
            <path
              d="M0,36 C320,68 540,16 820,46 C1100,76 1280,22 1440,36 L1440,108 L0,108 Z"
              fill="#EDE9FE"
              fillOpacity="0.5"
            />
            {/* Front Royal Purple wave (Vector 2: #551BF5) */}
            <path
              d="M0,54 C360,22 620,74 960,40 C1200,14 1360,50 1440,38 L1440,108 L0,108 Z"
              fill="#551BF5"
            />
          </svg>
        </div>

        {/* Solid Royal Purple Bottom Sub-footer */}
        <div className="w-full bg-[#551BF5] px-4 sm:px-12 py-3.5 sm:py-7 lg:py-8">
          <div className="max-w-[1255px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-6 text-center sm:text-left">
            <p className="font-['Inter'] text-[11px] sm:text-sm text-white font-normal order-2 sm:order-1">
              © 2026 Gubbi. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] sm:text-sm font-['Inter'] order-1 sm:order-2">
              <Link
                to="/privacy"
                className="text-white/90 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-white/40 select-none">|</span>
              <Link
                to="/terms"
                className="text-white/90 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <span className="text-white/40 select-none">|</span>
              <Link
                to="/privacy"
                className="text-white/90 hover:text-white transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
