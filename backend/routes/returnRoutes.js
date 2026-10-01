import { Router } from 'express';
import {
  createReturn,
  getMyReturns,
  getReturnById,
  scheduleReturn,
  cancelReturn,
  startVerification,
  verifyReturnCode,
  confirmHandover,
  confirmReceived,
  disputeReturn
} from '../controllers/returnController.js';
import { validateObjectId } from '../utils/validation.js';
import validate from '../middleware/validationMiddleware.js';
import authenticate from '../middleware/authMiddleware.js';
import { verificationLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// Require authentication for all return and handover operations
router.use(authenticate);

// Return initialization & listings
router.post('/', createReturn);
router.get('/', getMyReturns);
router.get('/my', getMyReturns);
router.get('/:id', validate(validateObjectId('id')), getReturnById);

// Return scheduling & cancellation
router.post('/:id/schedule', validate(validateObjectId('id')), scheduleReturn);
router.patch('/:id/cancel', validate(validateObjectId('id')), cancelReturn);

// Identity verification & code confirmation (rate limited to prevent brute-forcing)
router.post('/:id/start-verification', validate(validateObjectId('id')), startVerification);
router.post('/:id/verify', verificationLimiter, validate(validateObjectId('id')), verifyReturnCode);

// Double confirmation handover flow
router.post('/:id/confirm-handover', validate(validateObjectId('id')), confirmHandover);
router.post('/:id/confirm-received', validate(validateObjectId('id')), confirmReceived);

// Dispute escalation
router.post('/:id/dispute', validate(validateObjectId('id')), disputeReturn);

export default router;
