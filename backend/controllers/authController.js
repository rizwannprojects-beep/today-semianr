import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken.js';
import { serializeUser } from '../utils/userSerializer.js';
import AuditService from '../services/auditService.js';
import environment from '../config/environment.js';
import { AUDIT_ACTIONS, ROLES, ACCOUNT_STATUSES } from '../utils/constants.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: environment.isProduction,
  sameSite: environment.isProduction ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: environment.isProduction,
  sameSite: environment.isProduction ? 'strict' : 'lax'
};

// In-Memory Dev User store when MongoDB service is offline
export const devUserMemoryMap = new Map();

/**
 * @desc Register a new student/campus user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      phoneNumber,
      registerNumber,
      department,
      course,
      year,
      semester,
      className,
      role
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Dev mode fallback if MongoDB service is not running locally
    if (mongoose.connection.readyState !== 1) {
      if (devUserMemoryMap.has(normalizedEmail)) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
          errors: [{ field: 'email', message: 'Email address is already registered' }]
        });
      }

      let assignedRole = ROLES.STUDENT;
      if (environment.isDevelopment && (role === ROLES.ADMIN || role === 'admin')) {
        const isAdminEmail = normalizedEmail === 'admin@campus.edu' ||
          normalizedEmail.startsWith('admin.') ||
          normalizedEmail.startsWith('coordinator.');
        if (isAdminEmail) {
          assignedRole = ROLES.ADMIN;
        }
      }

      const devUserId = new mongoose.Types.ObjectId().toString();
      const cleanRegNo = registerNumber ? registerNumber.toUpperCase().trim() : 'REG2024CS' + Math.floor(100 + Math.random() * 900);
      const devUser = {
        _id: devUserId,
        id: devUserId,
        fullName: fullName ? fullName.trim() : (assignedRole === ROLES.ADMIN ? 'Campus Administrator' : 'Alex Student'),
        email: normalizedEmail,
        role: assignedRole,
        registerNumber: cleanRegNo,
        department: department || (assignedRole === ROLES.ADMIN ? 'Campus Security & Administration' : 'Computer Science & Engineering'),
        course: course || 'B.Tech',
        year: year || 3,
        phoneNumber: phoneNumber || phone || '9876543210',
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        passwordHash: password
      };
      const accessToken = generateAccessToken({ _id: devUserId, role: devUser.role, email: devUser.email });
      const refreshToken = generateRefreshToken({ _id: devUserId });
      devUserMemoryMap.set(normalizedEmail, devUser);
      devUserMemoryMap.set(devUserId, devUser);
      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      return res.status(201).json({
        success: true,
        message: 'Registration completed successfully (dev mode)',
        data: {
          user: serializeUser(devUser),
          accessToken
        }
      });
    }

    // 1. Check if email already registered
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
        errors: [{ field: 'email', message: 'Email address is already registered' }]
      });
    }

    // 2. Check registerNumber uniqueness if provided
    const cleanRegNo = registerNumber ? registerNumber.toUpperCase().trim() : undefined;
    if (cleanRegNo) {
      const existingReg = await User.findOne({ registerNumber: cleanRegNo });
      if (existingReg) {
        return res.status(409).json({
          success: false,
          message: 'An account with this register number already exists.',
          errors: [{ field: 'registerNumber', message: 'Register number already associated with another student' }]
        });
      }
    }

    // 3. Security Rule: Public registration is strictly student role.
    // In development testing, only designated institutional coordinator addresses can initialize admin testing roles.
    let assignedRole = ROLES.STUDENT;
    if (environment.isDevelopment && (role === ROLES.ADMIN || role === 'admin')) {
      const isAdminEmail = normalizedEmail === 'admin@campus.edu' ||
        normalizedEmail.startsWith('admin.') ||
        normalizedEmail.startsWith('coordinator.');
      if (isAdminEmail) {
        assignedRole = ROLES.ADMIN;
      }
    }

    const studentName = (fullName || req.body.name || '').trim();
    const studentClass = (className || req.body.classDivision || '').trim();

    const user = await User.create({
      fullName: studentName,
      email: normalizedEmail,
      passwordHash: password, // Pre-save hook hashes with bcrypt (12 rounds)
      phone: phone || phoneNumber || '',
      phoneNumber: phoneNumber || phone || '',
      registerNumber: cleanRegNo,
      department: department?.trim() || '',
      course: course?.trim() || '',
      year: year ? parseInt(year, 10) : null,
      semester: semester ? parseInt(semester, 10) : null,
      className: studentClass,
      role: assignedRole,
      accountStatus: ACCOUNT_STATUSES.ACTIVE,
      emailVerified: false,
      lastLoginAt: new Date()
    });

    // 4. Generate security tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 5. Record forensic audit log
    await AuditService.log({
      actor: user._id,
      actorEmail: user.email,
      action: AUDIT_ACTIONS.ACCOUNT_CREATION,
      entityType: 'User',
      entityId: user._id,
      metadata: { role: user.role, email: user.email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // 6. Set HTTP-only secure cookie for refresh token
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: 'Student registration completed successfully',
      data: {
        user: serializeUser(user),
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Authenticate user and issue tokens
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    // Generic error to prevent email enumeration / timing attacks
    const invalidCredentialsResponse = () =>
      res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
        errors: [{ message: 'Authentication failed' }]
      });

    // Dev mode fallback if MongoDB service is not running locally
    if (mongoose.connection.readyState !== 1) {
      let devUser = devUserMemoryMap.get(normalizedEmail);
      if (!devUser) {
        const isPredefinedAdmin = normalizedEmail === 'admin@campus.edu' || normalizedEmail === 'system.admin@campus.edu';
        const isPredefinedStudent = normalizedEmail === 'arjun.nair@campus.edu' ||
          normalizedEmail === 'student@campus.edu' ||
          normalizedEmail === 'alex.rivera@campus.edu' ||
          normalizedEmail === 'student@university.edu';

        if (isPredefinedAdmin) {
          if (password !== 'Admin@123' && password !== 'AdminPassword123!') {
            return invalidCredentialsResponse();
          }
          const devUserId = new mongoose.Types.ObjectId().toString();
          devUser = {
            _id: devUserId,
            id: devUserId,
            fullName: 'Campus Administrator',
            email: normalizedEmail,
            role: ROLES.ADMIN,
            registerNumber: 'ADMIN-001',
            department: 'Campus Security & Administration',
            course: 'Staff',
            year: null,
            phoneNumber: '+1 (555) 019-4820',
            accountStatus: ACCOUNT_STATUSES.ACTIVE,
            passwordHash: password
          };
          devUserMemoryMap.set(normalizedEmail, devUser);
          devUserMemoryMap.set(devUserId, devUser);
        } else if (isPredefinedStudent) {
          if (
            password !== 'Campus@123' &&
            password !== 'StudentPassword123!' &&
            password !== 'Student123!' &&
            password !== 'Password123!'
          ) {
            return invalidCredentialsResponse();
          }
          const devUserId = new mongoose.Types.ObjectId().toString();
          devUser = {
            _id: devUserId,
            id: devUserId,
            fullName: normalizedEmail === 'arjun.nair@campus.edu' ? 'Arjun Nair' : 'Alex Rivera',
            email: normalizedEmail,
            role: ROLES.STUDENT,
            registerNumber: normalizedEmail === 'arjun.nair@campus.edu' ? 'BCA2024001' : 'CS2026-482',
            department: normalizedEmail === 'arjun.nair@campus.edu' ? 'BCA' : 'Computer Science & Engineering',
            course: normalizedEmail === 'arjun.nair@campus.edu' ? 'BCA Honours' : 'B.Tech',
            year: 3,
            semester: 5,
            phoneNumber: normalizedEmail === 'arjun.nair@campus.edu' ? '9876543210' : '+1 (555) 839-2041',
            accountStatus: ACCOUNT_STATUSES.ACTIVE,
            passwordHash: password
          };
          devUserMemoryMap.set(normalizedEmail, devUser);
          devUserMemoryMap.set(devUserId, devUser);
        } else {
          return invalidCredentialsResponse();
        }
      } else {
        if (devUser.passwordHash && devUser.passwordHash !== password) {
          return invalidCredentialsResponse();
        }
      }

      if (devUser.accountStatus === ACCOUNT_STATUSES.SUSPENDED) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended by campus administration.',
          errors: [{ message: 'Account suspended' }]
        });
      }

      const accessToken = generateAccessToken({ _id: devUser._id, role: devUser.role, email: devUser.email });
      const refreshToken = generateRefreshToken({ _id: devUser._id });
      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: serializeUser(devUser),
          accessToken
        }
      });
    }

    // 1. Fetch user by email including hidden passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      await AuditService.log({
        actorEmail: normalizedEmail,
        action: AUDIT_ACTIONS.FAILED_LOGIN,
        entityType: 'User',
        metadata: { reason: 'User not found' },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      return invalidCredentialsResponse();
    }

    // 2. Account Status Verification
    if (user.accountStatus === ACCOUNT_STATUSES.SUSPENDED) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by campus administration.',
        errors: [{ message: 'Account suspended' }]
      });
    }

    if (user.accountStatus === ACCOUNT_STATUSES.PENDING) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending verification by campus administration.',
        errors: [{ message: 'Account pending activation' }]
      });
    }

    // 3. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await AuditService.log({
        actor: user._id,
        actorEmail: user.email,
        action: AUDIT_ACTIONS.FAILED_LOGIN,
        entityType: 'User',
        entityId: user._id,
        metadata: { reason: 'Password mismatch' },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      return invalidCredentialsResponse();
    }

    // 4. Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    // 5. Generate Access & Refresh Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // If rememberMe is checked, prolong refresh cookie lifespan (30 days vs 7 days)
    const cookieOptions = {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    // 6. Record login audit
    await AuditService.log({
      actor: user._id,
      actorEmail: user.email,
      action: AUDIT_ACTIONS.LOGIN,
      entityType: 'User',
      entityId: user._id,
      metadata: { role: user.role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: serializeUser(user),
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Refresh access token using secure refresh cookie
 * @route POST /api/auth/refresh
 * @access Public
 */
