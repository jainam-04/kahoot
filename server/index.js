const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const dns = require('dns');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Use public DNS servers to fix querySrv ECONNREFUSED / ETIMEOUT errors with MongoDB Atlas
try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch (err) {
    console.warn('⚠️ Could not configure DNS servers:', err.message);
}

dotenv.config();

// ─── Validate Environment Variables ──────────
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRE'];
requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
});
console.log('✅ All environment variables validated');

connectDB();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// ─── CORS Configuration ───────────────────────
// Allowed dynamically from any origin to make the API universally accessible
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        // and allow all other origins dynamically.
        callback(null, true);
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Make io accessible in controllers
app.set('io', io);

// Socket.IO events
require('./socket/index')(io);

// Routes
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const gameRoutes = require('./routes/gameRoutes');
const resultRoutes = require('./routes/resultRoutes');
const imageRoutes = require('./routes/imageRoutes');
const infoRoutes = require('./routes/infoRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/auth', authRoutes);
app.use('/quiz', quizRoutes);
app.use('/game', gameRoutes);
app.use('/result', resultRoutes);
app.use('/images', imageRoutes);
app.use('/info', infoRoutes);
app.use('/admin', adminRoutes);

// Dual-mount /api/* paths for universal API compatibility
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/result', resultRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', infoRoutes);

app.get('/', (req, res) => {
    res.send('Quiz API is running...');
});

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = (port = PORT, host = HOST) => {
    server.listen(port, host, () => {
        console.log(`✅ QuizForge server listening on http://${host}:${port}`);
    });

    server.once('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            const nextPort = port + 1;
            console.warn(`⚠️ Port ${port} is busy. Trying ${nextPort} instead...`);
            // When listen fails, the server is not bound, so we don't need to close it.
            startServer(nextPort, host);
        } else {
            console.error('❌ Server failed to start', error);
            process.exit(1);
        }
    });
};

startServer();
