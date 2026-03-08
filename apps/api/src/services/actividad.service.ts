import { actividadRepository } from '../repositories/actividad.repository.js';
import { ActividadCreate, ActividadUpdate, ActividadWithDetails } from '../models/Actividad.js';

export class ActividadService {
  async findAll(): Promise<ActividadWithDetails[]> {
    return actividadRepository.findAll();
  }

  async findById(id: number): Promise<ActividadWithDetails | null> {
    const actividad = await actividadRepository.findById(id);

    if (!actividad) {
      throw new Error('Actividad no encontrada');
    }

    return actividad;
  }

  async findByProyectoId(proyectoId: number): Promise<ActividadWithDetails[]> {
    return actividadRepository.findByProyectoId(proyectoId) as Promise<ActividadWithDetails[]>;
  }

  async create(data: ActividadCreate): Promise<ActividadWithDetails> {
    const id = await actividadRepository.create(data);
    const actividad = await actividadRepository.findById(id);

    if (!actividad) {
      throw new Error('Error al crear la actividad');
    }

    return actividad;
  }

  async update(id: number, data: ActividadUpdate): Promise<ActividadWithDetails> {
    const actividad = await this.findById(id);

    if (!actividad) {
      throw new Error('Actividad no encontrada');
    }

    const updated = await actividadRepository.update(id, data);

    if (!updated) {
      throw new Error('Error al actualizar la actividad');
    }

    return actividadRepository.findById(id) as Promise<ActividadWithDetails>;
  }

  async delete(id: number): Promise<void> {
    const actividad = await this.findById(id);

    if (!actividad) {
      throw new Error('Actividad no encontrada');
    }

    const deleted = await actividadRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar la actividad');
    }
  }

  async softDelete(id: number): Promise<void> {
    const actividad = await this.findById(id);

    if (!actividad) {
      throw new Error('Actividad no encontrada');
    }

    const updated = await actividadRepository.softDelete(id);

    if (!updated) {
      throw new Error('Error al eliminar la actividad');
    }
  }

  async search(term: string): Promise<ActividadWithDetails[]> {
    return actividadRepository.search(term) as Promise<ActividadWithDetails[]>;
  }
}

export const actividadService = new ActividadService();
