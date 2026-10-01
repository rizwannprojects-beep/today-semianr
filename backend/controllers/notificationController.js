/**
 * Notification Controller — Phase 10
 *
 * Handles all student-facing notification endpoints.
 * Every handler performs recipient-level IDOR protection.
 */

import NotificationService from '../services/notificationService.js';

/**
 * @desc    Get paginated notifications for current user
 * @route   GET /api/notifications
 * @access  Private (authenticated student)
 * @query   page, limit, filter (all|unread|claims|matches|returns|announcements|security)
 */
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, filter = 'all' } = req.query;

    const ALLOWED_FILTERS = ['all', 'unread', 'claims', 'matches', 'returns', 'announcements', 'security'];
    const resolvedFilter = ALLOWED_FILTERS.includes(filter) ? filter : 'all';

    const result = await NotificationService.getUserNotifications(req.user._id, {
      page,
      limit,
      filter: resolvedFilter
    });

    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread notification count (for nav badge)
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user._id);
    return res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private (IDOR-safe: only owner can mark)
 */
export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id, req.user._id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        errors: [{ message: 'No notification matching provided ID for this user' }]
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single notification as unread
 * @route   PATCH /api/notifications/:id/unread
 * @access  Private
 */
export const markNotificationUnread = async (req, res, next) => {
  try {
    const notification = await NotificationService.markAsUnread(req.params.id, req.user._id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        errors: [{ message: 'No notification matching provided ID for this user' }]
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as unread',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await NotificationService.markAllAsRead(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a notification (non-security types only)
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const result = await NotificationService.deleteNotification(req.params.id, req.user._id);

    if (result === null) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        errors: [{ message: 'No notification matching provided ID for this user' }]
      });
    }

    if (result === false) {
      return res.status(403).json({
        success: false,
        message: 'Security and account notifications cannot be deleted',
        errors: [{ message: 'This notification type must be retained for account security purposes' }]
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification removed',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get notification preferences for current user
 * @route   GET /api/notification-preferences
 * @access  Private
 */
export const getNotificationPreferences = async (req, res, next) => {
  try {
    const prefs = await NotificationService.getPreferences(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Notification preferences retrieved',
      data: prefs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update notification preferences
 * @route   PATCH /api/notification-preferences
 * @access  Private
 */
export const updateNotificationPreferences = async (req, res, next) => {
  try {
    const { inApp, email } = req.body;

    // Validate structure — only accept known keys
    const allowedInAppKeys = ['matchNotifications', 'claimUpdates', 'returnReminders', 'announcements'];
    const allowedEmailKeys = ['claimStatusChanged', 'returnScheduled', 'returnReminders', 'importantAnnouncements'];

    const sanitizedUpdate = {};

    if (inApp && typeof inApp === 'object') {
      sanitizedUpdate.inApp = {};
      for (const key of allowedInAppKeys) {
        if (typeof inApp[key] === 'boolean') {
          sanitizedUpdate.inApp[key] = inApp[key];
        }
      }
    }

    if (email && typeof email === 'object') {
      sanitizedUpdate.email = {};
      for (const key of allowedEmailKeys) {
        if (typeof email[key] === 'boolean') {
          sanitizedUpdate.email[key] = email[key];
        }
      }
    }

    if (Object.keys(sanitizedUpdate).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid preference fields provided',
        errors: [{ message: 'Provide inApp or email preference object with boolean values' }]
      });
    }

    const updated = await NotificationService.updatePreferences(req.user._id, sanitizedUpdate);

    return res.status(200).json({
      success: true,
      message: 'Notification preferences updated',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger scheduled return reminders scan
 * @route   POST /api/notifications/reminders/process
 * @access  Private
 */
export const triggerReturnReminders = async (req, res, next) => {
  try {
    const result = await NotificationService.processReturnReminders();
    return res.status(200).json({
      success: true,
      message: 'Return reminders processed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger expired notification retention cleanup
 * @route   POST /api/notifications/cleanup
 * @access  Private
 */
export const triggerRetentionCleanup = async (req, res, next) => {
  try {
    const { retentionDays = 30 } = req.body || {};
    const result = await NotificationService.cleanupExpiredNotifications({ retentionDays });
    return res.status(200).json({
      success: true,
      message: 'Expired notifications cleaned up',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export default {
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
};
