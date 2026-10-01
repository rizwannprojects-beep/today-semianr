import { Router } from 'express';
import { getMyProfile, updateMyProfile, updatePassword } from '../controllers/userController.js';
import { updatePasswordValidationRules } from '../utils/validation.js';
import validate from '../middleware/validationMiddleware.js';
import authenticate from '../middleware/authMiddleware.js';

const router = Router();

// Protect all user profile endpoints
router.use(authenticate);

router.get('/me', getMyProfile);
router.get('/profile', getMyProfile);
router.put('/me', updateMyProfile);
router.patch('/me', updateMyProfile);
router.put('/profile', updateMyProfile);
router.patch('/profile', updateMyProfile);
router.put('/me/password', validate(updatePasswordValidationRules), updatePassword);

export default router;
