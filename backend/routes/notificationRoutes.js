import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  triggerReturnReminders,
  triggerRetentionCleanup
} from '../controllers/notificationController.js';
import { validateObjectId } from '../utils/validation.js';
import validate from '../middleware/validationMiddleware.js';
import authenticate from '../middleware/authMiddleware.js';
import { notificationLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// All notification endpoints require authentication
router.use(authenticate);

// Notification center
router.get('/', notificationLimiter, getNotifications);
router.get('/unread-count', notificationLimiter, getUnreadCount);

// Preferences routes (also mapped under /notification-preferences in server.js)
router.get('/preferences', getNotificationPreferences);
router.patch('/preferences', updateNotificationPreferences);

// Bulk operations (before /:id to avoid route conflict)
router.patch('/read-all', markAllNotificationsRead);

// Background reminder processing & retention cleanup triggers
router.post('/reminders/process', triggerReturnReminders);
router.post('/cleanup', triggerRetentionCleanup);

// Single notification operations
router.patch('/:id/read', validate(validateObjectId('id')), markNotificationRead);
router.patch('/:id/unread', validate(validateObjectId('id')), markNotificationUnread);
router.delete('/:id', validate(validateObjectId('id')), deleteNotification);

export default router;
