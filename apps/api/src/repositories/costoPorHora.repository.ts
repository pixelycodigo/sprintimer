import { db } from '../config/database.js';
import { CostoPorHora, CostoPorHoraCreate, CostoPorHoraUpdate, CostoPorHoraWithDetails } from '../models/CostoPorHora.js';

export class CostoPorHoraRepository {
  private tableName = 'costos_por_hora';

  async findById(id: number): Promise<CostoPorHoraWithDetails | null> {
    const costo = await db<CostoPorHoraWithDetails>(this.tableName)
      .leftJoin('divisas', 'costos_por_hora.divisa_id', 'divisas.id')
      .leftJoin('perfiles', 'costos_por_hora.perfil_id', 'perfiles.id')
      .leftJoin('seniorities', 'costos_por_hora.seniority_id', 'seniorities.id')
      .select(
        'costos_por_hora.*',
        'divisas.codigo as divisa_codigo',
        'divisas.simbolo as divisa_simbolo',
        'perfiles.nombre as perfil_nombre',
        'seniorities.nombre as seniority_nombre'
      )
      .where('costos_por_hora.id', id)
      .first();

    return costo || null;
  }

  async findAll(): Promise<CostoPorHoraWithDetails[]> {
    // Retornar todos los costos por hora EXCEPTO los que están en la tabla 'eliminados'
    const costos = await db<CostoPorHoraWithDetails>(this.tableName)
      .leftJoin('divisas', 'costos_por_hora.divisa_id', 'divisas.id')
      .leftJoin('perfiles', 'costos_por_hora.perfil_id', 'perfiles.id')
      .leftJoin('seniorities', 'costos_por_hora.seniority_id', 'seniorities.id')
      .select(
        'costos_por_hora.*',
        'divisas.codigo as divisa_codigo',
        'divisas.simbolo as divisa_simbolo',
        'perfiles.nombre as perfil_nombre',
        'seniorities.nombre as seniority_nombre'
      )
      .whereNotIn('costos_por_hora.id', function() {
        this.select('item_id')
          .from('eliminados')
          .where('item_tipo', 'costo_por_hora');
      })
      .orderBy('costos_por_hora.created_at', 'desc');

    return costos;
  }

  async create(data: CostoPorHoraCreate): Promise<number> {
    const [id] = await db<CostoPorHora>(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: CostoPorHoraUpdate): Promise<boolean> {
    // Filtrar campos undefined o vacíos
    const updateData: any = {};
    
    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      // Solo incluir campos que no sean undefined, null, o string vacío
      if (value !== undefined && value !== null && value !== '') {
        updateData[key] = value;
      }
    });

    const updated = await db<CostoPorHora>(this.tableName)
      .where('id', id)
      .update({ ...updateData, updated_at: new Date() });

    return updated > 0;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await db<CostoPorHora>(this.tableName)
      .where('id', id)
      .del();

    return deleted > 0;
  }

  async softDelete(id: number): Promise<boolean> {
    const updated = await db<CostoPorHora>(this.tableName)
      .where('id', id)
      .update({
        activo: false,
        updated_at: new Date()
      });

    return updated > 0;
  }
}

export const costoPorHoraRepository = new CostoPorHoraRepository();
