import mongoose from 'mongoose';
import { ALL_AUDIT_ACTIONS } from '../utils/constants.js';

const AuditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    actorEmail: {
      type: String,
      default: 'system',
      trim: true
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      trim: true,
      index: true
    },
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      trim: true,
      index: true
    },
    entityId: {
      type: String,
      default: null,
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: null,
      trim: true
    },
    userAgent: {
      type: String,
      default: null,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// High-speed audit query indexes
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ actor: 1, createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;
