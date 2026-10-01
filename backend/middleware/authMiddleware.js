import mongoose from 'mongoose';
import { verifyAccessToken } from '../utils/generateToken.js';
import User from '../models/User.js';
import { ACCOUNT_STATUSES } from '../utils/constants.js';
import { devUserMemoryMap } from '../controllers/authController.js';

/**
 * Authentication Middleware (requireAuth)
 * Validates JWT access token and attaches active user record to request
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      // 2. Cookie fallback
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required. Please sign in.',
        errors: [{ message: 'No bearer token or session cookie provided' }]
      });
    }

    // 3. Verify Token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (tokenErr) {
      if (tokenErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Security token has expired. Please sign in again or refresh your session.',
          errors: [{ message: 'Access token expired' }]
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid security token provided.',
        errors: [{ message: 'Token verification failed' }]
      });
    }

    // 4. Verify User exists and is active
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.userId).select('-passwordHash');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User account associated with this token no longer exists.',
          errors: [{ message: 'User not found' }]
        });
      }

      if (user.accountStatus === ACCOUNT_STATUSES.SUSPENDED) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended by campus administration.',
          errors: [{ message: 'User account suspended' }]
        });
      }

      if (user.accountStatus === ACCOUNT_STATUSES.PENDING) {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending verification by campus administration.',
          errors: [{ message: 'User account pending' }]
        });
      }
    } else {
      const devUid = (decoded.userId || decoded._id)?.toString();
      const storedDevUser = devUserMemoryMap.get(devUid) ||
        Array.from(devUserMemoryMap.values()).find(u => (u._id?.toString() || u.id?.toString()) === devUid || u.email === decoded.email);

      user = storedDevUser ? { ...storedDevUser } : {
        _id: decoded.userId || decoded._id,
        id: decoded.userId || decoded._id,
        role: decoded.role || 'student',
        email: decoded.email || 'student@campus.edu',
        fullName: decoded.fullName || 'Authenticated Student',
        department: 'Campus Student',
        accountStatus: ACCOUNT_STATUSES.ACTIVE
      };

      if (user.accountStatus === ACCOUNT_STATUSES.SUSPENDED) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended by campus administration.',
          errors: [{ message: 'User account suspended' }]
        });
      }
    }

    // Attach authenticated user to request context
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Aliases for clean architectural naming
export const requireAuth = authenticate;

export default authenticate;
