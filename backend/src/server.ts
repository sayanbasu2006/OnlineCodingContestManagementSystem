import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

import trackRoutes from './routes/trackRoutes';
import aiRoutes from './routes/aiRoutes';
import { rateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173']
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(rateLimiter);

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

app.use('/api/tracks', trackRoutes);
app.use('/api/ai', aiRoutes);

if (!process.env.VERCEL) {
    async function start() {
        try {
            await initializeDatabase();
            app.listen(PORT, () => {
                console.log(`\n🚀 CodeArena API running at http://localhost:${PORT}`);
                console.log(`   Gemini AI Mentor integration enabled.`);
            });
        } catch (err: any) {
            console.error('Failed to start server:', err.message);
            process.exit(1);
        }
    }
    start();
}


export default app;
