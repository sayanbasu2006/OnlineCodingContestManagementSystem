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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
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
app.use('/api/users', userRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Database initialization & server start
async function start() {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`\n🚀 CodeArena MVP API running at http://localhost:${PORT}`);
            console.log(`   Configured with TypeScript modular routing.`);
        });
    } catch (err: any) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
}

start();
