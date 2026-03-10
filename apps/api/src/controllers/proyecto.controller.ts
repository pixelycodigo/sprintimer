import { Request, Response, NextFunction } from 'express';
import { proyectoService } from '../services/proyecto.service.js';
import { proyectoCreateSchema, proyectoParamsSchema } from '../validators/proyecto.validator.js';
import logger from '../config/logger.js';

export class ProyectoController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, cliente_id } = req.query;
      logger.debug(`${req.method} ${req.originalUrl} - Listando proyectos`, { search, cliente_id });

      let proyectos;
      if (cliente_id) {
        logger.debug(`${req.method} ${req.originalUrl} - Buscando proyectos por cliente ID: ${cliente_id}`);
        proyectos = await proyectoService.findByClienteId(Number(cliente_id));
      } else if (search) {
        logger.debug(`${req.method} ${req.originalUrl} - Buscando proyectos con término: ${search}`);
        proyectos = await proyectoService.search(search as string);
      } else {
        proyectos = await proyectoService.findAll();
      }

      logger.info(`${req.method} ${req.originalUrl} - Proyectos listados exitosamente`, {
        total: proyectos.length,
      });

      res.json({
        success: true,
        data: proyectos,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al listar proyectos`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = proyectoParamsSchema.parse(req.params);
      logger.debug(`${req.method} ${req.originalUrl} - Buscando proyecto ID: ${id}`);

      const proyecto = await proyectoService.findById(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Proyecto encontrado`, {
        proyectoId: id,
        nombre: proyecto!.nombre,
      });

      res.json({
        success: true,
        data: proyecto,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Proyecto no encontrado') {
        logger.warn(`${req.method} ${req.originalUrl} - Proyecto no encontrado`, {
          proyectoId: req.params.id,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al buscar proyecto`, {
          proyectoId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = proyectoCreateSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Creando nuevo proyecto`, {
        nombre: data.nombre,
        cliente_id: data.cliente_id,
      });

      const proyecto = await proyectoService.create(data);

      logger.info(`${req.method} ${req.originalUrl} - Proyecto creado exitosamente`, {
        proyectoId: proyecto.id,
        nombre: proyecto!.nombre,
      });

      res.status(201).json({
        success: true,
        data: proyecto,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al crear proyecto`, {
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = proyectoParamsSchema.parse(req.params);
      const data = proyectoCreateSchema.partial().parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Actualizando proyecto ID: ${id}`, {
        data,
      });

      const proyecto = await proyectoService.update(Number(id), data);

      logger.info(`${req.method} ${req.originalUrl} - Proyecto actualizado exitosamente`, {
        proyectoId: id,
        nombre: proyecto!.nombre,
      });

      res.json({
        success: true,
        data: proyecto,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al actualizar proyecto`, {
        proyectoId: req.params.id,
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = proyectoParamsSchema.parse(req.params);
      logger.info(`${req.method} ${req.originalUrl} - Eliminando proyecto ID: ${id}`);

      await proyectoService.softDelete(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Proyecto eliminado exitosamente`, {
        proyectoId: id,
      });

      res.json({
        success: true,
        message: 'Proyecto eliminado exitosamente',
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al eliminar proyecto`, {
        proyectoId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }
}

export const proyectoController = new ProyectoController();
