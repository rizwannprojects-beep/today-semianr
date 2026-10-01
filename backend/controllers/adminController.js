import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import Match from '../models/Match.js';
import AuditLog from '../models/AuditLog.js';
import Return from '../models/Return.js';
import ModerationReport from '../models/ModerationReport.js';
import Announcement from '../models/Announcement.js';
import NotificationService from '../services/notificationService.js';
import AuditService, { inMemoryAuditLogs } from '../services/auditService.js';
import { devUserMemoryMap } from './authController.js';
import { inMemoryStore } from './itemController.js';
import { inMemoryClaimStore, formatClaimResponse } from './claimController.js';
import { inMemoryMatchStore } from '../services/matchingService.js';
import { inMemoryReturnStore, formatReturnResponse } from './returnController.js';
import {
  AUDIT_ACTIONS,
  CLAIM_STATUSES,
  ITEM_STATUSES,
  NOTIFICATION_TYPES,
  ROLES,
  ACCOUNT_STATUSES,
  RETURN_STATUSES
} from '../utils/constants.js';

// In-Memory Dev Stores for moderation reports and announcements
export const inMemoryModerationReports = [];
export const inMemoryAnnouncements = [];

/**
 * Sanitizes user record for admin outputs (never exposes passwordHash or reset tokens)
 */
const sanitizeAdminUser = (u) => {
  if (!u) return null;
  const doc = u.toObject ? u.toObject() : { ...u };
  delete doc.passwordHash;
  delete doc.password;
  delete doc.resetPasswordToken;
  delete doc.resetPasswordExpires;
  delete doc.__v;
  return {
    ...doc,
    _id: doc._id || doc.id,
    id: doc._id || doc.id
  };
};

/**
 * @desc Get real high-level administrative dashboard statistics and chart metrics
 * @route GET /api/admin/dashboard
 * @access Private (Admin / Superadmin / Staff)
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;

    let usersTotal = 0;
    let usersActive = 0;
    let usersSuspended = 0;
    let usersNewStudents = 0;

    let itemsTotal = 0;
    let itemsLost = 0;
    let itemsFound = 0;
    let itemsActive = 0;
    let itemsResolved = 0;
    let itemsReturned = 0;

    let claimsTotal = 0;
    let claimsPending = 0;
    let claimsUnderReview = 0;
    let claimsApproved = 0;
    let claimsRejected = 0;
    let claimsCompleted = 0;

    let matchesTotal = 0;
    let matchesHighConfidence = 0;
    let matchesPossible = 0;
    let matchesResolved = 0;

    let returnsTotal = 0;
    let returnsPending = 0;
    let returnsScheduled = 0;
    let returnsCompleted = 0;
    let returnsDisputed = 0;

    let categoryBreakdown = {};
    let recentActivity = [];

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    if (isDbReady) {
      // 1. Users Aggregations
      [usersTotal, usersActive, usersSuspended, usersNewStudents] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ accountStatus: ACCOUNT_STATUSES.ACTIVE }),
        User.countDocuments({ accountStatus: ACCOUNT_STATUSES.SUSPENDED }),
        User.countDocuments({ role: ROLES.STUDENT, createdAt: { $gte: thirtyDaysAgo } })
      ]);

      // 2. Items Aggregations
      [itemsTotal, itemsLost, itemsFound, itemsActive, itemsResolved, itemsReturned] = await Promise.all([
        Item.countDocuments(),
        Item.countDocuments({ type: 'lost' }),
        Item.countDocuments({ type: 'found' }),
        Item.countDocuments({ status: { $in: ['ACTIVE', 'active', 'FOUND', 'found'] } }),
        Item.countDocuments({ status: { $in: ['RESOLVED', 'resolved'] } }),
        Item.countDocuments({ status: { $in: ['RETURNED', 'returned'] } })
      ]);

      // 3. Claims Aggregations
      [claimsTotal, claimsPending, claimsUnderReview, claimsApproved, claimsRejected, claimsCompleted] = await Promise.all([
        Claim.countDocuments(),
        Claim.countDocuments({ status: { $in: [CLAIM_STATUSES.PENDING, 'pending', 'PENDING'] } }),
        Claim.countDocuments({ status: { $in: [CLAIM_STATUSES.UNDER_REVIEW, 'underReview', 'UNDER_REVIEW'] } }),
        Claim.countDocuments({ status: { $in: [CLAIM_STATUSES.APPROVED, 'approved', 'APPROVED'] } }),
        Claim.countDocuments({ status: { $in: [CLAIM_STATUSES.REJECTED, 'rejected', 'REJECTED'] } }),
        Claim.countDocuments({ status: { $in: [CLAIM_STATUSES.COMPLETED, 'completed', 'COMPLETED'] } })
      ]);

      // 4. Matches Aggregations
      [matchesTotal, matchesHighConfidence, matchesPossible, matchesResolved] = await Promise.all([
        Match.countDocuments(),
        Match.countDocuments({ matchScore: { $gte: 80 } }),
        Match.countDocuments({ matchScore: { $gte: 60, $lt: 80 } }),
        Match.countDocuments({ status: { $in: ['resolved', 'RESOLVED'] } })
      ]);

      // 5. Returns Aggregations
      [returnsTotal, returnsPending, returnsScheduled, returnsCompleted, returnsDisputed] = await Promise.all([
        Return.countDocuments(),
        Return.countDocuments({ status: { $in: ['READY_FOR_RETURN', 'ready_for_return', 'RETURN_REQUESTED'] } }),
        Return.countDocuments({ status: { $in: ['SCHEDULED', 'scheduled', 'OWNER_ARRIVED', 'IDENTITY_VERIFICATION'] } }),
        Return.countDocuments({ status: { $in: ['RETURNED', 'returned'] } }),
        Return.countDocuments({ status: { $in: ['DISPUTED', 'disputed'] } })
      ]);

      // Category breakdown aggregation
      const catAgg = await Item.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      catAgg.forEach((c) => {
        if (c._id) categoryBreakdown[c._id] = c.count;
      });

      // Recent Activity from Audit Logs
      const rawLogs = await AuditLog.find()
        .populate('actor', 'fullName email role')
        .sort({ timestamp: -1, createdAt: -1 })
        .limit(10)
        .lean();

      recentActivity = rawLogs.map((l) => ({
        id: l._id,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        actorName: l.actor?.fullName || l.actorEmail || 'System',
        timestamp: l.timestamp || l.createdAt,
        metadata: l.metadata
      }));
    } else {
      // In-Memory Dev Store Calculations
      const userList = Array.from(devUserMemoryMap.values());
      usersTotal = userList.length || 1;
      usersActive = userList.filter((u) => u.accountStatus === 'active').length || 1;
      usersSuspended = userList.filter((u) => u.accountStatus === 'suspended').length;
      usersNewStudents = userList.filter((u) => u.role === 'student').length;

      itemsTotal = inMemoryStore.length;
      itemsLost = inMemoryStore.filter((i) => i.type === 'lost').length;
      itemsFound = inMemoryStore.filter((i) => i.type === 'found').length;
      itemsActive = inMemoryStore.filter((i) => ['ACTIVE', 'active', 'FOUND', 'found'].includes(i.status)).length;
      itemsResolved = inMemoryStore.filter((i) => ['RESOLVED', 'resolved'].includes(i.status)).length;
      itemsReturned = inMemoryStore.filter((i) => ['RETURNED', 'returned'].includes(i.status)).length;

      claimsTotal = inMemoryClaimStore.length;
      claimsPending = inMemoryClaimStore.filter((c) => ['pending', 'PENDING'].includes(c.status)).length;
      claimsUnderReview = inMemoryClaimStore.filter((c) => ['underreview', 'underReview', 'UNDER_REVIEW'].includes(c.status)).length;
      claimsApproved = inMemoryClaimStore.filter((c) => ['approved', 'APPROVED'].includes(c.status)).length;
      claimsRejected = inMemoryClaimStore.filter((c) => ['rejected', 'REJECTED'].includes(c.status)).length;
      claimsCompleted = inMemoryClaimStore.filter((c) => ['completed', 'COMPLETED'].includes(c.status)).length;

      matchesTotal = inMemoryMatchStore.length;
      matchesHighConfidence = inMemoryMatchStore.filter((m) => m.matchScore >= 80).length;
      matchesPossible = inMemoryMatchStore.filter((m) => m.matchScore >= 60 && m.matchScore < 80).length;
      matchesResolved = inMemoryMatchStore.filter((m) => m.status === 'resolved').length;

      returnsTotal = inMemoryReturnStore.length;
      returnsPending = inMemoryReturnStore.filter((r) => ['READY_FOR_RETURN', 'ready_for_return', 'RETURN_REQUESTED'].includes(r.status)).length;
      returnsScheduled = inMemoryReturnStore.filter((r) => ['SCHEDULED', 'scheduled', 'OWNER_ARRIVED', 'IDENTITY_VERIFICATION'].includes(r.status)).length;
      returnsCompleted = inMemoryReturnStore.filter((r) => ['RETURNED', 'returned'].includes(r.status)).length;
      returnsDisputed = inMemoryReturnStore.filter((r) => ['DISPUTED', 'disputed'].includes(r.status)).length;

      inMemoryStore.forEach((i) => {
        if (i.category) {
          categoryBreakdown[i.category] = (categoryBreakdown[i.category] || 0) + 1;
        }
      });

      recentActivity = inMemoryAuditLogs.slice(0, 10).map((l) => ({
        id: l._id,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        actorName: l.actorEmail || 'System',
        timestamp: l.timestamp || l.createdAt,
        metadata: l.metadata
      }));
    }

    const userStats = {
      total: usersTotal,
      active: usersActive,
      suspended: usersSuspended,
      newStudents: usersNewStudents
    };
    const itemStats = {
      total: itemsTotal,
      lost: itemsLost,
      found: itemsFound,
      active: itemsActive,
      resolved: itemsResolved,
      returned: itemsReturned
    };
    const claimStats = {
      total: claimsTotal,
      pending: claimsPending,
      underReview: claimsUnderReview,
      approved: claimsApproved,
      rejected: claimsRejected,
      completed: claimsCompleted
    };
    const matchStats = {
      total: matchesTotal,
      highConfidence: matchesHighConfidence,
      possible: matchesPossible,
      resolved: matchesResolved
    };
    const returnStats = {
      total: returnsTotal,
      pending: returnsPending,
      scheduled: returnsScheduled,
      completed: returnsCompleted,
      disputed: returnsDisputed
    };

    return res.status(200).json({
      success: true,
      message: 'Dashboard metrics retrieved successfully',
      data: {
        stats: {
          users: userStats,
          items: itemStats,
          claims: claimStats,
          matches: matchStats,
          returns: returnStats
        },
        users: userStats,
        items: itemStats,
        claims: claimStats,
        matches: matchStats,
        returns: returnStats,
        claims: {
          total: claimsTotal,
          pending: claimsPending,
          underReview: claimsUnderReview,
          approved: claimsApproved,
          rejected: claimsRejected,
          completed: claimsCompleted
        },
        matches: {
          total: matchesTotal,
          highConfidence: matchesHighConfidence,
          possible: matchesPossible,
          resolved: matchesResolved
        },
        returns: {
          total: returnsTotal,
          pending: returnsPending,
          scheduled: returnsScheduled,
          completed: returnsCompleted,
          disputed: returnsDisputed
        },
        charts: {
          categoryBreakdown,
          claimStatusBreakdown: {
            pending: claimsPending,
            underReview: claimsUnderReview,
            approved: claimsApproved,
            rejected: claimsRejected,
            completed: claimsCompleted
          }
        },
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc List and search users with role and status filtering
 * @route GET /api/admin/users
 * @access Private (Admin / Superadmin / Staff)
 */
