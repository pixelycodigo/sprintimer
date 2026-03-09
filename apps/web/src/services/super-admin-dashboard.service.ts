import api from './api';

export const superAdminDashboardService = {
  async getStats() {
    const response = await api.get('/super-admin/dashboard');
    return response.data.data;
  },
};
