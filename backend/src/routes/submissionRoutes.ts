import express from 'express';
import { Request, Response } from 'express';
import { protect, AuthRequest } from '../middleware/authMiddleware';
const { pool } = require('../config/db');

const router = express.Router();

// List submissions (with optional filters + pagination)
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        let query = `
            SELECT s.*, u.username, c.title AS contest_title, p.title AS problem_title
            FROM submissions s
            JOIN users u ON s.user_id = u.user_id
            JOIN contests c ON s.contest_id = c.contest_id
            JOIN problems p ON s.problem_id = p.problem_id
        `;
        const conditions: string[] = [];
        const params: any[] = [];

        if (req.query.user_id) { params.push(req.query.user_id); conditions.push(`s.user_id = $${params.length}`); }
        if (req.query.contest_id) { params.push(req.query.contest_id); conditions.push(`s.contest_id = $${params.length}`); }
        if (req.query.problem_id) { params.push(req.query.problem_id); conditions.push(`s.problem_id = $${params.length}`); }

        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');

        // Count total
        const countQuery = query.replace(/SELECT s\.\*.*FROM/, 'SELECT COUNT(*) AS total FROM');
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0]?.total) || 0;

        query += ' ORDER BY s.submission_time DESC';

        // Pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;
        
        params.push(limit);
        query += ` LIMIT $${params.length}`;
        params.push(offset);
        query += ` OFFSET $${params.length}`;

        const result = await pool.query(query, params);
        res.json({ data: result.rows, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Submit a solution
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.user_id;
        const { contest_id, problem_id, code, language, score } = req.body;

        let target_contest_id = contest_id;
        let isPractice = false;

        if (!target_contest_id || target_contest_id === 0) {
            // Practice mode: Find any contest containing this problem to satisfy the NOT NULL constraint.
            // Prefer ended contests, but fallback to any contest containing the problem.
            const cpResult = await pool.query(
                `SELECT cp.contest_id
                 FROM contest_problems cp
                 JOIN contests c ON c.contest_id = cp.contest_id
                 WHERE cp.problem_id = $1
                 ORDER BY CASE WHEN c.status = 'ENDED' THEN 1 ELSE 2 END ASC, c.end_time DESC
                 LIMIT 1`,
                [problem_id]
            );
            const cp = cpResult.rows;
            if (cp.length > 0) {
                target_contest_id = cp[0].contest_id;
                isPractice = true;
            } else {
                res.status(400).json({ error: 'This problem is not currently active in any contest or track.' });
                return;
            }
        } else {
            // Verify contest exists
            const contestCheckResult = await pool.query(
                'SELECT status, start_time, end_time, duration_minutes FROM contests WHERE contest_id = $1', [target_contest_id]
            );
            const contestCheck = contestCheckResult.rows;
            if (contestCheck.length === 0) { res.status(404).json({ error: 'Contest not found' }); return; }

            const contest = contestCheck[0];
            const now = new Date();
            
            // Only enforce strict date checks if the contest is NOT manually marked as ONGOING
            if (contest.status !== 'ONGOING') {
                if (now < new Date(contest.start_time)) { res.status(403).json({ error: 'Contest has not started yet' }); return; }
                if (now > new Date(contest.end_time) || contest.status === 'ENDED') {
                    res.status(403).json({ error: 'Contest has ended, submissions are no longer accepted' }); return;
                }
            }

            // Verify problem belongs to this contest
            const problemInContestResult = await pool.query(
                'SELECT * FROM contest_problems WHERE contest_id = $1 AND problem_id = $2', [target_contest_id, problem_id]
            );
            if (problemInContestResult.rows.length === 0) { res.status(400).json({ error: 'Problem does not belong to this contest' }); return; }

            // Verify user is participating
            const participationCheckResult = await pool.query(
                'SELECT * FROM participations WHERE user_id = $1 AND contest_id = $2', [user_id, target_contest_id]
            );
            if (participationCheckResult.rows.length === 0) {
                res.status(403).json({ error: 'User must join the contest before submitting solutions' }); return;
            }

            const participation = participationCheckResult.rows[0];
            if (participation.status === 'FINISHED') {
                res.status(403).json({ error: 'You have already finished this contest' }); return;
            }
            if (participation.status !== 'STARTED') {
                res.status(403).json({ error: 'Start the contest timer before submitting solutions' }); return;
            }
            if (participation.start_time) {
                const examEnd = new Date(participation.start_time).getTime() + contest.duration_minutes * 60000;
                if (Date.now() > examEnd) {
                    await pool.query(
                        'UPDATE participations SET status = $1 WHERE user_id = $2 AND contest_id = $3',
                        ['FINISHED', user_id, target_contest_id]
                    );
                    res.status(403).json({ error: 'Contest timer has expired' }); return;
                }
            }
        }

        // Get problem info and test cases
        const problemDataResult = await pool.query('SELECT * FROM problems WHERE problem_id = $1', [problem_id]);
        const problemData = problemDataResult.rows;
        const maxScore = problemData[0]?.max_score || 100;
        const problemTitle = problemData[0]?.title || 'Unknown';

        // Check test cases
        const testCasesResult = await pool.query('SELECT * FROM test_cases WHERE problem_id = $1', [problem_id]);
        const testCases = testCasesResult.rows;

        let simulatedScore: number;
        let testCasesPassed = 0;
        let totalTestCases = testCases.length;

        if (totalTestCases > 0) {
            // Score based on test cases (simulated — random pass/fail for demo)
            const codeLength = (code || '').trim().length;
            const passRate = Math.min(codeLength / 100, 0.95) * (0.7 + Math.random() * 0.3);
            testCasesPassed = Math.round(totalTestCases * passRate);
            if (testCasesPassed < 1 && codeLength > 10) testCasesPassed = 1;
            simulatedScore = Math.round(maxScore * (testCasesPassed / totalTestCases));
        } else {
            // Fallback: original heuristic
            const codeLength = (code || '').trim().length;
            simulatedScore = Math.min(Math.floor(maxScore * Math.min(codeLength / 80, 1) * (0.6 + Math.random() * 0.4)), maxScore);
            if (simulatedScore < 10) simulatedScore = Math.floor(maxScore * 0.3);
        }

        const result = await pool.query(
            'INSERT INTO submissions (user_id, contest_id, problem_id, code, language, score) VALUES ($1, $2, $3, $4, $5, $6) RETURNING submission_id',
            [user_id, target_contest_id, problem_id, code || '', language || 'cpp', simulatedScore]
        );
        const newSubmissionId = result.rows[0].submission_id;

        // Create notification
        const notifMsg = totalTestCases > 0
            ? `Your solution for "${problemTitle}" scored ${simulatedScore}/${maxScore} (${testCasesPassed}/${totalTestCases} test cases passed)`
            : `Your solution for "${problemTitle}" scored ${simulatedScore}/${maxScore}`;
        const notifType = simulatedScore >= maxScore * 0.8 ? 'success' : simulatedScore >= maxScore * 0.4 ? 'warning' : 'error';
        await pool.query(
            'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
            [user_id, notifMsg, notifType]
        );

        // ── Tier 3: Automated Ranking Update ──
        // Increase rating based on the score (simple MVP ELO mechanism)
        const ratingIncrease = Math.max(1, Math.floor(simulatedScore / 10));
        await pool.query('UPDATE users SET rating = rating + $1 WHERE user_id = $2', [ratingIncrease, user_id]);

        // ── Tier 3: Badges & Achievements ──
        const awardBadge = async (badgeName: string) => {
            try {
                const badgeRes = await pool.query('INSERT INTO user_badges (user_id, badge_name) VALUES ($1, $2) ON CONFLICT (user_id, badge_name) DO NOTHING', [user_id, badgeName]);
                if (badgeRes.rowCount > 0) {
                    await pool.query('INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)', [user_id, `🏆 Achievement Unlocked: ${badgeName}!`, 'success']);
                }
            } catch (e) {} // Ignore duplicate entry errors
        };

        const subCountResult = await pool.query('SELECT COUNT(*) as count FROM submissions WHERE user_id = $1', [user_id]);
        const totalSubs = parseInt(subCountResult.rows[0].count); // This includes the one we just inserted

        if (totalSubs === 1) await awardBadge('First Blood');
        if (totalSubs === 10) await awardBadge('10-Streak');
        if (problemData[0]?.difficulty === 'HARD' && simulatedScore >= maxScore * 0.8) await awardBadge('Hardcore');

        const simulatedExecutionTime = Math.floor(Math.random() * 40) + 5; // 5ms to 45ms
        const simulatedMemoryUsed = Math.floor(Math.random() * 8 * 1024 * 1024) + 4 * 1024 * 1024; // 4MB to 12MB

        res.status(201).json({
            submission_id: newSubmissionId,
            score: simulatedScore,
            test_cases_passed: testCasesPassed,
            total_test_cases: totalTestCases,
            rating_change: `+${ratingIncrease}`,
            execution_time: simulatedExecutionTime,
            memory_used: simulatedMemoryUsed,
            message: 'Solution submitted successfully'
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// List participations
router.get('/participations', async (req: Request, res: Response): Promise<void> => {
    try {
        let query = `
            SELECT pa.*, u.username, c.title AS contest_title
            FROM participations pa
            JOIN users u ON pa.user_id = u.user_id
            JOIN contests c ON pa.contest_id = c.contest_id
        `;
        const conditions: string[] = [];
        const params: any[] = [];
        if (req.query.user_id) { params.push(req.query.user_id); conditions.push(`pa.user_id = $${params.length}`); }
        if (req.query.contest_id) { params.push(req.query.contest_id); conditions.push(`pa.contest_id = $${params.length}`); }

        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY pa.join_time DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Join a contest
router.post('/participations', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.user_id;
        const { contest_id } = req.body;

        if (!user_id || !contest_id) {
            res.status(400).json({ error: 'user_id and contest_id are required' }); return;
        }

        const contestCheckResult = await pool.query(
            'SELECT status, end_time FROM contests WHERE contest_id = $1', [contest_id]
        );
        const contestCheck = contestCheckResult.rows;
        if (contestCheck.length === 0) { res.status(404).json({ error: 'Contest not found' }); return; }

        const contest = contestCheck[0];
        if (new Date() > new Date(contest.end_time) || contest.status === 'ENDED') {
            res.status(403).json({ error: 'Cannot join a contest that has ended' }); return;
        }

        const result = await pool.query(
            'INSERT INTO participations (user_id, contest_id) VALUES ($1, $2) RETURNING participation_id', [user_id, contest_id]
        );

        res.status(201).json({ participation_id: result.rows[0].participation_id, message: 'Successfully joined contest' });
    } catch (err: any) {
        if (err.code === '23505' || err.code === 'ER_DUP_ENTRY') { res.status(409).json({ error: 'User already joined this contest' }); return; }
        res.status(500).json({ error: err.message });
    }
});

// Get single submission by ID (must be after /participations to avoid route conflict)
router.get('/:id', protect, async (req: any, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            `SELECT s.*, u.username, c.title AS contest_title, p.title AS problem_title
             FROM submissions s
             JOIN users u ON s.user_id = u.user_id
             JOIN contests c ON s.contest_id = c.contest_id
             JOIN problems p ON s.problem_id = p.problem_id
             WHERE s.submission_id = $1`,
            [req.params.id]
        );
        if (result.rows.length === 0) { res.status(404).json({ error: 'Submission not found' }); return; }
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
