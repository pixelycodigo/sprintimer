const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const { autenticar } = require('../middleware/auth');

/**
 * @route   GET /api/usuario/perfil
 * @desc    Obtener perfil del usuario actual
 * @access  Privado
 */
router.get('/perfil', 
  autenticar, 
  perfilController.obtenerPerfil
);

/**
 * @route   PUT /api/usuario/perfil
 * @desc    Actualizar perfil del usuario
 * @access  Privado
 */
router.put('/perfil', 
  autenticar, 
  perfilController.actualizarPerfil
);

/**
 * @route   POST /api/usuario/cambiar-password
 * @desc    Cambiar contraseña desde el perfil
 * @access  Privado
 */
router.post('/cambiar-password', 
  autenticar, 
  perfilController.cambiarPasswordPerfil
);

/**
 * @route   GET /api/usuario/estadisticas
 * @desc    Obtener estadísticas del usuario
 * @access  Privado
 */
router.get('/estadisticas', 
  autenticar, 
  perfilController.obtenerEstadisticasUsuario
);

module.exports = router;
