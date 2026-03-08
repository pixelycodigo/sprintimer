import { Request, Response, NextFunction } from 'express';
import { talentDashboardService } from '../services/talent-dashboard.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { db } from '../config/database.js';

export class TalentDashboardController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        throw new AppError('Talent no encontrado', 404);
      }

      const stats = await talentDashboardService.getStats(talent.id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProyectos(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        throw new AppError('Talent no encontrado', 404);
      }

      const proyectos = await talentDashboardService.getProyectos(talent.id);

      res.json({
        success: true,
        data: proyectos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTareas(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        throw new AppError('Talent no encontrado', 404);
      }

      const tareas = await talentDashboardService.getTareas(talent.id);

      res.json({
        success: true,
        data: tareas,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActividades(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        throw new AppError('Talent no encontrado', 404);
      }

      const actividades = await talentDashboardService.getActividades(talent.id);

      res.json({
        success: true,
        data: actividades,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActividadesByProyecto(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { proyectoId } = req.params;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        throw new AppError('Talent no encontrado', 404);
      }

      const actividades = await talentDashboardService.getActividadesByProyecto(talent.id, Number(proyectoId));

      res.json({
        success: true,
        data: actividades,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleTarea(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { completado } = req.body;

      await db('tareas')
        .where('id', id)
        .update({ completado });

      res.json({
        success: true,
        message: 'Tarea actualizada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async createTarea(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        throw new AppError('Talent no encontrado', 404);
      }

      const { actividad_id, nombre, descripcion, horas_registradas } = req.body;

      if (!actividad_id || !nombre) {
        throw new AppError('Actividad y nombre son requeridos', 400);
      }

      // Verificar que la actividad esté asignada al talent
      const actividadAsignada = await db('actividades_integrantes')
        .where('actividad_id', actividad_id)
        .where('talent_id', talent.id)
        .first();

      if (!actividadAsignada) {
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

      res.status(201).json({
        success: true,
        message: 'Tarea creada exitosamente',
        data: tarea,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTarea(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        throw new AppError('Talent no encontrado', 404);
      }

      // Verificar que la tarea pertenezca al talent
      const tareaExistente = await db('tareas')
        .where('id', id)
        .where('talent_id', talent.id)
        .first();

      if (!tareaExistente) {
        throw new AppError('Tarea no encontrada', 404);
      }

      const { nombre, descripcion, horas_registradas, completado } = req.body;

      const updateData: any = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (horas_registradas !== undefined) updateData.horas_registradas = horas_registradas;
      if (completado !== undefined) updateData.completado = completado;

      await db('tareas')
        .where('id', id)
        .update(updateData);

      const tarea = await db('tareas').where('id', id).first();

      res.json({
        success: true,
        message: 'Tarea actualizada exitosamente',
        data: tarea,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTarea(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        throw new AppError('Talent no encontrado', 404);
      }

      // Obtener la tarea antes de eliminar
      const tareaExistente = await db('tareas')
        .where('id', id)
        .where('talent_id', talent.id)
        .first();

      if (!tareaExistente) {
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

      res.json({
        success: true,
        message: 'Tarea eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async getTareasEliminadas(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const tareasEliminadas = await db('eliminados')
        .where('item_tipo', 'tarea')
        .where('eliminado_por', userId)
        .orderBy('fecha_eliminacion', 'desc')
        .select('id', 'item_id', 'fecha_eliminacion', 'fecha_borrado_permanente', 'datos');

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
      next(error);
    }
  }

  async restoreTarea(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const talent = await db('talents')
        .select('id')
        .where('usuario_id', userId)
        .first();

      if (!talent) {
        throw new AppError('Talent no encontrado', 404);
      }

      const { id } = req.params;

      // Obtener el registro de eliminados
      const eliminado = await db('eliminados')
        .where('id', id)
        .where('item_tipo', 'tarea')
        .first();

      if (!eliminado) {
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

      res.json({
        success: true,
        message: 'Tarea restaurada exitosamente',
        data: { id: tareaId },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTareaPermanente(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      // Verificar que el registro existe y pertenece al usuario
      const eliminado = await db('eliminados')
        .where('id', id)
        .where('item_tipo', 'tarea')
        .where('eliminado_por', userId)
        .first();

      if (!eliminado) {
        throw new AppError('Registro no encontrado', 404);
      }

      // Eliminar permanentemente
      await db('eliminados').where('id', id).delete();

      res.json({
        success: true,
        message: 'Tarea eliminada permanentemente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const talentDashboardController = new TalentDashboardController();
