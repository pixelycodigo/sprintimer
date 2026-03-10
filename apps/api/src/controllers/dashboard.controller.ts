import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import logger from '../config/logger.js';

export class DashboardController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(`${req.method} ${req.originalUrl} - Obteniendo estadísticas del dashboard`);
      const stats = await dashboardService.getStats();

      logger.info(`${req.method} ${req.originalUrl} - Estadísticas obtenidas exitosamente`);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al obtener estadísticas del dashboard`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
