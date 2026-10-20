import { Router } from 'express';
import { handleSwipe } from '../controllers/swipe.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', handleSwipe);

export default router;
