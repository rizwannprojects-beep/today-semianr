import crypto from 'crypto';
import mongoose from 'mongoose';
import Return from '../models/Return.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import Match from '../models/Match.js';
import NotificationService from '../services/notificationService.js';
import AuditService from '../services/auditService.js';
import { inMemoryStore } from './itemController.js';
import { inMemoryClaimStore } from './claimController.js';
import { inMemoryMatchStore } from '../services/matchingService.js';
import {
  RETURN_STATUSES,
  RETURN_STATUS_TRANSITIONS,
  RETURN_METHODS,
  ITEM_STATUSES,
  CLAIM_STATUSES,
  MATCH_STATUSES,
  NOTIFICATION_TYPES,
  AUDIT_ACTIONS,
  ROLES
} from '../utils/constants.js';

// In-Memory Return store for offline development / test suites
export const inMemoryReturnStore = [];

/**
 * Computes SHA-256 hash of verification code
 */
export const hashVerificationCode = (code) => {
  if (!code || typeof code !== 'string') return '';
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
};

/**
 * Generates a cryptographically random, high-entropy one-time return code
 * Format: LF-XXXXXX (e.g. LF-482731)
 */
export const generateReturnVerificationCode = () => {
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `LF-${hex}`;
};

/**
 * Formats Return document according to caller's identity and privacy boundaries
 */
export const formatReturnResponse = (returnDoc, requesterId, requesterRole) => {
  if (!returnDoc) return null;
  const doc = returnDoc.toObject ? returnDoc.toObject() : { ...returnDoc };

  const reqId = requesterId?.toString();
  const ownerId = (doc.owner?._id || doc.owner?.id || doc.owner)?.toString();
  const finderId = (doc.finder?._id || doc.finder?.id || doc.finder)?.toString();

  const isOwner = Boolean(reqId && ownerId && reqId === ownerId);
  const isFinder = Boolean(reqId && finderId && reqId === finderId);
  const isStaffOrAdmin = [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF].includes(requesterRole);

  // Strip internal hash always
  delete doc.verificationCodeHash;

  // Format Owner verified identity details
  if (doc.owner && typeof doc.owner === 'object') {
    const rawOwner = doc.owner;
    if (isFinder || isStaffOrAdmin) {
      // Finder / Staff gets verified student academic identity for in-person matching
      doc.verifiedOwnerIdentity = {
        fullName: rawOwner.fullName || 'Verified Student',
        registerNumber: rawOwner.registerNumber || 'Verified on ID',
        department: rawOwner.department || 'Campus Department',
        course: rawOwner.course || '',
        year: rawOwner.year || null,
        semester: rawOwner.semester || null,
        className: rawOwner.className || '',
        profileImage: rawOwner.profileImage || ''
      };
      // Mask personal contact credentials
      doc.owner = {
        _id: rawOwner._id || rawOwner.id,
        fullName: rawOwner.fullName,
        registerNumber: rawOwner.registerNumber,
        department: rawOwner.department
      };
    } else if (isOwner) {
      doc.owner = {
        _id: rawOwner._id || rawOwner.id,
        fullName: rawOwner.fullName,
        email: rawOwner.email,
        registerNumber: rawOwner.registerNumber,
        department: rawOwner.department
      };
    } else {
      doc.owner = { _id: rawOwner._id || rawOwner.id };
    }
  }

  // Format Finder identity details (mask private contacts from owner)
  if (doc.finder && typeof doc.finder === 'object') {
    const rawFinder = doc.finder;
    if (isOwner) {
      doc.finder = {
        _id: rawFinder._id || rawFinder.id,
        fullName: rawFinder.fullName || 'Campus Finder / Custodian',
        department: rawFinder.department || 'Campus Community'
      };
    }
  }

  // Verification Code exposure: ONLY owner (or staff/admin) gets plaintext code
  if (!isOwner && !isStaffOrAdmin) {
    delete doc.verificationCode;
  }

  return {
    ...doc,
    _id: doc._id || doc.id,
    id: doc._id || doc.id,
    isOwner,
    isFinder,
    isStaffOrAdmin,
    canSchedule: isOwner || isFinder || isStaffOrAdmin,
    canVerify: isFinder || isStaffOrAdmin,
    canConfirmHandover: isFinder || isStaffOrAdmin,
    canConfirmReceived: isOwner
  };
};

/**
 * Helper to execute full return completion workflow across all entities
 */
