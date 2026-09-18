import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RotateCcw, ShieldCheck, CheckCircle2, Clock,
  CreditCard, ArrowLeft, Mail, AlertTriangle, HelpCircle
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ThemeBackground from '../components/ThemeBackground';
import { useTheme } from '../context/ThemeContext';

export default function RefundPolicy() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const lastUpdated = 'September 18, 2026';

  const refundPillars = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
      title: '14-Day Money-Back Guarantee',
      desc: 'First-time upgrades to Pro or School plans are eligible for a 100% full refund within 14 days of purchase—no complicated hoops.'
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: 'Fast 5-7 Day Processing',
      desc: 'Approved refunds are issued back to your original payment method (Credit Card, UPI, or PayPal) within 5 to 7 business days.'
    },
    {
      icon: <RotateCcw className="h-6 w-6 text-yellow-400" />,
      title: 'Hassle-Free Cancellation',
      desc: 'Cancel your auto-renew anytime with 1 click in your billing settings. You keep full access until your current billing period ends.'
    }
  ];

  const sections = [
    {
      title: '1. Overview & Free Forever Tier',
      content: (
        <p>
          At <strong>Quizzy (QuizForge)</strong>, we want educators, hosts, and trainers to love their interactive live quiz experience. Our platform offers a robust <strong>Free Forever Plan</strong> allowing you to create quizzes and host live rooms without ever entering a credit card.
        </p>
      )
    },
    {
      title: '2. 14-Day Money-Back Guarantee',
      content: (
        <div className="space-y-2.5">
          <p>
            If you upgrade to a paid <strong>Pro</strong> or <strong>Enterprise</strong> plan and find that Quizzy does not meet your classroom or organization's needs:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-xs opacity-90">
            <li>You may request a <strong>100% full refund</strong> within <strong>14 calendar days</strong> of your initial upgrade date.</li>
            <li>No long justification required. Simply contact our support team from your registered account email.</li>
          </ul>
        </div>
      )
    },
    {
      title: '3. Annual Subscription Renewals',
      content: (
        <p>
          For annual subscriptions, we send a renewal reminder notification 7 days prior to billing. If your annual plan automatically renews and you forgot to cancel, you may request a refund within <strong>7 calendar days</strong> of the renewal charge.
        </p>
      )
    },
    {
      title: '4. Service Downtime & Event Disruptions',
      content: (
        <p>
          In the rare event that a major verified server outage on our side interrupts a scheduled live competition or institutional examination, we will issue service credits or a pro-rated refund for the affected billing period upon review by our engineering team.
        </p>
      )
    },
    {
      title: '5. Non-Refundable Circumstances',
      content: (
        <div className="space-y-2">
          <p>
            Refunds will not be granted in the following scenarios:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-xs opacity-90">
            <li>Refund requests submitted after the 14-day initial guarantee period has expired.</li>
            <li>Accounts terminated due to violations of our Acceptable Use Policy (e.g. offensive or illegal quiz content).</li>
            <li>Local connectivity issues, student Wi-Fi disruptions, or client-side hardware malfunctions outside our servers.</li>
          </ul>
        </div>
      )
    },
    {
      title: '6. How to Request a Refund',
      content: (
        <div className="space-y-2.5">
          <p>
            To initiate a refund request, simply email our billing desk:
          </p>
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs space-y-1">
            <p><strong>Email:</strong> <a href="mailto:billing@quizzy.com" className="text-secondary hover:underline font-bold">billing@quizzy.com</a> or <a href="mailto:support@quizzy.com" className="text-secondary hover:underline font-bold">support@quizzy.com</a></p>
            <p><strong>Subject line:</strong> Refund Request - [Your Registered Email]</p>
            <p><strong>Include:</strong> Your Account Name, Invoice/Receipt ID, and date of purchase.</p>
          </div>
          <p className="text-xs">
            Our billing team will review and respond within 24–48 hours. Once processed, your bank will typically reflect the credited amount within 5 to 7 business days.
          </p>
        </div>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-bold text-emerald-400">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Fair & Transparent Billing</span>
            </div>
            
            <h1 className={`font-outfit text-3xl sm:text-5xl font-extrabold tracking-tight ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              Refund Policy
            </h1>

            <p className={`text-sm leading-relaxed max-w-2xl ${
              isLight ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Our promise to you: clear refund rules, money-back guarantees, and simple cancellation procedures.
            </p>

            <div className="text-xs text-muted font-medium pt-1">
              Last updated: {lastUpdated}
            </div>
          </div>

          {/* Guarantee Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {refundPillars.map((pill, i) => (
              <div
                key={i}
                className={`p-5 rounded-2xl border ${
                  isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'glass-panel border-white/5 shadow-md'
                }`}
              >
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 w-fit mb-3">
                  {pill.icon}
                </div>
                <h3 className={`font-outfit font-bold text-sm mb-1.5 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {pill.title}
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  {pill.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Detail Sections */}
          <div className="space-y-6">
            {sections.map((sec, idx) => (
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

          {/* Need Assistance Callout */}
          <div className={`mt-10 p-6 rounded-2xl border text-center space-y-3 ${
            isLight ? 'bg-gray-50 border-gray-200 text-gray-700' : 'glass-panel border-white/5 text-gray-300'
          }`}>
            <h3 className={`font-outfit font-bold text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Have a Billing Question?
            </h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              Our support team is here to help with any invoice or plan queries.
            </p>
            <a
              href="mailto:billing@quizzy.com"
              className="btn-premium btn-primary-gradient inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black text-white rounded-xl shadow-md cursor-pointer"
            >
              <Mail className="h-4 w-4" />
              <span>Contact Billing Support</span>
            </a>
          </div>

        </div>
      </ThemeBackground>
    </AnimatedPage>
  );
}
