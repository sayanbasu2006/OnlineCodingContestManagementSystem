import express from 'express';
import { Request, Response } from 'express';
const { pool } = require('../config/db');

const router = express.Router();

// Platform statistics
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
    try {
        const result: any = await pool.query(
            `SELECT
                (SELECT COUNT(*) FROM contests) AS totalContests,
                (SELECT COUNT(*) FROM problems) AS totalProblems,
                (SELECT COUNT(*) FROM submissions) AS totalSubmissions,
                (SELECT COUNT(*) FROM users) AS totalUsers`
        );
        const rows = result.rows;

        const row = result.rows[0] || {};
        res.json({
            totalContests: parseInt(row.totalcontests || 0),
            totalProblems: parseInt(row.totalproblems || 0),
            totalSubmissions: parseInt(row.totalsubmissions || 0),
            totalUsers: parseInt(row.totalusers || 0)
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
