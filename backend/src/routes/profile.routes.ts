import { Router } from 'express';
import {
  getProfile,
  getProfileById,
  getInterests,
  createOrUpdateProfile,
  updatePreferences,
  uploadPhoto,
  updateMbti,
  updateMood,
  updateLocation,
} from '../controllers/profile.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

// Interests
router.get('/interests', getInterests);

// Profile CRUD
router.get('/me', getProfile);
router.get('/user/:userId', getProfileById);
router.post('/', createOrUpdateProfile);
router.put('/preferences', updatePreferences);
router.post('/upload', uploadPhoto);
router.put('/mbti', updateMbti);
router.put('/mood', updateMood);
router.put('/location', updateLocation);

export default router;
