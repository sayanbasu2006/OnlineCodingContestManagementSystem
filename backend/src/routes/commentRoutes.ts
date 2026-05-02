import express from 'express';
import { Request, Response } from 'express';
import { protect, AuthRequest } from '../middleware/authMiddleware';
const { pool } = require('../config/db');

const router = express.Router();

// Get comments for a problem
router.get('/:problem_id', async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows]: any = await pool.execute(
            `SELECT c.comment_id, c.content, c.created_at, u.username, u.user_id, u.rating 
             FROM comments c
             JOIN users u ON c.user_id = u.user_id
             WHERE c.problem_id = ?
             ORDER BY c.created_at DESC`,
            [req.params.problem_id]
        );
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Post a comment
router.post('/:problem_id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.user_id;
        const { content } = req.body;
        
        if (!content || !content.trim()) {
            res.status(400).json({ error: 'Comment content cannot be empty' });
            return;
        }

        const [result]: any = await pool.execute(
            'INSERT INTO comments (problem_id, user_id, content) VALUES (?, ?, ?)',
            [req.params.problem_id, user_id, content.trim()]
        );

        res.status(201).json({ 
            comment_id: result.insertId, 
            message: 'Comment posted successfully' 
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
