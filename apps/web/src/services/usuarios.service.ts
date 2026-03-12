import api from './api';
import { queryKeys } from '../utils/queryKeys';
import type { Usuario, CreateUsuarioInput as CreateUsuarioData, UpdateUsuarioInput as UpdateUsuarioData } from '@shared';

export interface ChangePasswordData {
  password: string;
}

export const usuariosService = {
  // Query keys
  queryKeys: {
    all: queryKeys.usuarios.all,
    list: queryKeys.usuarios.list,
    byId: queryKeys.usuarios.byId,
  },

  async findAll(): Promise<Usuario[]> {
    const response = await api.get<{ data: Usuario[] }>('super-admin/usuarios');
    return response.data.data;
  },

  async findById(id: number): Promise<Usuario> {
    const response = await api.get<{ data: Usuario }>(`super-admin/usuarios/${id}`);
    return response.data.data;
  },

  async create(data: CreateUsuarioData): Promise<Usuario> {
    const response = await api.post<{ data: Usuario }>('super-admin/usuarios', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateUsuarioData): Promise<Usuario> {
    const response = await api.put<{ data: Usuario }>(`super-admin/usuarios/${id}`, data);
    return response.data.data;
  },

  async changePassword(id: number, data: ChangePasswordData): Promise<void> {
    await api.put(`super-admin/usuarios/${id}/password`, data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`super-admin/usuarios/${id}`);
  },
};
