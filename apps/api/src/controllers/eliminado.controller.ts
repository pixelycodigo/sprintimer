import { Request, Response, NextFunction } from 'express';
import { eliminadoService } from '../services/eliminado.service.js';
import { eliminadoParamsSchema } from '../validators/eliminado.validator.js';
import logger from '../config/logger.js';

export class EliminadoController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { tipo } = req.query;
      logger.debug(`${req.method} ${req.originalUrl} - Listando elementos eliminados`, { tipo });

      let eliminados;
      if (tipo) {
        logger.debug(`${req.method} ${req.originalUrl} - Buscando eliminados por tipo: ${tipo}`);
        eliminados = await eliminadoService.findByTipo(tipo as string);
      } else {
        eliminados = await eliminadoService.findAll();
      }

      logger.info(`${req.method} ${req.originalUrl} - Elementos eliminados listados exitosamente`, {
        total: eliminados.length,
      });

      res.json({
        success: true,
        data: eliminados,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al listar elementos eliminados`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = eliminadoParamsSchema.parse(req.params);
      logger.debug(`${req.method} ${req.originalUrl} - Buscando elemento eliminado ID: ${id}`);

      const eliminado = await eliminadoService.findById(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Elemento eliminado encontrado`, {
        eliminadoId: id,
        item_tipo: eliminado!.item_tipo,
      });

      res.json({
        success: true,
        data: eliminado,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Elemento eliminado no encontrado') {
        logger.warn(`${req.method} ${req.originalUrl} - Elemento eliminado no encontrado`, {
          eliminadoId: req.params.id,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al buscar elemento eliminado`, {
          eliminadoId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = eliminadoParamsSchema.parse(req.params);
      logger.info(`${req.method} ${req.originalUrl} - Restaurando elemento eliminado ID: ${id}`);

      const eliminado = await eliminadoService.restore(Number(id));

      if (!eliminado) {
        logger.warn(`${req.method} ${req.originalUrl} - Elemento no encontrado para restaurar`, {
          eliminadoId: id,
        });
        return res.status(404).json({
          success: false,
          message: 'Elemento no encontrado',
        });
      }

      logger.info(`${req.method} ${req.originalUrl} - Elemento restaurado exitosamente`, {
        eliminadoId: id,
        item_tipo: eliminado!.item_tipo,
      });

      res.json({
        success: true,
        message: 'Elemento restaurado exitosamente',
        data: eliminado,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al restaurar elemento eliminado`, {
        eliminadoId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = eliminadoParamsSchema.parse(req.params);
      logger.info(`${req.method} ${req.originalUrl} - Eliminando permanentemente elemento ID: ${id}`);

      await eliminadoService.delete(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Elemento eliminado permanentemente`, {
        eliminadoId: id,
      });

      res.json({
        success: true,
        message: 'Elemento eliminado permanentemente',
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al eliminar elemento permanentemente`, {
        eliminadoId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }
}

export const eliminadoController = new EliminadoController();
