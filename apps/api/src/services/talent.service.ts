import { talentRepository } from '../repositories/talent.repository.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import { hashPassword } from '../utils/hash.js';
import { AppError } from '../middleware/error.middleware.js';
import { TalentCreate, TalentUpdate, TalentWithDetails } from '../models/Talent.js';
import { db } from '../config/database.js';
import { eliminadoService } from './eliminado.service.js';

export class TalentService {
  async findAll(): Promise<TalentWithDetails[]> {
    return talentRepository.findAll();
  }

  async findAllActivos(): Promise<TalentWithDetails[]> {
    return talentRepository.findAllActivos();
  }

  async findById(id: number): Promise<TalentWithDetails | null> {
    const talent = await talentRepository.findById(id);

    if (!talent) {
      throw new Error('Talent no encontrado');
    }

    return talent;
  }

  async create(data: TalentCreate): Promise<TalentWithDetails> {
    // Verificar si el email ya existe en talents
    if (await talentRepository.emailExists(data.email)) {
      throw new AppError('Ya existe un talent registrado con este email', 400);
    }

    // Verificar si el email ya existe en usuarios
    if (await usuarioRepository.emailExists(data.email)) {
      throw new AppError('Ya existe un usuario registrado con este email', 400);
    }

    // Generar usuario a partir del email (parte antes del @)
    const usuario = data.email.split('@')[0];
    const usuarioDisponible = await this.generarUsuarioDisponible(usuario);

    // Hashear contraseña
    const passwordHash = await hashPassword(data.password);

    // Crear usuario con rol_id=4 (talent)
    const userId = await usuarioRepository.create({
      nombre: data.nombre_completo,
      usuario: usuarioDisponible,
      email: data.email,
      password_hash: passwordHash,
      rol_id: 4, // rol de talent
      email_verificado: false,
      activo: true,
    });

    // Crear talent (sin password, eso ya está en usuarios)
    const talentData = {
      perfil_id: data.perfil_id,
      seniority_id: data.seniority_id,
      nombre_completo: data.nombre_completo,
      apellido: data.apellido,
      email: data.email,
      costo_hora_fijo: data.costo_hora_fijo ?? null,
      costo_hora_variable_min: data.costo_hora_variable_min ?? null,
      costo_hora_variable_max: data.costo_hora_variable_max ?? null,
      activo: data.activo !== undefined ? data.activo : true,
    };
    
    const id = await talentRepository.create(talentData as any);
    const talent = await talentRepository.findById(id);

    if (!talent) {
      throw new AppError('Error al crear el talent', 500);
    }

    return talent;
  }

  async generarUsuarioDisponible(baseUsuario: string): Promise<string> {
    let usuario = baseUsuario;
    let contador = 1;
    
    while (await usuarioRepository.usuarioExists(usuario)) {
      usuario = `${baseUsuario}${contador}`;
      contador++;
    }
    
    return usuario;
  }

  async update(id: number, data: TalentUpdate): Promise<TalentWithDetails> {
    const talent = await this.findById(id);

    if (!talent) {
      throw new Error('Talent no encontrado');
    }

    // Verificar email único si se está actualizando
    if (data.email && data.email !== talent.email) {
      if (await talentRepository.emailExists(data.email, id)) {
        throw new Error('Ya existe un talent con ese email');
      }
    }

    // Preparar datos para actualizar (solo campos de talents)
    const updateData: any = {
      perfil_id: data.perfil_id,
      seniority_id: data.seniority_id,
      nombre_completo: data.nombre_completo,
      apellido: data.apellido,
      email: data.email,
      costo_hora_fijo: data.costo_hora_fijo,
      costo_hora_variable_min: data.costo_hora_variable_min,
      costo_hora_variable_max: data.costo_hora_variable_max,
      activo: data.activo,
    };

    // Si hay password, actualizar en la tabla usuarios
    if (data.password && data.password !== '') {
      const passwordHash = await hashPassword(data.password);
      await db('usuarios').where('email', talent.email).update({ password_hash: passwordHash });
    }

    const updated = await talentRepository.update(id, updateData);

    if (!updated) {
      throw new Error('Error al actualizar el talent');
    }

    return talentRepository.findById(id) as Promise<TalentWithDetails>;
  }

  async delete(id: number): Promise<void> {
    const talent = await this.findById(id);

    if (!talent) {
      throw new Error('Talent no encontrado');
    }

    const deleted = await talentRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar el talent');
    }
  }

  async softDelete(id: number, eliminadoPor?: number): Promise<void> {
    const talent = await this.findById(id);

    if (!talent) {
      throw new AppError('Talent no encontrado', 404);
    }

    const updated = await talentRepository.softDelete(id);

    if (!updated) {
      throw new AppError('Error al eliminar el talent', 500);
    }

    // Registrar en la tabla eliminados
    const fechaBorradoPermanente = new Date();
    fechaBorradoPermanente.setDate(fechaBorradoPermanente.getDate() + 30); // 30 días

    await eliminadoService.create({
      item_id: id,
      item_tipo: 'talent',
      eliminado_por: eliminadoPor || 1,
      fecha_borrado_permanente: fechaBorradoPermanente,
      datos: {
        nombre_completo: talent.nombre_completo,
        apellido: talent.apellido,
        email: talent.email,
        perfil_nombre: talent.perfil_nombre,
        seniority_nombre: talent.seniority_nombre,
      },
    });
  }

  async changePassword(id: number, password: string): Promise<void> {
    const talent = await this.findById(id);

    if (!talent) {
      throw new Error('Talent no encontrado');
    }

    const passwordHash = await hashPassword(password);
    const updated = await db('usuarios').where('email', talent.email).update({ password_hash: passwordHash });

    if (!updated) {
      throw new Error('Error al cambiar la contraseña');
    }
  }
}

export const talentService = new TalentService();
