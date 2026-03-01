const db = require('../config/database');

/**
 * Recalcular un corte mensual (por cambio de costo retroactivo)
 */
const recalcularCorte = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  
  try {
    // Obtener corte original
    const corteOriginal = await db('cortes_mensuales').where('id', id).first();
    
    if (!corteOriginal) {
      return res.status(404).json({
        error: 'Corte no encontrado',
      });
    }
    
    // Guardar registro del recálculo
    await db('cortes_recalculados').insert({
      corte_id: id,
      motivo: motivo || 'Recálculo por cambio de costo',
      monto_anterior: corteOriginal.total_pagar,
      recalculado_por: req.usuario.id,
    });
    
    // Recalcular corte
    const corteActualizado = await recalcularCorteIndividual(corteOriginal);
    
    // Actualizar corte
    await db('cortes_mensuales')
      .where('id', id)
      .update({
        total_horas: corteActualizado.total_horas,
        costo_hora_aplicado: corteActualizado.costo_hora,
        subtotal_horas: corteActualizado.subtotal_horas,
        total_bonos: corteActualizado.total_bonos,
        total_pagar: corteActualizado.total_pagar,
        estado: 'recalculado',
        fecha_actualizacion: new Date(),
      });
    
    // Actualizar registro de recálculo con monto nuevo
    await db('cortes_recalculados')
      .where('corte_id', id)
      .orderBy('id', 'desc')
      .limit(1)
      .update({
        monto_nuevo: corteActualizado.total_pagar,
        diferencia: corteActualizado.total_pagar - corteOriginal.total_pagar,
      });
    
    res.json({
      mensaje: 'Corte recalculado exitosamente',
      corte: {
        id,
        monto_anterior: corteOriginal.total_pagar,
        monto_nuevo: corteActualizado.total_pagar,
        diferencia: corteActualizado.total_pagar - corteOriginal.total_pagar,
      },
    });
  } catch (error) {
    console.error('Error al recalcular corte:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Recalcular corte individual
 */
const recalcularCorteIndividual = async (corte) => {
  return await db.transaction(async (trx) => {
    // Obtener horas totales (pueden haber cambiado)
    const horasTotales = await trx('tareas')
      .select('actividades.proyecto_id')
      .sum('tareas.horas_registradas as total')
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
      .where('tareas.usuario_id', corte.usuario_id)
      .whereBetween('tareas.fecha_registro', [corte.periodo_inicio, corte.periodo_fin])
      .groupBy('actividades.proyecto_id')
      .first();
    
    const totalHoras = parseFloat(horasTotales?.total) || 0;
    
    // Obtener costo por hora vigente (puede haber cambiado por retroactivo)
    const costoVigente = await obtenerCostoVigenteParaRecalculo(
      trx, 
      corte.usuario_id, 
      corte.proyecto_id, 
      corte.periodo_inicio
    );
    
    const costoHora = costoVigente ? parseFloat(costoVigente.costo_hora) : corte.costo_hora_aplicado;
    
    // Calcular subtotal
    const subtotalHoras = totalHoras * costoHora;
    
    // Obtener bonos (pueden haber cambiado)
    const bonosAplicables = await obtenerBonosAplicablesParaRecalculo(
      trx,
      corte.usuario_id,
      corte.periodo_inicio,
      corte.periodo_fin,
      corte.proyecto_id,
      corte.id // Excluir bonos ya aplicados en este corte
    );
    
    const totalBonos = bonosAplicables.reduce((sum, bono) => sum + parseFloat(bono.monto), 0);
    
    // Calcular total
    const totalPagar = subtotalHoras + totalBonos;
    
    return {
      total_horas: totalHoras,
      costo_hora: costoHora,
      subtotal_horas: subtotalHoras,
      total_bonos: totalBonos,
      total_pagar: totalPagar,
    };
  });
};

/**
 * Obtener costo vigente para recálculo
 */
const obtenerCostoVigenteParaRecalculo = async (trx, usuario_id, proyecto_id, fecha_referencia) => {
  // Misma lógica que obtenerCostoVigenteParaCorte
  let costo = await trx('costos_por_hora')
    .where('usuario_id', usuario_id)
    .where('tipo_alcance', 'sprint')
    .where('proyecto_id', proyecto_id)
    .where('fecha_inicio', '<=', fecha_referencia)
    .whereNull('fecha_fin')
    .orderBy('fecha_inicio', 'desc')
    .first();
  
  if (!costo) {
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
 * Obtener bonos aplicables para recálculo
 */
const obtenerBonosAplicablesParaRecalculo = async (trx, usuario_id, periodo_inicio, periodo_fin, proyecto_id, corte_id_excluido) => {
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
  
  if (proyecto_id) {
    query.where((builder) => {
      builder.whereNull('bonos_usuarios.proyecto_id')
             .orWhere('bonos_usuarios.proyecto_id', proyecto_id);
    });
  }
  
  const bonos = await query;
  
  // Filtrar bonos únicos ya aplicados (excluyendo el corte actual)
  const bonosFiltrados = [];
  for (const bono of bonos) {
    if (bono.periodo === 'unico') {
      const yaAplicado = await trx('detalle_bonos_corte')
        .where('bono_id', bono.bono_id)
        .where('corte_id', '!=', corte_id_excluido)
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
 * Listar históricos de recálculos
 */
const listarRecalculos = async (req, res) => {
  const { corte_id } = req.query;
  
  try {
    let query = db('cortes_recalculados')
      .select('cortes_recalculados.*',
              'usuarios.nombre as recalculado_por_nombre')
      .leftJoin('usuarios', 'cortes_recalculados.recalculado_por', 'usuarios.id');
    
    if (corte_id) {
      query.where('cortes_recalculados.corte_id', corte_id);
    }
    
    const recalculos = await query.orderBy('cortes_recalculados.fecha_recalculo', 'desc');
    
    res.json({
      recalculos,
      total: recalculos.length,
    });
  } catch (error) {
    console.error('Error al listar recálculos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  recalcularCorte,
  recalcularCorteIndividual,
  listarRecalculos,
};
