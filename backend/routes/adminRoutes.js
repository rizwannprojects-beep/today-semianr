import { Router } from 'express';
import {
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
  getAdminNotifications,
  getAdminNotificationCenter,
  getAuditLogs,
  getSecurityEvents,
  exportDataCsv
} from '../controllers/adminController.js';
import { validateObjectId } from '../utils/validation.js';
import validate from '../middleware/validationMiddleware.js';
import authenticate from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import { adminActionLimiter } from '../middleware/rateLimitMiddleware.js';
import { ROLES } from '../utils/constants.js';
import analyticsRoutes from './analyticsRoutes.js';

const router = Router();

// Strictly guard all administrative endpoints with authentication and admin/superadmin/staff role
router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', validate(validateObjectId('id')), getUserById);
router.patch('/users/:id/suspend', adminActionLimiter, validate(validateObjectId('id')), suspendUser);
router.patch('/users/:id/reactivate', adminActionLimiter, validate(validateObjectId('id')), reactivateUser);

// Items Moderation & Lifecycle
router.get('/lost-items', getAdminLostItems);
router.get('/found-items', getAdminFoundItems);
router.get('/items', getAdminItems);
router.patch('/items/:id/moderate', adminActionLimiter, validate(validateObjectId('id')), moderateItem);

// Claims Management & Review
router.get('/claims', getAdminClaims);
router.get('/claims/:id', validate(validateObjectId('id')), getAdminClaimById);
router.post('/claims/:id/approve', adminActionLimiter, validate(validateObjectId('id')), approveClaim);
router.post('/claims/:id/reject', adminActionLimiter, validate(validateObjectId('id')), rejectClaim);
router.post('/claims/:id/request-information', adminActionLimiter, validate(validateObjectId('id')), requestClaimInformation);
router.patch('/claims/:id/review', adminActionLimiter, validate(validateObjectId('id')), reviewClaim);

// Matches Management
router.get('/matches', getAdminMatches);

// Returns & Disputes
router.get('/returns', getAdminReturns);
router.get('/disputes', getAdminDisputes);
router.patch('/disputes/:id/resolve', adminActionLimiter, validate(validateObjectId('id')), resolveDispute);

// Moderation / Reports / Flags
router.get('/reports', getAdminModerationReports);
router.patch('/reports/:id/resolve', validate(validateObjectId('id')), resolveModerationReport);

// Campus Announcements
router.get('/announcements', getAnnouncements);
router.get('/announcements/estimate-audience', previewAnnouncementAudience);
router.post('/announcements/preview-audience', previewAnnouncementAudience);
router.post('/announcements', createAnnouncement);
router.patch('/announcements/:id/publish', validate(validateObjectId('id')), publishAnnouncement);
router.post('/announcements/:id/publish', validate(validateObjectId('id')), publishAnnouncement);
router.patch('/announcements/:id/cancel', validate(validateObjectId('id')), cancelAnnouncement);
router.post('/announcements/:id/cancel', validate(validateObjectId('id')), cancelAnnouncement);
router.patch('/announcements/:id', validate(validateObjectId('id')), updateAnnouncement);
router.delete('/announcements/:id', validate(validateObjectId('id')), deleteAnnouncement);

// Admin Notification Center (isolated from student notifications)
router.get('/notifications', getAdminNotifications);
router.get('/notification-center', getAdminNotificationCenter);

// Audit & Security Logs
router.get('/audit-logs', getAuditLogs);
router.get('/security-events', getSecurityEvents);

// CSV Export
router.get('/export/:entity', exportDataCsv);

// Phase 9: Analytics & Reporting Engine
router.use('/analytics', analyticsRoutes);

export default router;
