import api from './api.js';

export const authService = {
  async register(userData) {
    return api.post('/auth/register', userData);
  },

  async login(credentials) {
    return api.post('/auth/login', credentials);
  },

  async logout() {
    return api.post('/auth/logout');
  },

  async getMe() {
    return api.get('/auth/me');
  },

  async forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  },

  async resetPassword({ token, password, confirmPassword }) {
    return api.post('/auth/reset-password', { token, password, confirmPassword });
  },

  async refresh() {
    return api.post('/auth/refresh');
  }
};

export default authService;
