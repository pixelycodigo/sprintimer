import api from './api';

export const rolesService = {
  /**
   * Listar roles del sistema
   */
  listar: async () => {
    const response = await api.get('/admin/roles');
    return response.data;
  },

  /**
   * Crear rol
   */
  crear: async (data) => {
    const response = await api.post('/admin/roles', data);
    return response.data;
  },

  /**
   * Actualizar rol
   */
  actualizar: async (id, data) => {
    const response = await api.put(`/admin/roles/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar rol
   */
  eliminar: async (id) => {
    const response = await api.delete(`/admin/roles/${id}`);
    return response.data;
  },
};

export default rolesService;
