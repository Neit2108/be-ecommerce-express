import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authRateLimiter, passwordResetRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes with rate limiting
router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/refresh-token', authRateLimiter, authController.refreshToken);
router.post('/password-reset/request', passwordResetRateLimiter, authController.requestPasswordReset);
router.post('/password-reset/confirm', passwordResetRateLimiter, authController.resetPassword);

// Protected routes
router.post('/logout', authenticateToken, authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/change-password', authenticateToken, authController.changePassword);
router.post('/verify-email', authenticateToken, authController.verifyEmail);

export default router;