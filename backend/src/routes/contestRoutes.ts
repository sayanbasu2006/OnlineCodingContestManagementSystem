import express from 'express';
import { Request, Response } from 'express';
import { protect, admin } from '../middleware/authMiddleware';
const { pool } = require('../config/db');

const router = express.Router();

// Get active contest participation for logged in user
// NOTE: This route MUST be before /:id to avoid Express matching "me" as an :id parameter
router.get('/me/active-participation', protect, async (req: any, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.user_id;
        const result = await pool.query(
            `SELECT p.*, c.duration_minutes 
             FROM participations p 
             JOIN contests c ON p.contest_id = c.contest_id 
             WHERE p.user_id = $1 AND p.status = 'STARTED'`,
            [user_id]
        );
        const rows = result.rows;
        
        if (rows.length === 0) {
            res.json({ active_contest_id: null });
            return;
        }

        const active = rows[0];
        // Check if expired
        const start = new Date(active.start_time).getTime();
        const now = Date.now();
        const durationMs = active.duration_minutes * 60000;

        if (now - start > durationMs) {
            // Auto finish expired contest
            await pool.query('UPDATE participations SET status = \'FINISHED\' WHERE participation_id = $1', [active.participation_id]);
            res.json({ active_contest_id: null });
        } else {
            res.json({ 
                active_contest_id: active.contest_id,
                start_time: active.start_time,
                duration_minutes: active.duration_minutes
            });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// List all contests (with participant count)
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            `SELECT c.*, COUNT(p.participation_id) AS participant_count
             FROM contests c
             LEFT JOIN participations p ON c.contest_id = p.contest_id
             GROUP BY c.contest_id
             ORDER BY c.start_time DESC`
        );
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get contest by ID (with participant count)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            `SELECT c.*, COUNT(p.participation_id) AS participant_count
             FROM contests c
             LEFT JOIN participations p ON c.contest_id = p.contest_id
             WHERE c.contest_id = $1
             GROUP BY c.contest_id`,
            [req.params.id]
        );
        if (result.rows.length === 0) { res.status(404).json({ error: 'Contest not found' }); return; }
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Create contest (admin only)
router.post('/', protect, admin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, start_time, end_time, duration_minutes, status } = req.body;
        if (!title || !description || !start_time || !end_time) {
            res.status(400).json({ error: 'title, description, start_time, and end_time are required' });
            return;
        }

        const dur = duration_minutes || 120;
        const result = await pool.query(
            'INSERT INTO contests (title, description, start_time, end_time, duration_minutes, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING contest_id',
            [title, description, start_time, end_time, dur, status || 'UPCOMING']
        );

        res.status(201).json({ contest_id: result.rows[0].contest_id, title, status: status || 'UPCOMING', duration_minutes: dur });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Update contest (admin only)
router.put('/:id', protect, admin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, start_time, end_time, duration_minutes, status } = req.body;
        const dur = duration_minutes || 120;
        const result = await pool.query(
            'UPDATE contests SET title = $1, description = $2, start_time = $3, end_time = $4, duration_minutes = $5, status = $6 WHERE contest_id = $7',
            [title, description, start_time, end_time, dur, status, req.params.id]
        );
        if (result.rowCount === 0) { res.status(404).json({ error: 'Contest not found' }); return; }
        res.json({ message: 'Contest updated successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Delete contest (admin only)
router.delete('/:id', protect, admin, async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query('DELETE FROM contests WHERE contest_id = $1', [req.params.id]);
        if (result.rowCount === 0) { res.status(404).json({ error: 'Contest not found' }); return; }
        res.json({ message: 'Contest deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get problems in a contest
router.get('/:id/problems', async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            `SELECT p.* FROM problems p
             JOIN contest_problems cp ON p.problem_id = cp.problem_id
             WHERE cp.contest_id = $1 ORDER BY p.problem_id`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Add problem to contest (admin only)
router.post('/:id/problems', protect, admin, async (req: Request, res: Response): Promise<void> => {
    try {
        const contestId = req.params.id;
        const { problem_id } = req.body;
        if (!problem_id) { res.status(400).json({ error: 'problem_id is required' }); return; }

        const contestCheck = await pool.query('SELECT contest_id FROM contests WHERE contest_id = $1', [contestId]);
        if (contestCheck.rows.length === 0) { res.status(404).json({ error: 'Contest not found' }); return; }

        const problemCheck = await pool.query('SELECT problem_id FROM problems WHERE problem_id = $1', [problem_id]);
        if (problemCheck.rows.length === 0) { res.status(404).json({ error: 'Problem not found' }); return; }

        await pool.query('INSERT INTO contest_problems (contest_id, problem_id) VALUES ($1, $2)', [contestId, problem_id]);
        res.status(201).json({ message: 'Problem added to contest successfully' });
    } catch (err: any) {
        if (err.code === '23505' || err.code === 'ER_DUP_ENTRY') { res.status(409).json({ error: 'Problem already assigned to this contest' }); return; }
        res.status(500).json({ error: err.message });
    }
});

// Remove problem from contest (admin only)
router.delete('/:id/problems/:problemId', protect, admin, async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'DELETE FROM contest_problems WHERE contest_id = $1 AND problem_id = $2',
            [req.params.id, req.params.problemId]
        );
        if (result.rowCount === 0) { res.status(404).json({ error: 'Problem not found in this contest' }); return; }
        res.json({ message: 'Problem removed from contest successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Start an exam (Locked Contest Mode)
router.post('/:id/start', protect, async (req: any, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.user_id;
        const contest_id = req.params.id;

        const part = await pool.query('SELECT * FROM participations WHERE user_id = $1 AND contest_id = $2', [user_id, contest_id]);
        if (part.rows.length === 0) { res.status(404).json({ error: 'You have not joined this contest' }); return; }

        if (part.rows[0].status === 'FINISHED') { res.status(400).json({ error: 'You have already finished this exam' }); return; }
        if (part.rows[0].status === 'STARTED') { res.json({ message: 'Already started' }); return; }

        // Needs to be ONGOING
        const contest = await pool.query('SELECT status FROM contests WHERE contest_id = $1', [contest_id]);
        if (contest.rows[0].status !== 'ONGOING') { res.status(400).json({ error: 'Contest is not active' }); return; }

        await pool.query('UPDATE participations SET status = \'STARTED\', start_time = NOW() WHERE user_id = $1 AND contest_id = $2', [user_id, contest_id]);
        res.json({ message: 'Exam started successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Finish an exam
router.post('/:id/finish', protect, async (req: any, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.user_id;
        const contest_id = req.params.id;
        
        await pool.query('UPDATE participations SET status = \'FINISHED\' WHERE user_id = $1 AND contest_id = $2', [user_id, contest_id]);
        res.json({ message: 'Exam finished successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
