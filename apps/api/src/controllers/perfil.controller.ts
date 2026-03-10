import { Request, Response, NextFunction } from 'express';
import { perfilService } from '../services/perfil.service.js';
import { perfilCreateSchema, perfilParamsSchema } from '../validators/perfil.validator.js';
import logger from '../config/logger.js';

export class PerfilController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(`${req.method} ${req.originalUrl} - Listando todos los perfiles`);
      const perfiles = await perfilService.findAll();

      logger.info(`${req.method} ${req.originalUrl} - Perfiles listados exitosamente`, {
        total: perfiles.length,
      });

      res.json({
        success: true,
        data: perfiles,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al listar perfiles`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = perfilParamsSchema.parse(req.params);
      logger.debug(`${req.method} ${req.originalUrl} - Buscando perfil ID: ${id}`);

      const perfil = await perfilService.findById(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Perfil encontrado`, {
        perfilId: id,
        nombre: perfil!.nombre,
      });

      res.json({
        success: true,
        data: perfil,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Perfil no encontrado') {
        logger.warn(`${req.method} ${req.originalUrl} - Perfil no encontrado`, {
          perfilId: req.params.id,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al buscar perfil`, {
          perfilId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = perfilCreateSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Creando nuevo perfil`, {
        nombre: data.nombre,
      });

      const perfil = await perfilService.create(data);

      logger.info(`${req.method} ${req.originalUrl} - Perfil creado exitosamente`, {
        perfilId: perfil.id,
        nombre: perfil!.nombre,
      });

      res.status(201).json({
        success: true,
        data: perfil,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al crear perfil`, {
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = perfilParamsSchema.parse(req.params);
      const data = perfilCreateSchema.partial().parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Actualizando perfil ID: ${id}`, {
        data,
      });

      const perfil = await perfilService.update(Number(id), data);

      logger.info(`${req.method} ${req.originalUrl} - Perfil actualizado exitosamente`, {
        perfilId: id,
        nombre: perfil!.nombre,
      });

      res.json({
        success: true,
        data: perfil,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al actualizar perfil`, {
        perfilId: req.params.id,
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = perfilParamsSchema.parse(req.params);
      logger.info(`${req.method} ${req.originalUrl} - Eliminando perfil ID: ${id}`);

      await perfilService.softDelete(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Perfil eliminado exitosamente`, {
        perfilId: id,
      });

      res.json({
        success: true,
        message: 'Perfil eliminado exitosamente',
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al eliminar perfil`, {
        perfilId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }
}

export const perfilController = new PerfilController();
