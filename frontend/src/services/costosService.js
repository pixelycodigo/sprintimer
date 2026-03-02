import api from './api';

/**
 * Servicio para gestión de Costos por Hora
 */

export const costosService = {
  /**
   * Listar costos por hora de un usuario
   */
  listarPorUsuario: async (usuario_id, params = {}) => {
    const response = await api.get(`/admin/pagos/usuarios/${usuario_id}/costos`, { params });
    return response.data;
  },

  /**
   * Listar todos los costos (obtiene de todos los usuarios)
   */
  listar: async (params = {}) => {
    // Nota: El backend no tiene una ruta para listar todos los costos
    // Obtenemos la lista de usuarios y luego sus costos
    const usuariosRes = await api.get('/admin/usuarios', { params: { limit: 100 } });
    const usuarios = usuariosRes.data.usuarios || [];
    
    const allCostos = [];
    for (const usuario of usuarios) {
      try {
        const costosRes = await api.get(`/admin/pagos/usuarios/${usuario.id}/costos`);
        const costos = costosRes.data.costos || [];
        allCostos.push(...costos.map(c => ({...c, usuario_nombre: usuario.nombre, usuario_email: usuario.email})));
      } catch (error) {
        // Si no tiene costos, continuar
      }
    }
    return { costos: allCostos, total: allCostos.length };
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
  crear: async (usuario_id, data) => {
    const response = await api.post(`/admin/pagos/usuarios/${usuario_id}/costos`, data);
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
   * Eliminar costo por hora
   */
  eliminar: async (id) => {
    const response = await api.delete(`/admin/pagos/costos/${id}`);
    return response.data;
  },

  /**
   * Obtener costo vigente de un usuario
   */
  obtenerCostoVigente: async (usuario_id) => {
    const response = await api.get(`/admin/pagos/usuarios/${usuario_id}/costo-vigente`);
    return response.data;
  },
};

export default costosService;
