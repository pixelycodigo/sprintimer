const db = require('../config/database');

/**
 * Registrar nueva tarea (Usuario)
 */
const registrarTarea = async (req, res) => {
  const { 
    descripcion, 
    actividad_id, 
    horas_registradas, 
    fecha_registro, 
    estado = 'en_progreso',
    comentarios 
  } = req.body;
  
  const usuario_id = req.usuario.id;
  
  try {
    // Validar campos requeridos
    if (!descripcion || !actividad_id || !horas_registradas || !fecha_registro) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'descripcion, actividad_id, horas_registradas y fecha_registro son requeridos',
      });
    }
    
    // Validar horas
    if (horas_registradas <= 0) {
      return res.status(400).json({
        error: 'Horas inválidas',
        message: 'Las horas registradas deben ser mayores a 0',
      });
    }
    
    // Verificar actividad
    const actividad = await db('actividades').where('id', actividad_id).first();
    if (!actividad) {
      return res.status(404).json({
        error: 'Actividad no encontrada',
      });
    }
    
    // Verificar que el usuario está asignado al proyecto
    const asignacion = await db('usuarios_proyectos')
      .where('usuario_id', usuario_id)
      .where('proyecto_id', actividad.proyecto_id)
      .where('activo', true)
      .first();
    
    if (!asignacion && req.usuario.rol !== 'admin' && req.usuario.rol !== 'super_admin') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No estás asignado a este proyecto',
      });
    }
    
    // Obtener formato de horas del proyecto
    const proyecto = await db('proyectos').where('id', actividad.proyecto_id).first();
    
    // Validar formato de horas según configuración
    if (proyecto.formato_horas_default === 'cuartiles') {
      const cuartilesValidos = [0.25, 0.50, 0.75, 1.00];
      if (!cuartilesValidos.includes(parseFloat(horas_registradas))) {
        return res.status(400).json({
          error: 'Formato de horas inválido',
          message: 'Para este proyecto, las horas deben ser: 0.25, 0.50, 0.75 o 1.00',
          formato: 'cuartiles',
        });
      }
    }
    
    // Crear tarea
    const [tareaId] = await db('tareas').insert({
      descripcion: descripcion.trim(),
      actividad_id,
      usuario_id,
      horas_registradas,
      fecha_registro: new Date(fecha_registro),
      estado,
      comentarios: comentarios ? comentarios.trim() : null,
    });
    
    // Obtener tarea creada con detalles
    const tareaCompleta = await db('tareas')
      .select('tareas.*', 'actividades.nombre as actividad_nombre', 'proyectos.nombre as proyecto_nombre')
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .where('tareas.id', tareaId)
      .first();
    
    res.status(201).json({
      mensaje: 'Tarea registrada exitosamente',
      tarea: tareaCompleta,
    });
  } catch (error) {
    console.error('Error al registrar tarea:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Listar tareas del usuario (con filtros)
 */
const listarMisTareas = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { 
    page = 1, 
    limit = 20, 
    proyecto_id = '',
    actividad_id = '',
    estado = '',
    fecha_desde = '',
    fecha_hasta = '' 
  } = req.query;
  
  try {
    const offset = (page - 1) * limit;
    
    // Construir query
    let query = db('tareas')
      .select('tareas.*', 
              'actividades.nombre as actividad_nombre',
              'actividades.proyecto_id',
              'proyectos.nombre as proyecto_nombre')
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .where('tareas.usuario_id', usuario_id);
    
    // Aplicar filtros
    if (proyecto_id) {
      query.where('actividades.proyecto_id', proyecto_id);
    }
    
    if (actividad_id) {
      query.where('tareas.actividad_id', actividad_id);
    }
    
    if (estado) {
      query.where('tareas.estado', estado);
    }
    
    if (fecha_desde) {
      query.where('tareas.fecha_registro', '>=', new Date(fecha_desde));
    }
    
    if (fecha_hasta) {
      query.where('tareas.fecha_registro', '<=', new Date(fecha_hasta));
    }
    
    // Obtener total
    const totalResult = await query.clone().count('* as total').first();
    const total = parseInt(totalResult.total);
    
    // Aplicar paginación y orden
    const tareas = await query
      .limit(parseInt(limit))
      .offset(offset)
      .orderBy('tareas.fecha_registro', 'desc');
    
    res.json({
      tareas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al listar tareas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener tarea por ID
 */
const obtenerTarea = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;
  
  try {
    const tarea = await db('tareas')
      .select('tareas.*', 
              'actividades.nombre as actividad_nombre',
              'actividades.proyecto_id',
              'proyectos.nombre as proyecto_nombre')
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .where('tareas.id', id)
      .first();
    
    if (!tarea) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
      });
    }
    
    // Verificar que la tarea pertenece al usuario
    if (tarea.usuario_id !== usuario_id && req.usuario.rol !== 'admin' && req.usuario.rol !== 'super_admin') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Esta tarea no te pertenece',
      });
    }
    
    res.json({ tarea });
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar tarea
 */
