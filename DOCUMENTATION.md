# Gubbi (Learn. Play. Shine.) — Complete Platform Documentation

> **Version:** 1.0.0  
> **Last Updated:** November 2026  
> **Repository:** [https://github.com/jainam-04/kahoot](https://github.com/jainam-04/kahoot)

---

## 1. Executive Overview & Brand Identity

**Gubbi** is a modern, high-performance real-time interactive quiz and battle game platform designed for educators, institutions, corporate trainers, and event hosts. Built as a full-stack, real-time application with sub-second WebSocket synchronization, Gubbi enables hosts to build multimedia-rich trivia and educational assessments, launch live multiplayer rooms via a 6-digit game PIN or QR code, and export audit-ready performance reports in Excel, PDF, Word, and CSV.

### Core Value Pillars
- **Zero-Latency Multiplayer Experience**: Sub-second question broadcasts, live countdown timers, and synchronized scoring across hundreds of concurrent players.
- **AI-Powered Quiz Assistant**: Natural language prompt generation that drafts balanced, curriculum-aligned question sets in seconds with custom difficulty and question count selectors.
- **Unified Brand Customization**: Support for organization branding, institution naming, custom question backgrounds, and integrated Pexels stock photography.
- **Enterprise-Grade Analytics & Exports**: Automated session logging, student accuracy tracking, fastest solver badges, and one-click multi-format exports (`.xlsx`, `.pdf`, `.docx`, `.csv`).

---

## 2. Technology Stack & Architecture

Gubbi is structured as a decoupled monorepo containing a high-speed React client and an Express/Socket.IO backend communicating over HTTP REST and WebSockets.

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT (Vite + React 19)              │
│  - Tailwind CSS + Framer Motion (Animations & UI)           │
│  - TanStack Query v5 (Data Fetching & Cache)                │
│  - Socket.IO Client (Real-time Gameplay State)              │
│  - File Exporters: SheetJS (xlsx), jsPDF, docx              │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP REST                     │ WebSockets
               │ (Port 5000 /api/*)           │ (Real-time Events)
┌──────────────▼──────────────────────────────┴───────────────┐
│                       SERVER (Node.js + Express 5)          │
│  - Socket.IO Engine (Dual-room broadcasting)                │
│  - JWT Authentication & Bcrypt Password Hashing             │
│  - Mongoose 9 ODM                                           │
│  - Public DNS Overrides (1.1.1.1 / 8.8.8.8 for Atlas)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────▼──────────────┐
                │   MongoDB Atlas / Replica   │
                │  - Users, Quizzes, Results  │
                │  - Live Game Sessions       │
                └─────────────────────────────┘
```

### Technology Matrix

| Layer | Technology | Key Capabilities & Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** & **Vite 8** | Modern component architecture, ultra-fast Hot Module Replacement (HMR), code splitting via `React.lazy` |
| **Styling & Icons** | **Tailwind CSS 3.4** & **Lucide React** | Utility-first responsive design, dark/light theme switching, custom micro-interactions, high-DPI icons |
| **Animation & UI** | **Framer Motion 12** | Route transitions (`AnimatedPage`), animated popovers, podium reveals, confetti effects |
| **Data Synchronization** | **TanStack React Query v5** | Server-state caching, automatic refetching, optimistic UI updates, query invalidation |
| **Client WebSockets** | **Socket.IO Client 4.8** | Low-latency duplex communication, automatic reconnection, room subscription |
| **Document Generators** | **XLSX**, **jsPDF**, **jspdf-autotable**, **docx** | Client-side generation of Excel sheets, stylized PDF tables, and Word reports |
| **Backend Framework** | **Express 5** | REST routing, CORS middleware, centralized error handling, dual-mounted `/api` prefixes |
| **Real-time Server** | **Socket.IO 4.8** | Room management (`room_${pin}`), broadcast emitters, connection lifecycle handlers |
| **Database & ODM** | **MongoDB** & **Mongoose 9** | Flexible document modeling, schema validation, population of nested quiz references |
| **Security & Auth** | **JSON Web Tokens (JWT)** & **bcryptjs** | Stateless Bearer token verification, password hashing with salt rounds, role-based protection |
| **Networking & DNS** | **Custom DNS Servers** | Built-in fallback to Cloudflare (`1.1.1.1`) and Google (`8.8.8.8`) to prevent Atlas connection timeouts |

---

## 3. Directory Structure

```
kahoot/
├── client/
│   ├── public/                      # Static brand assets & favicon
│   ├── src/
│   │   ├── assets/                  # Brand illustrations, quiz covers, logos
│   │   ├── components/
│   │   │   ├── landing/             # Hero, LiveDemoSection, Features, Testimonials
│   │   │   ├── AIQuizAssistantModal.jsx  # AI quiz generator modal with custom popovers
│   │   │   ├── AppSidebar.jsx       # Unified 230px desktop aside & mobile navigation drawer
│   │   │   ├── BackgroundPicker.jsx # Pexels image search & background theme selector
│   │   │   ├── HostProfileModal.jsx # Profile edit, email and password update modal
│   │   │   ├── PlanComparisonTable.jsx # Free vs Pro comparison pricing modal
│   │   │   ├── Navbar.jsx           # Public top navigation with mobile responsive links
│   │   │   └── Footer.jsx           # Global landing footer
│   │   ├── context/
│   │   │   ├── ThemeContext.jsx     # Dark & Light theme provider with persistence
│   │   │   └── GameContext.jsx      # Active battle session state management
│   │   ├── pages/                   # Application views (Dashboard, Quizzes, Game, Reports)
│   │   ├── services/                # Axios API service clients (auth, quiz, game, result)
│   │   ├── utils/                   # Session tokens, auth helpers, string sanitizers
│   │   ├── App.jsx                  # Root router, route definitions, Suspense fallbacks
│   │   └── main.jsx                 # App entry point with QueryClientProvider
│   ├── tailwind.config.js           # Custom palette, shadows, font families (Inter, Outfit)
│   └── vite.config.js               # Rolldown / Vite build and asset optimization
├── server/
│   ├── config/                      # Database connector (db.js)
│   ├── controllers/                 # authController, quizController, gameController, etc.
│   ├── middleware/                  # authMiddleware (JWT protect), admin checks
│   ├── models/                      # User, Quiz, GameSession, Result schemas
│   ├── routes/                      # Express routers (authRoutes, quizRoutes, etc.)
│   ├── socket/                      # Socket.IO connection and gameplay events
│   ├── scripts/                     # SuperAdmin provisioning scripts
│   └── index.js                     # Server entry point with Socket.IO initialization
└── DOCUMENTATION.md                 # This platform specification
```

---

## 4. Application Pages & Sitemap

| Route | Component | Access | Description |
| :--- | :--- | :--- | :--- |
| `/` | `LandingPage.jsx` | Public | Homepage showcasing live interactive demo, feature breakdown, curated packs, pricing, and FAQ. |
| `/login` | `Login.jsx` | Public | Host sign-in with credentials validation, guest cleanup, and session initialization. |
| `/register` | `Register.jsx` | Public | Host account creation with auto-login on successful registration. |
| `/forgot-password` | `ForgotPassword.jsx` | Public | Password reset request with token generation. |
| `/reset-password/:token`| `ResetPassword.jsx` | Public | Secure password update using valid reset token. |
| `/dashboard` | `Dashboard.jsx` | Host Auth | Central command center: active host metrics, quick-start battle lobby, curated trivia packs. |
| `/quiz/my` | `MyQuizzes.jsx` | Host Auth | Quiz library manager: tabbed filtering (All, Drafts, Published), instant search, edit, host, duplicate, delete. |
| `/quiz/create` | `CreateQuiz.jsx` | Host Auth | Comprehensive quiz authoring studio with AI generation, Pexels integration, and question preview. |
| `/quiz/edit/:id` | `EditQuiz.jsx` | Host Auth | Full-fidelity editor matching CreateQuiz UI for updating drafts or published sets. |
| `/reports` | `Reports.jsx` | Host Auth | Performance reports hub: 4 KPI metric cards, Category/Date filtering, and sortable reports table. |
| `/results/:sessionId` | `ResultsAnalytics.jsx` | Host Auth | Deep match telemetry: scoreboards, player accuracy, fastest solvers, Excel/PDF/Word/CSV exports. |
| `/host/lobby/:pin` | `HostLobby.jsx` | Host Auth | Real-time battle waiting room showing 6-digit PIN, QR code, live player roster, and start controls. |
| `/join` | `JoinGame.jsx` | Public | Player game portal: enter PIN, select avatar, submit nickname/name. |
| `/waiting/:pin` | `WaitingRoom.jsx` | Player | Player waiting screen displaying connected lobby status until host launches question 1. |
| `/live/:pin` | `LiveQuiz.jsx` | Player / Host | Synchronized question screen: animated timer, shape-coded answer buttons (▲, ◆, ●, ■), points multiplier. |
| `/result/answer/:pin` | `AnswerResult.jsx` | Player / Host | Immediate post-question feedback: correct/incorrect indicator, streak counter, points awarded. |
| `/leaderboard/:pin` | `Leaderboard.jsx` | Player / Host | Mid-game leaderboard rankings displaying top 5 podium contenders and rank progression. |
| `/final-result/:pin` | `FinalResult.jsx` | Player / Host | Grand finale celebration: 1st, 2nd, 3rd place podium, confetti animations, final score breakdown. |
| `/admin` | `AdminPanel.jsx` | Admin Auth | SuperAdmin dashboard for managing platform users, quizzes, and global statistics. |
| `/about`, `/faq` | Policy Pages | Public | Informational pages regarding platform rules, pricing, refund, and privacy policies. |

---

## 5. Core Platform Functionalities

### 5.1. Quiz Creation Studio & AI Assistant
Hosts can construct quizzes manually or utilize the AI assistant:
- **Metadata Configuration**: Title, description, category (Pop Culture, Geography, Science, Technology, etc.), and organization/school branding name.
- **AI Quiz Assistant ([AIQuizAssistantModal.jsx](file:///d:/kahoot/client/src/components/AIQuizAssistantModal.jsx))**:
  - Conversational interface powered by natural language prompts.
  - **Custom Difficulty Selector**: Upward-opening popovers for *Easy* (Quick & casual), *Medium* (Balanced trivia challenge), and *Hard* (Deep & tricky mastery).
  - **Custom Question Count Selector**: Options for 3, 5, 8, 10, or 15 questions.
  - Generates questions with 4 answer options, designated correct index, timer limits, and explanation notes.
  - Immediate preview cards with individual checkmarks to selectively import questions or replace the quiz.
- **Pexels Photo Library & Media Backgrounds**:
  - Search millions of high-resolution royalty-free stock photos directly inside the editor.
  - Toggle between global background across all questions or distinct backgrounds per question.
- **Question Editor**:
  - Reorder questions, customize timer limits (5s–120s), duplicate, remove, and choose question types (Multiple Choice, True/False).
- **Interactive Live Preview Emulator**:
  - Live preview component that allows toggling between mobile and desktop viewport representations of the quiz.

### 5.2. Real-Time Multiplayer Gameplay Engine
The multiplayer system utilizes Socket.IO rooms keyed to the unique 6-digit session PIN:
1. **Lobby Creation**: Host launches a quiz; server initializes a `GameSession` in MongoDB with status `waiting`.
2. **Player Entry**: Players visit `/join`, enter the PIN and nickname. Server emits `player-joined` and `player_list` updates to the host lobby in real time.
3. **Gameplay State Machine**:
   - `waiting` ➔ Host clicks "Start Game".
   - `question` ➔ Server broadcasts current question without the `correctIndex` field to prevent client-side inspection. Timers tick synchronously.
   - `answer` ➔ Question timer expires or all players submit. Server calculates scores based on accuracy and submission speed (`timeTaken`). Correct answer is revealed.
   - `leaderboard` ➔ Mid-round rankings broadcast to all players with streak indicators.
   - `finished` ➔ Final podium animation with top 3 winners. Results are saved to the `Result` collection.

### 5.3. Reports & Telemetry Hub ([Reports.jsx](file:///d:/kahoot/client/src/pages/Reports.jsx))
- **Hero Banner**: High-impact violet gradient card featuring simulated 3D vector illustration of clipboard, rising chart columns, and a 3D donut chart.
- **4 Stat Metric Cards**:
  - *Total Quizzes* (with violet theme).
  - *Total Sessions* (with sky blue theme).
  - *Total Participants* (with emerald theme).
  - *Average Score* (with amber theme).
- **Filter Bar**: Real-time search across titles, categories, and participant counts, paired with dedicated popovers for *Category* and *Date Range* filters.
- **Reports Table**: Formatted list featuring quiz icons, category pills, questions count, participant count, colored average score badges, and direct links to `/results/:sessionId`.

### 5.4. Export & Analytics Engine ([ResultsAnalytics.jsx](file:///d:/kahoot/client/src/pages/ResultsAnalytics.jsx))
- **Excel Export (`.xlsx`)**: Generates multi-tab workbooks containing player standings, match overview metadata, and fastest solver logs using SheetJS.
- **PDF Export (`.pdf`)**: Generates branded A4 documents with letterheads, score tables, and color-coded results using `jspdf` and `jspdf-autotable`.
- **Word Export (`.docx`)**: Generates formatted Word documents using the `docx` library.
- **CSV Export (`.csv`)**: Raw comma-separated values for direct import into LMS software (Canvas, Blackboard, Google Classroom).

---

## 6. Backend API Reference

All protected endpoints require the HTTP Authorization header: `Bearer <jwt_token>`.

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new host account (name, email, password) |
| `POST` | `/api/auth/login` | Public | Sign in and receive JWT token and user profile |
| `GET` | `/api/auth/me` | Protected | Fetch current authenticated user details |
| `PUT` | `/api/auth/profile` | Protected | Update profile (name, email, and/or change password) |
| `DELETE`| `/api/auth/account` | Protected | Permanently delete account and all owned quizzes |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset email |
| `PUT` | `/api/auth/reset-password/:token` | Public | Complete password reset with token |

### Quiz Management Routes (`/api/quiz`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/quiz/my` | Protected | Retrieve all quizzes owned by current host |
| `POST` | `/api/quiz/create` | Protected | Create a new quiz (with questions, drafts, branding) |
| `GET` | `/api/quiz/:id` | Protected | Retrieve quiz details by ID |
| `PUT` | `/api/quiz/:id` | Protected | Update quiz content or toggle draft status |
| `DELETE`| `/api/quiz/:id` | Protected | Delete quiz by ID |
| `POST` | `/api/quiz/generate-ai` | Protected | Prompt AI assistant to generate structured questions |

### Game Session Routes (`/api/game`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/game/create` | Protected | Initialize new game session and generate unique PIN |
| `GET` | `/api/game/:pin` | Public | Verify PIN and fetch lobby metadata |
| `POST` | `/api/game/join` | Public | Submit player nickname and join session |
| `POST` | `/api/game/submit` | Public | Submit answer for current question |

### Results & Reports Routes (`/api/result` & `/api/results`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/result/my` | Protected | List all completed session records for host |
| `GET` | `/api/result/:sessionId`| Public | Fetch detailed analytics report for a session |
| `POST` | `/api/result/save` | Protected | Finalize and store session results |
| `GET` | `/api/result/:sessionId/leaderboard` | Public | Fetch leaderboard standings for session |

---

## 7. Socket.IO WebSocket Protocol

Clients connect to `ws://<host>:<port>` and subscribe to room PIN channels.

### Host-Initiated Events
- `host-join`: Registers the host socket to `pin` and `room_${pin}`.
- `start-game`: Transitions lobby status from `waiting` to `active` and launches question 1.
- `next-question`: Advances room state to next question and synchronizes timers.
- `show-results`: Halts countdown, tallies answers, and emits score updates.
- `show-leaderboard`: Broadcasts top podium rankings.
- `end-game`: Closes game, triggers final podium, and saves result.

### Player-Initiated Events
- `player-join`: Adds player socket to room; broadcasts updated player roster to host.
- `submit-answer`: Sends answer index and timestamp to server for scoring calculation.
- `disconnect`: Detects connection drops and notifies the host lobby.

---

## 8. Database Schemas

### User Schema (`server/models/User.js`)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  createdAt: { type: Date, default: Date.now }
}
```

### Quiz Schema (`server/models/Quiz.js`)
```javascript
{
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: 'General Knowledge' },
  organizationName: { type: String, default: '' },
  coverImage: { type: String },
  backgroundImage: { type: String },
  isSameBackgroundForAll: { type: Boolean, default: true },
  isDraft: { type: Boolean, default: false },
  hostId: { type: ObjectId, ref: 'User', required: true },
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true },
    timeLimit: { type: Number, default: 20 },
    points: { type: Number, default: 1000 },
    bgImage: { type: String }
  }]
}
```

### Result Schema (`server/models/Result.js`)
```javascript
{
  sessionId: { type: ObjectId, ref: 'GameSession', required: true },
  quizId: { type: ObjectId, ref: 'Quiz', required: true },
  hostId: { type: ObjectId, ref: 'User', required: true },
  quizTitle: { type: String, required: true },
  organizationName: { type: String, default: '' },
  winner: { type: String, default: '' },
  totalQuestions: { type: Number, default: 0 },
  playedAt: { type: Date, default: Date.now },
  players: [{
    name: String,
    fullName: String,
    nickname: String,
    mobileNumber: String,
    totalScore: Number,
    correctAnswers: Number,
    wrongAnswers: Number,
    unansweredQuestions: Number,
    rank: Number,
    answers: [{
      questionIndex: Number,
      answerIndex: Number,
      isCorrect: Boolean,
      timeTaken: Number,
      score: Number
    }]
  }]
}
```

---

## 9. Setup, Configuration & Running Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI

### 1. Installation
Clone the repository and install dependencies in root, client, and server:
```bash
git clone https://github.com/jainam-04/kahoot.git
cd kahoot

# Install root dependencies
npm install

# Install client dependencies
npm --prefix client install

# Install server dependencies
npm --prefix server install
```

### 2. Environment Configuration
Create a `.env` file in `server/`:
```env
PORT=5000
HOST=0.0.0.0
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/gubbi?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in `client/` (optional, defaults to `http://localhost:5000`):
```env
VITE_API_URL=http://localhost:5000
```

### 3. Running Development Servers
Run both server and client concurrently:
```bash
npm run dev:full
```
Or run individually in separate terminal sessions:
```bash
# Terminal 1 - Backend Server
npm --prefix server run dev

# Terminal 2 - Frontend Client
npm --prefix client run dev
```

The frontend will run at `http://localhost:5173` and the backend at `http://localhost:5000`.

### 4. Production Build & Deployment
Build the client application:
```bash
npm --prefix client run build
```
The optimized bundle will be created in `client/dist/`.

---

## 10. Security & Performance Best Practices

1. **Answer Masking During Gameplay**: The server never sends the `correctIndex` to player sockets during the question state; correctness is evaluated server-side upon submission to eliminate inspect-element cheating.
2. **DNS Resilience**: Built-in DNS resolver configuration in `server/index.js` uses Google (`8.8.8.8`) and Cloudflare (`1.1.1.1`) to prevent connection failures with MongoDB Atlas SRV records.
3. **Optimized Asset Delivery**: Heavy report exporter libraries (`xlsx`, `jspdf`, `docx`) are dynamically imported (`import()`) only when the user clicks an export button, keeping the main bundle lightweight.
4. **Isolated Responsive Layouts**: The dashboard aside navigation ([AppSidebar.jsx](file:///d:/kahoot/client/src/components/AppSidebar.jsx)) is isolated to authenticated management views and prevented from interfering with public landing pages.
