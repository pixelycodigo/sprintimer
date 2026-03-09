import { db } from '../config/database.js';
import { Asignacion, AsignacionCreate, AsignacionWithDetails } from '../models/Asignacion.js';

export class AsignacionRepository {
  private tableName = 'actividades_integrantes';

  async findById(id: number): Promise<AsignacionWithDetails | null> {
    const asignacion = await db<AsignacionWithDetails>(this.tableName)
      .leftJoin('actividades', 'actividades_integrantes.actividad_id', 'actividades.id')
      .leftJoin('talents', 'actividades_integrantes.talent_id', 'talents.id')
      .leftJoin('perfiles', 'talents.perfil_id', 'perfiles.id')
      .leftJoin('seniorities', 'talents.seniority_id', 'seniorities.id')
      .select(
        'actividades_integrantes.*',
        'actividades.nombre as actividad_nombre',
        'talents.nombre_completo as talent_nombre',
        'talents.email as talent_email',
        'perfiles.nombre as perfil_nombre',
        'seniorities.nombre as seniority_nombre'
      )
      .where('actividades_integrantes.id', id)
      .first();

    return asignacion || null;
  }

  async findAll(): Promise<AsignacionWithDetails[]> {
    const asignaciones = await db<AsignacionWithDetails>(this.tableName)
      .leftJoin('actividades', 'actividades_integrantes.actividad_id', 'actividades.id')
      .leftJoin('talents', 'actividades_integrantes.talent_id', 'talents.id')
      .leftJoin('perfiles', 'talents.perfil_id', 'perfiles.id')
      .leftJoin('seniorities', 'talents.seniority_id', 'seniorities.id')
      .select(
        'actividades_integrantes.*',
        'actividades.nombre as actividad_nombre',
        'talents.nombre_completo as talent_nombre',
        'talents.email as talent_email',
        'perfiles.nombre as perfil_nombre',
        'seniorities.nombre as seniority_nombre'
      )
      .orderBy('actividades_integrantes.fecha_asignacion', 'desc');

    return asignaciones;
  }

  async findByActividadId(actividadId: number): Promise<AsignacionWithDetails[]> {
    const asignaciones = await db<AsignacionWithDetails>(this.tableName)
      .leftJoin('talents', 'actividades_integrantes.talent_id', 'talents.id')
      .leftJoin('perfiles', 'talents.perfil_id', 'perfiles.id')
      .leftJoin('seniorities', 'talents.seniority_id', 'seniorities.id')
      .select(
        'actividades_integrantes.*',
        'talents.nombre_completo as talent_nombre',
        'talents.email as talent_email',
        'perfiles.nombre as perfil_nombre',
        'seniorities.nombre as seniority_nombre'
      )
      .where('actividades_integrantes.actividad_id', actividadId);

    return asignaciones;
  }

  async findByTalentId(talentId: number): Promise<Asignacion[]> {
    const asignaciones = await db<Asignacion>(this.tableName)
      .where('talent_id', talentId);

    return asignaciones;
  }

  async create(data: AsignacionCreate): Promise<number> {
    const [id] = await db<Asignacion>(this.tableName).insert(data);
    return id;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await db<Asignacion>(this.tableName)
      .where('id', id)
      .del();

    return deleted > 0;
  }

  async deleteByActividadAndTalent(actividadId: number, talentId: number): Promise<boolean> {
    const deleted = await db<Asignacion>(this.tableName)
      .where('actividad_id', actividadId)
      .andWhere('talent_id', talentId)
      .del();

    return deleted > 0;
  }

  async createBulk(asignaciones: AsignacionCreate[]): Promise<number> {
    const [result] = await db<Asignacion>(this.tableName).insert(asignaciones);
    return result;
  }

  async deleteBulk(actividadId: number, talentIds: number[]): Promise<boolean> {
    const deleted = await db<Asignacion>(this.tableName)
      .where('actividad_id', actividadId)
      .whereIn('talent_id', talentIds)
      .del();

    return deleted > 0;
  }
}

export const asignacionRepository = new AsignacionRepository();
