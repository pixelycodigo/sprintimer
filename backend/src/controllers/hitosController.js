const db = require('../config/database');

/**
 * Listar hitos de un proyecto
 */
const listarHitos = async (req, res) => {
  const { proyecto_id, todas } = req.query;

  try {
    // Si no se proporciona proyecto_id y no se piden todas, retornar error
    if (!proyecto_id && !todas) {
      return res.status(400).json({
        error: 'Parámetro requerido',
        message: 'proyecto_id o todas=true son requeridos',
      });
    }

    let query = db('hitos')
      .select(
        'hitos.*',
        'creador.nombre as creado_por_nombre',
        'proyectos.nombre as proyecto_nombre',
        'actividades.nombre as actividad_nombre'
      )
      .leftJoin('usuarios as creador', 'hitos.creado_por', 'creador.id')
      .leftJoin('proyectos', 'hitos.proyecto_id', 'proyectos.id')
      .leftJoin('actividades', 'hitos.actividad_id', 'actividades.id')
      .where('hitos.eliminado', false);

    // Si se proporciona proyecto_id, filtrar por ese proyecto
    if (proyecto_id) {
      const proyecto = await db('proyectos').where('id', proyecto_id).first();
      if (!proyecto) {
        return res.status(404).json({
          error: 'Proyecto no encontrado',
        });
      }

      if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
        return res.status(403).json({
          error: 'No autorizado',
        });
      }

      query.andWhere('hitos.proyecto_id', proyecto_id);
    }
    // Si todas=true, no filtrar por proyecto
    
    query.orderBy('hitos.fecha_limite', 'asc');

    const hitos = await query;

    res.json({
      hitos,
      total: hitos.length,
    });
  } catch (error) {
    console.error('Error al listar hitos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener hito por ID
 */
const obtenerHito = async (req, res) => {
  const { id } = req.params;
  
  try {
    const hito = await db('hitos')
      .select('hitos.*', 'creador.nombre as creado_por_nombre')
      .leftJoin('usuarios as creador', 'hitos.creado_por', 'creador.id')
      .where('hitos.id', id)
      .first();
    
    if (!hito) {
      return res.status(404).json({
        error: 'Hito no encontrado',
      });
    }
    
    const proyecto = await db('proyectos').where('id', hito.proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    res.json({ hito });
  } catch (error) {
    console.error('Error al obtener hito:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Crear hito
 */
const crearHito = async (req, res) => {
  const { nombre, descripcion, fecha_limite, proyecto_id } = req.body;
  
  try {
    if (!nombre || !fecha_limite || !proyecto_id) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Nombre, fecha_limite y proyecto_id son requeridos',
      });
    }
    
    const proyecto = await db('proyectos').where('id', proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    const [hitoId] = await db('hitos').insert({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : null,
      fecha_limite: new Date(fecha_limite),
      proyecto_id,
      completado: false,
      creado_por: req.usuario.id,
    });
    
    res.status(201).json({
      mensaje: 'Hito creado exitosamente',
      hito: {
        id: hitoId,
        nombre: nombre.trim(),
      },
    });
  } catch (error) {
    console.error('Error al crear hito:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar hito
 */
const actualizarHito = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, fecha_limite, completado } = req.body;
  
  try {
    const hitoExistente = await db('hitos').where('id', id).first();
    if (!hitoExistente) {
      return res.status(404).json({
        error: 'Hito no encontrado',
      });
    }
    
    const proyecto = await db('proyectos').where('id', hitoExistente.proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    const datosActualizacion = {};
    if (nombre) datosActualizacion.nombre = nombre.trim();
    if (descripcion !== undefined) datosActualizacion.descripcion = descripcion ? descripcion.trim() : null;
    if (completado !== undefined) datosActualizacion.completado = completado;
    if (fecha_limite) datosActualizacion.fecha_limite = new Date(fecha_limite);
    
    await db('hitos')
      .where('id', id)
      .update(datosActualizacion);
    
    res.json({
      mensaje: 'Hito actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar hito:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar hito (soft delete)
 */
const eliminarHito = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  
  try {
    const hito = await db('hitos').where('id', id).first();
    if (!hito) {
      return res.status(404).json({
        error: 'Hito no encontrado',
      });
    }
    
    const proyecto = await db('proyectos').where('id', hito.proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    const configEliminados = await db('configuracion_eliminados')
      .where('entidad', 'hito')
      .first();
    
    const diasRetencion = configEliminados ? configEliminados.dias_retencion : 90;
    const fechaEliminacionPermanente = new Date();
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + diasRetencion);
    
    await db.transaction(async (trx) => {
      await trx('eliminados').insert({
        entidad: 'hito',
        entidad_id: hito.id,
        datos_originales: JSON.stringify(hito),
        eliminado_por: req.usuario.id,
        fecha_eliminacion_permanente: fechaEliminacionPermanente,
        motivo: motivo || null,
      });
      
      await trx('hitos')
        .where('id', id)
        .update({
          eliminado: true,
          fecha_eliminacion: new Date(),
        });
    });
    
    res.json({
      mensaje: `Hito eliminado. Se eliminará permanentemente el ${fechaEliminacionPermanente.toISOString().split('T')[0]}`,
    });
  } catch (error) {
    console.error('Error al eliminar hito:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Recuperar hito eliminado
 */
const recuperarHito = async (req, res) => {
  const { id } = req.params;
  
  try {
    const eliminado = await db('eliminados')
      .where('entidad', 'hito')
      .where('entidad_id', id)
      .first();
    
    if (!eliminado) {
      return res.status(404).json({
        error: 'Registro de eliminación no encontrado',
      });
    }
    
    if (!eliminado.puede_recuperar) {
      return res.status(400).json({
        error: 'Este hito no puede ser recuperado',
      });
    }
    
    await db.transaction(async (trx) => {
      await trx('hitos')
        .where('id', id)
        .update({
          eliminado: false,
          fecha_eliminacion: null,
        });
      
      await trx('eliminados')
        .where('id', eliminado.id)
        .update({
          recuperado: true,
          recuperado_por: req.usuario.id,
          fecha_recuperacion: new Date(),
          puede_recuperar: false,
        });
    });
    
    res.json({
      mensaje: 'Hito recuperado exitosamente',
    });
  } catch (error) {
    console.error('Error al recuperar hito:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  listarHitos,
  obtenerHito,
  crearHito,
  actualizarHito,
  eliminarHito,
  recuperarHito,
};