export const completeReturnProcess = async (returnDoc, actorUser) => {
  const isDbReady = mongoose.connection.readyState === 1;
  const now = new Date();
  const receiptNum = `REC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

  returnDoc.status = RETURN_STATUSES.RETURNED;
  returnDoc.completedAt = now;
  returnDoc.receipt = {
    receiptNumber: receiptNum,
    issuedAt: now,
    summary: `Item handover completed at ${returnDoc.meetingLocation || 'Campus Office'}`
  };

  const itemId = (returnDoc.item?._id || returnDoc.item?.id || returnDoc.item)?.toString();
  const claimId = (returnDoc.claim?._id || returnDoc.claim?.id || returnDoc.claim)?.toString();
  const ownerId = (returnDoc.owner?._id || returnDoc.owner?.id || returnDoc.owner)?.toString();
  const finderId = (returnDoc.finder?._id || returnDoc.finder?.id || returnDoc.finder)?.toString();

  if (isDbReady) {
    await returnDoc.save();

    // 1. Update Item status to RETURNED
    if (itemId) {
      await Item.findByIdAndUpdate(itemId, {
        status: ITEM_STATUSES.STATUS_RETURNED || 'RETURNED'
      });
    }

    // 2. Update Claim status to COMPLETED
    if (claimId) {
      await Claim.findByIdAndUpdate(claimId, {
        status: CLAIM_STATUSES.COMPLETED || 'completed',
        returnStatus: 'RETURNED'
      });
    }

    // 3. Resolve any related Matches
    if (itemId) {
      await Match.updateMany(
        { $or: [{ foundItem: itemId }, { lostItem: itemId }] },
        { status: MATCH_STATUSES.RESOLVED || 'resolved' }
      );
    }

    // 4. Notifications
    if (ownerId) {
      await NotificationService.createNotification({
        recipient: ownerId,
        type: NOTIFICATION_TYPES.ITEM_RETURNED,
        title: 'Item Returned Successfully!',
        message: `Your lost item has been officially returned. Receipt: ${receiptNum}. Thank you for using Campus Lost & Found!`,
        relatedItem: itemId
      });
    }
    if (finderId) {
      await NotificationService.createNotification({
        recipient: finderId,
        type: NOTIFICATION_TYPES.ITEM_RETURNED,
        title: 'Found Item Returned to Owner',
        message: `The item you turned in has been successfully reunited with its verified owner. Great job!`,
        relatedItem: itemId
      });
    }

    // 5. Audit Log
    await AuditService.log({
      actor: actorUser._id,
      actorEmail: actorUser.email,
      action: AUDIT_ACTIONS.ITEM_RETURNED,
      entityType: 'Return',
      entityId: returnDoc._id,
      metadata: { receiptNumber: receiptNum, itemId, claimId, ownerId },
      ipAddress: '127.0.0.1'
    });
  } else {
    // Offline Dev Store synchronization
    returnDoc.updatedAt = now;

    // Update item in store
    const item = inMemoryStore.find((i) => (i._id?.toString() || i.id?.toString()) === itemId);
    if (item) item.status = 'RETURNED';

    // Update claim in store
    const claim = inMemoryClaimStore.find((c) => (c._id?.toString() || c.id?.toString()) === claimId);
    if (claim) {
      claim.status = 'completed';
      claim.returnStatus = 'RETURNED';
    }

    // Resolve matches in store
    inMemoryMatchStore.forEach((m) => {
      const mFound = (m.foundItem?._id || m.foundItem?.id || m.foundItem)?.toString();
      const mLost = (m.lostItem?._id || m.lostItem?.id || m.lostItem)?.toString();
      if (mFound === itemId || mLost === itemId) {
        m.status = 'resolved';
      }
    });

    if (ownerId) {
      await NotificationService.createNotification({
        recipient: ownerId,
        type: NOTIFICATION_TYPES.ITEM_RETURNED,
        title: 'Item Returned Successfully!',
        message: `Your lost item has been officially returned. Receipt: ${receiptNum}.`,
        relatedItem: itemId
      });
    }
  }

  return returnDoc;
};

/**
 * @desc Initialize or create a Return record
 * @route POST /api/returns
 * @access Private
 */
export const createReturn = async (req, res, next) => {
  try {
    const {
      claimId,
      claim: reqClaim,
      returnMethod = RETURN_METHODS.CAMPUS_OFFICE_PICKUP,
      meetingLocation = 'Administration & Security Desk',
      scheduledDate,
      scheduledTime
    } = req.body;

    const targetClaimId = (claimId || reqClaim)?.toString();
    if (!targetClaimId) {
      return res.status(400).json({
        success: false,
        message: 'Claim ID is required to initiate return workflow',
        errors: [{ field: 'claimId', message: 'Missing approved claim reference' }]
      });
    }

    const isDbReady = mongoose.connection.readyState === 1;
    let claimDoc = null;

    if (isDbReady) {
      claimDoc = await Claim.findById(targetClaimId).populate('item claimant');
    } else {
      claimDoc = inMemoryClaimStore.find((c) => (c._id?.toString() || c.id?.toString()) === targetClaimId);
    }

    if (!claimDoc) {
      return res.status(404).json({
        success: false,
        message: 'Associated claim record not found',
        errors: [{ message: 'No claim matches provided ID' }]
      });
    }

    const claimStatus = (claimDoc.status || '').toLowerCase();
    if (claimStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Return can only be initiated for an APPROVED claim',
        errors: [{ message: `Current claim status is '${claimDoc.status}'` }]
      });
    }

    const ownerId = claimDoc.claimant?._id || claimDoc.claimant;
    const itemDoc = claimDoc.item;
    const finderId = itemDoc?.reporter?._id || itemDoc?.reporter || null;

    // Generate Verification Code
    const verificationCode = generateReturnVerificationCode();
    const verificationCodeHash = hashVerificationCode(verificationCode);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    let returnDoc = null;

    if (isDbReady) {
      // Check existing return
      const existing = await Return.findOne({ claim: claimDoc._id });
      if (existing) {
        return res.status(200).json({
          success: true,
          message: 'Existing return workflow retrieved',
          data: formatReturnResponse(existing, req.user._id, req.user.role)
        });
      }

      returnDoc = await Return.create({
        item: itemDoc._id || itemDoc,
        claim: claimDoc._id,
        owner: ownerId,
        finder: finderId,
        approvedBy: req.user._id,
        returnMethod,
        meetingLocation,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledTime: scheduledTime || '',
        status: RETURN_STATUSES.READY_FOR_RETURN,
        verificationCodeHash,
        verificationCodeExpiresAt: expiresAt
      });

      // Notify Owner (Privacy safe: do not leak verification code in notification text)
      await NotificationService.createNotification({
        recipient: ownerId,
        type: NOTIFICATION_TYPES.RETURN_CODE_GENERATED,
        title: 'Return Handover Ready',
        message: `Your return is ready for collection at ${meetingLocation}. Open return details to view your verification instructions. Present your Student ID card upon collection.`,
        relatedItem: itemDoc._id,
        relatedReturn: returnDoc._id,
        actionUrl: `/my-returns`,
        deduplicationKey: `return_code:${returnDoc._id}:${ownerId}`
      });

      // Audit Log
      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: AUDIT_ACTIONS.RETURN_CREATION,
        entityType: 'Return',
        entityId: returnDoc._id,
        metadata: { meetingLocation, returnMethod },
        ipAddress: req.ip
      });
    } else {
      // In-Memory Dev Store
      const existing = inMemoryReturnStore.find((r) => (r.claim?._id || r.claim)?.toString() === targetClaimId);
      if (existing) {
        return res.status(200).json({
          success: true,
          message: 'Existing return workflow retrieved',
          data: formatReturnResponse(existing, req.user._id, req.user.role)
        });
      }

      returnDoc = {
        _id: new mongoose.Types.ObjectId(),
        item: itemDoc,
        claim: claimDoc,
        owner: claimDoc.claimant,
        finder: itemDoc?.reporter || null,
        approvedBy: req.user,
        returnMethod,
        meetingLocation,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledTime: scheduledTime || '',
        status: RETURN_STATUSES.READY_FOR_RETURN,
        verificationCode, // Kept in dev memory for owner view
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

      inMemoryReturnStore.unshift(returnDoc);

      await NotificationService.createNotification({
        recipient: ownerId?._id || ownerId,
        type: NOTIFICATION_TYPES.RETURN_CODE_GENERATED,
        title: 'Return Handover Ready',
        message: `Your return is ready for collection at ${meetingLocation}. Open return details to view your verification instructions. Present your Student ID card upon collection.`,
        relatedItem: itemDoc?._id || itemDoc,
        relatedReturn: returnDoc._id,
        actionUrl: `/my-returns`,
        deduplicationKey: `return_code:${returnDoc._id}:${ownerId?._id || ownerId}`
      });
    }

    // Attach code to response for creator if owner or admin
    const formatted = formatReturnResponse(returnDoc, req.user._id, req.user.role);
    if (formatted.isOwner || formatted.isStaffOrAdmin) {
      formatted.verificationCode = verificationCode;
    }

    return res.status(201).json({
      success: true,
      message: 'Return request initialized successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all returns relevant to authenticated user (as owner or finder or staff)
 * @route GET /api/returns, GET /api/returns/my
 * @access Private
 */
export const getMyReturns = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const isStaffOrAdmin = [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF].includes(req.user.role);
    const isDbReady = mongoose.connection.readyState === 1;

    let returns = [];

    if (isDbReady) {
      const query = isStaffOrAdmin
        ? {}
        : { $or: [{ owner: req.user._id }, { finder: req.user._id }] };

      returns = await Return.find(query)
        .populate('item', 'itemName title category images location storageLocation status')
        .populate('claim', 'reason ownershipProof status')
        .populate('owner', 'fullName email registerNumber department course year semester className profileImage')
        .populate('finder', 'fullName department')
        .sort({ createdAt: -1 })
        .lean();
    } else {
      returns = inMemoryReturnStore.filter((r) => {
        if (isStaffOrAdmin) return true;
        const oId = (r.owner?._id || r.owner?.id || r.owner)?.toString();
        const fId = (r.finder?._id || r.finder?.id || r.finder)?.toString();
        return oId === userId || fId === userId;
      });
    }

    const formatted = returns
      .map((r) => formatReturnResponse(r, req.user._id, req.user.role))
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      message: 'Returns retrieved successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single return details by ID with role-based owner identity disclosure
 * @route GET /api/returns/:id
 * @access Private
 */
export const getReturnById = async (req, res, next) => {
  try {
    const returnId = req.params.id;
    const isDbReady = mongoose.connection.readyState === 1;
    let returnDoc = null;

    if (isDbReady) {
      returnDoc = await Return.findById(returnId)
        .populate('item', 'itemName title category images location storageLocation status description')
        .populate('claim', 'reason ownershipProof status verificationNotes returnVerificationCode')
        .populate('owner', 'fullName email registerNumber department course year semester className profileImage')
        .populate('finder', 'fullName department')
        .lean();
    } else {
      returnDoc = inMemoryReturnStore.find((r) => (r._id?.toString() || r.id?.toString()) === returnId);
    }

    if (!returnDoc) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found',
        errors: [{ message: 'No return matches provided ID' }]
      });
    }

    const userId = req.user._id.toString();
    const ownerId = (returnDoc.owner?._id || returnDoc.owner?.id || returnDoc.owner)?.toString();
    const finderId = (returnDoc.finder?._id || returnDoc.finder?.id || returnDoc.finder)?.toString();
    const isStaffOrAdmin = [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF].includes(req.user.role);

    // Authorization Guard: Only participants or admin staff can access return record
    if (userId !== ownerId && userId !== finderId && !isStaffOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not an authorized participant in this return workflow',
        errors: [{ message: 'Unauthorized return inspection' }]
      });
    }

    const formatted = formatReturnResponse(returnDoc, req.user._id, req.user.role);

    return res.status(200).json({
      success: true,
      message: 'Return details retrieved successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Schedule date, time, and location for return handover
 * @route POST /api/returns/:id/schedule
 * @access Private
 */
export const scheduleReturn = async (req, res, next) => {
  try {
    const returnId = req.params.id;
    const {
      date,
      scheduledDate: altDate,
      time,
      scheduledTime: altTime,
      location,
      meetingLocation: altLocation,
      returnMethod
    } = req.body;

    const resolvedDate = date || altDate;
    const resolvedTime = time || altTime || '';
    const resolvedLocation = (location || altLocation || '').trim();

    if (!resolvedDate) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date is required',
        errors: [{ field: 'date', message: 'Date must be provided' }]
      });
    }

    const schedDateObj = new Date(resolvedDate);
    if (isNaN(schedDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule date format',
        errors: [{ field: 'date', message: 'Must be a valid date' }]
      });
    }

    // Past date check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (schedDateObj < today) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled return date cannot be in the past',
        errors: [{ field: 'date', message: 'Date must be today or in the future' }]
      });
    }

    const isDbReady = mongoose.connection.readyState === 1;
    let returnDoc = null;

    if (isDbReady) {
      returnDoc = await Return.findById(returnId).populate('item owner finder');
    } else {
      returnDoc = inMemoryReturnStore.find((r) => (r._id?.toString() || r.id?.toString()) === returnId);
    }

    if (!returnDoc) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found',
        errors: [{ message: 'No return matches provided ID' }]
      });
    }

    const userId = req.user._id.toString();
    const ownerId = (returnDoc.owner?._id || returnDoc.owner?.id || returnDoc.owner)?.toString();
    const finderId = (returnDoc.finder?._id || returnDoc.finder?.id || returnDoc.finder)?.toString();
    const isStaffOrAdmin = [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF].includes(req.user.role);

    if (userId !== ownerId && userId !== finderId && !isStaffOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only participants or staff can update return schedule',
        errors: [{ message: 'Unauthorized schedule modification' }]
      });
    }

    returnDoc.scheduledDate = schedDateObj;
    if (resolvedTime) returnDoc.scheduledTime = resolvedTime;
    if (resolvedLocation) returnDoc.meetingLocation = resolvedLocation;
    if (returnMethod) returnDoc.returnMethod = returnMethod;

    // Transition status to SCHEDULED if ready or requested
    if ([RETURN_STATUSES.READY_FOR_RETURN, RETURN_STATUSES.RETURN_REQUESTED, 'READY_FOR_RETURN', 'ready_for_return'].includes(returnDoc.status)) {
      returnDoc.status = RETURN_STATUSES.SCHEDULED;
    }

    returnDoc.updatedAt = new Date();

    if (isDbReady) {
      await returnDoc.save();

      // Notify counterparty
      const counterpartyId = userId === ownerId ? finderId : ownerId;
      if (counterpartyId) {
        await NotificationService.createNotification({
          recipient: counterpartyId,
          type: NOTIFICATION_TYPES.RETURN_SCHEDULED,
          title: 'Return Handover Scheduled',
          message: `Handover has been scheduled for ${schedDateObj.toLocaleDateString()} at ${returnDoc.meetingLocation}.`,
          relatedItem: returnDoc.item?._id || returnDoc.item
        });
      }

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: AUDIT_ACTIONS.RETURN_SCHEDULED,
        entityType: 'Return',
        entityId: returnDoc._id,
        metadata: { scheduledDate: schedDateObj, meetingLocation: returnDoc.meetingLocation },
        ipAddress: req.ip
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Return appointment scheduled successfully',
      data: formatReturnResponse(returnDoc, req.user._id, req.user.role)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Cancel return workflow with mandatory reason
 * @route PATCH /api/returns/:id/cancel
 * @access Private
 */
export const cancelReturn = async (req, res, next) => {
  try {
    const returnId = req.params.id;
    const { reason } = req.body;

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A detailed cancellation reason of at least 5 characters is required',
        errors: [{ field: 'reason', message: 'Reason must be provided' }]
      });
    }

    const isDbReady = mongoose.connection.readyState === 1;
    let returnDoc = null;

    if (isDbReady) {
      returnDoc = await Return.findById(returnId).populate('item owner finder');
    } else {
      returnDoc = inMemoryReturnStore.find((r) => (r._id?.toString() || r.id?.toString()) === returnId);
    }

    if (!returnDoc) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found',
        errors: [{ message: 'No return matches provided ID' }]
      });
    }

    if (returnDoc.status === RETURN_STATUSES.RETURNED || returnDoc.status === 'RETURNED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an item return that has already been completed',
        errors: [{ message: 'Return already finalized' }]
      });
    }

    const userId = req.user._id.toString();
    const ownerId = (returnDoc.owner?._id || returnDoc.owner?.id || returnDoc.owner)?.toString();
    const finderId = (returnDoc.finder?._id || returnDoc.finder?.id || returnDoc.finder)?.toString();
    const isStaffOrAdmin = [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF].includes(req.user.role);

    if (userId !== ownerId && userId !== finderId && !isStaffOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this return',
        errors: [{ message: 'Only participants or staff can cancel' }]
      });
    }

    returnDoc.status = RETURN_STATUSES.CANCELLED;
    returnDoc.cancellation = {
      cancelledBy: req.user._id,
      cancelledAt: new Date(),
      reason: reason.trim()
    };
    returnDoc.updatedAt = new Date();

    if (isDbReady) {
      await returnDoc.save();

      const counterpartyId = userId === ownerId ? finderId : ownerId;
      if (counterpartyId) {
        await NotificationService.createNotification({
          recipient: counterpartyId,
          type: NOTIFICATION_TYPES.RETURN_CANCELLED,
          title: 'Return Appointment Cancelled',
          message: `The return process was cancelled: "${reason.trim()}".`,
          relatedItem: returnDoc.item?._id || returnDoc.item
        });
      }

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: AUDIT_ACTIONS.RETURN_CANCELLED,
        entityType: 'Return',
        entityId: returnDoc._id,
        metadata: { reason },
        ipAddress: req.ip
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Return cancelled successfully',
      data: formatReturnResponse(returnDoc, req.user._id, req.user.role)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Advance return status to IDENTITY_VERIFICATION (Owner has arrived)
 * @route POST /api/returns/:id/start-verification
 * @access Private
 */
export const startVerification = async (req, res, next) => {
  try {
    const returnId = req.params.id;
    const isDbReady = mongoose.connection.readyState === 1;
    let returnDoc = null;

    if (isDbReady) {
      returnDoc = await Return.findById(returnId).populate('item owner finder');
    } else {
      returnDoc = inMemoryReturnStore.find((r) => (r._id?.toString() || r.id?.toString()) === returnId);
    }

    if (!returnDoc) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found',
        errors: [{ message: 'No return matches provided ID' }]
      });
    }

    const userId = req.user._id.toString();
    const finderId = (returnDoc.finder?._id || returnDoc.finder?.id || returnDoc.finder)?.toString();
    const isStaffOrAdmin = [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF].includes(req.user.role);

    // Only finder or staff can initiate verification
    if (userId !== finderId && !isStaffOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the handover custodian or staff can initiate identity verification',
        errors: [{ message: 'Forbidden' }]
      });
    }

    returnDoc.status = RETURN_STATUSES.IDENTITY_VERIFICATION;
    returnDoc.updatedAt = new Date();

    if (isDbReady) {
      await returnDoc.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Identity verification session started',
      data: formatReturnResponse(returnDoc, req.user._id, req.user.role)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Verify return code & student identity
 * @route POST /api/returns/:id/verify
 * @access Private (Finder or Staff)
 */
export const verifyReturnCode = async (req, res, next) => {
  try {
    const returnId = req.params.id;
    const { verificationCode, code } = req.body;
    const inputCode = (verificationCode || code || '').trim().toUpperCase();

    if (!inputCode) {
      return res.status(400).json({
        success: false,
        message: 'Return verification code is required',
        errors: [{ field: 'verificationCode', message: 'Verification code must be entered' }]
      });
    }

    const isDbReady = mongoose.connection.readyState === 1;
    let returnDoc = null;

    if (isDbReady) {
      // Must explicitly select verificationCodeHash since select: false in schema
      returnDoc = await Return.findById(returnId)
        .select('+verificationCodeHash')
        .populate('item owner finder');
    } else {
      returnDoc = inMemoryReturnStore.find((r) => (r._id?.toString() || r.id?.toString()) === returnId);
    }

    if (!returnDoc) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found',
        errors: [{ message: 'No return matches provided ID' }]
      });
    }

    const userId = req.user._id.toString();
    const finderId = (returnDoc.finder?._id || returnDoc.finder?.id || returnDoc.finder)?.toString();
    const isStaffOrAdmin = [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF].includes(req.user.role);

    // Only finder or staff can perform verification (owner cannot self-verify!)
    if (userId !== finderId && !isStaffOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Owner cannot verify their own return code. The finder or staff custodian must verify it.',
        errors: [{ message: 'Self-verification disallowed' }]
      });
    }

    // 0. Replay Protection: Code cannot be reused if already verified or finalized
    if (
      returnDoc.ownerVerified ||
      returnDoc.status === RETURN_STATUSES.HANDOVER_PENDING ||
      returnDoc.status === RETURN_STATUSES.RETURNED ||
      returnDoc.status === 'RETURNED' ||
      returnDoc.status === RETURN_STATUSES.CANCELLED ||
      returnDoc.status === RETURN_STATUSES.DISPUTED
    ) {
      return res.status(400).json({
        success: false,
        message: `This verification code has already been verified or the return workflow is in '${returnDoc.status}' state.`,
        errors: [{ message: 'Verification code already consumed or return is not in pending verification state' }]
      });
    }

    // 1. Check attempt lock
    if (returnDoc.verificationAttempts >= returnDoc.verificationMaxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Verification locked: Maximum failed attempts exceeded. Please contact campus security.',
        errors: [{ message: 'Verification attempts exhausted' }]
      });
    }

    // 2. Check expiration
    if (returnDoc.verificationCodeExpiresAt && new Date() > new Date(returnDoc.verificationCodeExpiresAt)) {
      returnDoc.status = RETURN_STATUSES.EXPIRED;
      if (isDbReady) await returnDoc.save();
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. A new code must be generated by staff.',
        errors: [{ message: 'Code expired' }]
      });
    }

    // 3. Compare hash
    const inputHash = hashVerificationCode(inputCode);
    const storedHash = returnDoc.verificationCodeHash;

    const isMatch = Boolean(storedHash && inputHash === storedHash);

    if (!isMatch) {
      returnDoc.verificationAttempts = (returnDoc.verificationAttempts || 0) + 1;
      returnDoc.updatedAt = new Date();

      if (isDbReady) {
        await returnDoc.save();
        await AuditService.log({
          actor: req.user._id,
          actorEmail: req.user.email,
          action: AUDIT_ACTIONS.VERIFICATION_FAILED,
          entityType: 'Return',
          entityId: returnDoc._id,
          metadata: { attempts: returnDoc.verificationAttempts },
          ipAddress: req.ip
        });
      }

      const remaining = returnDoc.verificationMaxAttempts - returnDoc.verificationAttempts;
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        errors: [{ field: 'verificationCode', message: 'Verification code mismatch' }]
      });
    }

    // Success: code verified!
    returnDoc.ownerVerified = true;
    returnDoc.finderVerified = true;
    returnDoc.status = RETURN_STATUSES.HANDOVER_PENDING;
    returnDoc.updatedAt = new Date();

    if (isDbReady) {
      await returnDoc.save();

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: AUDIT_ACTIONS.VERIFICATION_SUCCEEDED,
        entityType: 'Return',
        entityId: returnDoc._id,
        ipAddress: req.ip
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Owner identity and verification code confirmed successfully!',
      data: formatReturnResponse(returnDoc, req.user._id, req.user.role)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Handover party (finder or staff) confirms physical item handover
 * @route POST /api/returns/:id/confirm-handover
 * @access Private (Finder or Staff)
 */
export const confirmHandover = async (req, res, next) => {
  try {
    const returnId = req.params.id;
    const { remarks = '' } = req.body;
    const isDbReady = mongoose.connection.readyState === 1;
    let returnDoc = null;

    if (isDbReady) {
      returnDoc = await Return.findById(returnId).populate('item owner finder');
    } else {
      returnDoc = inMemoryReturnStore.find((r) => (r._id?.toString() || r.id?.toString()) === returnId);
    }

    if (!returnDoc) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found',
        errors: [{ message: 'No return matches provided ID' }]
      });
    }

    const userId = req.user._id.toString();
    const finderId = (returnDoc.finder?._id || returnDoc.finder?.id || returnDoc.finder)?.toString();
    const isStaffOrAdmin = [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF].includes(req.user.role);

    if (userId !== finderId && !isStaffOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the item custodian or authorized staff can confirm physical handover',
        errors: [{ message: 'Forbidden' }]
      });
    }

    if (returnDoc.status === RETURN_STATUSES.RETURNED || returnDoc.status === 'RETURNED') {
      return res.status(400).json({
        success: false,
        message: 'This item has already been finalized as returned',
        errors: [{ message: 'Duplicate handover confirmation prevented' }]
      });
    }

    const now = new Date();
    returnDoc.handoverConfirmed = true;
    returnDoc.finderConfirmation = {
      confirmed: true,
      confirmedAt: now,
      remarks: remarks?.trim() || 'Item handed over to verified owner'
    };

    if (isStaffOrAdmin) {
      returnDoc.staffConfirmation = {
        confirmedBy: req.user._id,
        confirmedAt: now,
        remarks: remarks?.trim() || 'Staff facilitated handover'
      };
    }

    returnDoc.updatedAt = now;

    // Double confirmation check: If staff Facilitated OR owner already confirmed receipt
    const isOwnerConfirmed = Boolean(returnDoc.ownerConfirmation?.confirmed);
    if (isStaffOrAdmin || isOwnerConfirmed) {
      await completeReturnProcess(returnDoc, req.user);
    } else {
      returnDoc.status = RETURN_STATUSES.HANDOVER_PENDING;
      if (isDbReady) await returnDoc.save();

      // Notify owner to confirm receipt
      const ownerId = returnDoc.owner?._id || returnDoc.owner;
      if (ownerId) {
        await NotificationService.createNotification({
          recipient: ownerId,
          type: NOTIFICATION_TYPES.HANDOVER_CONFIRMED,
          title: 'Item Handover Initiated',
          message: `The custodian has confirmed handing over your item. Please confirm receipt to complete the process.`,
          relatedItem: returnDoc.item?._id || returnDoc.item
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Physical handover confirmed successfully',
      data: formatReturnResponse(returnDoc, req.user._id, req.user.role)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Verified owner confirms physical receipt of item
 * @route POST /api/returns/:id/confirm-received
 * @access Private (Owner)
 */
export const confirmReceived = async (req, res, next) => {
  try {
    const returnId = req.params.id;
    const { remarks = '' } = req.body;
    const isDbReady = mongoose.connection.readyState === 1;
    let returnDoc = null;

    if (isDbReady) {
      returnDoc = await Return.findById(returnId).populate('item owner finder');
    } else {
      returnDoc = inMemoryReturnStore.find((r) => (r._id?.toString() || r.id?.toString()) === returnId);
    }

    if (!returnDoc) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found',
        errors: [{ message: 'No return matches provided ID' }]
      });
    }

    const userId = req.user._id.toString();
    const ownerId = (returnDoc.owner?._id || returnDoc.owner?.id || returnDoc.owner)?.toString();

    // Only owner can confirm receipt
    if (userId !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Only the verified owner can confirm receipt of this item',
        errors: [{ message: 'Forbidden' }]
      });
    }

    if (returnDoc.status === RETURN_STATUSES.RETURNED || returnDoc.status === 'RETURNED') {
      return res.status(400).json({
        success: false,
        message: 'Item receipt has already been completed',
        errors: [{ message: 'Duplicate receipt confirmation prevented' }]
      });
    }

    const now = new Date();
    returnDoc.ownerConfirmation = {
      confirmed: true,
      confirmedAt: now,
      remarks: remarks?.trim() || 'Item received in good order'
    };
    returnDoc.updatedAt = now;

    // If finder/staff already confirmed handover, finalize complete return
    const isHandoverDone = Boolean(returnDoc.handoverConfirmed || returnDoc.finderConfirmation?.confirmed);
    if (isHandoverDone) {
      await completeReturnProcess(returnDoc, req.user);
    } else {
      if (isDbReady) await returnDoc.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Item receipt confirmed successfully',
      data: formatReturnResponse(returnDoc, req.user._id, req.user.role)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc File a dispute regarding the return handover
 * @route POST /api/returns/:id/dispute
 * @access Private (Owner or Finder)
 */
export const disputeReturn = async (req, res, next) => {
  try {
    const returnId = req.params.id;
    const { reason, description, evidence = [] } = req.body;

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Dispute reason must be at least 5 characters long',
        errors: [{ field: 'reason', message: 'Reason is required' }]
      });
    }

    const isDbReady = mongoose.connection.readyState === 1;
    let returnDoc = null;

    if (isDbReady) {
      returnDoc = await Return.findById(returnId).populate('item owner finder');
    } else {
      returnDoc = inMemoryReturnStore.find((r) => (r._id?.toString() || r.id?.toString()) === returnId);
    }

    if (!returnDoc) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found',
        errors: [{ message: 'No return matches provided ID' }]
      });
    }

    const userId = req.user._id.toString();
    const ownerId = (returnDoc.owner?._id || returnDoc.owner?.id || returnDoc.owner)?.toString();
    const finderId = (returnDoc.finder?._id || returnDoc.finder?.id || returnDoc.finder)?.toString();
    const isStaffOrAdmin = [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF].includes(req.user.role);

    if (userId !== ownerId && userId !== finderId && !isStaffOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to raise a dispute on this return',
        errors: [{ message: 'Forbidden' }]
      });
    }

    const now = new Date();
    returnDoc.status = RETURN_STATUSES.DISPUTED;
    returnDoc.dispute = {
      isDisputed: true,
      reportedBy: req.user._id,
      reason: reason.trim(),
      description: description?.trim() || '',
      evidence: Array.isArray(evidence) ? evidence : [],
      reportedAt: now,
      status: 'OPEN'
    };
    returnDoc.updatedAt = now;

    if (isDbReady) {
      await returnDoc.save();

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: AUDIT_ACTIONS.RETURN_DISPUTED,
        entityType: 'Return',
        entityId: returnDoc._id,
        metadata: { reason, description },
        ipAddress: req.ip
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Dispute recorded and escalated to campus administration for investigation',
      data: formatReturnResponse(returnDoc, req.user._id, req.user.role)
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createReturn,
  getMyReturns,
  getReturnById,
  scheduleReturn,
  cancelReturn,
  startVerification,
  verifyReturnCode,
  confirmHandover,
  confirmReceived,
  disputeReturn
};
