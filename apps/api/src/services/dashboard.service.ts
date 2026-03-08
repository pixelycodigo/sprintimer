import { db } from '../config/database.js';

export interface DashboardStats {
  total_clientes: number;
  total_proyectos: number;
  total_talents: number;
  total_actividades: number;
  proyectos_activos: number;
  talents_activos: number;
  actividades_activas: number;
  total_ingresos?: number;
  proyectos_por_cliente: Array<{
    cliente: string;
    proyectos: number;
  }>;
  talents_por_perfil: Array<{
    perfil: string;
    cantidad: number;
  }>;
  actividades_por_proyecto: Array<{
    proyecto: string;
    actividades: number;
  }>;
}

export class DashboardService {
  async getStats(): Promise<DashboardStats> {
    // Total clientes
    const clientesResult = await db('clientes')
      .where('activo', true)
      .count('id as total')
      .first();
    const total_clientes = Number(clientesResult?.total || 0);

    // Total proyectos
    const proyectosResult = await db('proyectos')
      .where('activo', true)
      .count('id as total')
      .first();
    const total_proyectos = Number(proyectosResult?.total || 0);

    // Total talents
    const talentsResult = await db('talents')
      .where('activo', true)
      .count('id as total')
      .first();
    const total_talents = Number(talentsResult?.total || 0);

    // Total actividades
    const actividadesResult = await db('actividades')
      .where('activo', true)
      .count('id as total')
      .first();
    const total_actividades = Number(actividadesResult?.total || 0);

    // Proyectos activos
    const proyectos_activos = total_proyectos;

    // Talents activos
    const talents_activos = total_talents;

    // Actividades activas
    const actividades_activas = total_actividades;

    // Proyectos por cliente
    const proyectos_por_cliente = await db('clientes')
      .leftJoin('proyectos', 'clientes.id', 'proyectos.cliente_id')
      .where('clientes.activo', true)
      .groupBy('clientes.id', 'clientes.nombre_cliente')
      .select(
        'clientes.nombre_cliente as cliente',
        db.raw('COUNT(proyectos.id) as proyectos')
      )
      .orderBy('proyectos', 'desc')
      .limit(5);

    // Talents por perfil
    const talents_por_perfil = await db('talents')
      .leftJoin('perfiles', 'talents.perfil_id', 'perfiles.id')
      .where('talents.activo', true)
      .groupBy('perfiles.id', 'perfiles.nombre')
      .select(
        'perfiles.nombre as perfil',
        db.raw('COUNT(talents.id) as cantidad')
      )
      .orderBy('cantidad', 'desc')
      .limit(5);

    // Actividades por proyecto
    const actividades_por_proyecto = await db('proyectos')
      .leftJoin('actividades', 'proyectos.id', 'actividades.proyecto_id')
      .where('proyectos.activo', true)
      .groupBy('proyectos.id', 'proyectos.nombre')
      .select(
        'proyectos.nombre as proyecto',
        db.raw('COUNT(actividades.id) as actividades')
      )
      .orderBy('actividades', 'desc')
      .limit(5);

    return {
      total_clientes,
      total_proyectos,
      total_talents,
      total_actividades,
      proyectos_activos,
      talents_activos,
      actividades_activas,
      proyectos_por_cliente: proyectos_por_cliente.map((r: any) => ({
        cliente: r.cliente,
        proyectos: Number(r.proyectos),
      })),
      talents_por_perfil: talents_por_perfil.map((r: any) => ({
        perfil: r.perfil,
        cantidad: Number(r.cantidad),
      })),
      actividades_por_proyecto: actividades_por_proyecto.map((r: any) => ({
        proyecto: r.proyecto,
        actividades: Number(r.actividades),
      })),
    };
  }
}

export const dashboardService = new DashboardService();
