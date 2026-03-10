import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { registroSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../validators/auth.validator.js';
import { AppError } from '../middleware/error.middleware.js';
import logger from '../config/logger.js';

export class AuthController {
  async registro(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(`${req.method} ${req.originalUrl} - Registrando nuevo usuario`, {
        email: req.body.email,
        rol: req.body.rol,
      });

      // Validar datos de entrada
      const validatedData = registroSchema.parse(req.body);

      // Registrar usuario
      const result = await authService.registro(validatedData);

      logger.info(`${req.method} ${req.originalUrl} - Usuario registrado exitosamente`, {
        userId: result.user.id,
        email: result.user.email,
        rol: result.user.rol,
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al registrar usuario`, {
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(`${req.method} ${req.originalUrl} - Intento de login`, {
        email: req.body.email,
      });

      // Validar datos de entrada
      const validatedData = loginSchema.parse(req.body);

      // Iniciar sesión
      const result = await authService.login(validatedData);

      logger.info(`${req.method} ${req.originalUrl} - Login exitoso`, {
        userId: result.user.id,
        email: result.user.email,
        rol: result.user.rol,
      });

      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result,
      });
    } catch (error) {
      logger.warn(`${req.method} ${req.originalUrl} - Error en login`, {
        email: req.body.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async logout(req: Request, res: Response) {
    const userId = req.user?.id;
    logger.info(`${req.method} ${req.originalUrl} - Logout de usuario`, {
      userId,
      email: req.user?.email,
    });

    // En una implementación con JWT stateless, el logout se maneja en el frontend
    // eliminando el token. Aquí podríamos invalidar el token si usamos una blacklist.

    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(`${req.method} ${req.originalUrl} - Refreshing token`);

      const { refreshToken } = req.body;

      if (!refreshToken) {
        logger.warn(`${req.method} ${req.originalUrl} - Refresh token no proporcionado`);
        throw new AppError('Refresh token requerido', 400);
      }

      const result = await authService.refreshToken(refreshToken);

      logger.debug(`${req.method} ${req.originalUrl} - Token refrescado exitosamente`);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.warn(`${req.method} ${req.originalUrl} - Error al refrescar token`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.debug(`${req.method} ${req.originalUrl} - Obteniendo perfil de usuario`, {
        userId,
      });

      const user = await authService.getMe(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al obtener perfil`, {
        userId: req.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.info(`${req.method} ${req.originalUrl} - Actualizando perfil de usuario`, {
        userId,
        data: req.body,
      });

      // Validar datos de entrada
      const validatedData = updateProfileSchema.parse(req.body);

      // Actualizar perfil
      const user = await authService.updateProfile(userId, validatedData);

      logger.info(`${req.method} ${req.originalUrl} - Perfil actualizado exitosamente`, {
        userId,
      });

      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: user,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al actualizar perfil`, {
        userId: req.user?.id,
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.info(`${req.method} ${req.originalUrl} - Cambio de contraseña solicitado`, {
        userId,
      });

      // Validar datos de entrada
      const validatedData = changePasswordSchema.parse(req.body);

      // Cambiar contraseña
      await authService.changePassword(
        userId,
        validatedData.currentPassword,
        validatedData.newPassword
      );

      logger.info(`${req.method} ${req.originalUrl} - Contraseña actualizada exitosamente`, {
        userId,
      });

      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada exitosamente',
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al cambiar contraseña`, {
        userId: req.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  }
}

// Importar Zod
import { z } from 'zod';

export const authController = new AuthController();
