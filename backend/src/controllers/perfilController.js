const db = require('../config/database');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/hashPassword');

/**
 * Obtener perfil del usuario actual
 */
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await db('usuarios')
      .select('id', 'nombre', 'email', 'rol_id', 'ultimo_login', 
              'fecha_creacion', 'email_verificado', 'activo')
      .where('id', req.usuario.id)
      .first();
    
    res.json({
      usuario,
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar perfil del usuario
 */
const actualizarPerfil = async (req, res) => {
  const { nombre, email } = req.body;
  const usuarioId = req.usuario.id;
  
  try {
    // Verificar email duplicado
    if (email) {
      const emailExistente = await db('usuarios')
        .where('email', email)
        .where('id', '!=', usuarioId)
        .first();
      
      if (emailExistente) {
        return res.status(409).json({
          error: 'Email duplicado',
          message: 'Este email ya está registrado',
        });
      }
    }
    
    // Preparar datos de actualización
    const datosActualizacion = {};
    if (nombre) datosActualizacion.nombre = nombre.trim();
    if (email) datosActualizacion.email = email.trim();
    
    // Actualizar
    await db('usuarios')
      .where('id', usuarioId)
      .update(datosActualizacion);
    
    res.json({
      mensaje: 'Perfil actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Cambiar contraseña desde el perfil
 */
const cambiarPasswordPerfil = async (req, res) => {
  const { passwordActual, passwordNuevo } = req.body;
  const usuarioId = req.usuario.id;
  
  try {
    // Validar campos requeridos
    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Contraseña actual y nueva contraseña son requeridas',
      });
    }
    
    // Validar fortaleza de nueva contraseña
    const passwordValidation = validatePasswordStrength(passwordNuevo);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Contraseña débil',
        message: passwordValidation.errors,
      });
    }
    
    // Obtener usuario actual
    const usuario = await db('usuarios').where('id', usuarioId).first();
    
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }
    
    // Verificar contraseña actual
    const passwordValid = await comparePassword(passwordActual, usuario.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        error: 'Contraseña incorrecta',
        message: 'La contraseña actual es incorrecta',
      });
    }
    
    // Hashear nueva contraseña
    const passwordHash = await hashPassword(passwordNuevo);
    
    // Actualizar contraseña
    await db('usuarios')
      .where('id', usuarioId)
      .update({
        password_hash: passwordHash,
        debe_cambiar_password: false,
        ultima_fecha_cambio_password: new Date(),
      });
    
    res.json({
      mensaje: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener estadísticas del usuario
 */
const obtenerEstadisticasUsuario = async (req, res) => {
  const usuarioId = req.usuario.id;
  
  try {
    // Total de tareas registradas
    const totalTareas = await db('tareas')
      .where('usuario_id', usuarioId)
      .count('* as total')
      .first();
    
    // Horas totales registradas
    const totalHoras = await db('tareas')
      .where('usuario_id', usuarioId)
      .sum('horas_registradas as total')
      .first();
    
    // Tareas por estado
    const tareasPorEstado = await db('tareas')
      .select('estado')
      .select(db.raw('COUNT(*) as cantidad'))
      .where('usuario_id', usuarioId)
      .groupBy('estado');
    
    // Últimas tareas
    const ultimasTareas = await db('tareas')
      .select('tareas.*', 'actividades.nombre as actividad_nombre', 'proyectos.nombre as proyecto_nombre')
      .leftJoin('actividades', 'tareas.actividad_id', 'actividades.id')
      .leftJoin('proyectos', 'actividades.proyecto_id', 'proyectos.id')
      .where('tareas.usuario_id', usuarioId)
      .orderBy('tareas.fecha_registro', 'desc')
      .limit(5);
    
    res.json({
      estadisticas: {
        totalTareas: parseInt(totalTareas.total),
        totalHoras: parseFloat(totalHoras.total) || 0,
        tareasPorEstado,
        ultimasTareas,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  cambiarPasswordPerfil,
  obtenerEstadisticasUsuario,
};
