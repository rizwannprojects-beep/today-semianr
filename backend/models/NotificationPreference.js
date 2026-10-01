import mongoose from 'mongoose';

/**
 * Stores per-user notification preferences.
 * One document per user, upserted on first save.
 *
 * Security-critical types (security_alert, account_status_changed)
 * CANNOT be disabled — enforced at the service layer, not here.
 */
const NotificationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    /**
     * In-app notification preferences
     */
    inApp: {
      matchNotifications: { type: Boolean, default: true },
      claimUpdates: { type: Boolean, default: true },
      returnReminders: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
      // Security cannot be disabled
      securityAlerts: { type: Boolean, default: true, immutable: false }
    },
    /**
     * Email notification preferences
     * Only high-priority events — not every notification.
     */
    email: {
      claimStatusChanged: { type: Boolean, default: true },
      returnScheduled: { type: Boolean, default: true },
      returnReminders: { type: Boolean, default: true },
      importantAnnouncements: { type: Boolean, default: true },
      // Security emails cannot be disabled
      securityAlerts: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

export const NotificationPreference = mongoose.model('NotificationPreference', NotificationPreferenceSchema);
export default NotificationPreference;
