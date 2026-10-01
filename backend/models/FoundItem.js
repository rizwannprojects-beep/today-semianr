import mongoose from 'mongoose';
import Item from './Item.js';
import { ALL_FOUND_ITEM_STATUSES, FOUND_ITEM_STATUSES } from '../utils/constants.js';

/**
 * FoundItem Model (Discriminator of Base Item Model)
 * Supports full Phase 4 Found Item specification:
 * - reporter (ref User)
 * - itemName / title
 * - category
 * - description
 * - dateFound
 * - timeFound
 * - location
 * - locationDetails
 * - storageLocation (Physical custody / campus holding desk)
 * - color
 * - brand
 * - model
 * - identifyingMarks / identifyingFeatures
 * - images
 * - status (FOUND, UNDER_VERIFICATION, CLAIMED, RETURNED, CLOSED, EXPIRED)
 * - visibility
 * - createdAt, updatedAt
 */
const FoundItemSchema = new mongoose.Schema(
  {
    storageLocation: {
      type: String,
      trim: true,
      default: 'Administration & Security Desk',
      maxlength: [200, 'Storage location description cannot exceed 200 characters']
    },
    status: {
      type: String,
      enum: {
        values: ALL_FOUND_ITEM_STATUSES,
        message: 'Invalid status for found item'
      },
      default: FOUND_ITEM_STATUSES.FOUND,
      index: true
    }
  },
  {
    discriminatorKey: 'type'
  }
);

// High-speed compound indexes for found item query and physical storage lookup
FoundItemSchema.index({ category: 1, status: 1, dateFound: -1 });
FoundItemSchema.index({ storageLocation: 1, status: 1 });
FoundItemSchema.index({ reporter: 1, dateFound: -1 });

export const FoundItem =
  mongoose.models.FoundItem || Item.discriminator('FoundItem', FoundItemSchema, 'found');

export default FoundItem;