const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  const { descripcion, horas_registradas, estado, comentarios, fecha_registro } = req.body;
  const usuario_id = req.usuario.id;
  
  try {
    // Verificar tarea
    const tareaExistente = await db('tareas').where('id', id).first();
    if (!tareaExistente) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
      });
    }
    
    // Verificar que la tarea pertenece al usuario
    if (tareaExistente.usuario_id !== usuario_id && req.usuario.rol !== 'admin' && req.usuario.rol !== 'super_admin') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Esta tarea no te pertenece',
      });
    }
    
    // Preparar datos
    const datosActualizacion = {};
    if (descripcion) datosActualizacion.descripcion = descripcion.trim();
    if (horas_registradas !== undefined) {
      if (horas_registradas <= 0) {
        return res.status(400).json({
          error: 'Horas inválidas',
          message: 'Las horas registradas deben ser mayores a 0',
        });
      }
      datosActualizacion.horas_registradas = horas_registradas;
    }
    if (estado) datosActualizacion.estado = estado;
    if (comentarios !== undefined) datosActualizacion.comentarios = comentarios ? comentarios.trim() : null;
    if (fecha_registro) datosActualizacion.fecha_registro = new Date(fecha_registro);
    
    // Actualizar
    await db('tareas')
      .where('id', id)
      .update(datosActualizacion);
    
    res.json({
      mensaje: 'Tarea actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar tarea
 */
const eliminarTarea = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;
  
  try {
    // Verificar tarea
    const tarea = await db('tareas').where('id', id).first();
    if (!tarea) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
      });
    }
    
    // Verificar que la tarea pertenece al usuario
    if (tarea.usuario_id !== usuario_id && req.usuario.rol !== 'admin' && req.usuario.rol !== 'super_admin') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Esta tarea no te pertenece',
      });
    }
    
    // Eliminar tarea
    await db('tareas')
      .where('id', id)
      .del();
    
    res.json({
      mensaje: 'Tarea eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener resumen de horas por actividad (para el usuario)
 */
const obtenerResumenHoras = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { proyecto_id } = req.query;
  
  try {
    // Construir query base
    let query = db('tareas')
      .select('actividades.id as actividad_id',
              'actividades.nombre as actividad_nombre',
              'proyectos.id as proyecto_id',
              'proyectos.nombre as proyecto_nombre',
              db.raw('SUM(tareas.horas_registradas) as total_horas'),
              db.raw('COUNT(tareas.id) as total_tareas'))
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .where('tareas.usuario_id', usuario_id)
      .groupBy('actividades.id', 'actividades.nombre', 'proyectos.id', 'proyectos.nombre');
    
    if (proyecto_id) {
      query.where('proyectos.id', proyecto_id);
    }
    
    const resumen = await query;
    
    res.json({
      resumen,
      total_actividades: resumen.length,
    });
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener horas registradas por día (para calendario)
 */
const obtenerHorasPorDia = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { fecha_inicio, fecha_fin } = req.query;
  
  try {
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'fecha_inicio y fecha_fin son requeridos',
      });
    }
    
    const horasPorDia = await db('tareas')
      .select(db.raw('DATE(fecha_registro) as fecha'))
      .select(db.raw('SUM(horas_registradas) as total_horas'))
      .where('usuario_id', usuario_id)
      .whereBetween('fecha_registro', [new Date(fecha_inicio), new Date(fecha_fin)])
      .groupBy(db.raw('DATE(fecha_registro)'))
      .orderBy('fecha', 'asc');
    
    res.json({
      horas_por_dia: horasPorDia,
      total_dias: horasPorDia.length,
    });
  } catch (error) {
    console.error('Error al obtener horas por día:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  registrarTarea,
  listarMisTareas,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  obtenerResumenHoras,
  obtenerHorasPorDia,
};
