import api from './api';

export const perfilesTeamService = {
  /**
   * Listar perfiles del equipo
   */
  listar: async (params = {}) => {
    const response = await api.get('/admin/perfiles-team', { params });
    return response.data;
  },

  /**
   * Obtener perfil por ID
   */
  obtener: async (id) => {
    const response = await api.get(`/admin/perfiles-team/${id}`);
    return response.data;
  },

  /**
   * Crear perfil
   */
  crear: async (data) => {
    const response = await api.post('/admin/perfiles-team', data);
    return response.data;
  },

  /**
   * Actualizar perfil
   */
  actualizar: async (id, data) => {
    const response = await api.put(`/admin/perfiles-team/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar perfil (soft delete)
   */
  eliminar: async (id) => {
    const response = await api.delete(`/admin/perfiles-team/${id}`);
    return response.data;
  },
};

export const teamProjectsService = {
  /**
   * Listar asignaciones
   */
  listarAsignaciones: async (params = {}) => {
    const response = await api.get('/admin/team-projects', { params });
    return response.data;
  },

  /**
   * Asignar miembro a proyecto
   */
  asignarMiembro: async (data) => {
    const response = await api.post('/admin/team-projects', data);
    return response.data;
  },

  /**
   * Actualizar asignación
   */
  actualizarAsignacion: async (usuarioId, proyectoId, data) => {
    const response = await api.put(`/admin/team-projects/${usuarioId}/${proyectoId}`, data);
    return response.data;
  },

  /**
   * Desasignar miembro
   */
  desasignarMiembro: async (usuarioId, proyectoId) => {
    const response = await api.delete(`/admin/team-projects/${usuarioId}/${proyectoId}`);
    return response.data;
  },

  /**
   * Obtener miembros asignados a un proyecto
   */
  obtenerMiembrosAsignados: async (proyectoId) => {
    const response = await api.get(`/admin/proyectos/${proyectoId}/miembros-asignados`);
    return response.data;
  },
};

export default { perfilesTeamService, teamProjectsService };
