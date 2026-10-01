import mongoose from 'mongoose';
import { ALL_CLAIM_STATUSES, CLAIM_STATUSES } from '../utils/constants.js';

const ClaimSchema = new mongoose.Schema(
  {
    claimId: {
      type: String,
      trim: true,
      uppercase: true,
      index: true
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Found item reference is required'],
      index: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant reference is required'],
      index: true
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    claimType: {
      type: String,
      enum: ['direct_claim', 'match_claim', 'possible_match'],
      default: 'direct_claim'
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      default: null,
      index: true
    },
    reason: {
      type: String,
      required: [true, 'Reason for filing claim is required'],
      trim: true,
      maxlength: [2000, 'Reason cannot exceed 2000 characters']
    },
    proofDescription: {
      type: String,
      trim: true,
      maxlength: [3000, 'Proof description cannot exceed 3000 characters']
    },
    ownershipProof: {
      type: String,
      required: [true, 'Proof of ownership details must be provided'],
      trim: true,
      maxlength: [3000, 'Ownership proof cannot exceed 3000 characters']
    },
    identifyingInformation: {
      type: String,
      trim: true,
      maxlength: [3000, 'Identifying information cannot exceed 3000 characters']
    },
    additionalDetails: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Additional details cannot exceed 1000 characters']
    },
    evidence: [
      {
        type: String,
        trim: true
      }
    ],
    status: {
      type: String,
      enum: {
        values: ALL_CLAIM_STATUSES,
        message: 'Invalid claim status'
      },
      default: CLAIM_STATUSES.PENDING,
      index: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    adminNotes: {
      type: String,
      trim: true,
      default: null,
      maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
    },
    verificationNotes: {
      type: String,
      trim: true,
      default: null,
      maxlength: [1000, 'Verification notes cannot exceed 1000 characters']
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
      maxlength: [1000, 'Rejection reason cannot exceed 1000 characters']
    },
    returnVerificationCode: {
      type: String,
      trim: true,
      default: null
    },
    returnStatus: {
      type: String,
      enum: ['NONE', 'PENDING_PICKUP', 'READY_FOR_PICKUP', 'HANDED_OVER', 'RETURNED'],
      default: 'NONE'
    },
    returnAppointment: {
      type: Date,
      default: null
    },
    handoverConfirmation: {
      confirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      confirmedAt: {
        type: Date,
        default: null
      },
      remarks: {
        type: String,
        default: ''
      }
    }
  },
  {
    timestamps: true
  }
);

// Pre-validate hook for field sync and claimId auto-generation
ClaimSchema.pre('validate', function (next) {
  if (!this.item && this.itemId) this.item = this.itemId;
  if (!this.itemId && this.item) this.itemId = this.item;
  if (!this.claimant && this.claimantId) this.claimant = this.claimantId;
  if (!this.claimantId && this.claimant) this.claimantId = this.claimant;

  if (!this.ownershipProof && this.identifyingInformation) {
    this.ownershipProof = this.identifyingInformation;
  } else if (!this.identifyingInformation && this.ownershipProof) {
    this.identifyingInformation = this.ownershipProof;
  }

  if (!this.reason && this.proofDescription) {
    this.reason = this.proofDescription;
  } else if (!this.proofDescription && this.reason) {
    this.proofDescription = this.reason;
  }

  if (!this.verificationNotes && this.adminNotes) {
    this.verificationNotes = this.adminNotes;
  } else if (!this.adminNotes && this.verificationNotes) {
    this.adminNotes = this.verificationNotes;
  }

  if (!this.claimId) {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.claimId = `CLM-${year}-${random}`;
  }

  if (typeof next === 'function') next();
});

// Compound indexes for user query and claim verification lookups
ClaimSchema.index({ item: 1, claimant: 1 });
ClaimSchema.index({ status: 1, createdAt: -1 });
ClaimSchema.index({ claimant: 1, createdAt: -1 });
ClaimSchema.index({ createdAt: 1, status: 1 });

export const Claim = mongoose.model('Claim', ClaimSchema);
export default Claim;
