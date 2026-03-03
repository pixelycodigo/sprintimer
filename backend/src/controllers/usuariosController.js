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
      perfil = '',
      activo = '',
      eliminado = false
    } = req.query;

    // Si es superadmin y NO viene de /all, forzar rol 'team_member' (miembros del equipo)
    let rolFiltro = rol;
    if (req.usuario.rol === 'super_admin' && !req.path.includes('/all')) {
      rolFiltro = 'team_member';
    }

    console.log('Listar usuarios params:', { page, limit, search, rol, rolFiltro, perfil, activo, eliminado, path: req.path });

    const offset = (page - 1) * limit;

    // Construir query base
    let query = db('usuarios')
      .select('usuarios.*', 'roles.nombre as rol', 'roles.nivel as rol_nivel',
              'creador.nombre as creado_por_nombre', 'creador.email as creado_por_email',
              'seniorities.nombre as seniority_nombre', 'seniorities.color as seniority_color',
              'costos.costo_hora', 'monedas.codigo as moneda_codigo')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .leftJoin('usuarios as creador', 'usuarios.creado_por', 'creador.id')
      .leftJoin('seniorities', 'usuarios.seniority_id', 'seniorities.id')
      .leftJoin('costos_por_hora as costos', function() {
        this.on('costos.usuario_id', 'usuarios.id')
            .andOn('costos.eliminado', '=', 0);
      })
      .leftJoin('monedas', 'costos.moneda_id', 'monedas.id')
      .where('usuarios.eliminado', eliminado);

    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase();
      query.where((builder) => {
        builder.whereRaw('LOWER(usuarios.nombre) LIKE ?', [`%${searchLower}%`])
               .orWhereRaw('LOWER(usuarios.email) LIKE ?', [`%${searchLower}%`])
               .orWhereRaw('LOWER(usuarios.perfil_en_proyecto) LIKE ?', [`%${searchLower}%`])
               .orWhereRaw('LOWER(roles.nombre) LIKE ?', [`%${searchLower}%`]);
      });
    }

    if (rolFiltro) {
      query.where('roles.nombre', rolFiltro);
    }

    if (perfil) {
      query.where('usuarios.perfil_en_proyecto', perfil);
    }

    if (activo !== '') {
      query.where('usuarios.activo', activo === 'true');
    }

    // Filtro por seniority
    if (req.query.seniority) {
      query.where('seniorities.nombre', req.query.seniority);
    }

    // Obtener total (usando una query separada para evitar error de GROUP BY)
    const countQuery = db('usuarios')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .where('usuarios.eliminado', eliminado);

    // Aplicar filtros al count
    if (search) {
      const searchLower = search.toLowerCase();
      countQuery.where((builder) => {
        builder.whereRaw('LOWER(usuarios.nombre) LIKE ?', [`%${searchLower}%`])
               .orWhereRaw('LOWER(usuarios.email) LIKE ?', [`%${searchLower}%`])
               .orWhereRaw('LOWER(usuarios.perfil_en_proyecto) LIKE ?', [`%${searchLower}%`])
               .orWhereRaw('LOWER(roles.nombre) LIKE ?', [`%${searchLower}%`]);
      });
    }
    if (rolFiltro) {
      countQuery.where('roles.nombre', rolFiltro);
    }
    if (perfil) {
      countQuery.where('usuarios.perfil_en_proyecto', perfil);
    }
    if (activo !== '') {
      countQuery.where('usuarios.activo', activo === 'true');
    }

    const totalResult = await countQuery.count('* as total').first();
    const total = parseInt(totalResult.total);

    // Aplicar paginación
    const usuarios = await query
      .limit(parseInt(limit))
      .offset(offset)
      .orderBy('usuarios.fecha_creacion', 'desc');

    // Obtener perfiles asignados desde team_projects para cada usuario
    const usuariosConPerfil = await Promise.all(usuarios.map(async (usuario) => {
      // Obtener perfil asignado
      const asignacion = await db('team_projects')
        .select('perfiles_team.nombre as perfil_nombre')
        .leftJoin('perfiles_team', 'team_projects.perfil_team_id', 'perfiles_team.id')
        .where('team_projects.usuario_id', usuario.id)
        .where('team_projects.activo', true)
        .first();

      // Obtener proyectos asignados
      const proyectos = await db('team_projects')
        .select('proyectos.id', 'proyectos.nombre as proyecto_nombre')
        .leftJoin('proyectos', 'team_projects.proyecto_id', 'proyectos.id')
        .where('team_projects.usuario_id', usuario.id)
        .where('team_projects.activo', true)
        .where('proyectos.eliminado', false);

      // Obtener actividades asignadas (a través de tareas)
      const actividades = await db('tareas')
        .select('actividades.id', 'actividades.nombre as actividad_nombre')
        .distinct('actividades.id', 'actividades.nombre')
        .innerJoin('actividades', 'tareas.actividad_id', 'actividades.id')
        .where('tareas.usuario_id', usuario.id)
        .where('actividades.eliminado', false)
        .where('actividades.activo', true);

      return {
        ...usuario,
        perfil_en_proyecto: asignacion?.perfil_nombre || usuario.perfil_en_proyecto,
        seniority_id: usuario.seniority_id,
        seniority_nombre: usuario.seniority_nombre,
        seniority_color: usuario.seniority_color,
        costo_hora: usuario.costo_hora,
        moneda_codigo: usuario.moneda_codigo,
        proyectos: proyectos || [],
        actividades: actividades || [],
      };
    }));

    res.json({
      usuarios: usuariosConPerfil,
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
    // Obtener usuario con rol
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

    // Obtener perfil asignado desde team_projects (primer proyecto activo)
    const asignacion = await db('team_projects')
      .select('perfiles_team.nombre as perfil_en_proyecto')
      .leftJoin('perfiles_team', 'team_projects.perfil_team_id', 'perfiles_team.id')
      .where('team_projects.usuario_id', id)
      .where('team_projects.activo', true)
      .first();

    // Si tiene asignación, usar ese perfil, si no, mantener el que venga de la BD
    const usuarioConPerfil = {
      ...usuario,
      perfil_en_proyecto: asignacion?.perfil_en_proyecto || usuario.perfil_en_proyecto,
    };

    res.json({ usuario: usuarioConPerfil });
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
    debe_cambiar_password = true,
    seniority_id,
    costo_por_hora_id,
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

    // Crear usuario y asignaciones en transacción
    const [usuarioId] = await db.transaction(async (trx) => {
      // Crear usuario
      const [id] = await trx('usuarios').insert({
        nombre: nombre.trim(),
        email: email.trim(),
        password_hash: passwordHash,
        rol_id,
        debe_cambiar_password: es_temporal ? true : debe_cambiar_password,
        activo: true,
        email_verificado: true,
        creado_por: creador.id,
        seniority_id: seniority_id || null,
      });

      // Si se proporcionó costo_por_hora_id y seniority_id, crear costo para el usuario
      if (costo_por_hora_id && seniority_id) {
        // Obtener el costo base
        const costoBase = await trx('costos_por_hora').where('id', costo_por_hora_id).first();
        if (costoBase) {
          // Crear costo para el usuario
          await trx('costos_por_hora').insert({
            usuario_id: id,
            tipo: costoBase.tipo,
            costo_hora: costoBase.costo_hora,
            costo_min: costoBase.costo_min,
            costo_max: costoBase.costo_max,
            moneda_id: costoBase.moneda_id,
            seniority_id: seniority_id,
            creado_por: creador.id,
          });
        }
      }

      return id;
    });

    // Obtener usuario creado para respuesta
    const usuario = await db('usuarios')
      .select('usuarios.*', 'roles.nombre as rol')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .where('usuarios.id', usuarioId)
      .first();

    res.status(201).json({
      mensaje: `Usuario ${es_temporal ? 'creado con contraseña temporal' : 'creado exitosamente'}`,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message || 'Error al crear usuario',
    });
  }
};

