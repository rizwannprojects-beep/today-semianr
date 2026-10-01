import { Router } from 'express';
import {
  submitContactMessage,
  getContactMessages,
  updateContactMessage
} from '../controllers/contactController.js';
import authenticate from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

// Public: Submit message
router.post('/', submitContactMessage);

// Admin: View and manage contact messages
router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF), getContactMessages);
router.patch('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF), updateContactMessage);

export default router;
