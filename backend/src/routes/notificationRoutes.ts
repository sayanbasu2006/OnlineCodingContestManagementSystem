import express from 'express';
import { Response } from 'express';
import { protect } from '../middleware/authMiddleware';
const { pool } = require('../config/db');

const router = express.Router();

// Get notifications for current user
router.get('/', protect, async (req: any, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.user_id;
        const [rows]: any = await pool.execute(
            `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
            [user_id]
        );
        const [unreadCount]: any = await pool.execute(
            'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [user_id]
        );
        res.json({ notifications: rows, unread_count: unreadCount[0]?.count || 0 });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Mark single notification as read
router.put('/:id/read', protect, async (req: any, res: Response): Promise<void> => {
    try {
        await pool.execute(
            'UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?',
            [req.params.id, req.user?.user_id]
        );
        res.json({ message: 'Marked as read' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Mark all as read
router.put('/read-all', protect, async (req: any, res: Response): Promise<void> => {
    try {
        await pool.execute(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
            [req.user?.user_id]
        );
        res.json({ message: 'All marked as read' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
