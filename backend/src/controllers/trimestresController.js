const db = require('../config/database');

/**
 * Listar trimestres de un proyecto
 */
const listarTrimestres = async (req, res) => {
  const { proyecto_id } = req.query;
  
  try {
    // Validar proyecto_id
    if (!proyecto_id) {
      return res.status(400).json({
        error: 'Parámetro requerido',
        message: 'proyecto_id es requerido',
      });
    }
    
    // Verificar que el proyecto existe
    const proyecto = await db('proyectos').where('id', proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    // Verificar permisos
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para ver este proyecto',
      });
    }
    
    // Obtener trimestres
    let query = db('trimestres')
      .select('trimestres.*', 'creador.nombre as creado_por_nombre')
      .leftJoin('usuarios as creador', 'trimestres.creado_por', 'creador.id')
      .where('trimestres.proyecto_id', proyecto_id)
      .where('trimestres.eliminado', false)
      .orderBy('trimestres.fecha_inicio', 'asc');
    
    const trimestres = await query;
    
    res.json({
      trimestres,
      total: trimestres.length,
    });
  } catch (error) {
    console.error('Error al listar trimestres:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener trimestre por ID
 */
const obtenerTrimestre = async (req, res) => {
  const { id } = req.params;
  
  try {
    const trimestre = await db('trimestres')
      .select('trimestres.*', 'creador.nombre as creado_por_nombre')
      .leftJoin('usuarios as creador', 'trimestres.creado_por', 'creador.id')
      .where('trimestres.id', id)
      .first();
    
    if (!trimestre) {
      return res.status(404).json({
        error: 'Trimestre no encontrado',
      });
    }
    
    // Verificar proyecto
    const proyecto = await db('proyectos').where('id', trimestre.proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    // Verificar permisos
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    res.json({ trimestre });
  } catch (error) {
    console.error('Error al obtener trimestre:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Crear trimestre
 */
const crearTrimestre = async (req, res) => {
  const { nombre, fecha_inicio, fecha_fin, proyecto_id } = req.body;

  try {
    // Validar campos requeridos
    if (!nombre || !fecha_inicio || !fecha_fin || !proyecto_id) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Nombre, fecha_inicio, fecha_fin y proyecto_id son requeridos',
      });
    }

    // Verificar que el proyecto existe
    const proyecto = await db('proyectos').where('id', proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }

    // Verificar permisos
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }

    // Verificar fechas
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);

    if (inicio >= fin) {
      return res.status(400).json({
        error: 'Fechas inválidas',
        message: 'La fecha de inicio debe ser anterior a la fecha de fin',
      });
    }

    // Crear trimestre
    const [trimestreId] = await db('trimestres').insert({
      nombre: nombre.trim(),
      fecha_inicio: inicio,
      fecha_fin: fin,
      proyecto_id,
      creado_por: req.usuario.id,
    });

    res.status(201).json({
      mensaje: 'Trimestre creado exitosamente',
      trimestre: {
        id: trimestreId,
        nombre: nombre.trim(),
      },
    });
  } catch (error) {
    console.error('Error al crear trimestre:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar trimestre
 */
const actualizarTrimestre = async (req, res) => {
  const { id } = req.params;
  const { nombre, fecha_inicio, fecha_fin, proyecto_id } = req.body;

  try {
    // Validar campos requeridos
    if (!nombre || !fecha_inicio || !fecha_fin || !proyecto_id) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Nombre, fecha_inicio, fecha_fin y proyecto_id son requeridos',
      });
    }

    // Verificar que el trimestre existe
    const trimestreExistente = await db('trimestres').where('id', id).first();
    if (!trimestreExistente) {
      return res.status(404).json({
        error: 'Trimestre no encontrado',
      });
    }

    // Verificar proyecto
    const proyecto = await db('proyectos').where('id', proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }

    // Verificar permisos
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }

    // Verificar fechas
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);

    if (inicio >= fin) {
      return res.status(400).json({
        error: 'Fechas inválidas',
        message: 'La fecha de inicio debe ser anterior a la fecha de fin',
      });
    }

    // Actualizar
    await db('trimestres')
      .where('id', id)
      .update({
        nombre: nombre.trim(),
        fecha_inicio: inicio,
        fecha_fin: fin,
        proyecto_id,
      });

    res.json({
      mensaje: 'Trimestre actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar trimestre:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar trimestre (soft delete)
 */
const eliminarTrimestre = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  
  try {
    // Verificar que el trimestre existe
    const trimestre = await db('trimestres').where('id', id).first();
    if (!trimestre) {
      return res.status(404).json({
        error: 'Trimestre no encontrado',
      });
    }
    
    // Verificar proyecto
    const proyecto = await db('proyectos').where('id', trimestre.proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    // Verificar permisos
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    // Obtener configuración de días de retención
    const configEliminados = await db('configuracion_eliminados')
      .where('entidad', 'trimestre')
      .first();
    
    const diasRetencion = configEliminados ? configEliminados.dias_retencion : 90;
    const fechaEliminacionPermanente = new Date();
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + diasRetencion);
    
    // Soft delete en transacción
    await db.transaction(async (trx) => {
      // Copiar datos a eliminados
      await trx('eliminados').insert({
        entidad: 'trimestre',
        entidad_id: trimestre.id,
        datos_originales: JSON.stringify(trimestre),
        eliminado_por: req.usuario.id,
        fecha_eliminacion_permanente: fechaEliminacionPermanente,
        motivo: motivo || null,
      });
      
      // Marcar como eliminado
      await trx('trimestres')
        .where('id', id)
        .update({
          eliminado: true,
          fecha_eliminacion: new Date(),
        });
    });
    
    res.json({
      mensaje: `Trimestre eliminado. Se eliminará permanentemente el ${fechaEliminacionPermanente.toISOString().split('T')[0]}`,
    });
  } catch (error) {
    console.error('Error al eliminar trimestre:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Recuperar trimestre eliminado
 */
const recuperarTrimestre = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Buscar en eliminados
    const eliminado = await db('eliminados')
      .where('entidad', 'trimestre')
      .where('entidad_id', id)
      .first();
    
    if (!eliminado) {
      return res.status(404).json({
        error: 'Registro de eliminación no encontrado',
      });
    }
    
    if (!eliminado.puede_recuperar) {
      return res.status(400).json({
        error: 'Este trimestre no puede ser recuperado',
      });
    }
    
    // Recuperar en transacción
    await db.transaction(async (trx) => {
      // Actualizar trimestre
      await trx('trimestres')
        .where('id', id)
        .update({
          eliminado: false,
          fecha_eliminacion: null,
        });
      
      // Actualizar registro de eliminados
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
      mensaje: 'Trimestre recuperado exitosamente',
    });
  } catch (error) {
    console.error('Error al recuperar trimestre:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  listarTrimestres,
  obtenerTrimestre,
  crearTrimestre,
  actualizarTrimestre,
  eliminarTrimestre,
  recuperarTrimestre,
};
