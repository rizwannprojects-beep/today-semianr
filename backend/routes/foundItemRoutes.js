import { Router } from 'express';
import {
  createFoundItem,
  getFoundItems,
  getItemById,
  getMyReports,
  updateItem,
  deleteItem
} from '../controllers/itemController.js';
import {
  createFoundItemValidationRules,
  updateItemValidationRules,
  validateObjectId
} from '../utils/validation.js';
import validate from '../middleware/validationMiddleware.js';
import authenticate from '../middleware/authMiddleware.js';
import { reportLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// GET /api/found-items — public browse and smart search
router.get('/', getFoundItems);

// GET /api/found-items/my — current student's found reports
router.get('/my', authenticate, (req, res, next) => {
  req.query.type = 'found';
  return getMyReports(req, res, next);
});

// GET /api/found-items/:id — detailed found item specification
router.get('/:id', validate(validateObjectId('id')), getItemById);

// POST /api/found-items — report a found item (auth + rate-limited + validated)
router.post(
  '/',
  authenticate,
  reportLimiter,
  validate(createFoundItemValidationRules),
  createFoundItem
);

// PUT /api/found-items/:id — update own found item report
router.put(
  '/:id',
  authenticate,
  validate(validateObjectId('id')),
  validate(updateItemValidationRules),
  updateItem
);

// DELETE /api/found-items/:id — delete/cancel found item report
router.delete(
  '/:id',
  authenticate,
  validate(validateObjectId('id')),
  deleteItem
);

export default router;
