const db = require('../config/database');

/**
 * Listar costos por hora (todos los costos globales)
 */
const listarCostos = async (req, res) => {
  try {
    // Obtener costos activos (sin usuario específico - disponibles para asignar)
    let query = db('costos_por_hora')
      .select('costos_por_hora.*',
              'monedas.codigo as moneda_codigo',
              'monedas.simbolo as moneda_simbolo',
              'monedas.nombre as moneda_nombre',
              'seniorities.nombre as seniority_nombre',
              'seniorities.color as seniority_color')
      .leftJoin('monedas', 'costos_por_hora.moneda_id', 'monedas.id')
      .leftJoin('seniorities', 'costos_por_hora.seniority_id', 'seniorities.id')
      .where('costos_por_hora.eliminado', false)
      .whereNull('costos_por_hora.usuario_id') // Solo costos disponibles (sin usuario asignado)
      .orderBy('costos_por_hora.tipo', 'asc')
      .orderBy('costos_por_hora.costo_hora', 'asc');

    const costos = await query;

    // Verificar estado de uso y calcular en_uso
    const costosConInfo = costos.map((costo) => {
      // Un costo está en uso si tiene usuario_id asignado
      const enUso = costo.usuario_id !== null && costo.usuario_id !== undefined;
      
      return {
        ...costo,
        en_uso: enUso,
      };
    });

    res.json({
      costos: costosConInfo,
      total: costosConInfo.length,
    });
  } catch (error) {
    console.error('Error al listar costos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener costo vigente de un usuario
 */
const obtenerCostoVigente = async (req, res) => {
  const { usuario_id } = req.params;
  const { proyecto_id, sprint_id } = req.query;
  
  try {
    // Obtener costo vigente siguiendo la jerarquía: sprint > proyecto > global
    let costo;
    
    if (sprint_id) {
      // Buscar costo por sprint
      costo = await db('costos_por_hora')
        .select('costos_por_hora.*', 'monedas.codigo as moneda_codigo', 'monedas.simbolo as moneda_simbolo')
        .leftJoin('monedas', 'costos_por_hora.moneda_id', 'monedas.id')
        .where('usuario_id', usuario_id)
        .where('tipo_alcance', 'sprint')
        .where('sprint_id', sprint_id)
        .where('fecha_inicio', '<=', new Date())
        .whereNull('fecha_fin')
        .orderBy('fecha_inicio', 'desc')
        .first();
    }
    
    if (!costo && proyecto_id) {
      // Buscar costo por proyecto
      costo = await db('costos_por_hora')
        .select('costos_por_hora.*', 'monedas.codigo as moneda_codigo', 'monedas.simbolo as moneda_simbolo')
        .leftJoin('monedas', 'costos_por_hora.moneda_id', 'monedas.id')
        .where('usuario_id', usuario_id)
        .where('tipo_alcance', 'proyecto')
        .where('proyecto_id', proyecto_id)
        .where('fecha_inicio', '<=', new Date())
        .whereNull('fecha_fin')
        .orderBy('fecha_inicio', 'desc')
        .first();
    }
    
    if (!costo) {
      // Buscar costo global
      costo = await db('costos_por_hora')
        .select('costos_por_hora.*', 'monedas.codigo as moneda_codigo', 'monedas.simbolo as moneda_simbolo')
        .leftJoin('monedas', 'costos_por_hora.moneda_id', 'monedas.id')
        .where('usuario_id', usuario_id)
        .where('tipo_alcance', 'global')
        .where('fecha_inicio', '<=', new Date())
        .whereNull('fecha_fin')
        .orderBy('fecha_inicio', 'desc')
        .first();
    }
    
    if (!costo) {
      return res.status(404).json({
        error: 'No hay costo configurado para este usuario',
      });
    }
    
    res.json({ costo });
  } catch (error) {
    console.error('Error al obtener costo vigente:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Crear costo por hora (global o por seniority)
 */
const crearCosto = async (req, res) => {
  const {
    tipo = 'fijo',
    seniority_id,
    costo_hora,
    costo_min,
    costo_max,
    moneda_id = 1,
    concepto,
    usuario_id
  } = req.body;

  try {
    // Validar campos requeridos
    if (tipo === 'fijo' && !costo_hora) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'costo_hora es requerido para costos fijos',
      });
    }

    if (tipo === 'variable' && (!costo_min || !costo_max)) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'costo_min y costo_max son requeridos para costos variables',
      });
    }

    if (tipo === 'variable' && parseFloat(costo_min) >= parseFloat(costo_max)) {
      return res.status(400).json({
        error: 'Rango inválido',
        message: 'costo_min debe ser menor que costo_max',
      });
    }

    // Validar duplicados (solo para costos globales, sin usuario)
    let duplicateQuery = db('costos_por_hora')
      .whereNull('usuario_id'); // Solo costos globales

    if (tipo === 'fijo') {
      duplicateQuery = duplicateQuery
        .where('tipo', 'fijo')
        .where('costo_hora', parseFloat(costo_hora))
        .where('moneda_id', moneda_id);
    } else {
      duplicateQuery = duplicateQuery
        .where('tipo', 'variable')
        .where('costo_min', parseFloat(costo_min))
        .where('costo_max', parseFloat(costo_max))
        .where('moneda_id', moneda_id);
    }

    const existing = await duplicateQuery.first();
    if (existing) {
      return res.status(409).json({
        error: 'Costo duplicado',
        message: tipo === 'fijo' 
          ? `Ya existe un costo fijo de ${costo_hora} ${moneda_id === 1 ? 'PEN' : moneda_id === 2 ? 'USD' : 'EUR'}`
          : `Ya existe un costo variable de ${costo_min}-${costo_max} ${moneda_id === 1 ? 'PEN' : moneda_id === 2 ? 'USD' : 'EUR'}`,
      });
    }

    // Verificar seniority si se proporcionó
    if (seniority_id) {
      const seniority = await db('seniorities').where('id', seniority_id).first();
      if (!seniority) {
        return res.status(404).json({
          error: 'Seniority no encontrado',
        });
      }
    }

    // Verificar moneda
    const moneda = await db('monedas').where('id', moneda_id).first();
    if (!moneda) {
      return res.status(404).json({
        error: 'Moneda no encontrada',
      });
    }

    // Crear costo
    const [costoId] = await db('costos_por_hora').insert({
      tipo,
      seniority_id: seniority_id || null,
      costo_hora: tipo === 'fijo' ? parseFloat(costo_hora) : null,
      costo_min: tipo === 'variable' ? parseFloat(costo_min) : null,
      costo_max: tipo === 'variable' ? parseFloat(costo_max) : null,
      moneda_id,
      concepto: concepto || null,
      usuario_id: usuario_id || null,
      activo: true,
      creado_por: req.usuario.id,
    });

    const costo = await db('costos_por_hora').where('id', costoId).first();

    res.status(201).json({
      mensaje: 'Costo por hora creado exitosamente',
      costo,
    });
  } catch (error) {
    console.error('Error al crear costo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar costo por hora (soft delete)
 */
const eliminarCosto = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  try {
    const costo = await db('costos_por_hora').where('id', id).first();
    if (!costo) {
      return res.status(404).json({
        error: 'Costo no encontrado',
      });
    }

    // Verificar si está en uso (costo activo sin fecha_fin)
    if (costo.fecha_fin === null && !costo.eliminado) {
      return res.status(400).json({
        error: 'Costo en uso',
        message: 'El costo por hora está asignado a un integrante. Debes cerrar el costo actual antes de eliminarlo.',
      });
    }

    // Obtener configuración de días de retención
    const configEliminados = await db('configuracion_eliminados')
      .where('entidad', 'costo')
      .first();

    const diasRetencion = configEliminados ? configEliminados.dias_retencion : 60;
    const fechaEliminacionPermanente = new Date();
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + diasRetencion);

    await db.transaction(async (trx) => {
      // Copiar datos a eliminados
      await trx('eliminados').insert({
        entidad: 'costo_por_hora',
        entidad_id: costo.id,
        datos_originales: JSON.stringify(costo),
        eliminado_por: req.usuario.id,
        fecha_eliminacion_permanente: fechaEliminacionPermanente,
        motivo: motivo || null,
      });

      // Soft delete
      await trx('costos_por_hora')
        .where('id', id)
        .update({
          eliminado: true,
          fecha_eliminacion: new Date(),
        });
    });

    res.json({
      mensaje: 'Costo movido a eliminados exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar costo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener costo por ID
 */
const obtenerCosto = async (req, res) => {
  const { id } = req.params;

  try {
    const costo = await db('costos_por_hora')
      .select('costos_por_hora.*',
              'monedas.codigo as moneda_codigo',
              'monedas.simbolo as moneda_simbolo',
              'monedas.nombre as moneda_nombre',
              'seniorities.nombre as seniority_nombre')
      .leftJoin('monedas', 'costos_por_hora.moneda_id', 'monedas.id')
      .leftJoin('seniorities', 'costos_por_hora.seniority_id', 'seniorities.id')
      .where('costos_por_hora.id', id)
      .first();

    if (!costo) {
      return res.status(404).json({
        error: 'Costo no encontrado',
      });
    }

    res.json({ costo });
  } catch (error) {
    console.error('Error al obtener costo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar costo por hora
 */
const actualizarCosto = async (req, res) => {
  const { id } = req.params;
  const {
    tipo,
    seniority_id,
    costo_hora,
    costo_min,
    costo_max,
    moneda_id,
    concepto,
    activo
  } = req.body;

  try {
    // Verificar que el costo existe
    const costoExistente = await db('costos_por_hora').where('id', id).first();
    if (!costoExistente) {
      return res.status(404).json({
        error: 'Costo no encontrado',
      });
    }

    // Validar campos requeridos
    if (tipo === 'fijo' && !costo_hora) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'costo_hora es requerido para costos fijos',
      });
    }

    if (tipo === 'variable' && (!costo_min || !costo_max)) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'costo_min y costo_max son requeridos para costos variables',
      });
    }

    if (tipo === 'variable' && parseFloat(costo_min) >= parseFloat(costo_max)) {
      return res.status(400).json({
        error: 'Rango inválido',
        message: 'costo_min debe ser menor que costo_max',
      });
    }

    // Validar duplicados (solo para costos globales, sin usuario)
    // Los costos deben ser únicos por: tipo + monto + moneda + seniority
    let duplicateQuery = db('costos_por_hora')
      .whereNull('usuario_id') // Solo costos globales
      .where('id', '!=', id); // Excluir el registro actual

    const monedaIdActual = moneda_id || costoExistente.moneda_id;
    const seniorityIdActual = seniority_id !== undefined ? seniority_id : costoExistente.seniority_id;

    if (tipo === 'fijo') {
      duplicateQuery = duplicateQuery
        .where('tipo', 'fijo')
        .where('costo_hora', parseFloat(costo_hora))
        .where('moneda_id', monedaIdActual);
    } else {
      duplicateQuery = duplicateQuery
        .where('tipo', 'variable')
        .where('costo_min', parseFloat(costo_min))
        .where('costo_max', parseFloat(costo_max))
        .where('moneda_id', monedaIdActual);
    }
    
    // Si tiene seniority, validar que no exista otro costo con mismo monto/moneda PERO mismo seniority
    // Si no tiene seniority (global), validar que no exista otro costo global con mismo monto/moneda
    if (seniorityIdActual) {
      duplicateQuery = duplicateQuery.where('seniority_id', seniorityIdActual);
    } else {
      duplicateQuery = duplicateQuery.whereNull('seniority_id');
    }

    const existing = await duplicateQuery.first();
    if (existing) {
      // Obtener código de moneda del costo existente para el mensaje
      const monedaExistente = await db('monedas').where('id', existing.moneda_id).first();
      const monedaCodigo = monedaExistente?.codigo || 'PEN';
      
      // Obtener nombre del seniority si existe
      let mensajeSeniority = '';
      if (existing.seniority_id) {
        const seniorityExistente = await db('seniorities').where('id', existing.seniority_id).first();
        mensajeSeniority = seniorityExistente ? ` para el seniority '${seniorityExistente.nombre}'` : '';
      }
      
      return res.status(409).json({
        error: 'Costo duplicado',
        message: tipo === 'fijo'
          ? `Ya existe un costo fijo de ${costo_hora} ${monedaCodigo}${mensajeSeniority}. Los montos deben ser únicos por moneda y seniority.`
          : `Ya existe un costo variable de ${costo_min}-${costo_max} ${monedaCodigo}${mensajeSeniority}. Los montos deben ser únicos por moneda y seniority.`,
      });
    }

    // Verificar seniority si se proporcionó
    if (seniority_id) {
      const seniority = await db('seniorities').where('id', seniority_id).first();
      if (!seniority) {
        return res.status(404).json({
          error: 'Seniority no encontrado',
        });
      }
    }

    // Verificar moneda
    const moneda = await db('monedas').where('id', moneda_id).first();
    if (!moneda) {
      return res.status(404).json({
        error: 'Moneda no encontrada',
      });
    }

    // Actualizar costo
    const updateData = {
      tipo: tipo || costoExistente.tipo,
      seniority_id: seniority_id !== undefined ? seniority_id : costoExistente.seniority_id,
      costo_hora: tipo === 'fijo' && costo_hora ? parseFloat(costo_hora) : (tipo === 'fijo' ? costoExistente.costo_hora : null),
      costo_min: tipo === 'variable' && costo_min ? parseFloat(costo_min) : (tipo === 'variable' ? costo_min : null),
      costo_max: tipo === 'variable' && costo_max ? parseFloat(costo_max) : (tipo === 'variable' ? costo_max : null),
      moneda_id: moneda_id || costoExistente.moneda_id,
      concepto: concepto !== undefined ? concepto : costoExistente.concepto,
      activo: activo !== undefined ? activo : costoExistente.activo,
    };

    await db('costos_por_hora').where('id', id).update(updateData);

    const costoActualizado = await db('costos_por_hora').where('id', id).first();

    res.json({
      mensaje: 'Costo por hora actualizado exitosamente',
      costo: costoActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar costo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  listarCostos,
  obtenerCostoVigente,
  obtenerCosto,
  actualizarCosto,
  crearCosto,
  eliminarCosto,
};