export const getUsers = async (req, res, next) => {
  try {
    const { role, accountStatus, status, department, course, year, search, sort = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const isDbReady = mongoose.connection.readyState === 1;

    if (isDbReady) {
      const query = {};
      if (role) query.role = role;
      const targetStatus = accountStatus || status;
      if (targetStatus) query.accountStatus = targetStatus;
      if (department) query.department = { $regex: department, $options: 'i' };
      if (course) query.course = { $regex: course, $options: 'i' };
      if (year) query.year = parseInt(year, 10);

      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { registerNumber: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } }
        ];
      }

      const sortObj = { [sort]: sortOrder };

      const [users, totalCount] = await Promise.all([
        User.find(query)
          .select('-passwordHash -resetPasswordToken -resetPasswordExpires')
          .sort(sortObj)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        User.countDocuments(query)
      ]);

      return res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: users.map(sanitizeAdminUser),
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limitNum) || 1
          }
        }
      });
    }

    // In-memory dev fallback
    let list = Array.from(devUserMemoryMap.values());
    if (role) list = list.filter((u) => u.role === role);
    const targetStatus = accountStatus || status;
    if (targetStatus) list = list.filter((u) => (u.accountStatus || 'active').toLowerCase() === targetStatus.toLowerCase());
    if (department) list = list.filter((u) => (u.department || '').toLowerCase().includes(department.toLowerCase()));
    if (year) list = list.filter((u) => u.year === parseInt(year, 10));

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          (u.fullName || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.registerNumber || '').toLowerCase().includes(q)
      );
    }

    const totalCount = list.length;
    const paginated = list.slice(skip, skip + limitNum).map(sanitizeAdminUser);

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: paginated,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limitNum) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get comprehensive user details and cross-platform activity summary
 * @route GET /api/admin/users/:id
 * @access Private (Admin / Superadmin / Staff)
 */
export const getUserById = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const isDbReady = mongoose.connection.readyState === 1;

    let userDoc = null;
    let lostReports = [];
    let foundReports = [];
    let claims = [];
    let returns = [];

    if (isDbReady) {
      userDoc = await User.findById(targetId).select('-passwordHash -resetPasswordToken -resetPasswordExpires').lean();
      if (!userDoc) {
        return res.status(404).json({
          success: false,
          message: 'User record not found',
          errors: [{ message: 'No user matches the provided ID' }]
        });
      }

      [lostReports, foundReports, claims, returns] = await Promise.all([
        Item.find({ reporter: targetId, type: 'lost' }).select('itemName title category location date status createdAt').lean(),
        Item.find({ reporter: targetId, type: 'found' }).select('itemName title category location date status createdAt storageLocation').lean(),
        Claim.find({ claimant: targetId }).populate('item', 'title category status').lean(),
        Return.find({ $or: [{ owner: targetId }, { finder: targetId }] }).populate('item', 'title category status').lean()
      ]);
    } else {
      userDoc = devUserMemoryMap.get(targetId) || Array.from(devUserMemoryMap.values()).find((u) => (u._id?.toString() || u.id?.toString()) === targetId);
      if (!userDoc) {
        return res.status(404).json({
          success: false,
          message: 'User record not found',
          errors: [{ message: 'No user matches the provided ID' }]
        });
      }

      lostReports = inMemoryStore.filter((i) => i.type === 'lost' && (i.reporter?._id || i.reporter)?.toString() === targetId);
      foundReports = inMemoryStore.filter((i) => i.type === 'found' && (i.reporter?._id || i.reporter)?.toString() === targetId);
      claims = inMemoryClaimStore.filter((c) => (c.claimant?._id || c.claimant)?.toString() === targetId);
      returns = inMemoryReturnStore.filter((r) => (r.owner?._id || r.owner)?.toString() === targetId || (r.finder?._id || r.finder)?.toString() === targetId);
    }

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: sanitizeAdminUser(userDoc),
        activitySummary: {
          lostReportsCount: lostReports.length,
          foundReportsCount: foundReports.length,
          claimsCount: claims.length,
          returnsCount: returns.length
        },
        lostReports,
        foundReports,
        claims: claims.map((c) => formatClaimResponse(c, req.user._id)),
        returns: returns.map((r) => formatReturnResponse(r, req.user._id, req.user.role))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Suspend a student/user account
 * @route PATCH /api/admin/users/:id/suspend
 * @access Private (Admin / Superadmin)
 */
