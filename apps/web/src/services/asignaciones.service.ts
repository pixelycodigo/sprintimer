import api from './api';
import type { AsignacionWithRelations as Asignacion, CreateAsignacionInput, UpdateAsignacionInput } from '@shared';

export const asignacionesService = {
  async findAll(): Promise<Asignacion[]> {
    const response = await api.get<{ data: Asignacion[] }>('admin/asignaciones');
    return response.data.data;
  },

  async findById(id: number): Promise<Asignacion> {
    const response = await api.get<{ data: Asignacion }>(`admin/asignaciones/${id}`);
    return response.data.data;
  },

  async create(data: CreateAsignacionInput): Promise<Asignacion> {
    const response = await api.post<{ data: Asignacion }>('admin/asignaciones', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateAsignacionInput): Promise<Asignacion> {
    const response = await api.put<{ data: Asignacion }>(`admin/asignaciones/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`admin/asignaciones/${id}`);
  },

  async bulk(assignments: { actividad_id: number; talent_id: number }[]): Promise<void> {
    await api.post('admin/asignaciones/bulk', assignments);
  },

  async bulkDelete(ids: number[]): Promise<void> {
    await api.delete('admin/asignaciones/bulk', { data: { ids } });
  },
};
