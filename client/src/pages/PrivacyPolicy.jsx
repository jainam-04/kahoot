import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Lock, Camera, Trash2, Users, FileSpreadsheet,
  Eye, HelpCircle, CheckCircle2, ArrowLeft, Mail, Building2,
  Sparkles, Database, Smartphone, Globe
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ThemeBackground from '../components/ThemeBackground';
import { useTheme } from '../context/ThemeContext';

export default function PrivacyPolicy() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const lastUpdated = 'September 18, 2026';

  const sections = [
    {
      id: 'overview',
      icon: <Sparkles className="h-5 w-5 text-primary" />,
      title: '1. Platform Overview',
      content: (
        <div className="space-y-3">
          <p>
            Welcome to <strong>Quizzy (QuizForge)</strong>. We provide an interactive, real-time multiplayer quiz platform designed for educators, organizations, hosts, and students.
          </p>
          <p>
            This Privacy Policy explains how we collect, handle, protect, and delete your data across our web application, real-time game rooms, and analytics reporting tools.
          </p>
        </div>
      )
    },
    {
      id: 'collection',
      icon: <Database className="h-5 w-5 text-secondary" />,
      title: '2. Information We Collect',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-sm mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Host & Moderator Accounts
            </h4>
            <p className="text-xs leading-relaxed">
              When creating an account to host quizzes, we collect your <strong>full name</strong>, <strong>email address</strong>, and encrypted credentials. Passwords and security recovery answers are stored using one-way cryptographic salted hashing (bcrypt). We never store raw passwords.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              Game Participants & Guest Players
            </h4>
            <p className="text-xs leading-relaxed">
              Participants join live games without registering for an account. When entering a game session using a 6-digit PIN, players provide a <strong>nickname</strong>, <strong>full name</strong>, <strong>mobile number</strong>, and select an <strong>avatar</strong>. This information is used strictly during the active game session to identify players on the leaderboard and generate performance reports for the host.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Quiz Content & Gameplay Records
            </h4>
            <p className="text-xs leading-relaxed">
              We store questions, answer options, time limits, custom background styling, and answers submitted during live games, including speed measurements (milliseconds taken) used to calculate Kahoot-style bonus scores.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'camera',
      icon: <Camera className="h-5 w-5 text-amber-500" />,
      title: '3. Camera Usage & QR Code Scanning',
      content: (
        <div className="space-y-3">
          <p>
            Our player join screen includes an optional <strong>camera-based QR Code Scanner</strong> to scan room PINs displayed on the host screen.
          </p>
          <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
          }`}>
            <p className="font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
              Camera Privacy Guarantee:
            </p>
            Camera feeds are processed entirely client-side in real time within your browser solely to detect the 6-digit PIN. No photographs, video streams, or biometric data are ever captured, transmitted, or stored on our servers.
          </div>
        </div>
      )
    },
    {
      id: 'usage',
      icon: <Users className="h-5 w-5 text-sky-500" />,
      title: '4. How We Use Information',
      content: (
        <ul className="space-y-2 text-xs leading-relaxed">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span><strong>Multiplayer Gameplay:</strong> Powering real-time WebSocket communication for room lobbies, question delivery, timers, and dynamic leaderboards.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span><strong>Scoring & Tie-Breaking:</strong> Computing score tallies and velocity-weighted bonus points for correct answers.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span><strong>Analytics & Export:</strong> Generating host analytics and client-side downloadable reports in PDF, Excel, and Word formats.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span><strong>Network Hosting:</strong> Detecting host local IPv4 addresses to make local classroom / LAN hosting seamless.</span>
          </li>
        </ul>
      )
    },
    {
      id: 'deletion',
      icon: <Trash2 className="h-5 w-5 text-red-500" />,
      title: '5. Account Deletion & Data Retention',
      content: (
        <div className="space-y-3">
          <p>
            We believe in complete data ownership. Registered hosts can permanently delete their account at any time from their <strong>Dashboard &gt; Host Profile &gt; Delete Account</strong>.
          </p>
          <div className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
            isLight ? 'bg-red-50 border-red-200 text-red-900' : 'bg-red-950/30 border-red-500/30 text-red-200'
          }`}>
            <p className="font-bold">Permanent Cascade Deletion:</p>
            <p>
              Upon entering your current password to confirm deletion, our system immediately and permanently purges:
            </p>
            <ul className="list-disc list-inside space-y-0.5 pl-1 opacity-90 text-[11px]">
              <li>Your user profile and credentials</li>
              <li>All quizzes and custom question banks you authored</li>
              <li>All active and archived game sessions hosted under your account</li>
              <li>All participant records, leaderboards, and exported session analytics</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'storage',
      icon: <Lock className="h-5 w-5 text-indigo-500" />,
      title: '6. Storage, Cookies & Local State',
      content: (
        <div className="space-y-3">
          <p>
            We use browser <code>localStorage</code> solely for essential technical functions:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs pl-1">
            <li><strong>Authentication:</strong> Storing JWT session tokens to keep hosts securely signed in.</li>
            <li><strong>Guest Identity:</strong> Retaining guest nicknames temporarily during active game sessions.</li>
            <li><strong>User Interface:</strong> Remembering your Dark or Light theme choice (<code>quizforge_mode</code>).</li>
          </ul>
          <p className="text-xs">
            We do not use tracking cookies, advertising trackers, or third-party behavioral profiling scripts.
          </p>
        </div>
      )
    },
    {
      id: 'sharing',
      icon: <Globe className="h-5 w-5 text-emerald-500" />,
      title: '7. Information Sharing & Third Parties',
      content: (
        <div className="space-y-2 text-xs leading-relaxed">
          <p>
            We do not sell, rent, or monetize your personal information or quiz contents. Data is never shared with third parties except:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li><strong>Host-Initiated Sharing:</strong> When a host chooses to share an invite link through WhatsApp or a local network URL.</li>
            <li><strong>Infrastructure Providers:</strong> Secure database storage (MongoDB Atlas) adhering to high encryption standards.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'contact',
      icon: <Building2 className="h-5 w-5 text-primary" />,
      title: '8. Contact & Privacy Inquiries',
      content: (
        <div className="space-y-2 text-xs leading-relaxed">
          <p>
            If you have questions about this Privacy Policy or your data rights, please contact our team:
          </p>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
            <p className="font-bold flex items-center gap-2 text-primary">
              <Building2 className="h-4 w-4" />
              Quizzy Inc.
            </p>
            <p className="text-muted">305, City Vista, Kharadi, Pune, Maharashtra 411014, India</p>
            <p className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <a href="mailto:support@quizzy.com" className="text-secondary hover:underline">
                support@quizzy.com
              </a>
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <AnimatedPage>
      <ThemeBackground>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-left">
          
          {/* Top Navigation / Breadcrumb */}
          <div className="mb-8">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isLight
                  ? 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm'
                  : 'border-white/10 text-gray-300 bg-white/5 hover:bg-white/10'
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Hero Header */}
          <div className="text-left space-y-3 mb-10 pb-8 border-b border-black/10 dark:border-white/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs font-bold text-primary">
              <Shield className="h-3.5 w-3.5" />
              <span>Privacy & Trust</span>
            </div>
            
            <h1 className={`font-outfit text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              Privacy Policy
            </h1>

            <p className={`text-sm leading-relaxed max-w-2xl ${
              isLight ? 'text-gray-600' : 'text-gray-400'
            }`}>
              How Quizzy protects your identity, safeguards live game sessions, respects camera permissions, and provides full data control.
            </p>

            <div className="text-xs text-muted font-medium pt-1">
              Last updated: {lastUpdated}
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-6">
            {sections.map((section, idx) => (
              <motion.section
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`rounded-2xl p-6 sm:p-7 border transition-all ${
                  isLight
                    ? 'bg-white border-gray-200/80 shadow-sm'
                    : 'glass-panel border-white/5 shadow-lg'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl border ${
                    isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'
                  }`}>
                    {section.icon}
                  </div>
                  <h2 className={`font-outfit font-extrabold text-lg sm:text-xl ${
                    isLight ? 'text-gray-900' : 'text-white'
                  }`}>
                    {section.title}
                  </h2>
                </div>

                <div className={`text-sm leading-relaxed ${
                  isLight ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  {section.content}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Bottom Callout */}
          <div className={`mt-10 p-6 rounded-2xl border text-center space-y-3 ${
            isLight
              ? 'bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-100'
              : 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20'
          }`}>
            <h3 className={`font-outfit font-bold text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Questions or Data Requests?
            </h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              Our support team is available to assist you with any questions regarding your account, quizzes, or data deletion requests.
            </p>
            <div className="pt-1 flex items-center justify-center gap-4">
              <Link
                to="/register"
                className="btn-premium btn-primary-gradient px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md"
              >
                Create Free Host Account
              </Link>
              <Link
                to="/join"
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                  isLight ? 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                Join Live Quiz
              </Link>
            </div>
          </div>

        </div>
      </ThemeBackground>
    </AnimatedPage>
  );
}
