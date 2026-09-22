import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import EditQuiz from './pages/EditQuiz';
import MyQuizzes from './pages/MyQuizzes';
import HostLobby from './pages/HostLobby';
import JoinGame from './pages/JoinGame';
import WaitingRoom from './pages/WaitingRoom';
import LiveQuiz from './pages/LiveQuiz';
import AnswerResult from './pages/AnswerResult';
import Leaderboard from './pages/Leaderboard';
import FinalResult from './pages/FinalResult';
import ResultsAnalytics from './pages/ResultsAnalytics';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AboutKahoot from './pages/AboutKahoot';
import TermsAndConditions from './pages/TermsAndConditions';
import RefundPolicy from './pages/RefundPolicy';
import FAQPage from './pages/FAQPage';
import AdminPanel from './pages/AdminPanel';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { GameProvider } from './context/GameContext';

const queryClient = new QueryClient();

// Scrolls to the element matching the URL hash (e.g. #features) on the landing page.
function useScrollToHash() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      // Poll for the element since AnimatePresence mode="wait" delays rendering
      // of the new page until the exit animation finishes.
      const id = location.hash.replace('#', '');
      let attempts = 0;
      const maxAttempts = 20; // 20 x 50ms = 1s max wait
      const interval = setInterval(() => {
        attempts++;
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          clearInterval(interval);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [location]);
}

function AnimatedRoutes() {
  const location = useLocation();
  useScrollToHash();

  // Hide Navbar during gameplay for full immersion
  const isGameplayView = [
    '/live', 
    '/waiting', 
    '/result/answer', 
    '/leaderboard', 
    '/final-result',
    '/admin'
  ].some(path => location.pathname.startsWith(path));

  // Footer is ONLY displayed on the homepage ('/') and hidden when logged in to an account
  const token = localStorage.getItem('token');
  const isHomePage = location.pathname === '/';
  const shouldShowFooter = !isGameplayView && isHomePage && !token;

  return (
    <div className="flex flex-col min-h-screen bg-background text-gray-200">
      {/* Standard Top Navbar for all non-gameplay pages */}
      {!isGameplayView && <Navbar />}

      <main className={`flex-1 flex flex-col ${!isGameplayView ? 'pt-[var(--main-header-height,64px)]' : ''}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/quiz/create" element={<CreateQuiz />} />
            <Route path="/quiz/edit/:id" element={<EditQuiz />} />
            <Route path="/quiz/my" element={<MyQuizzes />} />
            <Route path="/host/lobby/:pin" element={<HostLobby />} />
            <Route path="/join" element={<JoinGame />} />
            <Route path="/waiting/:pin" element={<WaitingRoom />} />
            <Route path="/live/:pin" element={<LiveQuiz />} />
            <Route path="/result/answer/:pin" element={<AnswerResult />} />
            <Route path="/leaderboard/:pin" element={<Leaderboard />} />
            <Route path="/final-result/:pin" element={<FinalResult />} />
            <Route path="/results/:sessionId" element={<ResultsAnalytics />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/about" element={<AboutKahoot />} />
            <Route path="/about-kahoot" element={<AboutKahoot />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/faqs" element={<FAQPage />} />
            <Route path="/reviews" element={<Navigate to="/#testimonials" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Footer rendered strictly on the Homepage when not logged in */}
      {shouldShowFooter && <Footer />}
    </div>
  );
}

function ThemedToaster() {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: isLight ? '#faf8ff' : '#18181b',
          color: isLight ? '#1e1840' : '#fff',
          border: isLight
            ? '1px solid rgba(139, 92, 246, 0.18)'
            : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isLight
            ? '0 4px 16px rgba(109, 40, 217, 0.10)'
            : '0 4px 16px rgba(0,0,0,0.4)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
        },
      }}
    />
  );
}

export default function App() {
  useEffect(() => {
    const savedAppMode = localStorage.getItem('quizforge_mode') || 'dark';
    if (savedAppMode === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GameProvider>
          <Router>
            <AnimatedRoutes />
            <ThemedToaster />
          </Router>
        </GameProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
