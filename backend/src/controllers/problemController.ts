import { Request, Response } from 'express';
const { pool } = require('../config/db');

export const getProblems = async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM problems ORDER BY problem_id');
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getProblemById = async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM problems WHERE problem_id = ?', [req.params.id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }
        res.json(rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const addProblem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, difficulty, max_score } = req.body;

        if (!title || !description || !difficulty || !max_score) {
            res.status(400).json({ error: 'title, description, difficulty, and max_score are required' });
            return;
        }

        const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
        if (!validDifficulties.includes(difficulty)) {
            res.status(400).json({ error: 'difficulty must be EASY, MEDIUM, or HARD' });
            return;
        }

        const [result]: any = await pool.execute(
            'INSERT INTO problems (title, description, difficulty, max_score) VALUES (?, ?, ?, ?)',
            [title, description, difficulty, max_score]
        );

        res.status(201).json({
            problem_id: result.insertId,
            title,
            difficulty,
            max_score
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProblem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, difficulty, max_score } = req.body;
        const problemId = req.params.id;

        if (!title || !description || !difficulty || !max_score) {
            res.status(400).json({ error: 'title, description, difficulty, and max_score are required' });
            return;
        }

        const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
        if (!validDifficulties.includes(difficulty)) {
            res.status(400).json({ error: 'difficulty must be EASY, MEDIUM, or HARD' });
            return;
        }

        const [result]: any = await pool.execute(
            'UPDATE problems SET title = ?, description = ?, difficulty = ?, max_score = ? WHERE problem_id = ?',
            [title, description, difficulty, max_score, problemId]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }

        res.json({ message: 'Problem updated successfully', problem_id: problemId });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteProblem = async (req: Request, res: Response): Promise<void> => {
    try {
        const problemId = req.params.id;

        const [result]: any = await pool.execute(
            'DELETE FROM problems WHERE problem_id = ?',
            [problemId]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }

        res.json({ message: 'Problem deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
