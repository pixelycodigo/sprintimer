const db = require('../config/database');

/**
 * Obtener horas diarias recomendadas para cumplir con las metas del sprint
 */
const obtenerPlanificacionDiaria = async (req, res) => {
  const usuario_id = req.usuario.id;
  
  try {
    // Obtener proyectos activos asignados al usuario
    const proyectosAsignados = await db('usuarios_proyectos')
      .select('proyectos.id as proyecto_id', 'proyectos.nombre as proyecto_nombre')
      .leftJoin('proyectos', 'usuarios_proyectos.proyecto_id', 'proyectos.id')
      .where('usuarios_proyectos.usuario_id', usuario_id)
      .where('usuarios_proyectos.activo', true)
      .where('proyectos.estado', 'activo')
      .where('proyectos.eliminado', false);
    
    if (proyectosAsignados.length === 0) {
      return res.json({
        proyectos: [],
        total_horas_diarias: 0,
        alerta_sobrecarga: false,
      });
    }
    
    const planificacionPorProyecto = [];
    let totalHorasDiarias = 0;
    
    // Para cada proyecto, calcular horas diarias recomendadas
    for (const proyecto of proyectosAsignados) {
      // Obtener sprints activos del proyecto
      const sprints = await db('sprints')
        .select('id', 'nombre', 'fecha_inicio', 'fecha_fin')
        .where('proyecto_id', proyecto.proyecto_id)
        .where('eliminado', false)
        .where('fecha_fin', '>=', new Date())
        .orderBy('fecha_fin', 'asc');
      
      if (sprints.length === 0) {
        continue;
      }
      
      for (const sprint of sprints) {
        // Obtener actividades asignadas a este sprint que tienen al usuario asignado
        const actividades = await db('actividades_sprints')
          .select('actividades_sprints.*', 'actividades.nombre as actividad_nombre', 'actividades.estado as actividad_estado')
          .leftJoin('actividades', 'actividades_sprints.actividad_id', 'actividades.id')
          .where('actividades_sprints.sprint_id', sprint.id)
          .where('actividades.eliminado', false);
        
        if (actividades.length === 0) {
          continue;
        }
        
        const actividadesConHoras = [];
        let horasTotalesSprint = 0;
        
        for (const actividad of actividades) {
          // Horas registradas por este usuario en esta actividad
          const horasRegistradas = await db('tareas')
            .where('actividad_id', actividad.actividad_id)
            .where('usuario_id', usuario_id)
            .sum('horas_registradas as total')
            .first();
          
          const registradas = parseFloat(horasRegistradas.total) || 0;
          const restantes = actividad.horas_estimadas - registradas;
          
          // Calcular días restantes del sprint
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          const finSprint = new Date(sprint.fecha_fin);
          finSprint.setHours(0, 0, 0, 0);
          
          let diasRestantes = Math.ceil((finSprint - hoy) / (1000 * 60 * 60 * 24));
          diasRestantes = Math.max(1, diasRestantes); // Mínimo 1 día
          
          // Horas diarias recomendadas
          const horasDiarias = restantes > 0 ? restantes / diasRestantes : 0;
          
          // Determinar estado
          const progreso = actividad.horas_estimadas > 0 ? (registradas / actividad.horas_estimadas) * 100 : 0;
          let estado = 'en_tiempo';
          if (progreso < 50 && diasRestantes < 3) {
            estado = 'retrasado';
          } else if (progreso < 70) {
            estado = 'ligeramente_retrasado';
          }
          
          actividadesConHoras.push({
            actividad_id: actividad.actividad_id,
            actividad_nombre: actividad.actividad_nombre,
            horas_estimadas: actividad.horas_estimadas,
            horas_registradas: registradas,
            horas_restantes: restantes,
            horas_diarias_recomendadas: parseFloat(horasDiarias.toFixed(2)),
            dias_restantes: diasRestantes,
            progreso: Math.round(progreso),
            estado,
          });
          
          horasTotalesSprint += horasDiarias;
        }
        
        if (actividadesConHoras.length > 0) {
          planificacionPorProyecto.push({
            proyecto_id: proyecto.proyecto_id,
            proyecto_nombre: proyecto.proyecto_nombre,
            sprint_id: sprint.id,
            sprint_nombre: sprint.nombre,
            fecha_fin: sprint.fecha_fin,
            actividades: actividadesConHoras,
            horas_diarias_totales: parseFloat(horasTotalesSprint.toFixed(2)),
          });
          
          totalHorasDiarias += horasTotalesSprint;
        }
      }
    }
    
    res.json({
      proyectos: planificacionPorProyecto,
      total_horas_diarias: parseFloat(totalHorasDiarias.toFixed(2)),
      alerta_sobrecarga: totalHorasDiarias > 8,
      recomendacion: totalHorasDiarias > 8 
        ? 'Estás excediendo las 8h diarias recomendadas. Considera priorizar actividades o negociar plazos.'
        : 'Tu carga de trabajo está dentro de lo recomendado.',
    });
  } catch (error) {
    console.error('Error al obtener planificación diaria:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener calendario semanal de horas registradas
 */
const obtenerCalendarioSemanal = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { fecha_inicio } = req.query;
  
  try {
    // Si no se proporciona fecha_inicio, usar el lunes de esta semana
    let inicioSemana;
    if (fecha_inicio) {
      inicioSemana = new Date(fecha_inicio);
    } else {
      const hoy = new Date();
      const diaSemana = hoy.getDay(); // 0 = Domingo
      const diff = hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1); // Ajustar para que lunes sea 1
      inicioSemana = new Date(hoy.setDate(diff));
      inicioSemana.setHours(0, 0, 0, 0);
    }
    
    // Calcular fin de semana (domingo)
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(finSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);
    
    // Obtener horas por día de la semana
    const horasPorDia = await db('tareas')
      .select(db.raw('DATE(fecha_registro) as fecha'))
      .sum('horas_registradas as total_horas')
      .count('id as total_tareas')
      .where('usuario_id', usuario_id)
      .whereBetween('fecha_registro', [inicioSemana, finSemana])
      .groupBy(db.raw('DATE(fecha_registro)'))
      .orderBy('fecha', 'asc');
    
    // Crear array de los 7 días de la semana
    const diasSemana = [];
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    for (let i = 0; i < 7; i++) {
      const fechaDia = new Date(inicioSemana);
      fechaDia.setDate(fechaDia.getDate() + i);
      const fechaStr = fechaDia.toISOString().split('T')[0];
      
      // Buscar horas registradas para este día
      const registro = horasPorDia.find(d => d.fecha === fechaStr);
      
      diasSemana.push({
        fecha: fechaStr,
        nombre: nombresDias[fechaDia.getDay()],
        total_horas: registro ? parseFloat(registro.total_horas) : 0,
        total_tareas: registro ? parseInt(registro.total_tareas) : 0,
        es_laborable: fechaDia.getDay() >= 1 && fechaDia.getDay() <= 5,
      });
    }
    
    // Calcular total de horas de la semana
    const totalHorasSemana = diasSemana.reduce((sum, dia) => sum + dia.total_horas, 0);
    
    res.json({
      semana: {
        inicio: inicioSemana.toISOString().split('T')[0],
        fin: finSemana.toISOString().split('T')[0],
      },
      dias: diasSemana,
      total_horas: parseFloat(totalHorasSemana.toFixed(2)),
    });
  } catch (error) {
    console.error('Error al obtener calendario semanal:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener distribución de horas por proyecto (para usuario)
 */
const distribucionHorasPorProyecto = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { fecha_desde, fecha_hasta } = req.query;
  
  try {
    let query = db('tareas')
      .select('proyectos.id as proyecto_id', 'proyectos.nombre as proyecto_nombre')
      .sum('tareas.horas_registradas as total_horas')
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .where('tareas.usuario_id', usuario_id)
      .groupBy('proyectos.id', 'proyectos.nombre');
    
    if (fecha_desde && fecha_hasta) {
      query.whereBetween('tareas.fecha_registro', [new Date(fecha_desde), new Date(fecha_hasta)]);
    }
    
    const distribucion = await query.orderBy('total_horas', 'desc');
    
    // Calcular porcentaje
    const totalHoras = distribucion.reduce((sum, item) => sum + parseFloat(item.total_horas), 0);
    
    res.json({
      distribucion: distribucion.map(item => ({
        proyecto_id: item.proyecto_id,
        proyecto_nombre: item.proyecto_nombre,
        total_horas: parseFloat(item.total_horas),
        porcentaje: totalHoras > 0 ? Math.round((parseFloat(item.total_horas) / totalHoras) * 100) : 0,
      })),
      total_horas: parseFloat(totalHoras.toFixed(2)),
    });
  } catch (error) {
    console.error('Error al obtener distribución de horas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  obtenerPlanificacionDiaria,
  obtenerCalendarioSemanal,
  distribucionHorasPorProyecto,
};
