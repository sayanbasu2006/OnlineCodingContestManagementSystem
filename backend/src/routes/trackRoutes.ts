import express from 'express';
import { Request, Response } from 'express';
import { protect } from '../middleware/authMiddleware';
const { pool } = require('../config/db');

const router = express.Router();

// Get all tracks
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM learning_tracks ORDER BY difficulty ASC');
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single track with its problems
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const [trackRows]: any = await pool.execute('SELECT * FROM learning_tracks WHERE track_id = ?', [req.params.id]);
        if (trackRows.length === 0) { res.status(404).json({ error: 'Track not found' }); return; }

        const track = trackRows[0];

        const [problemRows]: any = await pool.execute(`
            SELECT p.*, tp.sequence_order
            FROM track_problems tp
            JOIN problems p ON tp.problem_id = p.problem_id
            WHERE tp.track_id = ?
            ORDER BY tp.sequence_order ASC
        `, [req.params.id]);

        track.problems = problemRows;
        res.json(track);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get user progress for a track
router.get('/:id/progress', protect, async (req: any, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.user_id;
        if (!user_id) { res.status(401).json({ error: 'Unauthorized' }); return; }

        const [solvedRows]: any = await pool.execute(`
            SELECT DISTINCT s.problem_id
            FROM submissions s
            JOIN track_problems tp ON s.problem_id = tp.problem_id
            WHERE s.user_id = ? AND tp.track_id = ? AND s.score > 0
        `, [user_id, req.params.id]);

        res.json({ solved_problem_ids: solvedRows.map((r: any) => r.problem_id) });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
