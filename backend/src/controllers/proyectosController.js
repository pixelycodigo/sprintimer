const db = require('../config/database');

/**
 * Listar proyectos (con paginación y filtros)
 */
const listarProyectos = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      estado = '',
      cliente_id = '',
      eliminado = false 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Construir query base
    let query = db('proyectos')
      .select('proyectos.*', 
              'clientes.nombre as cliente_nombre',
              'creador.nombre as creado_por_nombre')
      .leftJoin('clientes', 'proyectos.cliente_id', 'clientes.id')
      .leftJoin('usuarios as creador', 'proyectos.creado_por', 'creador.id')
      .where('proyectos.eliminado', eliminado);
    
    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase();
      query.where((builder) => {
        builder.whereRaw('LOWER(proyectos.nombre) LIKE ?', [`%${searchLower}%`])
               .orWhereRaw('LOWER(proyectos.estado) LIKE ?', [`%${searchLower}%`])
               .orWhereRaw('LOWER(clientes.nombre) LIKE ?', [`%${searchLower}%`]);
      });
    }
    
    if (estado) {
      query.where('proyectos.estado', estado);
    }
    
    if (cliente_id) {
      query.where('proyectos.cliente_id', cliente_id);
    }
    
    // Solo mostrar proyectos del admin que los creó (o todos para super_admin)
    if (req.usuario.rol === 'admin') {
      query.where('proyectos.creado_por', req.usuario.id);
    }

    // Obtener total (usando una query separada para evitar error de GROUP BY)
    const countQuery = db('proyectos')
      .leftJoin('clientes', 'proyectos.cliente_id', 'clientes.id')
      .leftJoin('usuarios as creador', 'proyectos.creado_por', 'creador.id')
      .where('proyectos.eliminado', eliminado);
    
    // Aplicar filtros al count
    if (search) {
      const searchLower = search.toLowerCase();
      countQuery.where((builder) => {
        builder.whereRaw('LOWER(proyectos.nombre) LIKE ?', [`%${searchLower}%`])
               .orWhereRaw('LOWER(proyectos.estado) LIKE ?', [`%${searchLower}%`])
               .orWhereRaw('LOWER(clientes.nombre) LIKE ?', [`%${searchLower}%`]);
      });
    }
    if (estado) {
      countQuery.where('proyectos.estado', estado);
    }
    if (cliente_id) {
      countQuery.where('proyectos.cliente_id', cliente_id);
    }
    if (req.usuario.rol === 'admin') {
      countQuery.where('proyectos.creado_por', req.usuario.id);
    }
    
    const totalResult = await countQuery.count('* as total').first();
    const total = parseInt(totalResult.total);
    
    // Aplicar paginación
    const proyectos = await query
      .limit(parseInt(limit))
      .offset(offset)
      .orderBy('proyectos.fecha_creacion', 'desc');
    
    res.json({
      proyectos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al listar proyectos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener proyecto por ID
 */
const obtenerProyecto = async (req, res) => {
  const { id } = req.params;
  
  try {
    const proyecto = await db('proyectos')
      .select('proyectos.*', 
              'clientes.nombre as cliente_nombre',
              'clientes.email as cliente_email',
              'creador.nombre as creado_por_nombre')
      .leftJoin('clientes', 'proyectos.cliente_id', 'clientes.id')
      .leftJoin('usuarios as creador', 'proyectos.creado_por', 'creador.id')
      .where('proyectos.id', id)
      .first();
    
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    // Verificar permisos (admin solo ve sus proyectos)
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para ver este proyecto',
      });
    }
    
    res.json({ proyecto });
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Crear proyecto
 */
const crearProyecto = async (req, res) => {
  const { 
    nombre, 
    descripcion, 
    cliente_id, 
    sprint_duracion = 2,
    formato_horas_default = 'standard',
    dia_corte = 25,
    moneda_id 
  } = req.body;
  
  try {
    // Validar campos requeridos
    if (!nombre || !cliente_id) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Nombre y cliente son requeridos',
      });
    }
    
    // Verificar que el cliente existe
    const cliente = await db('clientes').where('id', cliente_id).first();
    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
      });
    }
    
    // Verificar permisos (admin solo usa sus clientes)
    if (req.usuario.rol === 'admin' && cliente.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No puedes usar este cliente',
      });
    }
    
    // Crear proyecto
    const [proyectoId] = await db('proyectos').insert({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : null,
      cliente_id,
      sprint_duracion,
      formato_horas_default,
      dia_corte,
      moneda_id: moneda_id || 1, // PEN por defecto
      estado: 'activo',
      creado_por: req.usuario.id,
    });
    
    res.status(201).json({
      mensaje: 'Proyecto creado exitosamente',
      proyecto: {
        id: proyectoId,
        nombre: nombre.trim(),
      },
    });
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar proyecto
 */
