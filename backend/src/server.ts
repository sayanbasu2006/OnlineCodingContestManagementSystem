import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import setupSocket from './socket';
const { initializeDatabase } = require('./config/db');

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import contestRoutes from './routes/contestRoutes';
import problemRoutes from './routes/problemRoutes';
import submissionRoutes from './routes/submissionRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import notificationRoutes from './routes/notificationRoutes';
import exportRoutes from './routes/exportRoutes';
import commentRoutes from './routes/commentRoutes';
import trackRoutes from './routes/trackRoutes';
import aiRoutes from './routes/aiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Lazy database initialization middleware for serverless execution
let isDbInitialized = false;
let dbInitPromise: Promise<void> | null = null;

app.use(async (_req, res, next) => {
    if (!isDbInitialized) {
        if (!dbInitPromise) {
            console.log('🔄 Lazy-initializing database pool for serverless instance...');
            dbInitPromise = initializeDatabase()
                .then(() => {
                    isDbInitialized = true;
                    console.log('✅ Lazy database pool initialization succeeded.');
                })
                .catch((err: any) => {
                    console.error('❌ Lazy database pool initialization failed:', err.message);
                    dbInitPromise = null; // Reset to retry on the next request
                    throw err;
                });
        }
        try {
            await dbInitPromise;
        } catch (err: any) {
            return res.status(500).json({ error: 'Database initialization failed: ' + err.message });
        }
    }
    next();
});

app.get('/', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'CodeArena backend is running',
        apiBase: '/api'
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/ai', aiRoutes);

// Database initialization & server start
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: '*', // For dev
        methods: ["GET", "POST"]
    }
});
setupSocket(io);

async function start() {
    try {
        await initializeDatabase();
        server.listen(PORT, () => {
            console.log(`\n🚀 CodeArena MVP API running at http://localhost:${PORT}`);
            console.log(`   Configured with TypeScript modular routing & Socket.IO.`);
            console.log(`   Gemini AI Mentor integration enabled..`);
        });
    } catch (err: any) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
}

// Only start listening locally; Vercel handles invocation through default export
if (!process.env.VERCEL) {
    start();
}

export default app;
