# Gubbi 🚀

A Kahoot-inspired Quiz Platform built using the MERN Stack as part of our internship project.

> **Handoff documentation:** See [docs/HANDOFF.md](docs/HANDOFF.md) for setup, architecture, environment variables, REST and Socket.IO contracts, testing, deployment, and known gaps.

## Team Members

| Member | Responsibility |
|----------|---------------|
| Ruchira | Authentication & Home Module |
| Sai | Quiz Management Module |
| Sanskruti | Live Game Module |
| Srushti | Leaderboard, Results & Integration |

---

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas

### Version Control
- Git
- GitHub

---

## Project Objective

Build a real-time quiz platform inspired by Kahoot where users can:

- Register and Login
- Create and Manage Quizzes
- Generate Game PINs
- Join Live Quiz Sessions
- Answer Questions with Timers
- View Leaderboards
- View Final Results

---

## Project Structure

```text
Gubbi/

├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── assets/
│   │   └── services/
│
├── server/
│
└── README.md
```

---

## Pages

### Authentication
- Home
- Login
- Register
- Profile

### Quiz Management
- Create Quiz
- Edit Quiz
- Quiz List

### Live Game
- Join Game
- Game Screen

### Results
- Leaderboard
- Results
- Dashboard

---

## Design Guidelines

### Font
- Poppins

### Theme

| Type | Color |
|--------|--------|
| Primary | #6366F1 |
| Secondary | #8B5CF6 |
| Background | #FFFFFF |
| Text | #1F2937 |

### UI Rules
- Consistent Navbar
- Consistent Buttons
- Consistent Cards
- Responsive Design
- Modern Educational Theme

---

## User Flow

```text
Home
 ↓
Register
 ↓
Login
 ↓
Create Quiz
 ↓
Generate PIN
 ↓
Players Join
 ↓
Start Quiz
 ↓
Answer Questions
 ↓
Leaderboard
 ↓
Results
```

---

## Development Workflow

### Main Branches

```text
main
develop
```

### Feature Branches

```text
feature-auth
feature-quiz
feature-game
feature-results
```

### Workflow

1. Pull latest code
2. Work on assigned branch
3. Commit changes
4. Push changes
5. Create Pull Request
6. Merge into develop
7. After testing, merge develop into main

---

## Core Features

- User Authentication
- Quiz CRUD Operations
- Real-Time Quiz Sessions
- Game PIN System
- Timer-Based Questions
- Score Calculation
- Leaderboard
- Results Dashboard

---

## Future Enhancements

- AI Quiz Generator
- Quiz Analytics
- Certificate Generation
- Advanced Dashboard
- Mobile Application

---

## Demo: Lightweight local multiplayer demo (Gubbi)

This repository includes a simple, runnable multiplayer quiz demo (no DB) located in the `client/` and `server/` folders. The demo is designed for quick local presentations where one host creates a room and other players join using a 6-digit PIN.

Quick start (development):

1. Start the server

```powershell
cd server
npm install
npm start
```

2. Start the client

```powershell
cd client
npm install
npm run dev
```

3. Open the client in a browser on the host machine:

- `http://localhost:5173`

4. From other devices on the same LAN:

- Find the host IP address (Windows: `ipconfig` -> `IPv4 Address`).
- Open `http://<HOST_IP>:5173` on each player device. The client automatically uses the host IP for the socket connection.

Notes:
- The server listens on port `5000`. If clients open the client from the host IP, the socket connects back to `http://<HOST_IP>:5000` automatically.
- If the host wants to serve the client from the server for a single URL, run `npm run build` in `client`, copy the `dist` into `server/public` and serve static files from Express.

If you want, I can add a small script to copy the build output into the `server` folder and serve it for a single-port demo.
