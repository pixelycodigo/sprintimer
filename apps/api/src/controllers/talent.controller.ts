import { Request, Response, NextFunction } from 'express';
import { talentService } from '../services/talent.service.js';
import { talentCreateSchema, talentParamsSchema, talentPasswordSchema } from '../validators/talent.validator.js';

export class TalentController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const talents = await talentService.findAll();

      res.json({
        success: true,
        data: talents,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = talentParamsSchema.parse(req.params);
      const talent = await talentService.findById(Number(id));

      res.json({
        success: true,
        data: talent,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = talentCreateSchema.parse(req.body);
      const talent = await talentService.create(data);

      res.status(201).json({
        success: true,
        data: talent,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = talentParamsSchema.parse(req.params);
      const data = talentCreateSchema.partial().parse(req.body);
      const talent = await talentService.update(Number(id), data);

      res.json({
        success: true,
        data: talent,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = talentParamsSchema.parse(req.params);
      await talentService.softDelete(Number(id));

      res.json({
        success: true,
        message: 'Talent eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = talentParamsSchema.parse(req.params);
      const { password } = talentPasswordSchema.parse(req.body);
      await talentService.changePassword(Number(id), password);

      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const talentController = new TalentController();
