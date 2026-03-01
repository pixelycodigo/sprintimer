const db = require('../config/database');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/hashPassword');
const { enviarEmailBienvenida } = require('../services/emailService');
const crypto = require('crypto');

/**
 * Listar usuarios (con paginación y filtros)
 */
const listarUsuarios = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      rol = '',
      activo = '',
      eliminado = false 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Construir query base
    let query = db('usuarios')
      .select('usuarios.*', 'roles.nombre as rol', 'roles.nivel as rol_nivel',
              'creador.nombre as creado_por_nombre', 'creador.email as creado_por_email')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .leftJoin('usuarios as creador', 'usuarios.creado_por', 'creador.id')
      .where('usuarios.eliminado', eliminado);
    
    // Aplicar filtros
    if (search) {
      query.where((builder) => {
        builder.where('usuarios.nombre', 'like', `%${search}%`)
               .orWhere('usuarios.email', 'like', `%${search}%`);
      });
    }
    
    if (rol) {
      query.where('roles.nombre', rol);
    }
    
    if (activo !== '') {
      query.where('usuarios.activo', activo === 'true');
    }
    
    // Obtener total
    const totalResult = await query.clone().count('* as total').first();
    const total = parseInt(totalResult.total);
    
    // Aplicar paginación
    const usuarios = await query
      .limit(parseInt(limit))
      .offset(offset)
      .orderBy('usuarios.fecha_creacion', 'desc');
    
    res.json({
      usuarios,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al listar usuarios',
    });
  }
};

/**
 * Obtener usuario por ID
 */
const obtenerUsuario = async (req, res) => {
  const { id } = req.params;
  
  try {
    const usuario = await db('usuarios')
      .select('usuarios.*', 'roles.nombre as rol', 'roles.nivel as rol_nivel',
              'creador.nombre as creado_por_nombre', 'creador.email as creado_por_email')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .leftJoin('usuarios as creador', 'usuarios.creado_por', 'creador.id')
      .where('usuarios.id', id)
      .first();
    
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }
    
    res.json({ usuario });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Crear usuario (Admin o Super Admin)
 */
const crearUsuario = async (req, res) => {
  const { 
    nombre, 
    email, 
    password, 
    rol_id, 
    es_temporal = true,
    debe_cambiar_password = true 
  } = req.body;
  
  try {
    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Nombre, email y contraseña son requeridos',
      });
    }
    
    // Validar fortaleza de contraseña
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Contraseña débil',
        message: passwordValidation.errors,
      });
    }
    
    // Verificar si el email ya existe
    const existingUser = await db('usuarios').where('email', email).first();
    if (existingUser) {
      return res.status(409).json({
        error: 'Email duplicado',
        message: 'Este email ya está registrado',
      });
    }
    
    // Verificar rol
    const rol = await db('roles').where('id', rol_id).first();
    if (!rol) {
      return res.status(400).json({
        error: 'Rol inválido',
      });
    }
    
    // Verificar permisos según rol del creador
    const creador = req.usuario;
    if (creador.rol === 'admin' && rol.nivel > 2) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Un admin no puede crear este tipo de rol',
      });
    }
    
    // Hashear contraseña
    const passwordHash = await hashPassword(password);
    
    // Crear usuario
    const [usuarioId] = await db('usuarios').insert({
      nombre: nombre.trim(),
      email: email.trim(),
      password_hash: passwordHash,
      rol_id,
      debe_cambiar_password: es_temporal ? true : debe_cambiar_password,
      activo: true,
      email_verificado: true, // Confiado por admin
      creado_por: creador.id,
    });
    
    // Enviar email de bienvenida
    await enviarEmailBienvenida(
      email.trim(), 
      nombre.trim(), 
      { email: email.trim(), password }, 
      es_temporal
    );
    
    res.status(201).json({
      mensaje: `Usuario ${es_temporal ? 'creado con contraseña temporal' : 'creado exitosamente'}`,
      usuario: {
        id: usuarioId,
        nombre: nombre.trim(),
        email: email.trim(),
        rol: rol.nombre,
      },
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al crear usuario',
    });
  }
};

/**
 * Actualizar usuario
 */
