import { Request, Response, NextFunction } from 'express';
import { asignacionService } from '../services/asignacion.service.js';
import {
  asignacionCreateSchema,
  asignacionParamsSchema,
  asignacionBulkSchema,
} from '../validators/asignacion.validator.js';
import logger from '../config/logger.js';

export class AsignacionController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { actividad_id, talent_id } = req.query;
      logger.debug(`${req.method} ${req.originalUrl} - Listando asignaciones`, { actividad_id, talent_id });

      let asignaciones;
      if (actividad_id) {
        logger.debug(`${req.method} ${req.originalUrl} - Buscando asignaciones por actividad ID: ${actividad_id}`);
        asignaciones = await asignacionService.findByActividadId(Number(actividad_id));
      } else if (talent_id) {
        logger.debug(`${req.method} ${req.originalUrl} - Buscando asignaciones por talent ID: ${talent_id}`);
        asignaciones = await asignacionService.findByTalentId(Number(talent_id));
      } else {
        asignaciones = await asignacionService.findAll();
      }

      logger.info(`${req.method} ${req.originalUrl} - Asignaciones listadas exitosamente`, {
        total: asignaciones.length,
      });

      res.json({
        success: true,
        data: asignaciones,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al listar asignaciones`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = asignacionParamsSchema.parse(req.params);
      logger.debug(`${req.method} ${req.originalUrl} - Buscando asignación ID: ${id}`);

      const asignacion = await asignacionService.findById(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Asignación encontrada`, {
        asignacionId: id,
        actividad_id: asignacion!.actividad_id,
        talent_id: asignacion!.talent_id,
      });

      res.json({
        success: true,
        data: asignacion,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Asignación no encontrada') {
        logger.warn(`${req.method} ${req.originalUrl} - Asignación no encontrada`, {
          asignacionId: req.params.id,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al buscar asignación`, {
          asignacionId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = asignacionCreateSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Creando nueva asignación`, {
        actividad_id: data.actividad_id,
        talent_id: data.talent_id,
      });

      const asignacion = await asignacionService.create(data);

      logger.info(`${req.method} ${req.originalUrl} - Asignación creada exitosamente`, {
        asignacionId: asignacion.id,
        actividad_id: asignacion!.actividad_id,
        talent_id: asignacion!.talent_id,
      });

      res.status(201).json({
        success: true,
        data: asignacion,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al crear asignación`, {
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = asignacionParamsSchema.parse(req.params);
      const data = asignacionCreateSchema.partial().parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Actualizando asignación ID: ${id}`, {
        data,
      });

      const asignacion = await asignacionService.update(Number(id), data);

      logger.info(`${req.method} ${req.originalUrl} - Asignación actualizada exitosamente`, {
        asignacionId: id,
      });

      res.json({
        success: true,
        data: asignacion,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al actualizar asignación`, {
        asignacionId: req.params.id,
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = asignacionParamsSchema.parse(req.params);
      const eliminadoPor = req.user?.id;
      logger.info(`${req.method} ${req.originalUrl} - Eliminando asignación ID: ${id}`, {
        eliminadoPor,
      });

      await asignacionService.softDelete(Number(id), eliminadoPor);

      logger.info(`${req.method} ${req.originalUrl} - Asignación eliminada exitosamente`, {
        asignacionId: id,
      });

      res.json({
        success: true,
        message: 'Asignación eliminada exitosamente',
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al eliminar asignación`, {
        asignacionId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async createBulk(req: Request, res: Response, next: NextFunction) {
    try {
      const { actividad_id, talent_ids } = asignacionBulkSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Creando asignaciones en bloque`, {
        actividad_id,
        talent_ids_count: talent_ids.length,
      });

      const asignaciones = await asignacionService.createBulk(actividad_id, talent_ids);

      logger.info(`${req.method} ${req.originalUrl} - Asignaciones creadas exitosamente`, {
        actividad_id,
        total: asignaciones.length,
      });

      res.status(201).json({
        success: true,
        data: asignaciones,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al crear asignaciones en bloque`, {
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async deleteBulk(req: Request, res: Response, next: NextFunction) {
    try {
      const { actividad_id, talent_ids } = asignacionBulkSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Eliminando asignaciones en bloque`, {
        actividad_id,
        talent_ids_count: talent_ids.length,
      });

      await asignacionService.deleteBulk(actividad_id, talent_ids);

      logger.info(`${req.method} ${req.originalUrl} - Asignaciones eliminadas exitosamente`, {
        actividad_id,
        total: talent_ids.length,
      });

      res.json({
        success: true,
        message: 'Asignaciones eliminadas exitosamente',
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al eliminar asignaciones en bloque`, {
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }
}

export const asignacionController = new AsignacionController();
