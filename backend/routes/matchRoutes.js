import { Router } from 'express';
import {
  getMyMatches,
  getMatchById,
  viewMatch,
  dismissMatch,
  startClaimFromMatch
} from '../controllers/matchController.js';
import { validateObjectId } from '../utils/validation.js';
import validate from '../middleware/validationMiddleware.js';
import authenticate from '../middleware/authMiddleware.js';

const router = Router();

// Protect all match endpoints with authentication
router.use(authenticate);

router.get('/', getMyMatches);
router.get('/my', getMyMatches);
router.get('/:id', validate(validateObjectId('id')), getMatchById);
router.patch('/:id/view', validate(validateObjectId('id')), viewMatch);
router.patch('/:id/dismiss', validate(validateObjectId('id')), dismissMatch);
router.post('/:id/start-claim', validate(validateObjectId('id')), startClaimFromMatch);

export default router;
