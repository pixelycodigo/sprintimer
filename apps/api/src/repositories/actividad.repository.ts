import { db } from '../config/database.js';
import { Actividad, ActividadCreate, ActividadUpdate, ActividadWithDetails } from '../models/Actividad.js';

export class ActividadRepository {
  private tableName = 'actividades';

  async findById(id: number): Promise<ActividadWithDetails | null> {
    const actividad = await db<ActividadWithDetails>(this.tableName)
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .leftJoin('sprints', 'actividades.sprint_id', 'sprints.id')
      .select(
        'actividades.*',
        'proyectos.nombre as proyecto_nombre',
        'sprints.nombre as sprint_nombre'
      )
      .where('actividades.id', id)
      .first();

    return actividad || null;
  }

  async findAll(): Promise<ActividadWithDetails[]> {
    const actividades = await db<ActividadWithDetails>(this.tableName)
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .leftJoin('sprints', 'actividades.sprint_id', 'sprints.id')
      .select(
        'actividades.*',
        'proyectos.nombre as proyecto_nombre',
        'sprints.nombre as sprint_nombre'
      )
      .orderBy('actividades.created_at', 'desc');

    return actividades;
  }

  async findByProyectoId(proyectoId: number): Promise<Actividad[]> {
    const actividades = await db<Actividad>(this.tableName)
      .where('proyecto_id', proyectoId)
      .orderBy('nombre', 'asc');

    return actividades;
  }

  async create(data: ActividadCreate): Promise<number> {
    const [id] = await db<Actividad>(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: ActividadUpdate): Promise<boolean> {
    const updated = await db<Actividad>(this.tableName)
      .where('id', id)
      .update({ ...data, updated_at: new Date() });

    return updated > 0;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await db<Actividad>(this.tableName)
      .where('id', id)
      .del();

    return deleted > 0;
  }

  async softDelete(id: number): Promise<boolean> {
    const updated = await db<Actividad>(this.tableName)
      .where('id', id)
      .update({
        activo: false,
        updated_at: new Date()
      });

    return updated > 0;
  }

  async search(term: string): Promise<Actividad[]> {
    const actividades = await db<Actividad>(this.tableName)
      .where((builder) => {
        builder
          .where('nombre', 'like', `%${term}%`)
          .orWhere('descripcion', 'like', `%${term}%`);
      })
      .orderBy('nombre', 'asc');

    return actividades;
  }
}

export const actividadRepository = new ActividadRepository();
