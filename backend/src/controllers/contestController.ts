import { Request, Response } from 'express';
const { pool } = require('../config/db');

export const getContests = async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM contests ORDER BY start_time DESC');
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getContestById = async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM contests WHERE contest_id = ?', [req.params.id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Contest not found' });
            return;
        }
        res.json(rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createContest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, start_time, end_time, status } = req.body;

        if (!title || !description || !start_time || !end_time) {
            res.status(400).json({ error: 'title, description, start_time, and end_time are required' });
            return;
        }

        const [result]: any = await pool.execute(
            'INSERT INTO contests (title, description, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)',
            [title, description, start_time, end_time, status || 'UPCOMING']
        );

        res.status(201).json({
            contest_id: result.insertId,
            title,
            status: status || 'UPCOMING'
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateContest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, start_time, end_time, status } = req.body;

        const [result]: any = await pool.execute(
            'UPDATE contests SET title = ?, description = ?, start_time = ?, end_time = ?, status = ? WHERE contest_id = ?',
            [title, description, start_time, end_time, status, req.params.id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Contest not found' });
            return;
        }
        res.json({ message: 'Contest updated successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteContest = async (req: Request, res: Response): Promise<void> => {
    try {
        const [result]: any = await pool.execute(
            'DELETE FROM contests WHERE contest_id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Contest not found' });
            return;
        }
        res.json({ message: 'Contest deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Contest-Problem Management
export const getContestProblems = async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows]: any = await pool.execute(
            `SELECT p.* FROM problems p
             JOIN contest_problems cp ON p.problem_id = cp.problem_id
             WHERE cp.contest_id = ?
             ORDER BY p.problem_id`,
            [req.params.id]
        );
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const addProblemToContest = async (req: Request, res: Response): Promise<void> => {
    try {
        const contestId = req.params.id;
        const { problem_id } = req.body;

        if (!problem_id) {
            res.status(400).json({ error: 'problem_id is required' });
            return;
        }

        // Check if contest exists
        const [contestCheck]: any = await pool.execute(
            'SELECT contest_id FROM contests WHERE contest_id = ?',
            [contestId]
        );
        if (contestCheck.length === 0) {
            res.status(404).json({ error: 'Contest not found' });
            return;
        }

        // Check if problem exists
        const [problemCheck]: any = await pool.execute(
            'SELECT problem_id FROM problems WHERE problem_id = ?',
            [problem_id]
        );
        if (problemCheck.length === 0) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }

        await pool.execute(
            'INSERT INTO contest_problems (contest_id, problem_id) VALUES (?, ?)',
            [contestId, problem_id]
        );

        res.status(201).json({ message: 'Problem added to contest successfully' });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'Problem already assigned to this contest' });
            return;
        }
        res.status(500).json({ error: err.message });
    }
};

export const removeProblemFromContest = async (req: Request, res: Response): Promise<void> => {
    try {
        const contestId = req.params.id;
        const problemId = req.params.problemId;

        const [result]: any = await pool.execute(
            'DELETE FROM contest_problems WHERE contest_id = ? AND problem_id = ?',
            [contestId, problemId]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Problem not found in this contest' });
            return;
        }
        res.json({ message: 'Problem removed from contest successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
