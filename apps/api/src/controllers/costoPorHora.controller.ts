import { Request, Response, NextFunction } from 'express';
import { costoPorHoraService } from '../services/costoPorHora.service.js';
import { costoPorHoraCreateSchema, costoPorHoraParamsSchema } from '../validators/costoPorHora.validator.js';

export class CostoPorHoraController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const costos = await costoPorHoraService.findAll();

      res.json({
        success: true,
        data: costos,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = costoPorHoraParamsSchema.parse(req.params);
      const costo = await costoPorHoraService.findById(Number(id));

      res.json({
        success: true,
        data: costo,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = costoPorHoraCreateSchema.parse(req.body);
      const costo = await costoPorHoraService.create(data);

      res.status(201).json({
        success: true,
        data: costo,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = costoPorHoraParamsSchema.parse(req.params);
      const data = costoPorHoraCreateSchema.partial().parse(req.body);
      const costo = await costoPorHoraService.update(Number(id), data);

      res.json({
        success: true,
        data: costo,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = costoPorHoraParamsSchema.parse(req.params);
      await costoPorHoraService.softDelete(Number(id));

      res.json({
        success: true,
        message: 'Costo por hora eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const costoPorHoraController = new CostoPorHoraController();
