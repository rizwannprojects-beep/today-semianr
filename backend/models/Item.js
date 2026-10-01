import mongoose from 'mongoose';
import {
  ALL_ITEM_TYPES,
  ITEM_TYPES,
  ITEM_CATEGORIES,
  ALL_ITEM_STATUSES,
  ITEM_STATUSES,
  ALL_ITEM_VISIBILITIES,
  ITEM_VISIBILITY,
  ALL_CONTACT_PREFERENCES,
  CONTACT_PREFERENCES
} from '../utils/constants.js';

const ItemSchema = new mongoose.Schema(
  {
    itemCode: {
      type: String,
      trim: true,
      uppercase: true,
      index: true
    },
    title: {
      type: String,
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    itemName: {
      type: String,
      trim: true,
      maxlength: [150, 'Item name cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Detailed description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters']
    },
    type: {
      type: String,
      required: [true, 'Item report type is required'],
      enum: {
        values: ALL_ITEM_TYPES,
        message: "Type must be either 'lost' or 'found'"
      },
      index: true
    },
    category: {
      type: String,
      required: [true, 'Item category is required'],
      enum: {
        values: ITEM_CATEGORIES,
        message: 'Invalid item category specified'
      },
      index: true
    },
    subcategory: {
      type: String,
      trim: true,
      default: ''
    },
    images: {
      type: [String],
      default: []
    },
    color: {
      type: String,
      trim: true,
      default: ''
    },
    brand: {
      type: String,
      trim: true,
      default: ''
    },
    model: {
      type: String,
      trim: true,
      default: ''
    },
    identifyingFeatures: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Identifying features cannot exceed 1000 characters']
    },
    identifyingMarks: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Identifying marks cannot exceed 1000 characters']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location description cannot exceed 200 characters'],
      index: true
    },
    locationDetails: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Location details cannot exceed 500 characters']
    },
    storageLocation: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Storage location description cannot exceed 200 characters']
    },
    estimatedValue: {
      type: Number,
      min: [0, 'Estimated value cannot be negative'],
      default: null
    },
    date: {
      type: Date,
      index: true
    },
    dateLost: {
      type: Date,
      index: true
    },
    dateFound: {
      type: Date,
      index: true
    },
    time: {
      type: String,
      trim: true,
      default: ''
    },
    timeLost: {
      type: String,
      trim: true,
      default: ''
    },
    timeFound: {
      type: String,
      trim: true,
      default: ''
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter reference is required'],
      index: true
    },
    status: {
      type: String,
      default: 'active',
      index: true
    },
    visibility: {
      type: String,
      enum: {
        values: ALL_ITEM_VISIBILITIES,
        message: 'Invalid visibility'
      },
      default: ITEM_VISIBILITY.PUBLIC
    },
    contactPreference: {
      type: String,
      enum: {
        values: ALL_CONTACT_PREFERENCES,
        message: 'Invalid contact preference'
      },
      default: CONTACT_PREFERENCES.IN_APP
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    foundBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    serialNumber: {
      type: String,
      trim: true,
      default: ''
    },
    securityQuestions: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },
    currentHolder: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    holdingLocation: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    discriminatorKey: 'type'
  }
);

// Pre-validate hook ensuring title/itemName, date/dateLost/dateFound, time/timeLost/timeFound, and marks are synced
ItemSchema.pre('validate', function (next) {
  if (!this.title && this.itemName) {
    this.title = this.itemName;
  } else if (!this.itemName && this.title) {
    this.itemName = this.title;
  }
  if (!this.title && !this.itemName) {
    this.title = 'Untitled Item';
    this.itemName = 'Untitled Item';
  }

  // Synchronize dates
  if (this.type === 'lost') {
    if (this.dateLost && !this.date) this.date = this.dateLost;
    if (this.date && !this.dateLost) this.dateLost = this.date;
    if (this.timeLost && !this.time) this.time = this.timeLost;
    if (this.time && !this.timeLost) this.timeLost = this.time;
  } else if (this.type === 'found') {
    if (this.dateFound && !this.date) this.date = this.dateFound;
    if (this.date && !this.dateFound) this.dateFound = this.date;
    if (this.timeFound && !this.time) this.time = this.timeFound;
    if (this.time && !this.timeFound) this.timeFound = this.time;
  }

  // Fallback date to today if none provided
  if (!this.date) {
    this.date = new Date();
    if (this.type === 'lost') this.dateLost = this.date;
    if (this.type === 'found') this.dateFound = this.date;
  }

  // Synchronize identifying marks
  if (this.identifyingMarks && !this.identifyingFeatures) {
    this.identifyingFeatures = this.identifyingMarks;
  } else if (this.identifyingFeatures && !this.identifyingMarks) {
    this.identifyingMarks = this.identifyingFeatures;
  }

  // Generate unique itemCode if not provided
  if (!this.itemCode) {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.itemCode = `LF-${year}-${random}`;
  }

  // Synchronize reportedBy and holdingLocation aliases
  if (!this.reportedBy && this.reporter) {
    this.reportedBy = this.reporter;
  } else if (!this.reporter && this.reportedBy) {
    this.reporter = this.reportedBy;
  }
  if (!this.holdingLocation && this.storageLocation) {
    this.holdingLocation = this.storageLocation;
  } else if (!this.storageLocation && this.holdingLocation) {
    this.storageLocation = this.holdingLocation;
  }

  next();
});

// High-speed compound indexes for search, filtering, and reporting dashboards
ItemSchema.index({ type: 1, category: 1, status: 1, date: -1 });
ItemSchema.index({ type: 1, dateLost: -1 });
ItemSchema.index({ type: 1, dateFound: -1 });
ItemSchema.index({ type: 1, location: 1, status: 1 });
ItemSchema.index({ reporter: 1, createdAt: -1 });
ItemSchema.index({ createdAt: 1, type: 1 });
ItemSchema.index({ status: 1, type: 1, createdAt: 1 });
ItemSchema.index({ category: 1, type: 1, status: 1 });
ItemSchema.index(
  {
    title: 'text',
    itemName: 'text',
    description: 'text',
    location: 'text',
    locationDetails: 'text',
    brand: 'text',
    model: 'text',
    color: 'text',
    category: 'text'
  },
  {
    weights: {
      itemName: 10,
      title: 10,
      brand: 5,
      model: 4,
      location: 3,
      description: 1
    }
  }
);

export const Item = mongoose.model('Item', ItemSchema);
export default Item;
