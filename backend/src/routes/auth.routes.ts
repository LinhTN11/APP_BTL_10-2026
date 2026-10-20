import { Router } from 'express';
import {
  register,
  verifyOtp,
  login,
  resendOtp,
  googleLogin,
  getGoogleConfig,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authRateLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.get('/google/config', getGoogleConfig);

// Public Auth Endpoints with rate limiting
router.post('/register', authRateLimiter(10, 60 * 1000), register);
router.post('/verify-otp', authRateLimiter(20, 60 * 1000), verifyOtp);
router.post('/resend-otp', authRateLimiter(5, 60 * 1000), resendOtp);
router.post('/login', authRateLimiter(15, 60 * 1000), login);
router.post('/google', authRateLimiter(20, 60 * 1000), googleLogin);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authRateLimiter(5, 60 * 1000), forgotPassword);
router.post('/reset-password', authRateLimiter(10, 60 * 1000), resetPassword);

// Authenticated Password Change
router.put('/change-password', authMiddleware, changePassword);

export default router;
