import { Router } from 'express';
import {
  createClaim,
  getMyClaims,
  getClaimById,
  updateClaim,
  addEvidence,
  cancelClaim
} from '../controllers/claimController.js';
import { createClaimValidationRules, validateObjectId } from '../utils/validation.js';
import { claimLimiter } from '../middleware/rateLimitMiddleware.js';
import validate from '../middleware/validationMiddleware.js';
import authenticate from '../middleware/authMiddleware.js';

const router = Router();

// Protect all claim endpoints with authentication
router.use(authenticate);

router.post('/', claimLimiter, validate(createClaimValidationRules), createClaim);
router.get('/my', getMyClaims);
router.get('/:id', validate(validateObjectId('id')), getClaimById);
router.put('/:id', validate(validateObjectId('id')), updateClaim);
router.post('/:id/evidence', validate(validateObjectId('id')), addEvidence);
router.post('/:id/cancel', validate(validateObjectId('id')), cancelClaim);
router.put('/:id/cancel', validate(validateObjectId('id')), cancelClaim);

export default router;
