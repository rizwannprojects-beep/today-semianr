import { Router } from 'express';
import {
  createLostItem,
  getLostItems,
  getItemById,
  getMyReports,
  updateItem,
  deleteItem
} from '../controllers/itemController.js';
import {
  createLostItemValidationRules,
  updateItemValidationRules,
  validateObjectId
} from '../utils/validation.js';
import validate from '../middleware/validationMiddleware.js';
import authenticate from '../middleware/authMiddleware.js';
import { reportLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// GET /api/lost-items — public browse and smart search
router.get('/', getLostItems);

// GET /api/lost-items/my — current student's lost reports
router.get('/my', authenticate, (req, res, next) => {
  req.query.type = 'lost';
  return getMyReports(req, res, next);
});

// GET /api/lost-items/:id — detailed lost item specification
router.get('/:id', validate(validateObjectId('id')), getItemById);

// POST /api/lost-items — report a lost item (auth + rate-limited + validated)
router.post(
  '/',
  authenticate,
  reportLimiter,
  validate(createLostItemValidationRules),
  createLostItem
);

// PUT /api/lost-items/:id — update own lost item report
router.put(
  '/:id',
  authenticate,
  validate(validateObjectId('id')),
  validate(updateItemValidationRules),
  updateItem
);

// DELETE /api/lost-items/:id — delete/cancel lost item report
router.delete(
  '/:id',
  authenticate,
  validate(validateObjectId('id')),
  deleteItem
);

export default router;
