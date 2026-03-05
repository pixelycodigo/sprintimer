import { db } from '../config/database.js';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../models/Usuario.js';

export class UsuarioRepository {
  private tableName = 'usuarios';

  async findById(id: number): Promise<Usuario | null> {
    const usuario = await db<Usuario>(this.tableName)
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .select('usuarios.*', 'roles.nombre as rol')
      .where('usuarios.id', id)
      .first();

    return usuario || null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const usuario = await db<Usuario>(this.tableName)
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .select('usuarios.*', 'roles.nombre as rol')
      .where('usuarios.email', email)
      .first();

    return usuario || null;
  }

  async findByUsuario(usuario: string): Promise<Usuario | null> {
    const result = await db<Usuario>(this.tableName)
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .select('usuarios.*', 'roles.nombre as rol')
      .where('usuarios.usuario', usuario)
      .first();

    return result || null;
  }

  async create(data: UsuarioCreate): Promise<number> {
    const [id] = await db<Usuario>(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: UsuarioUpdate): Promise<boolean> {
    const updated = await db<Usuario>(this.tableName)
      .where('id', id)
      .update({ ...data, updated_at: new Date() });

    return updated > 0;
  }

  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    const query = db<Usuario>(this.tableName).where('email', email);

    if (excludeId) {
      query.andWhere('id', '!=', excludeId);
    }

    const exists = await query.first();
    return !!exists;
  }

  async usuarioExists(usuario: string, excludeId?: number): Promise<boolean> {
    const query = db<Usuario>(this.tableName).where('usuario', usuario);

    if (excludeId) {
      query.andWhere('id', '!=', excludeId);
    }

    const exists = await query.first();
    return !!exists;
  }

  async findAllAdmins(): Promise<Usuario[]> {
    const usuarios = await db<Usuario>(this.tableName)
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .select('usuarios.*', 'roles.nombre as rol')
      .whereIn('roles.nombre', ['super_admin', 'administrador'])
      .orderBy('usuarios.created_at', 'desc');

    return usuarios;
  }

  async updatePassword(id: number, passwordHash: string): Promise<boolean> {
    const updated = await db<Usuario>(this.tableName)
      .where('id', id)
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date()
      });

    return updated > 0;
  }
}

export const usuarioRepository = new UsuarioRepository();
