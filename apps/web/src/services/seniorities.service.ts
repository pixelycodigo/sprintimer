import api from './api';
import type { Seniority, CreateSeniorityInput, UpdateSeniorityInput } from '@shared';

export const senioritiesService = {
  async findAll(): Promise<Seniority[]> {
    const response = await api.get<{ data: Seniority[] }>('admin/seniorities');
    return response.data.data;
  },

  async findById(id: number): Promise<Seniority> {
    const response = await api.get<{ data: Seniority }>(`admin/seniorities/${id}`);
    return response.data.data;
  },

  async create(data: CreateSeniorityInput): Promise<Seniority> {
    const response = await api.post<{ data: Seniority }>('admin/seniorities', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateSeniorityInput): Promise<Seniority> {
    const response = await api.put<{ data: Seniority }>(`admin/seniorities/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`admin/seniorities/${id}`);
  },
};
