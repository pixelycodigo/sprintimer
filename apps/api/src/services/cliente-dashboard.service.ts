import { db } from '../config/database.js';

export interface ClienteDashboardStats {
  total_proyectos: number;
  proyectos_activos: number;
  total_actividades: number;
  actividades_completadas: number;
  progreso_promedio: number;
  talents: number;
  proyectos: Array<{
    id: number;
    nombre: string;
    descripcion: string;
    modalidad: string;
    activo: boolean;
    progreso: number;
    actividades_count: number;
    talents_count: number;
  }>;
}

export class ClienteDashboardService {
  async getStats(clienteId: number): Promise<ClienteDashboardStats> {
    // Total proyectos
    const proyectosResult = await db('proyectos')
      .where('cliente_id', clienteId)
      .where('activo', true)
      .count('id as total')
      .first();
    const total_proyectos = Number(proyectosResult?.total || 0);

    // Proyectos activos
    const proyectos_activos = total_proyectos;

    // Total actividades
    const actividadesResult = await db('actividades')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .where('proyectos.cliente_id', clienteId)
      .where('actividades.activo', true)
      .count('actividades.id as total')
      .first();
    const total_actividades = Number(actividadesResult?.total || 0);

    // Actividades completadas (simulado)
    const actividades_completadas = 0;

    // Calcular progreso promedio y total de talents
    const proyectosConDatos = await db('proyectos')
      .leftJoin('actividades', 'proyectos.id', 'actividades.proyecto_id')
      .leftJoin('actividades_integrantes', 'actividades.id', 'actividades_integrantes.actividad_id')
      .where('proyectos.cliente_id', clienteId)
      .where('proyectos.activo', true)
      .select(
        'proyectos.id',
        'proyectos.nombre',
        'proyectos.descripcion',
        'proyectos.modalidad',
        'proyectos.activo',
        db.raw('COUNT(DISTINCT actividades.id) as actividades_count'),
        db.raw('COUNT(DISTINCT actividades_integrantes.talent_id) as talents_count')
      )
      .groupBy('proyectos.id', 'proyectos.nombre', 'proyectos.descripcion', 'proyectos.modalidad', 'proyectos.activo');

    // Calcular progreso (simplificado: 50% si tiene actividades)
    let progresoTotal = 0;
    const proyectos = proyectosConDatos.map((r: any) => {
      const progreso = r.actividades_count > 0 ? 50 : 0; // Simplificado
      progresoTotal += progreso;
      return {
        id: r.id,
        nombre: r.nombre,
        descripcion: r.descripcion || '',
        modalidad: r.modalidad || 'ad-hoc',
        activo: Boolean(r.activo),
        progreso,
        actividades_count: Number(r.actividades_count),
        talents_count: Number(r.talents_count),
      };
    });

    const progreso_promedio = proyectos.length > 0 ? Math.round(progresoTotal / proyectos.length) : 0;
    const talents = proyectos.reduce((sum, p) => sum + p.talents_count, 0);

    return {
      total_proyectos,
      proyectos_activos,
      total_actividades,
      actividades_completadas,
      progreso_promedio,
      talents,
      proyectos,
    };
  }

  async getProyectos(clienteId: number) {
    const proyectos = await db('proyectos')
      .where('cliente_id', clienteId)
      .where('proyectos.activo', true)
      .leftJoin('actividades', 'proyectos.id', 'actividades.proyecto_id')
      .leftJoin('actividades_integrantes', 'actividades.id', 'actividades_integrantes.actividad_id')
      .groupBy('proyectos.id', 'proyectos.nombre', 'proyectos.descripcion', 'proyectos.modalidad', 'proyectos.activo')
      .select(
        'proyectos.id',
        'proyectos.nombre',
        'proyectos.descripcion',
        'proyectos.modalidad',
        'proyectos.activo',
        db.raw('COUNT(DISTINCT actividades.id) as actividades_count'),
        db.raw('COUNT(DISTINCT actividades_integrantes.talent_id) as talents_count'),
        db.raw('COALESCE(AVG(actividades.horas_estimadas), 0) as progreso')
      )
      .orderBy('proyectos.created_at', 'desc');

    return proyectos.map((r: any) => ({
      id: r.id,
      nombre: r.nombre,
      descripcion: r.descripcion || '',
      modalidad: r.modalidad || 'ad-hoc',
      activo: Boolean(r.activo),
      actividades_count: Number(r.actividades_count),
      talents_count: Number(r.talents_count),
      progreso: Math.round(Number(r.progreso)),
    }));
  }

  async getActividades(clienteId: number) {
    const actividades = await db('actividades')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .leftJoin('tareas', 'actividades.id', 'tareas.actividad_id')
      .where('proyectos.cliente_id', clienteId)
      .where('actividades.activo', true)
      .groupBy('actividades.id', 'actividades.nombre', 'actividades.horas_estimadas', 'actividades.activo', 'proyectos.nombre')
      .select(
        'actividades.id',
        'actividades.nombre',
        'actividades.horas_estimadas',
        'actividades.activo',
        'proyectos.nombre as proyecto',
        db.raw('COALESCE(SUM(tareas.horas_registradas), 0) as horas_empleadas')
      )
      .orderBy('actividades.created_at', 'desc');

    return actividades.map((r: any) => ({
      id: r.id,
      nombre: r.nombre,
      horas_estimadas: Number(r.horas_estimadas) || 0,
      horas_empleadas: Number(r.horas_empleadas) || 0,
      activo: Boolean(r.activo),
      proyecto: r.proyecto || 'Sin proyecto',
    }));
  }
}

export const clienteDashboardService = new ClienteDashboardService();
