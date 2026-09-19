import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldCheck, Lock, Camera, Trash2, Users, FileSpreadsheet,
  Eye, CheckCircle2, ArrowLeft, Mail, Building2, Sparkles, Database,
  Smartphone, Globe, Search, Printer, Share2, Copy, Download,
  ChevronDown, ChevronUp, SlidersHorizontal, KeyRound, FileText,
  Check, ExternalLink, Clock, RefreshCw, AlertTriangle, HeartHandshake,
  ArrowUp, Server, UserX, Cpu, Bell, CheckSquare, Zap, BookOpen, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import ThemeBackground from '../components/ThemeBackground';
import { useTheme } from '../context/ThemeContext';

export default function PrivacyPolicy() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';
  const location = useLocation();

  const lastUpdated = 'September 19, 2026';
  const effectiveDate = 'September 1, 2026';
  const version = 'v2.4.0';

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedSections, setExpandedSections] = useState({});
  const [activeSectionId, setActiveSectionId] = useState('overview');
  const [copiedSectionId, setCopiedSectionId] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Category definitions for quick filtering
  const categories = [
    { id: 'all', label: 'All Policies', count: 12 },
    { id: 'collection', label: 'Data Collection', count: 2 },
    { id: 'gameplay', label: 'Live Play & Camera', count: 2 },
    { id: 'usage', label: 'Usage & Analytics', count: 2 },
    { id: 'retention', label: 'Deletion & Rights', count: 2 },
    { id: 'security', label: 'Security & Cookies', count: 2 },
    { id: 'compliance', label: 'Students & Legal', count: 2 }
  ];

  // Key guarantees highlight badges
  const keyHighlights = [
    {
      icon: <Camera className="h-4 w-4 text-amber-500" />,
      title: '100% Client-Side QR Scanner',
      desc: 'Camera feeds are strictly processed inside your browser to read PINs. Zero images or video streams are saved or uploaded.'
    },
    {
      icon: <Eye className="h-4 w-4 text-emerald-500" />,
      title: 'Zero Advertising Trackers',
      desc: 'No tracking pixels, third-party analytics trackers, or commercial profiling. Your personal data is never sold.'
    },
    {
      icon: <Trash2 className="h-4 w-4 text-red-500" />,
      title: '1-Click Cascade Data Purge',
      desc: 'Deleting your host account immediately and permanently purges all quizzes, rooms, participant logs, and analytics.'
    },
    {
      icon: <UserX className="h-4 w-4 text-sky-500" />,
      title: 'No Registration for Students',
      desc: 'Players join live games with just a 6-digit PIN and nickname. No account creation, password, or student profile required.'
    }
  ];

  // Full exhaustive list of Privacy Policies
  const allPolicySections = useMemo(() => [
    {
      id: 'overview',
      category: 'collection',
      number: '1',
      icon: <Sparkles className="h-5 w-5 text-primary" />,
      title: 'Platform Overview & Scope',
      badge: 'Core Scope',
      summary: 'Describes Quizzy / QuizForge real-time multiplayer architecture and who this policy protects.',
      content: (
        <div className="space-y-4">
          <p>
            Welcome to <strong>Quizzy (QuizForge)</strong>. We provide an interactive, real-time multiplayer quiz and trivia platform tailored for educators, academic institutions, enterprise trainers, event hosts, and players worldwide.
          </p>
          <p>
            This Privacy Policy governs your use of our web application, Socket.IO live game rooms, QR code scanning engines, host dashboard, and client-side analytical report generators (PDF, Excel, Word). It outlines with complete transparency what information we process, how we secure it, and your full ownership over your data.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className={`p-3.5 rounded-xl border text-xs ${
              isLight ? 'bg-sky-50/70 border-sky-200 text-sky-950' : 'bg-sky-950/20 border-sky-500/20 text-sky-200'
            }`}>
              <strong className="block font-bold text-xs mb-1 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-secondary" />
                For Registered Hosts & Creators
              </strong>
              Full control to build quizzes, schedule live sessions, manage questions, and permanently purge their account and history at any time.
            </div>
            <div className={`p-3.5 rounded-xl border text-xs ${
              isLight ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200'
            }`}>
              <strong className="block font-bold text-xs mb-1 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                For Live Game Participants
              </strong>
              Frictionless anonymous participation via room PINs without mandatory registration, long-term profiling, or persistent tracking.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'collection',
      category: 'collection',
      number: '2',
      icon: <Database className="h-5 w-5 text-secondary" />,
      title: 'Information We Collect',
      badge: 'Data Types',
      summary: 'Details data gathered across host accounts, guest participants, quiz assets, and gameplay telemetry.',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-sm mb-1.5 flex items-center gap-2 text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              A. Registered Host & Moderator Accounts
            </h4>
            <p className="text-xs leading-relaxed text-muted">
              When you create an account to host quizzes, we collect your <strong>full name</strong>, <strong>email address</strong>, and encrypted credentials. Passwords and security recovery answers are stored using one-way cryptographic salted hashing (bcrypt with cost factor 10). We never store raw passwords or plain-text credentials.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-1.5 flex items-center gap-2 text-secondary">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              B. Game Participants & Guest Players
            </h4>
            <p className="text-xs leading-relaxed text-muted">
              Participants join live games without registering for a permanent account. When entering a game session using a 6-digit PIN, players provide a <strong>nickname</strong>, optional <strong>full name</strong>, optional <strong>mobile number</strong>, and select a visual <strong>avatar</strong>. This information is used strictly during the active game session to identify players on the leaderboard and generate performance reports for the host.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-1.5 flex items-center gap-2 text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              C. Quiz Content, Questions & Media Assets
            </h4>
            <p className="text-xs leading-relaxed text-muted">
              We store questions, multiple-choice options, correct answer keys, configurable time limits, custom background photography selections, and styling attributes that you author in our Quiz Creator.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-1.5 flex items-center gap-2 text-indigo-400">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              D. Live Telemetry & Scoring Velocity Records
            </h4>
            <p className="text-xs leading-relaxed text-muted">
              During live games, we record answer submissions, correctness flags, and millisecond-level response speed timestamps. This telemetry is processed by our Kahoot-style velocity scoring engine to compute scores, tie-breakers, and post-game analytics.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'camera',
      category: 'gameplay',
      number: '3',
      icon: <Camera className="h-5 w-5 text-amber-500" />,
      title: 'Camera Usage & 100% Client-Side QR Scanning',
      badge: 'Zero Upload Guarantee',
      summary: 'Explains how the built-in QR Code scanner works entirely client-side without transmitting camera feeds.',
      content: (
        <div className="space-y-3">
          <p>
            Our player join interface includes an optional <strong>camera-based QR Code Scanner</strong> that allows players to quickly scan the host screen to join a game room without manually typing the 6-digit PIN.
          </p>

          <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
            isLight ? 'bg-amber-50/90 border-amber-200 text-amber-950' : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
          }`}>
            <div className="font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Strict Camera Privacy & Security Guarantee:</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 pl-1 opacity-90">
              <li><strong>Zero Video Storage or Transmission:</strong> Video frames from your camera are decoded entirely in real time within your local browser memory using the HTML5 QR Code API.</li>
              <li><strong>No Facial or Biometric Data:</strong> We do not capture, record, analyze, or store facial features, background scenes, or biometrics.</li>
              <li><strong>Instant Sensor Release:</strong> As soon as a valid 6-digit PIN is recognized or you close the scanner modal, the camera hardware track is immediately stopped and released.</li>
              <li><strong>Fully Optional:</strong> Players can always manually type the 6-digit PIN if they prefer not to grant camera permissions.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'websockets',
      category: 'gameplay',
      number: '4',
      icon: <Zap className="h-5 w-5 text-sky-400" />,
      title: 'Real-Time WebSockets & Ephemeral Sessions',
      badge: 'Live Architecture',
      summary: 'How real-time multiplayer data flows between host lobbies, player devices, and Socket.IO rooms.',
      content: (
        <div className="space-y-3">
          <p>
            Live quiz battles operate over high-performance <strong>WebSockets (Socket.IO)</strong> to deliver instantaneous question broadcast, synchronized countdown timers, live answer submissions, and dynamic leaderboard animations.
          </p>
          <ul className="space-y-2 text-xs leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Temporary Room Buffers:</strong> Active game state (current question index, connected socket IDs, player streak counters) exists in ephemeral memory during the session.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Reconnection Grace Period:</strong> If a player briefly drops Wi-Fi or cellular signal, their socket session can re-attach using their 6-digit PIN and nickname without loss of points.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Session Conclusion:</strong> Once the host ends the game or navigates to the final podium, active socket room memory is closed and archived into the host's private analytics ledger.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'usage',
      category: 'usage',
      number: '5',
      icon: <Users className="h-5 w-5 text-sky-500" />,
      title: 'How We Use Collected Information',
      badge: 'Purpose of Processing',
      summary: 'Legitimate purposes for processing data, from scoring calculations to multi-format report exports.',
      content: (
        <div className="space-y-3">
          <p className="text-xs">
            We use collected data solely for the following legitimate technical and functional purposes:
          </p>
          <ul className="space-y-2 text-xs leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Multiplayer Game Orchestration:</strong> Establishing real-time rooms, synchronizing timers, delivering questions, and updating live scoreboards.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Scoring Algorithms & Fair Play:</strong> Calculating accuracy scores and speed-weighted bonus points (up to 1,000 velocity points) while detecting duplicate joins or spam bots.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Analytics & Document Exports:</strong> Enabling hosts to view detailed question breakdown stats and download reports locally in PDF, Excel (<code>.xlsx</code>), and Word (<code>.docx</code>) formats.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Classroom LAN & IPv4 Auto-Resolution:</strong> Detecting host local IPv4 addresses to make local offline classroom hosting seamless.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'deletion',
      category: 'retention',
      number: '6',
      icon: <Trash2 className="h-5 w-5 text-red-500" />,
      title: 'Account Deletion & Permanent Data Purge',
      badge: 'Full Data Control',
      summary: 'Step-by-step instructions on self-serve account deletion and our permanent cascading erasure process.',
      content: (
        <div className="space-y-3">
          <p>
            We believe in complete user data sovereignty. Registered hosts can permanently delete their account at any time directly through the application without needing to contact customer support.
          </p>
          <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
            isLight ? 'bg-red-50/80 border-red-200 text-red-950' : 'bg-red-950/30 border-red-500/30 text-red-200'
          }`}>
            <p className="font-bold text-sm flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <span>Permanent Cascade Deletion Guarantee:</span>
            </p>
            <p>
              When you confirm account deletion from <strong>Dashboard &gt; Host Profile &gt; Delete Account</strong> by verifying your current password, our database immediately and irreversibly purges:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 opacity-90">
              <li>Your host profile, full name, email, and password hashes</li>
              <li>All quizzes, questions, choices, custom themes, and assets you created</li>
              <li>All active, past, and archived game sessions hosted under your account</li>
              <li>All participant records, student names, phone numbers, and leaderboard scores</li>
              <li>All analytics records, answer histories, and exported metrics</li>
            </ul>
            <p className="text-[11px] pt-1 font-semibold opacity-80">
              * Note: Cascade deletion is immediate and cannot be undone. We do not retain hidden backups of deleted accounts.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'cookies',
      category: 'security',
      number: '7',
      icon: <Lock className="h-5 w-5 text-indigo-400" />,
      title: 'Cookies, LocalStorage & State Management',
      badge: 'Essential Only',
      summary: 'Breakdown of browser localStorage keys used for authentication and theme preferences.',
      content: (
        <div className="space-y-3">
          <p>
            Quizzy operates with a strict "Essential Only" storage philosophy. We use browser <code>localStorage</code> strictly for functional session handling:
          </p>
          <div className="overflow-x-auto">
            <table className={`w-full text-xs text-left border rounded-xl overflow-hidden ${
              isLight ? 'border-gray-200 bg-gray-50/50' : 'border-white/10 bg-white/5'
            }`}>
              <thead className={isLight ? 'bg-gray-100 text-gray-800' : 'bg-white/10 text-white'}>
                <tr>
                  <th className="p-2.5 font-bold">Key Name</th>
                  <th className="p-2.5 font-bold">Purpose</th>
                  <th className="p-2.5 font-bold">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                <tr>
                  <td className="p-2.5 font-mono text-primary font-bold">token</td>
                  <td className="p-2.5">Encrypted JWT session token for authenticated hosts</td>
                  <td className="p-2.5">Until logout</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-secondary font-bold">user</td>
                  <td className="p-2.5">Basic cached profile details (name, email) for host header</td>
                  <td className="p-2.5">Until logout</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-emerald-400 font-bold">quizforge_mode</td>
                  <td className="p-2.5">Remembers your preferred theme (Dark Mode / Light Mode)</td>
                  <td className="p-2.5">Persistent</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-amber-400 font-bold">temp_guest_pin</td>
                  <td className="p-2.5">Temporary session token for guest players during active game</td>
                  <td className="p-2.5">Game duration</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted">
            We do not use advertising tracking cookies, third-party behavioral profiling scripts, or invasive data brokers.
          </p>
        </div>
      )
    },
    {
      id: 'students',
      category: 'compliance',
      number: '8',
      icon: <Shield className="h-5 w-5 text-emerald-400" />,
      title: 'Student & Minor Privacy (COPPA & FERPA Compliance)',
      badge: 'Education Safe',
      summary: 'Commitment to safeguarding students and minors in K-12 and higher education environments.',
      content: (
        <div className="space-y-3">
          <p>
            Quizzy is widely used in classrooms and educational environments. We have intentionally structured our player workflow to comply with the principles of the <strong>Children's Online Privacy Protection Act (COPPA)</strong> and the <strong>Family Educational Rights and Privacy Act (FERPA)</strong>.
          </p>
          <ul className="space-y-2 text-xs leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>No Student Registration:</strong> Students never create an account, provide an email address, or set a password to play.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Educator Governance:</strong> The educator or hosting institution maintains full authority over quiz questions, session access, and player entry.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Zero Commercial Marketing:</strong> Students are never shown behavioral advertisements, promotional pop-ups, or third-party sponsorship tracking.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'security',
      category: 'security',
      number: '9',
      icon: <KeyRound className="h-5 w-5 text-primary" />,
      title: 'Data Security, Cryptography & Cloud Infrastructure',
      badge: 'Enterprise Grade',
      summary: 'Technical architecture safeguards, encryption in transit and at rest, and cloud security.',
      content: (
        <div className="space-y-3">
          <p>
            We implement comprehensive technical, administrative, and physical measures to safeguard your information against unauthorized access, loss, or alteration:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border text-xs ${
              isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'
            }`}>
              <h5 className="font-bold mb-1 flex items-center gap-1.5 text-primary">
                <Lock className="h-3.5 w-3.5" />
                Encryption in Transit & At Rest
              </h5>
              <p className="text-muted leading-relaxed text-[11px]">
                All network communication is encrypted with TLS 1.3 / HTTPS. Database records in MongoDB Atlas are encrypted at rest using AES-256 standards.
              </p>
            </div>
            <div className={`p-3 rounded-xl border text-xs ${
              isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'
            }`}>
              <h5 className="font-bold mb-1 flex items-center gap-1.5 text-secondary">
                <KeyRound className="h-3.5 w-3.5" />
                Salted Cryptographic Hashing
              </h5>
              <p className="text-muted leading-relaxed text-[11px]">
                Passwords and password recovery security answers are secured using salted one-way bcrypt hashing. Even database administrators cannot view plain text passwords.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sharing',
      category: 'usage',
      number: '10',
      icon: <Globe className="h-5 w-5 text-emerald-500" />,
      title: 'Information Sharing & Third-Party Disclosure',
      badge: 'Zero Selling',
      summary: 'Clear pledge regarding third-party vendors and zero commercial data monetization.',
      content: (
        <div className="space-y-3">
          <div className={`p-3.5 rounded-xl border text-xs font-semibold ${
            isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
          }`}>
            We do NOT sell, rent, license, or monetize your personal information, quiz contents, or student records to any third party or marketing network.
          </div>
          <p className="text-xs leading-relaxed text-muted">
            Information is only processed through trusted infrastructure providers strictly necessary to operate our service:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-muted pl-1">
            <li><strong>Database Hosting:</strong> MongoDB Atlas (AWS/GCP secure clusters with SOC 2, ISO 27001 certifications).</li>
            <li><strong>Host-Initiated Sharing:</strong> When a host voluntarily shares a game invite URL or PIN via messaging channels (e.g. WhatsApp, Slack, Teams).</li>
          </ul>
        </div>
      )
    },
    {
      id: 'rights',
      category: 'retention',
      number: '11',
      icon: <ShieldCheck className="h-5 w-5 text-sky-400" />,
      title: 'Your Legal Rights (GDPR & CCPA Compliance)',
      badge: 'Global Rights',
      summary: 'Rights to access, portability, rectification, restriction, and human review under international law.',
      content: (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed">
            Regardless of your geographical location, Quizzy grants all users the following fundamental privacy rights:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
              <strong>Right to Access:</strong> View all quizzes, past sessions, and scores via your host dashboard.
            </div>
            <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
              <strong>Right to Portability:</strong> Export game results anytime in open formats (.xlsx, .docx, PDF).
            </div>
            <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
              <strong>Right to Rectification:</strong> Edit your name, password, or quiz questions at any moment.
            </div>
            <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
              <strong>Right to Erasure:</strong> Permanently wipe your account and all related records with 1 click.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      category: 'compliance',
      number: '12',
      icon: <Building2 className="h-5 w-5 text-primary" />,
      title: 'Contact Information & Grievance Officer',
      badge: 'Official Support',
      summary: 'Official headquarters address, dedicated privacy support email, and response SLAs.',
      content: (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-muted">
            If you have questions, feedback, or data privacy requests regarding this policy, our Data Protection & Grievance team is ready to assist you:
          </p>
          <div className={`p-4 rounded-xl border space-y-2.5 text-xs ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="font-bold text-sm flex items-center gap-2 text-primary">
                <Building2 className="h-4 w-4" />
                Quizzy Inc. (Headquarters)
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                isLight ? 'bg-primary/10 text-primary' : 'bg-primary/20 text-primary-light'
              }`}>
                Response SLA &lt; 48 Hours
              </span>
            </div>
            <p className="text-muted leading-relaxed">
              305, City Vista, Kharadi, Pune, Maharashtra 411014, India
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-semibold">
              <a
                href="mailto:info@fouriseindia.com"
                className="inline-flex items-center gap-1.5 text-secondary hover:underline"
              >
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>info@fouriseindia.com</span>
              </a>
              <a
                href="tel:+919527605805"
                className="inline-flex items-center gap-1.5 text-muted hover:text-primary transition-colors"
              >
                <span>+91 95276 05805</span>
              </a>
            </div>
          </div>
        </div>
      )
    }
  ], [isLight]);

  // Filter policies based on category tab & search keyword
  const filteredSections = useMemo(() => {
    return allPolicySections.filter(section => {
      const matchesCategory = activeCategory === 'all' || section.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const titleMatch = section.title.toLowerCase().includes(q);
      const summaryMatch = section.summary?.toLowerCase().includes(q);
      const badgeMatch = section.badge?.toLowerCase().includes(q);
      return titleMatch || summaryMatch || badgeMatch;
    });
  }, [allPolicySections, activeCategory, searchQuery]);

  // Initialize expanded state for all sections on mount (open by default for fast scanning)
  useEffect(() => {
    const initial = {};
    allPolicySections.forEach(s => {
      initial[s.id] = true;
    });
    setExpandedSections(initial);
  }, [allPolicySections]);

  // Scroll listener for sticky active section & back to top
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      // Detect current visible section
      for (const section of allPolicySections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180 && rect.bottom >= 180) {
            setActiveSectionId(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [allPolicySections]);

  // Handle accordion toggle
  const toggleSection = (id) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Expand all / Collapse all toggle
  const areAllExpanded = useMemo(() => {
    return filteredSections.every(s => expandedSections[s.id]);
  }, [filteredSections, expandedSections]);

  const toggleExpandAll = () => {
    const newState = !areAllExpanded;
    const updated = { ...expandedSections };
    filteredSections.forEach(s => {
      updated[s.id] = newState;
    });
    setExpandedSections(updated);
    toast.success(newState ? 'All sections expanded' : 'All sections collapsed', { duration: 1500 });
  };

  // Copy direct link to section
  const handleCopySectionLink = (id, title) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSectionId(id);
      toast.success(`Copied link to "${title}"`);
      setTimeout(() => setCopiedSectionId(null), 2500);
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  // Copy full page link
  const handleSharePage = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success('Privacy policy link copied to clipboard!');
    });
  };

  // Trigger print dialog
  const handlePrint = () => {
    // Ensure all sections are expanded before printing
    const allOpen = {};
    allPolicySections.forEach(s => { allOpen[s.id] = true; });
    setExpandedSections(allOpen);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Download policy as formatted Markdown file
  const handleDownloadMarkdown = () => {
    let md = `# Quizzy (QuizForge) - Privacy Policy\n`;
    md += `**Last Updated:** ${lastUpdated} | **Effective Date:** ${effectiveDate} | **Version:** ${version}\n\n`;
    md += `Official Policy Document · Quizzy Inc.\n\n`;
    md += `---\n\n`;

    allPolicySections.forEach(s => {
      md += `## ${s.number}. ${s.title}\n`;
      md += `*${s.summary}*\n\n`;
    });

    md += `\n---\nContact: info@fouriseindia.com | +91 95276 05805 | 305, City Vista, Kharadi, Pune 411014, India\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Quizzy_Privacy_Policy_${version}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded Privacy Policy document');
  };

  // Scroll smoothly to section
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSectionId(id);
      // Ensure target section is expanded
      setExpandedSections(prev => ({ ...prev, [id]: true }));
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatedPage>
      <ThemeBackground>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-left">

          {/* Top Breadcrumb & Quick Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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

            {/* Quick Action Bar (Print, Share, Download) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isLight
                    ? 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm'
                    : 'border-white/10 text-gray-300 bg-white/5 hover:bg-white/10'
                }`}
                title="Print or Save as PDF"
              >
                <Printer className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Print / PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isLight
                    ? 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm'
                    : 'border-white/10 text-gray-300 bg-white/5 hover:bg-white/10'
                }`}
                title="Download Policy as Markdown"
              >
                <Download className="h-3.5 w-3.5 text-secondary" />
                <span className="hidden sm:inline">Export Text</span>
              </button>

              <button
                type="button"
                onClick={handleSharePage}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isLight
                    ? 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm'
                    : 'border-white/10 text-gray-300 bg-white/5 hover:bg-white/10'
                }`}
                title="Copy Privacy Policy URL"
              >
                <Share2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>

          {/* Hero Header Section */}
          <div className="relative rounded-3xl p-6 sm:p-8 mb-8 border backdrop-blur-xl overflow-hidden shadow-xl"
            style={{
              background: isLight
                ? 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,249,255,0.9))'
                : 'linear-gradient(135deg, rgba(15,15,26,0.85), rgba(8,8,12,0.95))',
              borderColor: isLight ? 'rgba(186, 230, 253, 0.8)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Background Ambient Glows */}
            <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs font-extrabold text-primary">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Privacy, Data Protection & Trust</span>
                </div>
                <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  {version} · Active
                </div>
              </div>

              <div className="space-y-2">
                <h1 className={`font-outfit text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>
                  Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary">Policy</span>
                </h1>
                <p className={`text-xs sm:text-sm leading-relaxed max-w-3xl ${
                  isLight ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  Transparent rules on how Quizzy safeguards your identity, protects classroom participants, processes camera QR scans strictly client-side, and gives you irreversible 1-click account deletion.
                </p>
              </div>

              {/* Metadata Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-muted border-t border-black/5 dark:border-white/5 font-medium">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Last updated: <strong>{lastUpdated}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Effective: <strong>{effectiveDate}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-secondary" />
                  <span>Global Scope (GDPR, CCPA, COPPA)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Privacy Highlights Grid */}
          <div className="mb-8">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Key Guarantees at a Glance</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {keyHighlights.map((hl, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border transition-all ${
                    isLight
                      ? 'bg-white border-gray-200/80 hover:border-sky-300 shadow-sm'
                      : 'bg-white/5 border-white/10 hover:border-primary/40 shadow-md'
                  }`}
                >
                  <div className="p-2 w-fit rounded-xl bg-primary/10 border border-primary/20 mb-2.5">
                    {hl.icon}
                  </div>
                  <h3 className={`font-outfit font-bold text-xs mb-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {hl.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-muted">
                    {hl.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Search & Filter Controls */}
          <div className={`p-4 sm:p-5 rounded-2xl border mb-8 shadow-sm ${
            isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Search input with live clear */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search policies (e.g. camera, delete account, cookies, student, export, bcrypt)..."
                  className={`w-full rounded-xl border pl-10 pr-9 py-2.5 text-xs transition-all focus:outline-none focus:ring-2 ${
                    isLight
                      ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-sky-400/40 focus:border-sky-400'
                      : 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:bg-black/60 focus:ring-primary/40 focus:border-primary'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-white px-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Expand / Collapse All Button */}
              <button
                type="button"
                onClick={toggleExpandAll}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                  isLight
                    ? 'border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 shadow-sm'
                    : 'border-white/10 text-gray-300 bg-white/5 hover:bg-white/10'
                }`}
              >
                {areAllExpanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5 text-primary" />
                    <span>Collapse All Sections</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5 text-primary" />
                    <span>Expand All Sections</span>
                  </>
                )}
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted mr-1.5 flex items-center gap-1">
                <SlidersHorizontal className="h-3 w-3" />
                Filter:
              </span>
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                        : isLight
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Filter Results Counter */}
            {(searchQuery || activeCategory !== 'all') && (
              <div className="mt-3 text-[11px] text-muted flex items-center justify-between">
                <span>
                  Showing <strong>{filteredSections.length}</strong> of {allPolicySections.length} policy sections
                  {searchQuery && <> matching "<strong>{searchQuery}</strong>"</>}
                </span>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="text-primary hover:underline font-bold"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Main Layout: Sticky Sidebar (Desktop) + Policy Cards List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Table of Contents (Sticky on Desktop) */}
            <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
              <div className={`p-5 rounded-2xl border ${
                isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/10 shadow-lg'
              }`}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5 dark:border-white/5">
                  <h3 className="font-outfit font-bold text-xs uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span>Table of Contents</span>
                  </h3>
                  <span className="text-[10px] font-bold text-muted bg-primary/10 px-2 py-0.5 rounded-full text-primary">
                    {filteredSections.length} Topics
                  </span>
                </div>

                <nav className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                  {filteredSections.map((sec) => {
                    const isCurrent = activeSectionId === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => scrollToSection(sec.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isCurrent
                            ? 'bg-primary/15 text-primary border border-primary/30 font-bold'
                            : isLight
                            ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="truncate flex items-center gap-2">
                          <span className="text-[11px] opacity-70">{sec.number}.</span>
                          <span className="truncate">{sec.title.replace(/^\d+\.\s*/, '')}</span>
                        </span>
                        {sec.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono shrink-0">
                            {sec.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Contact Grievance Widget */}
              <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                isLight ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950' : 'bg-primary/10 border-primary/20 text-gray-300'
              }`}>
                <div className="font-bold flex items-center gap-1.5 text-primary">
                  <Mail className="h-4 w-4" />
                  <span>Privacy Inquiries & DPO</span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted">
                  Have specific compliance questions or need customized data agreements for your educational institution?
                </p>
                <a
                  href="mailto:info@fouriseindia.com"
                  className="inline-flex items-center gap-1 font-bold text-secondary hover:underline text-xs"
                >
                  <span>Contact Data Protection Officer</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Right Column: Exhaustive Policy Accordion Cards */}
            <div className="lg:col-span-8 space-y-5">
              {filteredSections.length === 0 ? (
                <div className={`p-10 rounded-2xl border text-center space-y-3 ${
                  isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'
                }`}>
                  <Search className="h-8 w-8 text-muted mx-auto opacity-50" />
                  <h3 className={`font-outfit font-bold text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    No matching policy sections found
                  </h3>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    We couldn't find any policy matching "{searchQuery}". Try searching for terms like "camera", "delete", "student", or "cookies".
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                    className="btn-premium btn-primary-gradient px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                filteredSections.map((section, idx) => {
                  const isExpanded = !!expandedSections[section.id];
                  const isCopied = copiedSectionId === section.id;

                  return (
                    <motion.section
                      id={section.id}
                      key={section.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isLight
                          ? 'bg-white border-gray-200/90 shadow-sm hover:border-gray-300'
                          : 'glass-panel border-white/10 shadow-lg hover:border-white/20'
                      }`}
                    >
                      {/* Section Header / Accordion Trigger */}
                      <div
                        onClick={() => toggleSection(section.id)}
                        className={`p-5 sm:p-6 flex items-start justify-between gap-3 cursor-pointer select-none transition-colors ${
                          isLight ? 'hover:bg-gray-50/80' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                            isLight ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10'
                          }`}>
                            {section.icon}
                          </div>

                          <div className="space-y-1 text-left">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-extrabold text-primary">
                                Section {section.number}
                              </span>
                              {section.badge && (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border ${
                                  isLight
                                    ? 'bg-sky-50 border-sky-200 text-sky-700'
                                    : 'bg-white/5 border-white/10 text-secondary'
                                }`}>
                                  {section.badge}
                                </span>
                              )}
                            </div>

                            <h2 className={`font-outfit font-extrabold text-base sm:text-lg ${
                              isLight ? 'text-gray-900' : 'text-white'
                            }`}>
                              {section.title}
                            </h2>

                            {section.summary && (
                              <p className="text-xs text-muted leading-relaxed hidden sm:block">
                                {section.summary}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Expand/Collapse Chevron & Copy Link */}
                        <div className="flex items-center gap-2 shrink-0 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopySectionLink(section.id, section.title);
                            }}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isCopied
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : isLight
                                ? 'border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                            title="Copy link to this section"
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>

                          <div className={`p-1.5 rounded-lg text-muted transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-primary' : ''
                          }`}>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      {/* Expandable Section Content Body */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                          >
                            <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-black/5 dark:border-white/5 text-sm leading-relaxed">
                              {section.content}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.section>
                  );
                })
              )}
            </div>

          </div>

          {/* Bottom Action & Help Callout Banner */}
          <div className={`mt-12 p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-lg ${
            isLight
              ? 'bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 border-sky-200'
              : 'bg-gradient-to-br from-primary/10 via-black to-secondary/10 border-primary/20'
          }`}>
            <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
              <HeartHandshake className="h-6 w-6" />
            </div>

            <h3 className={`font-outfit font-extrabold text-xl sm:text-2xl ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Have Questions Regarding Your Data or Privacy?
            </h3>
            
            <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
              Our dedicated privacy compliance team is here to assist educators, students, and quiz organizers with data inquiries, deletion verifications, or school-specific security agreements.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/register"
                className="btn-premium btn-primary-gradient px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer hover:scale-105 transition-all"
              >
                Create Free Host Account
              </Link>
              <Link
                to="/join"
                className={`px-5 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  isLight
                    ? 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50 shadow-sm'
                    : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                Join Game with 6-Digit PIN
              </Link>
              <Link
                to="/faq"
                className={`px-5 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  isLight
                    ? 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50 shadow-sm'
                    : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                FAQ Knowledge Base
              </Link>
            </div>
          </div>

          {/* Floating Back to Top Button */}
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-primary text-white shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Back to Top"
            >
              <ArrowUp className="h-5 w-5" />
            </motion.button>
          )}

        </div>
      </ThemeBackground>
    </AnimatedPage>
  );
}
