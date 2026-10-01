import MatchingService from '../services/matchingService.js';
import AuditService from '../services/auditService.js';
import { AUDIT_ACTIONS, MATCH_STATUSES } from '../utils/constants.js';

/**
 * @desc Get potential matches for lost items reported by current user
 * @route GET /api/matches, GET /api/matches/my
 * @access Private
 */
export const getMyMatches = async (req, res, next) => {
  try {
    const matches = await MatchingService.getMatchesForUser(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Possible matches retrieved successfully',
      data: matches
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single match details with privacy masking
 * @route GET /api/matches/:id
 * @access Private
 */
export const getMatchById = async (req, res, next) => {
  try {
    const match = await MatchingService.getMatchById(req.params.id, req.user._id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match record not found',
        errors: [{ message: 'No match found matching the provided ID' }]
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Match details retrieved successfully',
      data: match
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Mark match as viewed by current user
 * @route PATCH /api/matches/:id/view
 * @access Private
 */
export const viewMatch = async (req, res, next) => {
  try {
    const updated = await MatchingService.updateMatchStatus(req.params.id, MATCH_STATUSES.VIEWED, req.user._id);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Match record not found',
        errors: [{ message: 'No match found matching provided ID' }]
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Match marked as viewed',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Dismiss a suggested match
 * @route PATCH /api/matches/:id/dismiss
 * @access Private
 */
export const dismissMatch = async (req, res, next) => {
  try {
    const updated = await MatchingService.updateMatchStatus(req.params.id, MATCH_STATUSES.DISMISSED, req.user._id);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Match record not found',
        errors: [{ message: 'No match found matching provided ID' }]
      });
    }

    await AuditService.log({
      actor: req.user._id,
      actorEmail: req.user.email,
      action: AUDIT_ACTIONS.MATCH_DISMISSAL || 'match_dismissal',
      entityType: 'Match',
      entityId: req.params.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({
      success: true,
      message: 'Match dismissed successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Flag match as transitioning to an active ownership claim
 * @route POST /api/matches/:id/start-claim
 * @access Private
 */
export const startClaimFromMatch = async (req, res, next) => {
  try {
    const updated = await MatchingService.updateMatchStatus(req.params.id, MATCH_STATUSES.CLAIM_STARTED, req.user._id);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Match record not found',
        errors: [{ message: 'No match found matching provided ID' }]
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Match linked to new claim flow',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyMatches,
  getMatchById,
  viewMatch,
  dismissMatch,
  startClaimFromMatch
};
