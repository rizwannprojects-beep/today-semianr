import { Router } from 'express';
import {
  getOverview,
  getItems,
  getClaims,
  getMatches,
  getReturns,
  getResolutionTimes,
  getCategories,
  getLocations,
  getDepartments,
  getTrends,
  exportAnalytics
} from '../controllers/analyticsController.js';
import authenticate from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import { analyticsLimiter } from '../middleware/rateLimitMiddleware.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

// Strictly guard all analytics routes with authentication and administrative roles
router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF));
router.use(analyticsLimiter);

// Analytics endpoints
router.get('/overview', getOverview);
router.get('/items', getItems);
router.get('/claims', getClaims);
router.get('/matches', getMatches);
router.get('/returns', getReturns);
router.get('/resolution-times', getResolutionTimes);
router.get('/categories', getCategories);
router.get('/locations', getLocations);
router.get('/departments', getDepartments);
router.get('/trends', getTrends);
router.get('/export', exportAnalytics);

export default router;
