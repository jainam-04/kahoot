import API from './api';

export const getPlans = async () => {
  try {
    const response = await API.get('/plans');
    return response.data?.data || response.data || [];
  } catch (error) {
    console.warn('API error fetching plans, using fallback data:', error.message);
    return [
      {
        _id: '1',
        name: 'Starter Explorer',
        price: 0,
        billingCycle: 'monthly',
        description: 'Perfect for individuals, casual quiz games, and small classroom trivia sessions.',
        features: [
          'Up to 50 Live Players / Battle',
          'Unlimited Public & Custom Quizzes',
          'Real-Time Live Leaderboard',
          'Basic Performance Reports (PDF)',
          'Standard Web & Mobile Access'
        ],
        highlighted: false,
        buttonText: 'Get Started Free',
        buttonColor: 'secondary',
        displayOrder: 1,
      },
      {
        _id: '2',
        name: 'Pro Battles',
        price: 499,
        billingCycle: 'monthly',
        description: 'Designed for educators, trainers, and creators wanting maximum control & advanced analytics.',
        features: [
          'Up to 250 Live Players / Battle',
          'All Starter Features Included',
          'Advanced Analytics & CSV Exports',
          'Custom Themes & Background Pickers',
          'Instant QR Code Game Join',
          'Dedicated Host Game Controls',
          'Priority Server Bandwidth'
        ],
        highlighted: true,
        buttonText: 'Upgrade to Pro',
        buttonColor: 'primary',
        displayOrder: 2,
      },
      {
        _id: '3',
        name: 'Enterprise Squad',
        price: 1499,
        billingCycle: 'monthly',
        description: 'Built for organizations, universities, and large-scale live trivia events.',
        features: [
          'Unlimited Live Players / Battle',
          'Custom Branding & Logo Badges',
          'Full PDF & Excel Battle Log Exports',
          '24/7 Dedicated Priority Support',
          'Multi-Host Squad Management',
          'Custom Domain & SSO Ready',
          'Dedicated High-Speed Socket Clusters'
        ],
        highlighted: false,
        buttonText: 'Contact Sales',
        buttonColor: 'accent',
        displayOrder: 3,
      }
    ];
  }
};

export const getFaqs = async () => {
  try {
    const response = await API.get('/faqs');
    return response.data?.data || response.data || [];
  } catch (error) {
    console.warn('API error fetching FAQs, using fallback data:', error.message);
    return [
      {
        _id: '1',
        question: 'How do I host a live quiz battle?',
        answer: 'Sign up or log in to your QuizForge account, create a custom quiz or select an existing one from "My Quizzes", and click "Launch Lobby". A 6-digit Game PIN and QR code will be generated instantly for your players.',
        category: 'Gameplay',
      },
      {
        _id: '2',
        question: 'How do players join an active quiz session?',
        answer: 'Players visit the "Join Game" page, enter the Game PIN provided by the host, enter their nickname, and tap "Join Game". Alternatively, they can scan the host\'s on-screen QR code.',
        category: 'Gameplay',
      },
      {
        _id: '3',
        question: 'Is QuizForge free for teachers and students?',
        answer: 'Yes! QuizForge offers a feature-packed Starter Explorer plan that is completely free forever. It allows up to 50 concurrent live players per battle session with full access to leaderboards and quiz creation.',
        category: 'Billing',
      },
      {
        _id: '4',
        question: 'Can I export game analytics and performance reports?',
        answer: 'Yes, after every multiplayer quiz session, hosts can view detailed player performance reports and download them as CSV or PDF documents from their dashboard or the Results page.',
        category: 'Features',
      },
      {
        _id: '5',
        question: 'Can I upgrade or downgrade my plan at any time?',
        answer: 'Absolutely. You can upgrade, downgrade, or cancel your subscription whenever you wish directly from your account settings with zero hidden cancellation fees.',
        category: 'Billing',
      },
      {
        _id: '6',
        question: 'Is my data secure on QuizForge?',
        answer: 'QuizForge protects user data using enterprise-grade JWT authentication, SSL/TLS encryption for socket and HTTP connections, and strict database security protocols.',
        category: 'Security',
      }
    ];
  }
};

export const getPlatformStats = async () => {
  try {
    const response = await API.get('/stats');
    return response.data?.stats || response.data || null;
  } catch (error) {
    console.warn('API error fetching platform stats, using fallback:', error.message);
    return null;
  }
};

