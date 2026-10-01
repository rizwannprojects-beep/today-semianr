import mongoose from 'mongoose';
import Claim from '../models/Claim.js';
import Item from '../models/Item.js';
import NotificationService from '../services/notificationService.js';
import AuditService from '../services/auditService.js';
import { inMemoryStore } from './itemController.js';
import {
  AUDIT_ACTIONS,
  CLAIM_STATUSES,
  ITEM_STATUSES,
  NOTIFICATION_TYPES,
  ROLES
} from '../utils/constants.js';

// In-Memory Claim store for offline development / testing
export const inMemoryClaimStore = [];

/**
 * Normalizes claim response for frontend compatibility
 */
export const formatClaimResponse = (claim, requesterId) => {
  if (!claim) return null;
  const doc = claim.toObject ? claim.toObject() : { ...claim };

  // Create UI-friendly aliases
  const itemObj = doc.item || doc.foundItem;
  return {
    ...doc,
    _id: doc._id || doc.id,
    id: doc._id || doc.id,
    item: itemObj,
    foundItem: itemObj,
    ownershipProof: doc.ownershipProof || doc.proofDetails,
    proofDetails: doc.ownershipProof || doc.proofDetails,
    verificationStatus: doc.status?.toLowerCase(),
    evidence: Array.isArray(doc.evidence) ? doc.evidence : []
  };
};

/**
 * @desc File an ownership verification claim against a found item
 * @route POST /api/claims
 * @access Private
 */
