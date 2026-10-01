import mongoose from 'mongoose';

const ModerationReportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['Item', 'User', 'Claim', 'Return', 'Other'],
      required: [true, 'Target type is required'],
      default: 'Item'
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target entity identifier is required'],
      index: true
    },
    targetDetails: {
      type: String,
      default: ''
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporting user reference is required'],
      index: true
    },
    reason: {
      type: String,
      required: [true, 'Reason for report/flag is required'],
      trim: true,
      maxlength: [200, 'Reason cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'],
      default: 'OPEN',
      index: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolutionNotes: {
      type: String,
      default: '',
      trim: true
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

ModerationReportSchema.index({ status: 1, createdAt: -1 });

export const ModerationReport = mongoose.model('ModerationReport', ModerationReportSchema);
export default ModerationReport;
