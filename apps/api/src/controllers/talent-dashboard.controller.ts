import { Request, Response, NextFunction } from 'express';
import { talentDashboardService } from '../services/talent-dashboard.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { db } from '../config/database.js';
import logger from '../config/logger.js';

export class TalentDashboardController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.debug(`${req.method} ${req.originalUrl} - Obteniendo estadísticas para talent`, { userId });

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        logger.warn(`${req.method} ${req.originalUrl} - Talent no encontrado`, { userId });
        throw new AppError('Talent no encontrado', 404);
      }

      const stats = await talentDashboardService.getStats(talent.id);

      logger.info(`${req.method} ${req.originalUrl} - Estadísticas de talent obtenidas exitosamente`, {
        talentId: talent.id,
      });

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn(`${req.method} ${req.originalUrl} - Error al obtener estadísticas de talent`, {
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al obtener estadísticas de talent`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async getProyectos(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.debug(`${req.method} ${req.originalUrl} - Obteniendo proyectos para talent`, { userId });

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        logger.warn(`${req.method} ${req.originalUrl} - Talent no encontrado`, { userId });
        throw new AppError('Talent no encontrado', 404);
      }

      const proyectos = await talentDashboardService.getProyectos(talent.id);

      logger.info(`${req.method} ${req.originalUrl} - Proyectos de talent obtenidos exitosamente`, {
        talentId: talent.id,
        total: proyectos.length,
      });

      res.json({
        success: true,
        data: proyectos,
      });
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn(`${req.method} ${req.originalUrl} - Error al obtener proyectos de talent`, {
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al obtener proyectos de talent`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async getTareas(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.debug(`${req.method} ${req.originalUrl} - Obteniendo tareas para talent`, { userId });

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        logger.warn(`${req.method} ${req.originalUrl} - Talent no encontrado`, { userId });
        throw new AppError('Talent no encontrado', 404);
      }

      const tareas = await talentDashboardService.getTareas(talent.id);

      logger.info(`${req.method} ${req.originalUrl} - Tareas de talent obtenidas exitosamente`, {
        talentId: talent.id,
        total: tareas.length,
      });

      res.json({
        success: true,
        data: tareas,
      });
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn(`${req.method} ${req.originalUrl} - Error al obtener tareas de talent`, {
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al obtener tareas de talent`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async getActividades(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.debug(`${req.method} ${req.originalUrl} - Obteniendo actividades para talent`, { userId });

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        logger.warn(`${req.method} ${req.originalUrl} - Talent no encontrado`, { userId });
        throw new AppError('Talent no encontrado', 404);
      }

      const actividades = await talentDashboardService.getActividades(talent.id);

      logger.info(`${req.method} ${req.originalUrl} - Actividades de talent obtenidas exitosamente`, {
        talentId: talent.id,
        total: actividades.length,
      });

      res.json({
        success: true,
        data: actividades,
      });
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn(`${req.method} ${req.originalUrl} - Error al obtener actividades de talent`, {
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al obtener actividades de talent`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async getActividadesByProyecto(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { proyectoId } = req.params;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.debug(`${req.method} ${req.originalUrl} - Obteniendo actividades por proyecto para talent`, { userId, proyectoId });

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        logger.warn(`${req.method} ${req.originalUrl} - Talent no encontrado`, { userId });
        throw new AppError('Talent no encontrado', 404);
      }

      const actividades = await talentDashboardService.getActividadesByProyecto(talent.id, Number(proyectoId));

      logger.info(`${req.method} ${req.originalUrl} - Actividades por proyecto obtenidas exitosamente`, {
        talentId: talent.id,
        proyectoId,
        total: actividades.length,
      });

      res.json({
        success: true,
        data: actividades,
      });
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn(`${req.method} ${req.originalUrl} - Error al obtener actividades por proyecto`, {
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al obtener actividades por proyecto`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async toggleTarea(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { completado } = req.body;
      logger.info(`${req.method} ${req.originalUrl} - Actualizando estado de tarea ID: ${id}`, { completado });

      await db('tareas')
        .where('id', id)
        .update({ completado });

      logger.info(`${req.method} ${req.originalUrl} - Tarea actualizada exitosamente`, {
        tareaId: id,
        completado,
      });

      res.json({
        success: true,
        message: 'Tarea actualizada exitosamente',
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} - Error al actualizar tarea`, {
        tareaId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  async createTarea(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.debug(`${req.method} ${req.originalUrl} - Creando nueva tarea para talent`, { userId });

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        logger.warn(`${req.method} ${req.originalUrl} - Talent no encontrado`, { userId });
        throw new AppError('Talent no encontrado', 404);
      }

      const { actividad_id, nombre, descripcion, horas_registradas } = req.body;

      if (!actividad_id || !nombre) {
        logger.warn(`${req.method} ${req.originalUrl} - Datos incompletos para crear tarea`, {
          actividad_id,
          nombre,
        });
        throw new AppError('Actividad y nombre son requeridos', 400);
      }

      // Verificar que la actividad esté asignada al talent
      const actividadAsignada = await db('actividades_integrantes')
        .where('actividad_id', actividad_id)
        .where('talent_id', talent.id)
        .first();

      if (!actividadAsignada) {
        logger.warn(`${req.method} ${req.originalUrl} - Talent no tiene permiso para esta actividad`, {
          talentId: talent.id,
          actividad_id,
        });
        throw new AppError('No tienes permiso para crear tareas en esta actividad', 403);
      }

      const [tareaId] = await db('tareas').insert({
        actividad_id,
        talent_id: talent.id,
        nombre,
        descripcion: descripcion || null,
        horas_registradas: horas_registradas || 0,
        completado: false,
      });

      const tarea = await db('tareas').where('id', tareaId).first();

      logger.info(`${req.method} ${req.originalUrl} - Tarea creada exitosamente`, {
        tareaId,
        actividad_id,
        talentId: talent.id,
      });

      res.status(201).json({
        success: true,
        message: 'Tarea creada exitosamente',
        data: tarea,
      });
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn(`${req.method} ${req.originalUrl} - Error al crear tarea`, {
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al crear tarea`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async updateTarea(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.debug(`${req.method} ${req.originalUrl} - Actualizando tarea ID: ${id}`, { userId });

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        logger.warn(`${req.method} ${req.originalUrl} - Talent no encontrado`, { userId });
        throw new AppError('Talent no encontrado', 404);
      }

      // Verificar que la tarea pertenezca al talent
      const tareaExistente = await db('tareas')
        .where('id', id)
        .where('talent_id', talent.id)
        .first();

      if (!tareaExistente) {
        logger.warn(`${req.method} ${req.originalUrl} - Tarea no encontrada o no pertenece al talent`, {
          tareaId: id,
          talentId: talent.id,
        });
        throw new AppError('Tarea no encontrada', 404);
      }

      const { nombre, descripcion, horas_registradas, completado } = req.body;

      const updateData: any = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (horas_registradas !== undefined) updateData.horas_registradas = horas_registradas;
      if (completado !== undefined) updateData.completado = completado;

      logger.info(`${req.method} ${req.originalUrl} - Actualizando tarea ID: ${id}`, { updateData });

      await db('tareas')
        .where('id', id)
        .update(updateData);

      const tarea = await db('tareas').where('id', id).first();

      logger.info(`${req.method} ${req.originalUrl} - Tarea actualizada exitosamente`, {
        tareaId: id,
      });

      res.json({
        success: true,
        message: 'Tarea actualizada exitosamente',
        data: tarea,
      });
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn(`${req.method} ${req.originalUrl} - Error al actualizar tarea`, {
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al actualizar tarea`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async deleteTarea(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.info(`${req.method} ${req.originalUrl} - Eliminando tarea ID: ${id}`, { userId });

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        logger.warn(`${req.method} ${req.originalUrl} - Talent no encontrado`, { userId });
        throw new AppError('Talent no encontrado', 404);
      }

      // Obtener la tarea antes de eliminar
      const tareaExistente = await db('tareas')
        .where('id', id)
        .where('talent_id', talent.id)
        .first();

      if (!tareaExistente) {
        logger.warn(`${req.method} ${req.originalUrl} - Tarea no encontrada o no pertenece al talent`, {
          tareaId: id,
          talentId: talent.id,
        });
        throw new AppError('Tarea no encontrada', 404);
      }

      // Calcular fecha de borrado permanente (30 días)
      const fechaBorradoPermanente = new Date();
      fechaBorradoPermanente.setDate(fechaBorradoPermanente.getDate() + 30);

      // Guardar en eliminados (soft delete)
      await db('eliminados').insert({
        item_id: id,
        item_tipo: 'tarea',
        eliminado_por: userId,
        fecha_borrado_permanente: fechaBorradoPermanente.toISOString().split('T')[0],
        datos: JSON.stringify({
          id: tareaExistente.id,
          nombre: tareaExistente.nombre,
          descripcion: tareaExistente.descripcion,
          actividad_id: tareaExistente.actividad_id,
          horas_registradas: tareaExistente.horas_registradas,
        }),
      });

      // Eliminar físicamente de tareas
      await db('tareas')
        .where('id', id)
        .delete();

      logger.info(`${req.method} ${req.originalUrl} - Tarea eliminada exitosamente`, {
        tareaId: id,
      });

      res.json({
        success: true,
        message: 'Tarea eliminada exitosamente',
      });
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn(`${req.method} ${req.originalUrl} - Error al eliminar tarea`, {
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al eliminar tarea`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async getTareasEliminadas(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.debug(`${req.method} ${req.originalUrl} - Obteniendo tareas eliminadas`, { userId });

      const tareasEliminadas = await db('eliminados')
        .where('item_tipo', 'tarea')
        .where('eliminado_por', userId)
        .orderBy('fecha_eliminacion', 'desc')
        .select('id', 'item_id', 'fecha_eliminacion', 'fecha_borrado_permanente', 'datos');

      logger.info(`${req.method} ${req.originalUrl} - Tareas eliminadas obtenidas exitosamente`, {
        total: tareasEliminadas.length,
      });

      res.json({
        success: true,
        data: tareasEliminadas.map((t: any) => ({
          id: t.id,
          item_id: t.item_id,
          nombre: t.datos.nombre,
          descripcion: t.datos.descripcion,
          horas_registradas: t.datos.horas_registradas,
          fecha_eliminacion: t.fecha_eliminacion,
          fecha_borrado_permanente: t.fecha_borrado_permanente,
        })),
      });
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn(`${req.method} ${req.originalUrl} - Error al obtener tareas eliminadas`, {
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al obtener tareas eliminadas`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async restoreTarea(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.info(`${req.method} ${req.originalUrl} - Restaurando tarea eliminada`, { userId });

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        logger.warn(`${req.method} ${req.originalUrl} - Talent no encontrado`, { userId });
        throw new AppError('Talent no encontrado', 404);
      }

      const { id } = req.params;

      // Obtener el registro de eliminados
      const eliminado = await db('eliminados')
        .where('id', id)
        .where('item_tipo', 'tarea')
        .first();

      if (!eliminado) {
        logger.warn(`${req.method} ${req.originalUrl} - Registro de eliminado no encontrado`, {
          eliminadoId: id,
        });
        throw new AppError('Registro no encontrado', 404);
      }

      // Restaurar la tarea (sin especificar ID para evitar conflictos)
      const datos = eliminado.datos;
      const [tareaId] = await db('tareas').insert({
        actividad_id: datos.actividad_id,
        talent_id: talent.id,
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        horas_registradas: datos.horas_registradas || 0,
        completado: false,
      });

      // Eliminar el registro de eliminados
      await db('eliminados').where('id', id).delete();

      logger.info(`${req.method} ${req.originalUrl} - Tarea restaurada exitosamente`, {
        tareaId,
      });

      res.json({
        success: true,
        message: 'Tarea restaurada exitosamente',
        data: { id: tareaId },
      });
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn(`${req.method} ${req.originalUrl} - Error al restaurar tarea`, {
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al restaurar tarea`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }

  async deleteTareaPermanente(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado`);
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.info(`${req.method} ${req.originalUrl} - Eliminando tarea permanentemente ID: ${id}`, { userId });

      // Verificar que el registro existe y pertenece al usuario
      const eliminado = await db('eliminados')
        .where('id', id)
        .where('item_tipo', 'tarea')
        .where('eliminado_por', userId)
        .first();

      if (!eliminado) {
        logger.warn(`${req.method} ${req.originalUrl} - Registro de eliminado no encontrado`, {
          eliminadoId: id,
        });
        throw new AppError('Registro no encontrado', 404);
      }

      // Eliminar permanentemente
      await db('eliminados').where('id', id).delete();

      logger.info(`${req.method} ${req.originalUrl} - Tarea eliminada permanentemente`, {
        eliminadoId: id,
      });

      res.json({
        success: true,
        message: 'Tarea eliminada permanentemente',
      });
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn(`${req.method} ${req.originalUrl} - Error al eliminar tarea permanentemente`, {
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        logger.error(`${req.method} ${req.originalUrl} - Error al eliminar tarea permanentemente`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      next(error);
    }
  }
}

export const talentDashboardController = new TalentDashboardController();
