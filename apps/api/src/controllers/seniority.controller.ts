import { Request, Response, NextFunction } from 'express';
import { seniorityService } from '../services/seniority.service.js';
import { seniorityCreateSchema, seniorityParamsSchema } from '../validators/seniority.validator.js';
import logger from '../config/logger.js';

export class SeniorityController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(`${req.method} ${req.originalUrl} - Listando todos los seniorities`);
      const seniorities = await seniorityService.findAll();

      logger.info(`${req.method} ${req.originalUrl} - Seniorities listados exitosamente`, {
        total: seniorities.length,
      });

      res.json({
        success: true,
        data: seniorities,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al listar seniorities`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = seniorityParamsSchema.parse(req.params);
      logger.debug(`${req.method} ${req.originalUrl} - Buscando seniority ID: ${id}`);

      const seniority = await seniorityService.findById(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Seniority encontrado`, {
        seniorityId: id,
        nombre: seniority!.nombre,
      });

      res.json({
        success: true,
        data: seniority,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Seniority no encontrado') {
        logger.warn(`${req.method} ${req.originalUrl} - Seniority no encontrado`, {
          seniorityId: req.params.id,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al buscar seniority`, {
          seniorityId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = seniorityCreateSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Creando nuevo seniority`, {
        nombre: data.nombre,
      });

      const seniority = await seniorityService.create(data);

      logger.info(`${req.method} ${req.originalUrl} - Seniority creado exitosamente`, {
        seniorityId: seniority.id,
        nombre: seniority!.nombre,
      });

      res.status(201).json({
        success: true,
        data: seniority,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al crear seniority`, {
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = seniorityParamsSchema.parse(req.params);
      const data = seniorityCreateSchema.partial().parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Actualizando seniority ID: ${id}`, {
        data,
      });

      const seniority = await seniorityService.update(Number(id), data);

      logger.info(`${req.method} ${req.originalUrl} - Seniority actualizado exitosamente`, {
        seniorityId: id,
        nombre: seniority!.nombre,
      });

      res.json({
        success: true,
        data: seniority,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al actualizar seniority`, {
        seniorityId: req.params.id,
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = seniorityParamsSchema.parse(req.params);
      logger.info(`${req.method} ${req.originalUrl} - Eliminando seniority ID: ${id}`);

      await seniorityService.softDelete(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Seniority eliminado exitosamente`, {
        seniorityId: id,
      });

      res.json({
        success: true,
        message: 'Seniority eliminado exitosamente',
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al eliminar seniority`, {
        seniorityId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }
}

export const seniorityController = new SeniorityController();
