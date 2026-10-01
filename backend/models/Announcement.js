import mongoose from 'mongoose';
import { ALL_ANNOUNCEMENT_STATUSES } from '../utils/constants.js';

const AnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Announcement message content is required'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL'
    },
    /**
     * Audience targeting:
     * - ALL: everyone
     * - STUDENTS: role === student
     * - STAFF: role === staff
     * - ADMINS: role === admin/superadmin
     * - department string: users whose department matches
     * - year number (1-6): users in that academic year
     */
    targetAudience: {
      type: String,
      default: 'ALL',
      maxlength: [100, 'Audience specifier cannot exceed 100 characters']
    },
    /**
     * Publication lifecycle:
     * DRAFT → SCHEDULED → PUBLISHED → EXPIRED/ARCHIVED
     */
    status: {
      type: String,
      enum: {
        values: ALL_ANNOUNCEMENT_STATUSES,
        message: 'Invalid announcement status'
      },
      default: 'PUBLISHED',
      index: true
    },
    /**
     * When the announcement becomes visible.
     * If null, treated as immediately active upon PUBLISHED status.
     */
    scheduledAt: {
      type: Date,
      default: null
    },
    /**
     * Legacy field - kept for backward compatibility,
     * now managed via scheduledAt
     */
    startDate: {
      type: Date,
      default: Date.now
    },
    /**
     * When the announcement stops being visible.
     * Null = never expires automatically.
     */
    expiryDate: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    /**
     * Cached recipient count, set at publish time for large audiences.
     * Used for "Estimated recipients: N" display.
     */
    estimatedRecipientCount: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

AnnouncementSchema.index({ status: 1, createdAt: -1 });
AnnouncementSchema.index({ status: 1, scheduledAt: 1 });
AnnouncementSchema.index({ expiryDate: 1 }, { sparse: true });

export const Announcement = mongoose.model('Announcement', AnnouncementSchema);
export default Announcement;
