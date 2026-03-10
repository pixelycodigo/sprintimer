import { Request, Response, NextFunction } from 'express';
import { superAdminDashboardService } from '../services/super-admin-dashboard.service.js';
import logger from '../config/logger.js';

export class SuperAdminDashboardController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(`${req.method} ${req.originalUrl} - Obteniendo estadísticas para super admin`);
      const stats = await superAdminDashboardService.getStats();

      logger.info(`${req.method} ${req.originalUrl} - Estadísticas de super admin obtenidas exitosamente`);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al obtener estadísticas de super admin`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }
}

export const superAdminDashboardController = new SuperAdminDashboardController();
