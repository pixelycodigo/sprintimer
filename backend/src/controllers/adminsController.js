const db = require('../config/database');
const { hashPassword, validatePasswordStrength } = require('../utils/hashPassword');
const { enviarEmailBienvenida } = require('../services/emailService');

/**
 * Listar administradores
 */
const listarAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', activo = '' } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Obtener rol de admin
    const adminRole = await db('roles').where('nombre', 'admin').first();
    
    // Construir query
    let query = db('usuarios')
      .select('usuarios.*', 'roles.nombre as rol', 'roles.nivel as rol_nivel',
              'creador.nombre as creado_por_nombre', 'creador.email as creado_por_email')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .leftJoin('usuarios as creador', 'usuarios.creado_por', 'creador.id')
      .where('usuarios.rol_id', adminRole.id)
      .where('usuarios.eliminado', false);
    
    // Aplicar filtros
    if (search) {
      query.where((builder) => {
        builder.where('usuarios.nombre', 'like', `%${search}%`)
               .orWhere('usuarios.email', 'like', `%${search}%`);
      });
    }
    
    if (activo !== '') {
      query.where('usuarios.activo', activo === 'true');
    }
    
    // Obtener total
    const totalResult = await query.clone().count('* as total').first();
    const total = parseInt(totalResult.total);
    
    // Aplicar paginación
    const admins = await query
      .limit(parseInt(limit))
      .offset(offset)
      .orderBy('usuarios.fecha_creacion', 'desc');
    
    res.json({
      admins,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al listar administradores:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Crear administrador
 */
const crearAdmin = async (req, res) => {
  const { 
    nombre, 
    email, 
    password, 
    es_temporal = true 
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
    
    // Obtener rol de admin
    const adminRole = await db('roles').where('nombre', 'admin').first();
    if (!adminRole) {
      return res.status(500).json({
        error: 'Error de configuración',
        message: 'Rol de administrador no encontrado',
      });
    }
    
    // Hashear contraseña
    const passwordHash = await hashPassword(password);
    
    // Crear administrador
    const [adminId] = await db('usuarios').insert({
      nombre: nombre.trim(),
      email: email.trim(),
      password_hash: passwordHash,
      rol_id: adminRole.id,
      debe_cambiar_password: es_temporal,
      activo: true,
      email_verificado: true,
      creado_por: req.usuario.id,
    });
    
    // Enviar email de bienvenida
    await enviarEmailBienvenida(
      email.trim(), 
      nombre.trim(), 
      { email: email.trim(), password }, 
      es_temporal
    );
    
    res.status(201).json({
      mensaje: `Administrador ${es_temporal ? 'creado con contraseña temporal' : 'creado exitosamente'}`,
      admin: {
        id: adminId,
        nombre: nombre.trim(),
        email: email.trim(),
      },
    });
  } catch (error) {
    console.error('Error al crear administrador:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener administrador por ID
 */
const obtenerAdmin = async (req, res) => {
  const { id } = req.params;
  
  try {
    const adminRole = await db('roles').where('nombre', 'admin').first();
    
    const admin = await db('usuarios')
      .select('usuarios.*', 'roles.nombre as rol', 'roles.nivel as rol_nivel',
              'creador.nombre as creado_por_nombre', 'creador.email as creado_por_email')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .leftJoin('usuarios as creador', 'usuarios.creado_por', 'creador.id')
      .where('usuarios.id', id)
      .where('usuarios.rol_id', adminRole.id)
      .first();
    
    if (!admin) {
      return res.status(404).json({
        error: 'Administrador no encontrado',
      });
    }
    
    res.json({ admin });
  } catch (error) {
    console.error('Error al obtener administrador:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar administrador
 */
const actualizarAdmin = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, activo } = req.body;
  
  try {
    // Verificar que el admin existe
    const adminRole = await db('roles').where('nombre', 'admin').first();
    const adminExistente = await db('usuarios')
      .where('id', id)
      .where('rol_id', adminRole.id)
      .first();
    
    if (!adminExistente) {
      return res.status(404).json({
        error: 'Administrador no encontrado',
      });
    }
    
    // Verificar email duplicado
    if (email && email !== adminExistente.email) {
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
    
    // Actualizar
    await db('usuarios')
      .where('id', id)
      .update(datosActualizacion);
    
    res.json({
      mensaje: 'Administrador actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar administrador:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar administrador (soft delete)
 */
const eliminarAdmin = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  
  try {
    // Verificar que el admin existe
    const adminRole = await db('roles').where('nombre', 'admin').first();
    const admin = await db('usuarios')
      .where('id', id)
      .where('rol_id', adminRole.id)
      .first();
    
    if (!admin) {
      return res.status(404).json({
        error: 'Administrador no encontrado',
      });
    }
    
    // No se puede eliminar a sí mismo
    if (admin.id === req.usuario.id) {
      return res.status(400).json({
        error: 'No puedes eliminarte a ti mismo',
      });
    }
    
    // Obtener configuración de días de retención
    const configEliminados = await db('configuracion_eliminados')
      .where('entidad', 'admin')
      .first();
    
    const diasRetencion = configEliminados ? configEliminados.dias_retencion : 30;
    const fechaEliminacionPermanente = new Date();
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + diasRetencion);
    
    // Soft delete en transacción
    await db.transaction(async (trx) => {
      // Copiar datos a eliminados
      await trx('eliminados').insert({
        entidad: 'admin',
        entidad_id: admin.id,
        datos_originales: JSON.stringify(admin),
        eliminado_por: req.usuario.id,
        fecha_eliminacion_permanente: fechaEliminacionPermanente,
        motivo: motivo || null,
        requiere_aprobacion: true,
      });
      
      // Marcar como eliminado
      await trx('usuario')
        .where('id', id)
        .update({
          eliminado: true,
          fecha_eliminacion: new Date(),
          activo: false,
        });
    });
    
    res.json({
      mensaje: `Administrador eliminado. Se eliminará permanentemente el ${fechaEliminacionPermanente.toISOString().split('T')[0]}`,
    });
  } catch (error) {
    console.error('Error al eliminar administrador:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Recuperar administrador eliminado
 */
const recuperarAdmin = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Buscar en eliminados
    const eliminado = await db('eliminados')
      .where('entidad', 'admin')
      .where('entidad_id', id)
      .first();
    
    if (!eliminado) {
      return res.status(404).json({
        error: 'Registro de eliminación no encontrado',
      });
    }
    
    if (!eliminado.puede_recuperar) {
      return res.status(400).json({
        error: 'Este administrador no puede ser recuperado',
      });
    }
    
    // Recuperar en transacción
    await db.transaction(async (trx) => {
      // Actualizar admin
      await trx('usuario')
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
      mensaje: 'Administrador recuperado exitosamente',
    });
  } catch (error) {
    console.error('Error al recuperar administrador:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  listarAdmins,
  obtenerAdmin,
  crearAdmin,
  actualizarAdmin,
  eliminarAdmin,
  recuperarAdmin,
};
