import { Request, Response, NextFunction } from 'express';
import { seniorityService } from '../services/seniority.service.js';
import { seniorityCreateSchema, seniorityParamsSchema } from '../validators/seniority.validator.js';

export class SeniorityController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const seniorities = await seniorityService.findAll();

      res.json({
        success: true,
        data: seniorities,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = seniorityParamsSchema.parse(req.params);
      const seniority = await seniorityService.findById(Number(id));

      res.json({
        success: true,
        data: seniority,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = seniorityCreateSchema.parse(req.body);
      const seniority = await seniorityService.create(data);

      res.status(201).json({
        success: true,
        data: seniority,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = seniorityParamsSchema.parse(req.params);
      const data = seniorityCreateSchema.partial().parse(req.body);
      const seniority = await seniorityService.update(Number(id), data);

      res.json({
        success: true,
        data: seniority,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = seniorityParamsSchema.parse(req.params);
      await seniorityService.softDelete(Number(id));

      res.json({
        success: true,
        message: 'Seniority eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const seniorityController = new SeniorityController();
