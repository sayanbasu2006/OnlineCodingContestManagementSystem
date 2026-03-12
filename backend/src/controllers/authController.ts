import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/authMiddleware';
const { pool } = require('../config/db');

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            res.status(400).json({ error: 'username, email, and password are required' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const [result]: any = await pool.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashed, role || 'USER']
        );

        const token = generateToken(result.insertId, role || 'USER');

        res.status(201).json({
            user_id: result.insertId,
            username,
            email,
            role: role || 'USER',
            token
        });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'Username or email already exists' });
            return;
        }
        res.status(500).json({ error: err.message });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'email and password are required' });
            return;
        }

        const [rows]: any = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const token = generateToken(user.user_id, user.role);

        res.json({
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
            token
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows]: any = await pool.execute(
            'SELECT user_id, username, email, role, created_at FROM users ORDER BY user_id'
        );
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.user_id;
        
        const [rows]: any = await pool.execute(
            'SELECT user_id, username, email, role, created_at FROM users WHERE user_id = ?',
            [user_id]
        );
        
        if (rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        res.json(rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.user_id;
        const { username, email } = req.body;

        if (!username && !email) {
            res.status(400).json({ error: 'At least username or email is required' });
            return;
        }

        // Build dynamic update query
        const updates: string[] = [];
        const params: any[] = [];
        
        if (username) {
            updates.push('username = ?');
            params.push(username);
        }
        if (email) {
            updates.push('email = ?');
            params.push(email);
        }
        params.push(user_id);

        const [result]: any = await pool.execute(
            `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'Username or email already exists' });
            return;
        }
        res.status(500).json({ error: err.message });
    }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.user_id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: 'currentPassword and newPassword are required' });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({ error: 'New password must be at least 6 characters' });
            return;
        }

        // Get user's current password
        const [rows]: any = await pool.execute(
            'SELECT password FROM users WHERE user_id = ?',
            [user_id]
        );

        if (rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isMatch) {
            res.status(401).json({ error: 'Current password is incorrect' });
            return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await pool.execute(
            'UPDATE users SET password = ? WHERE user_id = ?',
            [hashedPassword, user_id]
        );

        res.json({ message: 'Password changed successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
