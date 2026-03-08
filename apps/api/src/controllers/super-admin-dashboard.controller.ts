import { Request, Response, NextFunction } from 'express';
import { superAdminDashboardService } from '../services/super-admin-dashboard.service.js';

export class SuperAdminDashboardController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await superAdminDashboardService.getStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const superAdminDashboardController = new SuperAdminDashboardController();
