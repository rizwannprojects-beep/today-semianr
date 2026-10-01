import mongoose from 'mongoose';
import { ALL_MATCH_STATUSES, MATCH_STATUSES } from '../utils/constants.js';

const MatchSchema = new mongoose.Schema(
  {
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Lost item reference is required'],
      index: true
    },
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Found item reference is required'],
      index: true
    },
    matchScore: {
      type: Number,
      required: [true, 'Match score is required'],
      min: [0, 'Match score cannot be less than 0'],
      max: [100, 'Match score cannot exceed 100']
    },
    matchLevel: {
      type: String,
      enum: ['HIGH_POSSIBILITY', 'POSSIBLE', 'LOW_POSSIBILITY'],
      default: 'POSSIBLE',
      index: true
    },
    matchingFactors: {
      category: { type: Number, default: 0 },
      itemName: { type: Number, default: 0 },
      brand: { type: Number, default: 0 },
      model: { type: Number, default: 0 },
      color: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      date: { type: Number, default: 0 },
      description: { type: Number, default: 0 },
      reasons: [{ type: String }],
      categorySimilarity: { type: Number, default: 0 },
      colorSimilarity: { type: Number, default: 0 },
      brandSimilarity: { type: Number, default: 0 },
      locationProximity: { type: Boolean, default: false },
      dateProximityDays: { type: Number, default: null },
      descriptionSimilarity: { type: Number, default: 0 },
      imageSimilarity: { type: Number, default: 0 },
      notes: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: {
        values: ALL_MATCH_STATUSES,
        message: 'Invalid match status'
      },
      default: MATCH_STATUSES.SUGGESTED,
      index: true
    },
    viewedByLostReporter: {
      type: Boolean,
      default: false
    },
    viewedByFoundReporter: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate match pairs and index for fast score sorting
MatchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });
MatchSchema.index({ status: 1, matchScore: -1 });
MatchSchema.index({ matchLevel: 1, createdAt: -1 });

export const Match = mongoose.model('Match', MatchSchema);
export default Match;
