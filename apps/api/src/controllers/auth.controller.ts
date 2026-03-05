import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { registroSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../validators/auth.validator.js';
import { AppError } from '../middleware/error.middleware.js';

export class AuthController {
  async registro(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar datos de entrada
      const validatedData = registroSchema.parse(req.body);

      // Registrar usuario
      const result = await authService.registro(validatedData);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result,
      });
    } catch (error) {
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

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar datos de entrada
      const validatedData = loginSchema.parse(req.body);

      // Iniciar sesión
      const result = await authService.login(validatedData);

      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result,
      });
    } catch (error) {
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

  async logout(req: Request, res: Response) {
    // En una implementación con JWT stateless, el logout se maneja en el frontend
    // eliminando el token. Aquí podríamos invalidar el token si usamos una blacklist.

    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token requerido', 400);
      }

      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const user = await authService.getMe(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      // Validar datos de entrada
      const validatedData = updateProfileSchema.parse(req.body);

      // Actualizar perfil
      const user = await authService.updateProfile(userId, validatedData);

      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: user,
      });
    } catch (error) {
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
        throw new AppError('Usuario no autenticado', 401);
      }

      // Validar datos de entrada
      const validatedData = changePasswordSchema.parse(req.body);

      // Cambiar contraseña
      await authService.changePassword(
        userId,
        validatedData.currentPassword,
        validatedData.newPassword
      );

      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada exitosamente',
      });
    } catch (error) {
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
