import api from './api.js';

export const adminService = {
  // 1. Dashboard Overview
  getDashboard: () => api.get('/admin/dashboard'),

  // 2. User Management
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  suspendUser: (id, reason) => api.patch(`/admin/users/${id}/suspend`, { reason }),
  reactivateUser: (id, reason) => api.patch(`/admin/users/${id}/reactivate`, { reason }),

  // 3. Items Management & Moderation
  getLostItems: (params = {}) => api.get('/admin/lost-items', { params }),
  getFoundItems: (params = {}) => api.get('/admin/found-items', { params }),
  getItems: (params = {}) => api.get('/admin/items', { params }),
  moderateItem: (id, action, notes = '') => api.patch(`/admin/items/${id}/moderate`, { action, notes }),

  // 4. Claims Review & Management
  getClaims: (params = {}) => api.get('/admin/claims', { params }),
  getClaimById: (id) => api.get(`/admin/claims/${id}`),
  approveClaim: (id, notes = '') => api.post(`/admin/claims/${id}/approve`, { notes }),
  rejectClaim: (id, rejectionReason) => api.post(`/admin/claims/${id}/reject`, { rejectionReason }),
  requestClaimInformation: (id, message) => api.post(`/admin/claims/${id}/request-information`, { message }),
  reviewClaim: (id, notes = '') => api.patch(`/admin/claims/${id}/review`, { notes }),

  // 5. Matches & Returns
  getMatches: (params = {}) => api.get('/admin/matches', { params }),
  getReturns: (params = {}) => api.get('/admin/returns', { params }),
  getDisputes: (params = {}) => api.get('/admin/disputes', { params }),
  resolveDispute: (id, status, resolutionNotes) => api.patch(`/admin/disputes/${id}/resolve`, { status, resolutionNotes }),

  // 6. Moderation / Flags
  getModerationReports: (params = {}) => api.get('/admin/reports', { params }),
  resolveModerationReport: (id, status, resolutionNotes) => api.patch(`/admin/reports/${id}/resolve`, { status, resolutionNotes }),

  // 7. Announcements
  getAnnouncements: () => api.get('/admin/announcements'),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),

  // 8. Audit & Security Events
  getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }),
  getSecurityEvents: () => api.get('/admin/security-events'),

  // 9. Export
  exportCsvUrl: (entity) => {
    const base = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    return `${base}/admin/export/${entity}`;
  },

  // 10. Phase 9 Analytics & Intelligence Engine
  getAnalyticsOverview: (params = {}) => api.get('/admin/analytics/overview', { params }),
  getAnalyticsItems: (params = {}) => api.get('/admin/analytics/items', { params }),
  getAnalyticsClaims: (params = {}) => api.get('/admin/analytics/claims', { params }),
  getAnalyticsMatches: (params = {}) => api.get('/admin/analytics/matches', { params }),
  getAnalyticsReturns: (params = {}) => api.get('/admin/analytics/returns', { params }),
  getAnalyticsResolutionTimes: (params = {}) => api.get('/admin/analytics/resolution-times', { params }),
  getAnalyticsCategories: (params = {}) => api.get('/admin/analytics/categories', { params }),
  getAnalyticsLocations: (params = {}) => api.get('/admin/analytics/locations', { params }),
  getAnalyticsDepartments: (params = {}) => api.get('/admin/analytics/departments', { params }),
  getAnalyticsTrends: (params = {}) => api.get('/admin/analytics/trends', { params }),
  getAnalyticsExportUrl: (dataset = 'summary', params = {}) => {
    const base = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    const qs = new URLSearchParams({ dataset, ...params }).toString();
    return `${base}/admin/analytics/export?${qs}`;
  }
};

export default adminService;
