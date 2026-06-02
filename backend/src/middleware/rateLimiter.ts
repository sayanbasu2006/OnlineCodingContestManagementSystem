import { Request, Response, NextFunction } from 'express';

const rateLimitWindowMs = 15 * 60 * 1000; // 15 minutes
const rateLimitMaxRequests = 100; // Limit each IP to 100 requests per window

interface RateLimitInfo {
    count: number;
    resetTime: number;
}

const requestCounts = new Map<string, RateLimitInfo>();

// Periodic cleanup of expired rate limit records to prevent memory leaks
const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of requestCounts.entries()) {
        if (now > record.resetTime) {
            requestCounts.delete(ip);
        }
    }
}, 15 * 60 * 1000); // Run cleanup every 15 minutes

if (cleanupInterval.unref) {
    cleanupInterval.unref();
}

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || 'unknown';
    
    // Bypass rate limiting for local development requests
    if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'localhost') {
        return next();
    }

    const now = Date.now();
    const record = requestCounts.get(ip);

    if (!record) {
        requestCounts.set(ip, { count: 1, resetTime: now + rateLimitWindowMs });
        return next();
    }

    if (now > record.resetTime) {
        requestCounts.set(ip, { count: 1, resetTime: now + rateLimitWindowMs });
        return next();
    }

    record.count++;
    if (record.count > rateLimitMaxRequests) {
        res.status(429).json({ error: 'Too many requests from this IP, please try again in 15 minutes.' });
        return;
    }

    next();
}