const actualizarProyecto = async (req, res) => {
  const { id } = req.params;
  const { 
    nombre, 
    descripcion, 
    cliente_id, 
    sprint_duracion,
    formato_horas_default,
    dia_corte,
    moneda_id,
    estado 
  } = req.body;
  
  try {
    // Verificar que el proyecto existe
    const proyectoExistente = await db('proyectos').where('id', id).first();
    if (!proyectoExistente) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    // Verificar permisos (admin solo edita sus proyectos)
    if (req.usuario.rol === 'admin' && proyectoExistente.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para editar este proyecto',
      });
    }
    
    // Verificar cliente si se está cambiando
    if (cliente_id && cliente_id !== proyectoExistente.cliente_id) {
      const cliente = await db('clientes').where('id', cliente_id).first();
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      
      if (req.usuario.rol === 'admin' && cliente.creado_por !== req.usuario.id) {
        return res.status(403).json({
          error: 'No autorizado',
          message: 'No puedes usar este cliente',
        });
      }
    }
    
    // Preparar datos de actualización
    const datosActualizacion = {};
    if (nombre) datosActualizacion.nombre = nombre.trim();
    if (descripcion !== undefined) datosActualizacion.descripcion = descripcion ? descripcion.trim() : null;
    if (cliente_id) datosActualizacion.cliente_id = cliente_id;
    if (sprint_duracion !== undefined) datosActualizacion.sprint_duracion = sprint_duracion;
    if (formato_horas_default !== undefined) datosActualizacion.formato_horas_default = formato_horas_default;
    if (dia_corte !== undefined) datosActualizacion.dia_corte = dia_corte;
    if (moneda_id !== undefined) datosActualizacion.moneda_id = moneda_id;
    if (estado !== undefined) datosActualizacion.estado = estado;
    
    // Actualizar
    await db('proyectos')
      .where('id', id)
      .update(datosActualizacion);
    
    res.json({
      mensaje: 'Proyecto actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar proyecto (soft delete)
 */
const eliminarProyecto = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  
  try {
    // Verificar que el proyecto existe
    const proyecto = await db('proyectos').where('id', id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }
    
    // Verificar permisos (admin solo elimina sus proyectos)
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para eliminar este proyecto',
      });
    }
    
    // Obtener configuración de días de retención
    const configEliminados = await db('configuracion_eliminados')
      .where('entidad', 'proyecto')
      .first();
    
    const diasRetencion = configEliminados ? configEliminados.dias_retencion : 90;
    const fechaEliminacionPermanente = new Date();
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + diasRetencion);
    
    // Soft delete en transacción
    await db.transaction(async (trx) => {
      // Copiar datos a eliminados
      await trx('eliminados').insert({
        entidad: 'proyecto',
        entidad_id: proyecto.id,
        datos_originales: JSON.stringify(proyecto),
        eliminado_por: req.usuario.id,
        fecha_eliminacion_permanente: fechaEliminacionPermanente,
        motivo: motivo || null,
      });
      
      // Marcar como eliminado
      await trx('proyectos')
        .where('id', id)
        .update({
          eliminado: true,
          fecha_eliminacion: new Date(),
          estado: 'pausado',
        });
    });
    
    res.json({
      mensaje: `Proyecto eliminado. Se eliminará permanentemente el ${fechaEliminacionPermanente.toISOString().split('T')[0]}`,
    });
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Recuperar proyecto eliminado
 */
