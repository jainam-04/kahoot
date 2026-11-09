import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'How do students join a live quiz game?',
    a: 'Students simply navigate to Gubbi and enter the 6-digit Game PIN provided by the host, or scan the generated QR code on screen. No account creation or app installation is required for players!',
  },
  {
    q: 'Is Gubbi completely free to use?',
    a: 'Yes! Gubbi offers a robust Free Forever plan that includes creating up to 5 custom quizzes, hosting up to 20 live participants, and real-time leaderboards. You can upgrade to Pro anytime for unlimited players.',
  },
  {
    q: 'Can I host unlimited live quizzes?',
    a: 'On our Pro and Enterprise plans, hosts enjoy unlimited quiz creation and unlimited participant hosting with zero restrictions.',
  },
  {
    q: 'Does Gubbi work on mobile devices and tablets?',
    a: 'Absolutely! Gubbi is 100% web-based and fully responsive. Players can join and answer questions seamlessly on any smartphone, tablet, laptop, or desktop browser.',
  },
  {
    q: 'Can schools and educational institutions purchase subscriptions?',
    a: 'Yes! Schools and educators can use Gubbi to create interactive quizzes, host live students with a simple 6-digit PIN, display real-time leaderboards, and export detailed performance reports in PDF and Excel. For institutional access or custom requirements, contact us at info@fouriseindia.com.',
  },
  {
    q: 'Is payment and user data secure?',
    a: 'Security is our top priority. All user data, credentials, and payment processing are encrypted using enterprise 256-bit SSL protocols and secure JWT authentication.',
  },
];

function ChevronIcon({ isOpen }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`w-4 h-4 transition-transform duration-300 ${
        isOpen ? 'rotate-180 text-[#551BF5]' : 'text-[#94A3B8]'
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6L8 10L12 6" />
    </svg>
  );
}

export default function FAQSection() {
  // Default first item expanded matching Figma
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section
      id="faq"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-8 scroll-mt-20 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FAF8FF 0%, #FAF6FF 50%, #FAF8FF 100%)',
      }}
    >
      {/* Ambient soft decorative purple glow blooms from Figma */}
      <div
        className="absolute w-[384px] h-[384px] -left-[64px] -top-[64px] rounded-full pointer-events-none filter blur-[64px]"
        style={{ background: 'rgba(233, 213, 255, 0.4)' }}
      />
      <div
        className="absolute w-[420px] h-[420px] -right-[64px] -bottom-[64px] rounded-full pointer-events-none filter blur-[64px]"
        style={{ background: 'rgba(233, 213, 255, 0.4)' }}
      />

      {/* Main Container: 896px */}
      <div className="max-w-[896px] mx-auto w-full relative z-10 flex flex-col items-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-[640px] space-y-3 mb-10 sm:mb-14"
        >
          {/* Heading 2 */}
          <h2 className="font-['Inter'] font-semibold text-3xl sm:text-4xl lg:text-[48px] lg:leading-[48px] tracking-[-1.2px] text-[#0F172A]">
            Frequently Asked <span className="text-[#551BF5]">Questions</span>
          </h2>

          {/* Subtitle */}
          <p className="font-['Inter'] font-normal text-sm sm:text-base leading-6 text-[#475569] max-w-[576px] mx-auto">
            Everything you need to know about hosting and playing on Gubbi.
          </p>
        </motion.div>

        {/* FAQ Accordions Stack: 768px */}
        <div className="w-full max-w-[768px] space-y-4 filter drop-shadow-[0px_0px_7px_rgba(0,0,0,0.06)]">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                className={`rounded-[16px] transition-all overflow-hidden text-left ${
                  isOpen
                    ? 'bg-white border border-[#D8B4FE] shadow-[0px_4px_6px_-1px_rgba(168,85,247,0.1),0px_2px_4px_-2px_rgba(168,85,247,0.1)] p-6'
                    : 'bg-white border border-[rgba(243,232,255,0.8)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:border-[#D8B4FE]/60 p-6'
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex items-center justify-between gap-4 cursor-pointer text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`font-['Inter'] font-bold text-base leading-6 transition-colors ${
                      isOpen ? 'text-[#0F172A]' : 'text-[#1E293B] hover:text-[#0F172A]'
                    }`}
                  >
                    {faq.q}
                  </span>

                  {/* 32px Circular Chevron Pill */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? 'bg-[#FAF5FF]' : 'bg-[#F8FAFC]'
                    }`}
                  >
                    <ChevronIcon isOpen={isOpen} />
                  </div>
                </button>

                {/* Collapsible Answer Body with Horizontal Divider */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[#F3E8FF] pt-4 mt-4">
                        <p className="font-['Inter'] font-normal text-sm leading-5 text-[#475569]">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
