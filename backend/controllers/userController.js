import mongoose from 'mongoose';
import User from '../models/User.js';
import AuditService from '../services/auditService.js';
import { AUDIT_ACTIONS } from '../utils/constants.js';
import { serializeUser } from '../utils/userSerializer.js';
import { devUserMemoryMap } from './authController.js';

/**
 * @desc Get current student profile
 * @route GET /api/users/me
 * @access Private
 */
export const getMyProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: serializeUser(req.user)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update current student profile details
 * @route PUT /api/users/me, PATCH /api/users/profile
 * @access Private
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.fullName || req.body.name) {
      updates.fullName = (req.body.fullName || req.body.name).trim();
    }
    if (req.body.phone !== undefined || req.body.phoneNumber !== undefined) {
      const p = (req.body.phone || req.body.phoneNumber || '').trim();
      updates.phone = p;
      updates.phoneNumber = p;
    }
    if (req.body.department !== undefined) updates.department = req.body.department.trim();
    if (req.body.course !== undefined) updates.course = req.body.course.trim();
    if (req.body.year !== undefined) updates.year = parseInt(req.body.year, 10) || null;
    if (req.body.semester !== undefined) updates.semester = parseInt(req.body.semester, 10) || null;
    if (req.body.className !== undefined || req.body.classDivision !== undefined) {
      updates.className = (req.body.className || req.body.classDivision || '').trim();
    }

    // Enforce: Sensitive fields (registerNumber, email, role, accountStatus, passwordHash)
    // are strictly excluded from self-service edits.

    if (mongoose.connection.readyState !== 1) {
      const devUserId = (req.user._id || req.user.id)?.toString();
      const devUser = devUserMemoryMap.get(devUserId) ||
        Array.from(devUserMemoryMap.values()).find(u => (u._id?.toString() || u.id?.toString()) === devUserId || u.email === req.user.email);
      
      if (devUser) {
        Object.assign(devUser, updates);
        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          data: {
            user: serializeUser(devUser)
          }
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    await AuditService.log({
      actor: req.user._id,
      actorEmail: req.user.email,
      action: AUDIT_ACTIONS.REPORT_MODIFICATION,
      entityType: 'User',
      entityId: req.user._id,
      metadata: { updatedFields: Object.keys(updates) },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: serializeUser(updatedUser || req.user)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Change user password
 * @route PUT /api/users/me/password
 * @access Private
 */
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
        errors: [{ field: 'newPassword', message: 'Password must be at least 8 characters' }]
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
        errors: [{ message: 'User not found' }]
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password provided is incorrect.',
        errors: [{ field: 'currentPassword', message: 'Incorrect current password' }]
      });
    }

    user.passwordHash = newPassword;
    await user.save();

    await AuditService.log({
      actor: user._id,
      actorEmail: user.email,
      action: AUDIT_ACTIONS.PASSWORD_RESET || 'password_change',
      entityType: 'User',
      entityId: user._id,
      metadata: { action: 'password_change' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please keep your credentials secure.',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyProfile,
  updateMyProfile,
  updatePassword
};