export const suspendUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const { reason } = req.body;

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A clear reason of at least 5 characters must be provided for account suspension',
        errors: [{ field: 'reason', message: 'Suspension reason is required' }]
      });
    }

    // Guard: Admin cannot suspend themselves
    if (req.user._id.toString() === targetId) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot suspend their own active account',
        errors: [{ message: 'Self-suspension is blocked' }]
      });
    }

    const isDbReady = mongoose.connection.readyState === 1;
    let user = null;

    if (isDbReady) {
      user = await User.findById(targetId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          errors: [{ message: 'No user matches the provided ID' }]
        });
      }

      // Ordinary admin cannot suspend a superadmin
      if (user.role === ROLES.SUPERADMIN && req.user.role !== ROLES.SUPERADMIN) {
        return res.status(403).json({
          success: false,
          message: 'Only superadministrators can modify superadministrator accounts',
          errors: [{ message: 'Forbidden' }]
        });
      }

      user.accountStatus = ACCOUNT_STATUSES.SUSPENDED;
      await user.save();

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: 'user_suspended',
        entityType: 'User',
        entityId: user._id,
        metadata: { reason: reason.trim(), targetEmail: user.email },
        ipAddress: req.ip
      });
    } else {
      user = devUserMemoryMap.get(targetId) || Array.from(devUserMemoryMap.values()).find((u) => (u._id?.toString() || u.id?.toString()) === targetId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          errors: [{ message: 'No user matches the provided ID' }]
        });
      }

      user.accountStatus = ACCOUNT_STATUSES.SUSPENDED;

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: 'user_suspended',
        entityType: 'User',
        entityId: user._id || user.id,
        metadata: { reason: reason.trim() },
        ipAddress: req.ip
      });
    }

    const sanitized = sanitizeAdminUser(user);
    return res.status(200).json({
      success: true,
      message: `User account '${user.fullName}' has been suspended`,
      data: {
        ...sanitized,
        user: sanitized
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Reactivate a suspended user account
 * @route PATCH /api/admin/users/:id/reactivate
 * @access Private (Admin / Superadmin)
 */
export const reactivateUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const isDbReady = mongoose.connection.readyState === 1;
    let user = null;

    if (isDbReady) {
      user = await User.findById(targetId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          errors: [{ message: 'No user matches the provided ID' }]
        });
      }

      user.accountStatus = ACCOUNT_STATUSES.ACTIVE;
      await user.save();

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: 'user_reactivated',
        entityType: 'User',
        entityId: user._id,
        ipAddress: req.ip
      });
    } else {
      user = devUserMemoryMap.get(targetId) || Array.from(devUserMemoryMap.values()).find((u) => (u._id?.toString() || u.id?.toString()) === targetId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          errors: [{ message: 'No user matches the provided ID' }]
        });
      }

      user.accountStatus = ACCOUNT_STATUSES.ACTIVE;

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: 'user_reactivated',
        entityType: 'User',
        entityId: user._id || user.id,
        ipAddress: req.ip
      });
    }

    const sanitized = sanitizeAdminUser(user);
    return res.status(200).json({
      success: true,
      message: `User account '${user.fullName}' has been reactivated`,
      data: {
        ...sanitized,
        user: sanitized
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc List lost item reports for administration
 * @route GET /api/admin/lost-items
 * @access Private (Admin / Superadmin / Staff)
 */
export const getAdminLostItems = async (req, res, next) => {
  req.query.type = 'lost';
  return getAdminItems(req, res, next);
};

/**
 * @desc List found item reports for administration
 * @route GET /api/admin/found-items
 * @access Private (Admin / Superadmin / Staff)
 */
export const getAdminFoundItems = async (req, res, next) => {
  req.query.type = 'found';
  return getAdminItems(req, res, next);
};

/**
 * @desc List all item reports across campus
 * @route GET /api/admin/items
 * @access Private (Admin / Superadmin / Staff)
 */
export const getAdminItems = async (req, res, next) => {
  try {
    const { type, status, category, search, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const isDbReady = mongoose.connection.readyState === 1;

    if (isDbReady) {
      const query = {};
      if (type) query.type = type;
      if (status) query.status = status;
      if (category) query.category = category;

      if (search) {
        query.$or = [
          { itemName: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ];
      }

      const [items, totalCount] = await Promise.all([
        Item.find(query)
          .populate('reporter', 'fullName email department registerNumber')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Item.countDocuments(query)
      ]);

      return res.status(200).json({
        success: true,
        message: 'Admin items catalog retrieved',
        data: {
          items,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limitNum) || 1
          }
        }
      });
    }

    // In-memory fallback
    let list = [...inMemoryStore];
    if (type) list = list.filter((i) => i.type === type);
    if (status) list = list.filter((i) => i.status === status);
    if (category) list = list.filter((i) => i.category === category);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          (i.itemName || i.title || '').toLowerCase().includes(q) ||
          (i.description || '').toLowerCase().includes(q) ||
          (i.location || '').toLowerCase().includes(q)
      );
    }

    const totalCount = list.length;
    const paginated = list.slice(skip, skip + limitNum);

    return res.status(200).json({
      success: true,
      message: 'Admin items catalog retrieved',
      data: {
        items: paginated,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limitNum) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Perform moderation actions on an item (hide, restore, close, archive)
 * @route PATCH /api/admin/items/:id/moderate
 * @access Private (Admin / Superadmin)
 */
export const moderateItem = async (req, res, next) => {
  try {
    const itemId = req.params.id;
    const { action, reason = '' } = req.body;

    if (!['hide', 'restore', 'close', 'archive'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid moderation action. Must be 'hide', 'restore', 'close', or 'archive'",
        errors: [{ field: 'action', message: 'Invalid action' }]
      });
    }

    const isDbReady = mongoose.connection.readyState === 1;
    let item = null;

    if (isDbReady) {
      item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found',
          errors: [{ message: 'No item matches provided ID' }]
        });
      }

      if (action === 'hide') {
        item.visibility = 'private';
        item.status = 'FLAGGED';
      } else if (action === 'restore') {
        item.visibility = 'public';
        item.status = 'ACTIVE';
      } else if (action === 'close' || action === 'archive') {
        item.status = ITEM_STATUSES.STATUS_CLOSED || 'CLOSED';
      }

      item.updatedAt = new Date();
      await item.save();

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: `item_moderated_${action}`,
        entityType: 'Item',
        entityId: item._id,
        metadata: { action, reason },
        ipAddress: req.ip
      });
    } else {
      item = inMemoryStore.find((i) => (i._id?.toString() || i.id?.toString()) === itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found',
          errors: [{ message: 'No item matches provided ID' }]
        });
      }

      if (action === 'hide') {
        item.visibility = 'private';
        item.status = 'FLAGGED';
      } else if (action === 'restore') {
        item.visibility = 'public';
        item.status = 'ACTIVE';
      } else if (action === 'close' || action === 'archive') {
        item.status = 'CLOSED';
      }

      item.updatedAt = new Date();

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: `item_moderated_${action}`,
        entityType: 'Item',
        entityId: item._id || item.id,
        metadata: { action, reason },
        ipAddress: req.ip
      });
    }

    const itemObj = item.toObject ? item.toObject() : item;
    return res.status(200).json({
      success: true,
      message: `Item has been moderated (Action: ${action})`,
      data: {
        ...itemObj,
        item: itemObj
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc List all claims across the platform
 * @route GET /api/admin/claims
 * @access Private (Admin / Superadmin / Staff)
 */
export const getAdminClaims = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (status) query.status = status;

      const [claims, totalCount] = await Promise.all([
        Claim.find(query)
          .populate('item', 'itemName title category location date status storageLocation')
          .populate('claimant', 'fullName email phoneNumber registerNumber department')
          .populate('reviewedBy', 'fullName email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Claim.countDocuments(query)
      ]);

      return res.status(200).json({
        success: true,
        message: 'Admin claims retrieved',
        data: {
          claims: claims.map((c) => formatClaimResponse(c, req.user._id)),
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limitNum) || 1
          }
        }
      });
    }

    // In-memory fallback
    let filtered = [...inMemoryClaimStore];
    if (status) {
      filtered = filtered.filter((c) => c.status?.toLowerCase() === status.toLowerCase());
    }

    const totalCount = filtered.length;
    const paginated = filtered.slice(skip, skip + limitNum).map((c) => formatClaimResponse(c, req.user._id));

    return res.status(200).json({
      success: true,
      message: 'Admin claims retrieved',
      data: {
        claims: paginated,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limitNum) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get detailed claim for administrative review with competing claims context
 * @route GET /api/admin/claims/:id
 * @access Private (Admin / Superadmin / Staff)
 */
export const getAdminClaimById = async (req, res, next) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;
    const claimId = req.params.id;
    let claim = null;

    if (isDbReady) {
      claim = await Claim.findById(claimId)
        .populate('item')
        .populate('claimant', 'fullName email phoneNumber registerNumber department course year')
        .populate('reviewedBy', 'fullName email')
        .populate('match')
        .lean();
    } else {
      claim = inMemoryClaimStore.find((c) => (c._id?.toString() || c.id?.toString()) === claimId);
    }

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
        errors: [{ message: 'No claim record matching provided ID' }]
      });
    }

    // Look up competing claims on this same found item
    const targetItemId = (claim.item?._id || claim.item?.id || claim.item)?.toString();
    let competingClaims = [];

    if (isDbReady) {
      competingClaims = await Claim.find({
        item: targetItemId,
        _id: { $ne: claim._id }
      })
        .populate('claimant', 'fullName email registerNumber')
        .lean();
    } else {
      competingClaims = inMemoryClaimStore.filter((c) => {
        const cItemId = (c.item?._id || c.item?.id || c.item)?.toString();
        return cItemId === targetItemId && (c._id?.toString() || c.id?.toString()) !== claimId;
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Claim review details retrieved',
      data: {
        claim: formatClaimResponse(claim, req.user._id),
        competingClaimsCount: competingClaims.length,
        competingClaims: competingClaims.map((c) => formatClaimResponse(c, req.user._id))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Approve ownership claim and prepare return verification code
 * @route POST /api/admin/claims/:id/approve
 * @access Private (Admin / Superadmin / Staff)
 */
export const approveClaim = async (req, res, next) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;
    const claimId = req.params.id;
    const { verificationNotes } = req.body;
    let claim = null;

    if (isDbReady) {
      claim = await Claim.findById(claimId).populate('item claimant');
    } else {
      claim = inMemoryClaimStore.find((c) => (c._id?.toString() || c.id?.toString()) === claimId);
    }

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
        errors: [{ message: 'No claim record matching provided ID' }]
      });
    }

    const returnCode = `CL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    claim.status = CLAIM_STATUSES.APPROVED || 'approved';
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    claim.returnVerificationCode = returnCode;
    claim.returnStatus = 'READY_FOR_PICKUP';
    if (verificationNotes) claim.verificationNotes = verificationNotes;
    claim.updatedAt = new Date();

    const targetItemId = (claim.item?._id || claim.item?.id || claim.item)?.toString();

    if (isDbReady) {
      await claim.save();

      if (claim.item) {
        await Item.findByIdAndUpdate(targetItemId, {
          status: ITEM_STATUSES.STATUS_CLAIMED || 'CLAIMED'
        });
      }

      // Auto-reject competing active claims
      const competingClaims = await Claim.find({
        item: targetItemId,
        _id: { $ne: claim._id },
        status: { $in: [CLAIM_STATUSES.PENDING, CLAIM_STATUSES.UNDER_REVIEW, 'pending', 'underReview'] }
      });

      for (const comp of competingClaims) {
        comp.status = CLAIM_STATUSES.REJECTED || 'rejected';
        comp.rejectionReason = 'Another claimant provided conclusive ownership verification for this item.';
        comp.reviewedBy = req.user._id;
        comp.reviewedAt = new Date();
        await comp.save();

        await NotificationService.createNotification({
          recipient: comp.claimant,
          type: NOTIFICATION_TYPES.CLAIM_REJECTED,
          title: 'Claim Verification Update',
          message: `Your claim on "${claim.item?.title || 'item'}" was closed because conclusive ownership was established by another claimant.`,
          relatedClaim: comp._id,
          relatedItem: targetItemId
        });
      }

      // Initialize Return handover workflow
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const verificationCodeHash = crypto.createHash('sha256').update(returnCode.toUpperCase()).digest('hex');
      const finderUser = claim.item?.reporter?._id || claim.item?.reporter || null;

      await Return.findOneAndUpdate(
        { claim: claim._id },
        {
          item: targetItemId,
          claim: claim._id,
          owner: claim.claimant?._id || claim.claimant,
          finder: finderUser,
          approvedBy: req.user._id,
          returnMethod: 'Campus Office Pickup',
          meetingLocation: 'Administration & Security Desk',
          status: 'READY_FOR_RETURN',
          verificationCodeHash,
          verificationCodeExpiresAt: expiresAt
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Audit Log
      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: AUDIT_ACTIONS.CLAIM_APPROVAL,
        entityType: 'Claim',
        entityId: claim._id,
        metadata: { returnCode, verificationNotes },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      await NotificationService.createNotification({
        recipient: claim.claimant?._id || claim.claimant,
        type: NOTIFICATION_TYPES.CLAIM_APPROVED,
        title: 'Ownership Claim Approved!',
        message: `Your claim on "${claim.item?.title || 'item'}" has been verified! Open your return details to view collection instructions.`,
        relatedClaim: claim._id,
        relatedItem: targetItemId,
        actionUrl: `/my-returns`,
        deduplicationKey: `claim_approved:${claim._id}`
      });
    } else {
      const foundItem = inMemoryStore.find((i) => (i._id?.toString() || i.id?.toString()) === targetItemId);
      if (foundItem) foundItem.status = 'CLAIMED';

      inMemoryClaimStore.forEach((c) => {
        const cItemId = (c.item?._id || c.item?.id || c.item)?.toString();
        if (cItemId === targetItemId && (c._id?.toString() || c.id?.toString()) !== claimId) {
          if (['pending', 'underreview'].includes(c.status?.toLowerCase())) {
            c.status = 'rejected';
            c.rejectionReason = 'Another claimant provided conclusive ownership verification for this item.';
            c.reviewedBy = req.user._id;
            c.reviewedAt = new Date();
          }
        }
      });

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const verificationCodeHash = crypto.createHash('sha256').update(returnCode.toUpperCase()).digest('hex');
      const finderUser = foundItem?.reporter?._id || foundItem?.reporter || null;

      const existingRetIdx = inMemoryReturnStore.findIndex(
        (r) => (r.claim?._id || r.claim)?.toString() === claimId
      );

      const memReturn = {
        _id: existingRetIdx !== -1 ? inMemoryReturnStore[existingRetIdx]._id : new mongoose.Types.ObjectId(),
        item: foundItem || claim.item,
        claim: claim,
        owner: claim.claimant,
        finder: finderUser,
        approvedBy: req.user,
        returnMethod: 'Campus Office Pickup',
        meetingLocation: 'Administration & Security Desk',
        status: 'READY_FOR_RETURN',
        verificationCode: returnCode,
        verificationCodeHash,
        verificationCodeExpiresAt: expiresAt,
        verificationAttempts: 0,
        verificationMaxAttempts: 5,
        ownerVerified: false,
        finderVerified: false,
        handoverConfirmed: false,
        ownerConfirmation: { confirmed: false, confirmedAt: null, remarks: '' },
        finderConfirmation: { confirmed: false, confirmedAt: null, remarks: '' },
        staffConfirmation: { confirmedBy: null, confirmedAt: null, remarks: '' },
        notes: '',
        dispute: { isDisputed: false },
        receipt: { receiptNumber: '', issuedAt: null, summary: '' },
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (existingRetIdx !== -1) inMemoryReturnStore[existingRetIdx] = memReturn;
      else inMemoryReturnStore.unshift(memReturn);

      await NotificationService.createNotification({
        recipient: claim.claimant?._id || claim.claimant,
        type: NOTIFICATION_TYPES.CLAIM_APPROVED,
        title: 'Ownership Claim Approved!',
        message: `Your claim on "${claim.item?.title || 'item'}" has been verified! Open your return details to view collection instructions.`,
        relatedClaim: claim._id,
        relatedItem: targetItemId,
        actionUrl: `/my-returns`,
        deduplicationKey: `claim_approved:${claim._id}`
      });
    }

    const formattedClaim = formatClaimResponse(claim, req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Claim approved successfully and return code issued',
      data: {
        ...formattedClaim,
        claim: formattedClaim
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Reject ownership claim with required explanation
 * @route POST /api/admin/claims/:id/reject
 * @access Private (Admin / Superadmin / Staff)
 */
export const rejectClaim = async (req, res, next) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;
    const claimId = req.params.id;
    const reason = (req.body.rejectionReason || req.body.reason || '').trim();

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'A clear rejection reason must be provided',
        errors: [{ field: 'rejectionReason', message: 'Rejection reason is required' }]
      });
    }

    let claim = null;

    if (isDbReady) {
      claim = await Claim.findById(claimId).populate('item');
    } else {
      claim = inMemoryClaimStore.find((c) => (c._id?.toString() || c.id?.toString()) === claimId);
    }

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
        errors: [{ message: 'No claim record matching provided ID' }]
      });
    }

    claim.status = CLAIM_STATUSES.REJECTED || 'rejected';
    claim.rejectionReason = reason;
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    claim.updatedAt = new Date();

    const targetItemId = (claim.item?._id || claim.item?.id || claim.item)?.toString();

    if (isDbReady) {
      await claim.save();

      const remainingActive = await Claim.countDocuments({
        item: targetItemId,
        _id: { $ne: claim._id },
        status: { $in: [CLAIM_STATUSES.PENDING, CLAIM_STATUSES.UNDER_REVIEW, 'pending', 'underReview'] }
      });

      if (remainingActive === 0) {
        await Item.findByIdAndUpdate(targetItemId, {
          status: ITEM_STATUSES.STATUS_FOUND || 'FOUND'
        });
      }

      await NotificationService.createNotification({
        recipient: claim.claimant?._id || claim.claimant,
        type: NOTIFICATION_TYPES.CLAIM_REJECTED,
        title: 'Claim Verification Unsuccessful',
        message: `Your ownership claim on "${claim.item?.title || 'item'}" was not verified: ${reason}`,
        relatedClaim: claim._id,
        relatedItem: targetItemId
      });

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: AUDIT_ACTIONS.CLAIM_REJECTION,
        entityType: 'Claim',
        entityId: claim._id,
        metadata: { rejectionReason: reason },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } else {
      const otherActive = inMemoryClaimStore.some((c) => {
        const cItemId = (c.item?._id || c.item?.id || c.item)?.toString();
        return cItemId === targetItemId && (c._id?.toString() || c.id?.toString()) !== claimId && ['pending', 'underreview'].includes(c.status?.toLowerCase());
      });

      if (!otherActive) {
        const foundItem = inMemoryStore.find((i) => (i._id?.toString() || i.id?.toString()) === targetItemId);
        if (foundItem) foundItem.status = 'FOUND';
      }

      await NotificationService.createNotification({
        recipient: claim.claimant?._id || claim.claimant,
        type: NOTIFICATION_TYPES.CLAIM_REJECTED,
        title: 'Claim Verification Unsuccessful',
        message: `Your ownership claim on "${claim.item?.title || 'item'}" was not verified: ${reason}`,
        relatedClaim: claim._id,
        relatedItem: targetItemId
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Claim rejected with feedback provided to claimant',
      data: formatClaimResponse(claim, req.user._id)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Request more information from claimant
 * @route POST /api/admin/claims/:id/request-information
 * @access Private (Admin / Superadmin / Staff)
 */
export const requestClaimInformation = async (req, res, next) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;
    const claimId = req.params.id;
    const notes = (req.body.notes || req.body.requestDetails || req.body.message || '').trim();

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: 'Details for requested additional information are required',
        errors: [{ field: 'notes', message: 'Notes are required' }]
      });
    }

    let claim = null;

    if (isDbReady) {
      claim = await Claim.findById(claimId).populate('item');
    } else {
      claim = inMemoryClaimStore.find((c) => (c._id?.toString() || c.id?.toString()) === claimId);
    }

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
        errors: [{ message: 'No claim record matching provided ID' }]
      });
    }

    claim.status = CLAIM_STATUSES.UNDER_REVIEW || 'underReview';
    claim.verificationNotes = notes;
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    claim.updatedAt = new Date();

    const targetItemId = (claim.item?._id || claim.item?.id || claim.item)?.toString();

    if (isDbReady) {
      await claim.save();

      await NotificationService.createNotification({
        recipient: claim.claimant?._id || claim.claimant,
        type: NOTIFICATION_TYPES.CLAIM_INFO_REQUESTED,
        title: 'Additional Claim Information Required',
        message: `The coordinator reviewing your claim on "${claim.item?.title || 'item'}" has requested more information: ${notes}`,
        relatedClaim: claim._id,
        relatedItem: targetItemId
      });
    } else {
      await NotificationService.createNotification({
        recipient: claim.claimant?._id || claim.claimant,
        type: NOTIFICATION_TYPES.CLAIM_INFO_REQUESTED,
        title: 'Additional Claim Information Required',
        message: `The coordinator reviewing your claim on "${claim.item?.title || 'item'}" has requested more information: ${notes}`,
        relatedClaim: claim._id,
        relatedItem: targetItemId
      });
    }

    const formattedClaim = formatClaimResponse(claim, req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Additional information requested from claimant',
      data: {
        ...formattedClaim,
        claim: formattedClaim
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Unified admin review of an ownership claim
 * @route PATCH /api/admin/claims/:id/review
 * @access Private (Admin / Superadmin / Staff)
 */
export const reviewClaim = async (req, res, next) => {
  const normStatus = req.body.status?.toLowerCase();
  if (normStatus === 'approved') return approveClaim(req, res, next);
  if (normStatus === 'rejected') return rejectClaim(req, res, next);
  if (normStatus === 'underreview' || normStatus === 'under_review') {
    req.body.notes = req.body.verificationNotes || req.body.notes;
    return requestClaimInformation(req, res, next);
  }

  return res.status(400).json({
    success: false,
    message: 'Invalid status for claim review.',
    errors: [{ message: 'Status must be approved, rejected, or underReview' }]
  });
};

/**
 * @desc List all generated matches
 * @route GET /api/admin/matches
 * @access Private (Admin / Superadmin / Staff)
 */
export const getAdminMatches = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (status) query.status = status;

      const [matches, totalCount] = await Promise.all([
        Match.find(query)
          .populate('lostItem', 'itemName title category location date status')
          .populate('foundItem', 'itemName title category location date status storageLocation')
          .sort({ matchScore: -1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Match.countDocuments(query)
      ]);

      return res.status(200).json({
        success: true,
        message: 'Admin matches list retrieved',
        data: {
          matches,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limitNum) || 1
          }
        }
      });
    }

    // In-memory fallback
    let list = [...inMemoryMatchStore];
    if (status) list = list.filter((m) => m.status === status);
    const totalCount = list.length;
    const paginated = list.slice(skip, skip + limitNum);

    return res.status(200).json({
      success: true,
      message: 'Admin matches list retrieved',
      data: {
        matches: paginated,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limitNum) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc List all item returns for administration
 * @route GET /api/admin/returns
 * @access Private (Admin / Superadmin / Staff)
 */
export const getAdminReturns = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (status) query.status = status;

      const [returns, totalCount] = await Promise.all([
        Return.find(query)
          .populate('item', 'itemName title category location status images')
          .populate('owner', 'fullName email registerNumber department')
          .populate('finder', 'fullName department')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Return.countDocuments(query)
      ]);

      return res.status(200).json({
        success: true,
        message: 'Admin returns retrieved successfully',
        data: {
          returns: returns.map((r) => formatReturnResponse(r, req.user._id, req.user.role)),
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limitNum) || 1
          }
        }
      });
    }

    let list = [...inMemoryReturnStore];
    if (status) list = list.filter((r) => r.status === status);
    const totalCount = list.length;
    const paginated = list.slice(skip, skip + limitNum).map((r) => formatReturnResponse(r, req.user._id, req.user.role));

    return res.status(200).json({
      success: true,
      message: 'Admin returns retrieved successfully',
      data: {
        returns: paginated,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limitNum) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc List all return disputes for administration
 * @route GET /api/admin/disputes
 * @access Private (Admin / Superadmin / Staff)
 */
export const getAdminDisputes = async (req, res, next) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;

    if (isDbReady) {
      const disputedReturns = await Return.find({
        $or: [{ status: 'DISPUTED' }, { 'dispute.isDisputed': true }]
      })
        .populate('item', 'itemName title category status')
        .populate('owner', 'fullName email registerNumber')
        .populate('dispute.reportedBy', 'fullName email')
        .sort({ updatedAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        message: 'Disputed records retrieved',
        data: disputedReturns.map((r) => formatReturnResponse(r, req.user._id, req.user.role))
      });
    }

    const disputed = inMemoryReturnStore
      .filter((r) => r.status === 'DISPUTED' || r.dispute?.isDisputed)
      .map((r) => formatReturnResponse(r, req.user._id, req.user.role));

    return res.status(200).json({
      success: true,
      message: 'Disputed records retrieved',
      data: {
        disputes: disputed,
        returns: disputed
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Resolve or close a disputed return
 * @route PATCH /api/admin/disputes/:id/resolve
 * @access Private (Admin / Superadmin)
 */
export const resolveDispute = async (req, res, next) => {
  try {
    const returnId = req.params.id;
    const { status = 'RESOLVED', resolutionNotes = '' } = req.body;

    if (!resolutionNotes || resolutionNotes.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Resolution notes of at least 5 characters must be provided',
        errors: [{ field: 'resolutionNotes', message: 'Notes required' }]
      });
    }

    const isDbReady = mongoose.connection.readyState === 1;
    let returnDoc = null;

    if (isDbReady) {
      returnDoc = await Return.findById(returnId).populate('item owner finder');
      if (!returnDoc) {
        return res.status(404).json({
          success: false,
          message: 'Return not found',
          errors: [{ message: 'No return matches provided ID' }]
        });
      }

      returnDoc.status = status === 'REJECTED' ? RETURN_STATUSES.READY_FOR_RETURN : RETURN_STATUSES.RETURNED;
      returnDoc.dispute.status = status;
      returnDoc.notes = `${returnDoc.notes ? `${returnDoc.notes} | ` : ''}Dispute ${status}: ${resolutionNotes.trim()}`;
      returnDoc.updatedAt = new Date();
      await returnDoc.save();

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: 'dispute_resolved',
        entityType: 'Return',
        entityId: returnDoc._id,
        metadata: { resolutionNotes, status },
        ipAddress: req.ip
      });
    } else {
      returnDoc = inMemoryReturnStore.find((r) => (r._id?.toString() || r.id?.toString()) === returnId);
      if (!returnDoc) {
        return res.status(404).json({
          success: false,
          message: 'Return not found',
          errors: [{ message: 'No return matches provided ID' }]
        });
      }

      returnDoc.status = status === 'REJECTED' ? 'READY_FOR_RETURN' : 'RETURNED';
      if (returnDoc.dispute) returnDoc.dispute.status = status;
      returnDoc.notes = `Dispute ${status}: ${resolutionNotes.trim()}`;
      returnDoc.updatedAt = new Date();

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: 'dispute_resolved',
        entityType: 'Return',
        entityId: returnDoc._id || returnDoc.id,
        metadata: { resolutionNotes, status },
        ipAddress: req.ip
      });
    }

    return res.status(200).json({
      success: true,
      message: `Dispute ${status.toLowerCase()} successfully`,
      data: formatReturnResponse(returnDoc, req.user._id, req.user.role)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc File a content moderation report / flag against an item or user
 * @route POST /api/reports
 * @access Private
 */
export const createModerationReport = async (req, res, next) => {
  try {
    const { targetType = 'Item', targetId, reason, description = '', targetDetails = '' } = req.body;

    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: 'Target entity ID is required to flag content',
        errors: [{ field: 'targetId', message: 'Target ID required' }]
      });
    }

    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'A clear reason for flagging is required',
        errors: [{ field: 'reason', message: 'Reason required' }]
      });
    }

    const reportData = {
      targetType,
      targetId,
      targetDetails,
      reporter: req.user._id,
      reason: reason.trim(),
      description: description.trim(),
      priority: 'MEDIUM',
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      const doc = await ModerationReport.create(reportData);
      return res.status(201).json({
        success: true,
        message: 'Content flag submitted for administrative review',
        data: doc
      });
    }

    const memDoc = {
      _id: new mongoose.Types.ObjectId(),
      ...reportData
    };
    inMemoryModerationReports.unshift(memDoc);

    return res.status(201).json({
      success: true,
      message: 'Content flag submitted for administrative review',
      data: memDoc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get flagged content reports for administrative moderation
 * @route GET /api/admin/reports
 * @access Private (Admin / Superadmin / Staff)
 */
export const getAdminModerationReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (status) query.status = status;

      const [reports, totalCount] = await Promise.all([
        ModerationReport.find(query)
          .populate('reporter', 'fullName email department')
          .populate('reviewedBy', 'fullName email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        ModerationReport.countDocuments(query)
      ]);

      return res.status(200).json({
        success: true,
        message: 'Moderation reports retrieved',
        data: {
          reports,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limitNum) || 1
          }
        }
      });
    }

    let list = [...inMemoryModerationReports];
    if (status) list = list.filter((r) => r.status === status);
    const totalCount = list.length;
    const paginated = list.slice(skip, skip + limitNum);

    return res.status(200).json({
      success: true,
      message: 'Moderation reports retrieved',
      data: {
        reports: paginated,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limitNum) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Resolve or dismiss a content moderation report
 * @route PATCH /api/admin/reports/:id/resolve
 * @access Private (Admin / Superadmin)
 */
export const resolveModerationReport = async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const { status = 'RESOLVED', resolutionNotes = '' } = req.body;

    const isDbReady = mongoose.connection.readyState === 1;
    let rep = null;

    if (isDbReady) {
      rep = await ModerationReport.findById(reportId);
      if (!rep) {
        return res.status(404).json({
          success: false,
          message: 'Report not found',
          errors: [{ message: 'No moderation report matching provided ID' }]
        });
      }

      rep.status = status;
      rep.resolutionNotes = resolutionNotes.trim();
      rep.reviewedBy = req.user._id;
      rep.resolvedAt = new Date();
      await rep.save();

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: `report_${status.toLowerCase()}`,
        entityType: 'ModerationReport',
        entityId: rep._id,
        metadata: { resolutionNotes },
        ipAddress: req.ip
      });
    } else {
      rep = inMemoryModerationReports.find((r) => (r._id?.toString() || r.id?.toString()) === reportId);
      if (!rep) {
        return res.status(404).json({
          success: false,
          message: 'Report not found',
          errors: [{ message: 'No moderation report matching provided ID' }]
        });
      }

      rep.status = status;
      rep.resolutionNotes = resolutionNotes.trim();
      rep.reviewedBy = req.user;
      rep.resolvedAt = new Date();

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: `report_${status.toLowerCase()}`,
        entityType: 'ModerationReport',
        entityId: rep._id || rep.id,
        metadata: { resolutionNotes },
        ipAddress: req.ip
      });
    }

    const repObj = rep.toObject ? rep.toObject() : rep;
    return res.status(200).json({
      success: true,
      message: `Moderation report marked as ${status}`,
      data: {
        ...repObj,
        report: repObj
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get campus announcements (public/student view)
 * @route GET /api/announcements, GET /api/admin/announcements
 * @access Public/Private — returns published, non-expired announcements
 */
export const getAnnouncements = async (req, res, next) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;
    const now = new Date();
    // Admin can see all statuses; public/students see only PUBLISHED
    const isAdmin = req.user && [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF].includes(req.user.role);
    const statusFilter = isAdmin
      ? { status: { $in: ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'EXPIRED', 'ARCHIVED'] } }
      : {
          status: 'PUBLISHED',
          scheduledAt: { $lte: now },
          $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }]
        };

    if (isDbReady) {
      const announcements = await Announcement.find(statusFilter)
        .populate('createdBy', 'fullName role')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      return res.status(200).json({
        success: true,
        message: 'Announcements retrieved',
        data: { announcements }
      });
    }

    const active = inMemoryAnnouncements.filter((a) => {
      if (isAdmin) return true;
      return a.status === 'PUBLISHED';
    });
    return res.status(200).json({
      success: true,
      message: 'Announcements retrieved',
      data: { announcements: active, list: active }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Preview estimated recipient count for an audience target (no data exposed)
 * @route POST /api/admin/announcements/preview-audience
 * @access Private (Admin / Superadmin)
 */
export const previewAnnouncementAudience = async (req, res, next) => {
  try {
    const { targetAudience = 'ALL' } = req.body;
    const isDbReady = mongoose.connection.readyState === 1;

    if (!isDbReady) {
      const count = devUserMemoryMap ? Object.keys(devUserMemoryMap).length : 0;
      return res.status(200).json({
        success: true,
        data: { estimatedRecipientCount: count, audience: targetAudience }
      });
    }

    let query = { accountStatus: ACCOUNT_STATUSES.ACTIVE };
    if (targetAudience === 'ALL') {
      // Everyone
    } else if (targetAudience === 'STUDENTS') {
      query.role = ROLES.STUDENT;
    } else if (targetAudience === 'STAFF') {
      query.role = ROLES.STAFF;
    } else if (targetAudience === 'ADMINS') {
      query.role = { $in: [ROLES.ADMIN, ROLES.SUPERADMIN] };
    } else if (!isNaN(parseInt(targetAudience, 10))) {
      // Year targeting
      query.year = parseInt(targetAudience, 10);
      query.role = ROLES.STUDENT;
    } else {
      // Department targeting
      query.department = { $regex: new RegExp(targetAudience.trim(), 'i') };
    }

    const count = await User.countDocuments(query);
    return res.status(200).json({
      success: true,
      data: { estimatedRecipientCount: count, audience: targetAudience }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create a campus announcement (supports DRAFT, SCHEDULED, PUBLISHED)
 * @route POST /api/admin/announcements
 * @access Private (Admin / Superadmin)
 */
export const createAnnouncement = async (req, res, next) => {
  try {
    const {
      title,
      message,
      priority = 'NORMAL',
      targetAudience = 'ALL',
      expiryDate,
      scheduledAt,
      status: requestedStatus = 'PUBLISHED'
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Announcement title is required',
        errors: [{ field: 'title', message: 'Title is required' }]
      });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Announcement message is required',
        errors: [{ field: 'message', message: 'Message is required' }]
      });
    }
    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot exceed 200 characters',
        errors: [{ field: 'title', message: 'Too long' }]
      });
    }
    if (message.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 5000 characters',
        errors: [{ field: 'message', message: 'Too long' }]
      });
    }

    const ALLOWED_STATUSES = ['DRAFT', 'SCHEDULED', 'PUBLISHED'];
    const resolvedStatus = ALLOWED_STATUSES.includes(requestedStatus) ? requestedStatus : 'PUBLISHED';

    // Validate scheduling
    let resolvedScheduledAt = scheduledAt ? new Date(scheduledAt) : new Date();
    if (isNaN(resolvedScheduledAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scheduledAt date',
        errors: [{ field: 'scheduledAt', message: 'Must be a valid date' }]
      });
    }

    if (resolvedStatus === 'SCHEDULED' && resolvedScheduledAt <= new Date()) {
      resolvedScheduledAt = new Date(); // Treat as immediate if past date
    }

    let resolvedExpiry = null;
    if (expiryDate) {
      resolvedExpiry = new Date(expiryDate);
      if (isNaN(resolvedExpiry.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expiryDate',
          errors: [{ field: 'expiryDate', message: 'Must be a valid date' }]
        });
      }
      if (resolvedExpiry <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Expiry date must be in the future',
          errors: [{ field: 'expiryDate', message: 'Must be a future date' }]
        });
      }
    }

    const isDbReady = mongoose.connection.readyState === 1;

    // Estimate recipient count for audit trail
    let estimatedCount = null;
    if (isDbReady) {
      try {
        let countQuery = { accountStatus: ACCOUNT_STATUSES.ACTIVE };
        if (targetAudience !== 'ALL') {
          if (targetAudience === 'STUDENTS') countQuery.role = ROLES.STUDENT;
          else if (targetAudience === 'STAFF') countQuery.role = ROLES.STAFF;
          else if (targetAudience === 'ADMINS') countQuery.role = { $in: [ROLES.ADMIN, ROLES.SUPERADMIN] };
          else if (!isNaN(parseInt(targetAudience, 10))) {
            countQuery.year = parseInt(targetAudience, 10);
            countQuery.role = ROLES.STUDENT;
          } else {
            countQuery.department = { $regex: new RegExp(targetAudience.trim(), 'i') };
          }
        }
        estimatedCount = await User.countDocuments(countQuery);
      } catch (_) { /* Non-fatal */ }
    }

    const payload = {
      title: title.trim(),
      message: message.trim(),
      priority,
      targetAudience,
      expiryDate: resolvedExpiry,
      scheduledAt: resolvedScheduledAt,
      startDate: resolvedScheduledAt,
      createdBy: req.user._id,
      status: resolvedStatus,
      estimatedRecipientCount: estimatedCount
    };

    let doc;
    if (isDbReady) {
      doc = await Announcement.create(payload);
    } else {
      doc = { _id: new mongoose.Types.ObjectId(), ...payload, createdAt: new Date(), updatedAt: new Date() };
      inMemoryAnnouncements.unshift(doc);
    }

    await AuditService.log({
      actor: req.user._id,
      actorEmail: req.user.email,
      action: 'announcement_created',
      entityType: 'Announcement',
      entityId: doc._id,
      metadata: { title, status: resolvedStatus, targetAudience, estimatedRecipientCount: estimatedCount },
      ipAddress: req.ip
    });

    // If PUBLISHED, dispatch in-app notifications asynchronously (fire and forget)
    if (resolvedStatus === 'PUBLISHED' && (priority === 'HIGH' || priority === 'URGENT')) {
      setImmediate(async () => {
        try {
          await dispatchAnnouncementNotifications(doc, req.user._id);
        } catch (err) {
          console.error('[AdminController] Announcement notification dispatch error:', err.message);
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: `Announcement ${resolvedStatus === 'DRAFT' ? 'saved as draft' : resolvedStatus === 'SCHEDULED' ? 'scheduled' : 'published'} successfully`,
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dispatch in-app notifications to announcement target audience (background, non-blocking)
 */
const dispatchAnnouncementNotifications = async (announcement, actorId) => {
  const isDbReady = mongoose.connection.readyState === 1;
  if (!isDbReady) return;

  try {
    let userQuery = { accountStatus: ACCOUNT_STATUSES.ACTIVE, _id: { $ne: actorId } };
    const { targetAudience } = announcement;

    if (targetAudience === 'STUDENTS') {
      userQuery.role = ROLES.STUDENT;
    } else if (targetAudience === 'STAFF') {
      userQuery.role = ROLES.STAFF;
    } else if (targetAudience === 'ADMINS') {
      userQuery.role = { $in: [ROLES.ADMIN, ROLES.SUPERADMIN] };
    } else if (!isNaN(parseInt(targetAudience, 10))) {
      userQuery.year = parseInt(targetAudience, 10);
      userQuery.role = ROLES.STUDENT;
    } else if (targetAudience !== 'ALL') {
      userQuery.department = { $regex: new RegExp(targetAudience.trim(), 'i') };
    }

    // Process in batches of 100 to avoid memory spikes
    const BATCH_SIZE = 100;
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const users = await User.find(userQuery, '_id').skip(skip).limit(BATCH_SIZE).lean();
      if (users.length === 0) break;

      await Promise.allSettled(
        users.map((u) =>
          NotificationService.createNotification({
            recipient: u._id,
            type: NOTIFICATION_TYPES.ANNOUNCEMENT,
            title: announcement.title,
            message: announcement.message.slice(0, 300) + (announcement.message.length > 300 ? '...' : ''),
            priority: announcement.priority,
            actionUrl: '/notifications',
            deduplicationKey: `announcement:${u._id}:${announcement._id}`
          })
        )
      );

      skip += BATCH_SIZE;
      hasMore = users.length === BATCH_SIZE;
    }

    console.log(`[AdminController] Announcement notifications dispatched to ~${announcement.estimatedRecipientCount || 'N'} users.`);
  } catch (err) {
    console.error('[AdminController] Announcement dispatch error:', err.message);
  }
};

/**
 * @desc Update announcement status (publish, archive, etc.)
 * @route PATCH /api/admin/announcements/:id/status
 * @access Private (Admin / Superadmin)
 */
export const updateAnnouncementStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ALLOWED = ['PUBLISHED', 'ARCHIVED', 'EXPIRED'];

    if (!ALLOWED.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${ALLOWED.join(', ')}`,
        errors: [{ field: 'status', message: 'Invalid status value' }]
      });
    }

    const isDbReady = mongoose.connection.readyState === 1;

    let doc;
    if (isDbReady) {
      doc = await Announcement.findByIdAndUpdate(
        id,
        { status, scheduledAt: status === 'PUBLISHED' ? new Date() : undefined },
        { new: true }
      );
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Announcement not found' });
      }
    } else {
      doc = inMemoryAnnouncements.find((a) => (a._id?.toString() || a.id?.toString()) === id);
      if (!doc) return res.status(404).json({ success: false, message: 'Announcement not found' });
      doc.status = status;
    }

    // Dispatch notifications when publishing HIGH/URGENT announcements
    if (status === 'PUBLISHED' && (doc.priority === 'HIGH' || doc.priority === 'URGENT')) {
      setImmediate(async () => {
        try { await dispatchAnnouncementNotifications(doc, req.user._id); } catch (_) {}
      });
    }

    await AuditService.log({
      actor: req.user._id,
      actorEmail: req.user.email,
      action: 'announcement_status_changed',
      entityType: 'Announcement',
      entityId: id,
      metadata: { newStatus: status },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: `Announcement ${status.toLowerCase()} successfully`,
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Publish an announcement immediately
 * @route POST /api/admin/announcements/:id/publish
 * @access Private (Admin / Superadmin)
 */
export const publishAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isDbReady = mongoose.connection.readyState === 1;

    let doc;
    if (isDbReady) {
      doc = await Announcement.findByIdAndUpdate(
        id,
        { status: 'PUBLISHED', scheduledAt: new Date() },
        { new: true }
      );
      if (!doc) return res.status(404).json({ success: false, message: 'Announcement not found' });
    } else {
      doc = inMemoryAnnouncements.find((a) => (a._id?.toString() || a.id?.toString()) === id);
      if (!doc) return res.status(404).json({ success: false, message: 'Announcement not found' });
      doc.status = 'PUBLISHED';
      doc.scheduledAt = new Date();
    }

    // Dispatch background notifications if HIGH or URGENT
    if (doc.priority === 'HIGH' || doc.priority === 'URGENT') {
      setImmediate(async () => {
        try { await dispatchAnnouncementNotifications(doc, req.user._id); } catch (_) {}
      });
    }

    await AuditService.log({
      actor: req.user._id,
      actorEmail: req.user.email,
      action: 'announcement_published',
      entityType: 'Announcement',
      entityId: id,
      metadata: { title: doc.title },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: 'Announcement published successfully',
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Cancel or archive an announcement
 * @route POST /api/admin/announcements/:id/cancel
 * @access Private (Admin / Superadmin)
 */
export const cancelAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isDbReady = mongoose.connection.readyState === 1;

    let doc;
    if (isDbReady) {
      doc = await Announcement.findByIdAndUpdate(
        id,
        { status: 'ARCHIVED' },
        { new: true }
      );
      if (!doc) return res.status(404).json({ success: false, message: 'Announcement not found' });
    } else {
      doc = inMemoryAnnouncements.find((a) => (a._id?.toString() || a.id?.toString()) === id);
      if (!doc) return res.status(404).json({ success: false, message: 'Announcement not found' });
      doc.status = 'ARCHIVED';
    }

    await AuditService.log({
      actor: req.user._id,
      actorEmail: req.user.email,
      action: 'announcement_cancelled',
      entityType: 'Announcement',
      entityId: id,
      metadata: { title: doc.title },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: 'Announcement cancelled successfully',
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update an existing announcement
 * @route PATCH /api/admin/announcements/:id
 * @access Private (Admin / Superadmin)
 */
export const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, message, priority, targetAudience, scheduledAt, expiryDate, status } = req.body;
    const isDbReady = mongoose.connection.readyState === 1;

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (message !== undefined) updates.message = message.trim();
    if (priority !== undefined) updates.priority = priority;
    if (targetAudience !== undefined) updates.targetAudience = targetAudience;
    if (scheduledAt !== undefined) updates.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (expiryDate !== undefined) updates.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (status !== undefined) updates.status = status;

    let doc;
    if (isDbReady) {
      doc = await Announcement.findByIdAndUpdate(id, { $set: updates }, { new: true });
      if (!doc) return res.status(404).json({ success: false, message: 'Announcement not found' });
    } else {
      doc = inMemoryAnnouncements.find((a) => (a._id?.toString() || a.id?.toString()) === id);
      if (!doc) return res.status(404).json({ success: false, message: 'Announcement not found' });
      Object.assign(doc, updates);
    }

    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete or archive an announcement
 * @route DELETE /api/admin/announcements/:id
 * @access Private (Admin / Superadmin)
 */
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (mongoose.connection.readyState === 1) {
      const doc = await Announcement.findByIdAndUpdate(targetId, { status: 'ARCHIVED' }, { new: true });
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Announcement not found' });
      }
    } else {
      const a = inMemoryAnnouncements.find((item) => (item._id?.toString() || item.id?.toString()) === targetId);
      if (a) a.status = 'ARCHIVED';
    }

    return res.status(200).json({
      success: true,
      message: 'Announcement archived successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get admin notification center — system events for admins only
 * @route GET /api/admin/notification-center
 * @access Private (Admin / Superadmin / Staff)
 */
export const getAdminNotificationCenter = async (req, res, next) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    if (!isDbReady) {
      return res.status(200).json({
        success: true,
        message: 'Admin notifications (offline mode)',
        data: { notifications: [], unreadCount: 0, pagination: { page: pageNum, limit: limitNum, totalItems: 0, totalPages: 1 } }
      });
    }

    // Fetch real system events from audit logs — aggregate recent security events
    const [recentClaims, recentDisputes, recentSecurity, pendingItems] = await Promise.all([
      Claim.find({ status: { $in: ['pending', 'PENDING'] } })
        .populate('item', 'title category')
        .populate('claimant', 'fullName email')
        .sort({ createdAt: -1 }).limit(10).lean(),
      Return.find({ status: 'DISPUTED' })
        .populate('item', 'title category')
        .sort({ updatedAt: -1 }).limit(10).lean(),
      AuditLog.find({ action: { $in: ['failed_login', 'verification_failed', 'unauthorized_access_attempt'] } })
        .sort({ timestamp: -1 }).limit(10).lean(),
      Item.find({ status: { $in: ['active', 'ACTIVE'] }, type: 'lost' })
        .sort({ createdAt: -1 }).limit(5).lean()
    ]);

    const systemEvents = [
      ...recentClaims.map((c) => ({
        _id: `claim-${c._id}`,
        type: 'claim_submitted',
        title: 'New Pending Claim',
        message: `Claim filed for "${c.item?.title || 'item'}" by ${c.claimant?.fullName || 'student'}`,
        priority: 'NORMAL',
        createdAt: c.createdAt,
        actionUrl: `/admin/claims/${c._id}`,
        isRead: false
      })),
      ...recentDisputes.map((r) => ({
        _id: `dispute-${r._id}`,
        type: 'dispute_created',
        title: 'Active Return Dispute',
        message: `Return for "${r.item?.title || 'item'}" has been disputed`,
        priority: 'HIGH',
        createdAt: r.updatedAt,
        actionUrl: `/admin/disputes`,
        isRead: false
      })),
      ...recentSecurity.map((l) => ({
        _id: `security-${l._id}`,
        type: 'security_alert',
        title: 'Security Event',
        message: `Action: ${l.action}${l.metadata?.ip ? ` from ${l.metadata.ip}` : ''}`,
        priority: 'URGENT',
        createdAt: l.timestamp || l.createdAt,
        actionUrl: `/admin/security-events`,
        isRead: false
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const paginated = systemEvents.slice(skip, skip + limitNum);

    return res.status(200).json({
      success: true,
      message: 'Admin notification center data retrieved',
      data: {
        notifications: paginated,
        summary: {
          pendingClaims: recentClaims.length,
          activeDisputes: recentDisputes.length,
          securityEvents: recentSecurity.length
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: systemEvents.length,
          totalPages: Math.ceil(systemEvents.length / limitNum) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminNotifications = getAdminNotificationCenter;

/**
 * @desc Get immutable audit logs
 * @route GET /api/admin/audit-logs
 * @access Private (Admin / Superadmin)
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, actor, page = 1, limit = 25 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const skip = (pageNum - 1) * limitNum;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (action) query.action = action;
      if (actor) query.actor = actor;

      const [logs, totalCount] = await Promise.all([
        AuditLog.find(query)
          .populate('actor', 'fullName email role')
          .sort({ timestamp: -1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        AuditLog.countDocuments(query)
      ]);

      return res.status(200).json({
        success: true,
        message: 'Audit logs retrieved',
        data: {
          logs,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limitNum) || 1
          }
        }
      });
    }

    let list = [...inMemoryAuditLogs];
    if (action) list = list.filter((l) => l.action === action);
    const totalCount = list.length;
    const paginated = list.slice(skip, skip + limitNum);

    return res.status(200).json({
      success: true,
      message: 'Audit logs retrieved',
      data: {
        logs: paginated,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limitNum) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get security-specific event logs (failed logins, suspensions, unauthorized attempts, etc.)
 * @route GET /api/admin/security-events
 * @access Private (Admin / Superadmin)
 */
export const getSecurityEvents = async (req, res, next) => {
  try {
    const securityActions = [
      'failed_login',
      'user_suspended',
      'user_reactivated',
      'verification_failed',
      'return_disputed',
      'dispute_resolved',
      'unauthorized_access_attempt'
    ];

    const isDbReady = mongoose.connection.readyState === 1;

    if (isDbReady) {
      const logs = await AuditLog.find({ action: { $in: securityActions } })
        .populate('actor', 'fullName email role')
        .sort({ timestamp: -1, createdAt: -1 })
        .limit(50)
        .lean();

      return res.status(200).json({
        success: true,
        message: 'Security event logs retrieved',
        data: logs
      });
    }

    const logs = inMemoryAuditLogs
      .filter((l) => securityActions.includes(l.action))
      .slice(0, 50);

    return res.status(200).json({
      success: true,
      message: 'Security event logs retrieved',
      data: {
        events: logs,
        logs
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Export dataset to CSV for campus record-keeping
 * @route GET /api/admin/export/:entity
 * @access Private (Admin / Superadmin)
 */
export const exportDataCsv = async (req, res, next) => {
  try {
    const { entity } = req.params;
    let rows = [];
    let headers = [];

    if (entity === 'items') {
      headers = ['ID', 'ItemName', 'Type', 'Category', 'Location', 'Status', 'CreatedAt'];
      const items = inMemoryStore.slice(0, 200);
      rows = items.map((i) => [
        i._id || i.id,
        `"${(i.itemName || i.title || '').replace(/"/g, '""')}"`,
        i.type,
        i.category,
        `"${(i.location || '').replace(/"/g, '""')}"`,
        i.status,
        new Date(i.createdAt).toISOString()
      ]);
    } else if (entity === 'claims') {
      headers = ['ClaimID', 'ItemID', 'Status', 'ClaimType', 'CreatedAt'];
      const claims = inMemoryClaimStore.slice(0, 200);
      rows = claims.map((c) => [
        c._id || c.id,
        c.item?._id || c.item,
        c.status,
        c.claimType || 'direct_claim',
        new Date(c.createdAt).toISOString()
      ]);
    } else if (entity === 'returns') {
      headers = ['ReturnID', 'ItemID', 'Status', 'ReturnMethod', 'Location', 'CreatedAt'];
      const rets = inMemoryReturnStore.slice(0, 200);
      rows = rets.map((r) => [
        r._id || r.id,
        r.item?._id || r.item?.id || r.item,
        r.status,
        r.returnMethod,
        `"${(r.meetingLocation || '').replace(/"/g, '""')}"`,
        new Date(r.createdAt).toISOString()
      ]);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid entity for CSV export. Supported entities: 'items', 'claims', 'returns'"
      });
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="campus_lf_${entity}_export_${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardStats,
  getUsers,
  getUserById,
  suspendUser,
  reactivateUser,
  getAdminLostItems,
  getAdminFoundItems,
  getAdminItems,
  moderateItem,
  getAdminClaims,
  getAdminClaimById,
  approveClaim,
  rejectClaim,
  requestClaimInformation,
  reviewClaim,
  getAdminMatches,
  getAdminReturns,
  getAdminDisputes,
  resolveDispute,
  createModerationReport,
  getAdminModerationReports,
  resolveModerationReport,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  cancelAnnouncement,
  updateAnnouncement,
  previewAnnouncementAudience,
  getAdminNotificationCenter,
  getAdminNotifications,
  getAuditLogs,
  getSecurityEvents,
  exportDataCsv
};
