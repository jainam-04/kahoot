import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, ShieldCheck, Scale, AlertCircle, Trash2,
  Lock, ArrowLeft, Building2, CheckCircle2, UserCheck
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ThemeBackground from '../components/ThemeBackground';
import { useTheme } from '../context/ThemeContext';

export default function TermsAndConditions() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const lastUpdated = 'September 18, 2026';

  const termsSections = [
    {
      title: '1. Agreement to Terms',
      content: (
        <p>
          By accessing or using <strong>Quizzy (QuizForge)</strong>, whether as a registered quiz host or as a guest player joining via PIN, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not access or use our services.
        </p>
      )
    },
    {
      title: '2. User Accounts & Responsibilities',
      content: (
        <div className="space-y-2.5">
          <p>
            When registering as a host, you must provide accurate, current information. You are responsible for safeguarding your login credentials and for all activities that occur under your account.
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-xs opacity-90">
            <li>You must not share your account or allow unauthorized parties to access your host dashboard.</li>
            <li>You must notify us immediately of any unauthorized use or security breach.</li>
            <li>You may permanently delete your account at any time via Dashboard &gt; Host Profile &gt; Delete Account.</li>
          </ul>
        </div>
      )
    },
    {
      title: '3. Acceptable Content & Quiz Rules',
      content: (
        <div className="space-y-2.5">
          <p>
            You retain ownership of the questions, text, and themes you create. However, by hosting quizzes on our platform, you agree that you will not post content that:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-xs opacity-90">
            <li>Is unlawful, defamatory, harassing, abusive, hateful, or discriminatory.</li>
            <li>Infringes on copyrights, trademarks, or proprietary intellectual property of third parties.</li>
            <li>Contains explicit, adult, or malicious content targeting minors or students.</li>
            <li>Promotes academic dishonesty, unauthorized test leakages, or security exploits.</li>
          </ul>
        </div>
      )
    },
    {
      title: '4. Live Game Rooms & Fair Play',
      content: (
        <div className="space-y-2.5">
          <p>
            Game PINs are generated dynamically for live interactive sessions:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-xs opacity-90">
            <li>Automated bots, denial-of-service scripts, and flood-joining attacks are strictly prohibited.</li>
            <li>Hosts retain the right to terminate an active room or remove disruptive players from their lobby.</li>
            <li>Quiz sessions automatically conclude and archive once all questions have elapsed.</li>
          </ul>
        </div>
      )
    },
    {
      title: '5. Intellectual Property Rights',
      content: (
        <p>
          The Quizzy platform, including our interactive UI, animations, scoring algorithms, logos, and software codebase, is the property of Quizzy Inc. and is protected by applicable copyright, trademark, and intellectual property laws. You may not reverse engineer, decompile, or copy our software architecture without written authorization.
        </p>
      )
    },
    {
      title: '6. Subscriptions, Payments & Cancellations',
      content: (
        <p>
          Certain features (e.g. unlimited players, custom exports, and advanced themes) are part of paid Pro or Enterprise plans. Subscription fees are billed in advance on a recurring monthly or annual basis. You may cancel your subscription at any time without cancellation penalties. Detailed terms regarding refunds are set forth in our <strong>Refund Policy</strong>.
        </p>
      )
    },
    {
      title: '7. Disclaimer of Warranties & Limitation of Liability',
      content: (
        <p>
          Our services are provided on an "as is" and "as available" basis without warranties of any kind. While we strive for 99.9% uptime and low-latency multiplayer performance, we do not guarantee uninterrupted connectivity during local network or third-party cloud outages. To the maximum extent permitted by law, Quizzy Inc. shall not be liable for indirect, incidental, or consequential damages.
        </p>
      )
    },
    {
      title: '8. Changes to Terms',
      content: (
        <p>
          We reserve the right to modify these terms at any time. When changes are made, the revised date at the top of this page will be updated. Continued use of the platform after updates signifies your acceptance of the revised Terms.
        </p>
      )
    }
  ];

  return (
    <AnimatedPage>
      <ThemeBackground>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-left">
          
          {/* Back Navigation */}
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

          {/* Header */}
          <div className="space-y-3 mb-10 pb-8 border-b border-black/10 dark:border-white/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/25 text-xs font-bold text-secondary">
              <Scale className="h-3.5 w-3.5" />
              <span>Legal Guidelines</span>
            </div>
            
            <h1 className={`font-outfit text-3xl sm:text-5xl font-extrabold tracking-tight ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              Terms & Conditions
            </h1>

            <p className={`text-sm leading-relaxed max-w-2xl ${
              isLight ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Rules, rights, and responsibilities for hosts and participants on the Quizzy interactive quiz platform.
            </p>

            <div className="text-xs text-muted font-medium pt-1">
              Last updated: {lastUpdated}
            </div>
          </div>

          {/* Terms Content */}
          <div className="space-y-6">
            {termsSections.map((sec, idx) => (
              <motion.section
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className={`p-6 sm:p-7 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                  isLight
                    ? 'bg-white border-gray-200/80 shadow-sm text-gray-700'
                    : 'glass-panel border-white/5 text-gray-300 shadow-md'
                }`}
              >
                <h2 className={`font-outfit font-extrabold text-base sm:text-lg mb-3 ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>
                  {sec.title}
                </h2>
                {sec.content}
              </motion.section>
            ))}
          </div>

          {/* Contact Box */}
          <div className={`mt-10 p-6 rounded-2xl border text-center space-y-2 ${
            isLight ? 'bg-gray-50 border-gray-200 text-gray-700' : 'glass-panel border-white/5 text-gray-300'
          }`}>
            <h3 className={`font-outfit font-bold text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Legal Contact
            </h3>
            <p className="text-xs text-muted">
              For questions regarding our terms, reach us at{' '}
              <a href="mailto:legal@quizzy.com" className="text-primary hover:underline font-semibold">
                legal@quizzy.com
              </a>{' '}
              or write to Quizzy Inc., 305 City Vista, Kharadi, Pune 411014.
            </p>
          </div>

        </div>
      </ThemeBackground>
    </AnimatedPage>
  );
}
