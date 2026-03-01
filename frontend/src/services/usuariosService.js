import api from './api';

export const usuariosService = {
  /**
   * Listar usuarios con paginación y filtros
   */
  listar: async (params = {}) => {
    const response = await api.get('/admin/usuarios', { params });
    return response.data;
  },

  /**
   * Obtener usuario por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/admin/usuarios/${id}`);
    return response.data;
  },

  /**
   * Crear usuario
   */
  crear: async (data) => {
    const response = await api.post('/admin/usuarios', data);
    return response.data;
  },

  /**
   * Actualizar usuario
   */
  actualizar: async (id, data) => {
    const response = await api.put(`/admin/usuarios/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar usuario (soft delete)
   */
  eliminar: async (id, motivo) => {
    const response = await api.delete(`/admin/usuarios/${id}`, {
      data: { motivo },
    });
    return response.data;
  },

  /**
   * Recuperar usuario eliminado
   */
  recuperar: async (id) => {
    const response = await api.post(`/admin/usuarios/${id}/recuperar`);
    return response.data;
  },

  /**
   * Cambiar contraseña de usuario
   */
  cambiarPassword: async (id, password, es_temporal = true) => {
    const response = await api.post(`/admin/usuarios/${id}/cambiar-password`, {
      password,
      es_temporal,
    });
    return response.data;
  },

  /**
   * Listar eliminados
   */
  listarEliminados: async (params = {}) => {
    const response = await api.get('/admin/eliminados', { params });
    return response.data;
  },

  /**
   * Obtener resumen de papelera
   */
  resumenPapelera: async () => {
    const response = await api.get('/admin/eliminados/resumen');
    return response.data;
  },
};

export default usuariosService;
