import api from './api';
import type { Eliminado } from '@shared';

export const eliminadosService = {
  async findAll(): Promise<Eliminado[]> {
    const response = await api.get<{ data: Eliminado[] }>('/admin/eliminados');
    return response.data.data;
  },

  async findByTipo(tipo: string): Promise<Eliminado[]> {
    const response = await api.get<{ data: Eliminado[] }>(`/admin/eliminados?tipo=${encodeURIComponent(tipo)}`);
    return response.data.data;
  },

  async restore(id: number): Promise<void> {
    await api.post(`/admin/eliminados/${id}/restaurar`);
  },

  async deletePermanent(id: number): Promise<void> {
    await api.delete(`/admin/eliminados/${id}`);
  },

  async bulkRestore(ids: number[]): Promise<void> {
    await api.post('/admin/eliminados/bulk-restore', { ids });
  },

  async bulkDelete(ids: number[]): Promise<void> {
    await api.delete('/admin/eliminados/bulk', { data: { ids } });
  },
};
