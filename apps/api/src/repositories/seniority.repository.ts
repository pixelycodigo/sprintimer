import { db } from '../config/database.js';
import { Seniority, SeniorityCreate, SeniorityUpdate } from '../models/Seniority.js';

export class SeniorityRepository {
  private tableName = 'seniorities';

  async findById(id: number): Promise<Seniority | null> {
    const seniority = await db<Seniority>(this.tableName)
      .where('id', id)
      .first();

    return seniority || null;
  }

  async findAll(): Promise<Seniority[]> {
    const seniorities = await db<Seniority>(this.tableName)
      .orderBy('nivel_orden', 'asc');

    return seniorities;
  }

  async findAllActivos(): Promise<Seniority[]> {
    const seniorities = await db<Seniority>(this.tableName)
      .where('activo', true)
      .orderBy('nivel_orden', 'asc');

    return seniorities;
  }

  async create(data: SeniorityCreate): Promise<number> {
    const [id] = await db<Seniority>(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: SeniorityUpdate): Promise<boolean> {
    const updated = await db<Seniority>(this.tableName)
      .where('id', id)
      .update(data);

    return updated > 0;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await db<Seniority>(this.tableName)
      .where('id', id)
      .del();

    return deleted > 0;
  }

  async softDelete(id: number): Promise<boolean> {
    const updated = await db<Seniority>(this.tableName)
      .where('id', id)
      .update({ activo: false });

    return updated > 0;
  }

  async nombreExists(nombre: string, excludeId?: number): Promise<boolean> {
    const query = db<Seniority>(this.tableName).where('nombre', nombre);

    if (excludeId) {
      query.andWhere('id', '!=', excludeId);
    }

    const exists = await query.first();
    return !!exists;
  }
}

export const seniorityRepository = new SeniorityRepository();