const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, activo, rol_id } = req.body;
  
  try {
    // Verificar que el usuario existe
    const usuarioExistente = await db('usuarios').where('id', id).first();
    if (!usuarioExistente) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }
    
    // Verificar permisos
    const creador = req.usuario;
    const usuarioRol = await db('roles').where('id', usuarioExistente.rol_id).first();
    
    // Admin solo puede editar usuarios de nivel igual o menor
    if (creador.rol === 'admin' && usuarioRol.nivel >= creador.rol_nivel) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para editar este usuario',
      });
    }
    
    // Verificar email duplicado (si se está cambiando)
    if (email && email !== usuarioExistente.email) {
      const emailExistente = await db('usuarios')
        .where('email', email)
        .where('id', '!=', id)
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
    if (activo !== undefined) datosActualizacion.activo = activo;
    if (rol_id) {
      // Verificar nuevo rol
      const nuevoRol = await db('roles').where('id', rol_id).first();
      if (!nuevoRol) {
        return res.status(400).json({ error: 'Rol inválido' });
      }
      
      // Admin no puede cambiar rol a uno superior
      if (creador.rol === 'admin' && nuevoRol.nivel > creador.rol_nivel) {
        return res.status(403).json({
          error: 'No autorizado',
          message: 'No puedes asignar este rol',
        });
      }
      datosActualizacion.rol_id = rol_id;
    }
    
    // Actualizar
    await db('usuarios')
      .where('id', id)
      .update(datosActualizacion);
    
    res.json({
      mensaje: 'Usuario actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar usuario (soft delete)
 */
const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  
  try {
    // Verificar que el usuario existe
    const usuario = await db('usuarios').where('id', id).first();
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }
    
    // No se puede eliminar a sí mismo
    if (usuario.id === req.usuario.id) {
      return res.status(400).json({
        error: 'No puedes eliminarte a ti mismo',
      });
    }
    
    // Verificar permisos
    const usuarioRol = await db('roles').where('id', usuario.rol_id).first();
    const creador = req.usuario;
    
    if (creador.rol === 'admin' && usuarioRol.nivel >= creador.rol_nivel) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para eliminar este usuario',
      });
    }
    
    // Obtener configuración de días de retención
    const configEliminados = await db('configuracion_eliminados')
      .where('entidad', 'usuario')
      .first();
    
    const diasRetencion = configEliminados ? configEliminados.dias_retencion : 30;
    const fechaEliminacionPermanente = new Date();
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + diasRetencion);
    
    // Soft delete en transacción
    await db.transaction(async (trx) => {
      // Copiar datos a eliminados
      await trx('eliminados').insert({
        entidad: 'usuario',
        entidad_id: usuario.id,
        datos_originales: JSON.stringify(usuario),
        eliminado_por: creador.id,
        fecha_eliminacion_permanente: fechaEliminacionPermanente,
        motivo: motivo || null,
      });
      
      // Marcar como eliminado
      await trx('usuarios')
        .where('id', id)
        .update({
          eliminado: true,
          fecha_eliminacion: new Date(),
          activo: false,
        });
    });
    
    res.json({
      mensaje: `Usuario eliminado. Se eliminará permanentemente el ${fechaEliminacionPermanente.toISOString().split('T')[0]}`,
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Recuperar usuario eliminado
 */
const recuperarUsuario = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Buscar en eliminados
    const eliminado = await db('eliminados')
      .where('entidad', 'usuario')
      .where('entidad_id', id)
      .first();
    
    if (!eliminado) {
      return res.status(404).json({
        error: 'Registro de eliminación no encontrado',
      });
    }
    
    if (!eliminado.puede_recuperar) {
      return res.status(400).json({
        error: 'Este usuario no puede ser recuperado',
      });
    }
    
    // Recuperar en transacción
    await db.transaction(async (trx) => {
      // Actualizar usuario
      await trx('usuarios')
        .where('id', id)
        .update({
          eliminado: false,
          fecha_eliminacion: null,
          activo: true,
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
      mensaje: 'Usuario recuperado exitosamente',
    });
  } catch (error) {
    console.error('Error al recuperar usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Cambiar contraseña de usuario (Admin)
 */
const cambiarPasswordUsuario = async (req, res) => {
  const { id } = req.params;
  const { password, es_temporal = true } = req.body;
  
  try {
    // Validar contraseña
    if (!password) {
      return res.status(400).json({
        error: 'Contraseña requerida',
      });
    }
    
    // Validar fortaleza
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Contraseña débil',
        message: passwordValidation.errors,
      });
    }
    
    // Verificar usuario
    const usuario = await db('usuarios').where('id', id).first();
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }
    
    // Hashear contraseña
    const passwordHash = await hashPassword(password);
    
    // Actualizar
    await db('usuarios')
      .where('id', id)
      .update({
        password_hash: passwordHash,
        debe_cambiar_password: es_temporal,
        ultima_fecha_cambio_password: new Date(),
      });
    
    res.json({
      mensaje: `Contraseña ${es_temporal ? 'temporal' : 'nueva'} establecida exitosamente`,
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  recuperarUsuario,
  cambiarPasswordUsuario,
};
