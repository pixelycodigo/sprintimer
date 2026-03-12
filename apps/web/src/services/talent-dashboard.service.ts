import api from './api';

export const talentDashboardService = {
  async getStats() {
    const response = await api.get('talent/dashboard');
    return response.data.data;
  },

  async getProyectos() {
    const response = await api.get('talent/dashboard/proyectos');
    return response.data.data;
  },

  async getTareas() {
    const response = await api.get('talent/dashboard/tareas');
    return response.data.data;
  },

  async getActividades() {
    const response = await api.get('talent/dashboard/actividades');
    return response.data.data;
  },

  async getActividadesByProyecto(proyectoId: number) {
    const response = await api.get(`talent/dashboard/proyectos/${proyectoId}/actividades`);
    return response.data.data;
  },

  async toggleTarea(id: number, completado: boolean) {
    const response = await api.patch(`talent/dashboard/tareas/${id}/toggle`, { completado });
    return response.data;
  },

  async createTarea(data: { actividad_id: number; nombre: string; descripcion?: string; horas_registradas?: number }) {
    const response = await api.post('talent/dashboard/tareas', data);
    return response.data.data;
  },

  async updateTarea(id: number, data: { nombre?: string; descripcion?: string; horas_registradas?: number; completado?: boolean }) {
    const response = await api.put(`talent/dashboard/tareas/${id}`, data);
    return response.data;
  },

  async deleteTarea(id: number) {
    const response = await api.delete(`talent/dashboard/tareas/${id}`);
    return response.data;
  },

  async getTareasEliminadas() {
    const response = await api.get('talent/dashboard/tareas/eliminadas');
    return response.data.data;
  },
};
