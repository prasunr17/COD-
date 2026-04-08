import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [ip: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;
const AUTH_MAX_REQUESTS = 5;

function cleanupStore() {
  const now = Date.now();
  for (const ip in store) {
    if (store[ip].resetTime < now) {
      delete store[ip];
    }
  }
}

function createRateLimiter(max: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    cleanupStore();

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[ip]) {
      store[ip] = { count: 0, resetTime: now + WINDOW_MS };
    }

    if (now > store[ip].resetTime) {
      store[ip] = { count: 0, resetTime: now + WINDOW_MS };
    }

    store[ip].count++;

    if (store[ip].count > max) {
      return res.status(429).json({
        error: 'Too many requests, please try again later.'
      });
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - store[ip].count);
    res.setHeader('X-RateLimit-Reset', store[ip].resetTime);

    next();
  };
}

export const rateLimiter = createRateLimiter(MAX_REQUESTS);
export const authLimiter = createRateLimiter(AUTH_MAX_REQUESTS);
