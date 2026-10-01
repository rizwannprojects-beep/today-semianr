import api from './api.js';

export const notificationService = {
  // Student notifications
  getNotifications: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.filter) query.append('filter', params.filter);
    const qs = query.toString();
    return api.get(`/notifications${qs ? `?${qs}` : ''}`);
  },

  getUnreadCount: () => api.get('/notifications/unread-count'),

  markRead: (id) => api.patch(`/notifications/${id}/read`),

  markUnread: (id) => api.patch(`/notifications/${id}/unread`),

  markAllRead: () => api.patch('/notifications/read-all'),

  deleteNotification: (id) => api.delete(`/notifications/${id}`),

  // Notification Preferences
  getPreferences: () => api.get('/notification-preferences'),

  updatePreferences: (data) => api.patch('/notification-preferences', data),

  // Admin notification center & announcements
  getAdminNotifications: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString();
    return api.get(`/admin/notifications${qs ? `?${qs}` : ''}`);
  },

  getAnnouncements: () => api.get('/admin/announcements'),

  createAnnouncement: (data) => api.post('/admin/announcements', data),

  updateAnnouncement: (id, data) => api.patch(`/admin/announcements/${id}`, data),

  publishAnnouncement: (id) => api.post(`/admin/announcements/${id}/publish`),

  cancelAnnouncement: (id) => api.post(`/admin/announcements/${id}/cancel`),

  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),

  previewAudience: (targetAudience) => api.post('/admin/announcements/preview-audience', { targetAudience })
};

export default notificationService;
