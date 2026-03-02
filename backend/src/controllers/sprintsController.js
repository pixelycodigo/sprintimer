const db = require('../config/database');

/**
 * Listar sprints de un proyecto
 */
const listarSprints = async (req, res) => {
  const { proyecto_id } = req.query;
  
  try {
    if (!proyecto_id) {
      return res.status(400).json({
        error: 'Parámetro requerido',
        message: 'proyecto_id es requerido',
      });
    }
    
    const proyecto = await db('proyectos').where('id', proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    if (req.usuario.rol === 'usuario' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    let query = db('sprints')
      .select('sprints.*', 'creador.nombre as creado_por_nombre')
      .leftJoin('usuarios as creador', 'sprints.creado_por', 'creador.id')
      .where('sprints.proyecto_id', proyecto_id)
      .where('sprints.eliminado', false)
      .orderBy('sprints.fecha_inicio', 'asc');
    
    const sprints = await query;
    
    // Calcular progreso de cada sprint
    const sprintsConProgreso = await Promise.all(sprints.map(async (sprint) => {
      // Obtener horas estimadas del sprint
      const horasEstimadas = await db('actividades_sprints')
        .where('sprint_id', sprint.id)
        .sum('horas_estimadas as total')
        .first();
      
      // Obtener horas registradas en el sprint
      const horasRegistradas = await db('tareas')
        .join('actividades', 'tareas.actividad_id', 'actividades.id')
        .join('actividades_sprints', function() {
          this.on('actividades.id', '=', 'actividades_sprints.actividad_id')
              .andOn('actividades_sprints.sprint_id', '=', db.raw('?', [sprint.id]));
        })
        .where('actividades_sprints.sprint_id', sprint.id)
        .sum('tareas.horas_registradas as total')
        .first();
      
      const estimadas = parseFloat(horasEstimadas.total) || 0;
      const registradas = parseFloat(horasRegistradas.total) || 0;
      const progreso = estimadas > 0 ? Math.round((registradas / estimadas) * 100) : 0;
      
      return {
        ...sprint,
        horas_estimadas: estimadas,
        horas_registradas: registradas,
        progreso,
      };
    }));
    
    res.json({
      sprints: sprintsConProgreso,
      total: sprintsConProgreso.length,
    });
  } catch (error) {
    console.error('Error al listar sprints:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener sprint por ID
 */
const obtenerSprint = async (req, res) => {
  const { id } = req.params;
  
  try {
    const sprint = await db('sprints')
      .select('sprints.*', 'creador.nombre as creado_por_nombre')
      .leftJoin('usuarios as creador', 'sprints.creado_por', 'creador.id')
      .where('sprints.id', id)
      .first();
    
    if (!sprint) {
      return res.status(404).json({
        error: 'Sprint no encontrado',
      });
    }
    
    const proyecto = await db('proyectos').where('id', sprint.proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    if (req.usuario.rol === 'usuario' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    // Obtener horas estimadas
    const horasEstimadas = await db('actividades_sprints')
      .where('sprint_id', id)
      .sum('horas_estimadas as total')
      .first();
    
    // Obtener horas registradas
    const horasRegistradas = await db('tareas')
      .join('actividades', 'tareas.actividad_id', 'actividades.id')
      .join('actividades_sprints', function() {
        this.on('actividades.id', '=', 'actividades_sprints.actividad_id')
            .andOn('actividades_sprints.sprint_id', '=', db.raw('?', [id]));
      })
      .where('actividades_sprints.sprint_id', id)
      .sum('tareas.horas_registradas as total')
      .first();
    
    const estimadas = parseFloat(horasEstimadas.total) || 0;
    const registradas = parseFloat(horasRegistradas.total) || 0;
    
    res.json({
      sprint: {
        ...sprint,
        horas_estimadas: estimadas,
        horas_registradas: registradas,
        progreso: estimadas > 0 ? Math.round((registradas / estimadas) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Error al obtener sprint:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Crear sprint
 */
const crearSprint = async (req, res) => {
  const { nombre, descripcion, fecha_inicio, fecha_fin, duracion_semanas = 2, proyecto_id } = req.body;
  
  try {
    if (!nombre || !fecha_inicio || !fecha_fin || !proyecto_id) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Nombre, fecha_inicio, fecha_fin y proyecto_id son requeridos',
      });
    }
    
    const proyecto = await db('proyectos').where('id', proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    if (req.usuario.rol === 'usuario' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    
    if (inicio >= fin) {
      return res.status(400).json({
        error: 'Fechas inválidas',
        message: 'La fecha de inicio debe ser anterior a la fecha de fin',
      });
    }
    
    const [sprintId] = await db('sprints').insert({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : null,
      fecha_inicio: inicio,
      fecha_fin: fin,
      duracion_semanas,
      proyecto_id,
      creado_por: req.usuario.id,
    });
    
    res.status(201).json({
      mensaje: 'Sprint creado exitosamente',
      sprint: {
        id: sprintId,
        nombre: nombre.trim(),
      },
    });
  } catch (error) {
    console.error('Error al crear sprint:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar sprint
 */
const actualizarSprint = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, fecha_inicio, fecha_fin, duracion_semanas } = req.body;
  
  try {
    const sprintExistente = await db('sprints').where('id', id).first();
    if (!sprintExistente) {
      return res.status(404).json({
        error: 'Sprint no encontrado',
      });
    }
    
    const proyecto = await db('proyectos').where('id', sprintExistente.proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    if (req.usuario.rol === 'usuario' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    const datosActualizacion = {};
    if (nombre) datosActualizacion.nombre = nombre.trim();
    if (descripcion !== undefined) datosActualizacion.descripcion = descripcion ? descripcion.trim() : null;
    if (duracion_semanas !== undefined) datosActualizacion.duracion_semanas = duracion_semanas;
    
    if (fecha_inicio) {
      datosActualizacion.fecha_inicio = new Date(fecha_inicio);
    }
    
    if (fecha_fin) {
      const inicio = new Date(fecha_inicio || sprintExistente.fecha_inicio);
      const fin = new Date(fecha_fin);
      
      if (inicio >= fin) {
        return res.status(400).json({
          error: 'Fechas inválidas',
          message: 'La fecha de inicio debe ser anterior a la fecha de fin',
        });
      }
      
      datosActualizacion.fecha_fin = fin;
    }
    
    await db('sprints')
      .where('id', id)
      .update(datosActualizacion);
    
    res.json({
      mensaje: 'Sprint actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar sprint:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar sprint (soft delete)
 */
const eliminarSprint = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  
  try {
    const sprint = await db('sprints').where('id', id).first();
    if (!sprint) {
      return res.status(404).json({
        error: 'Sprint no encontrado',
      });
    }
    
    const proyecto = await db('proyectos').where('id', sprint.proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    if (req.usuario.rol === 'usuario' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    const configEliminados = await db('configuracion_eliminados')
      .where('entidad', 'sprint')
      .first();
    
    const diasRetencion = configEliminados ? configEliminados.dias_retencion : 90;
    const fechaEliminacionPermanente = new Date();
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + diasRetencion);
    
    await db.transaction(async (trx) => {
      await trx('eliminados').insert({
        entidad: 'sprint',
        entidad_id: sprint.id,
        datos_originales: JSON.stringify(sprint),
        eliminado_por: req.usuario.id,
        fecha_eliminacion_permanente: fechaEliminacionPermanente,
        motivo: motivo || null,
      });
      
      await trx('sprints')
        .where('id', id)
        .update({
          eliminado: true,
          fecha_eliminacion: new Date(),
        });
    });
    
    res.json({
      mensaje: `Sprint eliminado. Se eliminará permanentemente el ${fechaEliminacionPermanente.toISOString().split('T')[0]}`,
    });
  } catch (error) {
    console.error('Error al eliminar sprint:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Recuperar sprint eliminado
 */
const recuperarSprint = async (req, res) => {
  const { id } = req.params;
  
  try {
    const eliminado = await db('eliminados')
      .where('entidad', 'sprint')
      .where('entidad_id', id)
      .first();
    
    if (!eliminado) {
      return res.status(404).json({
        error: 'Registro de eliminación no encontrado',
      });
    }
    
    if (!eliminado.puede_recuperar) {
      return res.status(400).json({
        error: 'Este sprint no puede ser recuperado',
      });
    }
    
    await db.transaction(async (trx) => {
      await trx('sprints')
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
      mensaje: 'Sprint recuperado exitosamente',
    });
  } catch (error) {
    console.error('Error al recuperar sprint:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  listarSprints,
  obtenerSprint,
  crearSprint,
  actualizarSprint,
  eliminarSprint,
  recuperarSprint,
};
