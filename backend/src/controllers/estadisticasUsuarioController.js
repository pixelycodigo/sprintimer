const db = require('../config/database');

/**
 * Obtener resumen estadístico para usuario
 */
const obtenerResumenUsuario = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { proyecto_id, fecha_desde, fecha_hasta } = req.query;
  
  try {
    // Total de tareas registradas
    let queryTareas = db('tareas')
      .count('* as total')
      .where('usuario_id', usuario_id);
    
    if (proyecto_id) {
      queryTareas.leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
                 .where('actividades.proyecto_id', proyecto_id);
    }
    
    if (fecha_desde && fecha_hasta) {
      queryTareas.whereBetween('fecha_registro', [new Date(fecha_desde), new Date(fecha_hasta)]);
    }
    
    const totalTareas = await queryTareas.first();
    
    // Total de horas registradas
    let queryHoras = db('tareas')
      .sum('horas_registradas as total')
      .where('usuario_id', usuario_id);
    
    if (proyecto_id) {
      queryHoras.leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
                .where('actividades.proyecto_id', proyecto_id);
    }
    
    if (fecha_desde && fecha_hasta) {
      queryHoras.whereBetween('fecha_registro', [new Date(fecha_desde), new Date(fecha_hasta)]);
    }
    
    const totalHoras = await queryHoras.first();
    
    // Tareas por estado
    let queryEstado = db('tareas')
      .select('estado')
      .count('* as cantidad')
      .where('usuario_id', usuario_id)
      .groupBy('estado');
    
    if (proyecto_id) {
      queryEstado.leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
                 .where('actividades.proyecto_id', proyecto_id);
    }
    
    const tareasPorEstado = await queryEstado;
    
    // Últimas tareas registradas
    let queryUltimas = db('tareas')
      .select('tareas.*', 'actividades.nombre as actividad_nombre', 'proyectos.nombre as proyecto_nombre')
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .where('tareas.usuario_id', usuario_id)
      .orderBy('tareas.fecha_registro', 'desc')
      .limit(5);
    
    if (proyecto_id) {
      queryUltimas.where('actividades.proyecto_id', proyecto_id);
    }
    
    const ultimasTareas = await queryUltimas;
    
    // Proyectos activos asignados
    const proyectosActivos = await db('usuarios_proyectos')
      .select('proyectos.id', 'proyectos.nombre', 'proyectos.estado')
      .leftJoin('proyectos', 'usuarios_proyectos.proyecto_id', 'proyectos.id')
      .where('usuarios_proyectos.usuario_id', usuario_id)
      .where('usuarios_proyectos.activo', true)
      .where('proyectos.estado', 'activo');
    
    res.json({
      resumen: {
        total_tareas: parseInt(totalTareas.total),
        total_horas: parseFloat(totalHoras.total) || 0,
        tareas_por_estado: tareasPorEstado.map(item => ({
          estado: item.estado,
          cantidad: parseInt(item.cantidad),
        })),
        ultimas_tareas: ultimasTareas,
        proyectos_activos: proyectosActivos.length,
      },
      filtros: {
        proyecto_id: proyecto_id || null,
        fecha_desde: fecha_desde || null,
        fecha_hasta: fecha_hasta || null,
      },
    });
  } catch (error) {
    console.error('Error al obtener resumen de usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Horas semanales del usuario (últimas 4 semanas)
 */
const horasSemanales = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { semanas = 4 } = req.query;
  
  try {
    const fechaDesde = new Date();
    fechaDesde.setDate(fechaDesde.getDate() - (parseInt(semanas) * 7));
    
    const horasSemanales = await db('tareas')
      .select(db.raw('YEARWEEK(fecha_registro) as semana'))
      .sum('horas_registradas as total_horas')
      .count('id as total_tareas')
      .where('usuario_id', usuario_id)
      .where('fecha_registro', '>=', fechaDesde)
      .groupBy(db.raw('YEARWEEK(fecha_registro)'))
      .orderBy('semana', 'asc');
    
    res.json({
      datos: horasSemanales.map(item => ({
        semana: item.semana,
        total_horas: parseFloat(item.total_horas),
        total_tareas: parseInt(item.total_tareas),
      })),
      total_semanas: horasSemanales.length,
    });
  } catch (error) {
    console.error('Error al obtener horas semanales:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Historial de tareas del usuario
 */
const historialTareas = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { page = 1, limit = 20, proyecto_id, estado } = req.query;
  
  try {
    const offset = (page - 1) * limit;
    
    let query = db('tareas')
      .select('tareas.*', 
              'actividades.nombre as actividad_nombre',
              'proyectos.id as proyecto_id',
              'proyectos.nombre as proyecto_nombre')
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .where('tareas.usuario_id', usuario_id);
    
    if (proyecto_id) {
      query.where('actividades.proyecto_id', proyecto_id);
    }
    
    if (estado) {
      query.where('tareas.estado', estado);
    }
    
    const totalResult = await query.clone().count('* as total').first();
    const total = parseInt(totalResult.total);
    
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
    console.error('Error al obtener historial de tareas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Progreso por actividad asignada
 */
const progresoPorActividad = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { proyecto_id } = req.query;
  
  try {
    let query = db('actividades')
      .select('actividades.id', 'actividades.nombre', 'actividades.estado', 'proyectos.id as proyecto_id', 'proyectos.nombre as proyecto_nombre')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .leftJoin('usuarios_proyectos', 'proyectos.id', 'usuarios_proyectos.proyecto_id')
      .where('usuarios_proyectos.usuario_id', usuario_id)
      .where('usuarios_proyectos.activo', true)
      .where('actividades.eliminado', false);
    
    if (proyecto_id) {
      query.where('proyectos.id', proyecto_id);
    }
    
    const actividades = await query;
    
    // Calcular progreso para cada actividad
    const actividadesConProgreso = await Promise.all(actividades.map(async (actividad) => {
      // Horas estimadas en todos los sprints
      const horasEstimadas = await db('actividades_sprints')
        .where('actividad_id', actividad.id)
        .sum('horas_estimadas as total')
        .first();
      
      // Horas registradas por este usuario
      const horasRegistradas = await db('tareas')
        .where('actividad_id', actividad.id)
        .where('usuario_id', usuario_id)
        .sum('horas_registradas as total')
        .first();
      
      // Total de horas registradas por todos los usuarios
      const horasRegistradasTotal = await db('tareas')
        .where('actividad_id', actividad.id)
        .sum('horas_registradas as total')
        .first();
      
      const estimadas = parseFloat(horasEstimadas.total) || 0;
      const registradasUsuario = parseFloat(horasRegistradas.total) || 0;
      const registradasTotal = parseFloat(horasRegistradasTotal.total) || 0;
      const progreso = estimadas > 0 ? Math.round((registradasTotal / estimadas) * 100) : 0;
      
      return {
        ...actividad,
        horas_estimadas: estimadas,
        horas_registradas_usuario: registradasUsuario,
        horas_registradas_total: registradasTotal,
        progreso,
      };
    }));
    
    res.json({
      actividades: actividadesConProgreso,
      total: actividadesConProgreso.length,
    });
  } catch (error) {
    console.error('Error al obtener progreso por actividad:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Horas registradas por mes (últimos 12 meses)
 */
const horasPorMes = async (req, res) => {
  const usuario_id = req.usuario.id;
  
  try {
    const horasPorMes = await db('tareas')
      .select(db.raw('DATE_FORMAT(fecha_registro, "%Y-%m") as mes'))
      .sum('horas_registradas as total_horas')
      .count('id as total_tareas')
      .where('usuario_id', usuario_id)
      .where('fecha_registro', '>=', new Date(new Date().setMonth(new Date().getMonth() - 12)))
      .groupBy(db.raw('DATE_FORMAT(fecha_registro, "%Y-%m")'))
      .orderBy('mes', 'asc');
    
    res.json({
      datos: horasPorMes.map(item => ({
        mes: item.mes,
        total_horas: parseFloat(item.total_horas),
        total_tareas: parseInt(item.total_tareas),
      })),
      total_meses: horasPorMes.length,
    });
  } catch (error) {
    console.error('Error al obtener horas por mes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  obtenerResumenUsuario,
  horasSemanales,
  historialTareas,
  progresoPorActividad,
  horasPorMes,
};
