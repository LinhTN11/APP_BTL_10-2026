import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window rate limiter
const ipRequestCounts = new Map<string, RateLimitRecord>();
const userDailyAiCounts = new Map<string, RateLimitRecord>();

/**
 * General rate limiter for sensitive auth endpoints (prevent brute-force and OTP spam)
 * Defaults to 15 requests per 1 minute window per IP
 */
export function authRateLimiter(maxRequests = 15, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = ipRequestCounts.get(ip);

    if (!record || now > record.resetTime) {
      ipRequestCounts.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      const waitSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.status(429).json({
        error: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${waitSeconds} giây.`,
      });
      return;
    }

    record.count++;
    next();
  };
}

/**
 * AI Icebreaker Rate Limiter: Max 20 requests per day per user
 * (Specified in BRD/SRS Section 6: Role & Permission Matrix)
 */
export function aiDailyRateLimiter(maxPerDay = 20) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const record = userDailyAiCounts.get(userId);

    if (!record || now > record.resetTime) {
      userDailyAiCounts.set(userId, {
        count: 1,
        resetTime: now + oneDayMs,
      });
      return next();
    }

    if (record.count >= maxPerDay) {
      res.status(429).json({
        error: 'Bạn đã đạt giới hạn 20 lần gợi ý AI trong ngày hôm nay. Hãy quay lại vào ngày mai nhé!',
        limitReached: true,
      });
      return;
    }

    record.count++;
    next();
  };
}
