import { db } from '../config/database.js';
import { Cliente, ClienteCreate, ClienteUpdate } from '../models/Cliente.js';

export class ClienteRepository {
  private tableName = 'clientes';

  async findById(id: number): Promise<Cliente | null> {
    const cliente = await db<Cliente>(this.tableName)
      .where('id', id)
      .first();

    return cliente || null;
  }

  async findAll(): Promise<Cliente[]> {
    // Retornar todos los clientes EXCEPTO los que están en la tabla 'eliminados'
    // Un cliente puede estar activo o inactivo, pero si está en 'eliminados' no debe mostrarse
    const clientes = await db<Cliente>(this.tableName)
      .whereNotIn('id', function() {
        this.select('item_id')
          .from('eliminados')
          .where('item_tipo', 'cliente');
      })
      .orderBy('created_at', 'desc');

    return clientes;
  }

  async findAllActivos(): Promise<Cliente[]> {
    const clientes = await db<Cliente>(this.tableName)
      .where('activo', true)
      .orderBy('nombre_cliente', 'asc');

    return clientes;
  }

  async create(data: any): Promise<number> {
    // Filtrar campos que no existen en la tabla clientes
    const cleanData = {
      nombre_cliente: data.nombre_cliente,
      cargo: data.cargo ?? null,
      empresa: data.empresa,
      email: data.email,
      celular: data.celular ?? null,
      telefono: data.telefono ?? null,
      anexo: data.anexo ?? null,
      pais: data.pais ?? null,
      activo: data.activo !== undefined ? data.activo : true,
    };
    
    const [id] = await db<Cliente>(this.tableName).insert(cleanData);
    return id;
  }

  async update(id: number, data: ClienteUpdate): Promise<boolean> {
    // Filtrar campos undefined o vacíos
    const updateData: any = {};
    
    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      // Solo incluir campos que no sean undefined, null, o string vacío
      if (value !== undefined && value !== null && value !== '') {
        updateData[key] = value;
      }
    });

    const updated = await db<Cliente>(this.tableName)
      .where('id', id)
      .update({ ...updateData, updated_at: new Date() });

    return updated > 0;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await db<Cliente>(this.tableName)
      .where('id', id)
      .del();

    return deleted > 0;
  }

  async softDelete(id: number): Promise<boolean> {
    const updated = await db<Cliente>(this.tableName)
      .where('id', id)
      .update({
        activo: false,
        updated_at: new Date()
      });

    return updated > 0;
  }

  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    const query = db<Cliente>(this.tableName).where('email', email);

    if (excludeId) {
      query.andWhere('id', '!=', excludeId);
    }

    const exists = await query.first();
    return !!exists;
  }

  async search(term: string): Promise<Cliente[]> {
    const clientes = await db<Cliente>(this.tableName)
      .where((builder) => {
        builder
          .where('nombre_cliente', 'like', `%${term}%`)
          .orWhere('empresa', 'like', `%${term}%`)
          .orWhere('email', 'like', `%${term}%`);
      })
      .orderBy('nombre_cliente', 'asc');

    return clientes;
  }
}

export const clienteRepository = new ClienteRepository();
