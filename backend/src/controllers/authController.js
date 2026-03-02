const db = require('../config/database');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/hashPassword');
const { generateToken } = require('../utils/generateToken');
const { enviarEmailBienvenida, enviarEmailVerificacion, enviarEmailRecuperacion } = require('../services/emailService');
const crypto = require('crypto');

/**
 * Registrar nuevo usuario (auto-registro público para admin)
 */
const registro = async (req, res) => {
  const { nombre, email, password } = req.body;
  
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

    // Obtener rol de team_member (registro público)
    const teamMemberRole = await db('roles').where('nombre', 'team_member').first();
    if (!teamMemberRole) {
      return res.status(500).json({
        error: 'Error de configuración',
        message: 'Rol de team_member no encontrado',
      });
    }

    // Hashear contraseña
    const passwordHash = await hashPassword(password);

    // Generar token de verificación de email
    const tokenVerificacion = crypto.randomBytes(32).toString('hex');

    // Crear usuario
    const [usuarioId] = await db('usuarios').insert({
      nombre,
      email,
      password_hash: passwordHash,
      rol_id: teamMemberRole.id,
      debe_cambiar_password: false,
      activo: true,
      email_verificado: false,
      token_verificacion_email: tokenVerificacion,
      creado_por: null, // Auto-registro
    });
    
    // Guardar token de verificación
    await db('email_verification_tokens').insert({
      usuario_id: usuarioId,
      token: tokenVerificacion,
      expira_en: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    });
    
    // Enviar email de verificación
    await enviarEmailVerificacion(email, nombre, tokenVerificacion);
    
    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.',
      usuario: {
        id: usuarioId,
        nombre,
        email,
      },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al registrar usuario',
    });
  }
};

/**
 * Login de usuario
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Email y contraseña son requeridos',
      });
    }
    
    // Buscar usuario con rol
    const usuario = await db('usuarios')
      .select('usuarios.*', 'roles.nombre as rol', 'roles.nivel as rol_nivel')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .where('usuarios.email', email)
      .first();
    
    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos',
      });
    }
    
    // Verificar contraseña
    const passwordValid = await comparePassword(password, usuario.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos',
      });
    }
    
    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      return res.status(403).json({
        error: 'Cuenta desactivada',
        message: 'Tu cuenta ha sido desactivada. Contacta a tu administrador.',
      });
    }
    
    // Verificar que el usuario no esté eliminado
    if (usuario.eliminado) {
      return res.status(403).json({
        error: 'Cuenta eliminada',
        message: 'Tu cuenta ha sido eliminada.',
      });
    }
    
    // Actualizar último login
    await db('usuarios')
      .where('id', usuario.id)
      .update({ ultimo_login: new Date() });
    
    // Generar token JWT
    const token = generateToken({
      usuarioId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });
    
    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        rol_nivel: usuario.rol_nivel,
        debe_cambiar_password: usuario.debe_cambiar_password,
        email_verificado: usuario.email_verificado,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al iniciar sesión',
    });
  }
};

/**
 * Cambiar contraseña (usuario autenticado)
 */
const cambiarPassword = async (req, res) => {
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
      message: 'Error al cambiar contraseña',
    });
  }
};

/**
 * Solicitar recuperación de contraseña
 */
const solicitarRecuperacion = async (req, res) => {
  const { email } = req.body;
  
  try {
    // Buscar usuario
    const usuario = await db('usuarios').where('email', email).first();
    
    // Si no existe, no hacer nada (por seguridad)
    if (!usuario) {
      return res.json({
        mensaje: 'Si el email está registrado, recibirás instrucciones para recuperar tu contraseña',
      });
    }
    
    // Generar token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Guardar token
    await db('password_reset_tokens').insert({
      usuario_id: usuario.id,
      token,
      expira_en: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    });
    
    // Enviar email
    await enviarEmailRecuperacion(usuario.email, usuario.nombre, token);
    
    res.json({
      mensaje: 'Si el email está registrado, recibirás instrucciones para recuperar tu contraseña',
    });
  } catch (error) {
    console.error('Error en solicitud de recuperación:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Restablecer contraseña con token
 */
const restablecerPassword = async (req, res) => {
  const { token, passwordNuevo } = req.body;
  
  try {
    // Validar campos
    if (!token || !passwordNuevo) {
      return res.status(400).json({
        error: 'Campos requeridos',
      });
    }
    
    // Validar fortaleza de contraseña
    const passwordValidation = validatePasswordStrength(passwordNuevo);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Contraseña débil',
        message: passwordValidation.errors,
      });
    }
    
    // Buscar token válido
    const tokenRecord = await db('password_reset_tokens')
      .where('token', token)
      .where('usado', false)
      .where('expira_en', '>', new Date())
      .first();
    
    if (!tokenRecord) {
      return res.status(400).json({
        error: 'Token inválido o expirado',
      });
    }
    
    // Hashear nueva contraseña
    const passwordHash = await hashPassword(passwordNuevo);
    
    // Actualizar contraseña en transacción
    await db.transaction(async (trx) => {
      await trx('usuario')
        .where('id', tokenRecord.usuario_id)
        .update({
          password_hash: passwordHash,
          debe_cambiar_password: false,
          ultima_fecha_cambio_password: new Date(),
        });
      
      await trx('password_reset_tokens')
        .where('id', tokenRecord.id)
        .update({ usado: true });
    });
    
    res.json({
      mensaje: 'Contraseña restablecida exitosamente',
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Verificar email
 */
const verificarEmail = async (req, res) => {
  const { token } = req.params;
  
  try {
    // Buscar token válido
    const tokenRecord = await db('email_verification_tokens')
      .where('token', token)
      .where('usado', false)
      .where('expira_en', '>', new Date())
      .first();
    
    if (!tokenRecord) {
      return res.status(400).json({
        error: 'Token inválido o expirado',
      });
    }
    
    // Actualizar usuario y token en transacción
    await db.transaction(async (trx) => {
      await trx('usuario')
        .where('id', tokenRecord.usuario_id)
        .update({ email_verificado: true });
      
      await trx('email_verification_tokens')
        .where('id', tokenRecord.id)
        .update({ usado: true });
    });
    
    res.json({
      mensaje: 'Email verificado exitosamente',
    });
  } catch (error) {
    console.error('Error al verificar email:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener usuario actual
 */
const obtenerUsuarioActual = async (req, res) => {
  try {
    const usuario = await db('usuarios')
      .select('usuarios.id', 'usuarios.nombre', 'usuarios.email', 'usuarios.rol_id', 
              'usuarios.ultimo_login', 'usuarios.fecha_creacion', 
              'roles.nombre as rol', 'roles.nivel as rol_nivel')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .where('usuarios.id', req.usuario.id)
      .first();

    res.json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        rol_nivel: usuario.rol_nivel,
      },
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Logout (en realidad es solo invalidar el token en el frontend)
 */
const logout = async (req, res) => {
  res.json({
    mensaje: 'Sesión cerrada exitosamente',
  });
};

module.exports = {
  registro,
  login,
  cambiarPassword,
  solicitarRecuperacion,
  restablecerPassword,
  verificarEmail,
  obtenerUsuarioActual,
  logout,
};
