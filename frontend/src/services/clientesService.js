import api from './api';

export const clientesService = {
  /**
   * Listar clientes con paginación y filtros
   */
  listar: async (params = {}) => {
    const response = await api.get('/admin/clientes', { params });
    return response.data;
  },

  /**
   * Obtener cliente por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/admin/clientes/${id}`);
    return response.data;
  },

  /**
   * Crear cliente
   */
  crear: async (data) => {
    const response = await api.post('/admin/clientes', data);
    return response.data;
  },

  /**
   * Actualizar cliente
   */
  actualizar: async (id, data) => {
    const response = await api.put(`/admin/clientes/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar cliente (soft delete)
   */
  eliminar: async (id, motivo) => {
    const response = await api.delete(`/admin/clientes/${id}`, {
      data: { motivo },
    });
    return response.data;
  },

  /**
   * Recuperar cliente eliminado
   */
  recuperar: async (id) => {
    const response = await api.post(`/admin/clientes/${id}/recuperar`);
    return response.data;
  },
};

export default clientesService;
