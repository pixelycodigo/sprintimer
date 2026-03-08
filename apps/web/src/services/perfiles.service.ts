import api from './api';
import type { Perfil, CreatePerfilInput, UpdatePerfilInput } from '@shared';

export const perfilesService = {
  async findAll(): Promise<Perfil[]> {
    const response = await api.get<{ data: Perfil[] }>('/admin/perfiles');
    return response.data.data;
  },

  async findById(id: number): Promise<Perfil> {
    const response = await api.get<{ data: Perfil }>(`/admin/perfiles/${id}`);
    return response.data.data;
  },

  async create(data: CreatePerfilInput): Promise<Perfil> {
    const response = await api.post<{ data: Perfil }>('/admin/perfiles', data);
    return response.data.data;
  },

  async update(id: number, data: UpdatePerfilInput): Promise<Perfil> {
    const response = await api.put<{ data: Perfil }>(`/admin/perfiles/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/perfiles/${id}`);
  },
};
