import api from './api';

export const cortesService = {
  /**
   * ADMINISTRADOR - Cortes Mensuales
   */

  /**
   * Generar cortes mensuales
   */
  generarCortes: async (data = {}) => {
    const response = await api.post('/admin/pagos/cortes/generar', data);
    return response.data;
  },

  /**
   * Listar cortes con paginación y filtros
   */
  listar: async (params = {}) => {
    const response = await api.get('/admin/pagos/cortes', { params });
    return response.data;
  },

  /**
   * Obtener detalle de un corte
   */
  obtenerDetalle: async (id) => {
    const response = await api.get(`/admin/pagos/cortes/${id}`);
    return response.data;
  },

  /**
   * Actualizar estado de un corte
   */
  actualizarEstado: async (id, estado) => {
    const response = await api.put(`/admin/pagos/cortes/${id}/estado`, { estado });
    return response.data;
  },

  /**
   * Recalcular un corte
   */
  recalcular: async (id, motivo) => {
    const response = await api.post(`/admin/pagos/cortes/${id}/recalcular`, { motivo });
    return response.data;
  },

  /**
   * Obtener históricos de recálculos
   */
  obtenerRecalculos: async (id) => {
    const response = await api.get(`/admin/pagos/cortes/${id}/recalculos`);
    return response.data;
  },

  /**
   * USUARIO - Mis Cortes
   */

  /**
   * Listar mis cortes
   */
  listarMisCortes: async (params = {}) => {
    const response = await api.get('/usuario/cortes', { params });
    return response.data;
  },

  /**
   * Obtener detalle de mi corte
   */
  obtenerMiCorte: async (id) => {
    const response = await api.get(`/usuario/cortes/${id}`);
    return response.data;
  },
};

export default cortesService;
