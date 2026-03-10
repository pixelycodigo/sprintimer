import { Request, Response, NextFunction } from 'express';
import { actividadService } from '../services/actividad.service.js';
import { actividadCreateSchema, actividadParamsSchema } from '../validators/actividad.validator.js';
import logger from '../config/logger.js';

export class ActividadController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, proyecto_id } = req.query;
      logger.debug(`${req.method} ${req.originalUrl} - Listando actividades`, { search, proyecto_id });

      let actividades;
      if (proyecto_id) {
        logger.debug(`${req.method} ${req.originalUrl} - Buscando actividades por proyecto ID: ${proyecto_id}`);
        actividades = await actividadService.findByProyectoId(Number(proyecto_id));
      } else if (search) {
        logger.debug(`${req.method} ${req.originalUrl} - Buscando actividades con término: ${search}`);
        actividades = await actividadService.search(search as string);
      } else {
        actividades = await actividadService.findAll();
      }

      logger.info(`${req.method} ${req.originalUrl} - Actividades listadas exitosamente`, {
        total: actividades.length,
      });

      res.json({
        success: true,
        data: actividades,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al listar actividades`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = actividadParamsSchema.parse(req.params);
      logger.debug(`${req.method} ${req.originalUrl} - Buscando actividad ID: ${id}`);

      const actividad = await actividadService.findById(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Actividad encontrada`, {
        actividadId: id,
        nombre: actividad!.nombre,
      });

      res.json({
        success: true,
        data: actividad,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Actividad no encontrada') {
        logger.warn(`${req.method} ${req.originalUrl} - Actividad no encontrada`, {
          actividadId: req.params.id,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al buscar actividad`, {
          actividadId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = actividadCreateSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Creando nueva actividad`, {
        nombre: data.nombre,
        proyecto_id: data.proyecto_id,
      });

      const actividad = await actividadService.create(data);

      logger.info(`${req.method} ${req.originalUrl} - Actividad creada exitosamente`, {
        actividadId: actividad.id,
        nombre: actividad!.nombre,
      });

      res.status(201).json({
        success: true,
        data: actividad,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al crear actividad`, {
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = actividadParamsSchema.parse(req.params);
      const data = actividadCreateSchema.partial().parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Actualizando actividad ID: ${id}`, {
        data,
      });

      const actividad = await actividadService.update(Number(id), data);

      logger.info(`${req.method} ${req.originalUrl} - Actividad actualizada exitosamente`, {
        actividadId: id,
        nombre: actividad!.nombre,
      });

      res.json({
        success: true,
        data: actividad,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al actualizar actividad`, {
        actividadId: req.params.id,
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = actividadParamsSchema.parse(req.params);
      logger.info(`${req.method} ${req.originalUrl} - Eliminando actividad ID: ${id}`);

      await actividadService.softDelete(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Actividad eliminada exitosamente`, {
        actividadId: id,
      });

      res.json({
        success: true,
        message: 'Actividad eliminada exitosamente',
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al eliminar actividad`, {
        actividadId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }
}

export const actividadController = new ActividadController();
