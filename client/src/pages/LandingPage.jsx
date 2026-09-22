import React from 'react';
import AnimatedPage from '../components/AnimatedPage';
import ThemeBackground from '../components/ThemeBackground';
import HeroSection from '../components/landing/HeroSection';
import LiveDemoSection from '../components/landing/LiveDemoSection';
import ReadyQuizzesSection from '../components/landing/ReadyQuizzesSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import PricingSection from '../components/landing/PricingSection';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';

export default function LandingPage() {
  return (
    <AnimatedPage>
      <ThemeBackground>
        <div className="relative min-h-screen overflow-hidden">
          {/* Hero Section */}
          <HeroSection />

          {/* Interactive Mini Quiz Product Demo */}
          <LiveDemoSection />

          {/* Ready to Use Quizzes Section */}
          <ReadyQuizzesSection />

          {/* How It Works (4-Step Process) */}
          <HowItWorksSection />

          {/* Features Grid */}
          <FeaturesSection />

          {/* Flexible Pricing Section */}
          <PricingSection />

          {/* Frequently Asked Questions */}
          <FAQSection />

          {/* Call to Action Section */}
          <CTASection />
        </div>
      </ThemeBackground>
    </AnimatedPage>
  );
}