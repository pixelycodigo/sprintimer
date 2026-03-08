import { Request, Response, NextFunction } from 'express';
import { proyectoService } from '../services/proyecto.service.js';
import { proyectoCreateSchema, proyectoParamsSchema } from '../validators/proyecto.validator.js';

export class ProyectoController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, cliente_id } = req.query;

      let proyectos;
      if (cliente_id) {
        proyectos = await proyectoService.findByClienteId(Number(cliente_id));
      } else if (search) {
        proyectos = await proyectoService.search(search as string);
      } else {
        proyectos = await proyectoService.findAll();
      }

      res.json({
        success: true,
        data: proyectos,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = proyectoParamsSchema.parse(req.params);
      const proyecto = await proyectoService.findById(Number(id));

      res.json({
        success: true,
        data: proyecto,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = proyectoCreateSchema.parse(req.body);
      const proyecto = await proyectoService.create(data);

      res.status(201).json({
        success: true,
        data: proyecto,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = proyectoParamsSchema.parse(req.params);
      const data = proyectoCreateSchema.partial().parse(req.body);
      const proyecto = await proyectoService.update(Number(id), data);

      res.json({
        success: true,
        data: proyecto,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = proyectoParamsSchema.parse(req.params);
      await proyectoService.softDelete(Number(id));

      res.json({
        success: true,
        message: 'Proyecto eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const proyectoController = new ProyectoController();
