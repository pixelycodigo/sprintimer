import api from './api';

export const dashboardService = {
  async getStats() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
};
