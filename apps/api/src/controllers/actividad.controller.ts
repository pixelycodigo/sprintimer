import { Request, Response, NextFunction } from 'express';
import { actividadService } from '../services/actividad.service.js';
import { actividadCreateSchema, actividadParamsSchema } from '../validators/actividad.validator.js';

export class ActividadController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, proyecto_id } = req.query;

      let actividades;
      if (proyecto_id) {
        actividades = await actividadService.findByProyectoId(Number(proyecto_id));
      } else if (search) {
        actividades = await actividadService.search(search as string);
      } else {
        actividades = await actividadService.findAll();
      }

      res.json({
        success: true,
        data: actividades,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = actividadParamsSchema.parse(req.params);
      const actividad = await actividadService.findById(Number(id));

      res.json({
        success: true,
        data: actividad,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = actividadCreateSchema.parse(req.body);
      const actividad = await actividadService.create(data);

      res.status(201).json({
        success: true,
        data: actividad,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = actividadParamsSchema.parse(req.params);
      const data = actividadCreateSchema.partial().parse(req.body);
      const actividad = await actividadService.update(Number(id), data);

      res.json({
        success: true,
        data: actividad,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = actividadParamsSchema.parse(req.params);
      await actividadService.softDelete(Number(id));

      res.json({
        success: true,
        message: 'Actividad eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const actividadController = new ActividadController();
