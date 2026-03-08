import { eliminadoRepository } from '../repositories/eliminado.repository.js';
import { Eliminado, EliminadoCreate } from '../models/Eliminado.js';

export class EliminadoService {
  async findAll(): Promise<Eliminado[]> {
    return eliminadoRepository.findAll();
  }

  async findById(id: number): Promise<Eliminado | null> {
    const eliminado = await eliminadoRepository.findById(id);

    if (!eliminado) {
      throw new Error('Elemento eliminado no encontrado');
    }

    return eliminado;
  }

  async findByTipo(itemTipo: string): Promise<Eliminado[]> {
    return eliminadoRepository.findByTipo(itemTipo);
  }

  async create(data: EliminadoCreate): Promise<Eliminado> {
    const id = await eliminadoRepository.create(data);
    const eliminado = await eliminadoRepository.findById(id);

    if (!eliminado) {
      throw new Error('Error al registrar el elemento eliminado');
    }

    return eliminado;
  }

  async delete(id: number): Promise<void> {
    const eliminado = await this.findById(id);

    if (!eliminado) {
      throw new Error('Elemento eliminado no encontrado');
    }

    const deleted = await eliminadoRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar permanentemente');
    }
  }

  async restore(id: number): Promise<Eliminado | null> {
    const eliminado = await this.findById(id);
    await eliminadoRepository.restore(id);
    return eliminado;
  }

  async deleteExpired(): Promise<number> {
    return eliminadoRepository.deleteExpired();
  }
}

export const eliminadoService = new EliminadoService();
