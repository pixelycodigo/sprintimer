import api from './api';
import { queryKeys } from '../utils/queryKeys';
import type { Cliente, CreateClienteInput, UpdateClienteInput } from '@shared';

export const clientesService = {
  // Query keys
  queryKeys: {
    all: queryKeys.clientes.all,
    list: queryKeys.clientes.list,
    byId: queryKeys.clientes.byId,
  },

  async findAll(): Promise<Cliente[]> {
    const response = await api.get<{ data: Cliente[] }>('admin/clientes');
    return response.data.data;
  },

  async findById(id: number): Promise<Cliente> {
    const response = await api.get<{ data: Cliente }>(`admin/clientes/${id}`);
    return response.data.data;
  },

  async create(data: CreateClienteInput): Promise<Cliente> {
    const response = await api.post<{ data: Cliente }>('admin/clientes', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateClienteInput): Promise<Cliente> {
    const response = await api.put<{ data: Cliente }>(`admin/clientes/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`admin/clientes/${id}`);
  },

  async search(term: string): Promise<Cliente[]> {
    const response = await api.get<{ data: Cliente[] }>(`admin/clientes?search=${encodeURIComponent(term)}`);
    return response.data.data;
  },
};
