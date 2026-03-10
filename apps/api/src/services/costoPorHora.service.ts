import { costoPorHoraRepository } from '../repositories/costoPorHora.repository.js';
import { CostoPorHoraCreate, CostoPorHoraUpdate, CostoPorHoraWithDetails } from '../models/CostoPorHora.js';
import { eliminadoService } from './eliminado.service.js';

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

  async softDelete(id: number, eliminadoPor?: number): Promise<void> {
    const costo = await this.findById(id);

    if (!costo) {
      throw new Error('Costo por hora no encontrado');
    }

    const updated = await costoPorHoraRepository.softDelete(id);

    if (!updated) {
      throw new Error('Error al eliminar el costo por hora');
    }

    // Registrar en la tabla eliminados
    const fechaBorradoPermanente = new Date();
    fechaBorradoPermanente.setDate(fechaBorradoPermanente.getDate() + 30);

    await eliminadoService.create({
      item_id: id,
      item_tipo: 'costo_por_hora',
      eliminado_por: eliminadoPor || 1,
      fecha_borrado_permanente: fechaBorradoPermanente,
      datos: {
        tipo: costo.tipo,
        costo_hora: costo.costo_hora,
        concepto: costo.concepto,
        divisa_codigo: costo.divisa_codigo,
        perfil_nombre: costo.perfil_nombre,
        seniority_nombre: costo.seniority_nombre,
      },
    });
  }
}

export const costoPorHoraService = new CostoPorHoraService();
