import { clienteRepository } from '../repositories/cliente.repository.js';
import { Cliente, ClienteCreate, ClienteUpdate } from '../models/Cliente.js';

export class ClienteService {
  async findAll(): Promise<Cliente[]> {
    return clienteRepository.findAll();
  }

  async findAllActivos(): Promise<Cliente[]> {
    return clienteRepository.findAllActivos();
  }

  async findById(id: number): Promise<Cliente | null> {
    const cliente = await clienteRepository.findById(id);

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    return cliente;
  }

  async create(data: ClienteCreate): Promise<Cliente> {
    // Verificar si el email ya existe
    if (await clienteRepository.emailExists(data.email)) {
      throw new Error('Ya existe un cliente con ese email');
    }

    const id = await clienteRepository.create(data);
    const cliente = await clienteRepository.findById(id);

    if (!cliente) {
      throw new Error('Error al crear el cliente');
    }

    return cliente;
  }

  async update(id: number, data: ClienteUpdate): Promise<Cliente> {
    const cliente = await this.findById(id);

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Verificar email único si se está actualizando
    if (data.email && data.email !== cliente.email) {
      if (await clienteRepository.emailExists(data.email, id)) {
        throw new Error('Ya existe un cliente con ese email');
      }
    }

    const updated = await clienteRepository.update(id, data);

    if (!updated) {
      throw new Error('Error al actualizar el cliente');
    }

    return clienteRepository.findById(id) as Promise<Cliente>;
  }

  async delete(id: number): Promise<void> {
    const cliente = await this.findById(id);

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    const deleted = await clienteRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar el cliente');
    }
  }

  async softDelete(id: number): Promise<void> {
    const cliente = await this.findById(id);

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    const updated = await clienteRepository.softDelete(id);

    if (!updated) {
      throw new Error('Error al eliminar el cliente');
    }
  }

  async search(term: string): Promise<Cliente[]> {
    return clienteRepository.search(term);
  }
}

export const clienteService = new ClienteService();
