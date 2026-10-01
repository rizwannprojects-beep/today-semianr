import mongoose from 'mongoose';
import {
  ALL_RETURN_STATUSES,
  RETURN_STATUSES,
  ALL_RETURN_METHODS,
  RETURN_METHODS
} from '../utils/constants.js';

const ReturnSchema = new mongoose.Schema(
  {
    returnId: {
      type: String,
      trim: true,
      uppercase: true,
      index: true
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item reference is required'],
      index: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      required: [true, 'Claim reference is required'],
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Verified owner reference is required'],
      index: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    finder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    returnMethod: {
      type: String,
      enum: {
        values: ALL_RETURN_METHODS,
        message: 'Invalid return method'
      },
      default: RETURN_METHODS.CAMPUS_OFFICE_PICKUP
    },
    meetingLocation: {
      type: String,
      default: 'Administration & Security Desk',
      trim: true,
      maxlength: [200, 'Meeting location cannot exceed 200 characters']
    },
    handoverLocation: {
      type: String,
      trim: true,
      maxlength: [200, 'Handover location cannot exceed 200 characters']
    },
    handoverCode: {
      type: String,
      trim: true,
      uppercase: true,
      index: true
    },
    scheduledDate: {
      type: Date,
      default: null
    },
    scheduledTime: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ALL_RETURN_STATUSES,
        message: 'Invalid return status'
      },
      default: RETURN_STATUSES.READY_FOR_RETURN,
      index: true
    },
    verificationCodeHash: {
      type: String,
      select: false, // Never returned to client
      default: null
    },
    verificationCodeExpiresAt: {
      type: Date,
      default: null
    },
    verificationAttempts: {
      type: Number,
      default: 0
    },
    verificationMaxAttempts: {
      type: Number,
      default: 5
    },
    ownerVerified: {
      type: Boolean,
      default: false
    },
    finderVerified: {
      type: Boolean,
      default: false
    },
    handoverConfirmed: {
      type: Boolean,
      default: false
    },
    ownerConfirmation: {
      confirmed: { type: Boolean, default: false },
      confirmedAt: { type: Date, default: null },
      remarks: { type: String, default: '', trim: true, maxlength: 1000 }
    },
    finderConfirmation: {
      confirmed: { type: Boolean, default: false },
      confirmedAt: { type: Date, default: null },
      remarks: { type: String, default: '', trim: true, maxlength: 1000 }
    },
    staffConfirmation: {
      confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      confirmedAt: { type: Date, default: null },
      remarks: { type: String, default: '', trim: true, maxlength: 1000 }
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters']
    },
    cancellation: {
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      cancelledAt: { type: Date, default: null },
      reason: { type: String, default: '', trim: true, maxlength: 1000 }
    },
    dispute: {
      isDisputed: { type: Boolean, default: false },
      reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      reason: { type: String, default: '', trim: true, maxlength: 500 },
      description: { type: String, default: '', trim: true, maxlength: 2000 },
      evidence: [{ type: String, trim: true }],
      reportedAt: { type: Date, default: null },
      status: {
        type: String,
        enum: ['OPEN', 'UNDER_INVESTIGATION', 'RESOLVED'],
        default: 'OPEN'
      }
    },
    receipt: {
      receiptNumber: { type: String, default: '' },
      issuedAt: { type: Date, default: null },
      summary: { type: String, default: '' }
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Pre-validate hook for aliases and code generation
ReturnSchema.pre('validate', function (next) {
  if (!this.item && this.itemId) this.item = this.itemId;
  if (!this.itemId && this.item) this.itemId = this.item;
  if (!this.owner && this.ownerId) this.owner = this.ownerId;
  if (!this.ownerId && this.owner) this.ownerId = this.owner;

  if (!this.meetingLocation && this.handoverLocation) {
    this.meetingLocation = this.handoverLocation;
  } else if (!this.handoverLocation && this.meetingLocation) {
    this.handoverLocation = this.meetingLocation;
  }

  if (!this.handoverCode) {
    const code = Math.floor(100000 + Math.random() * 900000);
    this.handoverCode = `RET-${code}`;
  }

  if (!this.returnId) {
    const year = new Date().getFullYear();
    const code = Math.floor(1000 + Math.random() * 9000);
    this.returnId = `R-${year}-${code}`;
  }

  if (typeof next === 'function') next();
});

// Indexes for fast lookup
ReturnSchema.index({ item: 1, claim: 1 }, { unique: true });
ReturnSchema.index({ owner: 1, status: 1 });
ReturnSchema.index({ finder: 1, status: 1 });
ReturnSchema.index({ status: 1, createdAt: -1 });
ReturnSchema.index({ createdAt: 1, status: 1 });
ReturnSchema.index({ completedAt: 1 });

export const Return = mongoose.model('Return', ReturnSchema);
export default Return;
