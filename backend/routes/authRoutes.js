import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import {
  registerValidationRules,
  loginValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules
} from '../utils/validation.js';
import validate from '../middleware/validationMiddleware.js';
import authenticate from '../middleware/authMiddleware.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

router.post('/register', authLimiter, validate(registerValidationRules), register);
router.post('/login', authLimiter, validate(loginValidationRules), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordValidationRules), forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordValidationRules), resetPassword);

export default router;
