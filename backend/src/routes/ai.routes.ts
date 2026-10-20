import { Router } from 'express';
import { getIcebreakers } from '../controllers/ai.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { aiDailyRateLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.use(authMiddleware);

// Max 20 requests per day per user as per project specs
router.post('/icebreaker', aiDailyRateLimiter(20), getIcebreakers);

export default router;
