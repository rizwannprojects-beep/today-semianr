import api from './api.js';
import { DEMO_STUDENT, DEMO_ADMIN } from './mockData.js';

export const authService = {
  async register(userData) {
    try {
      return await api.post('/auth/register', userData);
    } catch (err) {
      if (err.statusCode === 405 || err.statusCode === 404 || err.message?.includes('405')) {
        const { handleMockRequest } = await import('./mockApiHandler.js');
        return handleMockRequest({ url: '/auth/register', method: 'post', data: userData });
      }
      throw err;
    }
  },

  async login(credentials) {
    try {
      return await api.post('/auth/login', credentials);
    } catch (err) {
      if (err.statusCode === 405 || err.statusCode === 404 || err.message?.includes('405') || err.message?.includes('Network Error')) {
        const { handleMockRequest } = await import('./mockApiHandler.js');
        return handleMockRequest({ url: '/auth/login', method: 'post', data: credentials });
      }
      throw err;
    }
  },

  async logout() {
    try {
      return await api.post('/auth/logout');
    } catch {
      return { success: true };
    }
  },

  async getMe() {
    try {
      return await api.get('/auth/me');
    } catch (err) {
      if (err.statusCode === 405 || err.statusCode === 404 || err.message?.includes('405')) {
        const saved = localStorage.getItem('currentUser');
        return { success: true, data: { user: saved ? JSON.parse(saved) : DEMO_STUDENT } };
      }
      throw err;
    }
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
