const db = require('../config/database');

/**
 * Listar costos por hora de un usuario
 */
const listarCostos = async (req, res) => {
  const { usuario_id } = req.params;
  
  try {
    // Verificar usuario
    const usuario = await db('usuarios').where('id', usuario_id).first();
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }
    
    // Obtener costos
    let query = db('costos_por_hora')
      .select('costos_por_hora.*', 
              'monedas.codigo as moneda_codigo',
              'monedas.simbolo as moneda_simbolo',
              'proyectos.nombre as proyecto_nombre',
              'sprints.nombre as sprint_nombre')
      .leftJoin('monedas', 'costos_por_hora.moneda_id', 'monedas.id')
      .leftJoin('proyectos', 'costos_por_hora.proyecto_id', 'proyectos.id')
      .leftJoin('sprints', 'costos_por_hora.sprint_id', 'sprints.id')
      .where('costos_por_hora.usuario_id', usuario_id)
      .orderBy('costos_por_hora.fecha_inicio', 'desc');
    
    const costos = await query;
    
    res.json({
      costos,
      total: costos.length,
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
 * Crear o actualizar costo por hora
 */
const crearCosto = async (req, res) => {
  const { 
    usuario_id, 
    costo_hora, 
    moneda_id = 1, 
    tipo_alcance = 'global',
    proyecto_id,
    sprint_id,
    es_retroactivo = false,
    concepto 
  } = req.body;
  
  try {
    // Validar campos requeridos
    if (!usuario_id || !costo_hora) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'usuario_id y costo_hora son requeridos',
      });
    }
    
    // Validar tipo de alcance
    if (!['global', 'proyecto', 'sprint'].includes(tipo_alcance)) {
      return res.status(400).json({
        error: 'Tipo de alcance inválido',
        message: 'tipo_alcance debe ser: global, proyecto o sprint',
      });
    }
    
    // Validar proyecto_id si es por proyecto
    if (tipo_alcance === 'proyecto' && !proyecto_id) {
      return res.status(400).json({
        error: 'Proyecto requerido',
        message: 'proyecto_id es requerido para alcance por proyecto',
      });
    }
    
    // Validar sprint_id si es por sprint
    if (tipo_alcance === 'sprint' && !sprint_id) {
      return res.status(400).json({
        error: 'Sprint requerido',
        message: 'sprint_id es requerido para alcance por sprint',
      });
    }
    
    // Verificar usuario
    const usuario = await db('usuarios').where('id', usuario_id).first();
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }
    
    // Verificar moneda
    const moneda = await db('monedas').where('id', moneda_id).first();
    if (!moneda) {
      return res.status(404).json({
        error: 'Moneda no encontrada',
      });
    }
    
    // Verificar proyecto si aplica
    if (proyecto_id) {
      const proyecto = await db('proyectos').where('id', proyecto_id).first();
      if (!proyecto) {
        return res.status(404).json({
          error: 'Proyecto no encontrado',
        });
      }
    }
    
    // Verificar sprint si aplica
    if (sprint_id) {
      const sprint = await db('sprints').where('id', sprint_id).first();
      if (!sprint) {
        return res.status(404).json({
          error: 'Sprint no encontrado',
        });
      }
    }
    
    // Obtener costos anteriores del mismo tipo para cerrarlos
    const whereCondition = {
      usuario_id,
      tipo_alcance,
    };
    
    if (proyecto_id) whereCondition.proyecto_id = proyecto_id;
    if (sprint_id) whereCondition.sprint_id = sprint_id;
    
    // Actualizar en transacción
    await db.transaction(async (trx) => {
      // Cerrar costos anteriores del mismo tipo
      await trx('costos_por_hora')
        .where(whereCondition)
        .whereNull('fecha_fin')
        .update({ fecha_fin: new Date() });
      
      // Insertar nuevo costo
      const fechaInicio = es_retroactivo 
        ? (await trx('usuario').where('id', usuario_id).first()).fecha_creacion 
        : new Date();
      
      const [costoId] = await trx('costos_por_hora').insert({
        usuario_id,
        costo_hora,
        moneda_id,
        tipo_alcance,
        proyecto_id: proyecto_id || null,
        sprint_id: sprint_id || null,
        es_retroactivo,
        concepto: concepto || null,
        fecha_inicio: fechaInicio,
        creado_por: req.usuario.id,
      });
      
      // Si es retroactivo, recalcular cortes afectados
      if (es_retroactivo) {
        // Marcar cortes para recálculo (se implementará en el servicio de cortes)
        console.log('Costo retroactivo creado - Cortes afectados requieren recálculo');
      }
    });
    
    res.status(201).json({
      mensaje: 'Costo por hora creado exitosamente',
      costo: {
        usuario_id,
        costo_hora,
        tipo_alcance,
        fecha_inicio: es_retroactivo ? 'Desde inicio' : new Date(),
      },
    });
  } catch (error) {
    console.error('Error al crear costo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar costo por hora (cerrar)
 */
const eliminarCosto = async (req, res) => {
  const { id } = req.params;
  
  try {
    const costo = await db('costos_por_hora').where('id', id).first();
    if (!costo) {
      return res.status(404).json({
        error: 'Costo no encontrado',
      });
    }
    
    // Cerrar costo
    await db('costos_por_hora')
      .where('id', id)
      .update({ fecha_fin: new Date() });
    
    res.json({
      mensaje: 'Costo cerrado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar costo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  listarCostos,
  obtenerCostoVigente,
  crearCosto,
  eliminarCosto,
};
