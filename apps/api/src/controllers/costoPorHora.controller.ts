import { Request, Response, NextFunction } from 'express';
import { costoPorHoraService } from '../services/costoPorHora.service.js';
import { costoPorHoraCreateSchema, costoPorHoraParamsSchema } from '../validators/costoPorHora.validator.js';
import logger from '../config/logger.js';

export class CostoPorHoraController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(`${req.method} ${req.originalUrl} - Listando todos los costos por hora`);
      const costos = await costoPorHoraService.findAll();

      logger.info(`${req.method} ${req.originalUrl} - Costos por hora listados exitosamente`, {
        total: costos.length,
      });

      res.json({
        success: true,
        data: costos,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al listar costos por hora`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = costoPorHoraParamsSchema.parse(req.params);
      logger.debug(`${req.method} ${req.originalUrl} - Buscando costo por hora ID: ${id}`);

      const costo = await costoPorHoraService.findById(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Costo por hora encontrado`, {
        costoId: id,
        valor: costo!.costo_hora,
      });

      res.json({
        success: true,
        data: costo,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Costo por hora no encontrado') {
        logger.warn(`${req.method} ${req.originalUrl} - Costo por hora no encontrado`, {
          costoId: req.params.id,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al buscar costo por hora`, {
          costoId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = costoPorHoraCreateSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Creando nuevo costo por hora`, {
        costo_hora: data.costo_hora,
        seniority_id: data.seniority_id,
        perfil_id: data.perfil_id,
      });

      const costo = await costoPorHoraService.create(data);

      logger.info(`${req.method} ${req.originalUrl} - Costo por hora creado exitosamente`, {
        costoId: costo.id,
        valor: costo!.costo_hora,
      });

      res.status(201).json({
        success: true,
        data: costo,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al crear costo por hora`, {
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = costoPorHoraParamsSchema.parse(req.params);
      const data = costoPorHoraCreateSchema.partial().parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Actualizando costo por hora ID: ${id}`, {
        data,
      });

      const costo = await costoPorHoraService.update(Number(id), data);

      logger.info(`${req.method} ${req.originalUrl} - Costo por hora actualizado exitosamente`, {
        costoId: id,
        valor: costo!.costo_hora,
      });

      res.json({
        success: true,
        data: costo,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al actualizar costo por hora`, {
        costoId: req.params.id,
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = costoPorHoraParamsSchema.parse(req.params);
      logger.info(`${req.method} ${req.originalUrl} - Eliminando costo por hora ID: ${id}`);

      await costoPorHoraService.softDelete(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Costo por hora eliminado exitosamente`, {
        costoId: id,
      });

      res.json({
        success: true,
        message: 'Costo por hora eliminado exitosamente',
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al eliminar costo por hora`, {
        costoId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }
}

export const costoPorHoraController = new CostoPorHoraController();
