import express from 'express';
import { Request, Response } from 'express';
import { protect, admin } from '../middleware/authMiddleware';
const { pool } = require('../config/db');

const router = express.Router();

// ── Export Leaderboard to CSV ──
router.get('/leaderboard/:contest_id', protect, admin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { contest_id } = req.params;
        let rows;

        if (contest_id === 'global') {
            [rows] = await pool.execute(
                `SELECT u.username, u.email, u.rating, SUM(s.score) AS total_score, COUNT(s.submission_id) AS submissions
                 FROM users u
                 LEFT JOIN submissions s ON u.user_id = s.user_id
                 GROUP BY u.user_id, u.username, u.email, u.rating
                 ORDER BY u.rating DESC, total_score DESC`
            );
        } else {
            [rows] = await pool.execute(
                `SELECT u.username, u.email, SUM(s.score) AS total_score, COUNT(s.submission_id) AS submissions
                 FROM submissions s
                 JOIN users u ON s.user_id = u.user_id
                 WHERE s.contest_id = ?
                 GROUP BY u.user_id, u.username, u.email
                 ORDER BY total_score DESC`,
                [contest_id]
            );
        }

        if (rows.length === 0) {
            res.status(404).json({ error: 'No data to export' });
            return;
        }

        // Generate CSV
        const headers = Object.keys(rows[0]).join(',');
        const csvRows = rows.map((row: any) => Object.values(row).join(','));
        const csvData = [headers, ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="leaderboard_${contest_id}.csv"`);
        res.status(200).send(csvData);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ── Export Submissions to CSV ──
router.get('/submissions', protect, admin, async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows]: any = await pool.execute(
            `SELECT s.submission_id, u.username, c.title AS contest, p.title AS problem, s.language, s.score, s.submission_time
             FROM submissions s
             JOIN users u ON s.user_id = u.user_id
             JOIN contests c ON s.contest_id = c.contest_id
             JOIN problems p ON s.problem_id = p.problem_id
             ORDER BY s.submission_time DESC`
        );

        if (rows.length === 0) {
            res.status(404).json({ error: 'No submissions to export' });
            return;
        }

        // Generate CSV
        const headers = Object.keys(rows[0]).join(',');
        const csvRows = rows.map((row: any) => {
            return Object.values(row).map((val: any) => {
                if (val instanceof Date) return `"${val.toISOString()}"`;
                if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
                return val;
            }).join(',');
        });
        const csvData = [headers, ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="all_submissions.csv"');
        res.status(200).send(csvData);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
