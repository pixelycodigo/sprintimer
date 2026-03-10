import { seniorityRepository } from '../repositories/seniority.repository.js';
import { Seniority, SeniorityCreate, SeniorityUpdate } from '../models/Seniority.js';
import { eliminadoService } from './eliminado.service.js';

export class SeniorityService {
  async findAll(): Promise<Seniority[]> {
    return seniorityRepository.findAll();
  }

  async findAllActivos(): Promise<Seniority[]> {
    return seniorityRepository.findAllActivos();
  }

  async findById(id: number): Promise<Seniority | null> {
    const seniority = await seniorityRepository.findById(id);

    if (!seniority) {
      throw new Error('Seniority no encontrado');
    }

    return seniority;
  }

  async create(data: SeniorityCreate): Promise<Seniority> {
    // Verificar si el nombre ya existe
    if (await seniorityRepository.nombreExists(data.nombre)) {
      throw new Error('Ya existe un seniority con ese nombre');
    }

    const id = await seniorityRepository.create(data);
    const seniority = await seniorityRepository.findById(id);

    if (!seniority) {
      throw new Error('Error al crear el seniority');
    }

    return seniority;
  }

  async update(id: number, data: SeniorityUpdate): Promise<Seniority> {
    const seniority = await this.findById(id);

    if (!seniority) {
      throw new Error('Seniority no encontrado');
    }

    // Verificar nombre único si se está actualizando
    if (data.nombre && data.nombre !== seniority.nombre) {
      if (await seniorityRepository.nombreExists(data.nombre, id)) {
        throw new Error('Ya existe un seniority con ese nombre');
      }
    }

    const updated = await seniorityRepository.update(id, data);

    if (!updated) {
      throw new Error('Error al actualizar el seniority');
    }

    return seniorityRepository.findById(id) as Promise<Seniority>;
  }

  async delete(id: number): Promise<void> {
    const seniority = await this.findById(id);

    if (!seniority) {
      throw new Error('Seniority no encontrado');
    }

    const deleted = await seniorityRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar el seniority');
    }
  }

  async softDelete(id: number, eliminadoPor?: number): Promise<void> {
    const seniority = await this.findById(id);

    if (!seniority) {
      throw new Error('Seniority no encontrado');
    }

    const updated = await seniorityRepository.softDelete(id);

    if (!updated) {
      throw new Error('Error al eliminar el seniority');
    }

    // Registrar en la tabla eliminados
    const fechaBorradoPermanente = new Date();
    fechaBorradoPermanente.setDate(fechaBorradoPermanente.getDate() + 30);

    await eliminadoService.create({
      item_id: id,
      item_tipo: 'seniority',
      eliminado_por: eliminadoPor || 1,
      fecha_borrado_permanente: fechaBorradoPermanente,
      datos: {
        nombre: seniority.nombre,
        nivel_orden: seniority.nivel_orden,
      },
    });
  }
}

export const seniorityService = new SeniorityService();
