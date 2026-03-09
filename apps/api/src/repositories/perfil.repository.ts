import { db } from '../config/database.js';
import { Perfil, PerfilCreate, PerfilUpdate } from '../models/Perfil.js';

export class PerfilRepository {
  private tableName = 'perfiles';

  async findById(id: number): Promise<Perfil | null> {
    const perfil = await db<Perfil>(this.tableName)
      .where('id', id)
      .first();

    return perfil || null;
  }

  async findAll(): Promise<Perfil[]> {
    const perfiles = await db<Perfil>(this.tableName)
      .orderBy('nombre', 'asc');

    return perfiles;
  }

  async findAllActivos(): Promise<Perfil[]> {
    const perfiles = await db<Perfil>(this.tableName)
      .where('activo', true)
      .orderBy('nombre', 'asc');

    return perfiles;
  }

  async create(data: PerfilCreate): Promise<number> {
    const [id] = await db<Perfil>(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: PerfilUpdate): Promise<boolean> {
    // Filtrar campos undefined o vacíos
    const updateData: any = {};
    
    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      // Solo incluir campos que no sean undefined, null, o string vacío
      if (value !== undefined && value !== null && value !== '') {
        updateData[key] = value;
      }
    });

    const updated = await db<Perfil>(this.tableName)
      .where('id', id)
      .update(updateData);

    return updated > 0;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await db<Perfil>(this.tableName)
      .where('id', id)
      .del();

    return deleted > 0;
  }

  async softDelete(id: number): Promise<boolean> {
    const updated = await db<Perfil>(this.tableName)
      .where('id', id)
      .update({ activo: false });

    return updated > 0;
  }

  async nombreExists(nombre: string, excludeId?: number): Promise<boolean> {
    const query = db<Perfil>(this.tableName).where('nombre', nombre);

    if (excludeId) {
      query.andWhere('id', '!=', excludeId);
    }

    const exists = await query.first();
    return !!exists;
  }
}

export const perfilRepository = new PerfilRepository();
