import api from './api';
import type { Divisa, CreateDivisaInput, UpdateDivisaInput } from '@shared';

export const divisasService = {
  async findAll(): Promise<Divisa[]> {
    const response = await api.get<{ data: Divisa[] }>('admin/divisas');
    return response.data.data;
  },

  async findById(id: number): Promise<Divisa> {
    const response = await api.get<{ data: Divisa }>(`admin/divisas/${id}`);
    return response.data.data;
  },

  async create(data: CreateDivisaInput): Promise<Divisa> {
    const response = await api.post<{ data: Divisa }>('admin/divisas', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateDivisaInput): Promise<Divisa> {
    const response = await api.put<{ data: Divisa }>(`admin/divisas/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`admin/divisas/${id}`);
  },
};
