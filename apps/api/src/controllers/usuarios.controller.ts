import { Request, Response, NextFunction } from 'express';
import { usuariosService } from '../services/usuarios.service.js';
import { createUsuarioSchema, updateUsuarioSchema, changePasswordSchema } from '../validators/usuarios.validator.js';
import { z } from 'zod';
import logger from '../config/logger.js';

export class UsuariosController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(`${req.method} ${req.originalUrl} - Listando todos los usuarios administradores`);
      const usuarios = await usuariosService.findAllAdmins();

      logger.info(`${req.method} ${req.originalUrl} - Usuarios administradores listados exitosamente`, {
        total: usuarios.length,
      });

      res.status(200).json({
        success: true,
        data: usuarios,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al listar usuarios administradores`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        logger.warn(`${req.method} ${req.originalUrl} - ID inválido proporcionado`, {
          id: req.params.id,
        });
        return res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
      }

      logger.debug(`${req.method} ${req.originalUrl} - Buscando usuario ID: ${id}`);
      const usuario = await usuariosService.findById(id);

      logger.info(`${req.method} ${req.originalUrl} - Usuario encontrado`, {
        usuarioId: id,
        email: usuario.email,
      });

      res.status(200).json({
        success: true,
        data: usuario,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Usuario no encontrado') {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado`, {
          usuarioId: req.params.id,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al buscar usuario`, {
          usuarioId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar datos de entrada
      const validatedData = createUsuarioSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Creando nuevo usuario`, {
        email: validatedData.email,
        rol_id: validatedData.rol_id,
      });

      // Crear usuario
      const usuario = await usuariosService.create(validatedData);

      logger.info(`${req.method} ${req.originalUrl} - Usuario creado exitosamente`, {
        usuarioId: usuario.id,
        email: usuario.email,
      });

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuario,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Formatear errores para mostrar en toast
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        
        logger.warn(`${req.method} ${req.originalUrl} - Datos inválidos para crear usuario`, {
          errors,
          body: req.body,
        });
        
        return res.status(400).json({
          success: false,
          message: 'Verifica los campos requeridos',
          issues: errors,
        });
      }
      logger.error(`${req.method} ${req.originalUrl} - Error al crear usuario`, {
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        logger.warn(`${req.method} ${req.originalUrl} - ID inválido proporcionado`, {
          id: req.params.id,
        });
        return res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
      }

      // Validar datos de entrada
      const validatedData = updateUsuarioSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Actualizando usuario ID: ${id}`, {
        data: validatedData,
        body: req.body,
      });

      // Actualizar usuario
      const usuario = await usuariosService.update(id, validatedData);

      logger.info(`${req.method} ${req.originalUrl} - Usuario actualizado exitosamente`, {
        usuarioId: id,
        email: usuario.email,
      });

      res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuario,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        
        logger.warn(`${req.method} ${req.originalUrl} - Datos inválidos para actualizar usuario`, {
          errors,
          body: req.body,
        });
        
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          issues: errors,
        });
      }
      logger.error(`${req.method} ${req.originalUrl} - Error al actualizar usuario`, {
        usuarioId: req.params.id,
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        logger.warn(`${req.method} ${req.originalUrl} - ID inválido proporcionado`, {
          id: req.params.id,
        });
        return res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
      }

      // Validar datos de entrada
      const validatedData = changePasswordSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Cambiando contraseña para usuario ID: ${id}`);

      // Cambiar contraseña
      await usuariosService.changePassword(id, validatedData.password);

      logger.info(`${req.method} ${req.originalUrl} - Contraseña actualizada exitosamente`, {
        usuarioId: id,
      });

      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada exitosamente',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn(`${req.method} ${req.originalUrl} - Datos inválidos para cambiar contraseña`, {
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      logger.error(`${req.method} ${req.originalUrl} - Error al cambiar contraseña`, {
        usuarioId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        logger.warn(`${req.method} ${req.originalUrl} - ID inválido proporcionado`, {
          id: req.params.id,
        });
        return res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
      }

      logger.info(`${req.method} ${req.originalUrl} - Eliminando usuario ID: ${id}`);

      // Eliminar usuario
      await usuariosService.delete(id);

      logger.info(`${req.method} ${req.originalUrl} - Usuario eliminado exitosamente`, {
        usuarioId: id,
      });

      res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente',
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al eliminar usuario`, {
        usuarioId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }
}

export const usuariosController = new UsuariosController();
