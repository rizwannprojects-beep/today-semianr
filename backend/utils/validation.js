import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';
import {
  ALL_ROLES,
  ALL_ITEM_TYPES,
  ITEM_CATEGORIES,
  ALL_ITEM_STATUSES,
  ALL_CLAIM_STATUSES
} from './constants.js';

export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id) || id.startsWith('dev_') || id.startsWith('test_') || id.startsWith('mod_') || id.startsWith('ann_');
};

/**
 * Custom rule for validating ObjectIds in URL parameters
 */
export const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .trim()
    .notEmpty()
    .withMessage(`Parameter '${paramName}' is required`)
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error(`Invalid resource identifier format for '${paramName}'`);
      }
      return true;
    })
];

/**
 * Strong Password Regex:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/;

/**
 * User Registration Validation Rules
 */
export const registerValidationRules = [
  body('fullName')
    .custom((value, { req }) => {
      const name = value || req.body.name;
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        throw new Error('Full name is required and must be between 2 and 100 characters');
      }
      if (name.trim().length > 100) {
        throw new Error('Full name cannot exceed 100 characters');
      }
      return true;
    }),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid institutional email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(PASSWORD_REGEX)
    .withMessage(
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  body('confirmPassword')
    .optional()
    .custom((value, { req }) => {
      if (value && value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)
    .withMessage('Please provide a valid phone number'),

  body('phoneNumber')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),

  body('registerNumber')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Register number must be between 3 and 30 characters'),

  body('department')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),

  body('course')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Course cannot exceed 100 characters'),

  body('year')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 6 })
    .withMessage('Year must be between 1 and 6'),

  body('semester')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 12 })
    .withMessage('Semester must be between 1 and 12'),

  body('className')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Class/division cannot exceed 50 characters')
];

/**
 * User Login Validation Rules
 */
export const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Forgot Password Validation Rules
 */
export const forgotPasswordValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Institutional email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

/**
 * Reset Password Validation Rules
 */
export const resetPasswordValidationRules = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required'),

  body('password')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(PASSWORD_REGEX)
    .withMessage(
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  body('confirmPassword')
    .optional()
    .custom((value, { req }) => {
      if (value && value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

/**
 * Password Update Validation Rules
 */
export const updatePasswordValidationRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(PASSWORD_REGEX)
    .withMessage(
      'New password must include at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
];

/**
 * Item (Lost/Found) Creation Validation Rules
 */
export const createItemValidationRules = [
  body('title')
    .custom((value, { req }) => {
      const name = value || req.body.itemName;
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        throw new Error('Item name is required and must be between 2 and 150 characters');
      }
      if (name.trim().length > 150) {
        throw new Error('Item name cannot exceed 150 characters');
      }
      return true;
    }),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Item description is required')
    .isLength({ min: 5, max: 3000 })
    .withMessage('Description must be between 5 and 3000 characters'),

  body('type')
    .optional()
    .trim()
    .isIn(ALL_ITEM_TYPES)
    .withMessage("Item type must be either 'lost' or 'found'"),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Item category is required')
    .isIn(ITEM_CATEGORIES)
    .withMessage(`Category must be one of the registered campus categories`),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Campus location is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),

  body('date')
    .custom((value, { req }) => {
      const d = value || req.body.dateLost || req.body.dateFound;
      if (!d) {
        throw new Error('Date is required');
      }
      const parsed = new Date(d);
      if (isNaN(parsed.getTime())) {
        throw new Error('Please provide a valid date format');
      }
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (parsed > today) {
        throw new Error('Incident date cannot be in the future');
      }
      return true;
    }),

  body('images')
    .optional()
    .isArray({ max: 5 })
    .withMessage('A maximum of 5 images can be attached per report')
    .custom((arr) => {
      if (Array.isArray(arr)) {
        for (const img of arr) {
          if (
            typeof img !== 'string' ||
            (!img.startsWith('/') && !img.startsWith('http') && !img.startsWith('data:image/'))
          ) {
            throw new Error('Each image must be a valid image path or URL');
          }
        }
      }
      return true;
    }),

  body('identifyingFeatures')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Identifying features cannot exceed 1000 characters'),

  body('identifyingMarks')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Identifying marks cannot exceed 1000 characters'),

  body('estimatedValue')
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage('Estimated value must be a valid number')
];

/**
 * Lost Item Creation Validation Rules
 */
export const createLostItemValidationRules = [...createItemValidationRules];

/**
 * Found Item Creation Validation Rules
 */
export const createFoundItemValidationRules = [
  ...createItemValidationRules,
  body('storageLocation')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Storage location description cannot exceed 200 characters')
];

/**
 * Item Update Validation Rules
 */
export const updateItemValidationRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Item title must be between 2 and 150 characters'),

  body('itemName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Item name must be between 2 and 150 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 5, max: 3000 })
    .withMessage('Description must be between 5 and 3000 characters'),

  body('category')
    .optional()
    .trim()
    .isIn(ITEM_CATEGORIES)
    .withMessage('Invalid item category specified'),

  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),

  body('status')
    .optional()
    .trim()
    .isIn(ALL_ITEM_STATUSES)
    .withMessage('Invalid lifecycle status value'),

  body('images')
    .optional()
    .isArray({ max: 5 })
    .withMessage('A maximum of 5 images can be attached per report')
];

/**
 * Claim Creation Validation Rules
 */
export const createClaimValidationRules = [
  body('item')
    .custom((value, { req }) => {
      const id = value || req.body.itemId || req.body.foundItemId;
      if (!id) {
        throw new Error('Item ID is required to file an ownership claim');
      }
      if (!isValidObjectId(id)) {
        throw new Error('Invalid item identifier format');
      }
      req.body.item = id;
      return true;
    }),

  body('ownershipProof')
    .custom((value, { req }) => {
      const raw = value !== undefined && value !== null ? value : req.body.proofDetails;
      const proof = typeof raw === 'string' ? raw.trim() : '';
      if (!proof || proof.length < 5) {
        throw new Error('Ownership proof must provide at least 5 characters of specific identifying details');
      }
      req.body.ownershipProof = proof;
      return true;
    }),

  body('reason')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Reason cannot exceed 2000 characters')
];
