import { Request, Response, NextFunction } from 'express';
import { clienteService } from '../services/cliente.service.js';
import { clienteCreateSchema, clienteUpdateSchema, clienteParamsSchema } from '../validators/cliente.validator.js';
import logger from '../config/logger.js';

export class ClienteController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      logger.debug(`${req.method} ${req.originalUrl} - Listando clientes`, { search });

      let clientes;
      if (search) {
        logger.debug(`${req.method} ${req.originalUrl} - Buscando clientes con término: ${search}`);
        clientes = await clienteService.search(search as string);
      } else {
        clientes = await clienteService.findAll();
      }

      logger.info(`${req.method} ${req.originalUrl} - Clientes listados exitosamente`, {
        total: clientes.length,
      });

      res.json({
        success: true,
        data: clientes,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al listar clientes`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = clienteParamsSchema.parse(req.params);
      logger.debug(`${req.method} ${req.originalUrl} - Buscando cliente ID: ${id}`);

      const cliente = await clienteService.findById(Number(id));

      logger.info(`${req.method} ${req.originalUrl} - Cliente encontrado`, {
        clienteId: id,
        nombre_cliente: cliente!.nombre_cliente,
      });

      res.json({
        success: true,
        data: cliente,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Cliente no encontrado') {
        logger.warn(`${req.method} ${req.originalUrl} - Cliente no encontrado`, {
          clienteId: req.params.id,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al buscar cliente`, {
          clienteId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(`${req.method} ${req.originalUrl} - Creando nuevo cliente`, {
        body: req.body,
      });
      
      const data = clienteCreateSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Datos validados exitosamente`, {
        nombre_cliente: data.nombre_cliente,
        email: data.email,
      });

      const cliente = await clienteService.create(data);

      logger.info(`${req.method} ${req.originalUrl} - Cliente creado exitosamente`, {
        clienteId: cliente.id,
        nombre_cliente: cliente!.nombre_cliente,
      });

      res.status(201).json({
        success: true,
        data: cliente,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al crear cliente`, {
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = clienteParamsSchema.parse(req.params);
      const data = clienteUpdateSchema.parse(req.body);
      logger.info(`${req.method} ${req.originalUrl} - Actualizando cliente ID: ${id}`, {
        data,
      });

      const cliente = await clienteService.update(Number(id), data);

      logger.info(`${req.method} ${req.originalUrl} - Cliente actualizado exitosamente`, {
        clienteId: id,
        nombre_cliente: cliente!.nombre_cliente,
      });

      res.json({
        success: true,
        data: cliente,
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al actualizar cliente`, {
        clienteId: req.params.id,
        body: req.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = clienteParamsSchema.parse(req.params);
      const eliminadoPor = req.user?.id;
      logger.info(`${req.method} ${req.originalUrl} - Eliminando cliente ID: ${id}`, {
        eliminadoPor,
      });

      await clienteService.softDelete(Number(id), eliminadoPor);

      logger.info(`${req.method} ${req.originalUrl} - Cliente eliminado exitosamente`, {
        clienteId: id,
      });

      res.json({
        success: true,
        message: 'Cliente eliminado exitosamente',
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al eliminar cliente`, {
        clienteId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }
}

export const clienteController = new ClienteController();
