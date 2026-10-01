/**
 * NotificationService — Phase 10
 *
 * Centralized service for all notification operations.
 * Supports:
 * - Priority levels (LOW, NORMAL, HIGH, URGENT)
 * - Idempotent deduplication via deduplicationKey
 * - Type-based filtering
 * - Pagination with unread count
 * - Mark read/unread/all-read
 * - Delete (soft-delete by expiry or hard delete for non-critical types)
 * - Preference checking (respect user prefs, enforce security alerts)
 * - In-memory fallback when MongoDB is offline
 */

import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import NotificationPreference from '../models/NotificationPreference.js';
import {
  NOTIFICATION_PRIORITIES,
  NON_DISABLEABLE_NOTIFICATION_TYPES
} from '../utils/constants.js';

// In-memory store for offline development
export const inMemoryNotifications = [];

// Helper: check MongoDB connection
const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * Map notification type to user preference key.
 * Returns null if the type is always delivered.
 */
const getPreferenceKey = (type) => {
  if (NON_DISABLEABLE_NOTIFICATION_TYPES.includes(type)) return null; // Always deliver
  if (type === 'new_possible_match') return 'inApp.matchNotifications';
  if (type.startsWith('claim_')) return 'inApp.claimUpdates';
  if (type.startsWith('return_') || type.startsWith('item_ready') || type.startsWith('handover') || type.startsWith('owner_verification')) return 'inApp.returnReminders';
  if (type === 'announcement') return 'inApp.announcements';
  return null; // Deliver by default if no preference key
};

export class NotificationService {
  /**
   * Create a notification.
   *
   * @param {object} opts
   * @param {string|object} opts.recipient - User ID or User object
   * @param {string} opts.type - Notification type from constants
   * @param {string} opts.title - Short title (max 150 chars)
   * @param {string} opts.message - Body text (max 1000 chars, no secrets)
   * @param {string} [opts.priority] - LOW|NORMAL|HIGH|URGENT
   * @param {string} [opts.relatedItem]
   * @param {string} [opts.relatedClaim]
   * @param {string} [opts.relatedMatch]
   * @param {string} [opts.relatedReturn]
   * @param {string} [opts.actionUrl] - Safe frontend navigation URL
   * @param {string} [opts.deduplicationKey] - Prevents duplicate notifications
   * @param {Date}   [opts.expiresAt]
   * @returns {object|null} Created notification or null on failure
   */
  static async createNotification({
    recipient,
    type,
    title,
    message,
    priority = NOTIFICATION_PRIORITIES.NORMAL,
    relatedItem = null,
    relatedClaim = null,
    relatedMatch = null,
    relatedReturn = null,
    actionUrl = null,
    deduplicationKey = null,
    expiresAt = null
  }) {
    try {
      const recipientId = recipient?._id || recipient;

      // Validate priority
      const resolvedPriority = Object.values(NOTIFICATION_PRIORITIES).includes(priority)
        ? priority
        : NOTIFICATION_PRIORITIES.NORMAL;

      // Check user preferences (only when DB is available)
      if (isDbReady()) {
        const prefKey = getPreferenceKey(type);
        if (prefKey) {
          try {
            const prefs = await NotificationPreference.findOne({ user: recipientId }).lean();
            if (prefs) {
              const [section, field] = prefKey.split('.');
              if (prefs[section] && prefs[section][field] === false) {
                // User has disabled this notification type
                return null;
              }
            }
          } catch (prefErr) {
            // Preference check failure is non-fatal
            console.warn('[NotificationService] Preference check error:', prefErr.message);
          }
        }
      }

      const notifData = {
        _id: new mongoose.Types.ObjectId(),
        recipient: recipientId,
        type,
        title: title.slice(0, 150),
        message: message.slice(0, 1000),
        priority: resolvedPriority,
        relatedItem,
        relatedClaim,
        relatedMatch,
        relatedReturn,
        actionUrl,
        deduplicationKey,
        expiresAt,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (isDbReady()) {
        // Upsert pattern: if deduplicationKey exists, update instead of duplicate
        if (deduplicationKey) {
          const existing = await Notification.findOne({
            recipient: recipientId,
            deduplicationKey
          });
          if (existing) {
            return existing; // Already sent — idempotent
          }
        }
        return await Notification.create(notifData);
      } else {
        // In-memory fallback
        if (deduplicationKey) {
          const exists = inMemoryNotifications.find(
            (n) =>
              (n.recipient?.toString() === recipientId?.toString()) &&
              n.deduplicationKey === deduplicationKey
          );
          if (exists) return exists;
        }
        inMemoryNotifications.unshift(notifData);
        return notifData;
      }
    } catch (err) {
      // Duplicate key error on deduplication index — expected, not a failure
      if (err.code === 11000) {
        console.log('[NotificationService] Duplicate notification suppressed (dedup key):', deduplicationKey);
        return null;
      }
      console.error('[NotificationService Error] Could not create notification:', err.message);
      return null;
    }
  }

  /**
   * Get paginated notifications for a user.
   *
   * @param {string} userId
   * @param {object} opts
   * @param {number} [opts.page=1]
   * @param {number} [opts.limit=20]
   * @param {string} [opts.filter='all'] - all|unread|claims|matches|returns|announcements|security
   * @returns {{ notifications, unreadCount, pagination }}
   */
  static async getUserNotifications(userId, { page = 1, limit = 20, filter = 'all' } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const uid = userId?.toString();

    // Build type filter
    const typeFilter = buildTypeFilter(filter);
    const isUnreadOnly = filter === 'unread';

    if (isDbReady()) {
      const now = new Date();
      const baseQuery = {
        recipient: userId,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
      };
      if (isUnreadOnly) {
        baseQuery.isRead = false;
      }
      if (typeFilter) baseQuery.type = typeFilter;

      const [notifications, unreadCount, totalCount] = await Promise.all([
        Notification.find(baseQuery)
          .populate('relatedItem', 'title type category')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Notification.countDocuments({
          recipient: userId,
          isRead: false,
          $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
        }),
        Notification.countDocuments(baseQuery)
      ]);

      return {
        notifications,
        unreadCount,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limitNum) || 1
        }
      };
    }

