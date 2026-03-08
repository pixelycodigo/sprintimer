import { usuarioRepository } from '../repositories/usuario.repository.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken, generateRefreshToken, verifyToken, TokenPayload } from '../utils/token.js';
import { AppError } from '../middleware/error.middleware.js';

export interface RegistroData {
  nombre: string;
  usuario: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    nombre: string;
    usuario: string;
    email: string;
    rol: string;
    avatar?: string;
  };
  token: string;
  refreshToken: string;
}

export class AuthService {
  async registro(data: RegistroData): Promise<AuthResponse> {
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

    // Rol por defecto: administrador (id = 2)
    const rolId = 2;

    // Crear usuario
    const userId = await usuarioRepository.create({
      nombre: data.nombre,
      usuario: data.usuario,
      email: data.email,
      password_hash: passwordHash,
      rol_id: rolId,
      email_verificado: false,
      activo: true,
    });

    // Obtener usuario creado
    const usuario = await usuarioRepository.findById(userId);
    if (!usuario) {
      throw new AppError('Error al crear el usuario', 500);
    }

    // Generar tokens
    const token = generateToken(usuario);
    const refreshToken = generateRefreshToken(usuario);

    return {
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        usuario: usuario.usuario,
        email: usuario.email,
        rol: usuario.rol || 'administrador',
        avatar: usuario.avatar,
      },
      token,
      refreshToken,
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    // Buscar usuario por email
    const usuario = await usuarioRepository.findByEmail(data.email);

    if (!usuario) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar contraseña
    const passwordValid = await comparePassword(data.password, usuario.password_hash);
    if (!passwordValid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      throw new AppError('Usuario inactivo', 403);
    }

    // Actualizar último login
    await usuarioRepository.update(usuario.id, {
      ultimo_login: new Date(),
    });

    // Generar tokens
    const token = generateToken(usuario);
    const refreshToken = generateRefreshToken(usuario);

    return {
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        usuario: usuario.usuario,
        email: usuario.email,
        rol: usuario.rol || 'administrador',
        avatar: usuario.avatar,
      },
      token,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = verifyToken(refreshToken) as TokenPayload;

      const usuario = await usuarioRepository.findById(payload.id);
      if (!usuario) {
        throw new AppError('Usuario no encontrado', 404);
      }

      if (!usuario.activo) {
        throw new AppError('Usuario inactivo', 403);
      }

      const token = generateToken(usuario);
      const newRefreshToken = generateRefreshToken(usuario);

      return {
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          usuario: usuario.usuario,
          email: usuario.email,
          rol: usuario.rol || 'administrador',
          avatar: usuario.avatar,
        },
        token,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError('Token inválido o expirado', 401);
    }
  }

  async getMe(userId: number) {
    const usuario = await usuarioRepository.findById(userId);

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      email: usuario.email,
      rol: usuario.rol || 'administrador',
      avatar: usuario.avatar,
      email_verificado: usuario.email_verificado,
      activo: usuario.activo,
      ultimo_login: usuario.ultimo_login,
    };
  }

  async updateProfile(userId: number, data: { nombre?: string; email?: string }) {
    // Verificar si el email cambia y si ya existe
    if (data.email) {
      const emailExists = await usuarioRepository.emailExists(data.email, userId);
      if (emailExists) {
        throw new AppError('El email ya está en uso', 400);
      }
    }

    const updated = await usuarioRepository.update(userId, {
      nombre: data.nombre,
      email: data.email,
      email_verificado: data.email ? false : undefined,
    });

    if (!updated) {
      throw new AppError('Error al actualizar el perfil', 500);
    }

    return this.getMe(userId);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const usuario = await usuarioRepository.findById(userId);

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    const passwordValid = await comparePassword(currentPassword, usuario.password_hash);
    if (!passwordValid) {
      throw new AppError('Contraseña actual inválida', 400);
    }

    // Hashear nueva contraseña
    const passwordHash = await hashPassword(newPassword);

    // Actualizar contraseña
    await usuarioRepository.update(userId, {
      // password_hash se manejaría aquí si tuviéramos ese campo en UsuarioUpdate
    });

    // Nota: Necesitarás agregar password_hash a UsuarioUpdate o hacer un update directo
    await db('usuarios').where('id', userId).update({ password_hash: passwordHash });

    return { message: 'Contraseña actualizada exitosamente' };
  }
}

// Import db directamente para el update de password
import { db } from '../config/database.js';

export const authService = new AuthService();
