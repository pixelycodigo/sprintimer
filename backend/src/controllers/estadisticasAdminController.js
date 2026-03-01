const db = require('../config/database');

/**
 * Obtener resumen estadístico general para administrador
 */
const obtenerResumenGeneral = async (req, res) => {
  const { proyecto_id, fecha_desde, fecha_hasta } = req.query;
  
  try {
    // Total de usuarios activos
    const totalUsuarios = await db('usuarios')
      .where('activo', true)
      .where('eliminado', false)
      .count('* as total')
      .first();
    
    // Total de proyectos activos
    const totalProyectos = await db('proyectos')
      .where('estado', 'activo')
      .where('eliminado', false)
      .count('* as total')
      .first();
    
    // Total de tareas en el período
    let queryTareas = db('tareas')
      .count('* as total')
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id');
    
    if (proyecto_id) {
      queryTareas.where('actividades.proyecto_id', proyecto_id);
    }
    
    if (fecha_desde && fecha_hasta) {
      queryTareas.whereBetween('tareas.fecha_registro', [new Date(fecha_desde), new Date(fecha_hasta)]);
    }
    
    const totalTareas = await queryTareas.first();
    
    // Total de horas registradas en el período
    let queryHoras = db('tareas')
      .sum('tareas.horas_registradas as total')
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id');
    
    if (proyecto_id) {
      queryHoras.where('actividades.proyecto_id', proyecto_id);
    }
    
    if (fecha_desde && fecha_hasta) {
      queryHoras.whereBetween('tareas.fecha_registro', [new Date(fecha_desde), new Date(fecha_hasta)]);
    }
    
    const totalHoras = await queryHoras.first();
    
    // Cortes pendientes
    const cortesPendientes = await db('cortes_mensuales')
      .where('estado', 'pendiente')
      .count('* as total')
      .first();
    
    res.json({
      resumen: {
        total_usuarios: parseInt(totalUsuarios.total),
        total_proyectos: parseInt(totalProyectos.total),
        total_tareas: parseInt(totalTareas.total),
        total_horas: parseFloat(totalHoras.total) || 0,
        cortes_pendientes: parseInt(cortesPendientes.total),
      },
      filtros: {
        proyecto_id: proyecto_id || null,
        fecha_desde: fecha_desde || null,
        fecha_hasta: fecha_hasta || null,
      },
    });
  } catch (error) {
    console.error('Error al obtener resumen general:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Horas por usuario (para gráfico de barras)
 */
const horasPorUsuario = async (req, res) => {
  const { proyecto_id, fecha_desde, fecha_hasta, limit = 10 } = req.query;
  
  try {
    let query = db('tareas')
      .select('usuarios.id', 'usuarios.nombre', 'usuarios.email')
      .sum('tareas.horas_registradas as total_horas')
      .count('tareas.id as total_tareas')
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
      .leftJoin('usuarios', 'tareas.usuario_id', 'usuarios.id')
      .where('usuarios.eliminado', false)
      .groupBy('usuarios.id', 'usuarios.nombre', 'usuarios.email');
    
    if (proyecto_id) {
      query.where('actividades.proyecto_id', proyecto_id);
    }
    
    if (fecha_desde && fecha_hasta) {
      query.whereBetween('tareas.fecha_registro', [new Date(fecha_desde), new Date(fecha_hasta)]);
    }
    
    const horasPorUsuario = await query
      .orderBy('total_horas', 'desc')
      .limit(parseInt(limit));
    
    res.json({
      datos: horasPorUsuario.map(item => ({
        usuario_id: item.id,
        nombre: item.nombre,
        email: item.email,
        total_horas: parseFloat(item.total_horas),
        total_tareas: parseInt(item.total_tareas),
      })),
      total: horasPorUsuario.length,
    });
  } catch (error) {
    console.error('Error al obtener horas por usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Horas por proyecto (para gráfico de pastel)
 */
const horasPorProyecto = async (req, res) => {
  const { fecha_desde, fecha_hasta } = req.query;
  
  try {
    let query = db('tareas')
      .select('proyectos.id', 'proyectos.nombre', 'proyectos.estado')
      .sum('tareas.horas_registradas as total_horas')
      .count('tareas.id as total_tareas')
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .where('proyectos.eliminado', false)
      .groupBy('proyectos.id', 'proyectos.nombre', 'proyectos.estado');
    
    if (fecha_desde && fecha_hasta) {
      query.whereBetween('tareas.fecha_registro', [new Date(fecha_desde), new Date(fecha_hasta)]);
    }
    
    const horasPorProyecto = await query
      .orderBy('total_horas', 'desc');
    
    res.json({
      datos: horasPorProyecto.map(item => ({
        proyecto_id: item.id,
        nombre: item.nombre,
        estado: item.estado,
        total_horas: parseFloat(item.total_horas),
        total_tareas: parseInt(item.total_tareas),
      })),
      total: horasPorProyecto.length,
    });
  } catch (error) {
    console.error('Error al obtener horas por proyecto:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Progreso de sprints (estimado vs real)
 */
const progresoSprints = async (req, res) => {
  const { proyecto_id } = req.query;
  
  try {
    let query = db('sprints')
      .select('sprints.id', 'sprints.nombre', 'sprints.fecha_inicio', 'sprints.fecha_fin', 'sprints.duracion_semanas')
      .leftJoin('proyectos', 'sprints.proyecto_id', 'proyectos.id')
      .where('sprints.eliminado', false);
    
    if (proyecto_id) {
      query.where('sprints.proyecto_id', proyecto_id);
    }
    
    const sprints = await query.orderBy('sprints.fecha_inicio', 'desc');
    
    // Calcular horas estimadas y registradas para cada sprint
    const sprintsConProgreso = await Promise.all(sprints.map(async (sprint) => {
      // Horas estimadas
      const horasEstimadas = await db('actividades_sprints')
        .where('sprint_id', sprint.id)
        .sum('horas_estimadas as total')
        .first();
      
      // Horas registradas
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
        estado: progreso >= 100 ? 'completado' : progreso >= 50 ? 'en_progreso' : 'pendiente',
      };
    }));
    
    res.json({
      sprints: sprintsConProgreso,
      total: sprintsConProgreso.length,
    });
  } catch (error) {
    console.error('Error al obtener progreso de sprints:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Tareas completadas por usuario
 */
const tareasCompletadasPorUsuario = async (req, res) => {
  const { fecha_desde, fecha_hasta, limit = 10 } = req.query;
  
  try {
    let query = db('tareas')
      .select('usuarios.id', 'usuarios.nombre')
      .count('tareas.id as total_tareas')
      .leftJoin('usuarios', 'tareas.usuario_id', 'usuarios.id')
      .where('tareas.estado', 'completada')
      .where('usuarios.eliminado', false)
      .groupBy('usuarios.id', 'usuarios.nombre');
    
    if (fecha_desde && fecha_hasta) {
      query.whereBetween('tareas.fecha_registro', [new Date(fecha_desde), new Date(fecha_hasta)]);
    }
    
    const tareasPorUsuario = await query
      .orderBy('total_tareas', 'desc')
      .limit(parseInt(limit));
    
    res.json({
      datos: tareasPorUsuario.map(item => ({
        usuario_id: item.id,
        nombre: item.nombre,
        total_tareas_completadas: parseInt(item.total_tareas),
      })),
      total: tareasPorUsuario.length,
    });
  } catch (error) {
    console.error('Error al obtener tareas completadas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Horas registradas por día (últimos 30 días)
 */
const horasPorDia = async (req, res) => {
  const { dias = 30 } = req.query;
  
  try {
    const fechaDesde = new Date();
    fechaDesde.setDate(fechaDesde.getDate() - parseInt(dias));
    
    const horasPorDia = await db('tareas')
      .select(db.raw('DATE(fecha_registro) as fecha'))
      .sum('tareas.horas_registradas as total_horas')
      .count('tareas.id as total_tareas')
      .where('fecha_registro', '>=', fechaDesde)
      .groupBy(db.raw('DATE(fecha_registro)'))
      .orderBy('fecha', 'asc');
    
    res.json({
      datos: horasPorDia.map(item => ({
        fecha: item.fecha,
        total_horas: parseFloat(item.total_horas),
        total_tareas: parseInt(item.total_tareas),
      })),
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
  obtenerResumenGeneral,
  horasPorUsuario,
  horasPorProyecto,
  progresoSprints,
  tareasCompletadasPorUsuario,
  horasPorDia,
};
