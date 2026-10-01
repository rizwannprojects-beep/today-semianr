import { Router } from 'express';
import {
  createItem,
  getItems,
  getItemById,
  getMyReports,
  updateItem,
  deleteItem
} from '../controllers/itemController.js';
import {
  createItemValidationRules,
  updateItemValidationRules,
  validateObjectId
} from '../utils/validation.js';
import validate from '../middleware/validationMiddleware.js';
import authenticate from '../middleware/authMiddleware.js';
import { reportLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

router.get('/', getItems);
router.get('/my', authenticate, getMyReports);
router.get('/:id', validate(validateObjectId('id')), getItemById);
router.post(
  '/',
  authenticate,
  reportLimiter,
  validate(createItemValidationRules),
  createItem
);
router.put(
  '/:id',
  authenticate,
  validate(validateObjectId('id')),
  validate(updateItemValidationRules),
  updateItem
);
router.delete(
  '/:id',
  authenticate,
  validate(validateObjectId('id')),
  deleteItem
);

export default router;
