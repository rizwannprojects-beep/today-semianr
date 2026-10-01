import mongoose from 'mongoose';
import Item from './Item.js';
import { ALL_LOST_ITEM_STATUSES, LOST_ITEM_STATUSES } from '../utils/constants.js';

/**
 * LostItem Model (Discriminator of Base Item Model)
 * Supports full Phase 4 Lost Item specification:
 * - reporter (ref User)
 * - itemName / title
 * - category
 * - description
 * - dateLost
 * - timeLost
 * - location
 * - locationDetails
 * - color
 * - brand
 * - model
 * - identifyingMarks / identifyingFeatures
 * - estimatedValue
 * - images
 * - status (ACTIVE, MATCH_FOUND, CLAIM_IN_PROGRESS, RESOLVED, CLOSED)
 * - visibility
 * - createdAt, updatedAt
 */
const LostItemSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: {
        values: ALL_LOST_ITEM_STATUSES,
        message: 'Invalid status for lost item'
      },
      default: LOST_ITEM_STATUSES.ACTIVE,
      index: true
    }
  },
  {
    discriminatorKey: 'type'
  }
);

// High-speed compound indexes for lost item search and status filtering
LostItemSchema.index({ category: 1, status: 1, dateLost: -1 });
LostItemSchema.index({ reporter: 1, dateLost: -1 });
LostItemSchema.index({ location: 1, status: 1 });

export const LostItem =
  mongoose.models.LostItem || Item.discriminator('LostItem', LostItemSchema, 'lost');

export default LostItem;
