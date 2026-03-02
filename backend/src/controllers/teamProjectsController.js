const db = require('../config/database');

/**
 * Listar asignaciones de miembros a proyectos
 */
const listarAsignaciones = async (req, res) => {
  try {
    const { proyecto_id = '', usuario_id = '', activo = '' } = req.query;

    let query = db('team_projects')
      .select(
        'team_projects.*',
        'usuarios.nombre as usuario_nombre',
        'usuarios.email as usuario_email',
        'proyectos.nombre as proyecto_nombre',
        'perfiles_team.nombre as perfil_nombre'
      )
      .leftJoin('usuarios', 'team_projects.usuario_id', 'usuarios.id')
      .leftJoin('proyectos', 'team_projects.proyecto_id', 'proyectos.id')
      .leftJoin('perfiles_team', 'team_projects.perfil_team_id', 'perfiles_team.id');

    // Filtros
    if (proyecto_id) {
      query.where('team_projects.proyecto_id', proyecto_id);
    }

    if (usuario_id) {
      query.where('team_projects.usuario_id', usuario_id);
    }

    if (activo !== '') {
      query.where('team_projects.activo', activo === 'true');
    }

    // Solo mostrar proyectos del admin que los creó (o todos para super_admin)
    if (req.usuario.rol === 'admin') {
      query.whereIn('team_projects.proyecto_id', function() {
        this.select('id').from('proyectos').where('creado_por', req.usuario.id);
      });
    }

    const asignaciones = await query.orderBy('team_projects.fecha_asignacion', 'desc');

    res.json({
      asignaciones,
      total: asignaciones.length,
    });
  } catch (error) {
    console.error('Error al listar asignaciones:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener asignación por ID (usuario + proyecto)
 */
const obtenerAsignacion = async (req, res) => {
  try {
    const { usuario_id, proyecto_id } = req.params;

    const asignacion = await db('team_projects')
      .select(
        'team_projects.*',
        'usuarios.nombre as usuario_nombre',
        'usuarios.email as usuario_email',
        'proyectos.nombre as proyecto_nombre',
        'perfiles_team.nombre as perfil_nombre'
      )
      .leftJoin('usuarios', 'team_projects.usuario_id', 'usuarios.id')
      .leftJoin('proyectos', 'team_projects.proyecto_id', 'proyectos.id')
      .leftJoin('perfiles_team', 'team_projects.perfil_team_id', 'perfiles_team.id')
      .where('team_projects.usuario_id', usuario_id)
      .where('team_projects.proyecto_id', proyecto_id)
      .first();

    if (!asignacion) {
      return res.status(404).json({
        error: 'Asignación no encontrada',
      });
    }

    res.json({ asignacion });
  } catch (error) {
    console.error('Error al obtener asignación:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Asignar miembro a proyecto con perfil
 */
const asignarMiembro = async (req, res) => {
  try {
    const { usuario_id, proyecto_id, perfil_team_id } = req.body;

    // Validar campos requeridos
    if (!usuario_id || !proyecto_id) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'usuario_id y proyecto_id son requeridos',
      });
    }

    // Verificar que el usuario existe y es team_member
    const usuario = await db('usuarios')
      .join('roles', 'usuarios.rol_id', 'roles.id')
      .where('usuarios.id', usuario_id)
      .select('usuarios.*', 'roles.nombre as rol')
      .first();

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }

    if (usuario.rol !== 'team_member') {
      return res.status(400).json({
        error: 'Tipo de usuario inválido',
        message: 'Solo se pueden asignar miembros del equipo (rol: team_member)',
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
        message: 'No tienes permisos para asignar usuarios a este proyecto',
      });
    }

    // Verificar si ya está asignado
    const asignacionExistente = await db('team_projects')
      .where('usuario_id', usuario_id)
      .where('proyecto_id', proyecto_id)
      .first();

    if (asignacionExistente) {
      // Actualizar asignación existente
      await db('team_projects')
        .where('usuario_id', usuario_id)
        .where('proyecto_id', proyecto_id)
        .update({
          perfil_team_id,
          activo: true,
        });

      return res.json({
        mensaje: 'Asignación actualizada exitosamente',
      });
    }

    // Crear nueva asignación
    await db('team_projects').insert({
      usuario_id,
      proyecto_id,
      perfil_team_id,
      activo: true,
    });

    res.status(201).json({
      mensaje: 'Miembro asignado al proyecto exitosamente',
    });
  } catch (error) {
    console.error('Error al asignar miembro:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar asignación (cambiar perfil o estado)
 */
const actualizarAsignacion = async (req, res) => {
  try {
    const { usuario_id, proyecto_id } = req.params;
    const { perfil_team_id, activo } = req.body;

    // Verificar que la asignación existe
    const asignacion = await db('team_projects')
      .where('usuario_id', usuario_id)
      .where('proyecto_id', proyecto_id)
      .first();

    if (!asignacion) {
      return res.status(404).json({
        error: 'Asignación no encontrada',
      });
    }

    // Actualizar
    const updateData = {};
    if (perfil_team_id !== undefined) updateData.perfil_team_id = perfil_team_id;
    if (activo !== undefined) updateData.activo = activo;

    await db('team_projects')
      .where('usuario_id', usuario_id)
      .where('proyecto_id', proyecto_id)
      .update(updateData);

    const asignacionActualizada = await db('team_projects')
      .where('usuario_id', usuario_id)
      .where('proyecto_id', proyecto_id)
      .first();

    res.json({
      mensaje: 'Asignación actualizada exitosamente',
      asignacion: asignacionActualizada,
    });
  } catch (error) {
    console.error('Error al actualizar asignación:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Desasignar miembro de proyecto
 */
const desasignarMiembro = async (req, res) => {
  try {
    const { usuario_id, proyecto_id } = req.params;

    // Verificar que la asignación existe
    const asignacion = await db('team_projects')
      .where('usuario_id', usuario_id)
      .where('proyecto_id', proyecto_id)
      .first();

    if (!asignacion) {
      return res.status(404).json({
        error: 'Asignación no encontrada',
      });
    }

    // Eliminar asignación
    await db('team_projects')
      .where('usuario_id', usuario_id)
      .where('proyecto_id', proyecto_id)
      .del();

    res.json({
      mensaje: 'Miembro desasignado del proyecto exitosamente',
    });
  } catch (error) {
    console.error('Error al desasignar miembro:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener miembros asignados a un proyecto
 */
const obtenerMiembrosAsignados = async (req, res) => {
  try {
    const { id } = req.params; // ID del proyecto

    const miembros = await db('team_projects')
      .select(
        'team_projects.*',
        'usuarios.id as usuario_id',
        'usuarios.nombre as usuario_nombre',
        'usuarios.email as usuario_email',
        'perfiles_team.nombre as perfil_nombre',
        'perfiles_team.descripcion as perfil_descripcion'
      )
      .leftJoin('usuarios', 'team_projects.usuario_id', 'usuarios.id')
      .leftJoin('perfiles_team', 'team_projects.perfil_team_id', 'perfiles_team.id')
      .where('team_projects.proyecto_id', id)
      .where('team_projects.activo', true);

    res.json({
      usuarios_asignados: miembros,
      total: miembros.length,
    });
  } catch (error) {
    console.error('Error al obtener miembros asignados:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  listarAsignaciones,
  obtenerAsignacion,
  asignarMiembro,
  actualizarAsignacion,
  desasignarMiembro,
  obtenerMiembrosAsignados,
};
