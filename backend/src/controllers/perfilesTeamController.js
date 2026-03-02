const db = require('../config/database');

/**
 * Listar perfiles del equipo
 */
const listarPerfiles = async (req, res) => {
  try {
    const { search = '', activo = '', creado_por = '' } = req.query;

    let query = db('perfiles_team')
      .select('perfiles_team.*', 'usuarios.nombre as creador_nombre')
      .leftJoin('usuarios', 'perfiles_team.creado_por', 'usuarios.id');

    // Filtros
    if (search) {
      const searchLower = search.toLowerCase();
      query.where((builder) => {
        builder.whereRaw('LOWER(perfiles_team.nombre) LIKE ?', [`%${searchLower}%`]);
      });
    }

    if (activo !== '') {
      query.where('perfiles_team.activo', activo === 'true');
    }

    if (creado_por) {
      query.where('perfiles_team.creado_por', creado_por);
    }

    // Solo mostrar perfiles del admin que los creó (o todos para super_admin)
    if (req.usuario.rol === 'admin') {
      query.where('perfiles_team.creado_por', req.usuario.id);
    }

    const perfiles = await query.orderBy('perfiles_team.nombre', 'asc');

    res.json({
      perfiles,
      total: perfiles.length,
    });
  } catch (error) {
    console.error('Error al listar perfiles:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener perfil por ID
 */
const obtenerPerfil = async (req, res) => {
  try {
    const { id } = req.params;

    const perfil = await db('perfiles_team')
      .select('perfiles_team.*', 'usuarios.nombre as creador_nombre')
      .leftJoin('usuarios', 'perfiles_team.creado_por', 'usuarios.id')
      .where('perfiles_team.id', id)
      .first();

    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil no encontrado',
      });
    }

    // Verificar permisos
    if (req.usuario.rol === 'admin' && perfil.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para ver este perfil',
      });
    }

    res.json({ perfil });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Crear perfil
 */
const crearPerfil = async (req, res) => {
  try {
    const { nombre, descripcion, activo = true } = req.body;

    // Validar campos requeridos
    if (!nombre) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'El nombre del perfil es requerido',
      });
    }

    // Verificar si ya existe un perfil con el mismo nombre para este admin
    const existing = await db('perfiles_team')
      .where('nombre', nombre)
      .where('creado_por', req.usuario.id)
      .first();

    if (existing) {
      return res.status(409).json({
        error: 'Perfil duplicado',
        message: 'Ya existe un perfil con este nombre',
      });
    }

    // Crear perfil
    const [perfilId] = await db('perfiles_team').insert({
      nombre,
      descripcion,
      activo,
      creado_por: req.usuario.id,
    });

    const perfil = await db('perfiles_team').where('id', perfilId).first();

    res.status(201).json({
      mensaje: 'Perfil creado exitosamente',
      perfil,
    });
  } catch (error) {
    console.error('Error al crear perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar perfil
 */
const actualizarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    // Verificar que el perfil existe
    const perfil = await db('perfiles_team').where('id', id).first();
    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil no encontrado',
      });
    }

    // Verificar permisos
    if (req.usuario.rol === 'admin' && perfil.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para editar este perfil',
      });
    }

    // Actualizar
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (activo !== undefined) updateData.activo = activo;

    await db('perfiles_team').where('id', id).update(updateData);

    const perfilActualizado = await db('perfiles_team').where('id', id).first();

    res.json({
      mensaje: 'Perfil actualizado exitosamente',
      perfil: perfilActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar perfil (soft delete)
 */
const eliminarPerfil = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el perfil existe
    const perfil = await db('perfiles_team').where('id', id).first();
    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil no encontrado',
      });
    }

    // Verificar permisos
    if (req.usuario.rol === 'admin' && perfil.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para eliminar este perfil',
      });
    }

    // Eliminar (soft delete - desactivar)
    await db('perfiles_team').where('id', id).update({ activo: false });

    res.json({
      mensaje: 'Perfil eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  listarPerfiles,
  obtenerPerfil,
  crearPerfil,
  actualizarPerfil,
  eliminarPerfil,
};
