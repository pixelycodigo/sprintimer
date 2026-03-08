import { asignacionRepository } from '../repositories/asignacion.repository.js';
import { AsignacionCreate, AsignacionWithDetails } from '../models/Asignacion.js';

export class AsignacionService {
  async findAll(): Promise<AsignacionWithDetails[]> {
    return asignacionRepository.findAll();
  }

  async findById(id: number): Promise<AsignacionWithDetails | null> {
    const asignacion = await asignacionRepository.findById(id);

    if (!asignacion) {
      throw new Error('Asignación no encontrada');
    }

    return asignacion;
  }

  async findByActividadId(actividadId: number): Promise<AsignacionWithDetails[]> {
    return asignacionRepository.findByActividadId(actividadId);
  }

  async findByTalentId(talentId: number): Promise<AsignacionWithDetails[]> {
    return asignacionRepository.findByTalentId(talentId) as Promise<AsignacionWithDetails[]>;
  }

  async create(data: AsignacionCreate): Promise<AsignacionWithDetails> {
    const id = await asignacionRepository.create(data);
    const asignacion = await asignacionRepository.findById(id);

    if (!asignacion) {
      throw new Error('Error al crear la asignación');
    }

    return asignacion;
  }

  async delete(id: number): Promise<void> {
    const asignacion = await this.findById(id);

    if (!asignacion) {
      throw new Error('Asignación no encontrada');
    }

    const deleted = await asignacionRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar la asignación');
    }
  }

  async deleteByActividadAndTalent(actividadId: number, talentId: number): Promise<void> {
    const deleted = await asignacionRepository.deleteByActividadAndTalent(actividadId, talentId);

    if (!deleted) {
      throw new Error('Asignación no encontrada');
    }
  }

  async createBulk(actividadId: number, talentIds: number[]): Promise<AsignacionWithDetails[]> {
    const asignacionesData: AsignacionCreate[] = talentIds.map((talentId) => ({
      actividad_id: actividadId,
      talent_id: talentId,
    }));

    await asignacionRepository.createBulk(asignacionesData);
    return this.findByActividadId(actividadId);
  }

  async deleteBulk(actividadId: number, talentIds: number[]): Promise<void> {
    const deleted = await asignacionRepository.deleteBulk(actividadId, talentIds);

    if (!deleted) {
      throw new Error('No se eliminaron las asignaciones');
    }
  }
}

export const asignacionService = new AsignacionService();
