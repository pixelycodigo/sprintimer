import { Request, Response, NextFunction } from 'express';
import { usuariosService } from '../services/usuarios.service.js';
import { createUsuarioSchema, updateUsuarioSchema, changePasswordSchema } from '../validators/usuarios.validator.js';
import { z } from 'zod';

export class UsuariosController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarios = await usuariosService.findAllAdmins();

      res.status(200).json({
        success: true,
        data: usuarios,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
      }

      const usuario = await usuariosService.findById(id);

      res.status(200).json({
        success: true,
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar datos de entrada
      const validatedData = createUsuarioSchema.parse(req.body);

      // Crear usuario
      const usuario = await usuariosService.create(validatedData);

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuario,
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

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
      }

      // Validar datos de entrada
      const validatedData = updateUsuarioSchema.parse(req.body);

      // Actualizar usuario
      const usuario = await usuariosService.update(id, validatedData);

      res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuario,
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
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
      }

      // Validar datos de entrada
      const validatedData = changePasswordSchema.parse(req.body);

      // Cambiar contraseña
      await usuariosService.changePassword(id, validatedData.password);

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

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
      }

      // Eliminar usuario
      await usuariosService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const usuariosController = new UsuariosController();
