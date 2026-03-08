import api from './api';
import { User } from '../stores/auth.store';

export interface LoginData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegistroData {
  nombre: string;
  usuario: string;
  email: string;
  password: string;
  terminos: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/login', data);
    return response.data.data;
  },

  async registro(data: RegistroData): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/registro', data);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const response = await api.get<{ data: User }>('/auth/me');
    return response.data.data;
  },

  async updateProfile(data: { nombre?: string; email?: string }): Promise<User> {
    const response = await api.put<{ data: User }>('/auth/profile', data);
    return response.data.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  },
};
