import express from 'express';
import { Request, Response } from 'express';
import { protect } from '../middleware/authMiddleware';
const { pool } = require('../config/db');

const router = express.Router();

import jwt from 'jsonwebtoken';

// Get all tracks with dynamic statistics
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        let userId = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                if (token && process.env.JWT_SECRET) {
                    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
                    userId = decoded.userId;
                }
            } catch (e) {
                // Ignore invalid tokens for public route
            }
        }

        const result = await pool.query('SELECT * FROM learning_tracks ORDER BY difficulty ASC');
        const tracks = result.rows;

        for (const track of tracks) {
            // Count total problems
            const totalResult = await pool.query(
                'SELECT COUNT(*) as count FROM track_problems WHERE track_id = $1',
                [track.track_id]
            );
            track.total_problems = parseInt(totalResult.rows[0].count) || 0;

            // Count solved problems if user is authenticated
            track.solved_problems = 0;
            if (userId) {
                const solvedResult = await pool.query(`
                    SELECT COUNT(DISTINCT s.problem_id) as count
                    FROM submissions s
                    JOIN track_problems tp ON s.problem_id = tp.problem_id
                    WHERE s.user_id = $1 AND tp.track_id = $2 AND s.score > 0
                `, [userId, track.track_id]);
                track.solved_problems = parseInt(solvedResult.rows[0].count) || 0;
            }
        }

        res.json(tracks);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single track with its problems
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const trackResult = await pool.query('SELECT * FROM learning_tracks WHERE track_id = $1', [req.params.id]);
        const trackRows = trackResult.rows;
        if (trackRows.length === 0) { res.status(404).json({ error: 'Track not found' }); return; }

        const track = trackRows[0];

        // Fetch concepts
        const conceptResult = await pool.query(`
            SELECT * FROM track_concepts
            WHERE track_id = $1
            ORDER BY sequence_order ASC
        `, [req.params.id]);
        const concepts = conceptResult.rows;

        // Fetch problems for each concept
        for (const concept of concepts) {
            const problemResult = await pool.query(`
                SELECT p.*, cp.sequence_order
                FROM concept_problems cp
                JOIN problems p ON cp.problem_id = p.problem_id
                WHERE cp.concept_id = $1
                ORDER BY cp.sequence_order ASC
            `, [concept.concept_id]);
            concept.problems = problemResult.rows;
        }

        track.concepts = concepts;

        const problemResult = await pool.query(`
            SELECT p.*, tp.sequence_order
            FROM track_problems tp
            JOIN problems p ON tp.problem_id = p.problem_id
            WHERE tp.track_id = $1
            ORDER BY tp.sequence_order ASC
        `, [req.params.id]);
        const problemRows = problemResult.rows;

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

        const solvedResult = await pool.query(`
            SELECT DISTINCT s.problem_id
            FROM submissions s
            JOIN track_problems tp ON s.problem_id = tp.problem_id
            WHERE s.user_id = $1 AND tp.track_id = $2 AND s.score > 0
        `, [user_id, req.params.id]);
        const solvedRows = solvedResult.rows;

        res.json({ solved_problem_ids: solvedRows.map((r: any) => r.problem_id) });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
