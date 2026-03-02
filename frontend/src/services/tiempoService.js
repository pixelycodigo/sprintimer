import api from './api';

/**
 * Servicio para gestión de Tiempo (Actividades, Hitos, Trimestres, Sprints)
 */

export const actividadesService = {
  /**
   * Listar actividades de un proyecto
   */
  listar: async (proyecto_id, params = {}) => {
    const response = await api.get('/admin/tiempo/actividades', {
      params: { proyecto_id, ...params }
    });
    return response.data;
  },

  /**
   * Obtener actividad por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/admin/tiempo/actividades/${id}`);
    return response.data;
  },

  /**
   * Crear actividad
   */
  crear: async (proyecto_id, data) => {
    const response = await api.post('/admin/tiempo/actividades', {
      proyecto_id,
      ...data
    });
    return response.data;
  },

  /**
   * Actualizar actividad
   */
  actualizar: async (id, data) => {
    const response = await api.put(`/admin/tiempo/actividades/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar actividad (soft delete)
   */
  eliminar: async (id, motivo) => {
    const response = await api.delete(`/admin/tiempo/actividades/${id}`, {
      data: { motivo }
    });
    return response.data;
  },

  /**
   * Recuperar actividad eliminada
   */
  recuperar: async (id) => {
    const response = await api.post(`/admin/tiempo/actividades/${id}/recuperar`);
    return response.data;
  },

  /**
   * Asignar actividad a sprints
   */
  asignarSprints: async (actividadId, sprintsIds) => {
    const response = await api.post(`/admin/tiempo/actividades/${actividadId}/asignar-sprints`, {
      sprints_ids: sprintsIds
    });
    return response.data;
  },

  /**
   * Obtener actividades asignadas a un proyecto
   */
  obtenerAsignadas: async (proyecto_id) => {
    const response = await api.get(`/admin/tiempo/proyectos/${proyecto_id}/actividades-asignadas`);
    return response.data;
  },
};

export const hitosService = {
  /**
   * Listar hitos de un proyecto
   */
  listar: async (proyecto_id, params = {}) => {
    const response = await api.get('/admin/tiempo/hitos', {
      params: { proyecto_id, ...params }
    });
    return response.data;
  },

  /**
   * Obtener hito por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/admin/tiempo/hitos/${id}`);
    return response.data;
  },

  /**
   * Crear hito
   */
  crear: async (proyecto_id, data) => {
    const response = await api.post('/admin/tiempo/hitos', {
      proyecto_id,
      ...data
    });
    return response.data;
  },

  /**
   * Actualizar hito
   */
  actualizar: async (id, data) => {
    const response = await api.put(`/admin/tiempo/hitos/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar hito (soft delete)
   */
  eliminar: async (id, motivo) => {
    const response = await api.delete(`/admin/tiempo/hitos/${id}`, {
      data: { motivo }
    });
    return response.data;
  },

  /**
   * Recuperar hito eliminado
   */
  recuperar: async (id) => {
    const response = await api.post(`/admin/tiempo/hitos/${id}/recuperar`);
    return response.data;
  },
};

export const trimestresService = {
  /**
   * Listar trimestres de un proyecto
   */
  listar: async (proyecto_id, params = {}) => {
    const response = await api.get('/admin/tiempo/trimestres', {
      params: { proyecto_id, ...params }
    });
    return response.data;
  },

  /**
   * Obtener trimestre por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/admin/tiempo/trimestres/${id}`);
    return response.data;
  },

  /**
   * Crear trimestre
   */
  crear: async (proyecto_id, data) => {
    const response = await api.post('/admin/tiempo/trimestres', {
      proyecto_id,
      ...data
    });
    return response.data;
  },

  /**
   * Actualizar trimestre
   */
  actualizar: async (id, data) => {
    const response = await api.put(`/admin/tiempo/trimestres/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar trimestre (soft delete)
   */
  eliminar: async (id, motivo) => {
    const response = await api.delete(`/admin/tiempo/trimestres/${id}`, {
      data: { motivo }
    });
    return response.data;
  },

  /**
   * Recuperar trimestre eliminado
   */
  recuperar: async (id) => {
    const response = await api.post(`/admin/tiempo/trimestres/${id}/recuperar`);
    return response.data;
  },
};

export const sprintsService = {
  /**
   * Listar sprints de un proyecto
   */
  listar: async (proyecto_id, params = {}) => {
    const response = await api.get('/admin/tiempo/sprints', {
      params: { proyecto_id, ...params }
    });
    return response.data;
  },

  /**
   * Obtener sprint por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/admin/tiempo/sprints/${id}`);
    return response.data;
  },

  /**
   * Crear sprint
   */
  crear: async (proyecto_id, data) => {
    const response = await api.post('/admin/tiempo/sprints', {
      proyecto_id,
      ...data
    });
    return response.data;
  },

  /**
   * Actualizar sprint
   */
  actualizar: async (id, data) => {
    const response = await api.put(`/admin/tiempo/sprints/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar sprint (soft delete)
   */
  eliminar: async (id, motivo) => {
    const response = await api.delete(`/admin/tiempo/sprints/${id}`, {
      data: { motivo }
    });
    return response.data;
  },

  /**
   * Recuperar sprint eliminado
   */
  recuperar: async (id) => {
    const response = await api.post(`/admin/tiempo/sprints/${id}/recuperar`);
    return response.data;
  },
};

export default {
  actividadesService,
  hitosService,
  trimestresService,
  sprintsService,
};
