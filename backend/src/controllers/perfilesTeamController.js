const db = require('../config/database');

/**
 * Listar perfiles del equipo
 */
const listarPerfiles = async (req, res) => {
  try {
    const { search = '', activo = '', creado_por = '', eliminado = 'false' } = req.query;

    let query = db('perfiles_team')
      .select('perfiles_team.*', 'usuarios.nombre as creador_nombre')
      .leftJoin('usuarios', 'perfiles_team.creado_por', 'usuarios.id');

    // Filtrar eliminados por defecto
    if (eliminado !== '') {
      query.where('perfiles_team.eliminado', eliminado === 'true');
    }

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

    // Verificar si cada perfil está en uso (contar usuarios únicos, no asignaciones)
    const perfilesConUso = await Promise.all(perfiles.map(async (perfil) => {
      const enUso = await db('team_projects')
        .where('perfil_team_id', perfil.id)
        .countDistinct('usuario_id as total')
        .first();

      const totalEnUso = parseInt(enUso.total);

      return {
        ...perfil,
        en_uso: totalEnUso > 0,
        total_en_uso: totalEnUso,
      };
    }));

    res.json({
      perfiles: perfilesConUso,
      total: perfilesConUso.length,
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

    // Validar desactivación de perfil en uso (contar usuarios únicos)
    if (activo === false && perfil.activo === true) {
      const enUso = await db('team_projects')
        .where('perfil_team_id', id)
        .countDistinct('usuario_id as total')
        .first();

      const totalEnUso = parseInt(enUso.total);

      if (totalEnUso > 0) {
        return res.status(400).json({
          error: 'Perfil en uso',
          message: `El perfil está siendo utilizado en ${totalEnUso} miembro(s) del equipo. Debes desvincularlo antes de desactivarlo.`,
        });
      }
    }

    // Verificar nombre duplicado (si se está actualizando el nombre)
    if (nombre !== undefined && nombre !== perfil.nombre) {
      const existing = await db('perfiles_team')
        .where('nombre', nombre)
        .where('creado_por', req.usuario.id)
        .where('id', '!=', id)
        .first();

      if (existing) {
        return res.status(409).json({
          error: 'Perfil duplicado',
          message: 'Ya existe un perfil con este nombre',
        });
      }
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
  const { id } = req.params;
  const { motivo } = req.body;

  try {
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

    // Verificar si está en uso (contar usuarios únicos)
    const enUso = await db('team_projects')
      .where('perfil_team_id', id)
      .countDistinct('usuario_id as total')
      .first();

    const totalEnUso = parseInt(enUso.total);

    if (totalEnUso > 0) {
      return res.status(400).json({
        error: 'Perfil en uso',
        message: `El perfil está siendo utilizado en ${totalEnUso} miembro(s) del equipo`,
      });
    }

    // Obtener configuración de días de retención
    const configEliminados = await db('configuracion_eliminados')
      .where('entidad', 'perfil_team')
      .first();

    const diasRetencion = configEliminados ? configEliminados.dias_retencion : 60;
    const fechaEliminacionPermanente = new Date();
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + diasRetencion);

    // Soft delete en transacción
    await db.transaction(async (trx) => {
      // Copiar datos a eliminados
      await trx('eliminados').insert({
        entidad: 'perfil_team',
        entidad_id: perfil.id,
        datos_originales: JSON.stringify(perfil),
        eliminado_por: req.usuario.id,
        fecha_eliminacion_permanente: fechaEliminacionPermanente,
        motivo: motivo || null,
      });

      // Marcar como eliminado
      await trx('perfiles_team')
        .where('id', id)
        .update({
          eliminado: true,
          fecha_eliminacion: new Date(),
        });
    });

    res.json({
      mensaje: 'Perfil movido a eliminados exitosamente',
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
