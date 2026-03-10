import { db } from '../config/database.js';

export interface TalentDashboardStats {
  total_actividades: number;
  actividades_asignadas: number;
  total_tareas: number;
  tareas_completadas: number;
  total_proyectos: number;
  horas_registradas: number;
  actividades: Array<{
    id: number;
    nombre: string;
    proyecto: string;
    horas_estimadas: number;
    estado: string;
  }>;
}

export class TalentDashboardService {
  async getStats(talentId: number): Promise<TalentDashboardStats> {
    // Total actividades asignadas
    const actividadesResult = await db('actividades_integrantes')
      .leftJoin('actividades', 'actividades_integrantes.actividad_id', 'actividades.id')
      .where('actividades_integrantes.talent_id', talentId)
      .where('actividades.activo', true)
      .count('actividades.id as total')
      .first();
    const actividades_asignadas = Number(actividadesResult?.total || 0);

    // Total actividades
    const total_actividades = actividades_asignadas;

    // Total proyectos (únicos)
    const proyectosResult = await db('actividades_integrantes')
      .leftJoin('actividades', 'actividades_integrantes.actividad_id', 'actividades.id')
      .where('actividades_integrantes.talent_id', talentId)
      .where('actividades.activo', true)
      .countDistinct('actividades.proyecto_id as total')
      .first();
    const total_proyectos = Number(proyectosResult?.total || 0);

    // Total tareas
    const tareasResult = await db('tareas')
      .where('talent_id', talentId)
      .count('id as total')
      .first();
    const total_tareas = Number(tareasResult?.total || 0);

    // Tareas completadas
    const tareasCompletadasResult = await db('tareas')
      .where('talent_id', talentId)
      .where('completado', true)
      .count('id as total')
      .first();
    const tareas_completadas = Number(tareasCompletadasResult?.total || 0);

    // Total horas registradas
    const horasResult = await db('tareas')
      .where('talent_id', talentId)
      .sum('horas_registradas as total')
      .first();
    const horas_registradas = Number(horasResult?.total || 0);

    // Actividades asignadas con detalles
    const actividades = await db('actividades_integrantes')
      .leftJoin('actividades', 'actividades_integrantes.actividad_id', 'actividades.id')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .where('actividades_integrantes.talent_id', talentId)
      .where('actividades.activo', true)
      .select(
        'actividades.id',
        'actividades.nombre',
        'proyectos.nombre as proyecto',
        'actividades.horas_estimadas',
        db.raw("CASE WHEN actividades.activo THEN 'activo' ELSE 'inactivo' END as estado")
      )
      .orderBy('actividades.created_at', 'desc')
      .limit(10);

    return {
      total_actividades,
      actividades_asignadas,
      total_tareas,
      tareas_completadas,
      total_proyectos,
      horas_registradas,
      actividades: actividades.map((r: any) => ({
        id: r.id,
        nombre: r.nombre,
        proyecto: r.proyecto || 'Sin proyecto',
        horas_estimadas: Number(r.horas_estimadas),
        estado: r.estado,
      })),
    };
  }

  async getProyectos(talentId: number) {
    // Obtener proyectos únicos donde el talent está asignado
    const proyectos = await db('actividades_integrantes')
      .leftJoin('actividades', 'actividades_integrantes.actividad_id', 'actividades.id')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .leftJoin('clientes', 'proyectos.cliente_id', 'clientes.id')
      .where('actividades_integrantes.talent_id', talentId)
      .where('proyectos.activo', true)
      .select(
        'proyectos.id',
        'proyectos.nombre',
        'proyectos.descripcion',
        'proyectos.modalidad',
        'clientes.nombre_cliente as cliente'
      )
      .groupBy('proyectos.id', 'proyectos.nombre', 'proyectos.descripcion', 'proyectos.modalidad', 'clientes.nombre_cliente')
      .orderBy('proyectos.created_at', 'desc');

    return proyectos.map((r: any) => ({
      id: r.id,
      nombre: r.nombre,
      descripcion: r.descripcion || '',
      modalidad: r.modalidad || 'ad-hoc',
      cliente: r.cliente || 'Sin cliente',
    }));
  }

  async getTareas(talentId: number) {
    // Obtener tareas EXCEPTO las que están en la tabla eliminados
    const tareas = await db('tareas')
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .where('tareas.talent_id', talentId)
      .whereNotIn('tareas.id', function() {
        this.select('item_id')
          .from('eliminados')
          .where('item_tipo', 'tarea');
      })
      .select(
        'tareas.id',
        'tareas.nombre',
        'tareas.descripcion',
        'tareas.horas_registradas',
        'tareas.completado',
        'actividades.nombre as actividad',
        'actividades.id as actividad_id',
        'proyectos.nombre as proyecto'
      )
      .orderBy('tareas.created_at', 'desc');

    return tareas.map((r: any) => ({
      id: r.id,
      nombre: r.nombre,
      descripcion: r.descripcion || '',
      horas_registradas: Number(r.horas_registradas) || 0,
      completado: Boolean(r.completado),
      actividad: r.actividad || 'Sin actividad',
      actividad_id: r.actividad_id,
      proyecto: r.proyecto || 'Sin proyecto',
    }));
  }

  async getActividades(talentId: number) {
    const actividades = await db('actividades_integrantes')
      .leftJoin('actividades', 'actividades_integrantes.actividad_id', 'actividades.id')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .where('actividades_integrantes.talent_id', talentId)
      .where('actividades.activo', true)
      .select(
        'actividades.id',
        'actividades.nombre',
        'proyectos.nombre as proyecto',
        'actividades.horas_estimadas',
        db.raw("CASE WHEN actividades.activo THEN 'activo' ELSE 'inactivo' END as estado")
      )
      .orderBy('actividades.nombre', 'asc');

    return actividades.map((r: any) => ({
      id: r.id,
      nombre: r.nombre,
      proyecto: r.proyecto || 'Sin proyecto',
      horas_estimadas: Number(r.horas_estimadas) || 0,
      estado: r.estado,
    }));
  }

  async getActividadesByProyecto(talentId: number, proyectoId: number) {
    const actividades = await db('actividades_integrantes')
      .leftJoin('actividades', 'actividades_integrantes.actividad_id', 'actividades.id')
      .where('actividades_integrantes.talent_id', talentId)
      .where('actividades.proyecto_id', proyectoId)
      .where('actividades.activo', true)
      .select(
        'actividades.id',
        'actividades.nombre',
        'actividades.horas_estimadas',
        db.raw("CASE WHEN actividades.activo THEN 'activo' ELSE 'inactivo' END as estado")
      )
      .orderBy('actividades.nombre', 'asc');

    return actividades.map((r: any) => ({
      id: r.id,
      nombre: r.nombre,
      horas_estimadas: Number(r.horas_estimadas) || 0,
      estado: r.estado,
    }));
  }
}

export const talentDashboardService = new TalentDashboardService();
