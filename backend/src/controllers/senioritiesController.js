const db = require('../config/database');

/**
 * Listar seniorities
 */
const listarSeniorities = async (req, res) => {
  try {
    const { search = '', activo = '', nivel = '', eliminado = 'false' } = req.query;

    let query = db('seniorities')
      .select('seniorities.*', 'creador.nombre as creador_nombre')
      .leftJoin('usuarios as creador', 'seniorities.creado_por', 'creador.id');

    // Filtrar eliminados por defecto
    if (eliminado !== '') {
      query.where('seniorities.eliminado', eliminado === 'true');
    }

    // Filtros
    if (search) {
      const searchLower = search.toLowerCase();
      query.where((builder) => {
        builder.whereRaw('LOWER(seniorities.nombre) LIKE ?', [`%${searchLower}%`])
               .orWhereRaw('LOWER(seniorities.descripcion) LIKE ?', [`%${searchLower}%`]);
      });
    }

    if (activo !== '') {
      // MySQL devuelve 1 o 0 para booleanos
      const activoBool = activo === 'true';
      query.where('seniorities.activo', activoBool ? 1 : 0);
    }

    if (nivel !== '') {
      query.where('seniorities.orden', parseInt(nivel));
    }

    const seniorities = await query.orderBy('seniorities.orden', 'asc');

    res.json({
      seniorities,
      total: seniorities.length,
    });
  } catch (error) {
    console.error('Error al listar seniorities:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener seniority por ID
 */
const obtenerSeniority = async (req, res) => {
  const { id } = req.params;

  try {
    const seniority = await db('seniorities')
      .select('seniorities.*', 'creador.nombre as creador_nombre')
      .leftJoin('usuarios as creador', 'seniorities.creado_por', 'creador.id')
      .where('seniorities.id', id)
      .first();

    if (!seniority) {
      return res.status(404).json({
        error: 'Seniority no encontrado',
      });
    }

    res.json({ seniority });
  } catch (error) {
    console.error('Error al obtener seniority:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Crear seniority
 */
const crearSeniority = async (req, res) => {
  try {
    const { nombre, descripcion, orden, color, activo = true } = req.body;

    // Validar campos requeridos
    if (!nombre || !orden) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Nombre y orden son requeridos',
      });
    }

    // Verificar si ya existe un seniority con el mismo nombre para este admin
    const existing = await db('seniorities')
      .where('nombre', nombre)
      .where('creado_por', req.usuario.id)
      .first();

    if (existing) {
      return res.status(409).json({
        error: 'Seniority duplicado',
        message: 'Ya existe un seniority con este nombre',
      });
    }

    // Crear seniority
    const [seniorityId] = await db('seniorities').insert({
      nombre,
      descripcion,
      orden,
      color: color || '#64748B',
      activo,
      creado_por: req.usuario.id,
    });

    const seniority = await db('seniorities').where('id', seniorityId).first();

    res.status(201).json({
      mensaje: 'Seniority creado exitosamente',
      seniority,
    });
  } catch (error) {
    console.error('Error al crear seniority:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar seniority
 */
const actualizarSeniority = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, orden, color, activo } = req.body;

  try {
    // Verificar que el seniority existe
    const seniority = await db('seniorities').where('id', id).first();
    if (!seniority) {
      return res.status(404).json({
        error: 'Seniority no encontrado',
      });
    }

    // Verificar nombre duplicado (si se está actualizando el nombre)
    if (nombre && nombre !== seniority.nombre) {
      const existing = await db('seniorities')
        .where('nombre', nombre)
        .where('creado_por', req.usuario.id)
        .where('id', '!=', id)
        .first();

      if (existing) {
        return res.status(409).json({
          error: 'Seniority duplicado',
          message: 'Ya existe un seniority con este nombre',
        });
      }
    }

    // Actualizar
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (orden !== undefined) updateData.orden = orden;
    if (color !== undefined) updateData.color = color;
    if (activo !== undefined) updateData.activo = activo;

    await db('seniorities').where('id', id).update(updateData);

    const seniorityActualizado = await db('seniorities').where('id', id).first();

    res.json({
      mensaje: 'Seniority actualizado exitosamente',
      seniority: seniorityActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar seniority:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar seniority (soft delete)
 */
const eliminarSeniority = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  try {
    // Verificar que el seniority existe
    const seniority = await db('seniorities').where('id', id).first();
    if (!seniority) {
      return res.status(404).json({
        error: 'Seniority no encontrado',
      });
    }

    // Verificar si está en uso
    const enUsoCostos = await db('costos_por_hora')
      .where('seniority_id', id)
      .where('eliminado', false)
      .count('* as total')
      .first();

    const enUsoUsuarios = await db('usuarios')
      .where('seniority_id', id)
      .where('eliminado', false)
      .count('* as total')
      .first();

    const totalEnUso = parseInt(enUsoCostos.total) + parseInt(enUsoUsuarios.total);

    if (totalEnUso > 0) {
      return res.status(400).json({
        error: 'Seniority en uso',
        message: `El seniority está siendo utilizado en ${totalEnUso} registros (costos o miembros). No se puede eliminar.`,
      });
    }

    // Obtener configuración de días de retención
    const configEliminados = await db('configuracion_eliminados')
      .where('entidad', 'seniority')
      .first();

    const diasRetencion = configEliminados ? configEliminados.dias_retencion : 60;
    const fechaEliminacionPermanente = new Date();
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + diasRetencion);

    // Soft delete
    await db('seniorities')
      .where('id', id)
      .update({
        eliminado: true,
        fecha_eliminacion: new Date(),
      });

    res.json({
      mensaje: 'Seniority movido a eliminados exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar seniority:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  listarSeniorities,
  obtenerSeniority,
  crearSeniority,
  actualizarSeniority,
  eliminarSeniority,
};
