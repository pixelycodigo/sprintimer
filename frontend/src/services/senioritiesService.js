import api from './api';

/**
 * Servicio para gestión de Seniorities
 */

export const senioritiesService = {
  /**
   * Listar seniorities
   */
  listar: async (params = {}) => {
    const response = await api.get('/admin/pagos/seniorities', { params });
    return response.data;
  },

  /**
   * Obtener seniority por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/admin/pagos/seniorities/${id}`);
    return response.data;
  },

  /**
   * Crear seniority
   */
  crear: async (data) => {
    const response = await api.post('/admin/pagos/seniorities', data);
    return response.data;
  },

  /**
   * Actualizar seniority
   */
  actualizar: async (id, data) => {
    const response = await api.put(`/admin/pagos/seniorities/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar seniority (soft delete)
   */
  eliminar: async (id, motivo = '') => {
    const response = await api.delete(`/admin/pagos/seniorities/${id}`, {
      data: { motivo }
    });
    return response.data;
  },
};

export default senioritiesService;
