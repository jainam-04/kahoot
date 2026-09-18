/**
 * ⚠️  DEPRECATED — DO NOT USE THIS FILE.
 *
 * This file is an outdated entry point with NO Socket.IO support and
 * different route prefixes (/api/auth vs /auth). It will break the app
 * if run instead of index.js.
 *
 * The real server entry point is: index.js  (set in package.json "main")
 * Run with: npm start  OR  npm run dev
 */

const dns = require('dns');
try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch (err) {
    console.warn('⚠️ Could not configure DNS servers:', err.message);
}
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();

// middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// routes
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const quizRoutes = require('./routes/quizRoutes');
const resultRoutes = require('./routes/resultRoutes');
const imageRoutes = require('./routes/imageRoutes');

// use routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/images', imageRoutes);

// test route
app.get('/', (req, res) => {
  res.send('Server is running successfully 🚀');
});

// Function to start server and initialize Socket.IO
const startServer = (serverInstance) => {
  const { Server } = require('socket.io');
  const io = new Server(serverInstance, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  app.set('io', io);
  require('./socket/index')(io);
  console.log('Socket.IO initialized and attached to server');
};

// connect DB + start server
const PORT = process.env.PORT || 5000;

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.warn('MONGO_URI is not set. Starting without MongoDB connection.');
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  startServer(server);
} else {
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('MongoDB connected');

      const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
      startServer(server);
    })
    .catch((err) => {
      console.error('DB connection error:', err.message);
      const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
      startServer(server);
    });
}