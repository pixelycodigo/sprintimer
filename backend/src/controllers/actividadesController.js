const db = require('../config/database');

/**
 * Listar actividades de un proyecto
 */
const listarActividades = async (req, res) => {
  const { proyecto_id, todas } = req.query;

  try {
    // Si no se proporciona proyecto_id y no se piden todas, retornar error
    if (!proyecto_id && !todas) {
      return res.status(400).json({
        error: 'Parámetro requerido',
        message: 'proyecto_id o todas=true son requeridos',
      });
    }

    let query = db('actividades')
      .select(
        'actividades.*',
        'creador.nombre as creado_por_nombre',
        'sprints.nombre as sprint_nombre',
        'usuario_asignado.nombre as asignado_a_nombre',
        'proyectos.nombre as proyecto_nombre'
      )
      .leftJoin('usuarios as creador', 'actividades.creado_por', 'creador.id')
      .leftJoin('sprints', 'actividades.sprint_id', 'sprints.id')
      .leftJoin('usuarios as usuario_asignado', 'actividades.asignado_a', 'usuario_asignado.id')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .where('actividades.eliminado', false);

    // Si se proporciona proyecto_id, filtrar por ese proyecto
    if (proyecto_id) {
      const proyecto = await db('proyectos').where('id', proyecto_id).first();
      if (!proyecto) {
        return res.status(404).json({
          error: 'Proyecto no encontrado',
        });
      }

      if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
        return res.status(403).json({
          error: 'No autorizado',
        });
      }

      query.andWhere('actividades.proyecto_id', proyecto_id);
    }
    // Si todas=true, no filtrar por proyecto (incluye actividades sin proyecto)
    
    query.orderBy('actividades.fecha_creacion', 'desc');

    const actividades = await query;

    // Calcular progreso basado en horas registradas
    const actividadesConProgreso = await Promise.all(actividades.map(async (actividad) => {
      const horasRegistradas = await db('tareas')
        .where('actividad_id', actividad.id)
        .sum('horas_registradas as total')
        .first();

      const registradas = parseFloat(horasRegistradas.total) || 0;
      const estimadas = actividad.horas_estimadas || 0;
      const progreso = estimadas > 0 ? Math.min(100, Math.round((registradas / estimadas) * 100)) : actividad.progreso || 0;

      return {
        ...actividad,
        horas_registradas: registradas,
        progreso_calculado: progreso,
      };
    }));

    res.json({
      actividades: actividadesConProgreso,
      total: actividadesConProgreso.length,
    });
  } catch (error) {
    console.error('Error al listar actividades:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener actividad por ID con detalle completo
 */
const obtenerActividad = async (req, res) => {
  const { id } = req.params;
  
  try {
    const actividad = await db('actividades')
      .select('actividades.*', 'creador.nombre as creado_por_nombre')
      .leftJoin('usuarios as creador', 'actividades.creado_por', 'creador.id')
      .where('actividades.id', id)
      .first();
    
    if (!actividad) {
      return res.status(404).json({
        error: 'Actividad no encontrada',
      });
    }
    
    const proyecto = await db('proyectos').where('id', actividad.proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    // Obtener sprints asignados
    const sprintsAsignados = await db('actividades_sprints')
      .select('actividades_sprints.*', 'sprints.nombre as sprint_nombre', 'sprints.fecha_inicio', 'sprints.fecha_fin')
      .leftJoin('sprints', 'actividades_sprints.sprint_id', 'sprints.id')
      .where('actividades_sprints.actividad_id', id);
    
    // Obtener horas estimadas totales
    const horasEstimadasTotal = await db('actividades_sprints')
      .where('actividad_id', id)
      .sum('horas_estimadas as total')
      .first();
    
    // Obtener horas registradas totales
    const horasRegistradasTotal = await db('tareas')
      .where('actividad_id', id)
      .sum('horas_registradas as total')
      .first();
    
    const estimadas = parseFloat(horasEstimadasTotal.total) || 0;
    const registradas = parseFloat(horasRegistradasTotal.total) || 0;
    
    res.json({
      actividad: {
        ...actividad,
        horas_estimadas: estimadas,
        horas_registradas: registradas,
        progreso: estimadas > 0 ? Math.round((registradas / estimadas) * 100) : 0,
        sprints_asignados: sprintsAsignados,
      },
    });
  } catch (error) {
    console.error('Error al obtener actividad:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Crear actividad
 */
const crearActividad = async (req, res) => {
  const { 
    nombre, 
    descripcion, 
    proyecto_id, 
    horas_estimadas, 
    sprint_id, 
    asignado_a,
    activo = true 
  } = req.body;

  try {
    if (!nombre) {
      return res.status(400).json({
        error: 'Campo requerido',
        message: 'Nombre es requerido',
      });
    }

    // Si se proporciona proyecto_id, verificar que existe y tiene permisos
    if (proyecto_id) {
      const proyecto = await db('proyectos').where('id', proyecto_id).first();
      if (!proyecto) {
        return res.status(404).json({
          error: 'Proyecto no encontrado',
        });
      }

      if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
        return res.status(403).json({
          error: 'No autorizado',
        });
      }
    }

    const [actividadId] = await db('actividades').insert({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : null,
      proyecto_id: proyecto_id || null,
      horas_estimadas: horas_estimadas || null,
      sprint_id: sprint_id || null,
      asignado_a: asignado_a || null,
      activo: activo,
      progreso: 0,
      estado: 'pendiente',
      creado_por: req.usuario.id,
    });

    res.status(201).json({
      mensaje: 'Actividad creada exitosamente',
      actividad: {
        id: actividadId,
        nombre: nombre.trim(),
      },
    });
  } catch (error) {
    console.error('Error al crear actividad:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Duplicar actividad
 */
const duplicarActividad = async (req, res) => {
  const { id } = req.params;
  const { nombre, horas_estimadas, sprint_id, asignado_a, proyecto_id } = req.body;

  try {
    const actividadOriginal = await db('actividades').where('id', id).first();
    if (!actividadOriginal) {
      return res.status(404).json({
        error: 'Actividad no encontrada',
      });
    }

    // Si se proporciona proyecto_id, verificar permisos
    const nuevoProyectoId = proyecto_id || null;
    if (nuevoProyectoId) {
      const proyecto = await db('proyectos').where('id', nuevoProyectoId).first();
      if (!proyecto) {
        return res.status(404).json({
          error: 'Proyecto no encontrado',
        });
      }
      if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
        return res.status(403).json({
          error: 'No autorizado',
        });
      }
    }

    const [nuevaActividadId] = await db('actividades').insert({
      nombre: nombre || `${actividadOriginal.nombre} (Copia)`,
      descripcion: actividadOriginal.descripcion,
      proyecto_id: nuevoProyectoId,
      horas_estimadas: horas_estimadas || actividadOriginal.horas_estimadas,
      sprint_id: sprint_id || null,
      asignado_a: asignado_a || null,
      activo: true,
      progreso: 0,
      estado: 'pendiente',
      creado_por: req.usuario.id,
    });

    res.status(201).json({
      mensaje: 'Actividad duplicada exitosamente',
      actividad: {
        id: nuevaActividadId,
        nombre: nombre || `${actividadOriginal.nombre} (Copia)`,
      },
    });
  } catch (error) {
    console.error('Error al duplicar actividad:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar actividad
 */
const actualizarActividad = async (req, res) => {
  const { id } = req.params;
  const { 
    nombre, 
    descripcion, 
    estado,
    horas_estimadas,
    sprint_id,
    asignado_a,
    activo,
    progreso,
    proyecto_id
  } = req.body;

  try {
    const actividadExistente = await db('actividades').where('id', id).first();
    if (!actividadExistente) {
      return res.status(404).json({
        error: 'Actividad no encontrada',
      });
    }

    // Verificar permisos del proyecto original
    let proyecto = await db('proyectos').where('id', actividadExistente.proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }

    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }

    // Si cambia de proyecto, verificar permisos del nuevo proyecto
    if (proyecto_id && proyecto_id !== actividadExistente.proyecto_id) {
      const nuevoProyecto = await db('proyectos').where('id', proyecto_id).first();
      if (!nuevoProyecto) {
        return res.status(404).json({
          error: 'Nuevo proyecto no encontrado',
        });
      }
      if (req.usuario.rol === 'admin' && nuevoProyecto.creado_por !== req.usuario.id) {
        return res.status(403).json({
          error: 'No autorizado para el nuevo proyecto',
        });
      }
      // Al cambiar de proyecto, resetear sprint para evitar inconsistencias
      const datosActualizacion = {
        sprint_id: null
      };
      if (nombre) datosActualizacion.nombre = nombre.trim();
      if (descripcion !== undefined) datosActualizacion.descripcion = descripcion ? descripcion.trim() : null;
      if (estado) datosActualizacion.estado = estado;
      if (horas_estimadas !== undefined) datosActualizacion.horas_estimadas = horas_estimadas;
      if (asignado_a !== undefined) datosActualizacion.asignado_a = asignado_a;
      if (activo !== undefined) datosActualizacion.activo = activo;
      if (progreso !== undefined) datosActualizacion.progreso = progreso;
      datosActualizacion.proyecto_id = proyecto_id;
      
      await db('actividades')
        .where('id', id)
        .update(datosActualizacion);
    } else {
      // No cambia de proyecto
      const datosActualizacion = {};
      if (nombre) datosActualizacion.nombre = nombre.trim();
      if (descripcion !== undefined) datosActualizacion.descripcion = descripcion ? descripcion.trim() : null;
      if (estado) datosActualizacion.estado = estado;
      if (horas_estimadas !== undefined) datosActualizacion.horas_estimadas = horas_estimadas;
      if (sprint_id !== undefined) datosActualizacion.sprint_id = sprint_id;
      if (asignado_a !== undefined) datosActualizacion.asignado_a = asignado_a;
      if (activo !== undefined) datosActualizacion.activo = activo;
      if (progreso !== undefined) datosActualizacion.progreso = progreso;

      await db('actividades')
        .where('id', id)
        .update(datosActualizacion);
    }

    res.json({
      mensaje: 'Actividad actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Activar/Desactivar actividad
 */
const activarDesactivarActividad = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  try {
    const actividad = await db('actividades').where('id', id).first();
    if (!actividad) {
      return res.status(404).json({
        error: 'Actividad no encontrada',
      });
    }

    const proyecto = await db('proyectos').where('id', actividad.proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }

    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }

    await db('actividades')
      .where('id', id)
      .update({ activo: activo === true });

    res.json({
      mensaje: `Actividad ${activo ? 'activada' : 'desactivada'} exitosamente`,
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar actividad (soft delete)
 */
const eliminarActividad = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  
  try {
    const actividad = await db('actividades').where('id', id).first();
    if (!actividad) {
      return res.status(404).json({
        error: 'Actividad no encontrada',
      });
    }
    
    const proyecto = await db('proyectos').where('id', actividad.proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    const configEliminados = await db('configuracion_eliminados')
      .where('entidad', 'actividad')
      .first();
    
    const diasRetencion = configEliminados ? configEliminados.dias_retencion : 90;
    const fechaEliminacionPermanente = new Date();
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + diasRetencion);
    
    await db.transaction(async (trx) => {
      await trx('eliminados').insert({
        entidad: 'actividad',
        entidad_id: actividad.id,
        datos_originales: JSON.stringify(actividad),
        eliminado_por: req.usuario.id,
        fecha_eliminacion_permanente: fechaEliminacionPermanente,
        motivo: motivo || null,
      });
      
      await trx('actividades')
        .where('id', id)
        .update({
          eliminado: true,
          fecha_eliminacion: new Date(),
        });
    });
    
    res.json({
      mensaje: `Actividad eliminada. Se eliminará permanentemente el ${fechaEliminacionPermanente.toISOString().split('T')[0]}`,
    });
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Recuperar actividad eliminada
 */
const recuperarActividad = async (req, res) => {
  const { id } = req.params;
  
  try {
    const eliminado = await db('eliminados')
      .where('entidad', 'actividad')
      .where('entidad_id', id)
      .first();
    
    if (!eliminado) {
      return res.status(404).json({
        error: 'Registro de eliminación no encontrado',
      });
    }
    
    if (!eliminado.puede_recuperar) {
      return res.status(400).json({
        error: 'Esta actividad no puede ser recuperada',
      });
    }
    
    await db.transaction(async (trx) => {
      await trx('actividades')
        .where('id', id)
        .update({
          eliminado: false,
          fecha_eliminacion: null,
        });
      
      await trx('eliminados')
        .where('id', eliminado.id)
        .update({
          recuperado: true,
          recuperado_por: req.usuario.id,
          fecha_recuperacion: new Date(),
          puede_recuperar: false,
        });
    });
    
    res.json({
      mensaje: 'Actividad recuperada exitosamente',
    });
  } catch (error) {
    console.error('Error al recuperar actividad:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Asignar actividad a sprints con horas estimadas
 */
const asignarSprints = async (req, res) => {
  const { id } = req.params; // ID de actividad
  const { sprints } = req.body; // Array de {sprint_id, horas_estimadas}
  
  try {
    if (!sprints || !Array.isArray(sprints)) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Se requiere un array de sprints',
      });
    }
    
    // Verificar actividad
    const actividad = await db('actividades').where('id', id).first();
    if (!actividad) {
      return res.status(404).json({
        error: 'Actividad no encontrada',
      });
    }
    
    const proyecto = await db('proyectos').where('id', actividad.proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    // Actualizar en transacción
    await db.transaction(async (trx) => {
      // Eliminar asignaciones existentes
      await trx('actividades_sprints')
        .where('actividad_id', id)
        .del();
      
      // Insertar nuevas asignaciones
      const asignaciones = sprints
        .filter(s => s.horas_estimadas > 0)
        .map(s => ({
          actividad_id: id,
          sprint_id: s.sprint_id,
          horas_estimadas: s.horas_estimadas,
        }));
      
      if (asignaciones.length > 0) {
        await trx('actividades_sprints').insert(asignaciones);
      }
    });
    
    res.json({
      mensaje: 'Sprints asignados exitosamente',
      total_sprints: sprints.length,
    });
  } catch (error) {
    console.error('Error al asignar sprints:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener actividades asignadas a un usuario en un proyecto
 */
const obtenerActividadesAsignadas = async (req, res) => {
  const { proyecto_id } = req.params;
  const usuario_id = req.usuario.id;
  
  try {
    // Verificar que el usuario está asignado al proyecto
    const asignacion = await db('usuarios_proyectos')
      .where('usuario_id', usuario_id)
      .where('proyecto_id', proyecto_id)
      .where('activo', true)
      .first();
    
    if (!asignacion && req.usuario.rol !== 'admin' && req.usuario.rol !== 'super_admin') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No estás asignado a este proyecto',
      });
    }
    
    // Obtener actividades del proyecto
    const actividades = await db('actividades')
      .select('actividades.*')
      .where('actividades.proyecto_id', proyecto_id)
      .where('actividades.eliminado', false)
      .where('actividades.estado', '!=', 'completada')
      .orderBy('actividades.nombre', 'asc');
    
    res.json({
      actividades,
      total: actividades.length,
    });
  } catch (error) {
    console.error('Error al obtener actividades asignadas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  listarActividades,
  obtenerActividad,
  crearActividad,
  actualizarActividad,
  activarDesactivarActividad,
  duplicarActividad,
  eliminarActividad,
  recuperarActividad,
  asignarSprints,
  obtenerActividadesAsignadas,
};
