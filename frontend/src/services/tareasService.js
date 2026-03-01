import api from './api';

export const tareasService = {
  /**
   * Registrar nueva tarea
   */
  registrar: async (data) => {
    const response = await api.post('/usuario/tareas', data);
    return response.data;
  },

  /**
   * Listar mis tareas con paginación y filtros
   */
  listar: async (params = {}) => {
    const response = await api.get('/usuario/tareas', { params });
    return response.data;
  },

  /**
   * Obtener tarea por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/usuario/tareas/${id}`);
    return response.data;
  },

  /**
   * Actualizar tarea
   */
  actualizar: async (id, data) => {
    const response = await api.put(`/usuario/tareas/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar tarea
   */
  eliminar: async (id) => {
    const response = await api.delete(`/usuario/tareas/${id}`);
    return response.data;
  },

  /**
   * Obtener resumen de horas
   */
  obtenerResumenHoras: async (params = {}) => {
    const response = await api.get('/usuario/tareas/resumen/horas', { params });
    return response.data;
  },

  /**
   * Obtener horas por día (calendario)
   */
  obtenerHorasPorDia: async (params = {}) => {
    const response = await api.get('/usuario/tareas/horas-por-dia', { params });
    return response.data;
  },
};

export const actividadesService = {
  /**
   * Listar actividades de un proyecto
   */
  listar: async (proyecto_id) => {
    const response = await api.get('/admin/tiempo/actividades', {
      params: { proyecto_id },
    });
    return response.data;
  },

  /**
   * Obtener actividades asignadas al usuario
   */
  obtenerAsignadas: async (proyecto_id) => {
    const response = await api.get(`/admin/tiempo/proyectos/${proyecto_id}/actividades-asignadas`);
    return response.data;
  },

  /**
   * Obtener actividad por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/admin/tiempo/actividades/${id}`);
    return response.data;
  },
};

export default { tareasService, actividadesService };
