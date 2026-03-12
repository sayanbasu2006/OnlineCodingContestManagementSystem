import { Request, Response, NextFunction } from 'express';

/**
 * Validate required fields in request body
 */
export const validateRequired = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const missing = fields.filter(field => !req.body[field]);
        if (missing.length > 0) {
            res.status(400).json({ 
                error: `Missing required fields: ${missing.join(', ')}` 
            });
            return;
        }
        next();
    };
};

/**
 * Validate email format
 */
export const validateEmail = (req: Request, res: Response, next: NextFunction): void => {
    const { email } = req.body;
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ error: 'Invalid email format' });
            return;
        }
    }
    next();
};

/**
 * Validate password strength
 */
export const validatePassword = (req: Request, res: Response, next: NextFunction): void => {
    const { password } = req.body;
    if (password && password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long' });
        return;
    }
    next();
};

/**
 * Validate difficulty level
 */
export const validateDifficulty = (req: Request, res: Response, next: NextFunction): void => {
    const { difficulty } = req.body;
    const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
    if (difficulty && !validDifficulties.includes(difficulty)) {
        res.status(400).json({ error: 'Difficulty must be EASY, MEDIUM, or HARD' });
        return;
    }
    next();
};

/**
 * Validate contest status
 */
export const validateContestStatus = (req: Request, res: Response, next: NextFunction): void => {
    const { status } = req.body;
    const validStatuses = ['UPCOMING', 'ONGOING', 'ENDED'];
    if (status && !validStatuses.includes(status)) {
        res.status(400).json({ error: 'Status must be UPCOMING, ONGOING, or ENDED' });
        return;
    }
    next();
};

/**
 * Validate role
 */
export const validateRole = (req: Request, res: Response, next: NextFunction): void => {
    const { role } = req.body;
    const validRoles = ['ADMIN', 'USER'];
    if (role && !validRoles.includes(role)) {
        res.status(400).json({ error: 'Role must be ADMIN or USER' });
        return;
    }
    next();
};

/**
 * Validate date-time format
 */
export const validateDateTime = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        for (const field of fields) {
            const value = req.body[field];
            if (value) {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    res.status(400).json({ error: `Invalid date format for ${field}` });
                    return;
                }
            }
        }
        next();
    };
};

/**
 * Validate positive integer
 */
export const validatePositiveInt = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        for (const field of fields) {
            const value = req.body[field];
            if (value !== undefined) {
                const num = parseInt(value, 10);
                if (isNaN(num) || num <= 0) {
                    res.status(400).json({ error: `${field} must be a positive integer` });
                    return;
                }
            }
        }
        next();
    };
};

/**
 * Validate programming language
 */
export const validateLanguage = (req: Request, res: Response, next: NextFunction): void => {
    const { language } = req.body;
    const validLanguages = ['cpp', 'c', 'java', 'python', 'javascript', 'typescript', 'go', 'rust'];
    if (language && !validLanguages.includes(language.toLowerCase())) {
        res.status(400).json({ 
            error: `Invalid language. Supported: ${validLanguages.join(', ')}` 
        });
        return;
    }
    next();
};
