import { Request, Response, NextFunction } from 'express';
import { clienteDashboardService } from '../services/cliente-dashboard.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { db } from '../config/database.js';
import logger from '../config/logger.js';

export class ClienteDashboardController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.debug(`${req.method} ${req.originalUrl} - Obteniendo estadísticas para cliente`, { userId });

      const cliente = await db('clientes')
        .select('id')
        .where('email', req.user?.email)
        .first();

      if (!cliente) {
        logger.warn(`${req.method} ${req.originalUrl} - Cliente no encontrado`, { userId });
        throw new AppError('Cliente no encontrado', 404);
      }

      const stats = await clienteDashboardService.getStats(cliente.id);

      logger.info(`${req.method} ${req.originalUrl} - Estadísticas de cliente obtenidas exitosamente`, {
        clienteId: cliente.id,
      });

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn(`${req.method} ${req.originalUrl} - Error al obtener estadísticas de cliente`, {
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al obtener estadísticas de cliente`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async getProyectos(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.debug(`${req.method} ${req.originalUrl} - Obteniendo proyectos para cliente`, { userId });

      const cliente = await db('clientes')
        .select('id')
        .where('email', req.user?.email)
        .first();

      if (!cliente) {
        logger.warn(`${req.method} ${req.originalUrl} - Cliente no encontrado`, { userId });
        throw new AppError('Cliente no encontrado', 404);
      }

      const proyectos = await clienteDashboardService.getProyectos(cliente.id);

      logger.info(`${req.method} ${req.originalUrl} - Proyectos de cliente obtenidos exitosamente`, {
        clienteId: cliente.id,
        total: proyectos.length,
      });

      res.json({
        success: true,
        data: proyectos,
      });
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn(`${req.method} ${req.originalUrl} - Error al obtener proyectos de cliente`, {
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al obtener proyectos de cliente`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async getActividades(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.debug(`${req.method} ${req.originalUrl} - Obteniendo actividades para cliente`, { userId });

      const cliente = await db('clientes')
        .select('id')
        .where('email', req.user?.email)
        .first();

      if (!cliente) {
        logger.warn(`${req.method} ${req.originalUrl} - Cliente no encontrado`, { userId });
        throw new AppError('Cliente no encontrado', 404);
      }

      const actividades = await clienteDashboardService.getActividades(cliente.id);

      logger.info(`${req.method} ${req.originalUrl} - Actividades de cliente obtenidas exitosamente`, {
        clienteId: cliente.id,
        total: actividades.length,
      });

      res.json({
        success: true,
        data: actividades,
      });
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn(`${req.method} ${req.originalUrl} - Error al obtener actividades de cliente`, {
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al obtener actividades de cliente`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }
}

export const clienteDashboardController = new ClienteDashboardController();
