import express from 'express';
import { Request, Response } from 'express';
import { protect, admin } from '../middleware/authMiddleware';
const { pool } = require('../config/db');

const router = express.Router();

// List all problems (with tags)
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows]: any = await pool.execute(
            `SELECT p.*, GROUP_CONCAT(pt.tag) AS tags
             FROM problems p
             LEFT JOIN problem_tags pt ON p.problem_id = pt.problem_id
             GROUP BY p.problem_id
             ORDER BY p.problem_id`
        );
        const problems = rows.map((r: any) => ({ ...r, tags: r.tags ? r.tags.split(',') : [] }));
        res.json(problems);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get problem by ID (with tags)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows]: any = await pool.execute(
            `SELECT p.*, GROUP_CONCAT(pt.tag) AS tags
             FROM problems p
             LEFT JOIN problem_tags pt ON p.problem_id = pt.problem_id
             WHERE p.problem_id = ?
             GROUP BY p.problem_id`,
            [req.params.id]
        );
        if (rows.length === 0) { res.status(404).json({ error: 'Problem not found' }); return; }
        const problem = { ...rows[0], tags: rows[0].tags ? rows[0].tags.split(',') : [] };
        res.json(problem);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Create problem (admin only)
router.post('/', protect, admin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, difficulty, max_score, tags, editorial } = req.body;
        if (!title || !description || !difficulty || !max_score) {
            res.status(400).json({ error: 'title, description, difficulty, and max_score are required' }); return;
        }
        if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
            res.status(400).json({ error: 'difficulty must be EASY, MEDIUM, or HARD' }); return;
        }
        const [result]: any = await pool.execute(
            'INSERT INTO problems (title, description, difficulty, max_score, editorial) VALUES (?, ?, ?, ?, ?)',
            [title, description, difficulty, max_score, editorial || null]
        );
        const problemId = result.insertId;
        // Insert tags
        if (tags && Array.isArray(tags) && tags.length > 0) {
            for (const tag of tags) {
                await pool.execute('INSERT INTO problem_tags (problem_id, tag) VALUES (?, ?)', [problemId, tag.trim()]);
            }
        }
        res.status(201).json({ problem_id: problemId, title, difficulty, max_score, tags: tags || [] });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Update problem (admin only)
router.put('/:id', protect, admin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, difficulty, max_score, tags, editorial } = req.body;
        if (!title || !description || !difficulty || !max_score) {
            res.status(400).json({ error: 'title, description, difficulty, and max_score are required' }); return;
        }
        if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
            res.status(400).json({ error: 'difficulty must be EASY, MEDIUM, or HARD' }); return;
        }
        const [result]: any = await pool.execute(
            'UPDATE problems SET title = ?, description = ?, difficulty = ?, max_score = ?, editorial = ? WHERE problem_id = ?',
            [title, description, difficulty, max_score, editorial || null, req.params.id]
        );
        if (result.affectedRows === 0) { res.status(404).json({ error: 'Problem not found' }); return; }
        // Replace tags
        if (tags && Array.isArray(tags)) {
            await pool.execute('DELETE FROM problem_tags WHERE problem_id = ?', [req.params.id]);
            for (const tag of tags) {
                if (tag.trim()) await pool.execute('INSERT INTO problem_tags (problem_id, tag) VALUES (?, ?)', [req.params.id, tag.trim()]);
            }
        }
        res.json({ message: 'Problem updated successfully', problem_id: req.params.id });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Delete problem (admin only)
router.delete('/:id', protect, admin, async (req: Request, res: Response): Promise<void> => {
    try {
        const [result]: any = await pool.execute('DELETE FROM problems WHERE problem_id = ?', [req.params.id]);
        if (result.affectedRows === 0) { res.status(404).json({ error: 'Problem not found' }); return; }
        res.json({ message: 'Problem deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ── Test Cases ──

// Get test cases for a problem (sample only for regular users)
router.get('/:id/test-cases', async (req: Request, res: Response): Promise<void> => {
    try {
        // Check if admin via optional auth
        let isAdmin = false;
        try {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer')) {
                const token = authHeader.split(' ')[1];
                const jwt = require('jsonwebtoken');
                const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_for_codearena');
                const [user]: any = await pool.execute('SELECT role FROM users WHERE user_id = ?', [decoded.userId]);
                if (user.length > 0 && user[0].role === 'ADMIN') isAdmin = true;
            }
        } catch {}

        const query = isAdmin
            ? 'SELECT * FROM test_cases WHERE problem_id = ? ORDER BY test_case_id'
            : 'SELECT * FROM test_cases WHERE problem_id = ? AND is_sample = TRUE ORDER BY test_case_id';
        const [rows]: any = await pool.execute(query, [req.params.id]);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Create test case (admin only)
router.post('/:id/test-cases', protect, admin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { input, expected_output, is_sample } = req.body;
        if (!input || !expected_output) { res.status(400).json({ error: 'input and expected_output are required' }); return; }
        const [result]: any = await pool.execute(
            'INSERT INTO test_cases (problem_id, input, expected_output, is_sample) VALUES (?, ?, ?, ?)',
            [req.params.id, input, expected_output, is_sample || false]
        );
        res.status(201).json({ test_case_id: result.insertId, message: 'Test case created' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Delete test case (admin only)
router.delete('/:id/test-cases/:tcId', protect, admin, async (req: Request, res: Response): Promise<void> => {
    try {
        const [result]: any = await pool.execute(
            'DELETE FROM test_cases WHERE test_case_id = ? AND problem_id = ?',
            [req.params.tcId, req.params.id]
        );
        if (result.affectedRows === 0) { res.status(404).json({ error: 'Test case not found' }); return; }
        res.json({ message: 'Test case deleted' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

