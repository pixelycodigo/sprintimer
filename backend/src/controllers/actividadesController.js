const db = require('../config/database');

/**
 * Listar actividades de un proyecto
 */
const listarActividades = async (req, res) => {
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
    
    let query = db('actividades')
      .select('actividades.*', 'creador.nombre as creado_por_nombre')
      .leftJoin('usuarios as creador', 'actividades.creado_por', 'creador.id')
      .where('actividades.proyecto_id', proyecto_id)
      .where('actividades.eliminado', false)
      .orderBy('actividades.fecha_creacion', 'desc');
    
    const actividades = await query;
    
    // Obtener horas estimadas y registradas para cada actividad
    const actividadesConHoras = await Promise.all(actividades.map(async (actividad) => {
      const horasEstimadas = await db('actividades_sprints')
        .where('actividad_id', actividad.id)
        .sum('horas_estimadas as total')
        .first();
      
      const horasRegistradas = await db('tareas')
        .where('actividad_id', actividad.id)
        .sum('horas_registradas as total')
        .first();
      
      const estimadas = parseFloat(horasEstimadas.total) || 0;
      const registradas = parseFloat(horasRegistradas.total) || 0;
      
      return {
        ...actividad,
        horas_estimadas: estimadas,
        horas_registradas: registradas,
        progreso: estimadas > 0 ? Math.round((registradas / estimadas) * 100) : 0,
      };
    }));
    
    res.json({
      actividades: actividadesConHoras,
      total: actividadesConHoras.length,
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
    
    if (req.usuario.rol === 'usuario' && proyecto.creado_por !== req.usuario.id) {
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
  const { nombre, descripcion, proyecto_id } = req.body;
  
  try {
    if (!nombre || !proyecto_id) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Nombre y proyecto_id son requeridos',
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
    
    const [actividadId] = await db('actividades').insert({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : null,
      proyecto_id,
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
 * Actualizar actividad
 */
const actualizarActividad = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, estado } = req.body;
  
  try {
    const actividadExistente = await db('actividades').where('id', id).first();
    if (!actividadExistente) {
      return res.status(404).json({
        error: 'Actividad no encontrada',
      });
    }
    
    const proyecto = await db('proyectos').where('id', actividadExistente.proyecto_id).first();
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
    if (estado) datosActualizacion.estado = estado;
    
    await db('actividades')
      .where('id', id)
      .update(datosActualizacion);
    
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
    
    if (req.usuario.rol === 'usuario' && proyecto.creado_por !== req.usuario.id) {
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
    
    if (req.usuario.rol === 'usuario' && proyecto.creado_por !== req.usuario.id) {
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
  eliminarActividad,
  recuperarActividad,
  asignarSprints,
  obtenerActividadesAsignadas,
};
