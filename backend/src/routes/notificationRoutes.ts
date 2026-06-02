import express from 'express';
import { Response } from 'express';
import { protect } from '../middleware/authMiddleware';
const { pool } = require('../config/db');

const router = express.Router();

// Get notifications for current user
router.get('/', protect, async (req: any, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.user_id;
        const result: any = await pool.query(
            `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
            [user_id]
        );
        const rows = result.rows;
        const unreadCountResult: any = await pool.query(
            'SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
            [user_id]
        );
        const unreadCount = unreadCountResult.rows;
        res.json({ notifications: rows, unread_count: unreadCount[0]?.count || 0 });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Mark all as read
router.put('/read-all', protect, async (req: any, res: Response): Promise<void> => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
            [req.user?.user_id]
        );
        res.json({ message: 'All marked as read' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Mark single notification as read
router.put('/:id/read', protect, async (req: any, res: Response): Promise<void> => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE notification_id = $1 AND user_id = $2',
            [req.params.id, req.user?.user_id]
        );
        res.json({ message: 'Marked as read' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
