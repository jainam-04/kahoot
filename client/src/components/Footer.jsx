import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  ShieldCheck,
  MapPin,
  Building2,
  Globe,
  ExternalLink,
  Mail,
  Phone
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
      className="relative w-full overflow-hidden pt-10 sm:pt-14 pb-8 transition-colors duration-300"
      style={{
        background: isLight
          ? 'linear-gradient(180deg, #F0F8FF 0%, #E6F3FE 50%, #DCEEFE 100%)'
          : 'linear-gradient(180deg, #0B0E17 0%, #0F1424 50%, #080A12 100%)',
      }}
    >
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Top 4-Column Grid matching reference image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 items-start">
          
          {/* Column 1: Brand & Company Meta */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
              <img
                src="/gubbi-bird.png"
                alt="Gubbi Logo"
                className="w-10 h-10 object-contain group-hover:scale-105 transition-transform shrink-0"
                onError={(e) => {
                  e.currentTarget.src = '/gubbi-logo.png';
                }}
              />
              <span className="font-['Inter'] font-extrabold text-2xl tracking-[-0.5px] text-[#0F172A] dark:text-white">
                Gubbi
              </span>
            </Link>

            {/* Company metadata badges */}
            <div className="flex flex-col gap-1.5 mb-3.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0284C7] dark:text-sky-400">
                <Building2 className="w-3.5 h-3.5 text-[#0284C7] dark:text-sky-400 shrink-0" />
                <span>GUBBI INC.</span>
              </div>
              <a
                href="https://gubbi.gradezy.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] dark:text-sky-400 hover:underline group"
              >
                <Globe className="w-3.5 h-3.5 text-[#0284C7] dark:text-sky-400 shrink-0" />
                <span>gubbi.gradezy.in</span>
                <ExternalLink className="w-3 h-3 text-[#0284C7] dark:text-sky-400 opacity-70 group-hover:opacity-100" />
              </a>
            </div>

            {/* Description */}
            <p className="font-['Inter'] text-xs sm:text-[13px] leading-relaxed text-[#475569] dark:text-slate-300 max-w-[340px]">
              Interactive multiplayer arena for live classroom trivia, Kahoot-style speed scoring, instant PIN join, and automated participant reports.
            </p>
          </div>

          {/* Column 2: EXPLORE PLATFORM */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-4 h-4 text-[#0284C7] dark:text-sky-400" />
              <h4 className="font-['Inter'] font-bold text-xs sm:text-[13px] uppercase tracking-wider text-[#0F172A] dark:text-white">
                EXPLORE PLATFORM
              </h4>
            </div>

            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-2 font-['Inter'] font-medium text-xs sm:text-[13px] text-[#334155] dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors"
                >
                  <span className="text-[#0284C7] dark:text-sky-400 font-bold transition-transform group-hover:translate-x-0.5">›</span>
                  <span>About Gubbi</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('#interactive-demo')}
                  className="group inline-flex items-center gap-2 font-['Inter'] font-medium text-xs sm:text-[13px] text-[#334155] dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors cursor-pointer text-left"
                >
                  <span className="text-[#0284C7] dark:text-sky-400 font-bold transition-transform group-hover:translate-x-0.5">›</span>
                  <span>Play Interactive Demo</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('#how-it-works')}
                  className="group inline-flex items-center gap-2 font-['Inter'] font-medium text-xs sm:text-[13px] text-[#334155] dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors cursor-pointer text-left"
                >
                  <span className="text-[#0284C7] dark:text-sky-400 font-bold transition-transform group-hover:translate-x-0.5">›</span>
                  <span>How Gubbi Works</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('#pricing')}
                  className="group inline-flex items-center gap-2 font-['Inter'] font-medium text-xs sm:text-[13px] text-[#334155] dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors cursor-pointer text-left"
                >
                  <span className="text-[#0284C7] dark:text-sky-400 font-bold transition-transform group-hover:translate-x-0.5">›</span>
                  <span>Pricing &amp; Plans</span>
                </button>
              </li>
              <li>
                <Link
                  to="/join"
                  className="group inline-flex items-center gap-2 font-['Inter'] font-medium text-xs sm:text-[13px] text-[#334155] dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors"
                >
                  <span className="text-[#0284C7] dark:text-sky-400 font-bold transition-transform group-hover:translate-x-0.5">›</span>
                  <span>Join Game with PIN</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: HELP & POLICIES */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-[#0284C7] dark:text-sky-400" />
              <h4 className="font-['Inter'] font-bold text-xs sm:text-[13px] uppercase tracking-wider text-[#0F172A] dark:text-white">
                HELP &amp; POLICIES
              </h4>
            </div>

            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  to="/faq"
                  className="group inline-flex items-center gap-2 font-['Inter'] font-medium text-xs sm:text-[13px] text-[#334155] dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors"
                >
                  <span className="text-[#0284C7] dark:text-sky-400 font-bold transition-transform group-hover:translate-x-0.5">›</span>
                  <span>FAQ &amp; Knowledge Base</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="group inline-flex items-center gap-2 font-['Inter'] font-medium text-xs sm:text-[13px] text-[#334155] dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors"
                >
                  <span className="text-[#0284C7] dark:text-sky-400 font-bold transition-transform group-hover:translate-x-0.5">›</span>
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="group inline-flex items-center gap-2 font-['Inter'] font-medium text-xs sm:text-[13px] text-[#334155] dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors"
                >
                  <span className="text-[#0284C7] dark:text-sky-400 font-bold transition-transform group-hover:translate-x-0.5">›</span>
                  <span>Terms and Conditions</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/refund"
                  className="group inline-flex items-center gap-2 font-['Inter'] font-medium text-xs sm:text-[13px] text-[#334155] dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors"
                >
                  <span className="text-[#0284C7] dark:text-sky-400 font-bold transition-transform group-hover:translate-x-0.5">›</span>
                  <span>Refund Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 font-['Inter'] font-medium text-xs sm:text-[13px] text-[#334155] dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors"
                >
                  <span className="text-[#0284C7] dark:text-sky-400 font-bold transition-transform group-hover:translate-x-0.5">›</span>
                  <span>Host Login / Register</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: HEAD OFFICE & CONTACT */}
          <div className="lg:col-span-3 flex flex-col items-start w-full">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#0284C7] dark:text-sky-400" />
              <h4 className="font-['Inter'] font-bold text-xs sm:text-[13px] uppercase tracking-wider text-[#0F172A] dark:text-white">
                HEAD OFFICE &amp; CONTACT
              </h4>
            </div>

            {/* Pune Head Office Card Box */}
            <div className="w-full rounded-2xl p-3.5 bg-[#E0F2FE]/70 dark:bg-sky-950/40 border border-[#BAE6FD] dark:border-sky-800/40 shadow-xs mb-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0284C7] dark:text-sky-300 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#0284C7] dark:text-sky-400 shrink-0" />
                <span>PUNE (HEAD OFFICE)</span>
                <ExternalLink className="w-3 h-3 text-[#0284C7] dark:text-sky-400 opacity-70" />
              </div>
              <p className="text-xs text-[#334155] dark:text-slate-300 font-medium leading-relaxed pl-5">
                305, City Vista, Kharadi, Pune 411014
              </p>
            </div>

            {/* Contact links */}
            <div className="flex flex-col gap-2 w-full">
              <a
                href="mailto:info@fouriseindia.com"
                className="inline-flex items-center gap-2 text-xs font-medium text-[#334155] dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors group"
              >
                <Mail className="w-4 h-4 text-[#0284C7] dark:text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span>info@fouriseindia.com</span>
              </a>
              <a
                href="tel:+919527605805"
                className="inline-flex items-center gap-2 text-xs font-medium text-[#334155] dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors group"
              >
                <Phone className="w-4 h-4 text-[#0284C7] dark:text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span>+91 95276 05805</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Sub-footer Separator & Links matching reference */}
        <div className="border-t border-[#BAE6FD]/70 dark:border-sky-900/40 mt-8 sm:mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="font-['Inter'] text-xs text-[#64748B] dark:text-slate-400 font-normal">
            © 2026 Gubbi Inc. · Gubbi. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-['Inter'] font-medium text-[#475569] dark:text-slate-300">
            <Link to="/about" className="hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors">
              About Gubbi
            </Link>
            <Link to="/faq" className="hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors">
              FAQ
            </Link>
            <Link to="/privacy" className="hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link to="/refund" className="hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors">
              Refund Policy
            </Link>
            <Link to="/" className="hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors">
              Gubbi
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