    // In-memory fallback
    let userNotifs = inMemoryNotifications.filter(
      (n) => (n.recipient?._id?.toString() || n.recipient?.toString()) === uid
    );

    if (isUnreadOnly) {
      userNotifs = userNotifs.filter((n) => !n.isRead);
    } else if (typeFilter) {
      const filterTypes = Array.isArray(typeFilter.$in) ? typeFilter.$in : [typeFilter];
      userNotifs = userNotifs.filter((n) => filterTypes.includes(n.type));
    }

    const unreadCount = inMemoryNotifications.filter(
      (n) => (n.recipient?._id?.toString() || n.recipient?.toString()) === uid && !n.isRead
    ).length;
    const totalCount = userNotifs.length;
    const paginated = userNotifs.slice(skip, skip + limitNum);

    return {
      notifications: paginated,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limitNum) || 1
      }
    };
  }

  /**
   * Get unread notification count for nav badge.
   * Optimized — only counts, does not fetch documents.
   */
  static async getUnreadCount(userId) {
    if (isDbReady()) {
      return Notification.countDocuments({
        recipient: userId,
        isRead: false,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }]
      });
    }
    const uid = userId?.toString();
    return inMemoryNotifications.filter(
      (n) => (n.recipient?.toString() === uid) && !n.isRead
    ).length;
  }

  /**
   * Mark a single notification as read (IDOR-safe: requires recipient match)
   */
  static async markAsRead(notificationId, userId) {
    const uid = userId?.toString();
    const nid = notificationId?.toString();

    if (isDbReady()) {
      return Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );
    }

    const notif = inMemoryNotifications.find(
      (n) => (n._id?.toString() === nid) && (n.recipient?.toString() === uid)
    );
    if (notif) { notif.isRead = true; notif.readAt = new Date(); }
    return notif;
  }

  /**
   * Mark a single notification as unread
   */
  static async markAsUnread(notificationId, userId) {
    const uid = userId?.toString();
    const nid = notificationId?.toString();

    if (isDbReady()) {
      return Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: false, readAt: null },
        { new: true }
      );
    }

    const notif = inMemoryNotifications.find(
      (n) => (n._id?.toString() === nid) && (n.recipient?.toString() === uid)
    );
    if (notif) { notif.isRead = false; notif.readAt = null; }
    return notif;
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    const uid = userId?.toString();
    if (isDbReady()) {
      return Notification.updateMany(
        { recipient: userId, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );
    }
    inMemoryNotifications.forEach((n) => {
      if (n.recipient?.toString() === uid) { n.isRead = true; n.readAt = new Date(); }
    });
    return { acknowledged: true };
  }

  /**
   * Delete a non-security notification (hard delete).
   * Security notifications (security_alert, account_status_changed) cannot be deleted.
   * Returns null if not found, false if deletion is blocked.
   */
  static async deleteNotification(notificationId, userId) {
    const uid = userId?.toString();
    const nid = notificationId?.toString();

    if (isDbReady()) {
      const notif = await Notification.findOne({ _id: notificationId, recipient: userId });
      if (!notif) return null;
      if (NON_DISABLEABLE_NOTIFICATION_TYPES.includes(notif.type)) return false;
      await notif.deleteOne();
      return true;
    }

    const idx = inMemoryNotifications.findIndex(
      (n) => (n._id?.toString() === nid) && (n.recipient?.toString() === uid)
    );
    if (idx === -1) return null;
    if (NON_DISABLEABLE_NOTIFICATION_TYPES.includes(inMemoryNotifications[idx].type)) return false;
    inMemoryNotifications.splice(idx, 1);
    return true;
  }

  /**
   * Get user notification preferences (creates defaults if not found)
   */
  static async getPreferences(userId) {
    if (isDbReady()) {
      let prefs = await NotificationPreference.findOne({ user: userId });
      if (!prefs) {
        prefs = await NotificationPreference.create({ user: userId });
      }
      return prefs;
    }
    // In-memory fallback — return defaults
    return {
      user: userId,
      inApp: {
        matchNotifications: true,
        claimUpdates: true,
        returnReminders: true,
        announcements: true,
        securityAlerts: true
      },
      email: {
        claimStatusChanged: true,
        returnScheduled: true,
        returnReminders: true,
        importantAnnouncements: true,
        securityAlerts: true
      }
    };
  }

  /**
   * Update user notification preferences.
   * Prevents disabling security alerts (enforced server-side).
   */
  static async updatePreferences(userId, updates) {
    // Enforce: security alerts cannot be disabled
    if (updates.inApp) {
      updates.inApp.securityAlerts = true;
    }
    if (updates.email) {
      updates.email.securityAlerts = true;
    }

    if (isDbReady()) {
      return NotificationPreference.findOneAndUpdate(
        { user: userId },
        { $set: updates },
        { new: true, upsert: true, runValidators: true }
      );
    }
    // In-memory: just return the updates merged with defaults
    return { user: userId, ...updates };
  }

  /**
   * Process return reminders for upcoming scheduled returns.
   * Scans scheduled returns for 24h and 1h reminders and generates idempotent notifications.
   * Cancels/skips returns that are CANCELLED, RETURNED, COMPLETED, or DISPUTED.
   *
   * @returns {{ processed: number, remindersSent: number }}
   */
  static async processReturnReminders() {
    let processed = 0;
    let remindersSent = 0;
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const ONE_HOUR = 60 * 60 * 1000;

    try {
      let scheduledReturns = [];

      if (isDbReady()) {
        const Return = (await import('../models/Return.js')).default;
        scheduledReturns = await Return.find({
          status: { $in: ['SCHEDULED', 'scheduled'] },
          scheduledDate: { $ne: null }
        })
          .populate('owner', 'fullName email')
          .populate('item', 'title itemName')
          .lean();
      } else {
        const { inMemoryReturnStore } = await import('../controllers/returnController.js');
        scheduledReturns = (inMemoryReturnStore || []).filter(
          (r) =>
            (r.status === 'SCHEDULED' || r.status === 'scheduled') &&
            r.scheduledDate
        );
      }

      for (const ret of scheduledReturns) {
        processed++;
        const schedTime = new Date(ret.scheduledDate).getTime();
        const diff = schedTime - now;

        // If scheduled date is in the past, or cancelled/completed/disputed, skip
        const statusLower = (ret.status || '').toLowerCase();
        if (['cancelled', 'returned', 'completed', 'disputed'].includes(statusLower)) {
          continue;
        }

        const ownerId = ret.owner?._id || ret.owner;
        const itemTitle = ret.item?.title || ret.item?.itemName || 'your item';
        const returnId = ret._id?.toString() || ret.id?.toString();

        if (!ownerId) continue;

        // 24-Hour Reminder: due within next 24 hours (and > 1 hour)
        if (diff > ONE_HOUR && diff <= TWENTY_FOUR_HOURS) {
          const dedupKey = `return_reminder_24h:${returnId}:${ownerId}`;
          const notif = await NotificationService.createNotification({
            recipient: ownerId,
            type: 'return_reminder_24h',
            title: 'Return Appointment Tomorrow',
            message: `Reminder: Your handover for "${itemTitle}" is scheduled within 24 hours at ${ret.meetingLocation || 'Campus Office'}. Bring your student ID.`,
            priority: NOTIFICATION_PRIORITIES.NORMAL,
            relatedReturn: returnId,
            relatedItem: ret.item?._id || ret.item,
            actionUrl: '/my-returns',
            deduplicationKey: dedupKey
          });

          if (notif) {
            remindersSent++;
            // Send safe email (non-blocking)
            if (ret.owner?.email) {
              const EmailService = (await import('./emailService.js')).default;
              EmailService.sendReturnReminderEmail({
                to: ret.owner.email,
                recipientName: ret.owner.fullName || 'Student',
                itemTitle,
                scheduledDate: ret.scheduledDate,
                returnId,
                reminderType: 'in 24 hours'
              }).catch(() => {});
            }
          }
        }

        // 1-Hour Reminder: due within next 1 hour (and > 0)
        if (diff > 0 && diff <= ONE_HOUR) {
          const dedupKey = `return_reminder_1h:${returnId}:${ownerId}`;
          const notif = await NotificationService.createNotification({
            recipient: ownerId,
            type: 'return_reminder_1h',
            title: 'Return Appointment in 1 Hour',
            message: `Urgent Reminder: Your handover for "${itemTitle}" is in 1 hour at ${ret.meetingLocation || 'Campus Office'}. Please arrive on time with your student ID.`,
            priority: NOTIFICATION_PRIORITIES.HIGH,
            relatedReturn: returnId,
            relatedItem: ret.item?._id || ret.item,
            actionUrl: '/my-returns',
            deduplicationKey: dedupKey
          });

          if (notif) {
            remindersSent++;
            if (ret.owner?.email) {
              const EmailService = (await import('./emailService.js')).default;
              EmailService.sendReturnReminderEmail({
                to: ret.owner.email,
                recipientName: ret.owner.fullName || 'Student',
                itemTitle,
                scheduledDate: ret.scheduledDate,
                returnId,
                reminderType: 'in 1 hour'
              }).catch(() => {});
            }
          }
        }
      }
    } catch (err) {
      console.error('[NotificationService] Return reminder processing error:', err.message);
    }

    return { processed, remindersSent };
  }

  /**
   * Safely clean up expired notifications.
   * Preserves security/compliance alerts (NON_DISABLEABLE_NOTIFICATION_TYPES).
   * Does NOT touch audit logs.
   *
   * @param {object} [opts]
   * @param {number} [opts.retentionDays=30]
   * @returns {{ deletedCount: number }}
   */
  static async cleanupExpiredNotifications({ retentionDays = 30 } = {}) {
    let deletedCount = 0;
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);

    if (isDbReady()) {
      const result = await Notification.deleteMany({
        type: { $nin: NON_DISABLEABLE_NOTIFICATION_TYPES },
        $or: [
          { expiresAt: { $ne: null, $lt: now } },
          { isRead: true, createdAt: { $lt: staleThreshold } }
        ]
      });
      deletedCount = result?.deletedCount || 0;
    } else {
      const initialLen = inMemoryNotifications.length;
      const keep = inMemoryNotifications.filter((n) => {
        if (NON_DISABLEABLE_NOTIFICATION_TYPES.includes(n.type)) return true;
        if (n.expiresAt && new Date(n.expiresAt) < now) return false;
        if (n.isRead && new Date(n.createdAt) < staleThreshold) return false;
        return true;
      });
      inMemoryNotifications.length = 0;
      inMemoryNotifications.push(...keep);
      deletedCount = initialLen - keep.length;
    }

    return { deletedCount };
  }
}

