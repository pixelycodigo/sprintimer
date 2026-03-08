import api from './api';
import type { ActividadWithRelations as Actividad, CreateActividadInput, UpdateActividadInput } from '@shared';

export const actividadesService = {
  async findAll(): Promise<Actividad[]> {
    const response = await api.get<{ data: Actividad[] }>('/admin/actividades');
    return response.data.data;
  },

  async findById(id: number): Promise<Actividad> {
    const response = await api.get<{ data: Actividad }>(`/admin/actividades/${id}`);
    return response.data.data;
  },

  async create(data: CreateActividadInput): Promise<Actividad> {
    const response = await api.post<{ data: Actividad }>('/admin/actividades', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateActividadInput): Promise<Actividad> {
    const response = await api.put<{ data: Actividad }>(`/admin/actividades/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/actividades/${id}`);
  },

  async duplicate(id: number): Promise<Actividad> {
    const response = await api.post<{ data: Actividad }>(`/admin/actividades/${id}/duplicar`);
    return response.data.data;
  },
};
