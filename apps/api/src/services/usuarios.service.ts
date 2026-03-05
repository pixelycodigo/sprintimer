import { usuarioRepository } from '../repositories/usuario.repository.js';
import { hashPassword } from '../utils/hash.js';
import { AppError } from '../middleware/error.middleware.js';

export interface UsuarioCreateData {
  nombre_completo: string;
  usuario: string;
  email: string;
  password: string;
  rol_id: number;
}

export interface UsuarioUpdateData {
  nombre_completo?: string;
  email?: string;
  activo?: boolean;
}

export class UsuariosService {
  async findAllAdmins() {
    return await usuarioRepository.findAllAdmins();
  }

  async findById(id: number) {
    const usuario = await usuarioRepository.findById(id);

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return usuario;
  }

  async create(data: UsuarioCreateData) {
    // Verificar si el email ya existe
    const emailExists = await usuarioRepository.emailExists(data.email);
    if (emailExists) {
      throw new AppError('El email ya está registrado', 400);
    }

    // Verificar si el usuario ya existe
    const usuarioExists = await usuarioRepository.usuarioExists(data.usuario);
    if (usuarioExists) {
      throw new AppError('El usuario ya existe', 400);
    }

    // Hashear contraseña
    const passwordHash = await hashPassword(data.password);

    // Crear usuario
    const userId = await usuarioRepository.create({
      nombre_completo: data.nombre_completo,
      usuario: data.usuario,
      email: data.email,
      password_hash: passwordHash,
      rol_id: data.rol_id,
      email_verificado: false,
      activo: true,
    });

    return await this.findById(userId);
  }

  async update(id: number, data: UsuarioUpdateData) {
    const usuario = await this.findById(id);

    // Verificar si el email cambia y si ya existe
    if (data.email && data.email !== usuario.email) {
      const emailExists = await usuarioRepository.emailExists(data.email, id);
      if (emailExists) {
        throw new AppError('El email ya está en uso', 400);
      }
    }

    const updated = await usuarioRepository.update(id, {
      nombre_completo: data.nombre_completo,
      email: data.email,
      activo: data.activo,
    });

    if (!updated) {
      throw new AppError('Error al actualizar el usuario', 500);
    }

    return await this.findById(id);
  }

  async changePassword(id: number, newPassword: string) {
    const passwordHash = await hashPassword(newPassword);
    
    const updated = await usuarioRepository.updatePassword(id, passwordHash);
    
    if (!updated) {
      throw new AppError('Error al cambiar la contraseña', 500);
    }

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async delete(id: number) {
    const usuario = await this.findById(id);

    // No permitir eliminar el propio usuario
    if (id === usuario.id) {
      throw new AppError('No puedes eliminarte a ti mismo', 400);
    }

    // Soft delete - marcar como inactivo
    await usuarioRepository.update(id, { activo: false });

    return { message: 'Usuario eliminado exitosamente' };
  }
}

export const usuariosService = new UsuariosService();
