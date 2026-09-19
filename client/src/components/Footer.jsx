import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Mail, Phone, MapPin, ExternalLink, Globe, Sparkles,
  Building2, ChevronRight, HelpCircle, Shield, FileText,
  RotateCcw, Gamepad2, Trophy
} from 'lucide-react';
import Logo from './Logo';

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

  const googleMapsUrl = 'https://www.google.com/maps/place/Fourise+Software+Solutions+Pvt.+Ltd+Pune/@18.5614019,73.9445274,17z/data=!4m10!1m2!2m1!1s305+City+Vista+Kharadi+Pune+411014!3m6!1s0x3bc2c11464246d03:0x7ef94ccf7fe4a2d0!8m2!3d18.5611975!4d73.9447286!15sCiIzMDUgQ2l0eSBWaXN0YSBLaGFyYWRpIFB1bmUgNDExMDE0WiQiIjMwNSBjaXR5IHZpc3RhIGtoYXJhZGkgcHVuZSA0MTEwMTSSARBzb2Z0d2FyZV9jb21wYW554AEA!16s%2Fg%2F11q_073v_m?entry=ttu&g_ep=EgoyMDI2MDgxMi4wIKXMDSoASAFQAw%3D%3D';

  return (
    <footer
      style={{ background: 'var(--footer-bg)', borderTop: '1px solid var(--footer-border)' }}
      className="relative z-10 w-full backdrop-blur-xl transition-colors duration-300"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* 4-Column Synchronized Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-black/10 dark:border-white/10 text-left">
          
          {/* Column 1: Brand & Identity */}
          <div className="space-y-3.5 text-left">
            <Link to="/" className="inline-flex items-center gap-2 transition-transform active:scale-95">
              <Logo className="h-6 w-6" />
              <span className="font-outfit text-base font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#386BFF] to-[#7B2CFF]">
                Quizy
              </span>
            </Link>

            <div className="space-y-1">
              <h5 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5" style={{ color: 'var(--text-heading)' }}>
                <Building2 className="h-3.5 w-3.5 text-secondary shrink-0" />
                <span>Quizy Inc.</span>
              </h5>
              
              <a
                href="https://quizy.gradezy.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline transition-colors"
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span>quizy.gradezy.in</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Interactive multiplayer arena for live classroom trivia, Kahoot-style speed scoring, instant PIN join, and automated participant reports.
            </p>
          </div>

          {/* Column 2: Platform & Explore */}
          <div className="space-y-3 text-left">
            <h4 className="font-outfit text-xs font-extrabold tracking-wide uppercase flex items-center gap-1.5" style={{ color: 'var(--text-heading)' }}>
              <Gamepad2 className="h-3.5 w-3.5 text-primary" />
              <span>Explore Platform</span>
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <li>
                <Link
                  to="/about"
                  className="group flex items-center gap-2 font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span>About Quizy</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('#interactive-demo')}
                  className="group flex items-center gap-2 font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span>Play Interactive Demo</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('#how-it-works')}
                  className="group flex items-center gap-2 font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span>How Quiz Hub Works</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('#pricing')}
                  className="group flex items-center gap-2 font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span>Pricing & Plans</span>
                </button>
              </li>
              <li>
                <Link
                  to="/join"
                  className="group flex items-center gap-2 font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span>Join Game with PIN</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help & Policies */}
          <div className="space-y-3 text-left">
            <h4 className="font-outfit text-xs font-extrabold tracking-wide uppercase flex items-center gap-1.5" style={{ color: 'var(--text-heading)' }}>
              <Shield className="h-3.5 w-3.5 text-secondary" />
              <span>Help & Policies</span>
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <li>
                <Link
                  to="/faq"
                  className="group flex items-center gap-2 font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span>FAQ & Knowledge Base</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="group flex items-center gap-2 font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="group flex items-center gap-2 font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span>Terms and Conditions</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/refund"
                  className="group flex items-center gap-2 font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span>Refund Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="group flex items-center gap-2 font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span>Host Login / Register</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Head Office & Support */}
          <div className="space-y-3 text-left">
            <h4 className="font-outfit text-xs font-extrabold tracking-wide uppercase flex items-center gap-1.5" style={{ color: 'var(--text-heading)' }}>
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Head Office & Contact</span>
            </h4>

            {/* Clickable Navigable Address */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-3 rounded-xl bg-sky-100/70 dark:bg-white/5 border border-sky-200 dark:border-white/10 hover:border-sky-400 dark:hover:border-primary/40 hover:bg-sky-100 dark:hover:bg-white/10 transition-all text-left cursor-pointer shadow-sm"
              title="Quizy Inc. Pune (Google Maps)"
            >
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="space-y-0.5 overflow-hidden min-w-0">
                  <span className="text-xs font-bold uppercase text-secondary tracking-wide flex items-center gap-1">
                    <span>Pune (Head Office)</span>
                    <ExternalLink className="h-3 w-3 text-secondary opacity-70 group-hover:opacity-100 shrink-0" />
                  </span>
                  <p className="text-xs font-semibold leading-snug break-words" style={{ color: 'var(--text-main)' }}>
                    305, City Vista, Kharadi, Pune 411014
                  </p>
                </div>
              </div>
            </a>

            <ul className="space-y-2 text-xs px-1">
              <li>
                <a
                  href="mailto:info@fouriseindia.com"
                  className="inline-flex items-center gap-2.5 hover:text-primary transition-colors font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span>info@fouriseindia.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+919527605805"
                  className="inline-flex items-center gap-2.5 hover:text-primary transition-colors font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span>+91 95276 05805</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Legal Row */}
        <div className="pt-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-center md:text-left" style={{ color: 'var(--text-muted)' }}>
          <p>© {new Date().getFullYear()} Quizy Inc. · Quizy. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs font-medium">
            <Link to="/about" className="hover:text-primary transition-colors">
              About Quizy
            </Link>
            <Link to="/faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/refund" className="hover:text-primary transition-colors">
              Refund Policy
            </Link>
            <a href="https://quizzy.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Quizy
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
