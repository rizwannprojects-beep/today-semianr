import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ALL_ROLES, ROLES, ALL_ACCOUNT_STATUSES, ACCOUNT_STATUSES } from '../utils/constants.js';

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Institutional email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please enter a valid institutional email address'
      ]
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
      default: ''
    },
    // Supporting phoneNumber as alias for backwards compatibility
    phoneNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
      default: ''
    },
    registerNumber: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      index: true,
      maxlength: [30, 'Register number cannot exceed 30 characters']
    },
    department: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Department cannot exceed 100 characters']
    },
    course: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Course cannot exceed 100 characters']
    },
    year: {
      type: Number,
      min: [1, 'Year must be at least 1'],
      max: [6, 'Year cannot exceed 6'],
      default: null
    },
    semester: {
      type: Number,
      min: [1, 'Semester must be at least 1'],
      max: [12, 'Semester cannot exceed 12'],
      default: null
    },
    className: {
      type: String,
      trim: true,
      maxlength: [50, 'Class/division cannot exceed 50 characters'],
      default: ''
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false // Excluded from query results by default
    },
    role: {
      type: String,
      enum: {
        values: ALL_ROLES,
        message: 'Invalid role specified'
      },
      default: ROLES.STUDENT,
      index: true
    },
    accountStatus: {
      type: String,
      enum: {
        values: ALL_ACCOUNT_STATUSES,
        message: 'Invalid account status'
      },
      default: ACCOUNT_STATUSES.ACTIVE,
      index: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    resetPasswordToken: {
      type: String,
      select: false,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
      default: null
    },
    profileImage: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      trim: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
    },
    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.__v;
        if (!ret.name && ret.fullName) ret.name = ret.fullName;
        if (!ret.fullName && ret.name) ret.fullName = ret.name;
        if (ret.isVerified === undefined) ret.isVerified = ret.emailVerified;
        if (ret.isActive === undefined) ret.isActive = ret.accountStatus === 'active';
        if (!ret.lastLogin && ret.lastLoginAt) ret.lastLogin = ret.lastLoginAt;
        return ret;
      }
    }
  }
);

// Virtual property to sync fields
UserSchema.pre('validate', function (next) {
  if (this.name && !this.fullName) {
    this.fullName = this.name;
  } else if (this.fullName && !this.name) {
    this.name = this.fullName;
  }
  if (this.phone && !this.phoneNumber) {
    this.phoneNumber = this.phone;
  } else if (this.phoneNumber && !this.phone) {
    this.phone = this.phoneNumber;
  }
  if (this.isVerified !== undefined && this.emailVerified === undefined) {
    this.emailVerified = this.isVerified;
  } else if (this.emailVerified !== undefined && this.isVerified === undefined) {
    this.isVerified = this.emailVerified;
  }
  if (this.isActive !== undefined) {
    this.accountStatus = this.isActive ? ACCOUNT_STATUSES.ACTIVE : ACCOUNT_STATUSES.SUSPENDED;
  } else if (this.accountStatus !== undefined) {
    this.isActive = this.accountStatus === ACCOUNT_STATUSES.ACTIVE;
  }
  if (this.lastLogin && !this.lastLoginAt) {
    this.lastLoginAt = this.lastLogin;
  } else if (this.lastLoginAt && !this.lastLogin) {
    this.lastLogin = this.lastLoginAt;
  }
  next();
});

// Compound index for role and account status
UserSchema.index({ role: 1, accountStatus: 1 });

// Pre-save hook to hash password if modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password helper method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model('User', UserSchema);
export default User;