export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required to renew session.',
        errors: [{ message: 'Missing refresh token' }]
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please sign in again.',
        errors: [{ message: 'Refresh token invalid' }]
      });
    }

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.userId);
    } else {
      const devUid = decoded.userId?.toString();
      user = devUserMemoryMap.get(devUid) ||
        Array.from(devUserMemoryMap.values()).find(u => (u._id?.toString() || u.id?.toString()) === devUid);
      if (!user) {
        user = {
          _id: devUid,
          id: devUid,
          role: 'student',
          accountStatus: ACCOUNT_STATUSES.ACTIVE
        };
      }
    }

    if (!user || user.accountStatus !== ACCOUNT_STATUSES.ACTIVE) {
      return res.status(401).json({
        success: false,
        message: 'User account is not found or is currently not active.',
        errors: [{ message: 'Account status invalid' }]
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Logout user and revoke refresh cookie
 * @route POST /api/auth/logout
 * @access Public
 */
export const logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);

    if (req.user) {
      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: AUDIT_ACTIONS.LOGOUT,
        entityType: 'User',
        entityId: req.user._id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get currently authenticated user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Active profile retrieved successfully',
      data: {
        user: serializeUser(req.user)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Request password reset token via email
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    // Privacy rule: Never reveal whether an email exists in the system
    const genericSuccessMessage = 'If an account with that email exists, a password reset link has been dispatched.';

    // Safe handling if database connection is not active
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        message: genericSuccessMessage,
        data: {}
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: genericSuccessMessage,
        data: {}
      });
    }

    // Generate random 32-byte cryptographic token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set 1-hour expiration
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    await AuditService.log({
      actor: user._id,
      actorEmail: user.email,
      action: AUDIT_ACTIONS.PASSWORD_RESET_REQUEST,
      entityType: 'User',
      entityId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // In development mode, provide token in data for testing convenience without needing an external mail server
    return res.status(200).json({
      success: true,
      message: genericSuccessMessage,
      data: {
        ...(environment.isDevelopment && {
          devResetToken: resetToken,
          devResetUrl: `${environment.clientUrl}/reset-password?token=${resetToken}`
        })
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Reset password using token
 * @route POST /api/auth/reset-password
 * @access Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
        errors: [{ field: 'token', message: 'Invalid or expired token' }]
      });
    }

    // Hash incoming token to match database hash
    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+passwordHash +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
        errors: [{ field: 'token', message: 'Invalid or expired token' }]
      });
    }

    // Set new password
    user.passwordHash = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    await AuditService.log({
      actor: user._id,
      actorEmail: user.email,
      action: AUDIT_ACTIONS.PASSWORD_RESET,
      entityType: 'User',
      entityId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({
      success: true,
      message: 'Password has been successfully updated. You can now sign in with your new credentials.',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword
};
