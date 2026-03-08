import api from './api';

export const clienteDashboardService = {
  async getStats() {
    const response = await api.get('/cliente/dashboard');
    return response.data.data;
  },

  async getProyectos() {
    const response = await api.get('/cliente/dashboard/proyectos');
    return response.data.data;
  },

  async getActividades() {
    const response = await api.get('/cliente/dashboard/actividades');
    return response.data.data;
  },
};
