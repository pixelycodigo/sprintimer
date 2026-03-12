import api from './api';
import type { ProyectoWithRelations as Proyecto, CreateProyectoInput, UpdateProyectoInput } from '@shared';

export const proyectosService = {
  async findAll(): Promise<Proyecto[]> {
    const response = await api.get<{ data: Proyecto[] }>('admin/proyectos');
    return response.data.data;
  },

  async findById(id: number): Promise<Proyecto> {
    const response = await api.get<{ data: Proyecto }>(`admin/proyectos/${id}`);
    return response.data.data;
  },

  async create(data: CreateProyectoInput): Promise<Proyecto> {
    const response = await api.post<{ data: Proyecto }>('admin/proyectos', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateProyectoInput): Promise<Proyecto> {
    const response = await api.put<{ data: Proyecto }>(`admin/proyectos/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`admin/proyectos/${id}`);
  },

  async getActividades(id: number): Promise<any[]> {
    const response = await api.get<{ data: any[] }>(`admin/proyectos/${id}/actividades`);
    return response.data.data;
  },
};
