const db = require('../config/database');

/**
 * Listar monedas
 */
const listarMonedas = async (req, res) => {
  try {
    const { search = '' } = req.query;

    let query = db('monedas')
      .select('monedas.*')
      .where('monedas.eliminado', false);

    // Aplicar búsqueda
    if (search) {
      query.where((builder) => {
        builder.where('monedas.codigo', 'like', `%${search}%`)
               .orWhere('monedas.nombre', 'like', `%${search}%`)
               .orWhere('monedas.simbolo', 'like', `%${search}%`);
      });
    }

    const monedas = await query.orderBy('monedas.nombre', 'asc');

    // Verificar si cada moneda está en uso
    const monedasConUso = await Promise.all(monedas.map(async (moneda) => {
      const enUsoCostos = await db('costos_por_hora')
        .where('moneda_id', moneda.id)
        .count('* as total')
        .first();

      const enUsoBonos = await db('bonos')
        .where('moneda_id', moneda.id)
        .count('* as total')
        .first();

      const enUsoProyectos = await db('proyectos')
        .where('moneda_id', moneda.id)
        .count('* as total')
        .first();

      const totalEnUso = parseInt(enUsoCostos.total) + parseInt(enUsoBonos.total) + parseInt(enUsoProyectos.total);

      return {
        ...moneda,
        en_uso: totalEnUso > 0,
        total_en_uso: totalEnUso,
      };
    }));

    res.json({
      monedas: monedasConUso,
      total: monedasConUso.length,
    });
  } catch (error) {
    console.error('Error al listar monedas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener moneda por ID
 */
const obtenerMoneda = async (req, res) => {
  const { id } = req.params;
  
  try {
    const moneda = await db('monedas').where('id', id).first();
    
    if (!moneda) {
      return res.status(404).json({
        error: 'Moneda no encontrada',
      });
    }
    
    res.json({ moneda });
  } catch (error) {
    console.error('Error al obtener moneda:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Crear moneda
 */
const crearMoneda = async (req, res) => {
  const { codigo, simbolo, nombre, activo = true } = req.body;
  
  try {
    if (!codigo || !simbolo || !nombre) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'codigo, simbolo y nombre son requeridos',
      });
    }
    
    // Verificar si ya existe
    const existing = await db('monedas')
      .where('codigo', codigo.toUpperCase())
      .first();
    
    if (existing) {
      return res.status(409).json({
        error: 'Moneda duplicada',
        message: 'Ya existe una moneda con ese código',
      });
    }
    
    const [monedaId] = await db('monedas').insert({
      codigo: codigo.toUpperCase().trim(),
      simbolo: simbolo.trim(),
      nombre: nombre.trim(),
      activo,
    });
    
    res.status(201).json({
      mensaje: 'Moneda creada exitosamente',
      moneda: {
        id: monedaId,
        codigo: codigo.toUpperCase().trim(),
        simbolo: simbolo.trim(),
        nombre: nombre.trim(),
      },
    });
  } catch (error) {
    console.error('Error al crear moneda:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar moneda
 */
const actualizarMoneda = async (req, res) => {
  const { id } = req.params;
  const { codigo, simbolo, nombre, activo } = req.body;
  
  try {
    const monedaExistente = await db('monedas').where('id', id).first();
    if (!monedaExistente) {
      return res.status(404).json({
        error: 'Moneda no encontrada',
      });
    }
    
    // Verificar código duplicado
    if (codigo && codigo.toUpperCase() !== monedaExistente.codigo) {
      const existing = await db('monedas')
        .where('codigo', codigo.toUpperCase())
        .where('id', '!=', id)
        .first();
      
      if (existing) {
        return res.status(409).json({
          error: 'Moneda duplicada',
          message: 'Ya existe una moneda con ese código',
        });
      }
    }
    
    const datosActualizacion = {};
    if (codigo) datosActualizacion.codigo = codigo.toUpperCase().trim();
    if (simbolo) datosActualizacion.simbolo = simbolo.trim();
    if (nombre) datosActualizacion.nombre = nombre.trim();
    if (activo !== undefined) datosActualizacion.activo = activo;
    
    await db('monedas')
      .where('id', id)
      .update(datosActualizacion);
    
    res.json({
      mensaje: 'Moneda actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar moneda:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar moneda (soft delete)
 */
const eliminarMoneda = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  try {
    // Verificar que la moneda existe
    const moneda = await db('monedas').where('id', id).first();
    if (!moneda) {
      return res.status(404).json({
        error: 'Moneda no encontrada',
      });
    }

    // Verificar si está en uso
    const enUsoCostos = await db('costos_por_hora')
      .where('moneda_id', id)
      .count('* as total')
      .first();

    const enUsoBonos = await db('bonos')
      .where('moneda_id', id)
      .count('* as total')
      .first();

    const totalEnUso = parseInt(enUsoCostos.total) + parseInt(enUsoBonos.total);

    if (totalEnUso > 0) {
      return res.status(400).json({
        error: 'Moneda en uso',
        message: `La moneda está siendo utilizada en ${totalEnUso} registro(s) de costos o bonos`,
      });
    }

    // Obtener configuración de días de retención
    const configEliminados = await db('configuracion_eliminados')
      .where('entidad', 'moneda')
      .first();

    const diasRetencion = configEliminados ? configEliminados.dias_retencion : 60;
    const fechaEliminacionPermanente = new Date();
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + diasRetencion);

    // Soft delete en transacción
    await db.transaction(async (trx) => {
      // Copiar datos a eliminados
      await trx('eliminados').insert({
        entidad: 'moneda',
        entidad_id: moneda.id,
        datos_originales: JSON.stringify(moneda),
        eliminado_por: req.usuario.id,
        fecha_eliminacion_permanente: fechaEliminacionPermanente,
        motivo: motivo || null,
      });

      // Marcar como eliminado
      await trx('monedas')
        .where('id', id)
        .update({
          eliminado: true,
          fecha_eliminacion: new Date(),
        });
    });

    res.json({
      mensaje: 'Moneda movida a eliminados exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar moneda:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  listarMonedas,
  obtenerMoneda,
  crearMoneda,
  actualizarMoneda,
  eliminarMoneda,
};