export const createClaim = async (req, res, next) => {
  try {
    const itemId = req.body.item || req.body.itemId || req.body.foundItemId;
    const {
      reason,
      ownershipProof,
      proofDetails,
      additionalDetails,
      evidence = [],
      match: matchId,
      matchId: altMatchId
    } = req.body;

    const resolvedProof = (ownershipProof || proofDetails || '').trim();
    if (!resolvedProof || resolvedProof.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Ownership proof must provide specific identifying details of at least 5 characters',
        errors: [{ field: 'ownershipProof', message: 'Ownership proof is required' }]
      });
    }
    const resolvedReason = (reason || resolvedProof.slice(0, 150) || 'Ownership claim filed by student').trim();
    const resolvedMatch = matchId || altMatchId || null;
    const claimantId = req.user._id.toString();

    let item;
    const isDbReady = mongoose.connection.readyState === 1;

    if (isDbReady) {
      item = await Item.findById(itemId);
    } else {
      item = inMemoryStore.find((i) => (i._id?.toString() || i.id?.toString()) === itemId?.toString());
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
        errors: [{ message: 'The item you are claiming does not exist' }]
      });
    }

    if (item.type !== 'found') {
      return res.status(400).json({
        success: false,
        message: 'Claims can only be filed against items reported as found.',
        errors: [{ message: 'Invalid item type for claim' }]
      });
    }

    const itemReporterId = (item.reporter?._id || item.reporter?.id || item.reporter)?.toString();
    if (itemReporterId && itemReporterId === claimantId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot file an ownership claim against an item you reported yourself.',
        errors: [{ message: 'Self-claim not permitted' }]
      });
    }

    // Check if user already has an active claim on this item
    const activeStatuses = [
      CLAIM_STATUSES.PENDING,
      CLAIM_STATUSES.UNDER_REVIEW,
      'pending',
      'underReview',
      'PENDING',
      'UNDER_REVIEW'
    ];

    if (isDbReady) {
      const existingClaim = await Claim.findOne({
        item: itemId,
        claimant: req.user._id,
        status: { $in: activeStatuses }
      });

      if (existingClaim) {
        return res.status(409).json({
          success: false,
          message: 'You already have an active claim under review for this item.',
          errors: [{ message: 'Duplicate active claim' }]
        });
      }
    } else {
      const existingClaim = inMemoryClaimStore.find((c) => {
        const cItem = (c.item?._id || c.item?.id || c.item)?.toString();
        const cClaimant = (c.claimant?._id || c.claimant?.id || c.claimant)?.toString();
        return cItem === itemId?.toString() && cClaimant === claimantId && activeStatuses.includes(c.status);
      });

      if (existingClaim) {
        return res.status(409).json({
          success: false,
          message: 'You already have an active claim under review for this item.',
          errors: [{ message: 'Duplicate active claim' }]
        });
      }
    }

    const claimData = {
      _id: new mongoose.Types.ObjectId(),
      item: isDbReady ? item._id : item,
      claimant: isDbReady ? req.user._id : {
        _id: req.user._id,
        id: req.user._id,
        fullName: req.user.fullName || 'Student Claimant',
        email: req.user.email,
        department: req.user.department || 'Student'
      },
      claimType: resolvedMatch ? 'match_claim' : 'direct_claim',
      match: resolvedMatch,
      reason: resolvedReason,
      ownershipProof: resolvedProof,
      additionalDetails: (additionalDetails || '').trim(),
      evidence: Array.isArray(evidence) ? evidence : (evidence ? [evidence] : []),
      status: CLAIM_STATUSES.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let createdClaim;

    if (isDbReady) {
      createdClaim = await Claim.create({
        ...claimData,
        item: item._id,
        claimant: req.user._id
      });

      // Update found item status to UNDER_VERIFICATION
      item.status = ITEM_STATUSES.STATUS_UNDER_VERIFICATION || 'UNDER_VERIFICATION';
      await item.save();

      // Alert the reporter of the found item
      if (item.reporter) {
        await NotificationService.createNotification({
          recipient: item.reporter,
          type: NOTIFICATION_TYPES.CLAIM_SUBMITTED,
          title: 'New Ownership Claim Filed',
          message: `A student has filed an ownership verification claim on "${item.itemName || item.title}".`,
          relatedItem: item._id,
          relatedClaim: createdClaim._id
        });
      }

      // Confirmation notification to claimant
      await NotificationService.createNotification({
        recipient: req.user._id,
        type: NOTIFICATION_TYPES.CLAIM_SUBMITTED,
        title: 'Claim Submitted Successfully',
        message: `Your ownership claim on "${item.itemName || item.title}" was submitted and is pending review by campus administration.`,
        relatedItem: item._id,
        relatedClaim: createdClaim._id
      });

      // Audit Log
      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: AUDIT_ACTIONS.CLAIM_CREATION,
        entityType: 'Claim',
        entityId: createdClaim._id,
        metadata: { itemId: item._id },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } else {
      // In-memory fallback
      item.status = 'UNDER_VERIFICATION';
      inMemoryClaimStore.unshift(claimData);
      createdClaim = claimData;

      // Send notifications in dev mode
      if (itemReporterId) {
        await NotificationService.createNotification({
          recipient: itemReporterId,
          type: NOTIFICATION_TYPES.CLAIM_SUBMITTED,
          title: 'New Ownership Claim Filed',
          message: `A student has filed an ownership verification claim on "${item.itemName || item.title}".`,
          relatedItem: item._id,
          relatedClaim: createdClaim._id
        });
      }

      await NotificationService.createNotification({
        recipient: claimantId,
        type: NOTIFICATION_TYPES.CLAIM_SUBMITTED,
        title: 'Claim Submitted Successfully',
        message: `Your ownership claim on "${item.itemName || item.title}" was submitted and is pending review.`,
        relatedItem: item._id,
        relatedClaim: createdClaim._id
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Claim submitted successfully. Campus security will verify your details.',
      data: formatClaimResponse(createdClaim, claimantId)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all claims submitted by the current authenticated user
 * @route GET /api/claims/my
 * @access Private
 */
export const getMyClaims = async (req, res, next) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;
    const userId = req.user._id.toString();

    if (isDbReady) {
      const claims = await Claim.find({ claimant: req.user._id })
        .populate('item', 'itemName title category location locationDetails date dateFound status images storageLocation')
        .populate('reviewedBy', 'fullName department')
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        message: 'User claims retrieved successfully',
        data: claims.map((c) => formatClaimResponse(c, userId))
      });
    }

    // In-memory fallback
    const userClaims = inMemoryClaimStore.filter((c) => {
      const cClaimant = (c.claimant?._id || c.claimant?.id || c.claimant)?.toString();
      return cClaimant === userId;
    });

    return res.status(200).json({
      success: true,
      message: 'User claims retrieved successfully',
      data: userClaims.map((c) => formatClaimResponse(c, userId))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single claim details (Protected: Claimant or Admin only)
 * @route GET /api/claims/:id
 * @access Private
 */
export const getClaimById = async (req, res, next) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;
    const claimId = req.params.id;
    let claim = null;

    if (isDbReady) {
      claim = await Claim.findById(claimId)
        .populate('item', 'itemName title category location locationDetails date dateFound status images storageLocation')
        .populate('claimant', 'fullName email phoneNumber registerNumber department')
        .populate('reviewedBy', 'fullName')
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

    const claimantId = (claim.claimant?._id || claim.claimant?.id || claim.claimant)?.toString();
    const isClaimant = req.user._id.toString() === claimantId;
    const isPrivileged = [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF].includes(req.user.role);

    if (!isClaimant && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this claim',
        errors: [{ message: 'Access denied to this claim record' }]
      });
    }

    const doc = { ...claim };
    // Hide internal verification notes from claimant unless info requested
    if (!isPrivileged && doc.status?.toLowerCase() !== 'underreview') {
      delete doc.verificationNotes;
    }

    return res.status(200).json({
      success: true,
      message: 'Claim retrieved successfully',
      data: formatClaimResponse(doc, req.user._id.toString())
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update claim details (Only if pending or underReview)
 * @route PUT /api/claims/:id
 * @access Private
 */
export const updateClaim = async (req, res, next) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;
    const claimId = req.params.id;
    let claim = null;

    if (isDbReady) {
      claim = await Claim.findById(claimId);
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

    const claimantId = (claim.claimant?._id || claim.claimant?.id || claim.claimant)?.toString();
    if (claimantId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this claim',
        errors: [{ message: 'Only the original claimant can modify claim details' }]
      });
    }

    const currentStatus = claim.status?.toLowerCase();
    if (!['pending', 'underreview'].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update a claim in status '${claim.status}'.`,
        errors: [{ message: 'Only pending or under-review claims can be modified' }]
      });
    }

    const { ownershipProof, additionalDetails, evidence } = req.body;
    if (ownershipProof) claim.ownershipProof = ownershipProof.trim();
    if (additionalDetails !== undefined) claim.additionalDetails = additionalDetails.trim();
    if (Array.isArray(evidence)) {
      claim.evidence = [...new Set([...(claim.evidence || []), ...evidence])];
    }

    claim.updatedAt = new Date();

    if (isDbReady) {
      await claim.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Claim updated successfully',
      data: formatClaimResponse(claim, req.user._id.toString())
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Attach evidence file URL to an active claim
 * @route POST /api/claims/:id/evidence
 * @access Private
 */
export const addEvidence = async (req, res, next) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;
    const claimId = req.params.id;
    const { evidenceUrl } = req.body;

    if (!evidenceUrl || typeof evidenceUrl !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid evidence URL is required',
        errors: [{ field: 'evidenceUrl', message: 'evidenceUrl is required' }]
      });
    }

    let claim = null;
    if (isDbReady) {
      claim = await Claim.findById(claimId);
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

    const claimantId = (claim.claimant?._id || claim.claimant?.id || claim.claimant)?.toString();
    if (claimantId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add evidence to this claim',
        errors: [{ message: 'Access denied' }]
      });
    }

    if (!Array.isArray(claim.evidence)) claim.evidence = [];
    claim.evidence.push(evidenceUrl.trim());
    claim.updatedAt = new Date();

    if (isDbReady) {
      await claim.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Evidence attached to claim successfully',
      data: formatClaimResponse(claim, req.user._id.toString())
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Cancel a pending claim
 * @route POST /api/claims/:id/cancel, PUT /api/claims/:id/cancel
 * @access Private
 */
export const cancelClaim = async (req, res, next) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;
    const claimId = req.params.id;
    let claim = null;

    if (isDbReady) {
      claim = await Claim.findById(claimId);
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

    const claimantId = (claim.claimant?._id || claim.claimant?.id || claim.claimant)?.toString();
    if (claimantId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this claim',
        errors: [{ message: 'Only the original claimant can cancel this claim' }]
      });
    }

    const currentStatus = claim.status?.toLowerCase();
    if (!['pending', 'underreview'].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a claim with status '${claim.status}'.`,
        errors: [{ message: 'Claim cannot be cancelled in its current state' }]
      });
    }

    claim.status = CLAIM_STATUSES.CANCELLED;
    claim.updatedAt = new Date();

    if (isDbReady) {
      await claim.save();

      // Check if there are other pending claims on the same item
      const remainingClaims = await Claim.countDocuments({
        item: claim.item,
        status: { $in: [CLAIM_STATUSES.PENDING, CLAIM_STATUSES.UNDER_REVIEW, 'pending', 'underReview'] }
      });

      if (remainingClaims === 0) {
        await Item.findByIdAndUpdate(claim.item, {
          status: ITEM_STATUSES.STATUS_FOUND || 'FOUND'
        });
      }

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: AUDIT_ACTIONS.CLAIM_CANCELLATION,
        entityType: 'Claim',
        entityId: claim._id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } else {
      // Revert in-memory item status if no other active claims
      const targetItemId = (claim.item?._id || claim.item?.id || claim.item)?.toString();
      const otherActive = inMemoryClaimStore.some((c) => {
        const cItemId = (c.item?._id || c.item?.id || c.item)?.toString();
        return cItemId === targetItemId && c._id?.toString() !== claimId && ['pending', 'underreview'].includes(c.status?.toLowerCase());
      });

      if (!otherActive) {
        const targetItem = inMemoryStore.find((i) => (i._id?.toString() || i.id?.toString()) === targetItemId);
        if (targetItem) targetItem.status = 'FOUND';
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Claim cancelled successfully',
      data: formatClaimResponse(claim, req.user._id.toString())
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createClaim,
  getMyClaims,
  getClaimById,
  updateClaim,
  addEvidence,
  cancelClaim
};
