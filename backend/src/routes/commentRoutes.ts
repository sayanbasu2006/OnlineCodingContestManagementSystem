import express from 'express';
import { Request, Response } from 'express';
import { protect, AuthRequest } from '../middleware/authMiddleware';
const { pool } = require('../config/db');

const router = express.Router();

// Get comments for a problem
router.get('/:problem_id', async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            `SELECT c.comment_id, c.content, c.created_at, u.username, u.user_id, u.rating 
             FROM comments c
             JOIN users u ON c.user_id = u.user_id
             WHERE c.problem_id = $1
             ORDER BY c.created_at DESC`,
            [req.params.problem_id]
        );
        const rows = result.rows;
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

        const result = await pool.query(
            'INSERT INTO comments (problem_id, user_id, content) VALUES ($1, $2, $3) RETURNING comment_id',
            [req.params.problem_id, user_id, content.trim()]
        );

        res.status(201).json({ 
            comment_id: result.rows[0].comment_id, 
            message: 'Comment posted successfully' 
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
