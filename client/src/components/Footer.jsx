import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink, Globe, Sparkles, Building2, ChevronRight } from 'lucide-react';
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* 3-Column Compact Synchronized Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pb-6 border-b border-black/10 dark:border-white/10 text-left">
          
          {/* Column 1: Brand & Parent Company */}
          <div className="space-y-3 text-left">
            <Link to="/" className="inline-flex items-center gap-2 transition-transform active:scale-95">
              <Logo className="h-6 w-6" />
              <span className="font-outfit text-base font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#386BFF] to-[#7B2CFF]">
                Quizzy
              </span>
            </Link>

            <div className="space-y-1">
              <h5 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5" style={{ color: 'var(--text-heading)' }}>
                <Building2 className="h-3.5 w-3.5 text-secondary shrink-0" />
                <span>Quizzy Inc.</span>
              </h5>
              
              <a
                href="https://quizzy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline transition-colors"
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span>quizzy.com</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>

            <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'var(--text-muted)' }}>
              Interactive multiplayer battle platform for live quizzes, AI question generation, and instant participant analytics.
            </p>

            {/* Second Branch Notice Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/25 px-2.5 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-pulse shrink-0" />
              <span>We've Opened Our Second Branch</span>
            </div>
          </div>

          {/* Column 2: Head Office & Navigable Map Address */}
          <div className="space-y-3 text-left">
            <h4 className="font-outfit text-xs font-extrabold tracking-wide uppercase" style={{ color: 'var(--text-heading)' }}>
              Head Office & Contact
            </h4>

            {/* Clickable Navigable Address */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-3 rounded-xl bg-sky-100/70 dark:bg-white/5 border border-sky-200 dark:border-white/10 hover:border-sky-400 dark:hover:border-primary/40 hover:bg-sky-100 dark:hover:bg-white/10 transition-all text-left cursor-pointer shadow-sm"
              title="Quizzy Inc. Pune (Google Maps)"
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
                  href="mailto:support@quizzy.com"
                  className="inline-flex items-center gap-2.5 hover:text-primary transition-colors font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span>support@quizzy.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+13866883295"
                  className="inline-flex items-center gap-2.5 hover:text-primary transition-colors font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span>+1 386-688-3295</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-3 text-left">
            <h4 className="font-outfit text-xs font-extrabold tracking-wide uppercase" style={{ color: 'var(--text-heading)' }}>
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <li>
                <button
                  onClick={() => handleNavClick('#interactive-demo')}
                  className="group flex items-center gap-2 text-xs font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span className="text-xs">Play Interactive Demo</span>
                </button>
              </li>
              <li>
                <Link
                  to="/join"
                  className="group flex items-center gap-2 text-xs font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span className="text-xs">Join Game with PIN</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('#how-it-works')}
                  className="group flex items-center gap-2 text-xs font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span className="text-xs">How Quiz Hub Works</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('#pricing')}
                  className="group flex items-center gap-2 text-xs font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span className="text-xs">Pricing & Plans</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('#faq')}
                  className="group flex items-center gap-2 text-xs font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span className="text-xs">Help & FAQs</span>
                </button>
              </li>
              <li>
                <Link
                  to="/login"
                  className="group flex items-center gap-2 text-xs font-semibold hover:text-primary transition-colors text-left w-full cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                  <span className="text-xs">Host Login / Register</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Legal Row */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-center sm:text-left" style={{ color: 'var(--text-muted)' }}>
          <p>© {new Date().getFullYear()} Quizzy Inc. · Quizzy. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
            <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
            <a href="https://quizzy.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Quizzy
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
