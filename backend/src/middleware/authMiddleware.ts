import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
const { pool } = require('../config/db');

// Extend Express Request type to include the authenticated user
export interface AuthRequest extends Request {
    user?: {
        user_id: number;
        username: string;
        role: string;
    };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        let token;

        // Check if the auth header exists and starts with Bearer
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({ error: 'Not authorized, no token provided' });
            return;
        }

        // Verify token
        const decoded: any = verifyToken(token);

        // Fetch the user from the database
        const [rows]: any = await pool.execute('SELECT user_id, username, role FROM users WHERE user_id = ?', [decoded.userId]);

        if (rows.length === 0) {
            res.status(401).json({ error: 'Not authorized, user not found' });
            return;
        }

        // Attach user to request object
        req.user = rows[0];
        next();
    } catch (error) {
        res.status(401).json({ error: 'Not authorized, token failed' });
        return;
    }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized as an admin' });
    }
};
