const db = require('../config/database');

/**
 * Generar cortes mensuales para todos los usuarios con horas registradas
 */
const generarCortes = async (req, res) => {
  const { proyecto_id, fecha_corte } = req.body;
  
  try {
    // Validar fecha de corte
    const fechaCorte = fecha_corte ? new Date(fecha_corte) : new Date();
    const diaCorte = fechaCorte.getDate();
    
    // Calcular período (ej: si día de corte es 25, período es 26 del mes anterior al 25 del actual)
    const periodoFin = new Date(fechaCorte);
    const periodoInicio = new Date(fechaCorte);
    periodoInicio.setMonth(periodoInicio.getMonth() - 1);
    periodoInicio.setDate(26); // Día 26 del mes anterior
    
    console.log(`Generando corte del ${periodoInicio.toISOString().split('T')[0]} al ${periodoFin.toISOString().split('T')[0]}`);
    
    // Obtener usuarios con horas registradas en el período
    const usuariosConHoras = await db('tareas')
      .select('tareas.usuario_id', 'actividades.proyecto_id')
      .distinct('tareas.usuario_id', 'actividades.proyecto_id')
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
      .whereBetween('tareas.fecha_registro', [periodoInicio, periodoFin]);
    
    if (usuariosConHoras.length === 0) {
      return res.json({
        mensaje: 'No hay horas registradas en este período',
        cortes_generados: 0,
      });
    }
    
    const cortesGenerados = [];
    
    // Generar corte para cada usuario/proyecto
    for (const registro of usuariosConHoras) {
      try {
        const corte = await generarCorteIndividual(
          registro.usuario_id,
          registro.proyecto_id,
          periodoInicio,
          periodoFin,
          fechaCorte,
          req.usuario.id
        );
        
        if (corte) {
          cortesGenerados.push(corte);
        }
      } catch (error) {
        console.error(`Error generando corte para usuario ${registro.usuario_id}:`, error);
      }
    }
    
    res.json({
      mensaje: `Se generaron ${cortesGenerados.length} cortes mensuales`,
      periodo: {
        inicio: periodoInicio.toISOString().split('T')[0],
        fin: periodoFin.toISOString().split('T')[0],
      },
      cortes: cortesGenerados,
      total_cortes: cortesGenerados.length,
    });
  } catch (error) {
    console.error('Error al generar cortes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message,
    });
  }
};

/**
 * Generar corte individual para un usuario en un proyecto
 */
const generarCorteIndividual = async (usuario_id, proyecto_id, periodo_inicio, periodo_fin, fecha_corte, creado_por) => {
  return await db.transaction(async (trx) => {
    // Verificar si ya existe un corte para este usuario/proyecto/período
    const corteExistente = await trx('cortes_mensuales')
      .where('usuario_id', usuario_id)
      .where('proyecto_id', proyecto_id)
      .where('periodo_inicio', periodo_inicio)
      .where('periodo_fin', periodo_fin)
      .first();
    
    if (corteExistente) {
      console.log(`Corte ya existe para usuario ${usuario_id}, proyecto ${proyecto_id}`);
      return null;
    }
    
    // Obtener proyecto
    const proyecto = await trx('proyectos')
      .select('proyectos.*', 'clientes.nombre as cliente_nombre')
      .leftJoin('clientes', 'proyectos.cliente_id', 'clientes.id')
      .where('proyectos.id', proyecto_id)
      .first();
    
    if (!proyecto) {
      return null;
    }
    
    // Obtener usuario
    const usuario = await trx('usuario')
      .select('usuarios.*', 'roles.nombre as rol')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .where('usuarios.id', usuario_id)
      .first();
    
    if (!usuario) {
      return null;
    }
    
    // Calcular horas totales registradas en el período
    const horasTotales = await trx('tareas')
      .select('actividades.proyecto_id')
      .sum('tareas.horas_registradas as total')
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
      .where('tareas.usuario_id', usuario_id)
      .whereBetween('tareas.fecha_registro', [periodo_inicio, periodo_fin])
      .groupBy('actividades.proyecto_id')
      .first();
    
    const totalHoras = parseFloat(horasTotales?.total) || 0;
    
    if (totalHoras === 0) {
      return null;
    }
    
    // Obtener costo por hora vigente
    const costoVigente = await obtenerCostoVigenteParaCorte(trx, usuario_id, proyecto_id, periodo_inicio);
    
    const costoHora = costoVigente ? parseFloat(costoVigente.costo_hora) : 0;
    const monedaId = costoVigente ? costoVigente.moneda_id : proyecto.moneda_id || 1;
    
    // Calcular subtotal horas
    const subtotalHoras = totalHoras * costoHora;
    
    // Obtener bonos aplicables
    const bonosAplicables = await obtenerBonosAplicablesParaCorte(
      trx, 
      usuario_id, 
      periodo_inicio, 
      periodo_fin, 
      proyecto_id
    );
    
    const totalBonos = bonosAplicables.reduce((sum, bono) => sum + parseFloat(bono.monto), 0);
    
    // Calcular total a pagar
    const totalPagar = subtotalHoras + totalBonos;
    
    // Insertar corte
    const [corteId] = await trx('cortes_mensuales').insert({
      usuario_id,
      proyecto_id,
      periodo_inicio,
      periodo_fin,
      fecha_corte,
      total_horas: totalHoras,
      costo_hora_aplicado: costoHora,
      subtotal_horas: subtotalHoras,
      total_bonos: totalBonos,
      total_pagar: totalPagar,
      moneda_id: monedaId,
      estado: 'pendiente',
      creado_por,
    });
    
    // Insertar detalle de bonos
    if (bonosAplicables.length > 0) {
      const detalleBonos = bonosAplicables.map(bono => ({
        corte_id: corteId,
        bono_id: bono.bono_id,
        concepto: bono.bono_nombre,
        monto: bono.monto,
      }));
      
      await trx('detalle_bonos_corte').insert(detalleBonos);
      
      // Marcar bonos únicos como aplicados
      for (const bono of bonosAplicables) {
        if (bono.periodo === 'unico') {
          await trx('bonos_usuarios')
            .where('id', bono.id)
            .update({ 
              activo: false,
              aplica_hasta: new Date()
            });
        }
      }
    }
    
    return {
      id: corteId,
      usuario_id,
      usuario_nombre: usuario.nombre,
      proyecto_id,
      proyecto_nombre: proyecto.nombre,
      total_horas: totalHoras,
      costo_hora: costoHora,
      subtotal_horas: subtotalHoras,
      total_bonos: totalBonos,
      total_pagar: totalPagar,
    };
  });
};

