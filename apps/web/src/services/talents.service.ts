import api from './api';
import type { TalentWithRelations as Talent, CreateTalentInput, UpdateTalentInput } from '@shared';

export const talentsService = {
  async findAll(): Promise<Talent[]> {
    const response = await api.get<{ data: Talent[] }>('/admin/talents');
    return response.data.data;
  },

  async findById(id: number): Promise<Talent> {
    const response = await api.get<{ data: Talent }>(`/admin/talents/${id}`);
    return response.data.data;
  },

  async create(data: CreateTalentInput): Promise<Talent> {
    const response = await api.post<{ data: Talent }>('/admin/talents', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateTalentInput): Promise<Talent> {
    const response = await api.put<{ data: Talent }>(`/admin/talents/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/talents/${id}`);
  },

  async search(term: string): Promise<Talent[]> {
    const response = await api.get<{ data: Talent[] }>(`/admin/talents?search=${encodeURIComponent(term)}`);
    return response.data.data;
  },

  async resendVerificationEmail(id: number): Promise<void> {
    await api.post(`/admin/talents/${id}/reenviar-email`);
  },

  async changePassword(id: number, passwordData: { password: string }): Promise<void> {
    await api.put(`/admin/talents/${id}/password`, passwordData);
  },
};
