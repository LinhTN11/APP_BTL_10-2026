import { Router } from 'express';
import { getDiscoveryFeed } from '../controllers/discovery.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/feed', getDiscoveryFeed);

export default router;
