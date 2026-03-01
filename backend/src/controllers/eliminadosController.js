const db = require('../config/database');

/**
 * Listar elementos eliminados (con filtros)
 */
const listarEliminados = async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    entidad = '', 
    estado = '',
    fecha_desde = '',
    fecha_hasta = ''
  } = req.query;
  
  try {
    const offset = (page - 1) * limit;
    
    let query = db('eliminados')
      .select('eliminados.*',
              'eliminator.nombre as eliminado_por_nombre',
              'eliminator.email as eliminado_por_email',
              'recuperador.nombre as recuperado_por_nombre')
      .leftJoin('usuarios as eliminator', 'eliminados.eliminado_por', 'eliminator.id')
      .leftJoin('usuarios as recuperador', 'eliminados.recuperado_por', 'recuperador.id');
    
    // Aplicar filtros
    if (entidad) {
      query.where('eliminados.entidad', entidad);
    }
    
    if (estado === 'recuperable') {
      query.where('eliminados.puede_recuperar', true)
           .where('eliminados.recuperado', false);
    } else if (estado === 'recuperado') {
      query.where('eliminados.recuperado', true);
    } else if (estado === 'vencido') {
      query.where('eliminados.fecha_eliminacion_permanente', '<', new Date());
    }
    
    if (fecha_desde) {
      query.where('eliminados.fecha_eliminacion', '>=', new Date(fecha_desde));
    }
    
    if (fecha_hasta) {
      query.where('eliminados.fecha_eliminacion', '<=', new Date(fecha_hasta));
    }
    
    // Solo admin ve sus propios eliminados
    if (req.usuario.rol === 'admin') {
      query.where('eliminados.eliminado_por', req.usuario.id);
    }
    
    // Obtener total
    const totalResult = await query.clone().count('* as total').first();
    const total = parseInt(totalResult.total);
    
    // Aplicar paginación
    const eliminados = await query
      .limit(parseInt(limit))
      .offset(offset)
      .orderBy('eliminados.fecha_eliminacion', 'desc');
    
    // Parsear datos originales para cada eliminado
    const eliminadosConDatos = eliminados.map(item => ({
      ...item,
      datos_originales: typeof item.datos_originales === 'string' 
        ? JSON.parse(item.datos_originales) 
        : item.datos_originales,
      dias_restantes: Math.max(0, Math.ceil((new Date(item.fecha_eliminacion_permanente) - new Date()) / (1000 * 60 * 60 * 24))),
    }));
    
    res.json({
      eliminados: eliminadosConDatos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al listar eliminados:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener detalle de un elemento eliminado
 */
const obtenerDetalleEliminado = async (req, res) => {
  const { id } = req.params;
  
  try {
    const eliminado = await db('eliminados')
      .select('eliminados.*',
              'eliminator.nombre as eliminado_por_nombre',
              'eliminator.email as eliminado_por_email',
              'recuperador.nombre as recuperado_por_nombre')
      .leftJoin('usuarios as eliminator', 'eliminados.eliminado_por', 'eliminator.id')
      .leftJoin('usuarios as recuperador', 'eliminados.recuperado_por', 'recuperador.id')
      .where('eliminados.id', id)
      .first();
    
    if (!eliminado) {
      return res.status(404).json({
        error: 'Registro de eliminación no encontrado',
      });
    }
    
    // Verificar permisos
    if (req.usuario.rol === 'admin' && eliminado.eliminado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para ver este registro',
      });
    }
    
    res.json({
      eliminado: {
        ...eliminado,
        datos_originales: typeof eliminado.datos_originales === 'string' 
          ? JSON.parse(eliminado.datos_originales) 
          : eliminado.datos_originales,
        dias_restantes: Math.max(0, Math.ceil((new Date(eliminado.fecha_eliminacion_permanente) - new Date()) / (1000 * 60 * 60 * 24))),
      },
    });
  } catch (error) {
    console.error('Error al obtener detalle de eliminado:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Recuperar elemento eliminado
 */
const recuperarEliminado = async (req, res) => {
  const { id } = req.params;
  const { notas } = req.body;
  
  try {
    const eliminado = await db('eliminados').where('id', id).first();
    
    if (!eliminado) {
      return res.status(404).json({
        error: 'Registro de eliminación no encontrado',
      });
    }
    
    if (!eliminado.puede_recuperar) {
      return res.status(400).json({
        error: 'Este elemento no puede ser recuperado',
      });
    }
    
    if (eliminado.recuperado) {
      return res.status(400).json({
        error: 'Este elemento ya fue recuperado',
      });
    }
    
    // Verificar permisos
    if (req.usuario.rol === 'admin' && eliminado.eliminado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    // Verificar que la entidad existe en la tabla original
    const entidadExiste = await db(eliminado.entidad)
      .where('id', eliminado.entidad_id)
      .first();
    
    if (!entidadExiste) {
      return res.status(404).json({
        error: 'El elemento original ya no existe',
      });
    }
    
    // Recuperar en transacción
    await db.transaction(async (trx) => {
      // Actualizar elemento original
      await trx(eliminado.entidad)
        .where('id', eliminado.entidad_id)
        .update({
          eliminado: false,
          fecha_eliminacion: null,
          activo: true,
        });
      
      // Actualizar registro de eliminados
      await trx('eliminados')
        .where('id', id)
        .update({
          recuperado: true,
          recuperado_por: req.usuario.id,
          fecha_recuperacion: new Date(),
          puede_recuperar: false,
          motivo: notas || eliminado.motivo,
        });
    });
    
    res.json({
      mensaje: `${eliminado.entidad} recuperado exitosamente`,
      eliminado: {
        id,
        entidad: eliminado.entidad,
        entidad_id: eliminado.entidad_id,
        recuperado: true,
      },
    });
  } catch (error) {
    console.error('Error al recuperar eliminado:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar permanentemente un elemento individual
 */
const eliminarPermanenteIndividual = async (req, res) => {
  const { id } = req.params;
  const { motivo, confirmacion } = req.body;
  
  try {
    // Validar confirmación
    if (confirmacion !== 'ELIMINAR PERMANENTEMENTE') {
      return res.status(400).json({
        error: 'Confirmación requerida',
        message: 'Debes escribir "ELIMINAR PERMANENTEMENTE" para confirmar',
      });
    }
    
    const eliminado = await db('eliminados').where('id', id).first();
    
    if (!eliminado) {
      return res.status(404).json({
        error: 'Registro de eliminación no encontrado',
      });
    }
    
    // Verificar permisos
    if (req.usuario.rol === 'admin' && eliminado.eliminado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
      });
    }
    
    // Verificar que no sea un admin (solo super_admin puede eliminar admins)
    if (eliminado.entidad === 'admin' && req.usuario.rol !== 'super_admin') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Solo un Super Admin puede eliminar administradores permanentemente',
      });
    }
    
    // Eliminar en transacción
    await db.transaction(async (trx) => {
      // Eliminar de la tabla original
      await trx(eliminado.entidad)
        .where('id', eliminado.entidad_id)
        .del();
      
      // Registrar en audit_log
      await trx('audit_log').insert({
        usuario_id: req.usuario.id,
        accion: 'eliminacion_permanente_manual',
        entidad: eliminado.entidad,
        entidad_id: eliminado.entidad_id,
        datos_anteriores: eliminado.datos_originales,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });
      
      // Eliminar registro de eliminados
      await trx('eliminados')
        .where('id', id)
        .del();
    });
    
    res.json({
      mensaje: `${eliminado.entidad} eliminado permanentemente`,
      eliminado: {
        entidad: eliminado.entidad,
        entidad_id: eliminado.entidad_id,
      },
    });
  } catch (error) {
    console.error('Error al eliminar permanentemente:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar permanentemente múltiples elementos
 */
const eliminarPermanenteMultiple = async (req, res) => {
  const { ids, motivo } = req.body;
  
  try {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: 'IDs requeridos',
        message: 'Debe proporcionar al menos un ID para eliminar',
      });
    }
    
    // Obtener todos los eliminados seleccionados
    const eliminados = await db('eliminados').whereIn('id', ids);
    
    // Verificar permisos para cada uno
    for (const eliminado of eliminados) {
      if (req.usuario.rol === 'admin' && eliminado.eliminado_por !== req.usuario.id) {
        return res.status(403).json({
          error: 'No autorizado',
          message: `No tienes permisos para eliminar el registro ${eliminado.id}`,
        });
      }
      
      if (eliminado.entidad === 'admin' && req.usuario.rol !== 'super_admin') {
        return res.status(403).json({
          error: 'No autorizado',
          message: 'Solo un Super Admin puede eliminar administradores permanentemente',
        });
      }
    }
    
    let eliminadosCount = 0;
    
    // Eliminar cada uno en transacción
    await db.transaction(async (trx) => {
      for (const eliminado of eliminados) {
        try {
          // Eliminar de la tabla original
          await trx(eliminado.entidad)
            .where('id', eliminado.entidad_id)
            .del();
          
          // Registrar en audit_log
          await trx('audit_log').insert({
            usuario_id: req.usuario.id,
            accion: 'eliminacion_permanente_multiple',
            entidad: eliminado.entidad,
            entidad_id: eliminado.entidad_id,
            datos_anteriores: eliminado.datos_originales,
            ip_address: req.ip,
            user_agent: req.get('user-agent'),
          });
          
          eliminadosCount++;
        } catch (error) {
          console.error(`Error eliminando ${eliminado.entidad} ID ${eliminado.entidad_id}:`, error);
        }
      }
      
      // Eliminar registros de la tabla eliminados
      await trx('eliminados')
        .whereIn('id', ids)
        .del();
    });
    
    res.json({
      mensaje: `${eliminadosCount} elementos eliminados permanentemente`,
      total_procesado: eliminados.length,
      total_eliminado: eliminadosCount,
    });
  } catch (error) {
    console.error('Error al eliminar múltiples permanentemente:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Vaciar toda la papelera de eliminados
 */
const vaciarTodosEliminados = async (req, res) => {
  const { password, motivo, confirmacion } = req.body;
  
  try {
    // Validar confirmación
    if (confirmacion !== 'VACIAR PAPELERA COMPLETAMENTE') {
      return res.status(400).json({
        error: 'Confirmación requerida',
        message: 'Debes escribir "VACIAR PAPELERA COMPLETAMENTE" para confirmar',
      });
    }
    
    // Validar password
    const usuario = await db('usuarios').where('id', req.usuario.id).first();
    const passwordValido = await require('bcrypt').compare(password, usuario.password_hash);
    
    if (!passwordValido) {
      return res.status(401).json({
        error: 'Contraseña incorrecta',
      });
    }
    
    // Contar total de eliminados
    let query = db('eliminados');
    
    // Solo admin ve sus propios eliminados
    if (req.usuario.rol === 'admin') {
      query.where('eliminados.eliminado_por', req.usuario.id);
    }
    
    const totalEliminados = await query.count('* as total').first();
    
    if (parseInt(totalEliminados.total) === 0) {
      return res.json({
        mensaje: 'No hay elementos eliminados para vaciar',
        total_eliminado: 0,
      });
    }
    
    // Obtener todos los eliminados
    const eliminados = await query.select('*');
    
    let eliminadosCount = 0;
    
    // Eliminar cada uno en transacción
    await db.transaction(async (trx) => {
      for (const eliminado of eliminados) {
        try {
          // Saltar admins si no es super_admin
          if (eliminado.entidad === 'admin' && req.usuario.rol !== 'super_admin') {
            continue;
          }
          
          // Eliminar de la tabla original
          await trx(eliminado.entidad)
            .where('id', eliminado.entidad_id)
            .del();
          
          // Registrar en audit_log
          await trx('audit_log').insert({
            usuario_id: req.usuario.id,
            accion: 'vaciar_todos_eliminados',
            entidad: eliminado.entidad,
            entidad_id: eliminado.entidad_id,
            datos_anteriores: eliminado.datos_originales,
            ip_address: req.ip,
            user_agent: req.get('user-agent'),
          });
          
          eliminadosCount++;
        } catch (error) {
          console.error(`Error eliminando ${eliminado.entidad} ID ${eliminado.entidad_id}:`, error);
        }
      }
      
      // Vaciar la tabla eliminados
      if (req.usuario.rol === 'super_admin') {
        await trx('eliminados').del();
      } else {
        await trx('eliminados')
          .where('eliminado_por', req.usuario.id)
          .del();
      }
    });
    
    res.json({
      mensaje: `${eliminadosCount} elementos eliminados permanentemente`,
      total_procesado: parseInt(totalEliminados.total),
      total_eliminado: eliminadosCount,
    });
  } catch (error) {
    console.error('Error al vaciar todos los eliminados:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener configuración de días de retención
 */
const obtenerConfiguracion = async (req, res) => {
  try {
    const configuracion = await db('configuracion_eliminados')
      .select('*')
      .orderBy('entidad', 'asc');
    
    res.json({
      configuracion,
      total: configuracion.length,
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar configuración de días de retención
 */
const actualizarConfiguracion = async (req, res) => {
  const { entidad } = req.params;
  const { dias_retencion, permitido_recuperar, requiere_aprobacion } = req.body;
  
  try {
    const configuracionExistente = await db('configuracion_eliminados')
      .where('entidad', entidad)
      .first();
    
    if (!configuracionExistente) {
      return res.status(404).json({
        error: 'Configuración no encontrada',
      });
    }
    
    const datosActualizacion = {};
    if (dias_retencion !== undefined) datosActualizacion.dias_retencion = dias_retencion;
    if (permitido_recuperar !== undefined) datosActualizacion.permitido_recuperar = permitido_recuperar;
    if (requiere_aprobacion !== undefined) datosActualizacion.requiere_aprobacion = requiere_aprobacion;
    
    await db('configuracion_eliminados')
      .where('entidad', entidad)
      .update(datosActualizacion);
    
    res.json({
      mensaje: 'Configuración actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener resumen de la papelera
 */
const obtenerResumenPapelera = async (req, res) => {
  try {
    // Total de eliminados
    let queryTotal = db('eliminados');
    
    if (req.usuario.rol === 'admin') {
      queryTotal.where('eliminados.eliminado_por', req.usuario.id);
    }
    
    const total = await queryTotal.count('* as total').first();
    
    // Recuperables
    let queryRecuperables = db('eliminados')
      .where('puede_recuperar', true)
      .where('recuperado', false);
    
    if (req.usuario.rol === 'admin') {
      queryRecuperables.where('eliminados.eliminado_por', req.usuario.id);
    }
    
    const recuperables = await queryRecuperables.count('* as total').first();
    
    // Próximos a eliminar (menos de 7 días)
    const proximosEliminar = new Date();
    proximosEliminar.setDate(proximosEliminar.getDate() + 7);
    
    let queryProximos = db('eliminados')
      .where('fecha_eliminacion_permanente', '<=', proximosEliminar)
      .where('puede_recuperar', true)
      .where('recuperado', false);
    
    if (req.usuario.rol === 'admin') {
      queryProximos.where('eliminados.eliminado_por', req.usuario.id);
    }
    
    const proximos = await queryProximos.count('* as total').first();
    
    // Desglose por entidad
    let queryDesglose = db('eliminados')
      .select('entidad')
      .count('* as total');
    
    if (req.usuario.rol === 'admin') {
      queryDesglose.where('eliminados.eliminado_por', req.usuario.id);
    }
    
    const desglose = await queryDesglose.groupBy('entidad');
    
    res.json({
      resumen: {
        total: parseInt(total.total),
        recuperables: parseInt(recuperables.total),
        proximos_a_eliminar: parseInt(proximos.total),
        desglose_por_entidad: desglose.map(item => ({
          entidad: item.entidad,
          total: parseInt(item.total),
        })),
      },
    });
  } catch (error) {
    console.error('Error al obtener resumen de papelera:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  listarEliminados,
  obtenerDetalleEliminado,
  recuperarEliminado,
  eliminarPermanenteIndividual,
  eliminarPermanenteMultiple,
  vaciarTodosEliminados,
  obtenerConfiguracion,
  actualizarConfiguracion,
  obtenerResumenPapelera,
};
