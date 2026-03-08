import { Request, Response, NextFunction } from 'express';
import { eliminadoService } from '../services/eliminado.service.js';
import { eliminadoParamsSchema } from '../validators/eliminado.validator.js';

export class EliminadoController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { tipo } = req.query;

      let eliminados;
      if (tipo) {
        eliminados = await eliminadoService.findByTipo(tipo as string);
      } else {
        eliminados = await eliminadoService.findAll();
      }

      res.json({
        success: true,
        data: eliminados,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = eliminadoParamsSchema.parse(req.params);
      const eliminado = await eliminadoService.findById(Number(id));

      res.json({
        success: true,
        data: eliminado,
      });
    } catch (error) {
      next(error);
    }
  }

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = eliminadoParamsSchema.parse(req.params);
      const eliminado = await eliminadoService.restore(Number(id));

      if (!eliminado) {
        return res.status(404).json({
          success: false,
          message: 'Elemento no encontrado',
        });
      }

      res.json({
        success: true,
        message: 'Elemento restaurado exitosamente',
        data: eliminado,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = eliminadoParamsSchema.parse(req.params);
      await eliminadoService.delete(Number(id));

      res.json({
        success: true,
        message: 'Elemento eliminado permanentemente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const eliminadoController = new EliminadoController();