const recuperarProyecto = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Buscar en eliminados
    const eliminado = await db('eliminados')
      .where('entidad', 'proyecto')
      .where('entidad_id', id)
      .first();
    
    if (!eliminado) {
      return res.status(404).json({
        error: 'Registro de eliminación no encontrado',
      });
    }
    
    if (!eliminado.puede_recuperar) {
      return res.status(400).json({
        error: 'Este proyecto no puede ser recuperado',
      });
    }
    
    // Verificar permisos
    if (req.usuario.rol === 'admin' && eliminado.eliminado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No puedes recuperar este proyecto',
      });
    }
    
    // Recuperar en transacción
    await db.transaction(async (trx) => {
      // Actualizar proyecto
      await trx('proyectos')
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
      mensaje: 'Proyecto recuperado exitosamente',
    });
  } catch (error) {
    console.error('Error al recuperar proyecto:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Asignar usuario a proyecto
 */
const asignarUsuarioAProyecto = async (req, res) => {
  const { id } = req.params; // ID del proyecto
  const { usuario_id, perfil_en_proyecto = 'miembro' } = req.body;

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

    // Verificar que el usuario existe
    const usuario = await db('usuarios').where('id', usuario_id).first();
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }

    // Verificar permisos
    if (req.usuario.rol === 'admin' && proyecto.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para asignar usuarios a este proyecto',
      });
    }

    // Verificar si ya está asignado
    const asignacionExistente = await db('usuarios_proyectos')
      .where('usuario_id', usuario_id)
      .where('proyecto_id', id)
      .first();

    if (asignacionExistente) {
      // Actualizar asignación existente
      await db('usuarios_proyectos')
        .where('usuario_id', usuario_id)
        .where('proyecto_id', id)
        .update({
          perfil_en_proyecto,
          activo: true,
        });

      return res.json({
        mensaje: 'Asignación de usuario actualizada',
      });
    }

    // Crear nueva asignación
    await db('usuarios_proyectos').insert({
      usuario_id,
      proyecto_id: id,
      perfil_en_proyecto,
    });

    res.status(201).json({
      mensaje: 'Usuario asignado al proyecto exitosamente',
    });
  } catch (error) {
    console.error('Error al asignar usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Desasignar usuario de proyecto
 */
const desasignarUsuarioDeProyecto = async (req, res) => {
  const { id } = req.params; // ID del proyecto
  const { usuario_id } = req.params; // ID del usuario (en la URL)
  
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
        message: 'No tienes permisos para desasignar usuarios de este proyecto',
      });
    }
    
    // Eliminar asignación
    await db('usuarios_proyectos')
      .where('usuario_id', usuario_id)
      .where('proyecto_id', id)
      .del();
    
    res.json({
      mensaje: 'Usuario desasignado del proyecto exitosamente',
    });
  } catch (error) {
    console.error('Error al desasignar usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener usuarios asignados a un proyecto
 */
const obtenerUsuariosAsignados = async (req, res) => {
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
        message: 'No tienes permisos para ver los usuarios de este proyecto',
      });
    }

    // Obtener usuarios asignados (usando team_projects)
    const usuarios = await db('team_projects')
      .select('team_projects.*',
              'usuarios.nombre',
              'usuarios.email',
              'roles.nombre as rol')
      .leftJoin('usuarios', 'team_projects.usuario_id', 'usuarios.id')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .where('team_projects.proyecto_id', id)
      .where('team_projects.activo', true);

    res.json({
      usuarios,
      total: usuarios.length,
    });
  } catch (error) {
    console.error('Error al obtener usuarios asignados:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar perfil de usuario en proyecto
 */
const actualizarPerfilUsuario = async (req, res) => {
  const { id } = req.params; // ID del proyecto
  const { usuario_id } = req.params;
  const { activo, perfil_en_proyecto } = req.body;

  try {
    // Verificar que el proyecto existe
    const proyecto = await db('proyectos').where('id', id).first();
    if (!proyecto) {
      return res.status(404).json({
        error: 'Proyecto no encontrado',
      });
    }

    // Actualizar asignación
    const updateData = {};
    if (activo !== undefined) updateData.activo = activo;
    if (perfil_en_proyecto !== undefined) updateData.perfil_en_proyecto = perfil_en_proyecto;

    await db('usuarios_proyectos')
      .where('usuario_id', usuario_id)
      .where('proyecto_id', id)
      .update(updateData);

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

module.exports = {
  listarProyectos,
  obtenerProyecto,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto,
  recuperarProyecto,
  asignarUsuarioAProyecto,
  desasignarUsuarioDeProyecto,
  obtenerUsuariosAsignados,
  actualizarPerfilUsuario,
};