/**
 * Actualizar usuario
 */
const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, activo, seniority_id, costo_por_hora_id, costo_hora_personalizado, perfil_team_id } = req.body;

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
    
    // Actualizar seniority si se proporcionó
    if (seniority_id !== undefined) {
      if (seniority_id) {
        // Verificar que el seniority existe
        const seniority = await db('seniorities').where('id', seniority_id).first();
        if (!seniority) {
          return res.status(404).json({
            error: 'Seniority no encontrado',
          });
        }
      }
      datosActualizacion.seniority_id = seniority_id || null;
    }

    // Actualizar usuario
    await db('usuarios')
      .where('id', id)
      .update(datosActualizacion);

    // Actualizar costo por hora si se proporcionó
    if (costo_por_hora_id !== undefined) {
      // Eliminar costos anteriores del usuario
      await db('costos_por_hora')
        .where('usuario_id', id)
        .del();

      // Si se seleccionó un costo, crearlo
      if (costo_por_hora_id) {
        const costoBase = await db('costos_por_hora').where('id', costo_por_hora_id).first();
        if (costoBase) {
          // Obtener el costo personalizado si es variable
          const costoFinal = costoBase.tipo === 'variable' && costo_hora_personalizado
            ? parseFloat(costo_hora_personalizado)
            : null;
          
          await db('costos_por_hora').insert({
            usuario_id: id,
            tipo: costoBase.tipo,
            costo_hora: costoBase.tipo === 'fijo' ? costoBase.costo_hora : costoFinal,
            costo_min: costoBase.tipo === 'variable' ? costoBase.costo_min : null,
            costo_max: costoBase.tipo === 'variable' ? costoBase.costo_max : null,
            moneda_id: costoBase.moneda_id,
            seniority_id: seniority_id || null,
            creado_por: creador.id,
          });
        }
      }
    }

    // Obtener usuario actualizado para retornar
    const usuarioActualizado = await db('usuarios')
      .select('usuarios.*', 'roles.nombre as rol', 'seniorities.nombre as seniority_nombre')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .leftJoin('seniorities', 'usuarios.seniority_id', 'seniorities.id')
      .where('usuarios.id', id)
      .first();

    res.json({
      mensaje: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message,
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
      await trx('usuario')
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
