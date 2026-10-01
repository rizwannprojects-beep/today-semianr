import mongoose from 'mongoose';
import { ALL_NOTIFICATION_TYPES, ALL_NOTIFICATION_PRIORITIES } from '../utils/constants.js';

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient reference is required'],
      index: true
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: {
        values: ALL_NOTIFICATION_TYPES,
        message: 'Invalid notification type'
      },
      index: true
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification message body is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    priority: {
      type: String,
      enum: {
        values: ALL_NOTIFICATION_PRIORITIES,
        message: 'Invalid notification priority'
      },
      default: 'NORMAL'
    },
    relatedItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    relatedClaim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      default: null
    },
    relatedMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      default: null
    },
    relatedReturn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Return',
      default: null
    },
    /**
     * Safe link for frontend navigation (e.g. '/my-claims/abc123').
     * Never include secret tokens or verification codes here.
     */
    actionUrl: {
      type: String,
      trim: true,
      maxlength: [500, 'Action URL cannot exceed 500 characters'],
      default: null
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    },
    /**
     * Optional expiry. Expired notifications are hidden from the user
     * but retained for audit purposes.
     */
    expiresAt: {
      type: Date,
      default: null
    },
    /**
     * Deduplication key prevents duplicate notifications for the same event.
     * Format: {type}:{entityId} or {type}:{entityId}:{subKey}
     */
    deduplicationKey: {
      type: String,
      trim: true,
      maxlength: [200, 'Deduplication key cannot exceed 200 characters'],
      default: null,
      index: true,
      sparse: true
    }
  },
  {
    timestamps: true
  }
);

// High-speed user notification query index
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
// Type filtering index
NotificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
// Deduplication enforcement — only one document per unique key
NotificationSchema.index(
  { recipient: 1, deduplicationKey: 1 },
  { unique: true, sparse: true, partialFilterExpression: { deduplicationKey: { $ne: null } } }
);

export const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
