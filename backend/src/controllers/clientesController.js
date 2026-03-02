const db = require('../config/database');

/**
 * Listar clientes (con paginación y filtros)
 */
const listarClientes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', eliminado = false } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Construir query
    let query = db('clientes')
      .select('clientes.*', 'creador.nombre as creado_por_nombre', 'creador.email as creado_por_email')
      .leftJoin('usuarios as creador', 'clientes.creado_por', 'creador.id')
      .where('clientes.eliminado', eliminado);
    
    // Aplicar filtros
    if (search) {
      query.where((builder) => {
        builder.where('clientes.nombre', 'like', `%${search}%`)
               .orWhere('clientes.email', 'like', `%${search}%`)
               .orWhere('clientes.empresa', 'like', `%${search}%`);
      });
    }
    
    // Solo mostrar clientes del admin que los creó (o todos para super_admin)
    if (req.usuario.rol === 'usuario') {
      query.where('clientes.creado_por', req.usuario.id);
    }

    // Obtener total (usando una query separada para evitar error de GROUP BY)
    const countQuery = db('clientes')
      .leftJoin('usuarios as creador', 'clientes.creado_por', 'creador.id')
      .where('clientes.eliminado', eliminado);
    
    // Aplicar filtros al count
    if (search) {
      countQuery.where((builder) => {
        builder.where('clientes.nombre', 'like', `%${search}%`)
               .orWhere('clientes.email', 'like', `%${search}%`)
               .orWhere('clientes.empresa', 'like', `%${search}%`);
      });
    }
    if (req.usuario.rol === 'usuario') {
      countQuery.where('clientes.creado_por', req.usuario.id);
    }
    
    const totalResult = await countQuery.count('* as total').first();
    const total = parseInt(totalResult.total);
    
    // Aplicar paginación
    const clientes = await query
      .limit(parseInt(limit))
      .offset(offset)
      .orderBy('clientes.fecha_creacion', 'desc');
    
    res.json({
      clientes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al listar clientes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener cliente por ID
 */
const obtenerCliente = async (req, res) => {
  const { id } = req.params;
  
  try {
    const cliente = await db('clientes')
      .select('clientes.*', 'creador.nombre as creado_por_nombre', 'creador.email as creado_por_email')
      .leftJoin('usuarios as creador', 'clientes.creado_por', 'creador.id')
      .where('clientes.id', id)
      .first();
    
    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
      });
    }
    
    // Verificar permisos (admin solo ve sus clientes)
    if (req.usuario.rol === 'usuario' && cliente.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para ver este cliente',
      });
    }
    
    res.json({ cliente });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Crear cliente
 */
const crearCliente = async (req, res) => {
  const { nombre, email, empresa, telefono, direccion } = req.body;
  
  try {
    // Validar campos requeridos
    if (!nombre) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'El nombre del cliente es requerido',
      });
    }
    
    // Crear cliente
    const [clienteId] = await db('clientes').insert({
      nombre: nombre.trim(),
      email: email ? email.trim() : null,
      empresa: empresa ? empresa.trim() : null,
      telefono: telefono ? telefono.trim() : null,
      direccion: direccion ? direccion.trim() : null,
      creado_por: req.usuario.id,
    });
    
    res.status(201).json({
      mensaje: 'Cliente creado exitosamente',
      cliente: {
        id: clienteId,
        nombre: nombre.trim(),
      },
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Actualizar cliente
 */
const actualizarCliente = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, empresa, telefono, direccion } = req.body;
  
  try {
    // Verificar que el cliente existe
    const clienteExistente = await db('clientes').where('id', id).first();
    if (!clienteExistente) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
      });
    }
    
    // Verificar permisos (admin solo edita sus clientes)
    if (req.usuario.rol === 'usuario' && clienteExistente.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para editar este cliente',
      });
    }
    
    // Preparar datos de actualización
    const datosActualizacion = {};
    if (nombre) datosActualizacion.nombre = nombre.trim();
    if (email !== undefined) datosActualizacion.email = email ? email.trim() : null;
    if (empresa !== undefined) datosActualizacion.empresa = empresa ? empresa.trim() : null;
    if (telefono !== undefined) datosActualizacion.telefono = telefono ? telefono.trim() : null;
    if (direccion !== undefined) datosActualizacion.direccion = direccion ? direccion.trim() : null;
    
    // Actualizar
    await db('clientes')
      .where('id', id)
      .update(datosActualizacion);
    
    res.json({
      mensaje: 'Cliente actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Eliminar cliente (soft delete)
 */
const eliminarCliente = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  
  try {
    // Verificar que el cliente existe
    const cliente = await db('clientes').where('id', id).first();
    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
      });
    }
    
    // Verificar permisos (admin solo elimina sus clientes)
    if (req.usuario.rol === 'usuario' && cliente.creado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permisos para eliminar este cliente',
      });
    }
    
    // Obtener configuración de días de retención
    const configEliminados = await db('configuracion_eliminados')
      .where('entidad', 'cliente')
      .first();
    
    const diasRetencion = configEliminados ? configEliminados.dias_retencion : 60;
    const fechaEliminacionPermanente = new Date();
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + diasRetencion);
    
    // Soft delete en transacción
    await db.transaction(async (trx) => {
      // Copiar datos a eliminados
      await trx('eliminados').insert({
        entidad: 'cliente',
        entidad_id: cliente.id,
        datos_originales: JSON.stringify(cliente),
        eliminado_por: req.usuario.id,
        fecha_eliminacion_permanente: fechaEliminacionPermanente,
        motivo: motivo || null,
      });
      
      // Marcar como eliminado
      await trx('clientes')
        .where('id', id)
        .update({
          eliminado: true,
          fecha_eliminacion: new Date(),
        });
    });
    
    res.json({
      mensaje: `Cliente eliminado. Se eliminará permanentemente el ${fechaEliminacionPermanente.toISOString().split('T')[0]}`,
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Recuperar cliente eliminado
 */
const recuperarCliente = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Buscar en eliminados
    const eliminado = await db('eliminados')
      .where('entidad', 'cliente')
      .where('entidad_id', id)
      .first();
    
    if (!eliminado) {
      return res.status(404).json({
        error: 'Registro de eliminación no encontrado',
      });
    }
    
    if (!eliminado.puede_recuperar) {
      return res.status(400).json({
        error: 'Este cliente no puede ser recuperado',
      });
    }
    
    // Verificar permisos
    if (req.usuario.rol === 'usuario' && eliminado.eliminado_por !== req.usuario.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No puedes recuperar este cliente',
      });
    }
    
    // Recuperar en transacción
    await db.transaction(async (trx) => {
      // Actualizar cliente
      await trx('clientes')
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
      mensaje: 'Cliente recuperado exitosamente',
    });
  } catch (error) {
    console.error('Error al recuperar cliente:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  recuperarCliente,
};
