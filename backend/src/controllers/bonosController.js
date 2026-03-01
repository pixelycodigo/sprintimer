const db = require('../config/database');

/**
 * Listar bonos disponibles
 */
const listarBonos = async (req, res) => {
  try {
    const { activo = '' } = req.query;
    
    let query = db('bonos')
      .select('bonos.*', 'monedas.codigo as moneda_codigo', 'monedas.simbolo as moneda_simbolo')
      .leftJoin('monedas', 'bonos.moneda_id', 'monedas.id');
    
    if (activo !== '') {
      query.where('bonos.activo', activo === 'true');
    }
    
    const bonos = await query.orderBy('bonos.nombre', 'asc');
    
    res.json({
      bonos,
      total: bonos.length,
    });
  } catch (error) {
    console.error('Error al listar bonos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Listar bonos asignados a un usuario
 */
const listarBonosUsuario = async (req, res) => {
  const { usuario_id } = req.params;
  
  try {
    const bonos = await db('bonos_usuarios')
      .select('bonos_usuarios.*', 
              'bonos.nombre as bono_nombre',
              'bonos.monto as bono_monto',
              'bonos.periodo as bono_periodo',
              'monedas.codigo as moneda_codigo',
              'monedas.simbolo as moneda_simbolo',
              'proyectos.nombre as proyecto_nombre')
      .leftJoin('bonos', 'bonos_usuarios.bono_id', 'bonos.id')
      .leftJoin('monedas', 'bonos_usuarios.moneda_id', 'monedas.id')
      .leftJoin('proyectos', 'bonos_usuarios.proyecto_id', 'proyectos.id')
      .where('bonos_usuarios.usuario_id', usuario_id)
      .where('bonos_usuarios.activo', true)
      .orderBy('bonos_usuarios.aplica_desde', 'desc');
    
    res.json({
      bonos,
      total: bonos.length,
    });
  } catch (error) {
    console.error('Error al listar bonos de usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Asignar bono a usuario
 */
const asignarBono = async (req, res) => {
  const { usuario_id } = req.params;
  const { 
    bono_id, 
    proyecto_id, 
    aplica_desde, 
    aplica_hasta,
    monto_personalizado,
    moneda_id 
  } = req.body;
  
  try {
    // Validar campos requeridos
    if (!bono_id || !aplica_desde) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'bono_id y aplica_desde son requeridos',
      });
    }
    
    // Verificar usuario
    const usuario = await db('usuarios').where('id', usuario_id).first();
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }
    
    // Verificar bono
    const bono = await db('bonos').where('id', bono_id).first();
    if (!bono) {
      return res.status(404).json({
        error: 'Bono no encontrado',
      });
    }
    
    // Verificar proyecto si se proporciona
    if (proyecto_id) {
      const proyecto = await db('proyectos').where('id', proyecto_id).first();
      if (!proyecto) {
        return res.status(404).json({
          error: 'Proyecto no encontrado',
        });
      }
    }
    
    // Insertar asignación
    const [asignacionId] = await db('bonos_usuarios').insert({
      usuario_id,
      bono_id,
      proyecto_id: proyecto_id || null,
      aplica_desde: new Date(aplica_desde),
      aplica_hasta: aplica_hasta ? new Date(aplica_hasta) : null,
      activo: true,
      creado_por: req.usuario.id,
    });
    
    res.status(201).json({
      mensaje: 'Bono asignado exitosamente',
      asignacion: {
        id: asignacionId,
        usuario_id,
        bono_id,
        aplica_desde: new Date(aplica_desde),
      },
    });
  } catch (error) {
    console.error('Error al asignar bono:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar asignación de bono
 */
const eliminarBonoUsuario = async (req, res) => {
  const { id } = req.params; // ID de bonos_usuarios
  
  try {
    const asignacion = await db('bonos_usuarios').where('id', id).first();
    if (!asignacion) {
      return res.status(404).json({
        error: 'Asignación no encontrada',
      });
    }
    
    // Desactivar asignación
    await db('bonos_usuarios')
      .where('id', id)
      .update({ 
        activo: false,
        aplica_hasta: new Date()
      });
    
    res.json({
      mensaje: 'Bono desasignado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar bono:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener bonos aplicables para un corte mensual
 */
const obtenerBonosAplicables = async (req, res) => {
  const { usuario_id, periodo_inicio, periodo_fin, proyecto_id } = req.query;
  
  try {
    if (!usuario_id || !periodo_inicio || !periodo_fin) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'usuario_id, periodo_inicio y periodo_fin son requeridos',
      });
    }
    
    // Obtener bonos aplicables al período
    let query = db('bonos_usuarios')
      .select('bonos_usuarios.*', 
              'bonos.nombre as bono_nombre',
              'bonos.monto',
              'bonos.periodo',
              'monedas.codigo as moneda_codigo',
              'monedas.simbolo as moneda_simbolo')
      .leftJoin('bonos', 'bonos_usuarios.bono_id', 'bonos.id')
      .leftJoin('monedas', 'bonos_usuarios.moneda_id', 'monedas.id')
      .where('bonos_usuarios.usuario_id', usuario_id)
      .where('bonos_usuarios.activo', true)
      .where('bonos_usuarios.aplica_desde', '<=', new Date(periodo_fin))
      .where((builder) => {
        builder.whereNull('bonos_usuarios.aplica_hasta')
               .orWhere('bonos_usuarios.aplica_hasta', '>=', new Date(periodo_inicio));
      });
    
    // Filtrar por proyecto si se proporciona
    if (proyecto_id) {
      query.where((builder) => {
        builder.whereNull('bonos_usuarios.proyecto_id')
               .orWhere('bonos_usuarios.proyecto_id', proyecto_id);
      });
    }
    
    const bonos = await query;
    
    // Filtrar bonos únicos (no repetidos en el período)
    const bonosFiltrados = [];
    for (const bono of bonos) {
      // Verificar si ya fue aplicado en un corte anterior (solo para bonos únicos)
      if (bono.periodo === 'unico') {
        const yaAplicado = await db('detalle_bonos_corte')
          .where('bono_id', bono.bono_id)
          .first();
        
        if (yaAplicado) {
          continue; // Saltar bono único ya aplicado
        }
      }
      
      bonosFiltrados.push(bono);
    }
    
    res.json({
      bonos: bonosFiltrados,
      total: bonosFiltrados.length,
    });
  } catch (error) {
    console.error('Error al obtener bonos aplicables:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  listarBonos,
  listarBonosUsuario,
  asignarBono,
  eliminarBonoUsuario,
  obtenerBonosAplicables,
};
