import { Request, Response, NextFunction } from 'express';
import { clienteService } from '../services/cliente.service.js';
import { clienteCreateSchema, clienteUpdateSchema, clienteParamsSchema } from '../validators/cliente.validator.js';

export class ClienteController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;

      let clientes;
      if (search) {
        clientes = await clienteService.search(search as string);
      } else {
        clientes = await clienteService.findAll();
      }

      res.json({
        success: true,
        data: clientes,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = clienteParamsSchema.parse(req.params);
      const cliente = await clienteService.findById(Number(id));

      res.json({
        success: true,
        data: cliente,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = clienteCreateSchema.parse(req.body);
      const cliente = await clienteService.create(data);

      res.status(201).json({
        success: true,
        data: cliente,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = clienteParamsSchema.parse(req.params);
      const data = clienteUpdateSchema.parse(req.body);
      const cliente = await clienteService.update(Number(id), data);

      res.json({
        success: true,
        data: cliente,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = clienteParamsSchema.parse(req.params);
      await clienteService.softDelete(Number(id));

      res.json({
        success: true,
        message: 'Cliente eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const clienteController = new ClienteController();
