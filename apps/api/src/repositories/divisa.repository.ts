import { db } from '../config/database.js';
import { Divisa, DivisaCreate, DivisaUpdate } from '../models/Divisa.js';

export class DivisaRepository {
  private tableName = 'divisas';

  async findById(id: number): Promise<Divisa | null> {
    const divisa = await db<Divisa>(this.tableName)
      .where('id', id)
      .first();

    return divisa || null;
  }

  async findAll(): Promise<Divisa[]> {
    // Retornar todas las divisas EXCEPTO las que están en la tabla 'eliminados'
    const divisas = await db<Divisa>(this.tableName)
      .whereNotIn('id', function() {
        this.select('item_id')
          .from('eliminados')
          .where('item_tipo', 'divisa');
      })
      .orderBy('nombre', 'asc');

    return divisas;
  }

  async findAllActivos(): Promise<Divisa[]> {
    const divisas = await db<Divisa>(this.tableName)
      .where('activo', true)
      .orderBy('nombre', 'asc');

    return divisas;
  }

  async create(data: DivisaCreate): Promise<number> {
    const [id] = await db<Divisa>(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: DivisaUpdate): Promise<boolean> {
    // Filtrar campos undefined o vacíos
    const updateData: any = {};
    
    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      // Solo incluir campos que no sean undefined, null, o string vacío
      if (value !== undefined && value !== null && value !== '') {
        updateData[key] = value;
      }
    });

    const updated = await db<Divisa>(this.tableName)
      .where('id', id)
      .update(updateData);

    return updated > 0;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await db<Divisa>(this.tableName)
      .where('id', id)
      .del();

    return deleted > 0;
  }

  async softDelete(id: number): Promise<boolean> {
    const updated = await db<Divisa>(this.tableName)
      .where('id', id)
      .update({ activo: false });

    return updated > 0;
  }

  async codigoExists(codigo: string, excludeId?: number): Promise<boolean> {
    const query = db<Divisa>(this.tableName).where('codigo', codigo);

    if (excludeId) {
      query.andWhere('id', '!=', excludeId);
    }

    const exists = await query.first();
    return !!exists;
  }
}

export const divisaRepository = new DivisaRepository();
