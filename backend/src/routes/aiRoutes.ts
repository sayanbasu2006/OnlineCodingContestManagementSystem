import express from 'express';
import { Request, Response } from 'express';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import { GoogleGenerativeAI } from '@google/generative-ai';
const { pool } = require('../config/db');
// Force backend restart to reload .env API key

const router = express.Router();

const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "AIzaSyDummyKeyForDevelopment"; 
const genAI = new GoogleGenerativeAI(API_KEY);

router.post('/hint', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { problemId, code, language } = req.body;
        
        if (!problemId) {
            res.status(400).json({ error: 'Problem ID is required' });
            return;
        }

        const [problemRows]: any = await pool.execute('SELECT * FROM problems WHERE problem_id = ?', [problemId]);
        if (problemRows.length === 0) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }

        const problem = problemRows[0];

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `
You are an expert AI programming mentor. The user is solving the following problem:
Title: ${problem.title}
Description: ${problem.description}

Here is the code they have written so far in ${language}:
\`\`\`${language}
${code || '(empty)'}
\`\`\`

Provide a short, helpful hint to guide them in the right direction. Do NOT give them the direct solution or complete code. Explain a concept, point out a potential bug, or suggest a data structure. Keep the response under 100 words and format it nicely.
`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            res.json({ hint: text });
        } catch (aiError: any) {
            console.error("AI Error:", aiError);
            res.status(500).json({ error: "Failed to communicate with AI Mentor. Ensure a valid GEMINI_API_KEY is configured." });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
