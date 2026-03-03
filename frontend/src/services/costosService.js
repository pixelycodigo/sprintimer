import api from './api';

/**
 * Servicio para gestión de Costos por Hora
 */

export const costosService = {
  /**
   * Listar todos los costos
   */
  listar: async (params = {}) => {
    const response = await api.get('/admin/pagos/costos', { params });
    return response.data;
  },

  /**
   * Obtener costo por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/admin/pagos/costos/${id}`);
    return response.data;
  },

  /**
   * Crear costo por hora
   */
  crear: async (data) => {
    const response = await api.post('/admin/pagos/costos', data);
    return response.data;
  },

  /**
   * Actualizar costo por hora
   */
  actualizar: async (id, data) => {
    const response = await api.put(`/admin/pagos/costos/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar costo por hora (soft delete)
   */
  eliminar: async (id, motivo = '') => {
    const response = await api.delete(`/admin/pagos/costos/${id}`, {
      data: { motivo }
    });
    return response.data;
  },
};

export default costosService;
