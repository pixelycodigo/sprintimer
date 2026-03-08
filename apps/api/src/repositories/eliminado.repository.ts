import { db } from '../config/database.js';
import { Eliminado, EliminadoCreate } from '../models/Eliminado.js';

export class EliminadoRepository {
  private tableName = 'eliminados';

  async findById(id: number): Promise<Eliminado | null> {
    const eliminado = await db<Eliminado>(this.tableName)
      .where('id', id)
      .first();

    return eliminado || null;
  }

  async findAll(): Promise<Eliminado[]> {
    const eliminados = await db<Eliminado>(this.tableName)
      .orderBy('fecha_eliminacion', 'desc');

    return eliminados;
  }

  async findByTipo(itemTipo: string): Promise<Eliminado[]> {
    const eliminados = await db<Eliminado>(this.tableName)
      .where('item_tipo', itemTipo)
      .orderBy('fecha_eliminacion', 'desc');

    return eliminados;
  }

  async create(data: EliminadoCreate): Promise<number> {
    const [id] = await db<Eliminado>(this.tableName).insert(data);
    return id;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await db<Eliminado>(this.tableName)
      .where('id', id)
      .del();

    return deleted > 0;
  }

  async deleteExpired(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    
    const deleted = await db<Eliminado>(this.tableName)
      .where('fecha_borrado_permanente', '<=', today)
      .del();

    return deleted;
  }

  async restore(id: number): Promise<Eliminado | null> {
    const eliminado = await this.findById(id);
    
    if (eliminado) {
      await db<Eliminado>(this.tableName)
        .where('id', id)
        .del();
    }

    return eliminado;
  }
}

export const eliminadoRepository = new EliminadoRepository();
