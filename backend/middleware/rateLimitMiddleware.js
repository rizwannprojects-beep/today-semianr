import rateLimit from 'express-rate-limit';
import environment from '../config/environment.js';

/**
 * Standard API rate limiter for general routes
 */
export const apiLimiter = rateLimit({
  windowMs: environment.rateLimitWindowMs,
  max: environment.isDevelopment ? 2000 : environment.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP address. Please try again later.',
      errors: [{ message: 'Rate limit exceeded. Window: 15 minutes.' }]
    });
  }
});

/**
 * Stricter rate limiter for authentication routes (login/register) to prevent brute-force
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: environment.isDevelopment ? 500 : environment.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
      errors: [{ message: 'Brute-force protection triggered.' }]
    });
  }
});

/**
 * Dedicated limiter for password reset requests to protect email infrastructure and prevent abuse
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: environment.isDevelopment ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many password reset requests. Please try again after 15 minutes.',
      errors: [{ message: 'Rate limit exceeded for password reset.' }]
    });
  }
});

/**
 * Strict verification limiter to prevent brute-forcing 6-character return verification codes
 */
export const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: environment.isDevelopment ? 200 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many verification code attempts. Please wait 15 minutes before trying again.',
      errors: [{ message: 'Brute-force protection: Return verification code attempts throttled.' }]
    });
  }
});

/**
 * Rate limiter for file uploads to prevent storage abuse and DOS
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: environment.isDevelopment ? 300 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Upload rate limit reached. Please wait before uploading more files.',
      errors: [{ message: 'Upload rate limit exceeded.' }]
    });
  }
});

/**
 * Rate limiter for lost and found report creation to prevent spam
 */
export const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: environment.isDevelopment ? 500 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Report submission rate limit reached. Please wait a few moments before filing another report.',
      errors: [{ message: 'Rate limit exceeded for item reporting. Max 30 reports per 15 minutes.' }]
    });
  }
});

/**
 * Rate limiter for claim submissions to prevent abuse
 */
export const claimLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: environment.isDevelopment ? 500 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Claim submission rate limit reached. Please wait before filing another claim.',
      errors: [{ message: 'Rate limit exceeded for claims. Max 20 submissions per 15 minutes.' }]
    });
  }
});

/**
 * Rate limiter for sensitive administrative operations
 */
export const adminActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: environment.isDevelopment ? 500 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Administrative operation rate limit reached. Please pause briefly before proceeding.',
      errors: [{ message: 'Administrative rate limit exceeded.' }]
    });
  }
});

/**
 * Rate limiter for expensive analytics and reporting queries
 */
export const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: environment.isDevelopment ? 500 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Analytics query rate limit reached. Please pause briefly before requesting more data.',
      code: 'RATE_LIMIT_EXCEEDED',
      errors: [{ message: 'Rate limit exceeded for analytics queries.' }]
    });
  }
});

/**
 * Rate limiter for notification endpoints to prevent polling abuse
 */
export const notificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: environment.isDevelopment ? 1000 : 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Notification polling rate limit reached. Please reduce request frequency.',
      errors: [{ message: 'Rate limit exceeded for notification queries.' }]
    });
  }
});

export default {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  verificationLimiter,
  uploadLimiter,
  reportLimiter,
  claimLimiter,
  adminActionLimiter,
  analyticsLimiter,
  notificationLimiter
};
