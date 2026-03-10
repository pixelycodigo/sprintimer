import { Request, Response, NextFunction } from 'express';
import { talentService } from '../services/talent.service.js';
import { talentCreateSchema, talentUpdateSchema, talentParamsSchema, talentPasswordSchema } from '../validators/talent.validator.js';
import logger from '../config/logger.js';

export class TalentController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(`${req.method} ${req.originalUrl} - Listando todos los talents`);
      const talents = await talentService.findAll();

      logger.info(`${req.method} ${req.originalUrl} - Talents listados exitosamente`, {
        total: talents.length,
      });

      res.json({
        success: true,
        data: talents,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al listar talents`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = talentParamsSchema.parse(req.params);
      logger.debug(`${req.method} ${req.originalUrl} - Buscando talent ID: ${id}`);

      const talent = await talentService.findById(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Talent encontrado`, {
        talentId: id,
        nombre_completo: talent!.nombre_completo,
      });

      res.json({
        success: true,
        data: talent,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Talent no encontrado') {
        logger.warn(`${req.method} ${req.originalUrl} - Talent no encontrado`, {
          talentId: req.params.id,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al buscar talent`, {
          talentId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = talentCreateSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Creando nuevo talent`, {
        nombre_completo: data.nombre_completo,
        email: data.email,
      });

      const talent = await talentService.create(data);

      logger.info(`${req.method} ${req.originalUrl} - Talent creado exitosamente`, {
        talentId: talent.id,
        nombre_completo: talent!.nombre_completo,
      });

      res.status(201).json({
        success: true,
        data: talent,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al crear talent`, {
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = talentParamsSchema.parse(req.params);
      const data = talentUpdateSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Actualizando talent ID: ${id}`, {
        data,
      });

      const talent = await talentService.update(Number(id), data);

      logger.info(`${req.method} ${req.originalUrl} - Talent actualizado exitosamente`, {
        talentId: id,
        nombre_completo: talent!.nombre_completo,
      });

      res.json({
        success: true,
        data: talent,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al actualizar talent`, {
        talentId: req.params.id,
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = talentParamsSchema.parse(req.params);
      const eliminadoPor = req.user?.id;
      logger.info(`${req.method} ${req.originalUrl} - Eliminando talent ID: ${id}`, {
        eliminadoPor,
      });

      await talentService.softDelete(Number(id), eliminadoPor);

      logger.info(`${req.method} ${req.originalUrl} - Talent eliminado exitosamente`, {
        talentId: id,
      });

      res.json({
        success: true,
        message: 'Talent eliminado exitosamente',
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al eliminar talent`, {
        talentId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = talentParamsSchema.parse(req.params);
      const validatedData = talentPasswordSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Cambiando contraseña para talent ID: ${id}`);

      await talentService.changePassword(Number(id), validatedData.password);

      logger.info(`${req.method} ${req.originalUrl} - Contraseña cambiada exitosamente`, {
        talentId: id,
      });

      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente',
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al cambiar contraseña`, {
        talentId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }
}

export const talentController = new TalentController();
