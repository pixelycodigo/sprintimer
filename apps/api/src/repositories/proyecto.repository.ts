import { db } from '../config/database.js';
import { Proyecto, ProyectoCreate, ProyectoUpdate } from '../models/Proyecto.js';

export class ProyectoRepository {
  private tableName = 'proyectos';

  async findById(id: number): Promise<Proyecto | null> {
    const proyecto = await db<Proyecto>(this.tableName)
      .where('id', id)
      .first();

    return proyecto || null;
  }

  async findAll(): Promise<Proyecto[]> {
    const proyectos = await db<Proyecto>(this.tableName)
      .orderBy('created_at', 'desc');

    return proyectos;
  }

  async findAllActivos(): Promise<Proyecto[]> {
    const proyectos = await db<Proyecto>(this.tableName)
      .where('activo', true)
      .orderBy('nombre', 'asc');

    return proyectos;
  }

  async findByClienteId(clienteId: number): Promise<Proyecto[]> {
    const proyectos = await db<Proyecto>(this.tableName)
      .where('cliente_id', clienteId)
      .orderBy('created_at', 'desc');

    return proyectos;
  }

  async create(data: ProyectoCreate): Promise<number> {
    const [id] = await db<Proyecto>(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: ProyectoUpdate): Promise<boolean> {
    // Filtrar campos undefined o vacíos
    const updateData: any = {};
    
    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      // Solo incluir campos que no sean undefined, null, o string vacío
      if (value !== undefined && value !== null && value !== '') {
        updateData[key] = value;
      }
    });

    const updated = await db<Proyecto>(this.tableName)
      .where('id', id)
      .update({ ...updateData, updated_at: new Date() });

    return updated > 0;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await db<Proyecto>(this.tableName)
      .where('id', id)
      .del();

    return deleted > 0;
  }

  async softDelete(id: number): Promise<boolean> {
    const updated = await db<Proyecto>(this.tableName)
      .where('id', id)
      .update({
        activo: false,
        updated_at: new Date()
      });

    return updated > 0;
  }

  async search(term: string): Promise<Proyecto[]> {
    const proyectos = await db<Proyecto>(this.tableName)
      .where((builder) => {
        builder
          .where('nombre', 'like', `%${term}%`)
          .orWhere('descripcion', 'like', `%${term}%`);
      })
      .orderBy('nombre', 'asc');

    return proyectos;
  }
}

export const proyectoRepository = new ProyectoRepository();
