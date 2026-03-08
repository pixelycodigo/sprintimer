import { db } from '../config/database.js';
import { Talent, TalentCreate, TalentUpdate, TalentWithDetails } from '../models/Talent.js';

export class TalentRepository {
  private tableName = 'talents';

  async findById(id: number): Promise<TalentWithDetails | null> {
    const talent = await db<TalentWithDetails>(this.tableName)
      .leftJoin('perfiles', 'talents.perfil_id', 'perfiles.id')
      .leftJoin('seniorities', 'talents.seniority_id', 'seniorities.id')
      .select(
        'talents.*',
        'perfiles.nombre as perfil_nombre',
        'seniorities.nombre as seniority_nombre'
      )
      .where('talents.id', id)
      .first();

    return talent || null;
  }

  async findAll(): Promise<TalentWithDetails[]> {
    const talents = await db<TalentWithDetails>(this.tableName)
      .leftJoin('perfiles', 'talents.perfil_id', 'perfiles.id')
      .leftJoin('seniorities', 'talents.seniority_id', 'seniorities.id')
      .select(
        'talents.*',
        'perfiles.nombre as perfil_nombre',
        'seniorities.nombre as seniority_nombre'
      )
      .orderBy('talents.created_at', 'desc');

    return talents;
  }

  async findAllActivos(): Promise<TalentWithDetails[]> {
    const talents = await db<TalentWithDetails>(this.tableName)
      .leftJoin('perfiles', 'talents.perfil_id', 'perfiles.id')
      .leftJoin('seniorities', 'talents.seniority_id', 'seniorities.id')
      .select(
        'talents.*',
        'perfiles.nombre as perfil_nombre',
        'seniorities.nombre as seniority_nombre'
      )
      .where('talents.activo', true)
      .orderBy('talents.nombre', 'asc');

    return talents;
  }

  async create(data: TalentCreate): Promise<number> {
    const [id] = await db<Talent>(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: TalentUpdate): Promise<boolean> {
    // Remover password si está vacío o no se debe actualizar
    const { password, ...updateData } = data;
    
    const updated = await db<Talent>(this.tableName)
      .where('id', id)
      .update({ ...updateData, updated_at: new Date() });

    return updated > 0;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await db<Talent>(this.tableName)
      .where('id', id)
      .del();

    return deleted > 0;
  }

  async softDelete(id: number): Promise<boolean> {
    const updated = await db<Talent>(this.tableName)
      .where('id', id)
      .update({
        activo: false,
        updated_at: new Date()
      });

    return updated > 0;
  }

  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    const query = db<Talent>(this.tableName).where('email', email);

    if (excludeId) {
      query.andWhere('id', '!=', excludeId);
    }

    const exists = await query.first();
    return !!exists;
  }

  async updatePassword(id: number, passwordHash: string): Promise<boolean> {
    const updated = await db<Talent>(this.tableName)
      .where('id', id)
      .update({
        password_hash: passwordHash,
        updated_at: new Date()
      });

    return updated > 0;
  }
}

export const talentRepository = new TalentRepository();
