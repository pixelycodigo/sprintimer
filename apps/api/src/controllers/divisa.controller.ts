import { Request, Response, NextFunction } from 'express';
import { divisaService } from '../services/divisa.service.js';
import { divisaCreateSchema, divisaParamsSchema } from '../validators/divisa.validator.js';

export class DivisaController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const divisas = await divisaService.findAll();

      res.json({
        success: true,
        data: divisas,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = divisaParamsSchema.parse(req.params);
      const divisa = await divisaService.findById(Number(id));

      res.json({
        success: true,
        data: divisa,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = divisaCreateSchema.parse(req.body);
      const divisa = await divisaService.create(data);

      res.status(201).json({
        success: true,
        data: divisa,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = divisaParamsSchema.parse(req.params);
      const data = divisaCreateSchema.partial().parse(req.body);
      const divisa = await divisaService.update(Number(id), data);

      res.json({
        success: true,
        data: divisa,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = divisaParamsSchema.parse(req.params);
      await divisaService.softDelete(Number(id));

      res.json({
        success: true,
        message: 'Divisa eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const divisaController = new DivisaController();
