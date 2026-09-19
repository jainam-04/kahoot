import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RotateCcw, ShieldCheck, CheckCircle2, Clock,
  CreditCard, ArrowLeft, Mail, Phone, MapPin,
  AlertTriangle, HelpCircle, FileText, Ban, XCircle
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ThemeBackground from '../components/ThemeBackground';
import { useTheme } from '../context/ThemeContext';

export default function RefundPolicy() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const lastUpdated = 'July 3, 2026';

  const policyPillars = [
    {
      icon: <ZapIcon className="h-6 w-6 text-primary" />,
      title: 'Immediate Digital Activation',
      desc: 'Access to premium quiz creation, host limits, and live room features is provisioned immediately upon purchase or plan activation.'
    },
    {
      icon: <Ban className="h-6 w-6 text-rose-500" />,
      title: 'Final & Non-Refundable',
      desc: 'All subscription payments and service fees are final and non-refundable once digital access has been granted.'
    },
    {
      icon: <Clock className="h-6 w-6 text-yellow-500" />,
      title: 'End-of-Cycle Cancellation',
      desc: 'Cancellations take effect at the end of your current billing period, retaining full access to paid features until expiration.'
    }
  ];

  const sections = [
    {
      title: '1. Overview',
      content: (
        <div className="space-y-3">
          <p>
            Thank you for using <strong>Quizy (QuizForge)</strong>. Quizy provides online live interactive quizzes, multiplayer game arenas, assessment tools, host lobbies, institute trivia management, and related digital services to educational institutions, enterprises, organizations, administrators, faculty members, event hosts, students, candidates, and other authorized users.
          </p>
          <p>
            As our services are primarily digital and access to subscribed features or services may be provided immediately upon purchase or activation, our refund and cancellation policy is set forth below.
          </p>
        </div>
      )
    },
    {
      title: '2. No Refund Policy',
      content: (
        <div className="space-y-3">
          <p>
            Unless otherwise required by applicable law or expressly agreed in writing, all subscription payments, service fees, and purchases made through Quizy are final and non-refundable.
          </p>
          <p>
            Once a subscription or service has been activated, or access to a purchased service has been provided, Quizy does not generally provide refunds or credits for:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-1 text-xs opacity-95">
            <li>Partial use of a subscription.</li>
            <li>Unused subscription periods.</li>
            <li>Cancellation after activation.</li>
            <li>Failure to use purchased features or services.</li>
            <li>Change of requirements or circumstances.</li>
            <li>Dissatisfaction with the service.</li>
          </ul>
          <p className="text-xs pt-1">
            The availability of a refund, where legally required or specifically agreed under a separate written agreement, will be determined in accordance with the applicable terms.
          </p>
        </div>
      )
    },
    {
      title: '3. Cancellation',
      content: (
        <div className="space-y-3">
          <p>
            Users or organizations may cancel their subscription in accordance with the applicable subscription terms.
          </p>
          <p>
            Cancellation of a subscription does not automatically entitle the user to a refund for the current billing period.
          </p>
          <p>
            Unless otherwise specified in the applicable subscription agreement, cancellation will take effect at the end of the current billing period, and the user may continue to access the applicable paid services until the end of that period.
          </p>
          <p>
            For customized enterprise or institute agreements, cancellation and refund terms may be governed by the applicable quotation, order form, invoice, service agreement, or other written agreement.
          </p>
          <p className="text-xs">
            In the event of any conflict between this general Refund & Cancellation Policy and a separately signed agreement, the terms of the specific agreement will prevail.
          </p>
        </div>
      )
    },
    {
      title: '4. Contact Us',
      content: (
        <div className="space-y-3">
          <p>
            If you have any questions regarding this Refund & Cancellation Policy, subscription cancellation, or applicable refund terms, please contact <strong>Quizy / Fourise Software Solutions Pvt. Ltd.</strong> through the official support or contact channels provided on the Platform:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className={`p-3.5 rounded-xl border text-xs ${
              isLight ? 'bg-slate-50 border-gray-200 text-gray-800' : 'bg-white/5 border-white/10 text-gray-300'
            }`}>
              <div className="font-bold text-primary mb-1 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                <span>Phone</span>
              </div>
              <a href="tel:+919527605805" className="hover:underline font-semibold">+91 95276 05805</a>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs ${
              isLight ? 'bg-slate-50 border-gray-200 text-gray-800' : 'bg-white/5 border-white/10 text-gray-300'
            }`}>
              <div className="font-bold text-secondary mb-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>Email</span>
              </div>
              <a href="mailto:info@fouriseindia.com" className="hover:underline font-semibold">info@fouriseindia.com</a>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs ${
              isLight ? 'bg-slate-50 border-gray-200 text-gray-800' : 'bg-white/5 border-white/10 text-gray-300'
            }`}>
              <div className="font-bold text-primary mb-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>Location</span>
              </div>
              <p className="leading-snug">305, City Vista, Kharadi, Pune 411014</p>
            </div>
          </div>
          <p className="text-xs pt-1">
            We will be happy to clarify the applicable terms before you purchase or subscribe to any Quizy service.
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs font-bold text-primary">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Billing & Subscriptions</span>
            </div>
            
            <h1 className={`font-outfit text-3xl sm:text-5xl font-extrabold tracking-tight ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              Refund & Cancellation <span className="text-gradient-primary">Policy</span>
            </h1>

            <p className={`text-sm leading-relaxed max-w-2xl ${
              isLight ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Standard terms governing digital service activations, plan renewals, cancellations, and refund eligibility for Quizy.
            </p>

            <div className="text-xs text-muted font-medium pt-1">
              Last Updated: {lastUpdated}
            </div>
          </div>

          {/* Policy Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {policyPillars.map((pill, i) => (
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

          {/* Contact Box */}
          <div className={`mt-10 p-6 sm:p-8 rounded-2xl border text-center space-y-3 ${
            isLight ? 'bg-slate-50 border-gray-200 text-gray-700' : 'glass-panel border-white/5 text-gray-300'
          }`}>
            <h3 className={`font-outfit font-bold text-base sm:text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Questions Prior to Subscribing?
            </h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              We are available to clarify applicable terms or customize institute agreements before you upgrade.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:info@fouriseindia.com"
                className="btn-premium btn-primary-gradient inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black text-white rounded-xl shadow-md cursor-pointer"
              >
                <Mail className="h-4 w-4" />
                <span>Email Support Desk</span>
              </a>
              <a
                href="tel:+919527605805"
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  isLight ? 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <Phone className="h-4 w-4" />
                <span>Call +91 95276 05805</span>
              </a>
            </div>
          </div>

        </div>
      </ThemeBackground>
    </AnimatedPage>
  );
}

// Icon helper
function ZapIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
