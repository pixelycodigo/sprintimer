import { Request, Response, NextFunction } from 'express';
import { divisaService } from '../services/divisa.service.js';
import { divisaCreateSchema, divisaParamsSchema } from '../validators/divisa.validator.js';
import logger from '../config/logger.js';

export class DivisaController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(`${req.method} ${req.originalUrl} - Listando todas las divisas`);
      const divisas = await divisaService.findAll();

      logger.info(`${req.method} ${req.originalUrl} - Divisas listadas exitosamente`, {
        total: divisas.length,
      });

      res.json({
        success: true,
        data: divisas,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al listar divisas`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = divisaParamsSchema.parse(req.params);
      logger.debug(`${req.method} ${req.originalUrl} - Buscando divisa ID: ${id}`);

      const divisa = await divisaService.findById(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Divisa encontrada`, {
        divisaId: id,
        codigo: divisa.codigo,
        nombre: divisa.nombre,
      });

      res.json({
        success: true,
        data: divisa,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Divisa no encontrada') {
        logger.warn(`${req.method} ${req.originalUrl} - Divisa no encontrada`, {
          divisaId: req.params.id,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al buscar divisa`, {
          divisaId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = divisaCreateSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Creando nueva divisa`, {
        codigo: data.codigo,
        nombre: data.nombre,
      });

      const divisa = await divisaService.create(data);

      logger.info(`${req.method} ${req.originalUrl} - Divisa creada exitosamente`, {
        divisaId: divisa.id,
        codigo: divisa.codigo,
        nombre: divisa.nombre,
      });

      res.status(201).json({
        success: true,
        data: divisa,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al crear divisa`, {
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = divisaParamsSchema.parse(req.params);
      const data = divisaCreateSchema.partial().parse(req.body);

      logger.info(`${req.method} ${req.originalUrl} - Actualizando divisa ID: ${id}`, {
        data,
      });

      const divisa = await divisaService.update(Number(id), data);

      logger.info(`${req.method} ${req.originalUrl} - Divisa actualizada exitosamente`, {
        divisaId: id,
        codigo: divisa.codigo,
        nombre: divisa.nombre,
      });

      res.json({
        success: true,
        data: divisa,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al actualizar divisa`, {
        divisaId: req.params.id,
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = divisaParamsSchema.parse(req.params);
      logger.info(`${req.method} ${req.originalUrl} - Eliminando divisa ID: ${id}`);

      await divisaService.softDelete(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Divisa eliminada exitosamente`, {
        divisaId: id,
      });

      res.json({
        success: true,
        message: 'Divisa eliminada exitosamente',
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al eliminar divisa`, {
        divisaId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }
}

export const divisaController = new DivisaController();
