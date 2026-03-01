const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { autenticar, debeCambiarPassword } = require('../middleware/auth');

/**
 * @route   POST /api/auth/registro
 * @desc    Registrar nuevo usuario (auto-registro para admin)
 * @access  Público
 */
router.post('/registro', authController.registro);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Público
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Privado
 */
router.post('/logout', autenticar, authController.logout);

/**
 * @route   POST /api/auth/cambiar-password
 * @desc    Cambiar contraseña
 * @access  Privado
 */
router.post('/cambiar-password', autenticar, debeCambiarPassword, authController.cambiarPassword);

/**
 * @route   POST /api/auth/recuperar
 * @desc    Solicitar recuperación de contraseña
 * @access  Público
 */
router.post('/recuperar', authController.solicitarRecuperacion);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Restablecer contraseña con token
 * @access  Público
 */
router.post('/reset-password', authController.restablecerPassword);

/**
 * @route   GET /api/auth/verificar-email/:token
 * @desc    Verificar email
 * @access  Público
 */
router.get('/verificar-email/:token', authController.verificarEmail);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Privado
 */
router.get('/me', autenticar, authController.obtenerUsuarioActual);

module.exports = router;
