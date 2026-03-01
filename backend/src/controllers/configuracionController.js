const db = require('../config/database');

/**
 * Obtener configuración de días laborables de un proyecto
 */
const obtenerDiasLaborables = async (req, res) => {
  const { id } = req.params; // ID del proyecto
  
  try {
    // Verificar que el proyecto existe
    const proyecto = await db('proyectos').where('id', id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    // Verificar permisos
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para ver esta configuración',
      });
    }
    
    // Obtener días configurados
    const dias = await db('configuracion_dias_laborables')
      .where('proyecto_id', id)
      .orderBy('dia_semana');
    
    // Si no hay configuración, devolver defaults (Lun-Vie laborables)
    if (dias.length === 0) {
      const defaults = [
        { dia_semana: 0, es_laborable: false, nombre: 'Domingo' },
        { dia_semana: 1, es_laborable: true, nombre: 'Lunes' },
        { dia_semana: 2, es_laborable: true, nombre: 'Martes' },
        { dia_semana: 3, es_laborable: true, nombre: 'Miércoles' },
        { dia_semana: 4, es_laborable: true, nombre: 'Jueves' },
        { dia_semana: 5, es_laborable: true, nombre: 'Viernes' },
        { dia_semana: 6, es_laborable: false, nombre: 'Sábado' },
      ];
      
      return res.json({
        proyecto_id: id,
        dias: defaults,
      });
    }
    
    // Mapear con nombres
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diasConNombre = dias.map(d => ({
      ...d,
      nombre: nombresDias[d.dia_semana],
    }));
    
    res.json({
      proyecto_id: id,
      dias: diasConNombre,
    });
  } catch (error) {
    console.error('Error al obtener días laborables:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar configuración de días laborables
 */
const actualizarDiasLaborables = async (req, res) => {
  const { id } = req.params; // ID del proyecto
  const { dias } = req.body; // Array de {dia_semana, es_laborable}
  
  try {
    // Validar campos requeridos
    if (!dias || !Array.isArray(dias)) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Se requiere un array de días',
      });
    }
    
    // Verificar que el proyecto existe
    const proyecto = await db('proyectos').where('id', id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    // Verificar permisos
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para configurar este proyecto',
      });
    }
    
    // Actualizar en transacción
    await db.transaction(async (trx) => {
      // Eliminar configuración existente
      await trx('configuracion_dias_laborables')
        .where('proyecto_id', id)
        .del();
      
      // Insertar nueva configuración
      const configuracion = dias.map(d => ({
        proyecto_id: id,
        dia_semana: d.dia_semana,
        es_laborable: d.es_laborable,
      }));
      
      await trx('configuracion_dias_laborables').insert(configuracion);
    });
    
    res.json({
      mensaje: 'Días laborables configurados exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar días laborables:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener costos de días no laborables
 */
const obtenerCostosNoLaborables = async (req, res) => {
  const { id } = req.params; // ID del proyecto
  
  try {
    // Verificar que el proyecto existe
    const proyecto = await db('proyectos').where('id', id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    // Verificar permisos
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para ver esta configuración',
      });
    }
    
    // Obtener costos configurados
    const costos = await db('costos_dias_no_laborables')
      .select('costos_dias_no_laborables.*', 
              'usuarios.nombre as usuario_nombre',
              'usuarios.email as usuario_email')
      .leftJoin('usuarios', 'costos_dias_no_laborables.usuario_id', 'usuarios.id')
      .where('costos_dias_no_laborables.proyecto_id', id)
      .whereNull('costos_dias_no_laborables.fecha_fin');
    
    res.json({
      proyecto_id: id,
      costos,
    });
  } catch (error) {
    console.error('Error al obtener costos no laborables:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar costos de días no laborables
 */
const actualizarCostosNoLaborables = async (req, res) => {
  const { id } = req.params; // ID del proyecto
  const { usuario_id, costo_hora_no_laborable, porcentaje_adicional, aplica_a_todos_no_laborables } = req.body;
  
  try {
    // Validar campos requeridos
    if (!usuario_id) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'usuario_id es requerido',
      });
    }
    
    // Verificar que el proyecto existe
    const proyecto = await db('proyectos').where('id', id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    // Verificar permisos
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para configurar este proyecto',
      });
    }
    
    // Verificar que el usuario existe
    const usuario = await db('usuarios').where('id', usuario_id).first();
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }
    
    // Obtener costo por hora base del usuario
    const costoBase = await db('costos_por_hora')
      .where('usuario_id', usuario_id)
      .where('tipo_alcance', 'global')
      .whereNull('fecha_fin')
      .orderBy('fecha_inicio', 'desc')
      .first();
    
    // Calcular costo si se proporciona porcentaje
    let costoFinal = costo_hora_no_laborable;
    if (!costoFinal && porcentaje_adicional && costoBase) {
      costoFinal = costoBase.costo_hora * (1 + porcentaje_adicional / 100);
    }
    
    if (!costoFinal) {
      return res.status(400).json({
        error: 'Costo inválido',
        message: 'Se requiere costo_hora_no_laborable o porcentaje_adicional con un costo base configurado',
      });
    }
    
    // Actualizar en transacción
    await db.transaction(async (trx) => {
      // Desactivar costos anteriores para este usuario y proyecto
      await trx('costos_dias_no_laborables')
        .where('usuario_id', usuario_id)
        .where('proyecto_id', id)
        .whereNull('fecha_fin')
        .update({ fecha_fin: new Date() });
      
      // Insertar nuevo costo
      await trx('costos_dias_no_laborables').insert({
        usuario_id,
        proyecto_id: id,
        costo_hora_no_laborable: costoFinal,
        porcentaje_adicional: porcentaje_adicional || 0,
        aplica_a_todos_no_laborables: aplica_a_todos_no_laborables !== undefined ? aplica_a_todos_no_laborables : true,
        fecha_inicio: new Date(),
      });
    });
    
    res.json({
      mensaje: 'Costo de día no laborable configurado exitosamente',
      costo: {
        usuario_id,
        costo_hora_no_laborable: costoFinal,
        porcentaje_adicional: porcentaje_adicional || 0,
      },
    });
  } catch (error) {
    console.error('Error al actualizar costos no laborables:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar costo de día no laborable
 */
const eliminarCostoNoLaborable = async (req, res) => {
  const { id } = req.params; // ID del costo
  
  try {
    // Obtener costo
    const costo = await db('costos_dias_no_laborables')
      .where('id', id)
      .first();
    
    if (!costo) {
      return res.status(404).json({
        error: 'Costo no encontrado',
      });
    }
    
    // Verificar proyecto
    const proyecto = await db('proyectos').where('id', costo.proyecto_id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    // Verificar permisos
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para eliminar esta configuración',
      });
    }
    
    // Eliminar (soft delete con fecha_fin)
    await db('costos_dias_no_laborables')
      .where('id', id)
      .update({ fecha_fin: new Date() });
    
    res.json({
      mensaje: 'Costo eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar costo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  obtenerDiasLaborables,
  actualizarDiasLaborables,
  obtenerCostosNoLaborables,
  actualizarCostosNoLaborables,
  eliminarCostoNoLaborable,
};
