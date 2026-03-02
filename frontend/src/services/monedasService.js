import api from './api';

/**
 * Servicio para gestión de Monedas
 */

export const monedasService = {
  /**
   * Listar todas las monedas
   */
  listar: async (params = {}) => {
    const response = await api.get('/admin/pagos/monedas', { params });
    return response.data;
  },

  /**
   * Obtener moneda por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/admin/pagos/monedas/${id}`);
    return response.data;
  },

  /**
   * Crear moneda
   */
  crear: async (data) => {
    const response = await api.post('/admin/pagos/monedas', data);
    return response.data;
  },

  /**
   * Actualizar moneda
   */
  actualizar: async (id, data) => {
    const response = await api.put(`/admin/pagos/monedas/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar moneda
   */
  eliminar: async (id) => {
    const response = await api.delete(`/admin/pagos/monedas/${id}`);
    return response.data;
  },

  /**
   * Obtener moneda por código (ej: PEN, USD)
   */
  obtenerPorCodigo: async (codigo) => {
    const response = await api.get(`/admin/pagos/monedas/codigo/${codigo}`);
    return response.data;
  },
};

export default monedasService;
