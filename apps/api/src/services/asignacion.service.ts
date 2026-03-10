import { asignacionRepository } from '../repositories/asignacion.repository.js';
import { AsignacionCreate, AsignacionUpdate, AsignacionWithDetails } from '../models/Asignacion.js';
import { eliminadoService } from './eliminado.service.js';

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

  async update(id: number, data: AsignacionUpdate): Promise<AsignacionWithDetails> {
    const asignacion = await this.findById(id);

    if (!asignacion) {
      throw new Error('Asignación no encontrada');
    }

    const updated = await asignacionRepository.update(id, data);

    if (!updated) {
      throw new Error('Error al actualizar la asignación');
    }

    return asignacionRepository.findById(id) as Promise<AsignacionWithDetails>;
  }

  async softDelete(id: number, eliminadoPor?: number): Promise<void> {
    const asignacion = await this.findById(id);

    if (!asignacion) {
      throw new Error('Asignación no encontrada');
    }

    const updated = await asignacionRepository.softDelete(id);

    if (!updated) {
      throw new Error('Error al eliminar la asignación');
    }

    // Registrar en la tabla eliminados
    const fechaBorradoPermanente = new Date();
    fechaBorradoPermanente.setDate(fechaBorradoPermanente.getDate() + 30);

    await eliminadoService.create({
      item_id: id,
      item_tipo: 'asignacion',
      eliminado_por: eliminadoPor || 1,
      fecha_borrado_permanente: fechaBorradoPermanente,
      datos: {
        actividad_id: asignacion.actividad_id,
        talent_id: asignacion.talent_id,
        actividad_nombre: asignacion.actividad_nombre,
        talent_nombre: asignacion.talent_nombre,
        fecha_asignacion: asignacion.fecha_asignacion,
      },
    });
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
