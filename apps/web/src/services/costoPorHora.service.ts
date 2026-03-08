import api from './api';
import type { CostoPorHoraWithRelations as CostoPorHora, CreateCostoPorHoraInput, UpdateCostoPorHoraInput } from '@shared';

export const costoPorHoraService = {
  async findAll(): Promise<CostoPorHora[]> {
    const response = await api.get<{ data: CostoPorHora[] }>('/admin/costo-por-hora');
    return response.data.data;
  },

  async findById(id: number): Promise<CostoPorHora> {
    const response = await api.get<{ data: CostoPorHora }>(`/admin/costo-por-hora/${id}`);
    return response.data.data;
  },

  async create(data: CreateCostoPorHoraInput): Promise<CostoPorHora> {
    const response = await api.post<{ data: CostoPorHora }>('/admin/costo-por-hora', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateCostoPorHoraInput): Promise<CostoPorHora> {
    const response = await api.put<{ data: CostoPorHora }>(`/admin/costo-por-hora/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/costo-por-hora/${id}`);
  },
};
