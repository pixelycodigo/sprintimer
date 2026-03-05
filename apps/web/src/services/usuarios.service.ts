import api from './api';
import { User } from '../stores/auth.store';

export interface Usuario {
  id: number;
  nombre_completo: string;
  usuario: string;
  email: string;
  rol: string;
  rol_id: number;
  avatar?: string;
  email_verificado: boolean;
  activo: boolean;
  ultimo_login?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUsuarioData {
  nombre_completo: string;
  usuario: string;
  email: string;
  password: string;
  rol_id: number;
}

export interface UpdateUsuarioData {
  nombre_completo?: string;
  email?: string;
  activo?: boolean;
}

export interface ChangePasswordData {
  password: string;
}

export const usuariosService = {
  async findAll(): Promise<Usuario[]> {
    const response = await api.get<{ data: Usuario[] }>('/super-admin/usuarios');
    return response.data.data;
  },

  async findById(id: number): Promise<Usuario> {
    const response = await api.get<{ data: Usuario }>(`/super-admin/usuarios/${id}`);
    return response.data.data;
  },

  async create(data: CreateUsuarioData): Promise<Usuario> {
    const response = await api.post<{ data: Usuario }>('/super-admin/usuarios', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateUsuarioData): Promise<Usuario> {
    const response = await api.put<{ data: Usuario }>(`/super-admin/usuarios/${id}`, data);
    return response.data.data;
  },

  async changePassword(id: number, data: ChangePasswordData): Promise<void> {
    await api.put(`/super-admin/usuarios/${id}/password`, data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/super-admin/usuarios/${id}`);
  },
};
