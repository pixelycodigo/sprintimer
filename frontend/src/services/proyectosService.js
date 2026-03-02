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

export const proyectosService = {
  /**
   * Listar proyectos con paginación y filtros
   */
  listar: async (params = {}) => {
    const response = await api.get('/admin/proyectos', { params });
    return response.data;
  },

  /**
   * Obtener proyecto por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/admin/proyectos/${id}`);
    return response.data;
  },

  /**
   * Crear proyecto
   */
  crear: async (data) => {
    const response = await api.post('/admin/proyectos', data);
    return response.data;
  },

  /**
   * Actualizar proyecto
   */
  actualizar: async (id, data) => {
    const response = await api.put(`/admin/proyectos/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar proyecto (soft delete)
   */
  eliminar: async (id, motivo) => {
    const response = await api.delete(`/admin/proyectos/${id}`, {
      data: { motivo },
    });
    return response.data;
  },

  /**
   * Recuperar proyecto eliminado
   */
  recuperar: async (id) => {
    const response = await api.post(`/admin/proyectos/${id}/recuperar`);
    return response.data;
  },

  /**
   * Asignar usuario a proyecto
   */
  asignarUsuario: async (proyectoId, usuarioId, rol_en_proyecto = 'miembro') => {
    const response = await api.post(`/admin/proyectos/${proyectoId}/asignar-usuario`, {
      usuario_id: usuarioId,
      rol_en_proyecto,
    });
    return response.data;
  },

  /**
   * Desasignar usuario de proyecto
   */
  desasignarUsuario: async (proyectoId, usuarioId) => {
    const response = await api.delete(`/admin/proyectos/${proyectoId}/desasignar-usuario/${usuarioId}`);
    return response.data;
  },

  /**
   * Obtener usuarios asignados a proyecto
   */
  obtenerUsuariosAsignados: async (proyectoId) => {
    const response = await api.get(`/admin/proyectos/${proyectoId}/usuarios`);
    return response.data;
  },

  /**
   * Obtener días laborables de proyecto
   */
  obtenerDiasLaborables: async (proyectoId) => {
    const response = await api.get(`/admin/proyectos/${proyectoId}/dias-laborables`);
    return response.data;
  },

  /**
   * Actualizar días laborables de proyecto
   */
  actualizarDiasLaborables: async (proyectoId, dias) => {
    const response = await api.put(`/admin/proyectos/${proyectoId}/dias-laborables`, { dias });
    return response.data;
  },

  /**
   * Obtener costos no laborables
   */
  obtenerCostosNoLaborables: async (proyectoId) => {
    const response = await api.get(`/admin/proyectos/${proyectoId}/costos-no-laborables`);
    return response.data;
  },

  /**
   * Actualizar costos no laborables
   */
  actualizarCostosNoLaborables: async (proyectoId, data) => {
    const response = await api.post(`/admin/proyectos/${proyectoId}/costos-no-laborables`, data);
    return response.data;
  },

  /**
   * Eliminar costo no laboral
   */
  eliminarCostoNoLaborable: async (costoId) => {
    const response = await api.delete(`/admin/proyectos/costos-no-laborables/${costoId}`);
    return response.data;
  },
};

export default { clientesService, proyectosService };
