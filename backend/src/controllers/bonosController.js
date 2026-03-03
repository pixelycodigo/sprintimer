const db = require('../config/database');

/**
 * Listar bonos disponibles
 */
const listarBonos = async (req, res) => {
  try {
    const { activo = '', periodo = '' } = req.query;

    let query = db('bonos')
      .select('bonos.*', 'monedas.codigo as moneda_codigo', 'monedas.simbolo as moneda_simbolo', 'monedas.nombre as moneda_nombre')
      .leftJoin('monedas', 'bonos.moneda_id', 'monedas.id');

    if (activo !== '') {
      query.where('bonos.activo', activo === 'true');
    }

    if (periodo !== '') {
      query.where('bonos.periodo', periodo);
    }

    const bonos = await query.orderBy('bonos.nombre', 'asc');

    // Verificar si cada bono está en uso
    const bonosConUso = await Promise.all(bonos.map(async (bono) => {
      const enUso = await db('bonos_usuarios')
        .where('bono_id', bono.id)
        .where('activo', true)
        .count('* as total')
        .first();

      const totalEnUso = parseInt(enUso.total);

      return {
        ...bono,
        en_uso: totalEnUso > 0,
        total_en_uso: totalEnUso,
      };
    }));

    res.json({
      bonos: bonosConUso,
      total: bonosConUso.length,
    });
  } catch (error) {
    console.error('Error al listar bonos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener bono por ID
 */
const obtenerBono = async (req, res) => {
  const { id } = req.params;

  try {
    const bono = await db('bonos')
      .select('bonos.*', 'monedas.codigo as moneda_codigo', 'monedas.simbolo as moneda_simbolo', 'monedas.nombre as moneda_nombre')
      .leftJoin('monedas', 'bonos.moneda_id', 'monedas.id')
      .where('bonos.id', id)
      .first();

    if (!bono) {
      return res.status(404).json({
        error: 'Bono no encontrado',
      });
    }

    res.json({ bono });
  } catch (error) {
    console.error('Error al obtener bono:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Crear bono
 */
const crearBono = async (req, res) => {
  try {
    const { nombre, descripcion, monto, moneda_id, periodo, fecha_inicio, fecha_fin, activo } = req.body;

    if (!nombre || !monto || !moneda_id) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Nombre, monto y moneda son requeridos',
      });
    }

    const [bonoId] = await db('bonos').insert({
      nombre,
      descripcion,
      monto: parseFloat(monto),
      moneda_id,
      periodo,
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      activo: activo !== undefined ? activo : true,
      creado_por: req.usuario.id,
    });

    const bono = await db('bonos').where('id', bonoId).first();

    res.status(201).json({
      mensaje: 'Bono creado exitosamente',
      bono,
    });
  } catch (error) {
    console.error('Error al crear bono:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar bono
 */
const actualizarBono = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, monto, moneda_id, periodo, fecha_inicio, fecha_fin, activo } = req.body;

    const bono = await db('bonos').where('id', id).first();
    if (!bono) {
      return res.status(404).json({
        error: 'Bono no encontrado',
      });
    }

    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (monto !== undefined) updateData.monto = parseFloat(monto);
    if (moneda_id !== undefined) updateData.moneda_id = moneda_id;
    if (periodo !== undefined) updateData.periodo = periodo;
    if (fecha_inicio !== undefined) updateData.fecha_inicio = fecha_inicio;
    if (fecha_fin !== undefined) updateData.fecha_fin = fecha_fin;
    if (activo !== undefined) updateData.activo = activo;

    await db('bonos').where('id', id).update(updateData);

    const bonoActualizado = await db('bonos').where('id', id).first();

    res.json({
      mensaje: 'Bono actualizado exitosamente',
      bono: bonoActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar bono:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar bono (soft delete)
 */
const eliminarBono = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  try {
    const bono = await db('bonos').where('id', id).first();
    if (!bono) {
      return res.status(404).json({
        error: 'Bono no encontrado',
      });
    }

    // Verificar si está en uso
    const enUso = await db('bonos_usuarios')
      .where('bono_id', id)
      .where('activo', true)
      .count('* as total')
      .first();

    const totalEnUso = parseInt(enUso.total);

    if (totalEnUso > 0) {
      return res.status(400).json({
        error: 'Bono en uso',
        message: `El bono está siendo utilizado en ${totalEnUso} ${totalEnUso === 1 ? 'usuario' : 'usuarios'}. Debes desvincularlo de todos los usuarios antes de eliminarlo.`,
      });
    }

    const configEliminados = await db('configuracion_eliminados')
      .where('entidad', 'bono')
      .first();

    const diasRetencion = configEliminados ? configEliminados.dias_retencion : 60;
    const fechaEliminacionPermanente = new Date();
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + diasRetencion);

    await db.transaction(async (trx) => {
      await trx('eliminados').insert({
        entidad: 'bono',
        entidad_id: bono.id,
        datos_originales: JSON.stringify(bono),
        eliminado_por: req.usuario.id,
        fecha_eliminacion_permanente: fechaEliminacionPermanente,
        motivo: motivo || null,
      });

      await trx('bonos')
        .where('id', id)
        .update({
          eliminado: true,
          fecha_eliminacion: new Date(),
        });
    });

    res.json({
      mensaje: 'Bono movido a eliminados exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar bono:', error);
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
  obtenerBono,
  crearBono,
  actualizarBono,
  eliminarBono,
  listarBonosUsuario,
  asignarBono,
  eliminarBonoUsuario,
  obtenerBonosAplicables,
};
