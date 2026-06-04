import express from 'express';
import { Request, Response } from 'express';
const { pool } = require('../config/db');

const router = express.Router();

// Global leaderboard
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const result: any = await pool.query(
            `SELECT u.user_id, u.username, u.rating, u.avatar_url,
                    COALESCE(SUM(max_scores.max_score), 0) AS total_score, 
                    COALESCE(SUM(max_scores.submissions_count), 0) AS submissions
             FROM users u
             LEFT JOIN (
                 SELECT user_id, problem_id, MAX(score) AS max_score, COUNT(submission_id) AS submissions_count
                 FROM submissions
                 GROUP BY user_id, problem_id
             ) max_scores ON u.user_id = max_scores.user_id
             GROUP BY u.user_id, u.username, u.rating, u.avatar_url
             ORDER BY total_score DESC, u.rating DESC`
        );
        const rows = result.rows;
        const leaderboard = rows.map((row: any, i: number) => ({ rank: i + 1, ...row }));
        res.json(leaderboard);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Contest leaderboard
router.get('/:contestId', async (req: Request, res: Response): Promise<void> => {
    try {
        const contestCheck = await pool.query('SELECT status FROM contests WHERE contest_id = $1', [req.params.contestId]);
        if (contestCheck.rows.length === 0) {
            res.status(404).json({ error: 'Contest not found' });
            return;
        }
        if (contestCheck.rows[0].status !== 'ENDED') {
            res.status(403).json({ error: 'Leaderboard will be available after the contest ends' });
            return;
        }

        const result: any = await pool.query(
            `SELECT u.user_id, u.username, u.avatar_url,
                    COALESCE(SUM(max_scores.max_score), 0) AS total_score, 
                    COALESCE(SUM(max_scores.submissions_count), 0) AS submissions
             FROM users u
             JOIN (
                 SELECT user_id, problem_id, MAX(score) AS max_score, COUNT(submission_id) AS submissions_count
                 FROM submissions
                 WHERE contest_id = $1
                 GROUP BY user_id, problem_id
             ) max_scores ON u.user_id = max_scores.user_id
             GROUP BY u.user_id, u.username, u.avatar_url
             ORDER BY total_score DESC`,
            [req.params.contestId]
        );
        const rows = result.rows;
        const leaderboard = rows.map((row: any, i: number) => ({ rank: i + 1, ...row }));
        res.json(leaderboard);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