/**
 * Obtener costo vigente para un corte
 */
const obtenerCostoVigenteParaCorte = async (trx, usuario_id, proyecto_id, fecha_referencia) => {
  // Intentar obtener costo por sprint primero
  let costo = await trx('costos_por_hora')
    .where('usuario_id', usuario_id)
    .where('tipo_alcance', 'sprint')
    .where('proyecto_id', proyecto_id)
    .where('fecha_inicio', '<=', fecha_referencia)
    .whereNull('fecha_fin')
    .orderBy('fecha_inicio', 'desc')
    .first();
  
  if (!costo) {
    // Intentar costo por proyecto
    costo = await trx('costos_por_hora')
      .where('usuario_id', usuario_id)
      .where('tipo_alcance', 'proyecto')
      .where('proyecto_id', proyecto_id)
      .where('fecha_inicio', '<=', fecha_referencia)
      .whereNull('fecha_fin')
      .orderBy('fecha_inicio', 'desc')
      .first();
  }
  
  if (!costo) {
    // Intentar costo global
    costo = await trx('costos_por_hora')
      .where('usuario_id', usuario_id)
      .where('tipo_alcance', 'global')
      .where('fecha_inicio', '<=', fecha_referencia)
      .whereNull('fecha_fin')
      .orderBy('fecha_inicio', 'desc')
      .first();
  }
  
  return costo;
};

/**
 * Obtener bonos aplicables para un corte
 */
const obtenerBonosAplicablesParaCorte = async (trx, usuario_id, periodo_inicio, periodo_fin, proyecto_id) => {
  let query = trx('bonos_usuarios')
    .select('bonos_usuarios.*', 'bonos.nombre as bono_nombre', 'bonos.periodo')
    .leftJoin('bonos', 'bonos_usuarios.bono_id', 'bonos.id')
    .where('bonos_usuarios.usuario_id', usuario_id)
    .where('bonos_usuarios.activo', true)
    .where('bonos_usuarios.aplica_desde', '<=', periodo_fin)
    .where((builder) => {
      builder.whereNull('bonos_usuarios.aplica_hasta')
             .orWhere('bonos_usuarios.aplica_hasta', '>=', periodo_inicio);
    });
  
  // Filtrar por proyecto si corresponde
  if (proyecto_id) {
    query.where((builder) => {
      builder.whereNull('bonos_usuarios.proyecto_id')
             .orWhere('bonos_usuarios.proyecto_id', proyecto_id);
    });
  }
  
  const bonos = await query;
  
  // Filtrar bonos únicos ya aplicados
  const bonosFiltrados = [];
  for (const bono of bonos) {
    if (bono.periodo === 'unico') {
      const yaAplicado = await trx('detalle_bonos_corte')
        .where('bono_id', bono.bono_id)
        .first();
      
      if (yaAplicado) {
        continue;
      }
    }
    bonosFiltrados.push(bono);
  }
  
  return bonosFiltrados;
};

/**
 * Listar cortes mensuales
 */
