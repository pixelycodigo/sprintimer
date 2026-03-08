import { db } from '../config/database.js';

export interface SuperAdminDashboardStats {
  total_administradores: number;
  total_clientes: number;
  total_proyectos: number;
  total_talents: number;
  total_actividades: number;
  usuarios_activos: number;
  proyectos_activos: number;
  admins_recientes: Array<{
    id: number;
    nombre: string;
    email: string;
    created_at: string;
  }>;
}

export class SuperAdminDashboardService {
  async getStats(): Promise<SuperAdminDashboardStats> {
    // Total administradores (rol_id = 2)
    const administradoresResult = await db('usuarios')
      .where('rol_id', 2)
      .count('id as total')
      .first();
    const total_administradores = Number(administradoresResult?.total || 0);

    // Total clientes
    const clientesResult = await db('clientes')
      .count('id as total')
      .first();
    const total_clientes = Number(clientesResult?.total || 0);

    // Total proyectos
    const proyectosResult = await db('proyectos')
      .count('id as total')
      .first();
    const total_proyectos = Number(proyectosResult?.total || 0);

    // Total talents
    const talentsResult = await db('talents')
      .count('id as total')
      .first();
    const total_talents = Number(talentsResult?.total || 0);

    // Total actividades
    const actividadesResult = await db('actividades')
      .where('activo', true)
      .count('id as total')
      .first();
    const total_actividades = Number(actividadesResult?.total || 0);

    // Usuarios activos (últimos 30 días)
    const usuariosActivosResult = await db('usuarios')
      .where('activo', true)
      .count('id as total')
      .first();
    const usuarios_activos = Number(usuariosActivosResult?.total || 0);

    // Proyectos activos
    const proyectosActivosResult = await db('proyectos')
      .where('activo', true)
      .count('id as total')
      .first();
    const proyectos_activos = Number(proyectosActivosResult?.total || 0);

    // Administradores recientes (últimos 5)
    const adminsRecientes = await db('usuarios')
      .where('rol_id', 2)
      .orderBy('created_at', 'desc')
      .limit(5)
      .select('id', 'nombre', 'email', 'created_at');

    return {
      total_administradores,
      total_clientes,
      total_proyectos,
      total_talents,
      total_actividades,
      usuarios_activos,
      proyectos_activos,
      admins_recientes: adminsRecientes.map((r: any) => ({
        id: r.id,
        nombre: r.nombre,
        email: r.email,
        created_at: r.created_at,
      })),
    };
  }
}

export const superAdminDashboardService = new SuperAdminDashboardService();
