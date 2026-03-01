import api from './api';

export const estadisticasService = {
  /**
   * ESTADÍSTICAS DE ADMINISTRADOR
   */

  /**
   * Obtener resumen general
   */
  obtenerResumenAdmin: async (params = {}) => {
    const response = await api.get('/admin/estadisticas/admin/resumen', { params });
    return response.data;
  },

  /**
   * Horas por usuario (gráfico de barras)
   */
  horasPorUsuario: async (params = {}) => {
    const response = await api.get('/admin/estadisticas/admin/horas-por-usuario', { params });
    return response.data;
  },

  /**
   * Horas por proyecto (gráfico de pastel)
   */
  horasPorProyecto: async (params = {}) => {
    const response = await api.get('/admin/estadisticas/admin/horas-por-proyecto', { params });
    return response.data;
  },

  /**
   * Progreso de sprints (estimado vs real)
   */
  progresoSprints: async (params = {}) => {
    const response = await api.get('/admin/estadisticas/admin/progreso-sprints', { params });
    return response.data;
  },

  /**
   * Tareas completadas por usuario
   */
  tareasCompletadas: async (params = {}) => {
    const response = await api.get('/admin/estadisticas/admin/tareas-completadas', { params });
    return response.data;
  },

  /**
   * Horas por día (últimos 30 días)
   */
  horasPorDia: async (params = {}) => {
    const response = await api.get('/admin/estadisticas/admin/horas-por-dia', { params });
    return response.data;
  },

  /**
   * ESTADÍSTICAS DE USUARIO
   */

  /**
   * Obtener resumen personal
   */
  obtenerResumenUsuario: async (params = {}) => {
    const response = await api.get('/usuario/estadisticas/usuario/resumen', { params });
    return response.data;
  },

  /**
   * Horas semanales (últimas 4 semanas)
   */
  horasSemanales: async (params = {}) => {
    const response = await api.get('/usuario/estadisticas/usuario/horas-semanales', { params });
    return response.data;
  },

  /**
   * Historial de tareas
   */
  historialTareas: async (params = {}) => {
    const response = await api.get('/usuario/estadisticas/usuario/historial-tareas', { params });
    return response.data;
  },

  /**
   * Progreso por actividad
   */
  progresoActividades: async (params = {}) => {
    const response = await api.get('/usuario/estadisticas/usuario/progreso-actividades', { params });
    return response.data;
  },

  /**
   * Horas por mes (últimos 12 meses)
   */
  horasPorMes: async (params = {}) => {
    const response = await api.get('/usuario/estadisticas/usuario/horas-por-mes', { params });
    return response.data;
  },

  /**
   * PLANIFICACIÓN
   */

  /**
   * Planificación diaria (horas recomendadas)
   */
  planificacionDiaria: async () => {
    const response = await api.get('/usuario/estadisticas/usuario/planificacion-diaria');
    return response.data;
  },

  /**
   * Calendario semanal de horas
   */
  calendarioSemanal: async (params = {}) => {
    const response = await api.get('/usuario/estadisticas/usuario/calendario-semanal', { params });
    return response.data;
  },

  /**
   * Distribución de horas por proyecto
   */
  distribucionHoras: async (params = {}) => {
    const response = await api.get('/usuario/estadisticas/usuario/distribucion-horas', { params });
    return response.data;
  },
};

export default estadisticasService;
