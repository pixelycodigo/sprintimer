const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const { autenticar, verificarRol } = require('../middleware/auth');
const db = require('../config/database');

/**
 * @route   GET /api/admin/roles
 * @desc    Listar roles del sistema
 * @access  Privado (Admin, Super Admin)
 */
router.get('/roles',
  autenticar,
  verificarRol(['usuario', 'super_admin']),
  async (req, res) => {
    try {
      const roles = await db('roles')
        .select('roles.*', db.raw('COUNT(usuarios.id) as total_usuarios'))
        .leftJoin('usuario', 'usuarios.rol_id', 'roles.id')
        .groupBy('roles.id')
        .orderBy('roles.nivel', 'asc');

      res.json({ roles });
    } catch (error) {
      console.error('Error al listar roles:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
      });
    }
  }
);

/**
 * @route   POST /api/admin/roles
 * @desc    Crear nuevo rol
 * @access  Privado (Super Admin)
 */
router.post('/roles',
  autenticar,
  verificarRol(['super_admin']),
  async (req, res) => {
    try {
      const { nombre, descripcion, nivel } = req.body;

      // Verificar si el rol ya existe
      const existing = await db('roles').where('nombre', nombre).first();
      if (existing) {
        return res.status(409).json({
          error: 'Rol duplicado',
          message: 'Este rol ya existe',
        });
      }

      const [rolId] = await db('roles').insert({
        nombre,
        descripcion: descripcion || null,
        nivel: parseInt(nivel),
      });

      res.status(201).json({
        mensaje: 'Rol creado exitosamente',
        rol: { id: rolId, nombre, descripcion, nivel },
      });
    } catch (error) {
      console.error('Error al crear rol:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
      });
    }
  }
);

/**
 * @route   PUT /api/admin/roles/:id
 * @desc    Actualizar rol
 * @access  Privado (Super Admin)
 */
router.put('/roles/:id',
  autenticar,
  verificarRol(['super_admin']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { descripcion } = req.body;

      // No permitir editar roles base
      const rol = await db('roles').where('id', id).first();
      if (!rol) {
        return res.status(404).json({
          error: 'Rol no encontrado',
        });
      }

      if (rol.nombre === 'usuario' || rol.nombre === 'admin' || rol.nombre === 'super_admin') {
        return res.status(403).json({
          error: 'No se puede editar',
          message: 'Los roles base del sistema no se pueden modificar',
        });
      }

      await db('roles')
        .where('id', id)
        .update({ descripcion: descripcion || null });

      res.json({
        mensaje: 'Rol actualizado exitosamente',
      });
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
      });
    }
  }
);

/**
 * @route   DELETE /api/admin/roles/:id
 * @desc    Eliminar rol
 * @access  Privado (Super Admin)
 */
router.delete('/roles/:id',
  autenticar,
  verificarRol(['super_admin']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const rol = await db('roles').where('id', id).first();
      if (!rol) {
        return res.status(404).json({
          error: 'Rol no encontrado',
        });
      }

      // No permitir eliminar roles base
      if (rol.nombre === 'usuario' || rol.nombre === 'admin' || rol.nombre === 'super_admin') {
        return res.status(403).json({
          error: 'No se puede eliminar',
          message: 'Los roles base del sistema no se pueden eliminar',
        });
      }

      // Verificar si hay usuarios con este rol
      const usuariosConRol = await db('usuarios').where('rol_id', id).count('* as total').first();
      if (usuariosConRol.total > 0) {
        return res.status(400).json({
          error: 'No se puede eliminar',
          message: `Hay ${usuariosConRol.total} usuario(s) con este rol. Reasigna los usuarios antes de eliminar.`,
        });
      }

      await db('roles').where('id', id).del();

      res.json({
        mensaje: 'Rol eliminado exitosamente',
      });
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
      });
    }
  }
);

/**
 * @route   GET /api/admin/proyectos/:id/dias-laborables
 * @desc    Obtener configuración de días laborables
 * @access  Privado (Admin, Super Admin)
 */
router.get('/proyectos/:id/dias-laborables', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  configuracionController.obtenerDiasLaborables
);

/**
 * @route   PUT /api/admin/proyectos/:id/dias-laborables
 * @desc    Actualizar configuración de días laborables
 * @access  Privado (Admin, Super Admin)
 */
router.put('/proyectos/:id/dias-laborables', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  configuracionController.actualizarDiasLaborables
);

/**
 * @route   GET /api/admin/proyectos/:id/costos-no-laborables
 * @desc    Obtener costos de días no laborables
 * @access  Privado (Admin, Super Admin)
 */
router.get('/proyectos/:id/costos-no-laborables', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  configuracionController.obtenerCostosNoLaborables
);

/**
 * @route   POST /api/admin/proyectos/:id/costos-no-laborables
 * @desc    Actualizar costos de días no laborables
 * @access  Privado (Admin, Super Admin)
 */
router.post('/proyectos/:id/costos-no-laborables', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  configuracionController.actualizarCostosNoLaborables
);

/**
 * @route   DELETE /api/admin/costos-no-laborables/:id
 * @desc    Eliminar costo de día no laborable
 * @access  Privado (Admin, Super Admin)
 */
router.delete('/costos-no-laborables/:id', 
  autenticar, 
  verificarRol(['usuario', 'super_admin']),
  configuracionController.eliminarCostoNoLaborable
);

module.exports = router;