const listarCortes = async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    usuario_id = '', 
    proyecto_id = '', 
    estado = '',
    periodo_desde = '',
    periodo_hasta = ''
  } = req.query;
  
  try {
    const offset = (page - 1) * limit;
    
    let query = db('cortes_mensuales')
      .select('cortes_mensuales.*',
              'usuarios.nombre as usuario_nombre',
              'usuarios.email as usuario_email',
              'proyectos.nombre as proyecto_nombre',
              'monedas.codigo as moneda_codigo',
              'monedas.simbolo as moneda_simbolo')
      .leftJoin('usuario', 'cortes_mensuales.usuario_id', 'usuarios.id')
      .leftJoin('proyectos', 'cortes_mensuales.proyecto_id', 'proyectos.id')
      .leftJoin('monedas', 'cortes_mensuales.moneda_id', 'monedas.id');
    
    // Aplicar filtros
    if (usuario_id) {
      query.where('cortes_mensuales.usuario_id', usuario_id);
    }
    
    if (proyecto_id) {
      query.where('cortes_mensuales.proyecto_id', proyecto_id);
    }
    
    if (estado) {
      query.where('cortes_mensuales.estado', estado);
    }
    
    if (periodo_desde) {
      query.where('cortes_mensuales.periodo_fin', '>=', new Date(periodo_desde));
    }
    
    if (periodo_hasta) {
      query.where('cortes_mensuales.periodo_inicio', '<=', new Date(periodo_hasta));
    }
    
    // Solo admin ve sus propios cortes
    if (req.usuario.rol === 'admin') {
      query.where('proyectos.creado_por', req.usuario.id);
    }

    // Obtener total (usando una query separada para evitar error de GROUP BY)
    const countQuery = db('cortes_mensuales')
      .leftJoin('usuario', 'cortes_mensuales.usuario_id', 'usuarios.id')
      .leftJoin('proyectos', 'cortes_mensuales.proyecto_id', 'proyectos.id')
      .where('cortes_mensuales.eliminado', eliminado);
    
    // Aplicar filtros al count
    if (usuario_id) {
      countQuery.where('cortes_mensuales.usuario_id', usuario_id);
    }
    if (proyecto_id) {
      countQuery.where('cortes_mensuales.proyecto_id', proyecto_id);
    }
    if (estado) {
      countQuery.where('cortes_mensuales.estado', estado);
    }
    if (periodo_desde) {
      countQuery.where('cortes_mensuales.periodo_fin', '>=', periodo_desde);
    }
    if (periodo_hasta) {
      countQuery.where('cortes_mensuales.periodo_inicio', '<=', periodo_hasta);
    }
    if (req.usuario.rol === 'admin') {
      countQuery.where('proyectos.creado_por', req.usuario.id);
    }
    
    const totalResult = await countQuery.count('* as total').first();
    const total = parseInt(totalResult.total);
    
    // Aplicar paginación
    const cortes = await query
      .limit(parseInt(limit))
      .offset(offset)
      .orderBy('cortes_mensuales.fecha_corte', 'desc');
    
    res.json({
      cortes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al listar cortes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener detalle de un corte
 */
const obtenerDetalleCorte = async (req, res) => {
  const { id } = req.params;
  
  try {
    const corte = await db('cortes_mensuales')
      .select('cortes_mensuales.*',
              'usuarios.nombre as usuario_nombre',
              'usuarios.email as usuario_email',
              'proyectos.nombre as proyecto_nombre',
              'monedas.codigo as moneda_codigo',
              'monedas.simbolo as moneda_simbolo')
      .leftJoin('usuario', 'cortes_mensuales.usuario_id', 'usuarios.id')
      .leftJoin('proyectos', 'cortes_mensuales.proyecto_id', 'proyectos.id')
      .leftJoin('monedas', 'cortes_mensuales.moneda_id', 'monedas.id')
      .where('cortes_mensuales.id', id)
      .first();
    
    if (!corte) {
      return res.status(404).json({
        error: 'Corte no encontrado',
      });
    }
    
    // Obtener detalle de bonos
    const bonos = await db('detalle_bonos_corte')
      .where('corte_id', id);
    
    // Obtener desglose de horas por actividad
    const horasPorActividad = await db('tareas')
      .select('actividades.nombre as actividad_nombre',
              db.raw('SUM(tareas.horas_registradas) as total_horas'))
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
      .where('tareas.usuario_id', corte.usuario_id)
      .whereBetween('tareas.fecha_registro', [corte.periodo_inicio, corte.periodo_fin])
      .groupBy('actividades.id', 'actividades.nombre');
    
    res.json({
      corte: {
        ...corte,
        bonos,
        horas_por_actividad: horasPorActividad,
      },
    });
  } catch (error) {
    console.error('Error al obtener detalle de corte:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar estado de un corte
 */
const actualizarEstadoCorte = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  try {
    if (!['pendiente', 'procesado', 'pagado', 'recalculado'].includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido',
        message: 'Estado debe ser: pendiente, procesado, pagado o recalculado',
      });
    }
    
    const corte = await db('cortes_mensuales').where('id', id).first();
    if (!corte) {
      return res.status(404).json({
        error: 'Corte no encontrado',
      });
    }
    
    await db('cortes_mensuales')
      .where('id', id)
      .update({ 
        estado,
        fecha_actualizacion: new Date()
      });
    
    res.json({
      mensaje: `Estado actualizado a ${estado}`,
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  generarCortes,
  generarCorteIndividual,
  listarCortes,
  obtenerDetalleCorte,
  actualizarEstadoCorte,
};
