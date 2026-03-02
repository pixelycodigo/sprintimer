import api from './api';

/**
 * Servicio para gestión de Bonos
 */

export const bonosService = {
  /**
   * Listar bonos disponibles
   */
  listar: async (params = {}) => {
    const response = await api.get('/admin/pagos/bonos', { params });
    return response.data;
  },

  /**
   * Obtener bono por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/admin/pagos/bonos/${id}`);
    return response.data;
  },

  /**
   * Crear bono
   */
  crear: async (data) => {
    const response = await api.post('/admin/pagos/bonos', data);
    return response.data;
  },

  /**
   * Actualizar bono
   */
  actualizar: async (id, data) => {
    const response = await api.put(`/admin/pagos/bonos/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar bono (soft delete)
   */
  eliminar: async (id, motivo) => {
    const response = await api.delete(`/admin/pagos/bonos/${id}`, {
      data: { motivo }
    });
    return response.data;
  },

  /**
   * Recuperar bono eliminado
   */
  recuperar: async (id) => {
    const response = await api.post(`/admin/pagos/bonos/${id}/recuperar`);
    return response.data;
  },

  /**
   * Listar bonos asignados a un usuario
   */
  listarPorUsuario: async (usuario_id) => {
    const response = await api.get(`/admin/pagos/usuarios/${usuario_id}/bonos`);
    return response.data;
  },

  /**
   * Asignar bono a usuario
   */
  asignarUsuario: async (usuario_id, data) => {
    const response = await api.post(`/admin/pagos/usuarios/${usuario_id}/bonos`, data);
    return response.data;
  },

  /**
   * Desasignar bono de usuario
   */
  desasignarUsuario: async (id) => {
    const response = await api.delete(`/admin/pagos/bonos-usuarios/${id}`);
    return response.data;
  },

  /**
   * Obtener bonos aplicables
   */
  obtenerAplicables: async (params = {}) => {
    const response = await api.get('/admin/pagos/bonos/aplicables', { params });
    return response.data;
  },
};

export default bonosService;
