import express from 'express';
import { Request, Response } from 'express';
import { protect, admin } from '../middleware/authMiddleware';
const { pool } = require('../config/db');

const router = express.Router();

// Get all users (admin only)
router.get('/', protect, admin, async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows]: any = await pool.execute(
            'SELECT user_id, username, email, role, created_at FROM users ORDER BY user_id'
        );
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});
// Get user badges
router.get('/:id/badges', async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows]: any = await pool.execute(
            'SELECT badge_name, earned_at FROM user_badges WHERE user_id = ? ORDER BY earned_at DESC',
            [req.params.id]
        );
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