/**
 * Build MongoDB type filter from UI filter name.
 * Returns null for 'all', or a $in query for specific categories.
 */
function buildTypeFilter(filter) {
  switch (filter) {
    case 'unread':
      return null; // Applied separately as isRead: false
    case 'claims':
      return {
        $in: [
          'claim_submitted',
          'claim_under_review',
          'claim_info_requested',
          'claim_information_required',
          'claim_approved',
          'claim_rejected',
          'claim_status_changed',
          'claim_completed',
          'claim_cancelled',
          'CLAIM_SUBMITTED',
          'CLAIM_UNDER_REVIEW',
          'CLAIM_INFO_REQUESTED',
          'CLAIM_APPROVED',
          'CLAIM_REJECTED',
          'CLAIM_STATUS_CHANGED'
        ]
      };
    case 'matches':
      return {
        $in: [
          'new_possible_match',
          'item_match_found',
          'NEW_POSSIBLE_MATCH',
          'ITEM_MATCH_FOUND'
        ]
      };
    case 'returns':
      return {
        $in: [
          'item_ready_for_return',
          'return_created',
          'return_scheduled',
          'return_schedule_updated',
          'return_reminder',
          'return_reminder_24h',
          'return_reminder_1h',
          'return_code_generated',
          'owner_verification_required',
          'return_verified',
          'handover_ready',
          'handover_confirmed',
          'handover_completed',
          'item_returned',
          'return_cancelled',
          'return_disputed',
          'return_expired',
          'RETURN_CREATED',
          'RETURN_SCHEDULED',
          'RETURN_REMINDER',
          'RETURN_VERIFIED',
          'HANDOVER_COMPLETED'
        ]
      };
    case 'announcements':
      return {
        $in: ['announcement', 'admin_message', 'ANNOUNCEMENT', 'ADMIN_MESSAGE']
      };
    case 'security':
      return {
        $in: [
          'security_alert',
          'account_status_changed',
          'SECURITY_ALERT',
          'ACCOUNT_STATUS_CHANGED'
        ]
      };
    default:
      return null; // 'all'
  }
}

export default NotificationService;
