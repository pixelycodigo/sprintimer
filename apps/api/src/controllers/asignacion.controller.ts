import { Request, Response, NextFunction } from 'express';
import { asignacionService } from '../services/asignacion.service.js';
import {
  asignacionCreateSchema,
  asignacionParamsSchema,
  asignacionBulkSchema,
} from '../validators/asignacion.validator.js';

export class AsignacionController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { actividad_id, talent_id } = req.query;

      let asignaciones;
      if (actividad_id) {
        asignaciones = await asignacionService.findByActividadId(Number(actividad_id));
      } else if (talent_id) {
        asignaciones = await asignacionService.findByTalentId(Number(talent_id));
      } else {
        asignaciones = await asignacionService.findAll();
      }

      res.json({
        success: true,
        data: asignaciones,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = asignacionParamsSchema.parse(req.params);
      const asignacion = await asignacionService.findById(Number(id));

      res.json({
        success: true,
        data: asignacion,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = asignacionCreateSchema.parse(req.body);
      const asignacion = await asignacionService.create(data);

      res.status(201).json({
        success: true,
        data: asignacion,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = asignacionParamsSchema.parse(req.params);
      await asignacionService.delete(Number(id));

      res.json({
        success: true,
        message: 'Asignación eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async createBulk(req: Request, res: Response, next: NextFunction) {
    try {
      const { actividad_id, talent_ids } = asignacionBulkSchema.parse(req.body);
      const asignaciones = await asignacionService.createBulk(actividad_id, talent_ids);

      res.status(201).json({
        success: true,
        data: asignaciones,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBulk(req: Request, res: Response, next: NextFunction) {
    try {
      const { actividad_id, talent_ids } = asignacionBulkSchema.parse(req.body);
      await asignacionService.deleteBulk(actividad_id, talent_ids);

      res.json({
        success: true,
        message: 'Asignaciones eliminadas exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const asignacionController = new AsignacionController();
