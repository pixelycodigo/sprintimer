import { costoPorHoraRepository } from '../repositories/costoPorHora.repository.js';
import { CostoPorHoraCreate, CostoPorHoraUpdate, CostoPorHoraWithDetails } from '../models/CostoPorHora.js';

export class CostoPorHoraService {
  async findAll(): Promise<CostoPorHoraWithDetails[]> {
    return costoPorHoraRepository.findAll();
  }

  async findById(id: number): Promise<CostoPorHoraWithDetails | null> {
    const costo = await costoPorHoraRepository.findById(id);

    if (!costo) {
      throw new Error('Costo por hora no encontrado');
    }

    return costo;
  }

  async create(data: CostoPorHoraCreate): Promise<CostoPorHoraWithDetails> {
    const id = await costoPorHoraRepository.create(data);
    const costo = await costoPorHoraRepository.findById(id);

    if (!costo) {
      throw new Error('Error al crear el costo por hora');
    }

    return costo;
  }

  async update(id: number, data: CostoPorHoraUpdate): Promise<CostoPorHoraWithDetails> {
    const costo = await this.findById(id);

    if (!costo) {
      throw new Error('Costo por hora no encontrado');
    }

    const updated = await costoPorHoraRepository.update(id, data);

    if (!updated) {
      throw new Error('Error al actualizar el costo por hora');
    }

    return costoPorHoraRepository.findById(id) as Promise<CostoPorHoraWithDetails>;
  }

  async delete(id: number): Promise<void> {
    const costo = await this.findById(id);

    if (!costo) {
      throw new Error('Costo por hora no encontrado');
    }

    const deleted = await costoPorHoraRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar el costo por hora');
    }
  }

  async softDelete(id: number): Promise<void> {
    const costo = await this.findById(id);

    if (!costo) {
      throw new Error('Costo por hora no encontrado');
    }

    const updated = await costoPorHoraRepository.softDelete(id);

    if (!updated) {
      throw new Error('Error al eliminar el costo por hora');
    }
  }
}

export const costoPorHoraService = new CostoPorHoraService();
