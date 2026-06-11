import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const { pool } = require('../config/db');

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET environment variable is not set');
    return secret;
}
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

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({ error: 'Not authorized, no token provided' });
            return;
        }

        const decoded: any = jwt.verify(token, getJwtSecret());

        const result = await pool.query(
            'SELECT user_id, username, role FROM users WHERE user_id = $1',
            [decoded.userId]
        );
        const rows = result.rows;

        if (rows.length === 0) {
            res.status(401).json({ error: 'Not authorized, user not found' });
            return;
        }

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
