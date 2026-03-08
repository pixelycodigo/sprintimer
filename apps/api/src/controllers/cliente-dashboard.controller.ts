import { Request, Response, NextFunction } from 'express';
import { clienteDashboardService } from '../services/cliente-dashboard.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { db } from '../config/database.js';

export class ClienteDashboardController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const cliente = await db('clientes')
        .select('id')
        .where('email', req.user?.email)
        .first();

      if (!cliente) {
        throw new AppError('Cliente no encontrado', 404);
      }

      const stats = await clienteDashboardService.getStats(cliente.id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProyectos(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const cliente = await db('clientes')
        .select('id')
        .where('email', req.user?.email)
        .first();

      if (!cliente) {
        throw new AppError('Cliente no encontrado', 404);
      }

      const proyectos = await clienteDashboardService.getProyectos(cliente.id);

      res.json({
        success: true,
        data: proyectos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActividades(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const cliente = await db('clientes')
        .select('id')
        .where('email', req.user?.email)
        .first();

      if (!cliente) {
        throw new AppError('Cliente no encontrado', 404);
      }

      const actividades = await clienteDashboardService.getActividades(cliente.id);

      res.json({
        success: true,
        data: actividades,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const clienteDashboardController = new ClienteDashboardController();
