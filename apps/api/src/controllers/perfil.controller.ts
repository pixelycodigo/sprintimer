import { Request, Response, NextFunction } from 'express';
import { perfilService } from '../services/perfil.service.js';
import { perfilCreateSchema, perfilParamsSchema } from '../validators/perfil.validator.js';

export class PerfilController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const perfiles = await perfilService.findAll();

      res.json({
        success: true,
        data: perfiles,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = perfilParamsSchema.parse(req.params);
      const perfil = await perfilService.findById(Number(id));

      res.json({
        success: true,
        data: perfil,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = perfilCreateSchema.parse(req.body);
      const perfil = await perfilService.create(data);

      res.status(201).json({
        success: true,
        data: perfil,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = perfilParamsSchema.parse(req.params);
      const data = perfilCreateSchema.partial().parse(req.body);
      const perfil = await perfilService.update(Number(id), data);

      res.json({
        success: true,
        data: perfil,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = perfilParamsSchema.parse(req.params);
      await perfilService.softDelete(Number(id));

      res.json({
        success: true,
        message: 'Perfil eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const perfilController = new PerfilController();
