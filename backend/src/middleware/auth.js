const db = require('../config/database');
const { verifyToken } = require('../utils/generateToken');

/**
 * Middleware de autenticación
 * Verifica que el token JWT sea válido
 */
const autenticar = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'No se proporcionó token de autenticación',
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token inválido o expirado',
      });
    }
    
    // Buscar usuario en la base de datos
    const usuario = await db('usuarios')
      .select('usuarios.*', 'roles.nombre as rol', 'roles.nivel as rol_nivel')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .where('usuarios.id', decoded.usuarioId)
      .first();
    
    if (!usuario) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Usuario no encontrado',
      });
    }
    
    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Tu cuenta está desactivada. Contacta a tu administrador.',
      });
    }
    
    // Verificar que el usuario no esté eliminado
    if (usuario.eliminado) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Tu cuenta ha sido eliminada.',
      });
    }
    
    // Adjuntar usuario al request
    req.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      rol_nivel: usuario.rol_nivel,
      debe_cambiar_password: usuario.debe_cambiar_password,
      email_verificado: usuario.email_verificado,
    };
    
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al verificar autenticación',
    });
  }
};

/**
 * Middleware de verificación de rol
 * Verifica que el usuario tenga al menos uno de los roles permitidos
 */
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Debes iniciar sesión primero',
      });
    }
    
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`,
        rol_actual: req.usuario.rol,
      });
    }
    
    next();
  };
};

/**
 * Middleware de verificación de nivel de rol
 * Verifica que el usuario tenga al menos el nivel mínimo requerido
 */
const verificarNivelRol = (nivelMinimo) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Debes iniciar sesión primero',
      });
    }
    
    if (req.usuario.rol_nivel < nivelMinimo) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes el nivel de permisos necesario',
        nivel_requerido: nivelMinimo,
        nivel_actual: req.usuario.rol_nivel,
      });
    }
    
    next();
  };
};

/**
 * Middleware de cambio de contraseña obligatorio
 * Verifica que el usuario haya cambiado su contraseña si es requerido
 */
const debeCambiarPassword = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Debes iniciar sesión primero',
    });
  }
  
  if (req.usuario.debe_cambiar_password) {
    // Permitir solo estas rutas
    const rutasPermitidas = [
      '/api/auth/cambiar-password',
      '/api/auth/logout',
      '/api/usuario/perfil',
      '/api/auth/me',
    ];
    
    if (!rutasPermitidas.includes(req.path)) {
      return res.status(403).json({
        error: 'Cambio de contraseña requerido',
        message: 'Debes cambiar tu contraseña antes de continuar',
        codigo: 'PASSWORD_CHANGE_REQUIRED',
      });
    }
  }
  
  next();
};

/**
 * Middleware de email verificado
 * Verifica que el usuario haya verificado su email
 */
const emailVerificado = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Debes iniciar sesión primero',
    });
  }
  
  // Solo requerir verificación para usuarios que se registraron públicamente
  if (!req.usuario.email_verificado && req.usuario.rol === 'admin') {
    return res.status(403).json({
      error: 'Email no verificado',
      message: 'Debes verificar tu email antes de continuar',
      codigo: 'EMAIL_NOT_VERIFIED',
    });
  }
  
  next();
};

module.exports = {
  autenticar,
  verificarRol,
  verificarNivelRol,
  debeCambiarPassword,
  emailVerificado,
};
