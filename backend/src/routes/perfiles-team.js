const express = require('express');
const router = express.Router();
const perfilesTeamController = require('../controllers/perfilesTeamController');
const { autenticar, verificarRol } = require('../middleware/auth');

/**
 * @route   GET /api/admin/perfiles-team
 * @desc    Listar perfiles del equipo
 * @access  Privado (Admin, Super Admin)
 */
router.get('/',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  perfilesTeamController.listarPerfiles
);

/**
 * @route   GET /api/admin/perfiles-team/:id
 * @desc    Obtener perfil por ID
 * @access  Privado (Admin, Super Admin)
 */
router.get('/:id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  perfilesTeamController.obtenerPerfil
);

/**
 * @route   POST /api/admin/perfiles-team
 * @desc    Crear nuevo perfil
 * @access  Privado (Admin, Super Admin)
 */
router.post('/',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  perfilesTeamController.crearPerfil
);

/**
 * @route   PUT /api/admin/perfiles-team/:id
 * @desc    Actualizar perfil
 * @access  Privado (Admin, Super Admin)
 */
router.put('/:id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  perfilesTeamController.actualizarPerfil
);

/**
 * @route   DELETE /api/admin/perfiles-team/:id
 * @desc    Eliminar perfil
 * @access  Privado (Admin, Super Admin)
 */
router.delete('/:id',
  autenticar,
  verificarRol(['admin', 'super_admin']),
  perfilesTeamController.eliminarPerfil
);

module.exports = router;
