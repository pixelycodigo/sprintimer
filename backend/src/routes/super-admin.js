const express = require('express');
const router = express.Router();
const adminsController = require('../controllers/adminsController');
const { autenticar, verificarRol, verificarNivelRol } = require('../middleware/auth');

/**
 * @route   GET /api/super-admin/admins
 * @desc    Listar administradores
 * @access  Privado (Super Admin)
 */
router.get('/', 
  autenticar, 
  verificarNivelRol(3), // Solo super_admin (nivel 3)
  adminsController.listarAdmins
);

/**
 * @route   GET /api/super-admin/admins/:id
 * @desc    Obtener administrador por ID
 * @access  Privado (Super Admin)
 */
router.get('/:id', 
  autenticar, 
  verificarNivelRol(3),
  adminsController.obtenerAdmin
);

/**
 * @route   POST /api/super-admin/admins
 * @desc    Crear administrador
 * @access  Privado (Super Admin)
 */
router.post('/', 
  autenticar, 
  verificarNivelRol(3),
  adminsController.crearAdmin
);

/**
 * @route   PUT /api/super-admin/admins/:id
 * @desc    Actualizar administrador
 * @access  Privado (Super Admin)
 */
router.put('/:id', 
  autenticar, 
  verificarNivelRol(3),
  adminsController.actualizarAdmin
);

/**
 * @route   DELETE /api/super-admin/admins/:id
 * @desc    Eliminar administrador (soft delete)
 * @access  Privado (Super Admin)
 */
router.delete('/:id', 
  autenticar, 
  verificarNivelRol(3),
  adminsController.eliminarAdmin
);

/**
 * @route   POST /api/super-admin/admins/:id/recuperar
 * @desc    Recuperar administrador eliminado
 * @access  Privado (Super Admin)
 */
router.post('/:id/recuperar', 
  autenticar, 
  verificarNivelRol(3),
  adminsController.recuperarAdmin
);

module.exports = router;
