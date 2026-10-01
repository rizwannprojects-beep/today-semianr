import api from './api.js';

export const itemService = {
  // Lost Items
  async getLostItems(params = {}) {
    return api.get('/lost-items', { params });
  },

  async getLostItemById(id) {
    return api.get(`/lost-items/${id}`);
  },

  async reportLostItem(data) {
    return api.post('/lost-items', data);
  },

  async getMyLostItems() {
    return api.get('/lost-items/my');
  },

  // Found Items
  async getFoundItems(params = {}) {
    return api.get('/found-items', { params });
  },

  async getFoundItemById(id) {
    return api.get(`/found-items/${id}`);
  },

  async reportFoundItem(data) {
    return api.post('/found-items', data);
  },

  async getMyFoundItems() {
    return api.get('/found-items/my');
  },

  // Generic items query (unified search)
  async getItems(params = {}) {
    return api.get('/items', { params });
  },

  async getItemById(id) {
    return api.get(`/items/${id}`);
  },

  async updateItem(id, data, type = 'lost') {
    return api.put(`/${type === 'found' ? 'found-items' : 'lost-items'}/${id}`, data);
  },

  async deleteItem(id, type = 'lost') {
    return api.delete(`/${type === 'found' ? 'found-items' : 'lost-items'}/${id}`);
  },

  // Image upload
  async uploadImages(formData) {
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async uploadBase64Image(imageBase64) {
    return api.post('/upload', { imageBase64 });
  },

  // Claims
  async submitClaim(data) {
    return api.post('/claims', data);
  },

  async getMyClaims() {
    return api.get('/claims/my');
  },

  async getClaimById(id) {
    return api.get(`/claims/${id}`);
  },

  async updateClaim(id, data) {
    return api.put(`/claims/${id}`, data);
  },

  async addClaimEvidence(id, evidenceUrl) {
    return api.post(`/claims/${id}/evidence`, { evidenceUrl });
  },

  async cancelClaim(id) {
    return api.post(`/claims/${id}/cancel`);
  },

  // Matches
  async getMatches() {
    return api.get('/matches');
  },

  async getMatchById(id) {
    return api.get(`/matches/${id}`);
  },

  async viewMatch(id) {
    return api.patch(`/matches/${id}/view`);
  },

  async dismissMatch(id) {
    return api.patch(`/matches/${id}/dismiss`);
  },

  async startClaimFromMatch(id) {
    return api.post(`/matches/${id}/start-claim`);
  },

  // Notifications
  async getNotifications() {
    return api.get('/notifications');
  },

  async markNotificationRead(id) {
    return api.patch(`/notifications/${id}/read`);
  },

  // Health check
  async getHealth() {
    return api.get('/health');
  },

  // Returns & Handover (Phase 6)
  async getReturns() {
    return api.get('/returns');
  },

  async getReturnById(id) {
    return api.get(`/returns/${id}`);
  },

  async scheduleReturn(id, data) {
    return api.post(`/returns/${id}/schedule`, data);
  },

  async cancelReturn(id, reason) {
    return api.patch(`/returns/${id}/cancel`, { reason });
  },

  async startVerification(id) {
    return api.post(`/returns/${id}/start-verification`);
  },

  async verifyReturn(id, data) {
    return api.post(`/returns/${id}/verify`, data);
  },

  async confirmHandover(id, remarks) {
    return api.post(`/returns/${id}/confirm-handover`, { remarks });
  },

  async confirmReceived(id, remarks) {
    return api.post(`/returns/${id}/confirm-received`, { remarks });
  },

  async disputeReturn(id, data) {
    return api.post(`/returns/${id}/dispute`, data);
  }
};

export default itemService;
