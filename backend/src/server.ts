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
import commentRoutes from './routes/commentRoutes';
import trackRoutes from './routes/trackRoutes';
import aiRoutes from './routes/aiRoutes';

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

// Export app for Vercel serverless function
export default app;

// Only start listening when running locally (not in Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
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
